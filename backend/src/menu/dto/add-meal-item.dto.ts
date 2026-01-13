import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';
import { Unit } from '../../common/enums/unit.enum';

export class AddMealItemDto {
  @IsUUID()
  ingredientId!: string;

  @IsNumber()
  @Min(0.000001)
  quantity!: number;

  @IsEnum(Unit)
  unit!: Unit;
}
