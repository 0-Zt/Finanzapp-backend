import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CreateUpcomingPaymentDto } from './dto/create-upcoming-payment.dto';
import { UpdateUpcomingPaymentDto } from './dto/update-upcoming-payment.dto';
import { UpcomingPaymentsService } from './upcoming-payments.service';

@ApiTags('upcoming-payments')
@ApiBearerAuth()
@Controller('upcoming-payments')
@UseGuards(AuthGuard)
export class UpcomingPaymentsController {
  constructor(private readonly upcomingPaymentsService: UpcomingPaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar pagos próximos' })
  @ApiResponse({ status: 200, description: 'Lista de pagos próximos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(@CurrentUser() user: CurrentUserData) {
    return await this.upcomingPaymentsService.findAll(user.id, user.accessToken);
  }

  @Post()
  @ApiOperation({ summary: 'Crear pago próximo' })
  @ApiBody({ type: CreateUpcomingPaymentDto })
  @ApiResponse({ status: 201, description: 'Pago próximo creado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(@CurrentUser() user: CurrentUserData, @Body() createUpcomingPaymentDto: CreateUpcomingPaymentDto) {
    return await this.upcomingPaymentsService.create(user.id, createUpcomingPaymentDto, user.accessToken);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar pago próximo' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateUpcomingPaymentDto })
  @ApiResponse({ status: 200, description: 'Pago próximo actualizado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUpcomingPaymentDto: UpdateUpcomingPaymentDto,
  ) {
    return await this.upcomingPaymentsService.update(user.id, id, updateUpcomingPaymentDto, user.accessToken);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar pago próximo' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'Pago próximo eliminado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async delete(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.upcomingPaymentsService.delete(user.id, id, user.accessToken);
  }
}
