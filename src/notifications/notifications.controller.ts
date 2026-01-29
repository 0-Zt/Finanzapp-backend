import { Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsResponse, UnreadCountResponse } from './dto/notification-response.dto';
import { NotificationsService } from './notifications.service';

interface UserPayload {
  id: string;
  email: string;
  accessToken: string;
}

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones (paginado)' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'unreadOnly', required: false, description: 'true|false', example: 'false' })
  @ApiResponse({ status: 200, description: 'Notificaciones + unreadCount.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getNotifications(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<NotificationsResponse> {
    // 1) Evaluate and generate new notifications (on-demand)
    await this.notificationsService.evaluateNotifications(user.id, user.accessToken);

    // 2) Get paginated notifications
    return this.notificationsService.getNotifications(
      user.id,
      {
        limit: limit ? parseInt(limit, 10) : 20,
        offset: offset ? parseInt(offset, 10) : 0,
        unreadOnly: unreadOnly === 'true',
      },
      user.accessToken,
    );
  }

  @Get('count')
  @ApiOperation({ summary: 'Contador de no leídas' })
  @ApiResponse({ status: 200, description: 'unreadCount.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async getUnreadCount(@CurrentUser() user: UserPayload): Promise<UnreadCountResponse> {
    await this.notificationsService.evaluateNotifications(user.id, user.accessToken);
    return this.notificationsService.getUnreadCount(user.id, user.accessToken);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async markAsRead(@CurrentUser() user: UserPayload, @Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.notificationsService.markAsRead(user.id, id, user.accessToken);
    return { success: true };
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async markAllAsRead(@CurrentUser() user: UserPayload): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(user.id, user.accessToken);
    return { success: true };
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Descartar notificación' })
  @ApiParam({ name: 'id', example: 123 })
  @ApiResponse({ status: 200, description: 'OK' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async dismiss(@CurrentUser() user: UserPayload, @Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    await this.notificationsService.dismiss(user.id, id, user.accessToken);
    return { success: true };
  }
}
