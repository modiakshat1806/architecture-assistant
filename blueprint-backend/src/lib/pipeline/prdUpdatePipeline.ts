// src/lib/pipeline/prdUpdatePipeline.ts

import { analyzeChangeImpact } from "./changeImpactAnalyzer.js";
import { runPrdPipeline } from "./prdPipeline.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runPrdUpdatePipeline(
  oldResult: any,
  newDocumentPart: any
): Promise<any> {

  console.log("=== STARTING PRD UPDATE PIPELINE ===");

  // 1️⃣ Run full pipeline again for the new PRD
  console.log("-> Re-running pipeline for updated PRD...");
  const newResult = await runPrdPipeline(newDocumentPart);

  await sleep(2000);

  // 2️⃣ Analyze the differences
  console.log("-> Analyzing change impact...");
  const impact = await analyzeChangeImpact(oldResult, newDocumentPart);

  console.log("=== PRD UPDATE ANALYSIS COMPLETE ===");

  return {
    oldResult,
    newResult,
    impact
  };
}