import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CategoryBudgetsService } from './category-budgets.service';
import { CreateCategoryBudgetDto } from './dto/create-category-budget.dto';
import { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto';

@ApiTags('category-budgets')
@ApiBearerAuth()
@Controller('category-budgets')
@UseGuards(AuthGuard)
export class CategoryBudgetsController {
  constructor(private readonly categoryBudgetsService: CategoryBudgetsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar presupuestos por categoría' })
  @ApiQuery({ name: 'month', required: false, description: 'Mes YYYY-MM (opcional)', example: '2026-01' })
  @ApiResponse({ status: 200, description: 'Lista de presupuestos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(@CurrentUser() user: CurrentUserData, @Query('month') month?: string) {
    return await this.categoryBudgetsService.findAll(user.id, user.accessToken, month);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Obtener progreso/summary del presupuesto' })
  @ApiQuery({ name: 'month', required: false, description: 'Mes YYYY-MM (opcional)', example: '2026-01' })
  @ApiResponse({ status: 200, description: 'Resumen/progreso.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProgress(@CurrentUser() user: CurrentUserData, @Query('month') month?: string) {
    return await this.categoryBudgetsService.getProgress(user.id, user.accessToken, month);
  }

  @Post()
  @ApiOperation({ summary: 'Crear presupuesto por categoría' })
  @ApiBody({ type: CreateCategoryBudgetDto })
  @ApiResponse({ status: 201, description: 'Presupuesto creado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(@CurrentUser() user: CurrentUserData, @Body() createDto: CreateCategoryBudgetDto) {
    return await this.categoryBudgetsService.create(user.id, createDto, user.accessToken);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar presupuesto por categoría' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto', example: 123 })
  @ApiBody({ type: UpdateCategoryBudgetDto })
  @ApiResponse({ status: 200, description: 'Presupuesto actualizado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCategoryBudgetDto,
  ) {
    return await this.categoryBudgetsService.update(user.id, id, updateDto, user.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar presupuesto por categoría' })
  @ApiParam({ name: 'id', description: 'ID del presupuesto', example: 123 })
  @ApiResponse({ status: 200, description: 'Presupuesto eliminado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async delete(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.categoryBudgetsService.delete(user.id, id, user.accessToken);
  }
}
