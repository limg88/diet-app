import { Injectable, NotFoundException } from '@nestjs/common';
import { MealType } from '../common/enums/meal-type.enum';
import { Unit } from '../common/enums/unit.enum';
import { DatabaseService } from '../database/database.service';
import { MenuService } from '../menu/menu.service';
import { CollaborationService } from '../collaboration/collaboration.service';
import { CreateOffMenuDto } from './dto/create-off-menu.dto';
import { ListShoppingQuery } from './dto/list-shopping.query';
import { UpdateOffMenuDto } from './dto/update-off-menu.dto';
import { UpdatePurchasedDto } from './dto/update-purchased.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

type AggregatedMenuRow = {
  ingredient_id: string;
  unit: Unit;
  name: string;
  category: string | null;
  quantity: string;
  meal_type: MealType;
  owner_id: string;
};

type ShoppingItemRow = {
  id: string;
  source: 'MENU' | 'OFF_MENU';
  owner_id?: string;
  ingredient_id: string | null;
  item_key: string;
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
  ownerId: string;
  ownedByUser: boolean;
  ingredientId: string | null;
  name: string;
  category: string | null;
  unit: Unit;
  totalQuantity: number;
  warehouse: number;
  mealType: string | null;
  purchased: boolean;
  breakdown?: Array<{ label: string; quantity: number }>;
};

@Injectable()
export class ShoppingService {
  constructor(
    private readonly db: DatabaseService,
    private readonly menuService: MenuService,
    private readonly collaborationService: CollaborationService,
  ) {}

  async getCurrentShopping(userId: string, query: ListShoppingQuery) {
    const { menuId: currentMenuId, weekStartDate } =
      await this.menuService.ensureCurrentMenuForUser(userId);
    const partnerIds = await this.collaborationService.listPartnerIds(userId);
    const partners = await this.collaborationService.listPartners(userId);
    const labelMap = new Map<string, string>(partners.map((partner) => [partner.user_id, partner.email]));
    labelMap.set(userId, 'You');
    const menuIds = [currentMenuId];
    for (const partnerId of partnerIds) {
      const { menuId } = await this.menuService.ensureCurrentMenuForUser(partnerId);
      menuIds.push(menuId);
    }
    const menuAggregates = await this.aggregateMenuItems(menuIds, userId);
    const menuAggregatesWithLabels = menuAggregates.map((item) => ({
      ...item,
      breakdown: item.breakdown.map((entry) => ({
        label: labelMap.get(entry.ownerId) ?? 'Collaborator',
        quantity: entry.quantity,
      })),
    }));

    await this.syncMenuShoppingItems(userId, weekStartDate, menuAggregatesWithLabels);

    const items = await this.loadShoppingItems(
      userId,
      weekStartDate,
      menuAggregatesWithLabels,
      partnerIds,
      labelMap,
    );
    const filtered = this.applyFilters(items, query);
    const sorted = this.applySort(filtered, query.sort);

    return { weekStartDate, items: sorted };
  }

  async updatePurchased(userId: string, id: string, dto: UpdatePurchasedDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const currentRow = await this.db.query<ShoppingItemRow>(
      `SELECT id, source, user_id AS owner_id, ingredient_id, item_key, name, category, unit, quantity, warehouse, meal_type, purchased
       FROM shopping_items
       WHERE id = $1 AND user_id = $2 AND week_start_date = $3::date`,
      [id, userId, weekStartDate],
    );
    if (currentRow.rowCount === 0) {
      throw new NotFoundException('Shopping item not found');
    }

    const row = currentRow.rows[0];
    if (row.source === 'MENU') {
      const partnerIds = await this.collaborationService.listPartnerIds(userId);
      const ownerIds = [userId, ...partnerIds];
      await this.db.query(
        `UPDATE shopping_items
         SET purchased = $1, updated_at = now()
         WHERE week_start_date = $2::date
           AND source = 'MENU'
           AND item_key = $3
           AND user_id = ANY($4::uuid[])`,
        [dto.purchased, weekStartDate, row.item_key, ownerIds],
      );
    } else {
      await this.db.query(
        `UPDATE shopping_items
         SET purchased = $1, updated_at = now()
         WHERE id = $2 AND user_id = $3 AND week_start_date = $4::date`,
        [dto.purchased, id, userId, weekStartDate],
      );
    }

    return {
      id: row.id,
      source: row.source,
      ownerId: userId,
      ownedByUser: true,
      ingredientId: row.ingredient_id,
      name: row.name,
      category: row.category,
      unit: row.unit,
      totalQuantity: Number(row.quantity),
      warehouse: Number(row.warehouse),
      mealType: row.meal_type,
      purchased: dto.purchased,
    };
  }

  async updateWarehouse(userId: string, id: string, dto: UpdateWarehouseDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const result = await this.db.query<ShoppingItemRow>(
      `UPDATE shopping_items
       SET warehouse = $1, updated_at = now()
       WHERE id = $2 AND user_id = $3 AND week_start_date = $4::date
       RETURNING id, source, ingredient_id, item_key, name, category, unit, quantity, warehouse, meal_type, purchased`,
      [dto.warehouse, id, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Shopping item not found');
    }
    return this.mapRow(result.rows[0], userId);
  }

  async createOffMenu(userId: string, dto: CreateOffMenuDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const result = await this.db.query<ShoppingItemRow>(
      `INSERT INTO shopping_items
       (user_id, week_start_date, source, ingredient_id, item_key, name, category, unit, quantity, meal_type, purchased)
       VALUES ($1, $2, 'OFF_MENU', NULL, $3, $4, $5, $6, $7, NULL, false)
       RETURNING id, source, ingredient_id, item_key, name, category, unit, quantity, warehouse, meal_type, purchased`,
      [
        userId,
        weekStartDate,
        this.buildItemKey(dto.name, dto.unit),
        dto.name,
        dto.category ?? null,
        dto.unit,
        dto.quantity,
      ],
    );
    return this.mapRow(result.rows[0], userId);
  }

  async updateOffMenu(userId: string, id: string, dto: UpdateOffMenuDto) {
    const weekStartDate = await this.menuService.getCurrentWeekStartDate();
    const fields: string[] = [];
    const params: unknown[] = [id, userId, weekStartDate];
    let nameParamIndex: number | null = null;
    let unitParamIndex: number | null = null;

    if (dto.name !== undefined) {
      params.push(dto.name);
      nameParamIndex = params.length;
      fields.push(`name = $${nameParamIndex}`);
    }

    if (dto.category !== undefined) {
      params.push(dto.category);
      fields.push(`category = $${params.length}`);
    }

    if (dto.unit !== undefined) {
      params.push(dto.unit);
      unitParamIndex = params.length;
      fields.push(`unit = $${unitParamIndex}`);
    }

    if (dto.quantity !== undefined) {
      params.push(dto.quantity);
      fields.push(`quantity = $${params.length}`);
    }

    if (dto.name !== undefined || dto.unit !== undefined) {
      const nameExpr = nameParamIndex ? `$${nameParamIndex}` : 'name';
      const unitExpr = unitParamIndex ? `$${unitParamIndex}` : 'unit';
      fields.push(`item_key = LOWER(TRIM(${nameExpr})) || '|' || ${unitExpr}`);
    }

    if (fields.length === 0) {
      return this.getOffMenu(userId, id, weekStartDate);
    }

    const result = await this.db.query<ShoppingItemRow>(
      `UPDATE shopping_items
       SET ${fields.join(', ')}, updated_at = now()
       WHERE id = $1 AND user_id = $2 AND week_start_date = $3::date AND source = 'OFF_MENU'
       RETURNING id, source, ingredient_id, item_key, name, category, unit, quantity, warehouse, meal_type, purchased`,
      params,
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Off-menu item not found');
    }
    return this.mapRow(result.rows[0], userId);
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

  private async aggregateMenuItems(menuIds: string[], currentUserId: string) {
    if (menuIds.length === 0) {
      return [];
    }
    const result = await this.db.query<AggregatedMenuRow>(
      `SELECT
         mi.ingredient_id,
         mi.unit,
         mi.quantity,
         mm.meal_type,
         i.name,
         i.category,
         wm.user_id AS owner_id
       FROM menu_meals mm
       JOIN weekly_menus wm ON wm.id = mm.weekly_menu_id
       JOIN meal_items mi ON mi.menu_meal_id = mm.id
       JOIN ingredients i ON i.id = mi.ingredient_id
       WHERE mm.weekly_menu_id = ANY($1::uuid[])`,
      [menuIds],
    );

    const aggregates = new Map<
      string,
      {
        itemKey: string;
        ingredientId: string | null;
        unit: Unit;
        totalQuantity: number;
        mealTypes: Set<MealType>;
        name: string;
        category: string | null;
        breakdown: Map<string, number>;
      }
    >();

    for (const row of result.rows) {
      const itemKey = this.buildItemKey(row.name, row.unit);
      const existing = aggregates.get(itemKey);
      if (!existing) {
        aggregates.set(itemKey, {
          itemKey,
          ingredientId: row.owner_id === currentUserId ? row.ingredient_id : null,
          unit: row.unit,
          totalQuantity: Number(row.quantity),
          mealTypes: new Set([row.meal_type]),
          name: row.name,
          category: row.category,
          breakdown: new Map([[row.owner_id, Number(row.quantity)]]),
        });
        continue;
      }

      existing.totalQuantity += Number(row.quantity);
      existing.mealTypes.add(row.meal_type);
      existing.breakdown.set(
        row.owner_id,
        (existing.breakdown.get(row.owner_id) ?? 0) + Number(row.quantity),
      );

      if (row.owner_id === currentUserId) {
        existing.ingredientId = existing.ingredientId ?? row.ingredient_id;
        existing.name = row.name;
        existing.category = row.category;
      }
    }

    return Array.from(aggregates.values()).map((item) => ({
      itemKey: item.itemKey,
      ingredientId: item.ingredientId,
      unit: item.unit,
      totalQuantity: item.totalQuantity,
      mealTypes: Array.from(item.mealTypes),
      name: item.name,
      category: item.category,
      breakdown: Array.from(item.breakdown.entries()).map(([ownerId, quantity]) => ({
        ownerId,
        quantity,
      })),
    }));
  }

  private async syncMenuShoppingItems(
    userId: string,
    weekStartDate: string,
    aggregates: {
      itemKey: string;
      ingredientId: string | null;
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
      keepParams.push(item.itemKey);
      const keyParam = keepParams.length;
      keepValues.push(`($${keyParam}::text)`);
    }

    await this.db.query(
      `WITH keep(item_key) AS (
         VALUES ${keepValues.join(', ')}
       )
       DELETE FROM shopping_items si
       WHERE si.user_id = $1 AND si.week_start_date = $2::date AND si.source = 'MENU'
         AND NOT EXISTS (
           SELECT 1 FROM keep k WHERE k.item_key = si.item_key
         )`,
      keepParams,
    );

    const values: string[] = [];
    const params: unknown[] = [userId, weekStartDate];
    for (const item of aggregates) {
      params.push(item.ingredientId, item.itemKey, item.name, item.category, item.unit, item.totalQuantity);
      const base = params.length - 5;
      values.push(
        `($1, $2, 'MENU', $${base}, $${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, NULL, false)`,
      );
    }

    await this.db.query(
      `INSERT INTO shopping_items
       (user_id, week_start_date, source, ingredient_id, item_key, name, category, unit, quantity, meal_type, purchased)
       VALUES ${values.join(', ')}
       ON CONFLICT (user_id, week_start_date, source, item_key)
       DO UPDATE SET
         ingredient_id = COALESCE(EXCLUDED.ingredient_id, shopping_items.ingredient_id),
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
      itemKey: string;
      ingredientId: string | null;
      unit: Unit;
      totalQuantity: number;
      name: string;
      category: string | null;
      mealTypes: MealType[];
      breakdown: Array<{ label: string; quantity: number }>;
    }[],
    partnerIds: string[],
    labelMap: Map<string, string>,
  ) {
    const ownerIds = [userId, ...partnerIds];
    const result = await this.db.query<ShoppingItemRow>(
      `SELECT id, source, user_id AS owner_id, ingredient_id, item_key, name, category, unit, quantity, warehouse, meal_type, purchased
       FROM shopping_items
       WHERE week_start_date = $2::date
         AND (
           (source = 'MENU' AND user_id = $1)
           OR (source = 'OFF_MENU' AND user_id = ANY($3::uuid[]))
         )`,
      [userId, weekStartDate, ownerIds],
    );

    const aggregateMap = new Map(
      aggregates.map((item) => [item.itemKey, item]),
    );

    return result.rows.map((row) => {
      if (row.source === 'MENU') {
        const aggregate = aggregateMap.get(row.item_key);
        const mealType =
          aggregate && aggregate.mealTypes.length === 1
            ? aggregate.mealTypes[0]
            : aggregate
              ? 'MULTI'
              : null;
        return {
          id: row.id,
          source: row.source,
          ownerId: row.owner_id ?? userId,
          ownedByUser: true,
          ingredientId: row.ingredient_id,
          name: aggregate?.name ?? row.name,
          category: aggregate?.category ?? row.category,
          unit: row.unit,
          totalQuantity: aggregate ? aggregate.totalQuantity : Number(row.quantity),
          warehouse: Number(row.warehouse),
          mealType,
          purchased: row.purchased,
          breakdown: aggregate?.breakdown,
        } satisfies ShoppingItemDto;
      }

      return this.mapRow(row, userId, labelMap);
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

  private mapRow(
    row: ShoppingItemRow,
    currentUserId?: string,
    labelMap?: Map<string, string>,
  ): ShoppingItemDto {
    const ownerId = row.owner_id ?? currentUserId ?? '';
    const ownedByUser = currentUserId ? ownerId === currentUserId : true;
    const ownerLabel =
      labelMap && ownerId
        ? labelMap.get(ownerId) ?? (ownedByUser ? 'You' : 'Collaborator')
        : undefined;
    return {
      id: row.id,
      source: row.source,
      ownerId,
      ownedByUser,
      ingredientId: row.ingredient_id,
      name: row.name,
      category: row.category,
      unit: row.unit,
      totalQuantity: Number(row.quantity),
      warehouse: Number(row.warehouse),
      mealType: row.meal_type,
      purchased: row.purchased,
      breakdown: ownerLabel
        ? [{ label: ownerLabel, quantity: Number(row.quantity) }]
        : undefined,
    };
  }

  private async getOffMenu(userId: string, id: string, weekStartDate: string) {
    const result = await this.db.query<ShoppingItemRow>(
      `SELECT id, source, user_id AS owner_id, ingredient_id, item_key, name, category, unit, quantity, warehouse, meal_type, purchased
       FROM shopping_items
       WHERE id = $1 AND user_id = $2 AND week_start_date = $3::date AND source = 'OFF_MENU'`,
      [id, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Off-menu item not found');
    }
    return this.mapRow(result.rows[0], userId);
  }

  private buildItemKey(name: string, unit: Unit) {
    return `${name.trim().toLowerCase()}|${unit}`;
  }
}
