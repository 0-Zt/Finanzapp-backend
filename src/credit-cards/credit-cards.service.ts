import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DbPostgresqlService } from 'src/shared/connection/db.postgresql.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';

@Injectable()
export class CreditCardsService {
  private readonly logger = new Logger(CreditCardsService.name);

  constructor(private readonly dbService: DbPostgresqlService) {}

  // ==================== CREDIT CARDS ====================

  async findAllCards(userId: string, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.select(
        'credit_cards',
        { user_id: userId },
        { orderBy: 'created_at', order: 'desc' },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al obtener tarjetas de crédito', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async findCardById(userId: string, cardId: number, accessToken?: string): Promise<any> {
    try {
      const result = await this.dbService.select(
        'credit_cards',
        { user_id: userId, id: cardId },
        {},
        accessToken
      );
      if (!result || result.length === 0) {
        throw new NotFoundException('Tarjeta de crédito no encontrada');
      }
      return result[0];
    } catch (error) {
      this.logger.error('Error al obtener tarjeta de crédito', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async createCard(userId: string, createCardDto: CreateCreditCardDto, accessToken?: string): Promise<any> {
    try {
      const payload = {
        ...createCardDto,
        user_id: userId,
      };
      return await this.dbService.insert('credit_cards', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear tarjeta de crédito', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async updateCard(
    userId: string,
    cardId: number,
    updateCardDto: UpdateCreditCardDto,
    accessToken?: string
  ): Promise<any> {
    try {
      return await this.dbService.update(
        'credit_cards',
        updateCardDto,
        { id: cardId, user_id: userId },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al actualizar tarjeta de crédito', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async deleteCard(userId: string, cardId: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete('credit_cards', { id: cardId, user_id: userId }, accessToken);
    } catch (error) {
      this.logger.error('Error al eliminar tarjeta de crédito', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // ==================== CARD TRANSACTIONS ====================

  async findAllTransactions(
    userId: string,
    cardId?: number,
    limit: number = 50,
    offset: number = 0,
    accessToken?: string
  ): Promise<any> {
    try {
      const filters: any = { user_id: userId };
      if (cardId) {
        filters.credit_card_id = cardId;
      }
      return await this.dbService.select(
        'credit_card_transactions',
        filters,
        { orderBy: 'transaction_date', order: 'desc', limit, offset },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al obtener transacciones de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async createTransaction(
    userId: string,
    createTransactionDto: CreateCardTransactionDto,
    accessToken?: string
  ): Promise<any> {
    try {
      // Si hay cuotas, calcular el monto por cuota
      let payload: any = {
        ...createTransactionDto,
        user_id: userId,
      };

      if (createTransactionDto.installments && createTransactionDto.installments > 1) {
        payload.installment_amount = createTransactionDto.amount / createTransactionDto.installments;
        payload.current_installment = 1;
      }

      return await this.dbService.insert('credit_card_transactions', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear transacción de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async updateTransaction(
    userId: string,
    transactionId: number,
    updateTransactionDto: UpdateCardTransactionDto,
    accessToken?: string
  ): Promise<any> {
    try {
      return await this.dbService.update(
        'credit_card_transactions',
        updateTransactionDto,
        { id: transactionId, user_id: userId },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al actualizar transacción de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async deleteTransaction(userId: string, transactionId: number, accessToken?: string): Promise<any> {
    try {
      return await this.dbService.delete(
        'credit_card_transactions',
        { id: transactionId, user_id: userId },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al eliminar transacción de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // ==================== CARD PAYMENTS ====================

  async findAllPayments(
    userId: string,
    cardId?: number,
    limit: number = 20,
    offset: number = 0,
    accessToken?: string
  ): Promise<any> {
    try {
      const filters: any = { user_id: userId };
      if (cardId) {
        filters.credit_card_id = cardId;
      }
      return await this.dbService.select(
        'credit_card_payments',
        filters,
        { orderBy: 'payment_date', order: 'desc', limit, offset },
        accessToken
      );
    } catch (error) {
      this.logger.error('Error al obtener pagos de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async createPayment(
    userId: string,
    createPaymentDto: CreateCardPaymentDto,
    accessToken?: string
  ): Promise<any> {
    try {
      const payload = {
        ...createPaymentDto,
        user_id: userId,
      };
      return await this.dbService.insert('credit_card_payments', payload, accessToken);
    } catch (error) {
      this.logger.error('Error al crear pago de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  // ==================== SUMMARY / STATS ====================

  async getCardSummary(userId: string, cardId: number, accessToken?: string): Promise<any> {
    try {
      const card = await this.findCardById(userId, cardId, accessToken);
      const transactions = await this.findAllTransactions(userId, cardId, 100, 0, accessToken);

      // Calcular estadísticas
      const totalSpent = transactions
        .filter((t: any) => t.amount > 0)
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const totalPayments = transactions
        .filter((t: any) => t.amount < 0)
        .reduce((sum: number, t: any) => sum + Math.abs(parseFloat(t.amount)), 0);

      const availableCredit = parseFloat(card.credit_limit) - parseFloat(card.current_balance);
      const utilizationPercentage = card.credit_limit > 0
        ? (parseFloat(card.current_balance) / parseFloat(card.credit_limit)) * 100
        : 0;

      return {
        card,
        summary: {
          current_balance: parseFloat(card.current_balance),
          credit_limit: parseFloat(card.credit_limit),
          available_credit: availableCredit,
          utilization_percentage: Math.round(utilizationPercentage * 100) / 100,
          total_spent_period: totalSpent,
          total_payments_period: totalPayments,
          transaction_count: transactions.length,
        },
        recent_transactions: transactions.slice(0, 10),
      };
    } catch (error) {
      this.logger.error('Error al obtener resumen de tarjeta', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }

  async getAllCardsSummary(userId: string, accessToken?: string): Promise<any> {
    try {
      const cards = await this.findAllCards(userId, accessToken);

      const summaries = await Promise.all(
        cards.map(async (card: any) => {
          const availableCredit = parseFloat(card.credit_limit) - parseFloat(card.current_balance);
          const utilizationPercentage = card.credit_limit > 0
            ? (parseFloat(card.current_balance) / parseFloat(card.credit_limit)) * 100
            : 0;

          return {
            ...card,
            available_credit: availableCredit,
            utilization_percentage: Math.round(utilizationPercentage * 100) / 100,
          };
        })
      );

      const totals = {
        total_balance: summaries.reduce((sum, c) => sum + parseFloat(c.current_balance), 0),
        total_limit: summaries.reduce((sum, c) => sum + parseFloat(c.credit_limit), 0),
        total_available: summaries.reduce((sum, c) => sum + c.available_credit, 0),
        card_count: cards.length,
      };

      return {
        cards: summaries,
        totals,
      };
    } catch (error) {
      this.logger.error('Error al obtener resumen de todas las tarjetas', error instanceof Error ? error.stack : undefined);
      throw error;
    }
  }
}
