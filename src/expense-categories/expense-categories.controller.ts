import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { ExpenseCategoriesService } from './expense-categories.service';

@ApiTags('expense-categories')
@ApiBearerAuth()
@Controller('expense-categories')
@UseGuards(AuthGuard)
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorias de gasto' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(@CurrentUser() user: CurrentUserData) {
    return await this.expenseCategoriesService.findAll(user.accessToken);
  }

  @Post()
  @ApiOperation({ summary: 'Crear categoria de gasto' })
  @ApiBody({ type: CreateExpenseCategoryDto })
  @ApiResponse({ status: 201, description: 'Categoria creada.' })
  @ApiResponse({ status: 400, description: 'Payload invalido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createExpenseCategoryDto: CreateExpenseCategoryDto,
  ) {
    return await this.expenseCategoriesService.create(createExpenseCategoryDto, user.accessToken);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar categoria de gasto' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateExpenseCategoryDto })
  @ApiResponse({ status: 200, description: 'Categoria actualizada.' })
  @ApiResponse({ status: 400, description: 'Payload invalido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExpenseCategoryDto: UpdateExpenseCategoryDto,
  ) {
    return await this.expenseCategoriesService.update(id, updateExpenseCategoryDto, user.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoria de gasto' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'Categoria eliminada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async delete(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.expenseCategoriesService.delete(id, user.accessToken);
  }
}
