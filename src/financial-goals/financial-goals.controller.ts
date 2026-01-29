import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { FinancialGoalsService } from './financial-goals.service';

@ApiTags('financial-goals')
@ApiBearerAuth()
@Controller('financial-goals')
@UseGuards(AuthGuard)
export class FinancialGoalsController {
  constructor(private readonly financialGoalsService: FinancialGoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar metas financieras' })
  @ApiResponse({ status: 200, description: 'Lista de metas.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(@CurrentUser() user: CurrentUserData) {
    return await this.financialGoalsService.findAll(user.id, user.accessToken);
  }

  @Post()
  @ApiOperation({ summary: 'Crear meta financiera' })
  @ApiBody({ type: CreateFinancialGoalDto })
  @ApiResponse({ status: 201, description: 'Meta creada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(@CurrentUser() user: CurrentUserData, @Body() createFinancialGoalDto: CreateFinancialGoalDto) {
    return await this.financialGoalsService.create(user.id, createFinancialGoalDto, user.accessToken);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar meta financiera' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateFinancialGoalDto })
  @ApiResponse({ status: 200, description: 'Meta actualizada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFinancialGoalDto: UpdateFinancialGoalDto,
  ) {
    return await this.financialGoalsService.update(user.id, id, updateFinancialGoalDto, user.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar meta financiera' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'Meta eliminada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async delete(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.financialGoalsService.delete(user.id, id, user.accessToken);
  }
}
