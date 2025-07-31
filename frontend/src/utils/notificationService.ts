import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
// @ts-ignore
import { app } from '../config/firebase.js';
import { API_ENDPOINTS } from '../config/api';

interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: Record<string, string>;
}

class NotificationService {
  private messaging: Messaging | null = null;
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      this.messaging = getMessaging(app);
      this.initializeServiceWorker();
    }
  }

  // Initialize service worker
  private async initializeServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Get FCM token
  async getToken(): Promise<string | null> {
    try {
      if (!this.messaging) return null;

      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;

      const token = await getToken(this.messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
      });

      this.token = token;
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Subscribe to notifications
  async subscribe(userId?: string, topics: string[] = []): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) return false;

      const response = await fetch(`${API_ENDPOINTS.notifications}/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userId,
          topics: ['general', 'orders', 'promotions', ...topics]
        })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      return false;
    }
  }

  // Unsubscribe from notifications
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.token) return false;

      const response = await fetch(`${API_ENDPOINTS.notifications}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
          topics: ['general', 'orders', 'promotions']
        })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      return false;
    }
  }

  // Listen for foreground messages
  onMessage(callback: (payload: NotificationPayload) => void) {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload: NotificationPayload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });
  }

  // Send notification (admin only)
  async sendNotification(data: {
    token?: string;
    tokens?: string[];
    topic?: string;
    title: string;
    body: string;
    imageUrl?: string;
    actionUrl?: string;
    data?: Record<string, any>;
  }): Promise<boolean> {
    try {
      const endpoint = data.tokens || data.topic ? 'bulk' : 'send';
      
      const response = await fetch(`${API_ENDPOINTS.notifications}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Get notification history (admin only)
  async getNotificationHistory(limit = 50, offset = 0, type?: 'single' | 'bulk') {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        ...(type && { type })
      });

      const response = await fetch(`${API_ENDPOINTS.notifications}/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting notification history:', error);
      return null;
    }
  }

  // Get notification statistics (admin only)
  async getNotificationStats() {
    try {
      const response = await fetch(`${API_ENDPOINTS.notifications}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return null;
    }
  }

  // Show local notification
  showLocalNotification(title: string, body: string, icon?: string, actionUrl?: string) {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: icon || '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'ghem-store',
        requireInteraction: true
      });

      notification.onclick = () => {
        if (actionUrl) {
          window.open(actionUrl, '_blank');
        }
        notification.close();
      };

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
  }

  // Predefined notification types
  async sendOrderNotification(orderId: string, status: string, customerToken?: string) {
    const statusMessages = {
      confirmed: 'تم تأكيد طلبك بنجاح',
      processing: 'جاري تحضير طلبك',
      shipped: 'تم شحن طلبك',
      delivered: 'تم تسليم طلبك',
      cancelled: 'تم إلغاء طلبك'
    };

    return await this.sendNotification({
      token: customerToken,
      topic: !customerToken ? 'orders' : undefined,
      title: 'تحديث حالة الطلب',
      body: statusMessages[status as keyof typeof statusMessages] || 'تم تحديث حالة طلبك',
      actionUrl: `/orders/${orderId}`,
      data: {
        type: 'order_update',
        orderId,
        status
      }
    });
  }

  async sendPromotionNotification(title: string, body: string, imageUrl?: string, productId?: string) {
    return await this.sendNotification({
      topic: 'promotions',
      title,
      body,
      imageUrl,
      actionUrl: productId ? `/product/${productId}` : '/products',
      data: {
        type: 'promotion',
        ...(productId && { productId })
      }
    });
  }

  async sendWelcomeNotification(customerToken: string, customerName: string) {
    return await this.sendNotification({
      token: customerToken,
      title: `مرحباً ${customerName}! 🎉`,
      body: 'نشكرك لانضمامك إلى متجر غيم. استمتع بتجربة تسوق رائعة!',
      actionUrl: '/products',
      data: {
        type: 'welcome'
      }
    });
  }
}

export const notificationService = new NotificationService();
export default NotificationService; 