import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { BudgetAlertEvaluator } from './evaluators/budget-alert.evaluator';
import { PaymentReminderEvaluator } from './evaluators/payment-reminder.evaluator';
import { GoalAlertEvaluator } from './evaluators/goal-alert.evaluator';
import { CardPaymentEvaluator } from './evaluators/card-payment.evaluator';
import { FixedExpenseEvaluator } from './evaluators/fixed-expense.evaluator';
import { DbPostgresqlService } from '../shared/connection/db.postgresql.service';
import { CategoryBudgetsModule } from '../category-budgets/category-budgets.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [CategoryBudgetsModule, AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    BudgetAlertEvaluator,
    PaymentReminderEvaluator,
    GoalAlertEvaluator,
    CardPaymentEvaluator,
    FixedExpenseEvaluator,
    DbPostgresqlService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
