import { Injectable, Logger } from '@nestjs/common';
import { CreateCategoryBudgetDto } from './dto/create-category-budget.dto';
import { UpdateCategoryBudgetDto } from './dto/update-category-budget.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

export interface BudgetProgress {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded';
}

export interface BudgetSummary {
  total_budget: number;
  total_spent: number;
  budgets: BudgetProgress[];
}

interface ExpenseCategory {
  id: number;
  name: string;
  icon: string;
  icon_color: string;
}

@Injectable()
export class CategoryBudgetsService {
  private readonly logger = new Logger(CategoryBudgetsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(userId: string, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select('category_budgets', { user_id: userId }, {}, accessToken);
    } catch (error) {
      this.logger.error('Error al obtener presupuestos', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async getProgress(userId: string, accessToken?: string): Promise<BudgetSummary> {
    try {
      // Get user's budgets
      const budgets = await this.dbService.select('category_budgets', { user_id: userId }, {}, accessToken);

      if (!budgets || budgets.length === 0) {
        return { total_budget: 0, total_spent: 0, budgets: [] };
      }

      // Get all categories to get names, icons, and colors
      const categories = (await this.dbService.select(
        'expense_categories',
        {},
        {},
        accessToken
      )) as ExpenseCategory[];
      const categoriesMap = new Map<number, ExpenseCategory>(categories.map((category) => [category.id, category]));

      // Get current month boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Get all user transactions for the current month
      const transactions = await this.dbService.select(
        'transactions',
        { user_id: userId },
        {},
        accessToken
      );

      // Filter transactions for current month and expenses only (amount < 0)
      const currentMonthExpenses = transactions.filter((t: any) => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= startOfMonth &&
               transactionDate <= endOfMonth &&
               t.amount < 0;
      });

      // Group expenses by category
      const spentByCategory = new Map<number, number>();
      for (const expense of currentMonthExpenses) {
        const categoryId = expense.category_id;
        const amount = Math.abs(expense.amount); // Convert to positive for comparison
        spentByCategory.set(categoryId, (spentByCategory.get(categoryId) || 0) + amount);
      }

      // Build progress for each budget
      const budgetProgressList: BudgetProgress[] = budgets.map((budget: any) => {
        const category = categoriesMap.get(budget.category_id);
        const spentAmount = spentByCategory.get(budget.category_id) || 0;
        const budgetAmount = parseFloat(budget.budget_amount);
        const remainingAmount = budgetAmount - spentAmount;
        const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;

        let status: 'safe' | 'warning' | 'exceeded';
        if (percentage >= 100) {
          status = 'exceeded';
        } else if (percentage >= 80) {
          status = 'warning';
        } else {
          status = 'safe';
        }

        return {
          id: budget.id,
          category_id: budget.category_id,
          category_name: category?.name || 'Categoría desconocida',
          category_icon: category?.icon || 'help-circle',
          category_color: category?.icon_color || '#6B7280',
          budget_amount: budgetAmount,
          spent_amount: spentAmount,
          remaining_amount: remainingAmount,
          percentage: Math.round(percentage * 100) / 100,
          status,
        };
      });

      // Calculate totals
      const totalBudget = budgetProgressList.reduce((sum, b) => sum + b.budget_amount, 0);
      const totalSpent = budgetProgressList.reduce((sum, b) => sum + b.spent_amount, 0);

      return {
        total_budget: totalBudget,
        total_spent: totalSpent,
        budgets: budgetProgressList,
      };
    } catch (error) {
      this.logger.error('Error al obtener progreso de presupuestos', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(userId: string, createDto: CreateCategoryBudgetDto, accessToken?: string): Promise<any> {
    try {
      const payload = {
        ...createDto,
        user_id: userId,
      };
      return await this.dbService.insert('category_budgets', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear presupuesto', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(
    userId: string,
    id: number,
    updateDto: UpdateCategoryBudgetDto,
    accessToken?: string,
  ): Promise<any> {
    try {
      return await this.dbService.update(
        'category_budgets',
        updateDto,
        { id, user_id: userId },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al actualizar presupuesto', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(userId: string, id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('category_budgets', { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar presupuesto', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
