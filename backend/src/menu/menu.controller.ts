import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AddMealItemDto } from './dto/add-meal-item.dto';
import { MenuOwnerQuery } from './dto/menu-owner.query';
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
  getCurrent(@CurrentUser() user: RequestUser, @Query() query: MenuOwnerQuery) {
    return this.menuService.getCurrentMenu(user.id, query.ownerUserId);
  }

  @Post('current/meals/:mealId/items')
  addItem(
    @CurrentUser() user: RequestUser,
    @Param('mealId') mealId: string,
    @Body() dto: AddMealItemDto,
    @Query() query: MenuOwnerQuery,
  ) {
    return this.menuService.addMealItem(user.id, mealId, dto, query.ownerUserId);
  }

  @Put('current/items/:itemId')
  updateItem(
    @CurrentUser() user: RequestUser,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateMealItemDto,
    @Query() query: MenuOwnerQuery,
  ) {
    return this.menuService.updateMealItem(user.id, itemId, dto, query.ownerUserId);
  }

  @Delete('current/items/:itemId')
  removeItem(
    @CurrentUser() user: RequestUser,
    @Param('itemId') itemId: string,
    @Query() query: MenuOwnerQuery,
  ) {
    return this.menuService.removeMealItem(user.id, itemId, query.ownerUserId);
  }
}
