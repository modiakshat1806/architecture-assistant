type GitHubCommit = {
  id?: string;
  message?: string;
  timestamp?: string;
  added?: string[];
  removed?: string[];
  modified?: string[];
};

type GitHubPushPayload = {
  repository?: {
    full_name?: string;
    name?: string;
    html_url?: string;
  };
  ref?: string;
  commits?: GitHubCommit[];
  head_commit?: GitHubCommit;
};

export type DiffSummary = {
  changedFiles: string[];
  affectedFeatures: Array<{ name: string; description: string; priority: "medium" | "high" }>;
  generatedTasks: Array<{
    type: string;
    id: string;
    storyId: string;
    title: string;
    description: string;
    complexity: number;
    dependencies: string[];
  }>;
  impact: {
    source: "github_push";
    repo: string;
    branch: string;
    commitCount: number;
    lastCommitMessage: string;
    changedFiles: string[];
    updatedAt: string;
  };
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function toFeatureFromFile(filePath: string): { name: string; description: string; priority: "medium" | "high" } {
  if (filePath.startsWith("src/pages/")) {
    return {
      name: "Dashboard Pages",
      description: "UI page logic changed from GitHub sync events.",
      priority: "high",
    };
  }

  if (filePath.startsWith("src/components/")) {
    return {
      name: "UI Components",
      description: "Component-level updates detected from GitHub push.",
      priority: "medium",
    };
  }

  if (filePath.startsWith("blueprint-backend/")) {
    return {
      name: "Backend Services",
      description: "Backend route/service updates detected from GitHub push.",
      priority: "high",
    };
  }

  return {
    name: "Repository Updates",
    description: "General repository changes detected from GitHub push.",
    priority: "medium",
  };
}

export function analyzeGitHubPush(payload: GitHubPushPayload): DiffSummary {
  const commits = payload.commits || [];

  const changedFiles = unique(
    commits.flatMap((commit) => [
      ...(commit.added || []),
      ...(commit.modified || []),
      ...(commit.removed || []),
    ])
  );

  const affectedFeatures = unique(changedFiles.map((filePath) => JSON.stringify(toFeatureFromFile(filePath)))).map(
    (feature) => JSON.parse(feature)
  ) as DiffSummary["affectedFeatures"];

  const generatedTasks = changedFiles.slice(0, 20).map((filePath, index) => ({
    type: "sync",
    id: `sync-${Date.now()}-${index + 1}`,
    storyId: "github-sync",
    title: `Review change in ${filePath}`,
    description: `GitHub webhook detected an update in ${filePath}. Validate impact on dashboard artifacts.`,
    complexity: 1,
    dependencies: [],
  }));

  const branch = payload.ref?.replace("refs/heads/", "") || "unknown";
  const repo = payload.repository?.full_name || payload.repository?.name || "unknown";

  return {
    changedFiles,
    affectedFeatures,
    generatedTasks,
    impact: {
      source: "github_push",
      repo,
      branch,
      commitCount: commits.length,
      lastCommitMessage: payload.head_commit?.message || commits[commits.length - 1]?.message || "",
      changedFiles,
      updatedAt: new Date().toISOString(),
    },
  };
}
