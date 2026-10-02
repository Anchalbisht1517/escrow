import Notification from '../models/Notification.js';

// ─── GET MY NOTIFICATIONS ───
// Returns the most recent 20 notifications for the logged-in user
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('sender', 'firstName lastName')
      .populate('project', 'title');

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved',
      data: { notifications, unreadCount },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── MARK ONE NOTIFICATION AS READ ───
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};

// ─── MARK ALL AS READ ───
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: null,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message, data: null });
  }
};
