export interface NotificationDto {
  id: number;
  type: string;
  title: string;
  message: string;
  icon: string | null;
  color: string | null;
  priority: string;
  category: string | null;
  metadata: Record<string, any>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface NotificationsResponse {
  notifications: NotificationDto[];
  unreadCount: number;
  totalCount: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}
