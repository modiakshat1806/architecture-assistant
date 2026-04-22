import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { analyzeGitHubPush } from "./prdDiffEngine.js";
import { generateSprints } from "../lib/pipeline/sprintPlanner.js";

const prisma = new PrismaClient();

type GitHubPushPayload = {
  repository?: { full_name?: string; name?: string };
  ref?: string;
  commits?: Array<{
    added?: string[];
    modified?: string[];
    removed?: string[];
    message?: string;
  }>;
  head_commit?: { message?: string };
};

type ProcessGithubPushInput = {
  projectId: string;
  repo: string;
  filesChanged: string[];
  commitSha?: string;
  author?: string;
  branch?: string;
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mergeByField<T extends Record<string, unknown>>(existing: T[], incoming: T[], field: keyof T): T[] {
  const seen = new Set(existing.map((item) => String(item[field] || "")));
  const merged = [...existing];

  for (const item of incoming) {
    const key = String(item[field] || "");
    if (!key || seen.has(key)) continue;
    merged.push(item);
    seen.add(key);
  }

  return merged;
}

export async function processGitHubPushSync(projectId: string, payload: GitHubPushPayload) {
  const analysis = await prisma.pipelineAnalysis.findFirst({
    where: { prdVersion: { projectId } },
    orderBy: { updatedAt: "desc" },
    include: { prdVersion: true },
  });

  if (!analysis) {
    throw new Error("No analysis found for project. Run PRD pipeline first.");
  }

  const diff = analyzeGitHubPush(payload);

  const existingFeatures = asArray<Record<string, unknown>>(analysis.features);
  const existingTasks = asArray<Record<string, unknown>>(analysis.tasks);

  const mergedFeatures = mergeByField(existingFeatures, diff.affectedFeatures as Record<string, unknown>[], "name");
  const mergedTasks = mergeByField(existingTasks, diff.generatedTasks as Record<string, unknown>[], "title");
  const regeneratedSprints = generateSprints(mergedTasks);

  const updated = await prisma.pipelineAnalysis.update({
    where: { id: analysis.id },
    data: {
      features: mergedFeatures as Prisma.InputJsonValue,
      tasks: mergedTasks as Prisma.InputJsonValue,
      sprints: regeneratedSprints as Prisma.InputJsonValue,
      changeImpact: diff.impact as Prisma.InputJsonValue,
    },
  });

  return {
    analysisId: updated.id,
    projectId,
    repo: diff.impact.repo,
    branch: diff.impact.branch,
    commitCount: diff.impact.commitCount,
    changedFilesCount: diff.changedFiles.length,
    addedTasks: diff.generatedTasks.length,
    addedFeatureCandidates: diff.affectedFeatures.length,
  };
}

export async function processGithubPush(input: ProcessGithubPushInput) {
  const payload: GitHubPushPayload = {
    repository: { full_name: input.repo },
    commits: [
      {
        modified: input.filesChanged,
        message: `Sync ${input.commitSha || ""}`.trim(),
      },
    ],
    head_commit: {
      message: input.commitSha ? `Commit ${input.commitSha}` : "External push",
    },
  };

  if (input.branch) {
    payload.ref = `refs/heads/${input.branch}`;
  }

  return processGitHubPushSync(input.projectId, payload);
}
