// src/lib/pipeline/taskGenerator.ts
import { generateJSONResponse } from "../ai/gemini.js";
import { SYSTEM_PROMPTS } from "../ai/prompts.js";
import type { UserStory, Task } from "../../types/prd.js";
import { Type, type Schema } from "@google/genai";

const taskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      description: "Generate exactly 2 to 4 comprehensive engineering tasks per user story. Group granular work together (e.g., 'Implement Auth API and DB Schema' instead of separate micro-tasks). Do not generate more than 4 tasks per story under any circumstances.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          storyId: { type: Type.STRING },
          title: { type: Type.STRING, description: "A broad, comprehensive engineering task" },
          description: { type: Type.STRING },
          type: { type: Type.STRING, description: "Frontend, Backend, Database, or Fullstack" },
          complexity: { type: Type.INTEGER, description: "Story points (1, 2, 3, 5, 8)" }
        },
        required: ["id", "storyId", "title", "description", "type", "complexity"]
      }
    }
  },
  required: ["tasks"]
};

export async function generateTasks(stories: UserStory[]): Promise<Task[]> {
  console.log("-> Generating Technical Tasks...");
  
  const res = await generateJSONResponse<{ tasks: Task[] }>(
    SYSTEM_PROMPTS.TASK_GENERATOR,
    JSON.stringify(stories),
    taskSchema
  );
  
  return res.tasks;
}