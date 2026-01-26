import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';
import { CreateCardTransactionDto } from './dto/create-card-transaction.dto';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCardTransactionDto } from './dto/update-card-transaction.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { CreditCardsService } from './credit-cards.service';

@ApiTags('credit-cards')
@ApiBearerAuth()
@Controller('credit-cards')
@UseGuards(AuthGuard)
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  // ==================== CREDIT CARDS ====================

  @Get()
  @ApiOperation({ summary: 'Listar tarjetas de crédito' })
  @ApiResponse({ status: 200, description: 'Lista de tarjetas.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAllCards(@CurrentUser() user: CurrentUserData) {
    return await this.creditCardsService.findAllCards(user.id, user.accessToken);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen global de tarjetas' })
  @ApiResponse({ status: 200, description: 'Resumen.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getAllCardsSummary(@CurrentUser() user: CurrentUserData) {
    return await this.creditCardsService.getAllCardsSummary(user.id, user.accessToken);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tarjeta por ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Tarjeta.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findCardById(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.creditCardsService.findCardById(user.id, id, user.accessToken);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Resumen de una tarjeta' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Resumen de tarjeta.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getCardSummary(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.creditCardsService.getCardSummary(user.id, id, user.accessToken);
  }

  @Post()
  @ApiOperation({ summary: 'Crear tarjeta' })
  @ApiBody({ type: CreateCreditCardDto })
  @ApiResponse({ status: 201, description: 'Tarjeta creada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async createCard(@CurrentUser() user: CurrentUserData, @Body() createCardDto: CreateCreditCardDto) {
    return await this.creditCardsService.createCard(user.id, createCardDto, user.accessToken);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar tarjeta' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateCreditCardDto })
  @ApiResponse({ status: 200, description: 'Tarjeta actualizada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async updateCard(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCardDto: UpdateCreditCardDto,
  ) {
    return await this.creditCardsService.updateCard(user.id, id, updateCardDto, user.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar tarjeta' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Tarjeta eliminada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async deleteCard(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.creditCardsService.deleteCard(user.id, id, user.accessToken);
  }

  // ==================== CARD TRANSACTIONS ====================

  @Get(':cardId/transactions')
  @ApiOperation({ summary: 'Listar transacciones de una tarjeta (paginado)' })
  @ApiParam({ name: 'cardId', example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de transacciones.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findCardTransactions(
    @CurrentUser() user: CurrentUserData,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return await this.creditCardsService.findAllTransactions(user.id, cardId, limit, offset, user.accessToken);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Crear transacción de tarjeta' })
  @ApiBody({ type: CreateCardTransactionDto })
  @ApiResponse({ status: 201, description: 'Transacción creada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async createTransaction(@CurrentUser() user: CurrentUserData, @Body() createTransactionDto: CreateCardTransactionDto) {
    return await this.creditCardsService.createTransaction(user.id, createTransactionDto, user.accessToken);
  }

  @Put('transactions/:id')
  @ApiOperation({ summary: 'Actualizar transacción de tarjeta' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateCardTransactionDto })
  @ApiResponse({ status: 200, description: 'Transacción actualizada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async updateTransaction(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateCardTransactionDto,
  ) {
    return await this.creditCardsService.updateTransaction(user.id, id, updateTransactionDto, user.accessToken);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Eliminar transacción de tarjeta' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'Transacción eliminada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async deleteTransaction(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.creditCardsService.deleteTransaction(user.id, id, user.accessToken);
  }

  // ==================== CARD PAYMENTS ====================

  @Get(':cardId/payments')
  @ApiOperation({ summary: 'Listar pagos de una tarjeta (paginado)' })
  @ApiParam({ name: 'cardId', example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de pagos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findCardPayments(
    @CurrentUser() user: CurrentUserData,
    @Param('cardId', ParseIntPipe) cardId: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return await this.creditCardsService.findAllPayments(user.id, cardId, limit, offset, user.accessToken);
  }

  @Post('payments')
  @ApiOperation({ summary: 'Crear pago de tarjeta' })
  @ApiBody({ type: CreateCardPaymentDto })
  @ApiResponse({ status: 201, description: 'Pago creado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async createPayment(@CurrentUser() user: CurrentUserData, @Body() createPaymentDto: CreateCardPaymentDto) {
    return await this.creditCardsService.createPayment(user.id, createPaymentDto, user.accessToken);
  }
}
