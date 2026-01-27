const API="http://localhost:8000/api/v1/jobs"

interface jobData {
    title: string;
    description: string;
    budget: number;
    deadline: string;
    category: string;
    required_skills: string[];
}



const fetchConfig = (method: string, data?: jobData): RequestInit => ({
  method,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
  body: data ? JSON.stringify(data) : undefined,
});

export const jobHandler={
  

    createJob:async(data:jobData)=>{
        const res = await fetch(`${API}`, fetchConfig("POST", data));
        if (!res.ok) {
            const err = await res.json();
            console.error("Create Job Error:", err);
            throw new Error(err.message || "Failed to create job");
        }
        const result = await res.json();
        return result.data;
    },

    updateJob:async(jobId:string,data:jobData)=>{
        const res = await fetch(`${API}/${jobId}`, fetchConfig("PUT", data));
        if (!res.ok) throw new Error("Failed to update job");
        const result = await res.json();
        return result.data;
    },

    getJob:async(jobId:string|undefined)=>{
        const res = await fetch(`${API}/${jobId}`, { credentials: "include" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch job");
        const result = await res.json();
        return result.data;
    },

    getAllJobs:async()=>{
        const res = await fetch(`${API}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const result = await res.json();
        return result.data;
    },

    deleteJob:async(jobId:string)=>{
        const res = await fetch(`${API}/${jobId}`, fetchConfig("DELETE"));
        if (!res.ok) throw new Error("Failed to delete job");
        const result = await res.json();
        return result.data;
    },

    getAllMyJobs:async()=>{
        const res = await fetch(`${API}/my-jobs`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch my jobs");
        const result = await res.json();
        return result.data;
    },

    getMyJobForClient:async(jobId:string)=>{
        const res = await fetch(`${API}/my/${jobId}`, { credentials: "include" });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("Failed to fetch my job for client");
        const result = await res.json();
        return result.data;
    },
}