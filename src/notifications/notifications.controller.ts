import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { NotificationsResponse, UnreadCountResponse } from './dto/notification-response.dto';

interface UserPayload {
  id: string;
  email: string;
  accessToken: string;
}

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: UserPayload,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ): Promise<NotificationsResponse> {
    // 1. Evaluate and generate new notifications (on-demand)
    await this.notificationsService.evaluateNotifications(user.id, user.accessToken);

    // 2. Get paginated notifications
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
  async getUnreadCount(@CurrentUser() user: UserPayload): Promise<UnreadCountResponse> {
    // Quick evaluation before counting
    await this.notificationsService.evaluateNotifications(user.id, user.accessToken);
    return this.notificationsService.getUnreadCount(user.id, user.accessToken);
  }

  @Post(':id/read')
  async markAsRead(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.markAsRead(user.id, id, user.accessToken);
    return { success: true };
  }

  @Post('read-all')
  async markAllAsRead(@CurrentUser() user: UserPayload): Promise<{ success: boolean }> {
    await this.notificationsService.markAllAsRead(user.id, user.accessToken);
    return { success: true };
  }

  @Post(':id/dismiss')
  async dismiss(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ success: boolean }> {
    await this.notificationsService.dismiss(user.id, id, user.accessToken);
    return { success: true };
  }
}
