import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { ListIngredientsQuery } from './dto/list-ingredients.query';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { IngredientsService } from './ingredients.service';

type RequestUser = {
  id: string;
  email: string;
};

@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser, @Query() query: ListIngredientsQuery) {
    return this.ingredientsService.list(user.id, query);
  }

  @Get('categories')
  listCategories(@CurrentUser() user: RequestUser) {
    return this.ingredientsService.listCategories(user.id);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.ingredientsService.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateIngredientDto) {
    return this.ingredientsService.create(user.id, dto);
  }

  @Put(':id')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateIngredientDto) {
    return this.ingredientsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.ingredientsService.softDelete(user.id, id);
  }
}
