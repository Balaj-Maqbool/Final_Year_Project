import { apiRequest } from "./apiClient";

export interface RatingData {
    _id: string;
    job_id: string;
    rated_by_user_id: string;
    rated_user_id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer?: {
        fullName: string;
        profileImage?: string;
    };
}

export const ratingHandler = {
    addRating: async (jobId: string, payload: { rating: number, comment: string }) => {
        return await apiRequest(`/ratings/${jobId}`, "POST", payload);
    },

    getFreelancerRatings: async (freelancerId: string, page = 1, limit = 10) => {
        return await apiRequest(`/ratings/freelancer/${freelancerId}?page=${page}&limit=${limit}`, "GET");
    },
    
    updateRating: async (ratingId: string, payload: { rating?: number, comment?: string }) => {
        return await apiRequest(`/ratings/${ratingId}`, "PATCH", payload);
    }
};
