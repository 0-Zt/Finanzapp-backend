// src/expense-categories/expense-categories.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategoriesService } from './expense-categories.service';

@ApiTags('expense-categories')
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías de gasto' })
  @ApiResponse({ status: 200, description: 'Lista de categorías.' })
  async findAll() {
    return await this.expenseCategoriesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoría de gasto' })
  @ApiBody({ type: CreateExpenseCategoryDto })
  @ApiResponse({ status: 201, description: 'Categoría creada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  async create(@Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return await this.expenseCategoriesService.create(createExpenseCategoryDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar categoría de gasto' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateExpenseCategoryDto })
  @ApiResponse({ status: 200, description: 'Categoría actualizada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto) {
    return await this.expenseCategoriesService.update(id, updateExpenseCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría de gasto' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'Categoría eliminada.' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.expenseCategoriesService.delete(id);
  }
}
