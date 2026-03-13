// src/lib/pipeline/consolidatedAnalysis.ts
import { generateJSONResponse } from "../ai/gemini.js";
import { Type, type Schema } from "@google/genai";
import type { Feature, UserStory, Ambiguity } from "../../types/prd.js";

const consolidatedAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    ambiguities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING }
        },
        required: ["id", "description", "severity"]
      }
    },
    healthScore: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        issues: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["score", "issues"]
    },
    features: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING }
        },
        required: ["id", "name", "description", "priority"]
      }
    },
    stories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          featureId: { type: Type.STRING },
          story: { type: Type.STRING },
          acceptanceCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "featureId", "story", "acceptanceCriteria"]
      }
    },
    clarifications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          ambiguityId: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "ambiguityId", "question", "options"]
      }
    }
  },
  required: ["ambiguities", "healthScore", "features", "stories", "clarifications"]
};

const CONSOLIDATED_ANALYSIS_PROMPT = `
You are an expert Product Manager and Systems Architect. Your task is to perform a comprehensive analysis of the provided PRD.

1. **Detect Ambiguities**: Identify unclear or missing requirements.
2. **Score PRD Health**: Evaluate technical readiness (0-100) and list core issues.
3. **Extract Features**: Group requirements into broad, cohesive high-level modules.
4. **Generate User Stories**: Convert features into detailed stories with acceptance criteria. Limit to 1-2 dense stories per feature. Link them to feature IDs.
5. **Generate Clarification Questions**: For each ambiguity, provide a question for the user with 3-4 options.

Return the result strictly in the provided JSON format.
`;

export async function runConsolidatedAnalysis(documentPart: any) {
  console.log("-> Running Consolidated Analysis (Ambiguities, Health, Features, Stories, Clarifications)...");
  return await generateJSONResponse<any>(
    CONSOLIDATED_ANALYSIS_PROMPT,
    documentPart,
    consolidatedAnalysisSchema
  );
}
