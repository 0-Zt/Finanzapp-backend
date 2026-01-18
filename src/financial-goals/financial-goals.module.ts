import { Module } from '@nestjs/common';
import { FinancialGoalsService } from './financial-goals.service';
import { FinancialGoalsController } from './financial-goals.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [FinancialGoalsService, DbPostgresqlService],
  controllers: [FinancialGoalsController],
})
export class FinancialGoalsModule {}
