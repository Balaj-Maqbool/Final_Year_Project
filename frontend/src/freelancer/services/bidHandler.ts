const API = "http://localhost:8000/api/v1/bids";

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

export const bidHandler = {
  createBid: async (data: any) => {
    const res = await fetch(API, {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create bid");
    const result = await res.json();
    return result.data;
  },

  updateBid: async (bidId: string, data: any) => {
    const res = await fetch(`${API}/${bidId}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update bid");
    const result = await res.json();
    return result.data;
  },

  getMyBidForJob: async (jobId: string) => {
    const res = await fetch(`${API}/my/${jobId}`, {
      headers: authHeader(),
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch bid");

    const result = await res.json();
    return result.data;
  },
};
