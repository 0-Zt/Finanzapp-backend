import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UpcomingPaymentsService } from './upcoming-payments.service';
import { CreateUpcomingPaymentDto } from './dto/create-upcoming-payment.dto';
import { UpdateUpcomingPaymentDto } from './dto/update-upcoming-payment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('upcoming-payments')
@UseGuards(AuthGuard)
export class UpcomingPaymentsController {
  constructor(private readonly upcomingPaymentsService: UpcomingPaymentsService) {}

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData) {
    return await this.upcomingPaymentsService.findAll(user.id, user.accessToken);
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createUpcomingPaymentDto: CreateUpcomingPaymentDto,
  ) {
    return await this.upcomingPaymentsService.create(user.id, createUpcomingPaymentDto, user.accessToken);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUpcomingPaymentDto: UpdateUpcomingPaymentDto,
  ) {
    return await this.upcomingPaymentsService.update(user.id, id, updateUpcomingPaymentDto, user.accessToken);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.upcomingPaymentsService.delete(user.id, id, user.accessToken);
  }
}
