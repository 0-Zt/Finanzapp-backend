import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Module({
  providers: [DashboardService, DbPostgresqlService],
  controllers: [DashboardController],
})
export class DashboardModule {}
