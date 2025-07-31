import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const messaging = getMessaging();

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const { httpMethod, path } = event;
    const segments = path.split('/').filter(Boolean);
    const action = segments[segments.length - 1];

    switch (httpMethod) {
      case 'POST':
        if (action === 'send') {
          return await sendNotification(event);
        } else if (action === 'subscribe') {
          return await subscribeToNotifications(event);
        } else if (action === 'unsubscribe') {
          return await unsubscribeFromNotifications(event);
        } else if (action === 'bulk') {
          return await sendBulkNotifications(event);
        }
        break;

      case 'GET':
        if (action === 'history') {
          return await getNotificationHistory(event);
        } else if (action === 'stats') {
          return await getNotificationStats(event);
        }
        break;

      default:
        return {
          statusCode: 405,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Endpoint not found' }),
    };
  } catch (error) {
    console.error('Notifications error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Send single notification
async function sendNotification(event) {
  try {
    const { token, title, body, data, imageUrl, actionUrl } = JSON.parse(event.body);

    if (!token || !title || !body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields: token, title, body' }),
      };
    }

    const message = {
      token,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl })
      },
      data: {
        ...data,
        ...(actionUrl && { actionUrl }),
        timestamp: new Date().toISOString()
      },
      webpush: {
        fcmOptions: {
          link: actionUrl || '/'
        },
        notification: {
          title,
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          ...(imageUrl && { image: imageUrl }),
          requireInteraction: true,
          actions: [
            {
              action: 'view',
              title: 'عرض',
              icon: '/icon-192x192.png'
            },
            {
              action: 'dismiss',
              title: 'إغلاق',
              icon: '/icon-192x192.png'
            }
          ]
        }
      }
    };

    const response = await messaging.send(message);

    // Save notification to history
    await db.collection('notifications').add({
      token,
      title,
      body,
      data: data || {},
      imageUrl: imageUrl || null,
      actionUrl: actionUrl || null,
      messageId: response,
      status: 'sent',
      createdAt: new Date(),
      type: 'single'
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        messageId: response,
        message: 'Notification sent successfully'
      }),
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Subscribe user to notifications
async function subscribeToNotifications(event) {
  try {
    const { token, userId, topics = [] } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Token is required' }),
      };
    }

    // Save subscription
    const subscriptionData = {
      token,
      userId: userId || null,
      topics,
      subscribedAt: new Date(),
      isActive: true,
      deviceInfo: {
        userAgent: event.headers['user-agent'] || '',
        ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || ''
      }
    };

    await db.collection('notificationSubscriptions').doc(token).set(subscriptionData);

    // Subscribe to topics
    if (topics.length > 0) {
      await messaging.subscribeToTopic(token, topics);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Successfully subscribed to notifications'
      }),
    };
  } catch (error) {
    console.error('Subscribe error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Unsubscribe user from notifications
async function unsubscribeFromNotifications(event) {
  try {
    const { token, topics = [] } = JSON.parse(event.body);

    if (!token) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Token is required' }),
      };
    }

    // Update subscription status
    await db.collection('notificationSubscriptions').doc(token).update({
      isActive: false,
      unsubscribedAt: new Date()
    });

    // Unsubscribe from topics
    if (topics.length > 0) {
      await messaging.unsubscribeFromTopic(token, topics);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        message: 'Successfully unsubscribed from notifications'
      }),
    };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Send bulk notifications
async function sendBulkNotifications(event) {
  try {
    const { tokens, title, body, data, imageUrl, actionUrl, topic } = JSON.parse(event.body);

    if ((!tokens || tokens.length === 0) && !topic) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Either tokens array or topic is required' }),
      };
    }

    if (!title || !body) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Title and body are required' }),
      };
    }

    let response;

    if (topic) {
      // Send to topic
      const message = {
        topic,
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl })
        },
        data: {
          ...data,
          ...(actionUrl && { actionUrl }),
          timestamp: new Date().toISOString()
        },
        webpush: {
          fcmOptions: {
            link: actionUrl || '/'
          }
        }
      };

      response = await messaging.send(message);
    } else {
      // Send to multiple tokens
      const message = {
        tokens,
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl })
        },
        data: {
          ...data,
          ...(actionUrl && { actionUrl }),
          timestamp: new Date().toISOString()
        },
        webpush: {
          fcmOptions: {
            link: actionUrl || '/'
          }
        }
      };

      response = await messaging.sendMulticast(message);
    }

    // Save bulk notification to history
    await db.collection('notifications').add({
      tokens: tokens || [],
      topic: topic || null,
      title,
      body,
      data: data || {},
      imageUrl: imageUrl || null,
      actionUrl: actionUrl || null,
      response,
      status: 'sent',
      createdAt: new Date(),
      type: 'bulk'
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        response,
        message: 'Bulk notifications sent successfully'
      }),
    };
  } catch (error) {
    console.error('Bulk notification error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Get notification history
async function getNotificationHistory(event) {
  try {
    const { queryStringParameters } = event;
    const limit = parseInt(queryStringParameters?.limit) || 50;
    const offset = parseInt(queryStringParameters?.offset) || 0;
    const type = queryStringParameters?.type; // 'single' | 'bulk'

    let query = db.collection('notifications')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.get();
    const notifications = [];

    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt
      });
    });

    // Get total count
    const totalSnapshot = await db.collection('notifications').get();
    const total = totalSnapshot.size;

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        notifications,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }),
    };
  } catch (error) {
    console.error('Get notification history error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
}

// Get notification statistics
async function getNotificationStats(event) {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get notifications from last 30 days
    const notificationsSnapshot = await db.collection('notifications')
      .where('createdAt', '>=', thirtyDaysAgo)
      .get();

    // Get active subscriptions
    const subscriptionsSnapshot = await db.collection('notificationSubscriptions')
      .where('isActive', '==', true)
      .get();

    const stats = {
      totalNotificationsSent: notificationsSnapshot.size,
      activeSubscriptions: subscriptionsSnapshot.size,
      notificationsByType: {
        single: 0,
        bulk: 0
      },
      dailyStats: {}
    };

    // Process notifications data
    notificationsSnapshot.forEach(doc => {
      const data = doc.data();
      const type = data.type || 'single';
      stats.notificationsByType[type]++;

      // Daily stats
      const date = data.createdAt?.toDate?.()?.toISOString().split('T')[0] || 
                   new Date(data.createdAt).toISOString().split('T')[0];
      
      if (!stats.dailyStats[date]) {
        stats.dailyStats[date] = 0;
      }
      stats.dailyStats[date]++;
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(stats),
    };
  } catch (error) {
    console.error('Get notification stats error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message }),
    };
  }
} 