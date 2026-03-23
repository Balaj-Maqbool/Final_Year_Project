import { apiRequest } from "./apiClient";

export interface Task {
    _id: string;
    title: string;
    description: string;
    status: "Pending" | "In Progress" | "Completed" | "Done" | "To Do";
    is_approved: boolean;
    job_id: string;
    assigned_to: string;
}

import type { PaginatedResponse } from "./jobHandler";

// GET /api/v1/tasks/:jobId
export const getTasks = async(jobId: string): Promise<PaginatedResponse<Task>>  => {
    return await apiRequest<PaginatedResponse<Task>>(`/tasks/${jobId}`);
};

// POST /api/v1/tasks/:jobId
export const createTask = async (jobId: string, data: { title: string; description: string }) => {
    return await apiRequest<Task>(`/tasks/${jobId}`, "POST", data);
};

// PATCH /api/v1/tasks/:taskId/status (For Freelancer & Client)
export const updateTaskStatus = async (taskId: string, status: string) => {
    return await apiRequest<Task>(`/tasks/${taskId}/status`, "PATCH", { status });
};

// PATCH /api/v1/tasks/:taskId/approve (For Client)
export const approveTask = async (taskId: string) => {
    return await apiRequest<Task>(`/tasks/${taskId}/approve`, "PATCH");
};

// PUT /api/v1/tasks/:taskId (For Client)
export const updateTask = async (taskId: string, data: { title?: string; description?: string }) => {
    return await apiRequest<Task>(`/tasks/${taskId}`, "PUT", data);
};

// DELETE /api/v1/tasks/:taskId (For Client)
export const deleteTask = async (taskId: string) => {
    return await apiRequest<void>(`/tasks/${taskId}`, "DELETE");
};