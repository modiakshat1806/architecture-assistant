// src/lib/pipeline/codeGenerator.ts
import { generateJSONResponse } from "../ai/gemini.js";
import { SYSTEM_PROMPTS } from "../ai/prompts.js";
import type { Task } from "../../types/prd.js";
import { Type } from "@google/genai";
import type { Schema } from "@google/genai";

const codeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    structure: {
      type: Type.ARRAY,
      items: { type: Type.STRING, description: "e.g., src/controllers/userController.ts" }
    }
  },
  required: ["structure"]
};

export async function generateCode(tasks: Task[]): Promise<string[]> {
  console.log("-> Generating Folder & File Structure...");
  
  const res = await generateJSONResponse<{ structure: string[] }>(
    SYSTEM_PROMPTS.CODE_GENERATOR,
    JSON.stringify(tasks),
    codeSchema
  );
  
  return res.structure || [];
}