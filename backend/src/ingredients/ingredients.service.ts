import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MealType } from '../common/enums/meal-type.enum';
import { Unit } from '../common/enums/unit.enum';
import { CollaborationService } from '../collaboration/collaboration.service';
import { Ingredient } from './ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { ListIngredientsQuery } from './dto/list-ingredients.query';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

type IngredientRow = {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  default_unit: Unit;
  default_quantity: string;
  allowed_meal_types: MealType[] | null;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
  total_count?: string;
};

@Injectable()
export class IngredientsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly collaborationService: CollaborationService,
  ) {}

  async list(userId: string, query: ListIngredientsQuery) {
    const ownerId = await this.resolveOwnerId(userId, query.ownerUserId);
    const where: string[] = ['user_id = $1'];
    const params: unknown[] = [ownerId];

    if (!query.includeDeleted) {
      where.push('deleted_at IS NULL');
    }

    if (query.search) {
      params.push(`%${query.search}%`);
      where.push(`name ILIKE $${params.length}`);
    }

    if (query.category) {
      params.push(query.category);
      where.push(`category = $${params.length}`);
    }

    if (query.unit) {
      params.push(query.unit);
      where.push(`default_unit = $${params.length}`);
    }

    if (query.mealType) {
      params.push(query.mealType);
      where.push(
        `(allowed_meal_types IS NULL OR array_length(allowed_meal_types, 1) = 0 OR $${params.length} = ANY(allowed_meal_types))`,
      );
    }

    const { sortColumn, sortDirection } = this.parseSort(query.sort);
    const hasPagination = query.pageSize !== undefined || query.page !== undefined;
    const pageSize = hasPagination ? (query.pageSize ?? 20) : undefined;
    const page = hasPagination ? (query.page ?? 1) : 1;
    const offset = hasPagination && pageSize ? (page - 1) * pageSize : undefined;

    const paginationClauses: string[] = [];
    if (hasPagination && pageSize !== undefined && offset !== undefined) {
      params.push(pageSize, offset);
      paginationClauses.push(`LIMIT $${params.length - 1}`, `OFFSET $${params.length}`);
    }
    const sql = `
      SELECT
        id,
        user_id,
        name,
        category,
        default_unit,
        default_quantity,
        allowed_meal_types,
        deleted_at,
        created_at,
        updated_at,
        COUNT(*) OVER() AS total_count
      FROM ingredients
      WHERE ${where.join(' AND ')}
      ORDER BY ${sortColumn} ${sortDirection}
      ${paginationClauses.join('\n      ')}
    `;

    const result = await this.db.query<IngredientRow>(sql, params);
    const items = result.rows.map((row) => this.mapRow(row));
    const total = result.rows.length > 0 ? Number(result.rows[0].total_count ?? 0) : 0;
    return { items, total, page, pageSize: pageSize ?? total };
  }

  async get(userId: string, id: string) {
    const result = await this.db.query<IngredientRow>(
      `SELECT id, user_id, name, category, default_unit, default_quantity, allowed_meal_types,
              deleted_at, created_at, updated_at
       FROM ingredients
       WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Ingredient not found');
    }
    return this.mapRow(result.rows[0]);
  }

  async create(userId: string, dto: CreateIngredientDto) {
    const allowedMealTypes = this.normalizeAllowedMealTypes(dto.allowedMealTypes);
    const result = await this.db.query<IngredientRow>(
      `INSERT INTO ingredients (user_id, name, category, default_unit, default_quantity, allowed_meal_types)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, name, category, default_unit, default_quantity, allowed_meal_types,
                 deleted_at, created_at, updated_at`,
      [
        userId,
        dto.name,
        dto.category ?? null,
        dto.defaultUnit,
        dto.defaultQuantity,
        allowedMealTypes,
      ],
    );
    return this.mapRow(result.rows[0]);
  }

  async update(userId: string, id: string, dto: UpdateIngredientDto) {
    const fields: string[] = [];
    const params: unknown[] = [id, userId];

    if (dto.name !== undefined) {
      params.push(dto.name);
      fields.push(`name = $${params.length}`);
    }
    if (dto.category !== undefined) {
      params.push(dto.category);
      fields.push(`category = $${params.length}`);
    }
    if (dto.defaultUnit !== undefined) {
      params.push(dto.defaultUnit);
      fields.push(`default_unit = $${params.length}`);
    }
    if (dto.defaultQuantity !== undefined) {
      params.push(dto.defaultQuantity);
      fields.push(`default_quantity = $${params.length}`);
    }
    if (dto.allowedMealTypes !== undefined) {
      params.push(this.normalizeAllowedMealTypes(dto.allowedMealTypes));
      fields.push(`allowed_meal_types = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.get(userId, id);
    }

    const sql = `
      UPDATE ingredients
      SET ${fields.join(', ')}, updated_at = now()
      WHERE id = $1 AND user_id = $2
      RETURNING id, user_id, name, category, default_unit, default_quantity, allowed_meal_types,
                deleted_at, created_at, updated_at
    `;
    const result = await this.db.query<IngredientRow>(sql, params);
    if (result.rowCount === 0) {
      throw new NotFoundException('Ingredient not found');
    }
    return this.mapRow(result.rows[0]);
  }

  async softDelete(userId: string, id: string) {
    const result = await this.db.query<IngredientRow>(
      `UPDATE ingredients
       SET deleted_at = now(), updated_at = now()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, name, category, default_unit, default_quantity, allowed_meal_types,
                 deleted_at, created_at, updated_at`,
      [id, userId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Ingredient not found');
    }
    return this.mapRow(result.rows[0]);
  }

  async listCategories(userId: string) {
    const result = await this.db.query<{ category: string }>(
      `SELECT DISTINCT category
       FROM ingredients
       WHERE user_id = $1 AND deleted_at IS NULL AND category IS NOT NULL AND category <> ''
       ORDER BY category`,
      [userId],
    );
    return { items: result.rows.map((row) => row.category) };
  }

  private parseSort(sort?: string) {
    const [fieldRaw, directionRaw] = sort?.split(':') ?? [];
    const field = (fieldRaw ?? 'name').toLowerCase();
    const direction = directionRaw?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const map: Record<string, string> = {
      name: 'name',
      category: 'category',
      unit: 'default_unit',
      defaultunit: 'default_unit',
      defaultquantity: 'default_quantity',
      allowedmealtypes: 'allowed_meal_types',
      deletedat: 'deleted_at',
      createdat: 'created_at',
    };

    return {
      sortColumn: map[field] ?? 'name',
      sortDirection: direction,
    };
  }

  private mapRow(row: IngredientRow): Ingredient {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      category: row.category,
      defaultUnit: row.default_unit,
      defaultQuantity: Number(row.default_quantity),
      allowedMealTypes: row.allowed_meal_types,
      deletedAt: row.deleted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private normalizeAllowedMealTypes(value?: MealType[] | null) {
    if (!value || value.length === 0) {
      return null;
    }
    return value;
  }

  private async resolveOwnerId(currentUserId: string, ownerUserId?: string) {
    const ownerId = ownerUserId ?? currentUserId;
    if (ownerId === currentUserId) {
      return ownerId;
    }
    const hasAccess = await this.collaborationService.hasActiveCollaboration(
      currentUserId,
      ownerId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('Not allowed to access ingredients');
    }
    return ownerId;
  }
}
