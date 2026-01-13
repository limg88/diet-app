import { MealType } from '../common/enums/meal-type.enum';
import { Unit } from '../common/enums/unit.enum';

export interface Ingredient {
  id: string;
  userId: string;
  name: string;
  category: string | null;
  defaultUnit: Unit;
  defaultQuantity: number;
  allowedMealTypes: MealType[] | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
