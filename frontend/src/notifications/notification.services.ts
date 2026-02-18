import { apiRequest } from "../services/apiClient";

export const getNotifications = async () => {
    const response = await apiRequest<any>("/notifications");
    // The backend returns a paginated response with 'docs' array
    return response.docs || [];
};

export const markAsRead = async (id: string) => {   
    const response = await apiRequest(`/notifications/read/${id}`, "PATCH");
    return response;
};

export const markAllAsRead = async () => {
    const response = await apiRequest(`/notifications/read-all`, "PATCH");
    return response;
};

export const deleteNotification = async (id: string) => {
    const response = await apiRequest(`/notifications/delete/${id}`, "DELETE");
    return response;
};  

