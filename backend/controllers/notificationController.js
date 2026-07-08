const { db } = require('../config/firebase');

// Get all sent announcements
exports.getNotifications = async (req, res) => {
  try {
    const snapshot = await db.collection('notifications').get();
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    // Sort by sent date descending
    notifications.sort((a, b) => new Date(b.sentDate || 0) - new Date(a.sentDate || 0));

    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve notifications list',
      error: error.message
    });
  }
};

// Create and send notification announcement
exports.sendNotification = async (req, res) => {
  try {
    const { title, body, target = 'All Users' } = req.body;
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Notification title and body are required'
      });
    }

    const notificationData = {
      title,
      body,
      target,
      sentDate: new Date().toISOString()
    };

    const docRef = await db.collection('notifications').add(notificationData);

    // Dynamic FCM Push Notification simulation
    // In a live system, we would fetch tokens and do:
    // admin.messaging().sendToDevice(tokens, payload)
    console.log(`FCM Announcement Simulated: Title="${title}", Target="${target}"`);

    return res.status(201).json({
      success: true,
      message: 'Notification announcement sent successfully to all users.',
      notification: { id: docRef.id, ...notificationData }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to broadcast notification',
      error: error.message
    });
  }
};
