const API = "http://localhost:3000/api/bids";

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
    return res.json();
  },

  updateBid: async (bidId: string, data: any) => {
    const res = await fetch(`${API}/${bidId}`, {
      method: "PUT",
      headers: authHeader(),
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update bid");
    return res.json();
  },

  getMyBidForJob: async (jobId: string) => {
    const res = await fetch(`${API}/my/${jobId}`, {
      headers: authHeader(),
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch bid");

    return res.json();
  },
};
