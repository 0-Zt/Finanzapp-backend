import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

export interface DashboardResponse {
  transactions: any[];
  categories: any[];
  upcomingPayments: any[];
  financialGoals: any[];
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async getDashboard(userId: number, limit: number = 6): Promise<DashboardResponse> {
    try {
      const [transactions, categories, upcomingPayments, financialGoals] = await Promise.all([
        this.dbService.select(
          'transactions',
          { user_id: userId },
          { orderBy: 'transaction_date', order: 'desc', limit }
        ),
        this.dbService.select('expense_categories', {}),
        this.dbService.select('upcoming_payments', { user_id: userId }),
        this.dbService.select('financial_goals', { user_id: userId }),
      ]);

      return { transactions, categories, upcomingPayments, financialGoals };
    } catch (error) {
      this.logger.error('Error al cargar el dashboard', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
