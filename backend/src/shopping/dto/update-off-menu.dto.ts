import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Unit } from '../../common/enums/unit.enum';

export class UpdateOffMenuDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string | null;

  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;

  @IsOptional()
  @IsNumber()
  @Min(0.000001)
  quantity?: number;
}
