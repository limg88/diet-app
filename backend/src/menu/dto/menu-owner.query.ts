import { IsOptional, IsUUID } from 'class-validator';

export class MenuOwnerQuery {
  @IsOptional()
  @IsUUID()
  ownerUserId?: string;
}
