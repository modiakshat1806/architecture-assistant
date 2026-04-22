import crypto from "node:crypto";
import { Router } from "express";
import { handleSlackEvent } from "../services/slackService.js";
import { logIntegration } from "../services/integrationLogger.js";

const slackWebhookRouter = Router();

// ── Signature verification ───────────────────────────────────

function verifySlackSignature(
  rawBody: string,
  timestamp: string | undefined,
  signature: string | undefined,
  signingSecret: string
): boolean {
  if (!timestamp || !signature) return false;

  // Reject requests older than 5 minutes
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts) || Math.abs(Date.now() / 1000 - ts) > 300) return false;

  const baseString = `v0:${timestamp}:${rawBody}`;
  const expected = "v0=" + crypto.createHmac("sha256", signingSecret).update(baseString).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ── Webhook endpoint ─────────────────────────────────────────

slackWebhookRouter.post("/slack", async (req, res) => {
  try {
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (!signingSecret) {
      return res.status(500).json({ error: "SLACK_SIGNING_SECRET is not configured." });
    }

    const timestamp = req.header("x-slack-request-timestamp");
    const signature = req.header("x-slack-signature");
    const rawBody = (req as any).rawBody?.toString("utf8") || JSON.stringify(req.body || {});

    const valid = verifySlackSignature(rawBody, timestamp, signature, signingSecret);
    if (!valid) {
      logIntegration("slack_webhook_invalid_signature", {}, "error");
      return res.status(401).json({ error: "Invalid Slack signature." });
    }

    const body = req.body || {};

    // Handle Slack URL verification challenge
    if (body.type === "url_verification") {
      return res.json({ challenge: body.challenge });
    }

    // Handle slash commands (sent as application/x-www-form-urlencoded by Slack,
    // but we accept JSON-forwarded payloads too)
    if (body.command) {
      const result = await handleSlackEvent(body);
      logIntegration("slack_slash_command", { command: body.command, text: body.text });
      return res.json(result);
    }

    // Handle event callbacks
    if (body.type === "event_callback") {
      logIntegration("slack_event_callback", { eventType: body.event?.type });
      // Acknowledge immediately, process async if needed
      return res.json({ ok: true });
    }

    logIntegration("slack_webhook_unhandled", { type: body.type });
    return res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logIntegration("slack_webhook_error", { message }, "error");
    return res.status(500).json({ error: message });
  }
});

export default slackWebhookRouter;
