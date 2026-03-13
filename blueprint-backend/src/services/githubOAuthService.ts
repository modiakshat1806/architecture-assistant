import crypto from "node:crypto";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { decryptToken, encryptToken } from "./cryptoService.js";
import { logIntegration } from "./integrationLogger.js";

type GitHubPrismaClient = PrismaClient & {
  gitHubConnection: any;
};

const prisma = new PrismaClient() as GitHubPrismaClient;

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  timeout: 30000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  },
});

type OAuthState = {
  profileId: string;
  timestamp: number;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing from environment.`);
  }
  return value;
}

function signState(payloadB64: string): string {
  const secret = requireEnv("GITHUB_OAUTH_STATE_SECRET");
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("hex");
}

function makeState(profileId: string): string {
  const payload: OAuthState = { profileId, timestamp: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = signState(payloadB64);
  return `${payloadB64}.${signature}`;
}

function parseState(state: string): OAuthState {
  const [payloadB64, signature] = state.split(".");
  if (!payloadB64 || !signature) {
    throw new Error("OAuth state is malformed.");
  }

  const expected = signState(payloadB64);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("OAuth state signature is invalid.");
  }

  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as OAuthState;
  const ageMs = Date.now() - payload.timestamp;
  if (ageMs > 10 * 60 * 1000) {
    throw new Error("OAuth state expired. Please retry login.");
  }

  return payload;
}

export function buildGitHubOAuthStartUrl(profileId: string): string {
  const clientId = requireEnv("GITHUB_CLIENT_ID");
  const redirectUri = requireEnv("GITHUB_OAUTH_REDIRECT_URI");
  const state = makeState(profileId);

  const scopes = "repo workflow read:user admin:repo_hook";
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);

  logIntegration("oauth_start_url_created", {
    profileId,
    scopes,
  });

  return url.toString();
}

export async function completeGitHubOAuth(code: string, state: string) {
  const { profileId } = parseState(state);
  logIntegration("oauth_callback_received", { profileId });

  const clientId = requireEnv("GITHUB_CLIENT_ID");
  const clientSecret = requireEnv("GITHUB_CLIENT_SECRET");
  const redirectUri = requireEnv("GITHUB_OAUTH_REDIRECT_URI");

  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 30000,
    }
  );

  if (tokenRes.data?.error) {
    throw new Error(`GitHub OAuth token exchange failed: ${tokenRes.data.error_description || tokenRes.data.error}`);
  }

  const accessToken = tokenRes.data?.access_token as string | undefined;
  if (!accessToken) {
    throw new Error("GitHub did not return an access token.");
  }

  const userRes = await githubApi.get("/user", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const username = userRes.data?.login as string | undefined;
  const githubUserId = userRes.data?.id as number | undefined;
  if (!username || !githubUserId) {
    throw new Error("Could not load GitHub user profile after login.");
  }

  const encrypted = encryptToken(accessToken);

  const connection = await prisma.gitHubConnection.upsert({
    where: { profileId },
    update: {
      githubUserId,
      username,
      accessTokenEncrypted: encrypted,
      scope: tokenRes.data?.scope || null,
    },
    create: {
      profileId,
      githubUserId,
      username,
      accessTokenEncrypted: encrypted,
      scope: tokenRes.data?.scope || null,
    },
  });

  return {
    success: true,
    profileId,
    username: connection.username,
    githubUserId: connection.githubUserId,
  };
}

export async function getGitHubAccessTokenForProfile(profileId: string): Promise<string> {
  const connection = await prisma.gitHubConnection.findUnique({ where: { profileId } });
  if (!connection) {
    throw new Error("GitHub account is not connected for this profile.");
  }
  return decryptToken(connection.accessTokenEncrypted);
}

export async function listReposForProfile(profileId: string) {
  const token = await getGitHubAccessTokenForProfile(profileId);

  const res = await githubApi.get("/user/repos", {
    params: {
      sort: "updated",
      per_page: 100,
      affiliation: "owner,collaborator,organization_member",
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return (res.data || []).map((repo: any) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: repo.owner?.login,
    private: repo.private,
    defaultBranch: repo.default_branch,
    htmlUrl: repo.html_url,
  }));
}

export async function getGitHubConnection(profileId: string) {
  return prisma.gitHubConnection.findUnique({
    where: { profileId },
    select: {
      id: true,
      username: true,
      githubUserId: true,
      scope: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
