// src/financial-goals/financial-goals.service.ts
import { Injectable } from '@nestjs/common';

import { CreateFinancialGoalDto } from './dto/create-financial-goal.dto';
import { UpdateFinancialGoalDto } from './dto/update-financial-goal.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class FinancialGoalsService {
  constructor(private readonly dbService: DbPostgresqlService) {}

  // Listar todas las metas financieras de un usuario
  async findAll(userId: number): Promise<any> {
    return await this.dbService.select('financial_goals', { user_id: userId });
  }

  // Crear una nueva meta financiera
  async create(createFinancialGoalDto: CreateFinancialGoalDto): Promise<any> {
    return await this.dbService.insert('financial_goals', createFinancialGoalDto);
  }

  // Actualizar una meta financiera (por id)
  async update(id: number, updateFinancialGoalDto: UpdateFinancialGoalDto): Promise<any> {
    return await this.dbService.update('financial_goals', updateFinancialGoalDto, { id });
  }

  // Eliminar una meta financiera (por id)
  async delete(id: number): Promise<any> {
    return await this.dbService.delete('financial_goals', { id });
  }
}
