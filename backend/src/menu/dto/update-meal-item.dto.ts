import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { Unit } from '../../common/enums/unit.enum';

export class UpdateMealItemDto {
  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  quantity?: number;

  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;
}
