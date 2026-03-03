import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  private readonly logger = new Logger(ExpenseCategoriesService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select(
        'expense_categories',
        {},
        { orderBy: 'name', order: 'asc' },
        accessToken,
      );
    } catch (error) {
      this.logger.error('Error al obtener categorias', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(createExpenseCategoryDto: CreateExpenseCategoryDto, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.insert('expense_categories', createExpenseCategoryDto, accessToken);
    } catch (error) {
      this.logger.error('Error al crear categoria', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.update('expense_categories', updateExpenseCategoryDto, { id }, accessToken);
    } catch (error) {
      this.logger.error('Error al actualizar categoria', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('expense_categories', { id }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar categoria', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
