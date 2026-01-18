import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FinancialGoalsService } from './financial-goals.service';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('financial-goals')
@UseGuards(AuthGuard)
export class FinancialGoalsController {
  constructor(private readonly financialGoalsService: FinancialGoalsService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData) {
    return await this.financialGoalsService.findAll(user.id, user.accessToken);
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createFinancialGoalDto: CreateFinancialGoalDto,
  ) {
    return await this.financialGoalsService.create(user.id, createFinancialGoalDto, user.accessToken);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFinancialGoalDto: UpdateFinancialGoalDto,
  ) {
    return await this.financialGoalsService.update(user.id, id, updateFinancialGoalDto, user.accessToken);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.financialGoalsService.delete(user.id, id, user.accessToken);
  }
}
