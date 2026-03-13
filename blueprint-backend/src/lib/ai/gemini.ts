// src/lib/ai/gemini.ts
import { GoogleGenAI } from "@google/genai";
import type { Schema } from "@google/genai";

let ai: GoogleGenAI | null = null;

// Helper function to pause execution
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateJSONResponse<T>(
  systemInstruction: string,
  userPromptOrFile: any,
  responseSchema: Schema,
  retries: number = 3 // We will try up to 3 times
): Promise<T> {

  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing from .env");
    ai = new GoogleGenAI({ apiKey });
  }

  const model = "gemini-3-flash-preview";

  let parts = [];
  if (typeof userPromptOrFile === "string") {
    parts = [{ text: userPromptOrFile }];
  } else if (Array.isArray(userPromptOrFile)) {
    parts = userPromptOrFile;
  } else {
    parts = [userPromptOrFile];
  }

  // Retry Loop
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.1,
        },
      });

      if (!response.text) throw new Error("No text returned from Gemini");
      return JSON.parse(response.text) as T;

    } catch (error: any) {
      const isRateLimit = error?.status === 429;
      const isOverloaded = error?.status === 503;

      if ((isRateLimit || isOverloaded) && attempt < retries) {
        const delay = attempt * 3000; // Wait 3s, then 6s, then 9s
        console.warn(`⚠️ Gemini API busy (Attempt ${attempt}/${retries}). Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        // If it's a different error, or we ran out of retries, throw it
        throw error;
      }
    }
  }

  throw new Error("Pipeline failed after maximum retries.");
}