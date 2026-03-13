// src/lib/pipeline/consolidatedImplementation.ts
import { generateJSONResponse } from "../ai/gemini.js";
import { Type, type Schema } from "@google/genai";

const consolidatedImplementationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          storyId: { type: Type.STRING },
          featureId: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          type: { type: Type.STRING },
          priority: { type: Type.STRING },
          complexity: { type: Type.INTEGER }
        },
        required: ["id", "storyId", "featureId", "title", "description", "type", "priority", "complexity"]
      }
    },
    architecture: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              type: { type: Type.STRING }
            },
            required: ["id", "label", "type"]
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              from: { type: Type.STRING },
              to: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["from", "to"]
          }
        }
      },
      required: ["nodes", "edges"]
    },
    devops: {
      type: Type.OBJECT,
      properties: {
        dockerfile: { type: Type.STRING },
        githubActions: { type: Type.STRING },
        deploymentSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["dockerfile", "githubActions", "deploymentSteps"]
    },
    codeFiles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING },
          name: { type: Type.STRING },
          language: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["path", "name", "language", "content"]
      }
    },
    tests: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          taskId: { type: Type.STRING },
          tests: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["taskId", "tests"]
      }
    }
  },
  required: ["tasks", "architecture", "devops", "codeFiles", "tests"]
};

const CONSOLIDATED_IMPLEMENTATION_PROMPT = `
You are a Lead Software Architect and DevOps Engineer. Based on the provided PRD features and user stories, generate a full technical implementation plan.

1. **Generate Tasks**: Break stories into technical backend, frontend, database, and infrastructure tasks.
2. **Architecture**: Design a system architecture with nodes (frontend, api, database, etc.) and edges.
3. **DevOps**: Provide a Dockerfile, GitHub Actions CI/CD setup, and deployment steps.
4. **Code Structure**: Generate core boilerplate files (flat list with path, name, language, content).
5. **Tests**: Generate QA test plans for the tasks.

Return the result strictly in the provided JSON format.
`;

export async function runConsolidatedImplementation(features: any[], stories: any[]) {
  console.log("-> Running Consolidated Implementation (Tasks, Architecture, DevOps, Code, Tests)...");
  const payload = JSON.stringify({ features, stories });
  return await generateJSONResponse<any>(
    CONSOLIDATED_IMPLEMENTATION_PROMPT,
    payload,
    consolidatedImplementationSchema
  );
}
