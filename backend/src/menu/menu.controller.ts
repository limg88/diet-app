import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { UpdateMealItemDto } from './dto/update-meal-item.dto';
import { MenuService } from './menu.service';

type RequestUser = {
  id: string;
  email: string;
};

@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: RequestUser) {
    return this.menuService.getCurrentMenu(user.id);
  }

  @Post('current/meals/:mealId/items')
  addItem(
    @CurrentUser() user: RequestUser,
    @Param('mealId') mealId: string,
    @Body() dto: AddMealItemDto,
  ) {
    return this.menuService.addMealItem(user.id, mealId, dto);
  }

  @Put('current/items/:itemId')
  updateItem(
    @CurrentUser() user: RequestUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMealItemDto,
  ) {
    return this.menuService.updateMealItem(user.id, itemId, dto);
  }

  @Delete('current/items/:itemId')
  removeItem(@CurrentUser() user: RequestUser, @Param('itemId') itemId: string) {
    return this.menuService.removeMealItem(user.id, itemId);
  }
}
