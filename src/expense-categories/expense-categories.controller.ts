// src/expense-categories/expense-categories.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  // Endpoint para obtener todas las categorías
  @Get()
  async findAll() {
    return await this.expenseCategoriesService.findAll();
  }

  // Endpoint para crear una categoría nueva (si fuera necesario)
  @Post()
  async create(@Body() createExpenseCategoryDto: CreateExpenseCategoryDto) {
    return await this.expenseCategoriesService.create(createExpenseCategoryDto);
  }

  // Endpoint para actualizar una categoría por ID
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto,
  ) {
    return await this.expenseCategoriesService.update(id, updateExpenseCategoryDto);
  }

  // Endpoint para eliminar una categoría por ID
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.expenseCategoriesService.delete(id);
  }
}
