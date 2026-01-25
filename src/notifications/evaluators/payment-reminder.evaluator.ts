import { Injectable, Logger } from '@nestjs/common';
import { NotificationEvaluator, NotificationPayload, UserPreferences } from './notification-evaluator.interface';
import { DbPostgresqlService, QueryFilter } from '../../shared/connection/db.postgresql.service';

@Injectable()
export class PaymentReminderEvaluator implements NotificationEvaluator {
  private readonly logger = new Logger(PaymentReminderEvaluator.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async evaluate(
    userId: string,
    accessToken?: string,
    preferences?: UserPreferences,
  ): Promise<NotificationPayload[]> {
    const notifications: NotificationPayload[] = [];

    try {
      if (!preferences?.payment_reminder) {
        return notifications;
      }

      const daysAhead = preferences?.payment_reminder_days ?? 3;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysAhead);

      // Get upcoming payments in the next N days
      const filters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'payment_date', operator: 'gte', value: today.toISOString().split('T')[0] },
        { column: 'payment_date', operator: 'lte', value: futureDate.toISOString().split('T')[0] },
      ];

      const payments = await this.dbService.selectWithFilters(
        'upcoming_payments',
        filters,
        { orderBy: 'payment_date', order: 'asc' },
        accessToken,
      );

      for (const payment of payments || []) {
        const paymentDate = new Date(payment.payment_date);
        paymentDate.setHours(0, 0, 0, 0);
        
        const daysUntil = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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
          type: 'payment_reminder',
          title: `Pago próximo: ${payment.description}`,
          message: `$${this.formatAmount(Number(payment.amount))} vence ${urgencyText}`,
          icon: 'calendar',
          color: isToday ? '#EF4444' : '#3B82F6',
          priority,
          category: 'payment',
          dedupe_key: `payment:${payment.id}:${payment.payment_date}`,
          metadata: {
            entity_type: 'upcoming_payment',
            entity_id: payment.id,
            payment_date: payment.payment_date,
            amount: payment.amount,
            description: payment.description,
            action_url: '/dashboard',
          },
          expires_at: new Date(paymentDate.getTime() + 24 * 60 * 60 * 1000), // Expires day after
        });
      }
    } catch (error) {
      this.logger.error(`Error evaluating payment reminders: ${error.message}`);
    }

    return notifications;
  }

  private formatAmount(amount: number): string {
    return amount.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  }
}
