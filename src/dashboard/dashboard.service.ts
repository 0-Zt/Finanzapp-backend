import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { UserProfileService, UserProfile, FixedExpense } from '../user-profile/user-profile.service';

export interface DashboardResponse {
  transactions: any[];
  categories: any[];
  upcomingPayments: any[];
  financialGoals: any[];
  userProfile: UserProfile | null;
  fixedExpenses: FixedExpense[];
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly dbService: DbPostgresqlService,
    private readonly userProfileService: UserProfileService,
  ) {}

  async getDashboard(userId: string, limit: number = 6, accessToken?: string): Promise<DashboardResponse> {
    try {
      const [transactions, categories, upcomingPayments, financialGoals, userProfile, fixedExpenses] = await Promise.all([
        this.dbService.select(
          'transactions',
          { user_id: userId },
          { orderBy: 'transaction_date', order: 'desc', limit },
          accessToken
        ),
        this.dbService.select('expense_categories', {}, {}, accessToken),
        this.dbService.select('upcoming_payments', { user_id: userId }, {}, accessToken),
        this.dbService.select('financial_goals', { user_id: userId }, {}, accessToken),
        this.userProfileService.getProfile(userId, undefined, undefined, accessToken).catch(() => null),
        this.userProfileService.getFixedExpenses(userId, accessToken).catch(() => []),
      ]);

      return { transactions, categories, upcomingPayments, financialGoals, userProfile, fixedExpenses };
    } catch (error) {
      this.logger.error('Error al cargar el dashboard', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
