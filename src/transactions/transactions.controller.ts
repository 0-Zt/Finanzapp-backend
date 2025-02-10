// src/transactions/transactions.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Endpoint para listar transacciones (requiere un parámetro userId en la query)
  @Get()
  async findAll(
    @Query('userId') userId: number,
    @Query('limit') limit: number = 6,
    @Query('offset') offset: number = 0,
  ) {
    return await this.transactionsService.findAll(userId, limit, offset);
  }

  // Endpoint para agregar una transacción
  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return await this.transactionsService.create(createTransactionDto);
  }

  // Endpoint para actualizar una transacción (por id)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return await this.transactionsService.update(id, updateTransactionDto);
  }

  // Endpoint para eliminar una transacción (por id)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.transactionsService.delete(id);
  }
}
