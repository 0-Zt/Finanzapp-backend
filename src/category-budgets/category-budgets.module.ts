import { Module } from '@nestjs/common';
import { CategoryBudgetsService } from './category-budgets.service';
import { CategoryBudgetsController } from './category-budgets.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [CategoryBudgetsService, DbPostgresqlService],
  controllers: [CategoryBudgetsController],
  exports: [CategoryBudgetsService],
})
export class CategoryBudgetsModule {}
