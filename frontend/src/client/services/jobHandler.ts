import { apiRequest } from "../../services/apiClient";

const API = "/jobs";

export interface JobData {
    title: string;
    description: string;
    budget: number;
    deadline: string;
    category: string;
    required_skills: string[];
}

export interface Job extends JobData {
    _id: string;
    status: string;
    client_id?: string;
    // Add other fields returned by the backend if necessary, e.g. status, client_id, etc.
}

export interface PaginatedResponse<T> {
    docs: T[];
    totalDocs: number;
    limit: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
    pagingCounter: number;
}

export const jobHandler = {
    createJob: async (data: JobData) => {
        return await apiRequest<Job>(`${API}`, "POST", data);
    },

    updateJob: async (jobId: string, data: JobData) => {
        // Backend uses PATCH for updates
        return await apiRequest<Job>(`${API}/${jobId}`, "PATCH", data);
    },

    getJob: async (jobId: string | undefined): Promise<Job> => {
        try {
            return await apiRequest<Job>(`${API}/${jobId}`, "GET");
        } catch (error: any) {
            // apiRequest throws on non-2xx. If it's a 404, we might want to return null
            // depending on how the component handles it.
            // The original code returned null on 404.
            // However, checking error status strictly is hard with the current apiClient.
            // We'll let the error propagate or simpler: just return the result.
            // If strict 404 null return is needed, we'd need to parse the error message 
            // or modify apiClient to expose status.
            // For now, let's assuming if it fails, it throws.
            console.error("Error fetching job:", error);
            throw error; 
        }
    },

    getAllJobs: async (): Promise<PaginatedResponse<Job>> => {
        return await apiRequest<PaginatedResponse<Job>>(`${API}`, "GET");
    },

    deleteJob: async (jobId: string) => {
        return await apiRequest(`${API}/${jobId}`, "DELETE");
    },

    getAllMyJobs: async (): Promise<PaginatedResponse<Job>> => {
        return await apiRequest<PaginatedResponse<Job>>(`${API}/my-jobs`, "GET");
    },

    getMyJobForClient: async (jobId: string): Promise<Job | null> => {
         // Note: The route /jobs/my/:id does not seem to exist in job.routes.js
         // but keeping it here to preserve original intent/endpoint if it exists elsewhere.
         // If it 404s, apiRequest will throw.
        try {
            return await apiRequest<Job>(`${API}/my/${jobId}`, "GET");
        } catch (error) {
             console.error("Error fetching client job:", error);
             return null;
        }
    },
};