import { apiRequest } from "../../services/apiClient";

interface task{
    _id: string;
    title: string;
    description: string;
    status: string;
    is_approved: boolean;
}

export const getTasks = async () => {
    const response = await apiRequest("/tasks");
    return response;
}

export const getTask = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/v1/tasks/${id}`, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    return result.data; 
}

export const updateTask = async (id: string, task: task) => {
    const response = await fetch(`http://localhost:8000/api/v1/tasks/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
    });
    const result = await response.json();
    return result.data;
}

export const deleteTask = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/v1/tasks/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const result = await response.json();
    return result.data;
}