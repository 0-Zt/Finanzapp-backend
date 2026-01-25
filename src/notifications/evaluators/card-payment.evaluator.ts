import { Injectable, Logger } from '@nestjs/common';
import { NotificationEvaluator, NotificationPayload, UserPreferences } from './notification-evaluator.interface';
import { DbPostgresqlService, QueryFilter } from '../../shared/connection/db.postgresql.service';

interface CreditCard {
  id: number;
  name: string;
  current_balance: number;
  payment_due_day: number;
  is_active: boolean;
}

@Injectable()
export class CardPaymentEvaluator implements NotificationEvaluator {
  private readonly logger = new Logger(CardPaymentEvaluator.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async evaluate(
    userId: string,
    accessToken?: string,
    preferences?: UserPreferences,
  ): Promise<NotificationPayload[]> {
    const notifications: NotificationPayload[] = [];

    try {
      if (!preferences?.card_payment_due) {
        return notifications;
      }

      const daysAhead = preferences?.card_payment_due_days ?? 3;
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Get active credit cards with balance > 0
      const filters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'is_active', operator: 'eq', value: true },
      ];

      const cards = (await this.dbService.selectWithFilters(
        'credit_cards',
        filters,
        {},
        accessToken,
      )) as CreditCard[];

      for (const card of cards || []) {
        if (card.current_balance <= 0) continue;

        // Calculate next payment due date
        let paymentDueDate = new Date(currentYear, currentMonth, card.payment_due_day);
        paymentDueDate.setHours(0, 0, 0, 0);
        
        if (paymentDueDate < today) {
          paymentDueDate = new Date(currentYear, currentMonth + 1, card.payment_due_day);
        }

        const daysUntil = Math.ceil((paymentDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntil > daysAhead) continue;

        const monthKey = `${paymentDueDate.getFullYear()}-${String(paymentDueDate.getMonth() + 1).padStart(2, '0')}`;
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
          type: 'card_payment_due',
          title: `Pago de tarjeta: ${card.name}`,
          message: `Balance: $${this.formatAmount(Number(card.current_balance))} - Vence ${urgencyText}`,
          icon: 'credit-card',
          color: isToday ? '#EF4444' : '#8B5CF6',
          priority,
          category: 'card',
          dedupe_key: `card_payment:${card.id}:${monthKey}`,
          metadata: {
            entity_type: 'credit_card',
            entity_id: card.id,
            card_name: card.name,
            balance: card.current_balance,
            payment_due_day: card.payment_due_day,
            payment_due_date: paymentDueDate.toISOString().split('T')[0],
            action_url: `/credit-cards`,
          },
          expires_at: new Date(paymentDueDate.getTime() + 24 * 60 * 60 * 1000),
        });
      }
    } catch (error) {
      this.logger.error(`Error evaluating card payment alerts: ${error.message}`);
    }

    return notifications;
  }

  private formatAmount(amount: number): string {
    return amount.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  }
}
