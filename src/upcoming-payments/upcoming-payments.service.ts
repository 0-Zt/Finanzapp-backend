import { Injectable, Logger } from '@nestjs/common';
import { CreateUpcomingPaymentDto } from './dto/create-upcoming-payment.dto';
import { UpdateUpcomingPaymentDto } from './dto/update-upcoming-payment.dto';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';

@Injectable()
export class UpcomingPaymentsService {
  private readonly logger = new Logger(UpcomingPaymentsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  async findAll(userId: string, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select('upcoming_payments', { user_id: userId }, {}, accessToken);
    } catch (error) {
      this.logger.error('Error al obtener pagos proximos', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async create(userId: string, createUpcomingPaymentDto: CreateUpcomingPaymentDto, accessToken?: string): Promise<any> {
    try {
      const payload = {
        ...createUpcomingPaymentDto,
        user_id: userId,
      };
      return await this.dbService.insert('upcoming_payments', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear pago proximo', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async update(
    userId: string,
    id: number,
    updateUpcomingPaymentDto: UpdateUpcomingPaymentDto,
    accessToken?: string,
  ): Promise<any> {
    try {
      return await this.dbService.update(
        'upcoming_payments',
        updateUpcomingPaymentDto,
        { id, user_id: userId },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al actualizar pago proximo', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async delete(userId: string, id: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('upcoming_payments', { id, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar pago proximo', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
