import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { decryptToken, encryptToken } from "./cryptoService.js";
import { logIntegration } from "./integrationLogger.js";

// Lazy init — created on first call, after dotenv.config() has run in server.ts
let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL!,
    });
  }
  return _prisma;
}

const slackApi = axios.create({
  baseURL: "https://slack.com/api",
  timeout: 30000,
});

// ── Types ────────────────────────────────────────────────────

export type SlackEventType =
  | "PRD_CREATED"
  | "PRD_UPDATED"
  | "FEATURE_ADDED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED";

interface SlackBlock {
  type: string;
  [key: string]: unknown;
}

// ── Raw SQL helpers ──────────────────────────────────────────

async function getIntegration(profileId: string): Promise<any | null> {
  const rows: any[] = await getPrisma().$queryRawUnsafe(
    `SELECT * FROM "SlackIntegration" WHERE "profileId" = $1::uuid LIMIT 1`,
    profileId
  );
  return rows.length > 0 ? rows[0] : null;
}

// ── Core functions ───────────────────────────────────────────

export async function connectWorkspace(
  profileId: string,
  data: {
    workspaceId: string;
    workspaceName?: string;
    botToken: string;
    scope?: string;
  }
) {
  const encrypted = encryptToken(data.botToken);

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
    data.workspaceId,
    data.workspaceName || null,
    encrypted,
    data.scope || null
  );

  return getIntegration(profileId);
}

export async function fetchChannels(profileId: string) {
  const integration = await getIntegration(profileId);
  if (!integration) throw new Error("Slack is not connected for this profile.");

  const botToken = decryptToken(integration.botTokenEncrypted);

  const res = await slackApi.get("/conversations.list", {
    params: { types: "public_channel,private_channel", limit: 200, exclude_archived: true },
    headers: { Authorization: `Bearer ${botToken}` },
  });

  if (!res.data?.ok) {
    throw new Error(`Slack conversations.list failed: ${res.data?.error || "unknown"}`);
  }

  const channels = (res.data.channels || []).map((ch: any) => ({
    slackChannelId: ch.id,
    name: ch.name,
    isMember: ch.is_member,
  }));

  // Cache channels in DB using raw SQL
  for (const ch of channels) {
    await getPrisma().$executeRawUnsafe(
      `INSERT INTO "SlackChannel" ("id", "slackIntegrationId", "slackChannelId", "name", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, NOW(), NOW())
       ON CONFLICT ("slackIntegrationId", "slackChannelId") DO UPDATE SET
         "name" = EXCLUDED."name",
         "updatedAt" = NOW()`,
      integration.id,
      ch.slackChannelId,
      ch.name
    );
  }

  return channels;
}

export async function selectChannel(profileId: string, channelId: string, channelName: string) {
  const integration = await getIntegration(profileId);
  if (!integration) throw new Error("Slack is not connected for this profile.");

  // Deselect all channels
  await getPrisma().$executeRawUnsafe(
    `UPDATE "SlackChannel" SET "isSelected" = false, "updatedAt" = NOW() WHERE "slackIntegrationId" = $1::uuid`,
    integration.id
  );

  // Select the chosen channel
  await getPrisma().$executeRawUnsafe(
    `UPDATE "SlackChannel" SET "isSelected" = true, "updatedAt" = NOW()
     WHERE "slackIntegrationId" = $1::uuid AND "slackChannelId" = $2`,
    integration.id,
    channelId
  );

  // Save selected channel on integration
  await getPrisma().$executeRawUnsafe(
    `UPDATE "SlackIntegration" SET "channelId" = $1, "channelName" = $2, "updatedAt" = NOW()
     WHERE "profileId" = $3::uuid`,
    channelId,
    channelName,
    profileId
  );

  return getIntegration(profileId);
}

export async function sendMessage(profileId: string, channel: string, blocks: SlackBlock[], text?: string) {
  const integration = await getIntegration(profileId);
  if (!integration) throw new Error("Slack is not connected for this profile.");

  const botToken = decryptToken(integration.botTokenEncrypted);

  const res = await slackApi.post(
    "/chat.postMessage",
    {
      channel,
      blocks,
      text: text || "Architecture Assistant notification",
    },
    { headers: { Authorization: `Bearer ${botToken}`, "Content-Type": "application/json" } }
  );

  if (!res.data?.ok) {
    throw new Error(`Slack chat.postMessage failed: ${res.data?.error || "unknown"}`);
  }

  logIntegration("slack_message_sent", { profileId, channel });
  return { success: true, ts: res.data.ts, channel: res.data.channel };
}

export async function disconnectWorkspace(profileId: string) {
  const integration = await getIntegration(profileId);
  if (!integration) throw new Error("Slack is not connected for this profile.");

  await getPrisma().$executeRawUnsafe(`DELETE FROM "SlackEventLog" WHERE "slackIntegrationId" = $1::uuid`, integration.id);
  await getPrisma().$executeRawUnsafe(`DELETE FROM "SlackChannel" WHERE "slackIntegrationId" = $1::uuid`, integration.id);
  await getPrisma().$executeRawUnsafe(`DELETE FROM "SlackIntegration" WHERE "profileId" = $1::uuid`, profileId);

  logIntegration("slack_disconnected", { profileId });
  return { success: true };
}

export async function getSlackConnection(profileId: string) {
  return getIntegration(profileId);
}

// ── Slash command handler ────────────────────────────────────

export async function handleSlackEvent(payload: any) {
  const command = payload?.command;
  const text = (payload?.text || "").trim();

  if (command === "/task") {
    const [action, ...rest] = text.split(/\s+/);
    const detail = rest.join(" ");

    switch (action) {
      case "create":
        return { response_type: "ephemeral", text: `🆕 Task creation requested: "${detail || "(no title)"}".
Use the Architecture Assistant dashboard to create tasks from your PRD.` };
      case "update":
        return { response_type: "ephemeral", text: `✏️ Task update requested: "${detail || "(no id)"}".
Use the Architecture Assistant dashboard to update tasks.` };
      case "list":
        return { response_type: "ephemeral", text: `📋 Listing tasks is available in the Architecture Assistant dashboard.
Visit your project's Tasks page.` };
      default:
        return { response_type: "ephemeral", text: `Unknown /task command: "${action}".
Available: create, update, list` };
    }
  }

  return { response_type: "ephemeral", text: "Unknown command." };
}

// ── Block Kit message formatter ──────────────────────────────

export function formatBlockKitMessage(eventType: SlackEventType, data: Record<string, any>): SlackBlock[] {
  const emojiMap: Record<SlackEventType, string> = {
    PRD_CREATED: "📄",
    PRD_UPDATED: "📝",
    FEATURE_ADDED: "✨",
    TASK_CREATED: "🆕",
    TASK_UPDATED: "✏️",
    TASK_COMPLETED: "✅",
  };

  const titleMap: Record<SlackEventType, string> = {
    PRD_CREATED: "New PRD Created",
    PRD_UPDATED: "PRD Updated",
    FEATURE_ADDED: "Feature Added",
    TASK_CREATED: "Task Created",
    TASK_UPDATED: "Task Updated",
    TASK_COMPLETED: "Task Completed",
  };

  const emoji = emojiMap[eventType] || "📌";
  const title = titleMap[eventType] || eventType;

  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${emoji} ${title}`, emoji: true },
    },
    { type: "divider" },
  ];

  // Dynamic fields based on event data
  const fields: string[] = [];
  if (data.projectName) fields.push(`*Project:* ${data.projectName}`);
  if (data.name || data.title) fields.push(`*Name:* ${data.name || data.title}`);
  if (data.description) fields.push(`*Description:* ${data.description}`);
  if (data.status) fields.push(`*Status:* ${data.status}`);
  if (data.assignee) fields.push(`*Assignee:* ${data.assignee}`);
  if (data.priority) fields.push(`*Priority:* ${data.priority}`);
  if (data.versionNumber) fields.push(`*Version:* v${data.versionNumber}`);

  if (fields.length > 0) {
    blocks.push({
      type: "section",
      fields: fields.map((f) => ({ type: "mrkdwn", text: f })),
    });
  }

  // Context footer
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `Sent from *Architecture Assistant* • ${new Date().toLocaleString()}`,
      },
    ],
  });

  return blocks;
}

// Keep backward-compatible export
export async function postSlackUpdate(payload: unknown) {
  return {
    success: true,
    source: "slack",
    message: "Slack service ready. Use /api/slack routes for full integration.",
    received: Boolean(payload),
  };
}
