// src/lib/pipeline/testGenerator.ts
import { generateJSONResponse } from "../ai/gemini.js";
import { SYSTEM_PROMPTS } from "../ai/prompts.js";
import type { Task, TaskTest } from "../../types/prd.js";
import { Type } from "@google/genai";
import type { Schema } from "@google/genai";

const testSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          taskId: { type: Type.STRING },
          method: { type: Type.STRING, description: "HTTP method (GET, POST, etc.) or 'UNIT' for unit tests" },
          endpoint: { type: Type.STRING, description: "API endpoint, or function name for unit tests" },
          description: { type: Type.STRING },
          expected: { type: Type.STRING },
          status: { type: Type.STRING, description: "Must be one of: 'pass', 'fail', 'edge'" },
          category: { type: Type.STRING, description: "Must be one of: 'functional', 'edge', 'negative', 'unit'" }
        },
        required: ["id", "taskId", "method", "endpoint", "description", "expected", "status", "category"]
      }
    }
  },
  required: ["tests"]
};

export async function generateTests(tasks: Task[]): Promise<TaskTest[]> {
  console.log("-> Generating QA Test Plans...");
  
  const res = await generateJSONResponse<{ tests: TaskTest[] }>(
    SYSTEM_PROMPTS.TEST_GENERATOR,
    JSON.stringify(tasks),
    testSchema
  );
  
  return res.tests || [];
}