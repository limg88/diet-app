import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MenuModule } from '../menu/menu.module';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';

@Module({
  imports: [DatabaseModule, MenuModule],
  controllers: [ShoppingController],
  providers: [ShoppingService],
})
export class ShoppingModule {}
