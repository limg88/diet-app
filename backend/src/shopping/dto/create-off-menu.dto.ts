import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Unit } from '../../common/enums/unit.enum';

export class CreateOffMenuDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(Unit)
  unit!: Unit;

  @IsNumber()
  @Min(0.000001)
  quantity!: number;
}
