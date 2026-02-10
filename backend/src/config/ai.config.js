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

const aiModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig
});

export { aiModel };
