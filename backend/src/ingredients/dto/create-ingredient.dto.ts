import { IsArray, IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { MealType } from '../../common/enums/meal-type.enum';
import { Unit } from '../../common/enums/unit.enum';

export class CreateIngredientDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(Unit)
  defaultUnit!: Unit;

  @IsNumber()
  @Min(0.000001)
  defaultQuantity!: number;

  @IsOptional()
  @IsArray()
  @IsEnum(MealType, { each: true })
  allowedMealTypes?: MealType[];
}
