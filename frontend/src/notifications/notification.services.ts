import { apiRequest } from "../services/apiClient";

export const getNotifications = async () => {
    const response = await apiRequest<any>("/notifications");
    // The backend returns { notifications: [], ... } inside the data object
    return response.notifications || [];
};

export const markAsRead = async (id: string) => {   
    const response = await apiRequest(`/notifications/read/${id}`, "PUT");
    return response;
};

export const markAllAsRead = async () => {
    const response = await apiRequest(`/notifications/read-all`, "PUT");
    return response;
};

export const deleteNotification = async (id: string) => {
    const response = await apiRequest(`/notifications/delete/${id}`, "DELETE");
    return response;
};  

