import { apiRequest } from "../../services/apiClient";

export interface Task {
    _id: string;
    title: string;
    description: string;
    status: "Pending" | "In Progress" | "Completed" | "Done";
    is_approved: boolean;
    job_id: string;
    assigned_to: string;
}

// GET /api/v1/tasks/:jobId
export const getTasks = async (jobId: string) => {
    return await apiRequest<Task[]>(`/tasks/${jobId}`);
};

// POST /api/v1/tasks/:jobId
export const createTask = async (jobId: string, data: { title: string; description: string }) => {
    return await apiRequest<Task>(`/tasks/${jobId}`, "POST", data);
};

// PATCH /api/v1/tasks/:taskId/status (For Freelancer)
export const updateTaskStatus = async (taskId: string, status: string) => {
    return await apiRequest<Task>(`/tasks/${taskId}/status`, "PATCH", { status });
};

// PATCH /api/v1/tasks/:taskId/approve (For Client)
export const approveTask = async (taskId: string) => {
    return await apiRequest<Task>(`/tasks/${taskId}/approve`, "PATCH");
};

// Note: Backend does not currently have a generic update/delete route in task.routes.js
// If needed, they should be added to the backend first.