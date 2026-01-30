import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { MonthlyAutomationModule } from '../monthly-automation/monthly-automation.module';

@Module({
  imports: [AuthModule, UserProfileModule, MonthlyAutomationModule],
  providers: [DashboardService, DbPostgresqlService],
  controllers: [DashboardController],
})
export class DashboardModule {}
