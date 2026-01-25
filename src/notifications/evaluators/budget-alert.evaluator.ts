import { Injectable, Logger } from '@nestjs/common';
import { NotificationEvaluator, NotificationPayload, UserPreferences } from './notification-evaluator.interface';
import { CategoryBudgetsService, BudgetProgress } from '../../category-budgets/category-budgets.service';

@Injectable()
export class BudgetAlertEvaluator implements NotificationEvaluator {
  private readonly logger = new Logger(BudgetAlertEvaluator.name);

  constructor(private readonly categoryBudgetsService: CategoryBudgetsService) {}

  async evaluate(
    userId: string,
    accessToken?: string,
    preferences?: UserPreferences,
  ): Promise<NotificationPayload[]> {
    const notifications: NotificationPayload[] = [];

    try {
      // Check preferences
      if (!preferences?.budget_warning && !preferences?.budget_exceeded) {
        return notifications;
      }

      // Get current month budget progress
      const summary = await this.categoryBudgetsService.getProgress(userId, accessToken);
      const currentMonth = summary.month; // "2026-01"

      for (const budget of summary.budgets) {
        const dedupe_base = `budget:${budget.category_id}:${currentMonth}`;

        if (budget.status === 'exceeded' && preferences?.budget_exceeded) {
          notifications.push({
            type: 'budget_exceeded',
            title: `Presupuesto excedido: ${budget.category_name}`,
            message: `Has gastado $${this.formatAmount(budget.spent_amount)} de $${this.formatAmount(budget.effective_budget_amount)} (${budget.percentage.toFixed(0)}%)`,
            icon: 'alert-circle',
            color: '#EF4444', // red
            priority: 'high',
            category: 'budget',
            dedupe_key: `${dedupe_base}:exceeded`,
            metadata: {
              entity_type: 'category_budget',
              entity_id: budget.id,
              category_id: budget.category_id,
              category_name: budget.category_name,
              percentage: budget.percentage,
              spent_amount: budget.spent_amount,
              budget_amount: budget.effective_budget_amount,
              action_url: '/profile?tab=budgets',
            },
            expires_at: this.getEndOfMonth(currentMonth),
          });
        } else if (budget.status === 'warning' && preferences?.budget_warning) {
          notifications.push({
            type: 'budget_warning',
            title: `Presupuesto al ${budget.percentage.toFixed(0)}%: ${budget.category_name}`,
            message: `Te quedan $${this.formatAmount(budget.remaining_amount)} de $${this.formatAmount(budget.effective_budget_amount)}`,
            icon: 'alert-triangle',
            color: '#F59E0B', // amber
            priority: 'medium',
            category: 'budget',
            dedupe_key: `${dedupe_base}:warning`,
            metadata: {
              entity_type: 'category_budget',
              entity_id: budget.id,
              category_id: budget.category_id,
              category_name: budget.category_name,
              percentage: budget.percentage,
              spent_amount: budget.spent_amount,
              budget_amount: budget.effective_budget_amount,
              remaining_amount: budget.remaining_amount,
              action_url: '/profile?tab=budgets',
            },
            expires_at: this.getEndOfMonth(currentMonth),
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error evaluating budget alerts: ${error.message}`);
    }

    return notifications;
  }

  private formatAmount(amount: number): string {
    return amount.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  }

  private getEndOfMonth(month: string): Date {
    const [year, monthNum] = month.split('-').map(Number);
    // Last day of the month at 23:59:59
    return new Date(year, monthNum, 0, 23, 59, 59);
  }
}
