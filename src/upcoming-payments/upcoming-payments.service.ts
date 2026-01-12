// src/upcoming-payments/upcoming-payments.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { CreateUpcomingPaymentDto } from './dto/create-upcoming-payment.dto';
import { UpdateUpcomingPaymentDto } from './dto/update-upcoming-payment.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class UpcomingPaymentsService {
  private readonly logger = new Logger(UpcomingPaymentsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  // Listar pagos próximos de un usuario
  async findAll(userId: number): Promise<any> {
    try {
      return await this.dbService.select('upcoming_payments', { user_id: userId });
    } catch (error) {
      this.logger.error('Error al obtener pagos proximos', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Crear un pago próximo
  async create(createUpcomingPaymentDto: CreateUpcomingPaymentDto): Promise<any> {
    try {
      return await this.dbService.insert('upcoming_payments', createUpcomingPaymentDto);
    } catch (error) {
      this.logger.error('Error al crear pago proximo', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Actualizar un pago próximo (por id)
  async update(id: number, updateUpcomingPaymentDto: UpdateUpcomingPaymentDto): Promise<any> {
    try {
      return await this.dbService.update('upcoming_payments', updateUpcomingPaymentDto, { id });
    } catch (error) {
      this.logger.error('Error al actualizar pago proximo', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // Eliminar un pago próximo (por id)
  async delete(id: number): Promise<any> {
    try {
      return await this.dbService.delete('upcoming_payments', { id });
    } catch (error) {
      this.logger.error('Error al eliminar pago proximo', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
