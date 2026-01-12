// src/transactions/transactions.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Query, Param, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Endpoint para listar transacciones (requiere un parámetro userId en la query)
  @Get()
  async findAll(
    @Query('userId', ParseIntPipe) userId: number,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto
  ) {
    return await this.transactionsService.update(id, updateTransactionDto);
  }

  // Endpoint para eliminar una transacción (por id)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.transactionsService.delete(id);
  }
}
