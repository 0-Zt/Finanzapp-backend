// src/transactions/transactions.service.ts
import { Injectable } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateTransactionDto } from './DTO/create-transaction.dto';
import { UpdateTransactionDto } from './DTO/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly dbService: DbPostgresqlService) {}

  // Listar todas las transacciones para un usuario
  async findAll(userId: number, limit: number = 6, offset: number = 0): Promise<any> {
    return await this.dbService.select(
      'transactions',
      { user_id: userId },
      { orderBy: 'transaction_date', order: 'desc', limit, offset }
    );
  }

  // Agregar una nueva transacción
  async create(createTransactionDto: CreateTransactionDto): Promise<any> {
    return await this.dbService.insert('transactions', createTransactionDto);
  }

  // Actualizar una transacción (por ejemplo, por id)
  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<any> {
    return await this.dbService.update('transactions', updateTransactionDto, { id });
  }

  // Eliminar una transacción (por ejemplo, por id)
  async delete(id: number): Promise<any> {
    return await this.dbService.delete('transactions', { id });
  }
}
