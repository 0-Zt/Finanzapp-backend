import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @CurrentUser() user: CurrentUserData,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
  ) {
    return await this.dashboardService.getDashboard(user.id, limit, user.accessToken);
  }
}
