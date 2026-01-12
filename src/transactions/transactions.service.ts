// src/transactions/transactions.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  // Listar todas las transacciones para un usuario
  async findAll(userId: number, limit: number = 6, offset: number = 0): Promise<any> {
    try {
      return await this.dbService.select(
        'transactions',
        { user_id: userId },
        { orderBy: 'transaction_date', order: 'desc', limit, offset }
      );
    } catch (error) {
      this.logger.error('Error al obtener transacciones', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Agregar una nueva transacción
  async create(createTransactionDto: CreateTransactionDto): Promise<any> {
    try {
      return await this.dbService.insert('transactions', createTransactionDto);
    } catch (error) {
      this.logger.error('Error al crear transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Actualizar una transacción (por ejemplo, por id)
  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<any> {
    try {
      return await this.dbService.update('transactions', updateTransactionDto, { id });
    } catch (error) {
      this.logger.error('Error al actualizar transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Eliminar una transacción (por ejemplo, por id)
  async delete(id: number): Promise<any> {
    try {
      return await this.dbService.delete('transactions', { id });
    } catch (error) {
      this.logger.error('Error al eliminar transaccion', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
