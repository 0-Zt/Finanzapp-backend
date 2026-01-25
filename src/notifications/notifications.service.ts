import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { DbPostgresqlService } from '../shared/connection/db.postgresql.service';
import { NotificationDto, NotificationsResponse, UnreadCountResponse } from './dto/notification-response.dto';
import { NotificationPayload, UserPreferences } from './evaluators/notification-evaluator.interface';
import { BudgetAlertEvaluator } from './evaluators/budget-alert.evaluator';
import { PaymentReminderEvaluator } from './evaluators/payment-reminder.evaluator';
import { GoalAlertEvaluator } from './evaluators/goal-alert.evaluator';
import { CardPaymentEvaluator } from './evaluators/card-payment.evaluator';
import { FixedExpenseEvaluator } from './evaluators/fixed-expense.evaluator';

dotenv.config();

interface NotificationState {
  user_id: string;
  last_evaluated_at: string | null;
  evaluation_in_progress: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly evaluationThrottleMs = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly dbService: DbPostgresqlService,
    private readonly budgetEvaluator: BudgetAlertEvaluator,
    private readonly paymentEvaluator: PaymentReminderEvaluator,
    private readonly goalEvaluator: GoalAlertEvaluator,
    private readonly cardEvaluator: CardPaymentEvaluator,
    private readonly fixedExpenseEvaluator: FixedExpenseEvaluator,
  ) {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be defined');
    }

    this.supabaseUrl = SUPABASE_URL;
    this.supabaseAnonKey = SUPABASE_ANON_KEY;
  }

  private getClient(accessToken?: string): SupabaseClient {
    if (!accessToken) {
      return createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }

    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async evaluateNotifications(userId: string, accessToken?: string): Promise<void> {
    try {
      // 1. Check if evaluation is needed (throttle)
      const state = await this.getOrCreateState(userId, accessToken);
      const now = new Date();
      const lastEval = state.last_evaluated_at ? new Date(state.last_evaluated_at) : null;

      if (lastEval && now.getTime() - lastEval.getTime() < this.evaluationThrottleMs) {
        return; // Skip, recent evaluation
      }

      // 2. Get user preferences
      const preferences = await this.getUserPreferences(userId, accessToken);

      // 3. Execute all evaluators in parallel
      const allNotifications: NotificationPayload[] = [];

      const results = await Promise.allSettled([
        this.budgetEvaluator.evaluate(userId, accessToken, preferences),
        this.paymentEvaluator.evaluate(userId, accessToken, preferences),
        this.goalEvaluator.evaluate(userId, accessToken, preferences),
        this.cardEvaluator.evaluate(userId, accessToken, preferences),
        this.fixedExpenseEvaluator.evaluate(userId, accessToken, preferences),
      ]);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allNotifications.push(...result.value);
        } else {
          this.logger.error(`Evaluator ${index} failed: ${result.reason}`);
        }
      });

      // 4. Upsert notifications (dedupe_key ensures idempotence)
      for (const notification of allNotifications) {
        await this.upsertNotification(userId, notification, accessToken);
      }

      // 5. Update last_evaluated_at
      await this.updateState(userId, accessToken);

      // 6. Cleanup expired notifications
      await this.cleanupExpired(userId, accessToken);
    } catch (error) {
      this.logger.error(`Error evaluating notifications for user ${userId}: ${error.message}`);
    }
  }

  private async upsertNotification(
    userId: string,
    payload: NotificationPayload,
    accessToken?: string,
  ): Promise<void> {
    const client = this.getClient(accessToken);

    const { error } = await client.from('notifications').upsert(
      {
        user_id: userId,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        icon: payload.icon ?? null,
        color: payload.color ?? null,
        priority: payload.priority,
        category: payload.category,
        dedupe_key: payload.dedupe_key,
        metadata: payload.metadata ?? {},
        expires_at: payload.expires_at?.toISOString() ?? null,
      },
      {
        onConflict: 'user_id,dedupe_key',
        ignoreDuplicates: true, // Don't update if already exists
      },
    );

    if (error) {
      this.logger.error(`Error upserting notification: ${error.message}`);
    }
  }

  async getNotifications(
    userId: string,
    options: { limit: number; offset: number; unreadOnly?: boolean },
    accessToken?: string,
  ): Promise<NotificationsResponse> {
    const client = this.getClient(accessToken);

    let query = client
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('dismissed_at', null)
      .or('expires_at.is.null,expires_at.gt.now()')
      .order('created_at', { ascending: false })
      .range(options.offset, options.offset + options.limit - 1);

    if (options.unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error(`Error fetching notifications: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch notifications');
    }

    // Get unread count
    const { count: unreadCount } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
      .is('dismissed_at', null)
      .or('expires_at.is.null,expires_at.gt.now()');

    return {
      notifications: (data || []).map(this.mapToDto),
      unreadCount: unreadCount ?? 0,
      totalCount: count ?? 0,
      hasMore: options.offset + options.limit < (count ?? 0),
    };
  }

  async getUnreadCount(userId: string, accessToken?: string): Promise<UnreadCountResponse> {
    const client = this.getClient(accessToken);

    const { count, error } = await client
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
      .is('dismissed_at', null)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (error) {
      this.logger.error(`Error counting notifications: ${error.message}`);
      throw new InternalServerErrorException('Failed to count notifications');
    }

    return { unreadCount: count ?? 0 };
  }

  async markAsRead(userId: string, id: number, accessToken?: string): Promise<void> {
    await this.dbService.update(
      'notifications',
      { read_at: new Date().toISOString() },
      { id, user_id: userId },
      accessToken,
    );
  }

  async markAllAsRead(userId: string, accessToken?: string): Promise<void> {
    const client = this.getClient(accessToken);
    const { error } = await client
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (error) {
      this.logger.error(`Error marking all as read: ${error.message}`);
      throw new InternalServerErrorException('Failed to mark all as read');
    }
  }

  async dismiss(userId: string, id: number, accessToken?: string): Promise<void> {
    await this.dbService.update(
      'notifications',
      { dismissed_at: new Date().toISOString() },
      { id, user_id: userId },
      accessToken,
    );
  }

  private async getOrCreateState(userId: string, accessToken?: string): Promise<NotificationState> {
    const client = this.getClient(accessToken);

    let { data, error } = await client
      .from('notification_state')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.logger.error(`Error fetching notification state: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch notification state');
    }

    if (!data) {
      // Create new state
      const { data: created, error: insertError } = await client
        .from('notification_state')
        .insert({ user_id: userId })
        .select()
        .single();

      if (insertError) {
        this.logger.error(`Error creating notification state: ${insertError.message}`);
        throw new InternalServerErrorException('Failed to create notification state');
      }

      data = created;
    }

    return data as NotificationState;
  }

  private async updateState(userId: string, accessToken?: string): Promise<void> {
    const client = this.getClient(accessToken);

    const { error } = await client
      .from('notification_state')
      .update({ last_evaluated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Error updating notification state: ${error.message}`);
    }
  }

  private async getUserPreferences(userId: string, accessToken?: string): Promise<UserPreferences> {
    const profiles = await this.dbService.select('user_profiles', { id: userId }, {}, accessToken);
    const profile = profiles?.[0];

    if (!profile || !profile.notification_preferences) {
      // Return default preferences
      return {
        budget_warning: true,
        budget_exceeded: true,
        payment_reminder: true,
        payment_reminder_days: 3,
        goal_deadline: true,
        goal_deadline_days: 7,
        card_payment_due: true,
        card_payment_due_days: 3,
        fixed_expense_due: true,
        fixed_expense_due_days: 2,
      };
    }

    return profile.notification_preferences as UserPreferences;
  }

  private async cleanupExpired(userId: string, accessToken?: string): Promise<void> {
    const client = this.getClient(accessToken);

    const { error } = await client
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    if (error) {
      this.logger.error(`Error cleaning up expired notifications: ${error.message}`);
    }
  }

  private mapToDto(notification: any): NotificationDto {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      icon: notification.icon,
      color: notification.color,
      priority: notification.priority,
      category: notification.category,
      metadata: notification.metadata,
      isRead: !!notification.read_at,
      readAt: notification.read_at,
      createdAt: notification.created_at,
      expiresAt: notification.expires_at,
    };
  }
}
