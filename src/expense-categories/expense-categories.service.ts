// src/expense-categories/expense-categories.service.ts
import { Injectable } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly dbService: DbPostgresqlService) {}

  // Devuelve todas las categorías; puedes agregar filtros si lo necesitas (por ejemplo, solo las por defecto)
  async findAll(): Promise<any> {
    // En este ejemplo se devuelven todas las categorías sin filtro.
    return await this.dbService.select('expense_categories', {});
  }

  // Crea una nueva categoría (útil para que un usuario agregue categorías personalizadas)
  async create(createExpenseCategoryDto: CreateExpenseCategoryDto): Promise<any> {
    return await this.dbService.insert('expense_categories', createExpenseCategoryDto);
  }

  // Actualiza una categoría existente
  async update(id: number, updateExpenseCategoryDto: UpdateExpenseCategoryDto): Promise<any> {
    return await this.dbService.update('expense_categories', updateExpenseCategoryDto, { id });
  }

  // Elimina una categoría existente (si fuera necesario)
  async delete(id: number): Promise<any> {
    return await this.dbService.delete('expense_categories', { id });
  }
}
