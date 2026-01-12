// src/expense-categories/expense-categories.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  private readonly logger = new Logger(ExpenseCategoriesService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  // Devuelve todas las categorías; puedes agregar filtros si lo necesitas (por ejemplo, solo las por defecto)
  async findAll(): Promise<any> {
    // En este ejemplo se devuelven todas las categorías sin filtro.
    try {
      return await this.dbService.select('expense_categories', {});
    } catch (error) {
      this.logger.error('Error al obtener categorias', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Crea una nueva categoría (útil para que un usuario agregue categorías personalizadas)
  async create(createExpenseCategoryDto: CreateExpenseCategoryDto): Promise<any> {
    try {
      return await this.dbService.insert('expense_categories', createExpenseCategoryDto);
    } catch (error) {
      this.logger.error('Error al crear categoria', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Actualiza una categoría existente
  async update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto): Promise<any> {
    try {
      return await this.dbService.update('expense_categories', updateExpenseCategoryDto, { id });
    } catch (error) {
      this.logger.error('Error al actualizar categoria', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Elimina una categoría existente (si fuera necesario)
  async delete(id: number): Promise<any> {
    try {
      return await this.dbService.delete('expense_categories', { id });
    } catch (error) {
      this.logger.error('Error al eliminar categoria', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
