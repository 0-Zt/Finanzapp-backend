// src/financial-goals/financial-goals.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { FinancialGoalsService } from './financial-goals.service';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';

@Controller('financial-goals')
export class FinancialGoalsController {
  constructor(private readonly financialGoalsService: FinancialGoalsService) {}

  // Listar metas financieras para un usuario (pasando userId por query)
  @Get()
  async findAll(@Query('userId', ParseIntPipe) userId: number) {
    return await this.financialGoalsService.findAll(userId);
  }

  // Crear una meta financiera
  @Post()
  async create(@Body() createFinancialGoalDto: CreateFinancialGoalDto) {
    return await this.financialGoalsService.create(createFinancialGoalDto);
  }

  // Actualizar una meta financiera (por id)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFinancialGoalDto: UpdateFinancialGoalDto,
  ) {
    return await this.financialGoalsService.update(id, updateFinancialGoalDto);
  }

  // Eliminar una meta financiera (por id)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.financialGoalsService.delete(id);
  }
}
