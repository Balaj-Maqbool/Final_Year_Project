import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Notification } from "../models/notification.model.js";
import { ValidationHelper } from "../utils/validation.utils.js";

const getUserNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type } = req.query;

    const matchStage = { recipient: req.user._id };
    if (type) {
        matchStage.type = type;
    }

    const aggregate = Notification.aggregate([
        { $match: matchStage },
        { $sort: { createdAt: -1 } }
    ]);

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const notifications = await Notification.aggregatePaginate(aggregate, options);

    return res.status(200).json(
        new ApiResponse(200, notifications, "Notifications fetched successfully")
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    ValidationHelper.validateId(notificationId, "Invalid Notification ID");

    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to updates this notification");
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user._id, isRead: false },
        { $set: { isRead: true } }
    );

    return res.status(200).json(
        new ApiResponse(200, {}, "All notifications marked as read")
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    ValidationHelper.validateId(notificationId, "Invalid Notification ID");

    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this notification");
    }

    await Notification.findByIdAndDelete(notificationId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Notification deleted successfully")
    );
});

export {
    getUserNotifications,
    markNotificationAsRead,
    markAllAsRead,
    deleteNotification
};
