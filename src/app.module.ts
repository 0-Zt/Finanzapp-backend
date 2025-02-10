import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { UpcomingPaymentsModule } from './upcoming-payments/upcoming-payments.module';
import { FinancialGoalsModule } from './financial-goals/financial-goals.module';
import { DbPostgresqlService } from './shared/connection/db.postgresql.service';

@Module({
  imports: [TransactionsModule, ExpenseCategoriesModule, UpcomingPaymentsModule, FinancialGoalsModule,],
  controllers: [AppController],
  providers: [AppService,DbPostgresqlService],
})
export class AppModule {}
