
const API = "http://localhost:8000/api/v1/bids";


interface BidData {
  bid_amount?: number;
  message?: string;
  timeline?: {
    start_date: string;
    end_date: string;
  };
}
type JobId = string;

const fetchConfig = (method: string, data?: BidData): RequestInit => ({
  method,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: data ? JSON.stringify(data) : undefined,
});

export const bidHandler = {



  createBid: async (data: BidData, jobId: JobId) => {
    const res = await fetch(`http://localhost:8000/api/v1/bids/${jobId}`, fetchConfig("POST", data));
    if (!res.ok) {
        const err = await res.json();
        console.error("Create Bid Error:", err);
        throw new Error(err.message || "Failed to create bid");
    }
    const result = await res.json();
    return result.data;
  },

  updateBid: async (bidId: string, data: BidData) => {
    const res = await fetch(`${API}/bid/${bidId}`, fetchConfig("PUT", data));
    if (!res.ok) throw new Error("Failed to update bid");
    const result = await res.json();
    return result.data;
  },

  getMyBidForJob: async (jobId: string) => {
    const res = await fetch(`${API}/my/${jobId}`, { credentials: "include" });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch bid");

    const result = await res.json();
    return result.data;
  },

  getAllMyBids: async () => {
    const res = await fetch(`${API}/my-bids`, { credentials: "include" });
    if (!res.ok) throw new Error("Failed to fetch bids");
    const result = await res.json();
    return result.data;
  },
};