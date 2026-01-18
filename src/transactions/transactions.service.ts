import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(userId: string, limit: number = 6, offset: number = 0, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select(
        'transactions',
        { user_id: userId },
        { orderBy: 'transaction_date', order: 'desc', limit, offset },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al obtener transacciones', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(userId: string, createTransactionDto: CreateTransactionDto, accessToken?: string): Promise<any> {
    try {
      const payload = {
        ...createTransactionDto,
        user_id: userId,
      };
      return await this.dbService.insert('transactions', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(
    userId: string,
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    accessToken?: string,
  ): Promise<any> {
    try {
      return await this.dbService.update('transactions', updateTransactionDto, { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al actualizar transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(userId: string, id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('transactions', { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
