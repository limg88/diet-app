import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListShoppingQuery {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  purchased?: boolean;

  @IsOptional()
  @IsString()
  mealType?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
