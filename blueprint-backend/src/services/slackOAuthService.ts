import crypto from "node:crypto";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { encryptToken } from "./cryptoService.js";
import { logIntegration } from "./integrationLogger.js";

// Lazy init — pass datasourceUrl directly to bypass stale Prisma client env() resolution
let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL!,
    });
  }
  return _prisma;
}

// ── Helpers ──────────────────────────────────────────────────

type OAuthState = { profileId: string; timestamp: number };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is missing from environment.`);
  return value;
}

function signState(payloadB64: string): string {
  // Reuse the same HMAC secret already used by GitHub OAuth
  const secret = requireEnv("GITHUB_OAUTH_STATE_SECRET");
  return crypto.createHmac("sha256", secret).update(payloadB64).digest("hex");
}

function makeState(profileId: string): string {
  const payload: OAuthState = { profileId, timestamp: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${payloadB64}.${signState(payloadB64)}`;
}

function parseState(state: string): OAuthState {
  const [payloadB64, signature] = state.split(".");
  if (!payloadB64 || !signature) throw new Error("Slack OAuth state is malformed.");

  const expected = signState(payloadB64);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error("Slack OAuth state signature is invalid.");
  }

  const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as OAuthState;
  if (Date.now() - payload.timestamp > 10 * 60 * 1000) {
    throw new Error("Slack OAuth state expired. Please retry.");
  }
  return payload;
}

// ── Public API ───────────────────────────────────────────────

export function buildSlackOAuthStartUrl(profileId: string): string {
  const clientId = requireEnv("SLACK_CLIENT_ID");
  const redirectUri = requireEnv("SLACK_OAUTH_REDIRECT_URI");
  const teamId = process.env.SLACK_TEAM_ID;
  const state = makeState(profileId);

  const scopes = "channels:read,chat:write,commands,groups:read";

  const url = new URL("https://slack.com/oauth/v2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);

  if (teamId) {
    url.searchParams.set("team", teamId);
  }

  logIntegration("slack_oauth_start_url_created", { profileId, scopes, teamId });
  return url.toString();
}

export async function completeSlackOAuth(code: string, state: string) {
  const { profileId } = parseState(state);
  logIntegration("slack_oauth_callback_received", { profileId });

  const clientId = requireEnv("SLACK_CLIENT_ID");
  const clientSecret = requireEnv("SLACK_CLIENT_SECRET");
  const redirectUri = requireEnv("SLACK_OAUTH_REDIRECT_URI");

  const tokenRes = await axios.post(
    "https://slack.com/api/oauth.v2.access",
    new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }).toString(),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 30000,
    }
  );

  const data = tokenRes.data;
  if (!data?.ok) {
    throw new Error(`Slack OAuth failed: ${data?.error || "unknown_error"}`);
  }

  const botToken = data.access_token as string;
  const workspaceId = data.team?.id as string;
  const workspaceName = (data.team?.name as string) || null;
  const scope = (data.scope as string) || null;

  if (!botToken || !workspaceId) {
    throw new Error("Slack did not return a valid bot token or team ID.");
  }

  const encrypted = encryptToken(botToken);

  // ── Use raw SQL to bypass stale Prisma client (OneDrive blocks prisma generate) ──

  console.log("[SLACK_OAUTH] Using RAW SQL path. profileId =", profileId);
  console.log("[SLACK_OAUTH] profileId type:", typeof profileId, "length:", profileId.length);

  // 1. Ensure the Profile row exists
  console.log("[SLACK_OAUTH] Step 1: Upserting Profile...");
  await getPrisma().$executeRawUnsafe(
    `INSERT INTO "Profile" ("id", "email", "name", "createdAt", "updatedAt")
     VALUES ($1::uuid, $2, $3, NOW(), NOW())
     ON CONFLICT ("id") DO NOTHING`,
    profileId,
    `${profileId}@slack-oauth.local`,
    "User"
  );
  console.log("[SLACK_OAUTH] Step 1 complete: Profile ensured.");

  // 2. Upsert SlackIntegration
  console.log("[SLACK_OAUTH] Step 2: Upserting SlackIntegration...");
  await getPrisma().$executeRawUnsafe(
    `INSERT INTO "SlackIntegration" ("id", "profileId", "workspaceId", "workspaceName", "botTokenEncrypted", "scope", "isActive", "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5, true, NOW(), NOW())
     ON CONFLICT ("profileId") DO UPDATE SET
       "workspaceId" = EXCLUDED."workspaceId",
       "workspaceName" = EXCLUDED."workspaceName",
       "botTokenEncrypted" = EXCLUDED."botTokenEncrypted",
       "scope" = EXCLUDED."scope",
       "isActive" = true,
       "updatedAt" = NOW()`,
    profileId,
    workspaceId,
    workspaceName,
    encrypted,
    scope
  );
  console.log("[SLACK_OAUTH] Step 2 complete: SlackIntegration ensured.");

  logIntegration("slack_oauth_complete", { profileId, workspaceId, workspaceName });

  return {
    success: true,
    profileId,
    workspaceId,
    workspaceName,
  };
}

export async function getSlackConnection(profileId: string) {
  const rows: any[] = await getPrisma().$queryRawUnsafe(
    `SELECT "id", "workspaceId", "workspaceName", "channelId", "channelName",
            "isActive", "scope", "createdAt", "updatedAt"
     FROM "SlackIntegration"
     WHERE "profileId" = $1::uuid
     LIMIT 1`,
    profileId
  );
  return rows.length > 0 ? rows[0] : null;
}
