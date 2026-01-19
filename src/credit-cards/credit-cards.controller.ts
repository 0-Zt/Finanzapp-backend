import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('credit-cards')
@UseGuards(AuthGuard)
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  // ==================== CREDIT CARDS ====================

  @Get()
  async findAllCards(@CurrentUser() user: CurrentUserData) {
    return await this.creditCardsService.findAllCards(user.id, user.accessToken);
  }

  @Get('summary')
  async getAllCardsSummary(@CurrentUser() user: CurrentUserData) {
    return await this.creditCardsService.getAllCardsSummary(user.id, user.accessToken);
  }

  @Get(':id')
  async findCardById(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.creditCardsService.findCardById(user.id, id, user.accessToken);
  }

  @Get(':id/summary')
  async getCardSummary(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.creditCardsService.getCardSummary(user.id, id, user.accessToken);
  }

  @Post()
  async createCard(
    @CurrentUser() user: CurrentUserData,
    @Body() createCardDto: CreateCreditCardDto,
  ) {
    return await this.creditCardsService.createCard(user.id, createCardDto, user.accessToken);
  }

  @Put(':id')
  async updateCard(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCreditCardDto,
  ) {
    return await this.creditCardsService.updateCard(user.id, id, updateCardDto, user.accessToken);
  }

  @Delete(':id')
  async deleteCard(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.creditCardsService.deleteCard(user.id, id, user.accessToken);
  }

  // ==================== CARD TRANSACTIONS ====================

  @Get(':cardId/transactions')
  async findCardTransactions(
    @CurrentUser() user: CurrentUserData,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return await this.creditCardsService.findAllTransactions(
      user.id,
      cardId,
      limit,
      offset,
      user.accessToken,
    );
  }

  @Post('transactions')
  async createTransaction(
    @CurrentUser() user: CurrentUserData,
    @Body() createTransactionDto: CreateCardTransactionDto,
  ) {
    return await this.creditCardsService.createTransaction(
      user.id,
      createTransactionDto,
      user.accessToken,
    );
  }

  @Put('transactions/:id')
  async updateTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateCardTransactionDto,
  ) {
    return await this.creditCardsService.updateTransaction(
      user.id,
      id,
      updateTransactionDto,
      user.accessToken,
    );
  }

  @Delete('transactions/:id')
  async deleteTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.creditCardsService.deleteTransaction(user.id, id, user.accessToken);
  }

  // ==================== CARD PAYMENTS ====================

  @Get(':cardId/payments')
  async findCardPayments(
    @CurrentUser() user: CurrentUserData,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return await this.creditCardsService.findAllPayments(
      user.id,
      cardId,
      limit,
      offset,
      user.accessToken,
    );
  }

  @Post('payments')
  async createPayment(
    @CurrentUser() user: CurrentUserData,
    @Body() createPaymentDto: CreateCardPaymentDto,
  ) {
    return await this.creditCardsService.createPayment(user.id, createPaymentDto, user.accessToken);
  }
}
