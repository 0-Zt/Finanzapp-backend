// src/upcoming-payments/upcoming-payments.service.ts
import { Injectable } from '@nestjs/common';
import { CreateUpcomingPaymentDto } from './dto/create-upcoming-payment.dto';
import { UpdateUpcomingPaymentDto } from './dto/update-upcoming-payment.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class UpcomingPaymentsService {
  constructor(private readonly dbService: DbPostgresqlService) {}

  // Listar pagos próximos de un usuario
  async findAll(userId: number): Promise<any> {
    return await this.dbService.select('upcoming_payments', { user_id: userId });
  }

  // Crear un pago próximo
  async create(createUpcomingPaymentDto: CreateUpcomingPaymentDto): Promise<any> {
    return await this.dbService.insert('upcoming_payments', createUpcomingPaymentDto);
  }

  // Actualizar un pago próximo (por id)
  async update(id: number, updateUpcomingPaymentDto: UpdateUpcomingPaymentDto): Promise<any> {
    return await this.dbService.update('upcoming_payments', updateUpcomingPaymentDto, { id });
  }

  // Eliminar un pago próximo (por id)
  async delete(id: number): Promise<any> {
    return await this.dbService.delete('upcoming_payments', { id });
  }
}
