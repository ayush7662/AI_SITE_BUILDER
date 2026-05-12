import OpenAI from 'openai';
if (!process.env.AI_API_KEY) {
    console.warn('WARNING: AI_API_KEY is not set in environment variables');
}
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.AI_API_KEY || "",
    defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "AI Site Builder",
    },
});
export default openai;
