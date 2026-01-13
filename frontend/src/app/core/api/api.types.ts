export type Unit = 'gr' | 'ml' | 'unit';
export type MealType =
  | 'BREAKFAST'
  | 'MORNING_SNACK'
  | 'LUNCH'
  | 'AFTERNOON_SNACK'
  | 'DINNER';

export type Ingredient = {
  id: string;
  name: string;
  category: string | null;
  defaultUnit: Unit;
  defaultQuantity: number;
  allowedMealTypes: MealType[] | null;
  deletedAt: string | null;
};

export type IngredientList = {
  items: Ingredient[];
  total: number;
};

export type MenuItem = {
  id: string;
  ingredientId: string;
  quantity: number;
  unit: Unit;
};

export type MenuMeal = {
  id: string;
  mealType: MealType;
  items: MenuItem[];
};

export type MenuDay = {
  dayOfWeek: number;
  meals: MenuMeal[];
};

export type WeeklyMenu = {
  weekStartDate: string;
  days: MenuDay[];
};

export type ShoppingItem = {
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

export type ShoppingList = {
  weekStartDate: string;
  items: ShoppingItem[];
};
