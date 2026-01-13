import { IsBoolean } from 'class-validator';

export class UpdatePurchasedDto {
  @IsBoolean()
  purchased!: boolean;
}
