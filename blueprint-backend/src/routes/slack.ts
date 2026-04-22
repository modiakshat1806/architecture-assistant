import { Router } from "express";
import {
  buildSlackOAuthStartUrl,
  completeSlackOAuth,
  getSlackConnection,
} from "../services/slackOAuthService.js";
import {
  fetchChannels,
  selectChannel,
  sendMessage,
  disconnectWorkspace,
  formatBlockKitMessage,
} from "../services/slackService.js";
import { logIntegration } from "../services/integrationLogger.js";

const slackRouter = Router();

// ── OAuth ────────────────────────────────────────────────────

slackRouter.get("/oauth/start", async (req, res) => {
  try {
    const profileId = String(req.query.profileId || "");
    if (!profileId) {
      return res.status(400).json({ error: "profileId is required." });
    }

    logIntegration("slack_oauth_start", { profileId });
    const url = buildSlackOAuthStartUrl(profileId);
    return res.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

slackRouter.get("/oauth/callback", async (req, res) => {
  try {
    const code = String(req.query.code || "");
    const state = String(req.query.state || "");

    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state in callback." });
    }

    const result = await completeSlackOAuth(code, state);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const redirect = new URL("/dashboard/automation", frontendUrl);
    redirect.searchParams.set("slack", "connected");
    redirect.searchParams.set("profileId", result.profileId);

    logIntegration("slack_oauth_callback_success", {
      profileId: result.profileId,
      workspaceId: result.workspaceId,
    });

    return res.redirect(redirect.toString());
  } catch (error) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const redirect = new URL("/dashboard/automation", frontendUrl);
    redirect.searchParams.set("slack", "error");
    redirect.searchParams.set(
      "message",
      error instanceof Error ? error.message : "Unknown error"
    );
    logIntegration(
      "slack_oauth_callback_error",
      { message: error instanceof Error ? error.message : "Unknown error" },
      "error"
    );

    return res.redirect(redirect.toString());
  }
});

// ── Connection status ────────────────────────────────────────

slackRouter.get("/connection", async (req, res) => {
  try {
    const profileId = String(req.query.profileId || "");
    if (!profileId) {
      return res.status(400).json({ error: "profileId is required." });
    }

    const connection = await getSlackConnection(profileId);
    return res.json({ connected: Boolean(connection), connection });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ── Channels ─────────────────────────────────────────────────

slackRouter.get("/channels", async (req, res) => {
  try {
    const profileId = String(req.query.profileId || "");
    if (!profileId) {
      return res.status(400).json({ error: "profileId is required." });
    }

    const channels = await fetchChannels(profileId);
    return res.json({ channels });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

slackRouter.post("/channel/select", async (req, res) => {
  try {
    const { profileId, channelId, channelName } = req.body || {};
    if (!profileId || !channelId) {
      return res.status(400).json({ error: "profileId and channelId are required." });
    }

    const updated = await selectChannel(profileId, channelId, channelName || channelId);
    return res.json({ success: true, channelId: updated.channelId, channelName: updated.channelName });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ── Test message ─────────────────────────────────────────────

slackRouter.post("/test", async (req, res) => {
  try {
    const { profileId, channel } = req.body || {};
    if (!profileId) {
      return res.status(400).json({ error: "profileId is required." });
    }

    const connection = await getSlackConnection(profileId);
    if (!connection) {
      return res.status(400).json({ error: "Slack is not connected." });
    }

    const targetChannel = channel || connection.channelId;
    if (!targetChannel) {
      return res.status(400).json({ error: "No channel specified or selected." });
    }

    const blocks = formatBlockKitMessage("TASK_CREATED", {
      projectName: "Test Project",
      name: "Example Task",
      description: "This is a test message from Architecture Assistant.",
      status: "To Do",
      priority: "High",
    });

    const result = await sendMessage(profileId, targetChannel, blocks, "Test message from Architecture Assistant");
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

// ── Disconnect ───────────────────────────────────────────────

slackRouter.post("/disconnect", async (req, res) => {
  try {
    const { profileId } = req.body || {};
    if (!profileId) {
      return res.status(400).json({ error: "profileId is required." });
    }

    const result = await disconnectWorkspace(profileId);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
});

export default slackRouter;
