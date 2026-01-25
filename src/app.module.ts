import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionsModule } from './transactions/transactions.module';
import { ExpenseCategoriesModule } from './expense-categories/expense-categories.module';
import { UpcomingPaymentsModule } from './upcoming-payments/upcoming-payments.module';
import { FinancialGoalsModule } from './financial-goals/financial-goals.module';
import { CategoryBudgetsModule } from './category-budgets/category-budgets.module';
import { CategoriesModule } from './categories/categories.module';
import { DbPostgresqlService } from './shared/connection/db.postgresql.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    UserProfileModule,
    TransactionsModule,
    ExpenseCategoriesModule,
    UpcomingPaymentsModule,
    FinancialGoalsModule,
    CategoryBudgetsModule,
    CategoriesModule,
    DashboardModule,
    CreditCardsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, DbPostgresqlService],
})
export class AppModule {}
