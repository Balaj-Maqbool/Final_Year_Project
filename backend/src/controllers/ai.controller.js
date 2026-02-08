import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { aiService } from "../services/ai.service.js";
import { ApiError } from "../utils/ApiError.js";

const generateJobDetails = asyncHandler(async (req, res) => {
    const { userPrompt } = req.body;

    if (!userPrompt) throw new ApiError(400, "User prompt is required");

    // Sanitize input to prevent prompt injection
    const sanitizedPrompt = userPrompt.replace(/"/g, '\\"');

    const systemPrompt = `
        You are an expert Job Architect. The user will give you a rough idea of a job they need done.
        Generate a professional Job Description JSON with the following fields:
        - title: A catchy and professional job title.
        - description: A detailed job description (at least 150 words).
        - required_skills: An array of 5-10 technical skills.
        - budget_estimate: A suggested budget range (e.g., "$500 - $1000").
        - category: The most relevant category (e.g., "Web Development", "Design", "Writing").

        User Input: "${sanitizedPrompt}"
    `;

    const jobData = await aiService.generateJSON(systemPrompt);

    return res.status(200).json(new ApiResponse(200, jobData, "Job details generated successfully"));
});

const policeUserProfile = asyncHandler(async (req, res) => {
    const { currentBio, currentSkills } = req.body;

    // Sanitize inputs
    const safeBio = (currentBio || "N/A").replace(/"/g, '\\"');
    const safeSkills = (currentSkills || "N/A").replace(/"/g, '\\"');

    const systemPrompt = `
        You are an expert Profile Consultant.
        The user has the following Bio: "${safeBio}"
        And the following Skills: "${safeSkills}"

        Please polish this profile.
        Return a JSON with:
        - refined_bio: A professional, engaging bio (max 100 words).
        - suggested_skills: An array of skills that complement the user's profile or are trending in their field.
    `;

    const profileData = await aiService.generateJSON(systemPrompt);

    return res.status(200).json(new ApiResponse(200, profileData, "Profile polished successfully"));
});

const generateProposal = asyncHandler(async (req, res) => {
    const { jobDescription, freelancerProfile } = req.body;

    if (!jobDescription) throw new ApiError(400, "Job Description is required");

    // Sanitize inputs. For objects like freelancerProfile, stringify first then escape.
    const safeJobDesc = jobDescription.replace(/"/g, '\\"');
    const safeProfile = JSON.stringify(freelancerProfile).replace(/"/g, '\\"');

    const systemPrompt = `
        You are an expert Proposal Writer.
        Job Description: "${safeJobDesc}"
        Freelancer Profile: "${safeProfile}"

        Write a compelling cover letter (proposal) that highlights why this freelancer is the best fit.
        Return a JSON with:
        - proposal_text: The cover letter text (keep it professional and persuasive).
    `;

    const proposalData = await aiService.generateJSON(systemPrompt);

    return res.status(200).json(new ApiResponse(200, proposalData, "Proposal generated successfully"));
});

const generateTaskBreakdown = asyncHandler(async (req, res) => {
    const { jobDescription } = req.body;

    if (!jobDescription) throw new ApiError(400, "Job Description is required");

    const safeJobDesc = jobDescription.replace(/"/g, '\\"');

    const systemPrompt = `
        You are an expert Project Manager.
        Job Description: "${safeJobDesc}"

        Break this project down into 5-10 actionable tasks for a Kanban board.
        Return a JSON object with a "tasks" array, where each item has:
        - title: Task title.
        - description: Brief description of what needs to be done.
        - status: "To Do"
    `;

    const taskData = await aiService.generateJSON(systemPrompt);

    return res.status(200).json(new ApiResponse(200, taskData, "Task breakdown generated successfully"));
});

export { generateJobDetails, policeUserProfile, generateProposal, generateTaskBreakdown };
