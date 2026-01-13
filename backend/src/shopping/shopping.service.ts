import { Injectable, NotFoundException } from '@nestjs/common';
import { MealType } from '../common/enums/meal-type.enum';
import { Unit } from '../common/enums/unit.enum';
import { DatabaseService } from '../database/database.service';
import { MenuService } from '../menu/menu.service';
import { CreateOffMenuDto } from './dto/create-off-menu.dto';
import { ListShoppingQuery } from './dto/list-shopping.query';
import { UpdateOffMenuDto } from './dto/update-off-menu.dto';
import { UpdatePurchasedDto } from './dto/update-purchased.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

type AggregatedMenuRow = {
  ingredient_id: string;
  unit: Unit;
  total_quantity: string;
  meal_types: MealType[];
  name: string;
  category: string | null;
};

type ShoppingItemRow = {
  id: string;
  source: 'MENU' | 'OFF_MENU';
  ingredient_id: string | null;
  name: string;
  category: string | null;
  unit: Unit;
  quantity: string;
  warehouse: string;
  meal_type: string | null;
  purchased: boolean;
};

type ShoppingItemDto = {
  id: string;
  source: 'MENU' | 'OFF_MENU';
  ingredientId: string | null;
  name: string;
  category: string | null;
  unit: Unit;
  totalQuantity: number;
  warehouse: number;
  mealType: string | null;
  purchased: boolean;
};

@Injectable()
export class ShoppingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly menuService: MenuService,
  ) {}

  async getCurrentShopping(userId: string, query: ListShoppingQuery) {
    const { menuId, weekStartDate } = await this.menuService.ensureCurrentMenuForUser(userId);
    const menuAggregates = await this.aggregateMenuItems(menuId);

    await this.syncMenuShoppingItems(userId, weekStartDate, menuAggregates);

    const items = await this.loadShoppingItems(userId, weekStartDate, menuAggregates);
    const filtered = this.applyFilters(items, query);
    const sorted = this.applySort(filtered, query.sort);

    return { weekStartDate, items: sorted };
  }

  async updatePurchased(userId: string, id: string, dto: UpdatePurchasedDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const result = await this.db.query<ShoppingItemRow>(
      `UPDATE shopping_items
       SET purchased = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3 AND week_start_date = $4::date
       RETURNING id, source, ingredient_id, name, category, unit, quantity, warehouse, meal_type, purchased`,
      [dto.purchased, id, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Shopping item not found');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      source: row.source,
      ingredientId: row.ingredient_id,
      name: row.name,
      category: row.category,
      unit: row.unit,
      totalQuantity: Number(row.quantity),
      warehouse: Number(row.warehouse),
      mealType: row.meal_type,
      purchased: row.purchased,
    };
  }

  async updateWarehouse(userId: string, id: string, dto: UpdateWarehouseDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const result = await this.db.query<ShoppingItemRow>(
      `UPDATE shopping_items
       SET warehouse = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3 AND week_start_date = $4::date
       RETURNING id, source, ingredient_id, name, category, unit, quantity, warehouse, meal_type, purchased`,
      [dto.warehouse, id, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Shopping item not found');
    }
    return this.mapRow(result.rows[0]);
  }

  async createOffMenu(userId: string, dto: CreateOffMenuDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const result = await this.db.query<ShoppingItemRow>(
      `INSERT INTO shopping_items
       (user_id, week_start_date, source, ingredient_id, name, category, unit, quantity, meal_type, purchased)
       VALUES ($1, $2, 'OFF_MENU', NULL, $3, $4, $5, $6, NULL, false)
       RETURNING id, source, ingredient_id, name, category, unit, quantity, warehouse, meal_type, purchased`,
      [userId, weekStartDate, dto.name, dto.category ?? null, dto.unit, dto.quantity],
    );
    return this.mapRow(result.rows[0]);
  }

  async updateOffMenu(userId: string, id: string, dto: UpdateOffMenuDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const fields: string[] = [];
    const params: unknown[] = [id, userId, weekStartDate];

    if (dto.name !== undefined) {
      params.push(dto.name);
      fields.push(`name = $${params.length}`);
    }

    if (dto.category !== undefined) {
      params.push(dto.category);
      fields.push(`category = $${params.length}`);
    }

    if (dto.unit !== undefined) {
      params.push(dto.unit);
      fields.push(`unit = $${params.length}`);
    }

    if (dto.quantity !== undefined) {
      params.push(dto.quantity);
      fields.push(`quantity = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.getOffMenu(userId, id, weekStartDate);
    }

    const result = await this.db.query<ShoppingItemRow>(
      `UPDATE shopping_items
       SET ${fields.join(', ')}, updated_at = now()
       WHERE id = $1 AND user_id = $2 AND week_start_date = $3::date AND source = 'OFF_MENU'
       RETURNING id, source, ingredient_id, name, category, unit, quantity, warehouse, meal_type, purchased`,
      params,
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Off-menu item not found');
    }
    return this.mapRow(result.rows[0]);
  }

  async deleteOffMenu(userId: string, id: string) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const result = await this.db.query(
      `DELETE FROM shopping_items
       WHERE id = $1 AND user_id = $2 AND week_start_date = $3::date AND source = 'OFF_MENU'`,
      [id, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Off-menu item not found');
    }
    return { id };
  }

  private async aggregateMenuItems(menuId: string) {
    const result = await this.db.query<AggregatedMenuRow>(
      `SELECT
         mi.ingredient_id,
         mi.unit,
         SUM(mi.quantity) AS total_quantity,
         ARRAY_AGG(DISTINCT mm.meal_type) AS meal_types,
         MAX(i.name) AS name,
         MAX(i.category) AS category
       FROM menu_meals mm
       JOIN meal_items mi ON mi.menu_meal_id = mm.id
       JOIN ingredients i ON i.id = mi.ingredient_id
       WHERE mm.weekly_menu_id = $1
       GROUP BY mi.ingredient_id, mi.unit`,
      [menuId],
    );

    return result.rows.map((row) => ({
      ingredientId: row.ingredient_id,
      unit: row.unit,
      totalQuantity: Number(row.total_quantity),
      mealTypes: row.meal_types,
      name: row.name,
      category: row.category,
    }));
  }

  private async syncMenuShoppingItems(
    userId: string,
    weekStartDate: string,
    aggregates: {
      ingredientId: string;
      unit: Unit;
      totalQuantity: number;
      name: string;
      category: string | null;
      mealTypes: MealType[];
    }[],
  ) {
    if (aggregates.length === 0) {
      await this.db.query(
        `DELETE FROM shopping_items
         WHERE user_id = $1 AND week_start_date = $2::date AND source = 'MENU'`,
        [userId, weekStartDate],
      );
      return;
    }

    const keepValues: string[] = [];
    const keepParams: unknown[] = [userId, weekStartDate];
    for (const item of aggregates) {
      keepParams.push(item.ingredientId, item.unit);
      const ingredientParam = keepParams.length - 1;
      const unitParam = keepParams.length;
      keepValues.push(`($${ingredientParam}::uuid, $${unitParam}::text)`);
    }

    await this.db.query(
      `WITH keep(ingredient_id, unit) AS (
         VALUES ${keepValues.join(', ')}
       )
       DELETE FROM shopping_items si
       WHERE si.user_id = $1 AND si.week_start_date = $2::date AND si.source = 'MENU'
         AND NOT EXISTS (
           SELECT 1 FROM keep k WHERE k.ingredient_id = si.ingredient_id AND k.unit = si.unit
         )`,
      keepParams,
    );

    const values: string[] = [];
    const params: unknown[] = [userId, weekStartDate];
    for (const item of aggregates) {
      params.push(item.ingredientId, item.name, item.category, item.unit, item.totalQuantity);
      const base = params.length - 4;
      values.push(
        `($1, $2, 'MENU', $${base}, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, NULL, false)`,
      );
    }

    await this.db.query(
      `INSERT INTO shopping_items
       (user_id, week_start_date, source, ingredient_id, name, category, unit, quantity, meal_type, purchased)
       VALUES ${values.join(', ')}
       ON CONFLICT (user_id, week_start_date, source, ingredient_id, unit)
       DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         quantity = EXCLUDED.quantity,
         updated_at = now()`,
      params,
    );
  }

  private async loadShoppingItems(
    userId: string,
    weekStartDate: string,
    aggregates: {
      ingredientId: string;
      unit: Unit;
      totalQuantity: number;
      name: string;
      category: string | null;
      mealTypes: MealType[];
    }[],
  ) {
    const result = await this.db.query<ShoppingItemRow>(
      `SELECT id, source, ingredient_id, name, category, unit, quantity, warehouse, meal_type, purchased
       FROM shopping_items
       WHERE user_id = $1 AND week_start_date = $2::date`,
      [userId, weekStartDate],
    );

    const aggregateMap = new Map(
      aggregates.map((item) => [`${item.ingredientId}:${item.unit}`, item]),
    );

    return result.rows.map((row) => {
      if (row.source === 'MENU' && row.ingredient_id) {
        const aggregate = aggregateMap.get(`${row.ingredient_id}:${row.unit}`);
        const mealType =
          aggregate && aggregate.mealTypes.length === 1
            ? aggregate.mealTypes[0]
            : aggregate
              ? 'MULTI'
              : null;
        return {
          id: row.id,
          source: row.source,
          ingredientId: row.ingredient_id,
          name: row.name,
          category: row.category,
          unit: row.unit,
          totalQuantity: aggregate ? aggregate.totalQuantity : Number(row.quantity),
          warehouse: Number(row.warehouse),
          mealType,
          purchased: row.purchased,
        } satisfies ShoppingItemDto;
      }

      return this.mapRow(row);
    });
  }

  private applyFilters(items: ShoppingItemDto[], query: ListShoppingQuery) {
    return items.filter((item) => {
      if (query.search && !item.name.toLowerCase().includes(query.search.toLowerCase())) {
        return false;
      }
      if (query.category && item.category !== query.category) {
        return false;
      }
      if (query.unit && item.unit !== query.unit) {
        return false;
      }
      if (query.source && item.source !== query.source) {
        return false;
      }
      if (
        query.mealType &&
        (item.mealType ?? '').toLowerCase() !== query.mealType.toLowerCase()
      ) {
        return false;
      }
      if (query.purchased !== undefined && item.purchased !== query.purchased) {
        return false;
      }
      return true;
    });
  }

  private applySort(items: ShoppingItemDto[], sort?: string) {
    if (!sort) {
      return items;
    }
    const [fieldRaw, dirRaw] = sort.split(':');
    const direction = dirRaw?.toLowerCase() === 'desc' ? -1 : 1;
    const field = fieldRaw?.toLowerCase();
    const getters: Record<string, (item: ShoppingItemDto) => string | number | boolean | null> = {
      name: (item) => item.name,
      quantity: (item) => item.totalQuantity,
      unit: (item) => item.unit,
      category: (item) => item.category ?? '',
      mealtype: (item) => item.mealType ?? '',
      source: (item) => item.source,
      purchased: (item) => (item.purchased ? 1 : 0),
    };

    const getter = getters[field ?? 'name'] ?? getters.name;
    return [...items].sort((a, b) => {
      const av = getter(a) ?? '';
      const bv = getter(b) ?? '';
      if (av === bv) return 0;
      return av > bv ? direction : -direction;
    });
  }

  private mapRow(row: ShoppingItemRow): ShoppingItemDto {
    return {
      id: row.id,
      source: row.source,
      ingredientId: row.ingredient_id,
      name: row.name,
      category: row.category,
      unit: row.unit,
      totalQuantity: Number(row.quantity),
      warehouse: Number(row.warehouse),
      mealType: row.meal_type,
      purchased: row.purchased,
    };
  }

  private async getOffMenu(userId: string, id: string, weekStartDate: string) {
    const result = await this.db.query<ShoppingItemRow>(
      `SELECT id, source, ingredient_id, name, category, unit, quantity, warehouse, meal_type, purchased
       FROM shopping_items
       WHERE id = $1 AND user_id = $2 AND week_start_date = $3::date AND source = 'OFF_MENU'`,
      [id, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Off-menu item not found');
    }
    return this.mapRow(result.rows[0]);
  }
}
