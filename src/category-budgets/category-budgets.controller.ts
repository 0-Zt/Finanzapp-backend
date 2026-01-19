import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { CategoryBudgetsService } from './category-budgets.service';
import { CreateCategoryBudgetDto } from './dto/create-category-budget.dto';
import { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('category-budgets')
@UseGuards(AuthGuard)
export class CategoryBudgetsController {
  constructor(private readonly categoryBudgetsService: CategoryBudgetsService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData, @Query('month') month?: string) {
    return await this.categoryBudgetsService.findAll(user.id, user.accessToken, month);
  }

  @Get('progress')
  async getProgress(@CurrentUser() user: CurrentUserData, @Query('month') month?: string) {
    return await this.categoryBudgetsService.getProgress(user.id, user.accessToken, month);
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createDto: CreateCategoryBudgetDto,
  ) {
    return await this.categoryBudgetsService.create(user.id, createDto, user.accessToken);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryBudgetDto,
  ) {
    return await this.categoryBudgetsService.update(user.id, id, updateDto, user.accessToken);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.categoryBudgetsService.delete(user.id, id, user.accessToken);
  }
}
