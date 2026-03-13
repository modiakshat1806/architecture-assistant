import { PrismaClient } from "@prisma/client";
import { sendMessage, formatBlockKitMessage, type SlackEventType } from "./slackService.js";
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

/**
 * Fire-and-forget Slack notification.
 * Call this from anywhere in the backend when an event occurs.
 * If Slack is not connected or inactive, this is a silent no-op.
 */
export async function notifySlack(
  profileId: string,
  eventType: SlackEventType,
  data: Record<string, any>
): Promise<void> {
  try {
    const rows: any[] = await getPrisma().$queryRawUnsafe(
      `SELECT * FROM "SlackIntegration" WHERE "profileId" = $1::uuid LIMIT 1`,
      profileId
    );
    const integration = rows.length > 0 ? rows[0] : null;

    // No integration or explicitly disabled → do nothing
    if (!integration || !integration.isActive) return;

    // Need a selected channel to post to
    const channel = integration.channelId;
    if (!channel) {
      logIntegration("slack_notify_skip_no_channel", { profileId, eventType });
      return;
    }

    const blocks = formatBlockKitMessage(eventType, data);
    await sendMessage(profileId, channel, blocks, `${eventType}: ${data.name || data.title || ""}`);

    // Log success
    await getPrisma().$executeRawUnsafe(
      `INSERT INTO "SlackEventLog" ("id", "slackIntegrationId", "eventType", "payload", "status", "createdAt")
       VALUES (gen_random_uuid(), $1::uuid, $2, $3::jsonb, 'sent', NOW())`,
      integration.id,
      eventType,
      JSON.stringify(data)
    );
  } catch (error) {
    // Log failure but never throw – notifications must not break the main flow
    const message = error instanceof Error ? error.message : "Unknown error";
    logIntegration("slack_notify_error", { profileId, eventType, message }, "error");

    try {
      const rows: any[] = await getPrisma().$queryRawUnsafe(
        `SELECT "id" FROM "SlackIntegration" WHERE "profileId" = $1::uuid LIMIT 1`,
        profileId
      );
      if (rows.length > 0) {
        await getPrisma().$executeRawUnsafe(
          `INSERT INTO "SlackEventLog" ("id", "slackIntegrationId", "eventType", "payload", "status", "errorMessage", "createdAt")
           VALUES (gen_random_uuid(), $1::uuid, $2, $3::jsonb, 'failed', $4, NOW())`,
          rows[0].id,
          eventType,
          JSON.stringify(data),
          message
        );
      }
    } catch {
      // Swallow logging errors
    }
  }
}
