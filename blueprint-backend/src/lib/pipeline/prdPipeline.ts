// src/lib/pipeline/prdPipeline.ts

import { buildTraceability } from "./traceabilityGenerator.js";
import { generateSprints } from "./sprintPlanner.js";
import { generateRequestlyConfig } from "./requestlyExporter.js";
import { runConsolidatedAnalysis } from "./consolidatedAnalysis.js";
import { runConsolidatedImplementation } from "./consolidatedImplementation.js";

// Helper to slow down requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runPrdPipeline(documentPart: any): Promise<any> {

  console.log("=== STARTING CONSOLIDATED PRD PIPELINE ===");
  const projectName = "Generated AI Project";

  // ----------------------------------------
  // Batch 1: Analysis & Requirements (1 Request)
  // ----------------------------------------
  const analysisResult = await runConsolidatedAnalysis(documentPart);
  const { ambiguities, healthScore, features, stories, clarifications } = analysisResult;

  await sleep(2000); // Breathe for rate limits

  // ----------------------------------------
  // Batch 2: Engineering & Execution (1 Request)
  // ----------------------------------------
  const implementationResult = await runConsolidatedImplementation(features, stories);
  const { tasks, architecture, devops, codeFiles, tests } = implementationResult;

  // Convert flat code files to the tree structure the UI expects
  const codeStructure = (codeFiles && codeFiles.length) ? buildFileTree(codeFiles) : [];

  // ----------------------------------------
  // Deterministic Steps (0 Requests)
  // ----------------------------------------
  console.log("-> Post-Processing Deterministic Data...");
  const sprints = generateSprints(tasks);
  const traceability = buildTraceability(features, stories, tasks);
  const requestlyConfig = generateRequestlyConfig(codeStructure, projectName);

  console.log("=== PIPELINE COMPLETE (2 AI REQUESTS TOTAL) ===");

  return {
    projectName,
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
    devops,
    
    requestlyConfig
  };
}

// Re-using the tree builder from codeGenerator.ts to keep functionality intact
function buildFileTree(files: any[]): any[] {
  const root: any[] = [];
  files.forEach(file => {
    if (!file.path) return;
    const parts = file.path.split('/');
    let currentLevel = root;
    parts.forEach((part: string, index: number) => {
      const isFile = index === parts.length - 1;
      let existingNode = currentLevel.find(n => n.name === part);
      
      if (existingNode) {
        if (!isFile) {
          if (!existingNode.children) existingNode.children = [];
          currentLevel = existingNode.children;
        }
      } else {
        const newNode: any = {
          path: parts.slice(0, index + 1).join('/'),
          name: part,
          type: isFile ? 'file' : 'folder'
        };
        if (isFile) {
          newNode.language = file.language || 'text';
          newNode.content = file.content || '';
        } else {
          newNode.children = [];
        }
        currentLevel.push(newNode);
        if (!isFile) currentLevel = newNode.children;
      }
    });
  });
  return root;
}