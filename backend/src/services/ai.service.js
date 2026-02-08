import { aiModel } from "../config/ai.config.js";
import { ApiError } from "../utils/ApiError.js";

class AI_Service {
    constructor() {
        this.model = aiModel;
    }

    async generateText(prompt) {
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Service Error:", error);
            throw new ApiError(500, "Failed to generate content from AI service");
        }
    }

    async generateJSON(prompt) {
        try {
            const jsonPrompt = `${prompt} \n\n IMPORTANT: Return ONLY valid JSON with no markdown formatting or backticks.`;

            let text = await this.generateText(jsonPrompt);

            text = text.replace(/```json/g, "").replace(/```/g, "").trim();

            const firstOpen = text.indexOf("{");
            const lastClose = text.lastIndexOf("}");

            if (firstOpen !== -1 && lastClose !== -1) {
                text = text.substring(firstOpen, lastClose + 1);
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("AI Service JSON Error:", error);
            throw new ApiError(500, "Failed to parse AI response as JSON");
        }
    }
}

export const aiService = new AI_Service();
