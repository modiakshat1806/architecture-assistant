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
  retries: number = 5 // Increased retries for hackathon demo stability
): Promise<T> {

  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY missing from .env");
    ai = new GoogleGenAI({ apiKey });
  }

  // CRITICAL: gemini-3 does not exist yet. Using gemini-1.5-flash for speed & stability.
  const model = "gemini-2.5-flash";

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

      let cleanText = response.text.trim();
      // Remove markdown code blocks if present (sometimes flash models still wrap even with mime-type)
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```json\n?/, "").replace(/```$/, "").trim();
      }

      return JSON.parse(cleanText) as T;

    } catch (error: any) {
      // LOG ERROR DETAILS TO TERMINAL
      const status = error?.status || error?.response?.status;
      const message = error?.message || "Internal AI Error";
      const details = error?.response?.data || error?.details || "No extra details";

      console.error(`\n❌ Gemini API Error (Attempt ${attempt}/${retries}):`, {
        status,
        message,
        details
      });

      const isRateLimit = status === 429;
      const isOverloaded = status === 503;
      const isSyntaxError = error instanceof SyntaxError || error.name === "SyntaxError" || message.includes("JSON");

      if ((isRateLimit || isOverloaded || isSyntaxError) && attempt < retries) {
        const delay = isSyntaxError ? 2000 : attempt * 5000;
        console.warn(`⚠️ Gemini API ${isSyntaxError ? "gave malformed JSON" : "busy (" + status + ")"}. Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        throw error;
      }
    }
  }

  throw new Error("Pipeline failed after maximum retries.");
}