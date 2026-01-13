import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOffMenuDto } from './dto/create-off-menu.dto';
import { ListShoppingQuery } from './dto/list-shopping.query';
import { UpdateOffMenuDto } from './dto/update-off-menu.dto';
import { UpdatePurchasedDto } from './dto/update-purchased.dto';
import { ShoppingService } from './shopping.service';

type RequestUser = {
  id: string;
  email: string;
};

@UseGuards(JwtAuthGuard)
@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get('current')
  getCurrent(@CurrentUser() user: RequestUser, @Query() query: ListShoppingQuery) {
    return this.shoppingService.getCurrentShopping(user.id, query);
  }

  @Patch('current/items/:id')
  updatePurchased(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdatePurchasedDto,
  ) {
    return this.shoppingService.updatePurchased(user.id, id, dto);
  }

  @Post('current/off-menu')
  createOffMenu(@CurrentUser() user: RequestUser, @Body() dto: CreateOffMenuDto) {
    return this.shoppingService.createOffMenu(user.id, dto);
  }

  @Put('current/off-menu/:id')
  updateOffMenu(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateOffMenuDto,
  ) {
    return this.shoppingService.updateOffMenu(user.id, id, dto);
  }

  @Delete('current/off-menu/:id')
  deleteOffMenu(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.shoppingService.deleteOffMenu(user.id, id);
  }
}
