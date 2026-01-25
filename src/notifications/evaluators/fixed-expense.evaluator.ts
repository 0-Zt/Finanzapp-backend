import { Injectable, Logger } from '@nestjs/common';
import { NotificationEvaluator, NotificationPayload, UserPreferences } from './notification-evaluator.interface';
import { DbPostgresqlService, QueryFilter } from '../../shared/connection/db.postgresql.service';

interface FixedExpense {
  id: number;
  description: string;
  amount: number;
  due_day: number;
  is_active: boolean;
}

@Injectable()
export class FixedExpenseEvaluator implements NotificationEvaluator {
  private readonly logger = new Logger(FixedExpenseEvaluator.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async evaluate(
    userId: string,
    accessToken?: string,
    preferences?: UserPreferences,
  ): Promise<NotificationPayload[]> {
    const notifications: NotificationPayload[] = [];

    try {
      if (!preferences?.fixed_expense_due) {
        return notifications;
      }

      const daysAhead = preferences?.fixed_expense_due_days ?? 2;
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get active fixed expenses
      const filters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'is_active', operator: 'eq', value: true },
      ];

      const expenses = (await this.dbService.selectWithFilters(
        'fixed_expenses',
        filters,
        {},
        accessToken,
      )) as FixedExpense[];

      for (const expense of expenses || []) {
        // Calculate next due date
        let dueDate = new Date(currentYear, currentMonth, expense.due_day);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          dueDate = new Date(currentYear, currentMonth + 1, expense.due_day);
        }

        const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil > daysAhead) continue;

        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;
        const isToday = daysUntil === 0;
        const isTomorrow = daysUntil === 1;

        let urgencyText = `en ${daysUntil} días`;
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

        if (isToday) {
          urgencyText = 'HOY';
          priority = 'urgent';
        } else if (isTomorrow) {
          urgencyText = 'mañana';
          priority = 'high';
        }

        notifications.push({
          type: 'fixed_expense_due',
          title: `Gasto fijo: ${expense.description}`,
          message: `$${this.formatAmount(Number(expense.amount))} vence ${urgencyText}`,
          icon: 'repeat',
          color: isToday ? '#EF4444' : '#6366F1',
          priority,
          category: 'payment',
          dedupe_key: `fixed_expense:${expense.id}:${monthKey}`,
          metadata: {
            entity_type: 'fixed_expense',
            entity_id: expense.id,
            description: expense.description,
            amount: expense.amount,
            due_day: expense.due_day,
            due_date: dueDate.toISOString().split('T')[0],
            action_url: '/profile?tab=fixed-expenses',
          },
          expires_at: new Date(dueDate.getTime() + 24 * 60 * 60 * 1000),
        });
      }
    } catch (error) {
      this.logger.error(`Error evaluating fixed expense alerts: ${error.message}`);
    }

    return notifications;
  }

  private formatAmount(amount: number): string {
    return amount.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  }
}
