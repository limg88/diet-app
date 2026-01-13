import { IsNumber, Min } from 'class-validator';

export class UpdateWarehouseDto {
  @IsNumber()
  @Min(0)
  warehouse!: number;
}
