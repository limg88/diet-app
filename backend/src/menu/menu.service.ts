import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MealType } from '../common/enums/meal-type.enum';
import { Unit } from '../common/enums/unit.enum';
import { formatDateToIso, getCurrentRomeDate, getIsoWeekStart } from '../common/utils/time';
import { CollaborationService } from '../collaboration/collaboration.service';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { UpdateMealItemDto } from './dto/update-meal-item.dto';

type MenuRow = {
  meal_id: string;
  day_of_week: number;
  meal_type: MealType;
  item_id: string | null;
  ingredient_id: string | null;
  quantity: string | null;
  unit: Unit | null;
};

type MealItemDto = {
  id: string;
  ingredientId: string | null;
  quantity: number;
  unit: Unit | null;
};

type MealDto = {
  id: string;
  mealType: MealType;
  items: MealItemDto[];
};

type DayDto = {
  dayOfWeek: number;
  meals: MealDto[];
};

const MEAL_TYPES_ORDER: MealType[] = [
  MealType.BREAKFAST,
  MealType.MORNING_SNACK,
  MealType.LUNCH,
  MealType.AFTERNOON_SNACK,
  MealType.DINNER,
];

@Injectable()
export class MenuService {
  constructor(
    private readonly db: DatabaseService,
    private readonly collaborationService: CollaborationService,
  ) {}

  async getCurrentMenu(currentUserId: string, ownerUserId?: string) {
    const ownerId = await this.resolveOwnerId(currentUserId, ownerUserId);
    const weekStartDate = this.getCurrentWeekStartDateInternal();
    const menuId = await this.ensureCurrentMenu(ownerId, weekStartDate);
    const days = await this.loadMenuDays(menuId);
    return { weekStartDate, days };
  }

  async ensureCurrentMenuForUser(userId: string) {
    const weekStartDate = this.getCurrentWeekStartDateInternal();
    const menuId = await this.ensureCurrentMenu(userId, weekStartDate);
    return { menuId, weekStartDate };
  }

  getCurrentWeekStartDate() {
    return this.getCurrentWeekStartDateInternal();
  }

  async addMealItem(
    currentUserId: string,
    mealId: string,
    dto: AddMealItemDto,
    ownerUserId?: string,
  ) {
    const ownerId = await this.resolveOwnerId(currentUserId, ownerUserId);
    const weekStartDate = this.getCurrentWeekStartDateInternal();
    const meal = await this.getMealForCurrentWeek(ownerId, mealId, weekStartDate);

    const ingredient = await this.db.query<{
      allowed_meal_types: MealType[] | null;
      deleted_at: Date | null;
    }>(
      `SELECT allowed_meal_types, deleted_at
       FROM ingredients
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [dto.ingredientId, ownerId],
    );
    if (ingredient.rowCount === 0) {
      throw new NotFoundException('Ingredient not found');
    }

    const allowedMealTypes = ingredient.rows[0].allowed_meal_types;
    if (allowedMealTypes && allowedMealTypes.length > 0 && !allowedMealTypes.includes(meal.mealType)) {
      throw new BadRequestException('Ingredient not allowed for this meal type');
    }

    const result = await this.db.query<{
      id: string;
      ingredient_id: string;
      quantity: string;
      unit: Unit;
    }>(
      `INSERT INTO meal_items (menu_meal_id, ingredient_id, quantity, unit)
       VALUES ($1, $2, $3, $4)
       RETURNING id, ingredient_id, quantity, unit`,
      [mealId, dto.ingredientId, dto.quantity, dto.unit],
    );

    return {
      id: result.rows[0].id,
      ingredientId: result.rows[0].ingredient_id,
      quantity: Number(result.rows[0].quantity),
      unit: result.rows[0].unit,
    };
  }

  async updateMealItem(
    currentUserId: string,
    itemId: string,
    dto: UpdateMealItemDto,
    ownerUserId?: string,
  ) {
    const ownerId = await this.resolveOwnerId(currentUserId, ownerUserId);
    const weekStartDate = this.getCurrentWeekStartDateInternal();
    await this.assertItemInCurrentWeek(ownerId, itemId, weekStartDate);

    const fields: string[] = [];
    const params: unknown[] = [itemId];

    if (dto.quantity !== undefined) {
      params.push(dto.quantity);
      fields.push(`quantity = $${params.length}`);
    }

    if (dto.unit !== undefined) {
      params.push(dto.unit);
      fields.push(`unit = $${params.length}`);
    }

    if (fields.length === 0) {
      return this.getMealItem(itemId);
    }

    const result = await this.db.query<{
      id: string;
      ingredient_id: string;
      quantity: string;
      unit: Unit;
    }>(
      `UPDATE meal_items
       SET ${fields.join(', ')}
       WHERE id = $1
       RETURNING id, ingredient_id, quantity, unit`,
      params,
    );

    if (result.rowCount === 0) {
      throw new NotFoundException('Meal item not found');
    }

    return {
      id: result.rows[0].id,
      ingredientId: result.rows[0].ingredient_id,
      quantity: Number(result.rows[0].quantity),
      unit: result.rows[0].unit,
    };
  }

  async removeMealItem(
    currentUserId: string,
    itemId: string,
    ownerUserId?: string,
  ) {
    const ownerId = await this.resolveOwnerId(currentUserId, ownerUserId);
    const weekStartDate = this.getCurrentWeekStartDateInternal();
    await this.assertItemInCurrentWeek(ownerId, itemId, weekStartDate);
    await this.db.query(`DELETE FROM meal_items WHERE id = $1`, [itemId]);
    return { id: itemId };
  }

  private getCurrentWeekStartDateInternal() {
    const today = getCurrentRomeDate();
    const monday = getIsoWeekStart(today);
    return formatDateToIso(monday);
  }

  private async ensureCurrentMenu(userId: string, weekStartDate: string) {
    const existing = await this.db.query<{ id: string }>(
      'SELECT id FROM weekly_menus WHERE user_id = $1 AND week_start_date = $2',
      [userId, weekStartDate],
    );
    if ((existing.rowCount ?? 0) > 0) {
      return existing.rows[0].id;
    }

    const monday = new Date(`${weekStartDate}T00:00:00.000Z`);
    const prevDate = new Date(monday);
    prevDate.setUTCDate(monday.getUTCDate() - 7);
    const prevWeekStartDate = formatDateToIso(prevDate);

    await this.db.query('BEGIN');
    try {
      const recheck = await this.db.query<{ id: string }>(
        'SELECT id FROM weekly_menus WHERE user_id = $1 AND week_start_date = $2 FOR UPDATE',
        [userId, weekStartDate],
      );
      if ((recheck.rowCount ?? 0) > 0) {
        await this.db.query('COMMIT');
        return recheck.rows[0].id;
      }

      const prevMenu = await this.db.query<{ id: string }>(
        'SELECT id FROM weekly_menus WHERE user_id = $1 AND week_start_date = $2',
        [userId, prevWeekStartDate],
      );

      const insert = await this.db.query<{ id: string }>(
        'INSERT INTO weekly_menus (user_id, week_start_date) VALUES ($1, $2) RETURNING id',
        [userId, weekStartDate],
      );
      const newMenuId = insert.rows[0].id;
      await this.createMenuMeals(newMenuId);

      if ((prevMenu.rowCount ?? 0) > 0) {
        await this.copyMealItems(prevMenu.rows[0].id, newMenuId);
      }

      await this.db.query('COMMIT');
      return newMenuId;
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  private async createMenuMeals(menuId: string) {
    const values: string[] = [];
    const params: unknown[] = [menuId];

    for (let day = 1; day <= 7; day += 1) {
      for (const mealType of MEAL_TYPES_ORDER) {
        params.push(day, mealType);
        const dayParam = params.length - 1;
        const mealParam = params.length;
        values.push(`($1, $${dayParam}, $${mealParam})`);
      }
    }

    await this.db.query(
      `INSERT INTO menu_meals (weekly_menu_id, day_of_week, meal_type)
       VALUES ${values.join(', ')}`,
      params,
    );
  }

  private async copyMealItems(prevMenuId: string, newMenuId: string) {
    await this.db.query(
      `INSERT INTO meal_items (menu_meal_id, ingredient_id, quantity, unit)
       SELECT new_meal.id, item.ingredient_id, item.quantity, item.unit
       FROM menu_meals prev_meal
       JOIN meal_items item ON item.menu_meal_id = prev_meal.id
       JOIN menu_meals new_meal
         ON new_meal.weekly_menu_id = $2
        AND new_meal.day_of_week = prev_meal.day_of_week
        AND new_meal.meal_type = prev_meal.meal_type
       WHERE prev_meal.weekly_menu_id = $1`,
      [prevMenuId, newMenuId],
    );
  }

  private async loadMenuDays(menuId: string) {
    const orderCase = `CASE meal_type
      WHEN 'BREAKFAST' THEN 1
      WHEN 'MORNING_SNACK' THEN 2
      WHEN 'LUNCH' THEN 3
      WHEN 'AFTERNOON_SNACK' THEN 4
      WHEN 'DINNER' THEN 5
      ELSE 6
    END`;

    const result = await this.db.query<MenuRow>(
      `SELECT
         mm.id AS meal_id,
         mm.day_of_week,
         mm.meal_type,
         mi.id AS item_id,
         mi.ingredient_id,
         mi.quantity,
         mi.unit
       FROM menu_meals mm
       LEFT JOIN meal_items mi ON mi.menu_meal_id = mm.id
       WHERE mm.weekly_menu_id = $1
       ORDER BY mm.day_of_week, ${orderCase}, mi.id`,
      [menuId],
    );

    const daysMap = new Map<number, DayDto>();
    const mealsMap = new Map<string, MealDto>();

    for (const row of result.rows) {
      if (!daysMap.has(row.day_of_week)) {
        daysMap.set(row.day_of_week, { dayOfWeek: row.day_of_week, meals: [] });
      }

      if (!mealsMap.has(row.meal_id)) {
        const meal: MealDto = { id: row.meal_id, mealType: row.meal_type, items: [] };
        mealsMap.set(row.meal_id, meal);
        daysMap.get(row.day_of_week)?.meals.push(meal);
      }

      if (row.item_id) {
        mealsMap.get(row.meal_id)?.items.push({
          id: row.item_id,
          ingredientId: row.ingredient_id,
          quantity: row.quantity ? Number(row.quantity) : 0,
          unit: row.unit,
        });
      }
    }

    const days = Array.from(daysMap.values()).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    for (const day of days) {
      day.meals.sort(
        (a, b) =>
          MEAL_TYPES_ORDER.indexOf(a.mealType) - MEAL_TYPES_ORDER.indexOf(b.mealType),
      );
    }

    return days;
  }

  private async getMealForCurrentWeek(
    userId: string,
    mealId: string,
    weekStartDate: string,
  ) {
    const result = await this.db.query<{ meal_type: MealType }>(
      `SELECT mm.meal_type
       FROM menu_meals mm
       JOIN weekly_menus wm ON wm.id = mm.weekly_menu_id
       WHERE mm.id = $1 AND wm.user_id = $2 AND wm.week_start_date = $3`,
      [mealId, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Meal not found for current week');
    }
    return { mealType: result.rows[0].meal_type };
  }

  private async assertItemInCurrentWeek(
    userId: string,
    itemId: string,
    weekStartDate: string,
  ) {
    const result = await this.db.query<{ id: string }>(
      `SELECT mi.id
       FROM meal_items mi
       JOIN menu_meals mm ON mm.id = mi.menu_meal_id
       JOIN weekly_menus wm ON wm.id = mm.weekly_menu_id
       WHERE mi.id = $1 AND wm.user_id = $2 AND wm.week_start_date = $3`,
      [itemId, userId, weekStartDate],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Meal item not found for current week');
    }
  }

  private async getMealItem(itemId: string) {
    const result = await this.db.query<{
      id: string;
      ingredient_id: string;
      quantity: string;
      unit: Unit;
    }>(
      `SELECT id, ingredient_id, quantity, unit
       FROM meal_items
       WHERE id = $1`,
      [itemId],
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('Meal item not found');
    }
    return {
      id: result.rows[0].id,
      ingredientId: result.rows[0].ingredient_id,
      quantity: Number(result.rows[0].quantity),
      unit: result.rows[0].unit,
    };
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
      throw new ForbiddenException('Not allowed to access this menu');
    }
    return ownerId;
  }
}
