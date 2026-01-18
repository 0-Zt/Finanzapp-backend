import { Injectable, Logger } from '@nestjs/common';
import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class FinancialGoalsService {
  private readonly logger = new Logger(FinancialGoalsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(userId: string, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select('financial_goals', { user_id: userId }, {}, accessToken);
    } catch (error) {
      this.logger.error('Error al obtener metas financieras', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(userId: string, createFinancialGoalDto: CreateFinancialGoalDto, accessToken?: string): Promise<any> {
    try {
      const payload = {
        ...createFinancialGoalDto,
        user_id: userId,
      };
      return await this.dbService.insert('financial_goals', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear meta financiera', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(
    userId: string,
    id: number,
    updateFinancialGoalDto: UpdateFinancialGoalDto,
    accessToken?: string,
  ): Promise<any> {
    try {
      return await this.dbService.update(
        'financial_goals',
        updateFinancialGoalDto,
        { id, user_id: userId },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al actualizar meta financiera', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(userId: string, id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('financial_goals', { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar meta financiera', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
