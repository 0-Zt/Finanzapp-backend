export interface NotificationPayload {
  type: string;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  dedupe_key: string;
  metadata?: Record<string, any>;
  expires_at?: Date;
}

export interface NotificationEvaluator {
  evaluate(
    userId: string,
    accessToken?: string,
    preferences?: Record<string, any>,
  ): Promise<NotificationPayload[]>;
}

export interface UserPreferences {
  budget_warning?: boolean;
  budget_exceeded?: boolean;
  payment_reminder?: boolean;
  payment_reminder_days?: number;
  goal_deadline?: boolean;
  goal_deadline_days?: number;
  card_payment_due?: boolean;
  card_payment_due_days?: number;
  fixed_expense_due?: boolean;
  fixed_expense_due_days?: number;
}
