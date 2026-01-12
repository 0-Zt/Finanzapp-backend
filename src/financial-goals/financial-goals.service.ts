// src/financial-goals/financial-goals.service.ts
import { Injectable, Logger } from '@nestjs/common';

import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class FinancialGoalsService {
  private readonly logger = new Logger(FinancialGoalsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  // Listar todas las metas financieras de un usuario
  async findAll(userId: number): Promise<any> {
    try {
      return await this.dbService.select('financial_goals', { user_id: userId });
    } catch (error) {
      this.logger.error('Error al obtener metas financieras', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Crear una nueva meta financiera
  async create(createFinancialGoalDto: CreateFinancialGoalDto): Promise<any> {
    try {
      return await this.dbService.insert('financial_goals', createFinancialGoalDto);
    } catch (error) {
      this.logger.error('Error al crear meta financiera', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Actualizar una meta financiera (por id)
  async update(id: number, updateFinancialGoalDto: UpdateFinancialGoalDto): Promise<any> {
    try {
      return await this.dbService.update('financial_goals', updateFinancialGoalDto, { id });
    } catch (error) {
      this.logger.error('Error al actualizar meta financiera', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Eliminar una meta financiera (por id)
  async delete(id: number): Promise<any> {
    try {
      return await this.dbService.delete('financial_goals', { id });
    } catch (error) {
      this.logger.error('Error al eliminar meta financiera', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
