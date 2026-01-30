import { Injectable, Logger } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { UserProfileService, FixedExpense } from '../user-profile/user-profile.service';

dotenv.config();

interface MonthlyAutomationState {
  id: number;
  user_id: string;
  processed_month: string;
  transactions_created: boolean;
  budgets_copied: boolean;
  upcoming_payments_created: boolean;
}

@Injectable()
export class MonthlyAutomationService {
  private readonly logger = new Logger(MonthlyAutomationService.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;

  constructor(private readonly userProfileService: UserProfileService) {
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

  /**
   * Main entry point: checks if automations need to run for the current month
   * and executes any pending ones. Non-blocking — catches all errors.
   */
  async runIfNeeded(userId: string, accessToken?: string): Promise<void> {
    try {
      // 1. Get user timezone
      const timezone = await this.getUserTimezone(userId, accessToken);

      // 2. Calculate current month in user's timezone
      const currentMonth = this.getCurrentMonth(timezone);

      // 3. Get or create automation state for this month
      const state = await this.getOrCreateState(userId, currentMonth, accessToken);

      // 4. If all automations are done, return immediately
      if (state.transactions_created && state.budgets_copied && state.upcoming_payments_created) {
        return;
      }

      // 5. Get fixed expenses once (shared by automations 1 and 3)
      const fixedExpenses = await this.userProfileService.getFixedExpenses(userId, accessToken);
      const activeExpenses = fixedExpenses.filter((e) => e.is_active);

      // 6. Run pending automations
      const client = this.getClient(accessToken);

      if (!state.transactions_created) {
        await this.createTransactionsFromFixedExpenses(client, userId, activeExpenses, currentMonth);
        await this.updateStateFlag(client, userId, currentMonth, 'transactions_created');
      }

      if (!state.budgets_copied) {
        await this.copyBudgetsToCurrentMonth(client, userId, currentMonth);
        await this.updateStateFlag(client, userId, currentMonth, 'budgets_copied');
      }

      if (!state.upcoming_payments_created) {
        await this.createUpcomingPaymentsFromFixedExpenses(client, userId, activeExpenses, currentMonth);
        await this.updateStateFlag(client, userId, currentMonth, 'upcoming_payments_created');
      }

      this.logger.log(`Monthly automations completed for user ${userId}, month ${currentMonth}`);
    } catch (error) {
      // Never block the dashboard — log and swallow
      this.logger.error(
        `Error running monthly automations for user ${userId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  // ─── State management ───────────────────────────────────────────

  private async getOrCreateState(
    userId: string,
    currentMonth: string,
    accessToken?: string,
  ): Promise<MonthlyAutomationState> {
    const client = this.getClient(accessToken);

    // Try to fetch existing state
    const { data, error } = await client
      .from('monthly_automation_state')
      .select('*')
      .eq('user_id', userId)
      .eq('processed_month', currentMonth)
      .maybeSingle();

    if (error) {
      this.logger.error(`Error fetching automation state: ${error.message}`);
      throw error;
    }

    if (data) {
      return data as MonthlyAutomationState;
    }

    // Create new state — ignoreDuplicates handles concurrent requests
    const { data: created, error: insertError } = await client
      .from('monthly_automation_state')
      .upsert(
        {
          user_id: userId,
          processed_month: currentMonth,
          transactions_created: false,
          budgets_copied: false,
          upcoming_payments_created: false,
        },
        { onConflict: 'user_id,processed_month', ignoreDuplicates: true },
      )
      .select()
      .single();

    if (insertError) {
      this.logger.error(`Error creating automation state: ${insertError.message}`);
      throw insertError;
    }

    return created as MonthlyAutomationState;
  }

  private async updateStateFlag(
    client: SupabaseClient,
    userId: string,
    currentMonth: string,
    flag: 'transactions_created' | 'budgets_copied' | 'upcoming_payments_created',
  ): Promise<void> {
    const { error } = await client
      .from('monthly_automation_state')
      .update({ [flag]: true })
      .eq('user_id', userId)
      .eq('processed_month', currentMonth);

    if (error) {
      this.logger.error(`Error updating state flag ${flag}: ${error.message}`);
    }
  }

  // ─── Automation 1: Fixed expenses → Transactions ────────────────

  private async createTransactionsFromFixedExpenses(
    client: SupabaseClient,
    userId: string,
    activeExpenses: FixedExpense[],
    currentMonth: string,
  ): Promise<void> {
    if (activeExpenses.length === 0) return;

    const { monthStart, monthEnd } = this.getMonthRange(currentMonth);

    for (const expense of activeExpenses) {
      try {
        // Dedupe: check if transaction already exists for this expense this month
        const { data: existing } = await client
          .from('transactions')
          .select('id')
          .eq('user_id', userId)
          .eq('description', expense.description)
          .eq('amount', -Math.abs(expense.amount))
          .gte('transaction_date', monthStart)
          .lte('transaction_date', monthEnd)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const transactionDate = this.computeTransactionDate(currentMonth, expense.due_day);

        await client.from('transactions').insert({
          user_id: userId,
          description: expense.description,
          amount: -Math.abs(expense.amount),
          category_id: expense.category_id,
          transaction_date: transactionDate,
          status: 'pending',
        });
      } catch (err) {
        this.logger.error(
          `Error creating transaction from fixed expense ${expense.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  // ─── Automation 2: Copy budgets from previous month ─────────────

  private async copyBudgetsToCurrentMonth(
    client: SupabaseClient,
    userId: string,
    currentMonth: string,
  ): Promise<void> {
    // Check if budgets already exist for the current month
    const { data: existingBudgets } = await client
      .from('category_budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('budget_month', currentMonth)
      .limit(1);

    if (existingBudgets && existingBudgets.length > 0) return;

    // Fetch budgets from the previous month
    const previousMonth = this.getPreviousMonth(currentMonth);

    const { data: prevBudgets, error } = await client
      .from('category_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('budget_month', previousMonth);

    if (error) {
      this.logger.error(`Error fetching previous month budgets: ${error.message}`);
      return;
    }

    if (!prevBudgets || prevBudgets.length === 0) return;

    // Insert copies with current month
    const newBudgets = prevBudgets.map((budget) => ({
      user_id: userId,
      category_id: budget.category_id,
      budget_amount: budget.budget_amount,
      budget_month: currentMonth,
      rollover_enabled: budget.rollover_enabled,
    }));

    const { error: insertError } = await client
      .from('category_budgets')
      .upsert(newBudgets, {
        onConflict: 'user_id,category_id,budget_month',
        ignoreDuplicates: true,
      });

    if (insertError) {
      this.logger.error(`Error copying budgets: ${insertError.message}`);
    }
  }

  // ─── Automation 3: Fixed expenses → Upcoming payments ───────────

  private async createUpcomingPaymentsFromFixedExpenses(
    client: SupabaseClient,
    userId: string,
    activeExpenses: FixedExpense[],
    currentMonth: string,
  ): Promise<void> {
    if (activeExpenses.length === 0) return;

    const { monthStart, monthEnd } = this.getMonthRange(currentMonth);

    for (const expense of activeExpenses) {
      try {
        // Dedupe: check if upcoming payment already exists for this expense this month
        const { data: existing } = await client
          .from('upcoming_payments')
          .select('id')
          .eq('user_id', userId)
          .eq('description', expense.description)
          .eq('amount', expense.amount)
          .gte('payment_date', monthStart)
          .lte('payment_date', monthEnd)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const paymentDate = this.computeTransactionDate(currentMonth, expense.due_day);

        await client.from('upcoming_payments').insert({
          user_id: userId,
          description: expense.description,
          amount: expense.amount,
          category_id: expense.category_id,
          payment_date: paymentDate,
          status: 'pending',
        });
      } catch (err) {
        this.logger.error(
          `Error creating upcoming payment from fixed expense ${expense.id}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
  }

  // ─── Utility methods ────────────────────────────────────────────

  private async getUserTimezone(userId: string, accessToken?: string): Promise<string> {
    try {
      const profile = await this.userProfileService.getProfile(userId, undefined, undefined, accessToken);
      return profile.timezone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  /**
   * Returns the first day of the current month in the user's timezone
   * as a "YYYY-MM-DD" string (always day 01).
   */
  private getCurrentMonth(timezone: string): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find((p) => p.type === 'year')!.value;
    const month = parts.find((p) => p.type === 'month')!.value;

    return `${year}-${month}-01`;
  }

  /**
   * Returns the first day of the previous month as "YYYY-MM-DD".
   */
  private getPreviousMonth(currentMonth: string): string {
    const date = new Date(currentMonth + 'T00:00:00Z');
    date.setUTCMonth(date.getUTCMonth() - 1);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  }

  /**
   * Returns { monthStart, monthEnd } date strings for the given month.
   */
  private getMonthRange(currentMonth: string): { monthStart: string; monthEnd: string } {
    const date = new Date(currentMonth + 'T00:00:00Z');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    const monthStart = currentMonth; // Already "YYYY-MM-01"
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const monthEnd = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    return { monthStart, monthEnd };
  }

  /**
   * Computes the transaction date for a given month and due_day,
   * clamping to the last day of the month (e.g. day 31 in February → 28/29).
   */
  private computeTransactionDate(currentMonth: string, dueDay: number): string {
    const date = new Date(currentMonth + 'T00:00:00Z');
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();

    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const clampedDay = Math.min(dueDay, lastDay);

    return `${year}-${String(month + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`;
  }
}
