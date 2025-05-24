import { api } from "./api";
import { NotificationPage } from "@/types/notification";

class NotificationService {
  async getNotifications(page = 0, size = 10, isRead?: boolean): Promise<NotificationPage> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }

    const response = await api.get<NotificationPage>(`/api/notifications?${params.toString()}`);
    return response.data;
  }

  async markAsRead(notificationId: number): Promise<void> {
    await api.put(`/api/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await api.put('/api/notifications/read-all');
  }
}

export const notificationService = new NotificationService(); 