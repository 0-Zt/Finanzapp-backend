import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/current-user.decorator';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileService } from './user-profile.service';

@ApiTags('profile')
@ApiBearerAuth()
@Controller('profile')
@UseGuards(AuthGuard)
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener perfil' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return await this.userProfileService.getProfile(user.id, user.email, user.fullName, user.accessToken);
  }

  @Put()
  @ApiOperation({ summary: 'Actualizar perfil' })
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'Perfil actualizado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async updateProfile(@CurrentUser() user: CurrentUserData, @Body() dto: UpdateProfileDto) {
    return await this.userProfileService.updateProfile(user.id, dto, user.email, user.fullName, user.accessToken);
  }

  @Get('fixed-expenses')
  @ApiOperation({ summary: 'Listar gastos fijos' })
  @ApiResponse({ status: 200, description: 'Lista de gastos fijos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getFixedExpenses(@CurrentUser() user: CurrentUserData) {
    return await this.userProfileService.getFixedExpenses(user.id, user.accessToken);
  }

  @Post('fixed-expenses')
  @ApiOperation({ summary: 'Crear gasto fijo' })
  @ApiBody({ type: CreateFixedExpenseDto })
  @ApiResponse({ status: 201, description: 'Gasto fijo creado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async createFixedExpense(@CurrentUser() user: CurrentUserData, @Body() dto: CreateFixedExpenseDto) {
    return await this.userProfileService.createFixedExpense(user.id, dto, user.accessToken);
  }

  @Put('fixed-expenses/:id')
  @ApiOperation({ summary: 'Actualizar gasto fijo' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiBody({ type: UpdateFixedExpenseDto })
  @ApiResponse({ status: 200, description: 'Gasto fijo actualizado.' })
  @ApiResponse({ status: 400, description: 'Payload inválido.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async updateFixedExpense(
    @CurrentUser() user: CurrentUserData,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFixedExpenseDto,
  ) {
    return await this.userProfileService.updateFixedExpense(user.id, id, dto, user.accessToken);
  }

  @Delete('fixed-expenses/:id')
  @ApiOperation({ summary: 'Eliminar gasto fijo' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'Gasto fijo eliminado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async deleteFixedExpense(@CurrentUser() user: CurrentUserData, @Param('id', ParseIntPipe) id: number) {
    return await this.userProfileService.deleteFixedExpense(user.id, id, user.accessToken);
  }
}
