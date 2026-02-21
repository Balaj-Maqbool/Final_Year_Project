import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../constants.js";

if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is missing. AI features will not work.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192
};

const FALLBACK_MODELS = [
    "gemini-flash-latest",       
    "gemini-2.5-flash",          
    "gemma-3-1b-it",             
    "gemma-3-27b-it",            
    "gemini-2.0-flash-lite"      
];


const aiModel = {
    generateContent: async (prompt) => {
        let lastError = null;

        for (const modelName of FALLBACK_MODELS) {
            try {
                console.log(`🤖 Attempting AI generation with model: ${modelName}`);

                const model = genAI.getGenerativeModel({
                    model: modelName,
                    generationConfig
                });
                const result = await model.generateContent(prompt);

                // console.log(`✅ Success with ${modelName}`);
                return result;

            } catch (error) {
                // console.warn(`⚠️ Failed with ${modelName}:`, error.message);
                lastError = error;
            }
        }

        // console.error("❌ All AI models failed.");
        throw lastError;
    }
};

export { aiModel };
