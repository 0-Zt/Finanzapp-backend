import { Module } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';
import { ExpenseCategoriesController } from './expense-categories.controller';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Module({
  providers: [ExpenseCategoriesService,DbPostgresqlService],
  controllers: [ExpenseCategoriesController]
})
export class ExpenseCategoriesModule {}
