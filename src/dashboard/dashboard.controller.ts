import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener dashboard (resumen + agregaciones)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de transacciones (default 6)', example: 6 })
  @ApiResponse({ status: 200, description: 'Payload del dashboard.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getDashboard(
    @CurrentUser() user: CurrentUserData,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return await this.dashboardService.getDashboard(user.id, limit, user.accessToken);
  }

  @Get('monthly-summary')
  @ApiOperation({ summary: 'Resumen financiero mensual (ingresos, gastos, ahorro, comparación)' })
  @ApiQuery({ name: 'month', required: false, description: 'Mes en formato YYYY-MM (default: mes actual)', example: '2026-01' })
  @ApiResponse({ status: 200, description: 'Resumen mensual con comparación vs mes anterior.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getMonthlySummary(
    @CurrentUser() user: CurrentUserData,
    @Query('month') month?: string,
  ) {
    return await this.dashboardService.getMonthlySummary(user.id, month, user.accessToken);
  }
}
