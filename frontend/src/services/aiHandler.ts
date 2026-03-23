import { apiRequest } from "./apiClient";

const API = "/ai";

export const aiHandler = {
    generateJobDetails: async (userPrompt: string) => {
        return await apiRequest<{
            title: string;
            description: string;
            required_skills: string[];
            budget_estimate: string;
            category: string;
        }>(`${API}/job-architect`, "POST", { userPrompt });
    },

    policeUserProfile: async (currentBio: string, currentSkills: string) => {
        return await apiRequest<{
            refined_bio: string;
            suggested_skills: string[];
        }>(`${API}/profile-polisher`, "POST", { currentBio, currentSkills });
    },

    generateProposal: async (jobDescription: string, freelancerProfile: any) => {
        return await apiRequest<{
            proposal_text: string;
        }>(`${API}/proposal-generator`, "POST", { jobDescription, freelancerProfile });
    },

    generateTaskBreakdown: async (jobDescription: string) => {
        return await apiRequest<{
            tasks: {
                title: string;
                description: string;
                status: string;
            }[];
        }>(`${API}/task-breakdown`, "POST", { jobDescription });
    }
};
