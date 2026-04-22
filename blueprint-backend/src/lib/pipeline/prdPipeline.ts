// src/lib/pipeline/prdPipeline.ts

import { detectAmbiguities } from "./ambiguityDetector.js";
import { generateClarifications } from "./clarificationQuestions.js";

import { extractFeatures } from "./featureExtractor.js";
import { generateUserStories } from "./storyGenerator.js";
import { generateTasks } from "./taskGenerator.js";
import { generateArchitecture } from "./architectureGenerator.js";
import { buildTraceability } from "./traceabilityGenerator.js";
import { generateSprints } from "./sprintPlanner.js";
import { scorePRDHealth } from "./prdHealthScore.js";
import { generateDevOps } from "./devopsGenerator.js";
import { generateCode } from "./codeGenerator.js";
import { generateTests } from "./testGenerator.js";

// Helper to slow down requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runPrdPipeline(documentPart: any): Promise<any> {

  console.log("=== STARTING ADVANCED PRD PIPELINE ===");

  // ----------------------------------------
  // 1. PRD Analysis Layer
  // ----------------------------------------

  console.log("-> Detecting Ambiguities...");
  const ambiguities = await detectAmbiguities(documentPart);
  await sleep(2000);

  console.log("-> Generating Clarification Questions...");
  const clarifications = await generateClarifications(ambiguities);
  await sleep(2000);

  console.log("-> Scoring PRD Health...");
  const healthScore = await scorePRDHealth(documentPart);
  await sleep(2000);

  // ----------------------------------------
  // 2. Feature Extraction
  // ----------------------------------------

  console.log("-> Extracting Features...");
  const features = await extractFeatures(documentPart);
  await sleep(2000);

  // ----------------------------------------
  // 3. Engineering Planning
  // ----------------------------------------

  console.log("-> Generating User Stories...");
  const stories = await generateUserStories(features);
  await sleep(2000);

  console.log("-> Generating Tasks...");
  const tasks = await generateTasks(stories);
  await sleep(2000);

  // ----------------------------------------
  // 4. Deterministic Planning
  // ----------------------------------------

  console.log("-> Planning Sprints...");
  const sprints = generateSprints(tasks);

  // ----------------------------------------
  // 5. Architecture + DevOps
  // ----------------------------------------

  console.log("-> Generating Architecture...");
  const architecture = await generateArchitecture(features, tasks);
  await sleep(3000);

  console.log("-> Generating DevOps Strategy...");
  const devops = await generateDevOps(tasks);
  await sleep(3000);

  console.log("-> Generating Code Structure...");
  const codeStructure = await generateCode(tasks);
  await sleep(3000);

  console.log("-> Generating Test Cases...");
  const tests = await generateTests(tasks);

  // ----------------------------------------
  // 6. Traceability Graph
  // ----------------------------------------

  console.log("-> Building Traceability Graph...");
  const traceability = buildTraceability(features, stories, tasks);

  console.log("=== PIPELINE COMPLETE ===");

  return {
    projectName: "Generated AI Project",

    features,
    stories,
    tasks,
    sprints,

    architecture,
    codeStructure,
    tests,

    traceability,

    ambiguities,
    clarifications,

    healthScore,
    devops
  };
}