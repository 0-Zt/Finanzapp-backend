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
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar transacciones (paginado)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Cantidad a retornar (default 6)', example: 6 })
  @ApiQuery({ name: 'offset', required: false, description: 'Offset (default 0)', example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de transacciones del usuario.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return await this.transactionsService.findAll(user.id, limit, offset, user.accessToken);
  }

  @Post()
  @ApiOperation({ summary: 'Crear transacción' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transacción creada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return await this.transactionsService.create(user.id, createTransactionDto, user.accessToken);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción', example: 123 })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({ status: 200, description: 'Transacción actualizada.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.update(user.id, id, updateTransactionDto, user.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar transacción' })
  @ApiParam({ name: 'id', description: 'ID de la transacción', example: 123 })
  @ApiResponse({ status: 200, description: 'Transacción eliminada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async delete(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.transactionsService.delete(user.id, id, user.accessToken);
  }
}
