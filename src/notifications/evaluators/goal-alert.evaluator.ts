import { Injectable, Logger } from '@nestjs/common';
import { NotificationEvaluator, NotificationPayload, UserPreferences } from './notification-evaluator.interface';
import { DbPostgresqlService, QueryFilter } from '../../shared/connection/db.postgresql.service';

interface FinancialGoal {
  id: number;
  title: string;
  current_amount: number;
  target_amount: number;
  deadline: string;
  icon: string | null;
}

@Injectable()
export class GoalAlertEvaluator implements NotificationEvaluator {
  private readonly logger = new Logger(GoalAlertEvaluator.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async evaluate(
    userId: string,
    accessToken?: string,
    preferences?: UserPreferences,
  ): Promise<NotificationPayload[]> {
    const notifications: NotificationPayload[] = [];

    try {
      if (!preferences?.goal_deadline) {
        return notifications;
      }

      const daysAhead = preferences?.goal_deadline_days ?? 7;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysAhead);

      // Get goals with deadline in the next N days
      const filters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'deadline', operator: 'gte', value: today.toISOString().split('T')[0] },
        { column: 'deadline', operator: 'lte', value: futureDate.toISOString().split('T')[0] },
      ];

      const goals = (await this.dbService.selectWithFilters(
        'financial_goals',
        filters,
        { orderBy: 'deadline', order: 'asc' },
        accessToken,
      )) as FinancialGoal[];

      for (const goal of goals || []) {
        const deadline = new Date(goal.deadline);
        deadline.setHours(0, 0, 0, 0);
        
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        const isCompleted = progress >= 100;

        // Skip if already completed
        if (isCompleted) continue;

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

        const remaining = Number(goal.target_amount) - Number(goal.current_amount);

        notifications.push({
          type: 'goal_deadline',
          title: `Meta próxima a vencer: ${goal.title}`,
          message: `Faltan $${this.formatAmount(remaining)} para completar (${progress.toFixed(0)}%) - Vence ${urgencyText}`,
          icon: goal.icon || 'target',
          color: isToday ? '#EF4444' : '#10B981',
          priority,
          category: 'goal',
          dedupe_key: `goal_deadline:${goal.id}:${goal.deadline}`,
          metadata: {
            entity_type: 'financial_goal',
            entity_id: goal.id,
            title: goal.title,
            deadline: goal.deadline,
            progress: progress,
            current_amount: goal.current_amount,
            target_amount: goal.target_amount,
            remaining: remaining,
            action_url: '/goals',
          },
          expires_at: new Date(deadline.getTime() + 24 * 60 * 60 * 1000),
        });
      }

      // Also check for goals with good progress (80%+) regardless of deadline
      const progressFilters: QueryFilter[] = [
        { column: 'user_id', operator: 'eq', value: userId },
      ];

      const allGoals = (await this.dbService.selectWithFilters(
        'financial_goals',
        progressFilters,
        {},
        accessToken,
      )) as FinancialGoal[];

      for (const goal of allGoals || []) {
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        
        // Notify when reaching 90% progress
        if (progress >= 90 && progress < 100) {
          const remaining = Number(goal.target_amount) - Number(goal.current_amount);
          const monthKey = new Date().toISOString().slice(0, 7); // Current month for dedupe

          notifications.push({
            type: 'goal_progress',
            title: `¡Casi completas tu meta! ${goal.title}`,
            message: `Ya tienes el ${progress.toFixed(0)}% - Solo faltan $${this.formatAmount(remaining)}`,
            icon: goal.icon || 'target',
            color: '#10B981', // green
            priority: 'low',
            category: 'goal',
            dedupe_key: `goal_progress:${goal.id}:90:${monthKey}`,
            metadata: {
              entity_type: 'financial_goal',
              entity_id: goal.id,
              title: goal.title,
              progress: progress,
              current_amount: goal.current_amount,
              target_amount: goal.target_amount,
              remaining: remaining,
              action_url: '/goals',
            },
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          });
        }
      }
    } catch (error) {
      this.logger.error(`Error evaluating goal alerts: ${error.message}`);
    }

    return notifications;
  }

  private formatAmount(amount: number): string {
    return amount.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  }
}
