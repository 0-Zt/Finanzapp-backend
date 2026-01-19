import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(accessToken?: string): Promise<any[]> {
    try {
      return await this.dbService.select('expense_categories', {}, { orderBy: 'name', order: 'asc' }, accessToken);
    } catch (error) {
      this.logger.error('Error al obtener categorias', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
