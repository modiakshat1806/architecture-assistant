declare module "./src/services/githubService.js" {
  export function createRepositoryForProfile(input: {
    profileId: string;
    name: string;
    description?: string;
    isPrivate?: boolean;
  }): Promise<any>;

  export function pushCodeToGitHub(input: {
    owner: string;
    repo: string;
    profileId?: string;
    projectId?: string;
    files: Array<{ path: string; content: string }>;
    branch?: string;
    commitMessage?: string;
    createWebhook?: boolean;
  }): Promise<any>;
}

declare module "./src/routes/github.js" {
  const router: any;
  export default router;
}
