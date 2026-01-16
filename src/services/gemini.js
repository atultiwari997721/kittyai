import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the API client
// NOTE: Ideally, the API key should come from environment variables.
// For now, we will check if it exists, otherwise warn.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
} else {
  console.warn("VITE_GEMINI_API_KEY is not set. API calls will fail.");
}

const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

/**
 * Gets a basic response from Gemini.
 * @param {string} prompt - The user's input query.
 * @returns {Promise<string>} - The text response.
 */
export const getGeminiResponse = async (prompt) => {
  if (!model) throw new Error("API Key missing");
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

/**
 * Gets a creative structured response for specific tasks.
 * @param {string} type - The type of creative act (Poem, Joke, Idea, Code).
 * @param {string} topic - The user's input topic.
 * @returns {Promise<string>}
 */
export const getCreativeGeminiResponse = async (type, topic) => {
  if (!model) throw new Error("API Key missing");
  
  const systemPrompt = `You are a creative assistant specialized in generating ${type}. 
  Make it amazing, witty, and stylistically impressive.
  Topic: ${topic}`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Creative API Error:", error);
    throw error;
  }
};
