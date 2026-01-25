import { GoogleGenAI } from "@google/genai";

// Use the existing integration's client configuration if possible, 
// or re-instantiate using the same env vars
export const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

export async function analyzeStory(script: string): Promise<{ description: string }[]> {
  const model = "gemini-2.5-flash"; 
  const prompt = `
    You are a professional comic book writer. 
    Break down the following story script into a sequence of comic book panels.
    For each panel, provide a detailed visual description suitable for an image generator.
    Focus on characters, action, setting, and camera angle.
    
    Story Script:
    "${script}"

    Return a JSON array of objects, where each object has a "description" field.
    Example: [{"description": "A dark alleyway, rain falling..."}]
    Do not include markdown formatting (\`\`\`json), just the raw JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  try {
    // Clean up potential markdown code blocks
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to analyze story");
  }
}
