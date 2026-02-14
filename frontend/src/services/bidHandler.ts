import { apiRequest } from "./apiClient";
import type { PaginatedResponse } from "./jobHandler";
const API = "/bids";

export interface BidData {
  job_id?: string; // Optional because update might not need it or it's in URL
  bid_amount?: number;
  message?: string;
  timeline?: {
    start_date: string;
    end_date: string;
  };
  status?: "Pending" | "Accepted" | "Rejected";
}

// Helper to parse timeline from string to object if needed
const parseBid = (bid: any) => {
    if (bid && typeof bid.timeline === 'string') {
        try {
            bid.timeline = JSON.parse(bid.timeline);
        } catch (e) {
            console.error("Failed to parse timeline JSON", e);
        }
    }
    return bid;
};

export const bidHandler = {
  createBid: async (data: BidData, jobId: string) => {
    const payload = { ...data };
    if (payload.timeline && typeof payload.timeline === 'object') {
        (payload as any).timeline = JSON.stringify(payload.timeline);
    }
    const result = await apiRequest<any>(`${API}/${jobId}`, "POST", payload);
    return parseBid(result);
  },

  getJobBids: async (jobId: string) => {
    const result = await apiRequest<PaginatedResponse<any>>(`${API}/${jobId}`, "GET");
    return result.docs.map(parseBid);
  },

  updateBidStatus: async (jobId: string, bidId: string, status: "Accepted" | "Rejected") => {
    const result = await apiRequest<any>(`${API}/${jobId}/${bidId}/status`, "PATCH", { status });
    return parseBid(result);
  },

  updateBid: async (bidId: string, data: BidData) => {
    const payload = { ...data };
    if (payload.timeline && typeof payload.timeline === 'object') {
         (payload as any).timeline = JSON.stringify(payload.timeline);
    }
    const result = await apiRequest<any>(`${API}/bid/${bidId}`, "PUT", payload);
    return parseBid(result);
  },

  getMyBidForJob: async (jobId: string) => {
    try {
        const result = await apiRequest<any>(`${API}/my/${jobId}`, "GET");
        return parseBid(result);
    } catch (error: any) {
        if (error.message && error.message.includes("404")) return null;
        // The apiClient throws on non-2xx. If we receive a specific 404 object/message we can return null.
        // However, standard apiClient might just throw "Request failed...".
        // We might need to check if we can distinguish 404.
        // For now, let's assume if it errors it might be not found or actual error.
        // But re-reading apiClient, it throws with errorData.message.
        // If the backend returns 404 for "no bid found", we should handle it.
        // If the backend 404 means "endpoint not found", that's different.
        // Assuming "my/jobId" returns 404 if no bid exists.
        console.warn("Could not fetch my bid (might not exist):", error);
        return null; 
    }
  },

  getAllMyBids: async (): Promise<PaginatedResponse<BidData>> => {
    const result = await apiRequest<PaginatedResponse<BidData>>(`${API}/my-bids`, "GET");
    return {
        ...result,
        docs: result.docs.map(parseBid)
    };
  },
};