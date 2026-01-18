import { Controller, Get, Post, Put, Delete, Body, Query, Param, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('limit', new DefaultValuePipe(6), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    return await this.transactionsService.findAll(user.id, limit, offset, user.accessToken);
  }

  @Post()
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return await this.transactionsService.create(user.id, createTransactionDto, user.accessToken);
  }

  @Put(':id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return await this.transactionsService.update(user.id, id, updateTransactionDto, user.accessToken);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.transactionsService.delete(user.id, id, user.accessToken);
  }
}
