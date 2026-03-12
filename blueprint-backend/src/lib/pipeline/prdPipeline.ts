// src/lib/pipeline/prdPipeline.ts
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
  
  // 1. Independent Tasks (Wait 2 seconds between them)
  const features = await extractFeatures(documentPart);
  await sleep(2000);
  const healthScore = await scorePRDHealth(documentPart);
  await sleep(2000);
  
  // 2. Sequential Dependencies
  const stories = await generateUserStories(features);
  await sleep(2000);
  
  const tasks = await generateTasks(stories);
  await sleep(2000);
  
  // 3. Deterministic Logic (No API call, happens instantly)
  const sprints = generateSprints(tasks);
  
  // 4. Run the final heavy modules one by one instead of Promise.all
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
  
  // 5. Build Traceability Graph
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
    healthScore,
    devops
  };
}