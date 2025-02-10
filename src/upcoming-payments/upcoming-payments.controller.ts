// src/upcoming-payments/upcoming-payments.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { UpcomingPaymentsService } from './upcoming-payments.service';
import { CreateUpcomingPaymentDto } from './dto/create-upcoming-payment.dto';
import { UpdateUpcomingPaymentDto } from './dto/update-upcoming-payment.dto';

@Controller('upcoming-payments')
export class UpcomingPaymentsController {
  constructor(private readonly upcomingPaymentsService: UpcomingPaymentsService) {}

  // Listar pagos próximos para un usuario (usando userId en query)
  @Get()
  async findAll(@Query('userId') userId: number) {
    return await this.upcomingPaymentsService.findAll(userId);
  }

  // Crear un nuevo pago próximo
  @Post()
  async create(@Body() createUpcomingPaymentDto: CreateUpcomingPaymentDto) {
    return await this.upcomingPaymentsService.create(createUpcomingPaymentDto);
  }

  // Actualizar un pago próximo (por id)
  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUpcomingPaymentDto: UpdateUpcomingPaymentDto,
  ) {
    return await this.upcomingPaymentsService.update(id, updateUpcomingPaymentDto);
  }

  // Eliminar un pago próximo (por id)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.upcomingPaymentsService.delete(id);
  }
}
