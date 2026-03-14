// server.ts - Reloaded for optimization

import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { runPrdPipeline } from "./src/lib/pipeline/prdPipeline.js";
import { syncSprint } from "./src/lib/integrations/clickup.js";
import { SYSTEM_PROMPTS } from "./src/lib/ai/prompts.js";
import { generateJSONResponse } from "./src/lib/ai/gemini.js";
import {
  getClarifications,
  saveClarificationAnswer
} from "./src/lib/pipeline/clarificationService.js";
import clickupRouter from "./src/routes/clickup.js";
import slackRouter from "./src/routes/slack.js";
import githubWebhookRouter from "./src/webhooks/githubWebhook.js";
import clickupWebhookRouter from "./src/webhooks/clickupWebhook.js";
import slackWebhookRouter from "./src/webhooks/slackWebhook.js";

const { default: githubRouter } = await import("./src/routes/github.js");

dotenv.config();
dotenv.config({ debug: true });

const app = express();
const prisma = new PrismaClient();

// ==========================================
// GLOBAL ERROR HANDLERS (DEBUGGING)
// ==========================================
process.on('uncaughtException', (err) => {
  console.error('\n🔥 CRITICAL: UNCAUGHT EXCEPTION');
  console.error(err.stack || err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n⚠️ CRITICAL: UNHANDLED REJECTION');
  console.error('Reason:', reason);
});
// ==========================================

app.use(cors());
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);

app.get("/", (_req, res) => {
  res.status(200).json({ ok: true, service: "blueprint-backend" });
});

app.get("/healthz", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/github", githubRouter);
app.use("/api/clickup", clickupRouter);
app.use("/api/slack", slackRouter);
app.use("/webhooks", githubWebhookRouter);
app.use("/webhooks", clickupWebhookRouter);
app.use("/webhooks", slackWebhookRouter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure disk storage for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Serve static files from uploads folder
app.use('/uploads', express.static('uploads'));

/* =========================================================
   API ROUTES
========================================================= */

/**
 * 1. Upload PRD → Run AI pipeline → Save results
 */
app.post('/api/prd/upload', upload.single('prd'), async (req, res): Promise<any> => {
  try {
    console.log("\n=== INITIATING UPLOAD PROCESS ===");
    if (!req.file) return res.status(400).json({ error: 'No PDF uploaded.' });

    const { profileId, projectName, email } = req.body;
    console.log("-> 1. Received Profile ID:", profileId);
    console.log("-> 2. Received Email:", email);

    if (!profileId) {
      return res.status(400).json({ error: 'User profileId is required.' });
    }

    // ==========================================
    // THE BULLETPROOF PROFILE CHECK
    // ==========================================
    console.log("-> 3. Checking if Profile exists in database...");
    let userProfile = await prisma.profile.findUnique({
      where: { id: profileId }
    });

    if (!userProfile) {
      console.log("-> 4. Profile not found! Creating new Profile row...");
      userProfile = await prisma.profile.create({
        data: {
          id: profileId,
          email: email || `${profileId}@no-email.com`,
          name: "Developer"
        }
      });
      console.log("-> 5. Success: Profile created in DB!");
    } else {
      console.log("-> 4. Success: Profile already exists in DB.");
    }
    // ==========================================

    console.log("-> 6. Running Gemini AI Pipeline...");
    const pipelineResult = await runPrdPipeline({
      inlineData: {
        data: fs.readFileSync(req.file.path).toString("base64"),
        mimeType: req.file.mimetype,
      },
    });

    console.log("-> 7. Finding or Creating Project...");
    const reqProjectName = projectName || req.file.originalname.replace(".pdf", "");
    
    let project = await prisma.project.findFirst({
      where: {
        profileId: userProfile.id,
        name: reqProjectName,
      }
    });

    if (!project) {
      project = await prisma.project.create({
        data: {
          profileId: userProfile.id,
          name: reqProjectName,
        }
      });
    }

    const versionCount = await prisma.prdVersion.count({
      where: { projectId: project.id }
    });

    await prisma.prdVersion.create({
      data: {
        projectId: project.id,
        versionNumber: versionCount + 1,
        parsedText: "Extracted via Gemini AI",
        fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
        analysis: {
          create: {
            features: pipelineResult.features || [],
            stories: pipelineResult.stories || [],
            tasks: pipelineResult.tasks || [],
            sprints: pipelineResult.sprints || [],
            architecture: JSON.stringify(pipelineResult.architecture || {}),
            codeStructure: pipelineResult.codeStructure || [],
            tests: pipelineResult.tests || [],
            traceability: pipelineResult.traceability || {},
            healthScore: pipelineResult.healthScore || {},
            ambiguities: pipelineResult.ambiguities || [],
            clarifications: pipelineResult.clarifications || [],
            devops: pipelineResult.devops || {},
            requestlyConfig: pipelineResult.requestlyConfig || {},
          },
        },
      }
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        projectId: project.id,
        type: 'PRD_UPLOADED',
        description: versionCount === 0 
          ? `Initial PRD uploaded for ${project.name}`
          : `Updated PRD (v${versionCount + 1}) uploaded for ${project.name}`,
        metadata: { version: versionCount + 1 }
      }
    });

    console.log("=== UPLOAD COMPLETE & SAVED ===\n");

    return res.json({
      success: true,
      projectId: project.id,
      data: pipelineResult,
    });

  } catch (error: any) {
    console.error("\n❌ PIPELINE ERROR (FULL STACK):");
    console.error(error.stack || error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 1.5. Fetch Requestly Mock Config
 */
app.get("/api/projects/:projectId/requestly-export", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: { prdVersion: { projectId: req.params.projectId } },
    });

    if (!analysis || !analysis.requestlyConfig) {
      return res.status(404).json({ error: "No Requestly config found for this project." });
    }

    res.json(analysis.requestlyConfig);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 1.6. Fetch latest PRD
 */
app.get("/api/projects/:projectId/latest-prd", async (req, res) => {
  try {
    const prdVersion = await prisma.prdVersion.findFirst({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "desc" },
    });

    if (!prdVersion || !prdVersion.fileUrl) {
      return res.status(404).json({ error: "PDF not found" });
    }

    res.json({ fileUrl: prdVersion.fileUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 2. Fetch tasks
 */
app.get("/api/activities", async (req, res) => {
  try {
    const { profileId } = req.query;
    if (!profileId) return res.status(400).json({ error: "profileId required" });

    const activities = await prisma.activity.findMany({
      where: { project: { profileId: profileId as string } },
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(activities.map(a => ({
      ...a,
      projectName: a.project.name
    })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId/activities", async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      where: { projectId: req.params.projectId },
      orderBy: { createdAt: "desc" },
    });
    res.json(activities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/activities", async (req, res) => {
  try {
    const { projectId, type, description, metadata } = req.body;
    
    if (!projectId || !type || !description) {
      return res.status(400).json({ error: "projectId, type, and description are required" });
    }

    const activity = await prisma.activity.create({
      data: {
        projectId,
        type,
        description,
        metadata: metadata || {}
      }
    });

    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/projects/:projectId/tasks", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: {
        prdVersion: {
          projectId: req.params.projectId,
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({ error: "No analysis found" });
    }

    res.json(analysis.tasks);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. Fetch traceability graph
 */
app.get("/api/projects/:projectId/traceability", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: {
        prdVersion: {
          projectId: req.params.projectId,
        },
      },
    });

    if (!analysis || !analysis.traceability) {
      return res.status(404).json({
        error: "No traceability found",
      });
    }

    res.json(analysis.traceability);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. Fetch architecture graph
 */
app.get("/api/projects/:projectId/architecture", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: {
        prdVersion: {
          projectId: req.params.projectId,
        },
      },
    });

    if (!analysis || !analysis.architecture) {
      return res.status(404).json({
        error: "No architecture found",
      });
    }

    res.json(JSON.parse(analysis.architecture));

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. Fetch code structure
 */
app.get("/api/projects/:projectId/code-structure", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: {
        prdVersion: {
          projectId: req.params.projectId,
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({
        error: "No code structure found",
      });
    }

    res.json(analysis.codeStructure);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 6. Fetch tests
 */
app.get("/api/projects/:projectId/tests", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: {
        prdVersion: {
          projectId: req.params.projectId,
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({
        error: "No tests found",
      });
    }

    res.json(analysis.tests);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 7. Fetch DevOps configuration
 */
app.get("/api/projects/:projectId/devops", async (req, res) => {
  try {
    const analysis = await prisma.pipelineAnalysis.findFirst({
      where: {
        prdVersion: {
          projectId: req.params.projectId,
        },
      },
    });

    if (!analysis) {
      return res.status(404).json({
        error: "No DevOps configuration found",
      });
    }

    res.json(analysis.devops);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Push generated code to GitHub
 */
app.post("/api/push-to-github", async (req, res) => {
  try {
    const { createRepositoryForProfile, pushCodeToGitHub } = await import("./src/services/githubService.js");

    const { repoName, files, projectId, owner, profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: "profileId is required. Connect GitHub via OAuth first." });
    }

    const repo = await createRepositoryForProfile({
      profileId,
      name: repoName,
      description: "Generated by Architecture Assistant",
      isPrivate: true,
    });

    if (!repo?.name) {
      return res.status(500).json({ error: "Failed to create repository on GitHub." });
    }

    const gitOwner = owner || repo.owner;
    if (!gitOwner) {
      return res.status(500).json({ error: "Could not determine GitHub repository owner." });
    }

    const pushResult = await pushCodeToGitHub({
      owner: gitOwner,
      repo: repo.name,
      profileId,
      files,
      branch: "main",
      commitMessage: "feat: initial blueprint scaffold",
      projectId,
      createWebhook: Boolean(projectId),
    });

    res.json({ success: true, repo, pushResult });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * ClickUp OAuth Endpoints
 */
app.get("/api/clickup/auth-url", (req, res) => {
  const clientId = process.env.CLICKUP_CLIENT_ID;
  const redirectUri = process.env.CLICKUP_REDIRECT_URI || "http://localhost:8080/auth/clickup/callback";

  if (!clientId) {
    return res.status(500).json({ error: "CLICKUP_CLIENT_ID not configured in backend." });
  }

  const authUrl = `https://app.clickup.com/api?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  res.json({ url: authUrl });
});

app.post("/api/clickup/callback", async (req, res) => {
  try {
    const { code, profileId } = req.body;

    if (!code || !profileId) {
      return res.status(400).json({ error: "Authorization code and profileId are required" });
    }

    const clientId = process.env.CLICKUP_CLIENT_ID;
    const clientSecret = process.env.CLICKUP_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "ClickUp OAuth credentials not configured." });
    }

    // Exchange code for token
    const tokenResponse = await fetch(`https://api.clickup.com/api/v2/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.err || "Failed to exchange token with ClickUp");
    }

    // Save token to Profile DB
    await prisma.profile.update({
      where: { id: profileId },
      data: { clickupToken: tokenData.access_token }
    });

    res.json({ success: true, message: "ClickUp connected successfully!" });
  } catch (error: any) {
    console.error("ClickUp Callback Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/clickup/status", async (req, res) => {
  try {
    const { profileId } = req.query;
    if (!profileId) return res.status(400).json({ error: "profileId required" });

    const profile = await prisma.profile.findUnique({ where: { id: profileId as string } });

    if (!profile) return res.status(404).json({ error: "Profile not found" });

    res.json({ isConnected: !!profile.clickupToken });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Sync sprint to ClickUp
 */
app.post("/api/sync-clickup", async (req, res) => {
  try {
    const { projectId, profileId, sprint, listId } = req.body;

    if (!profileId || !listId) {
      return res.status(400).json({ error: "profileId and listId are required to sync to ClickUp" });
    }

    const profile = await prisma.profile.findUnique({
      where: { id: profileId }
    });

    if (!profile || !profile.clickupToken) {
      return res.status(403).json({ error: "ClickUp is not connected for this user." });
    }

    const result = await syncSprint(listId, sprint, profile.clickupToken);

    res.json({ success: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Handle AI Chat & Clarifications
 */
app.post("/api/chat", async (req, res): Promise<any> => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const responseSchema = {
      type: "object",
      properties: {
        reply: { type: "string" }
      },
      required: ["reply"]
    };

    const result = await generateJSONResponse<{ reply: string }>(
      SYSTEM_PROMPTS.CHAT_ASSISTANT,
      `Context: ${JSON.stringify(context || {})}\n\nUser Message: ${message}`,
      responseSchema as any
    );

    res.json({ success: true, reply: result.reply });

  } catch (err: any) {
    console.error("Chat API Error:", err);
    res.status(500).json({ error: "AI interaction failed. Please check backend logs." });
  }
});

/**
 * Export Requestly Mock Config
 */
app.get("/api/projects/:projectId/requestly-export", async (req: express.Request, res: express.Response) => {
  try {
    const projectId = req.params.projectId as string;

    const prdVersion = await prisma.prdVersion.findFirst({
      where: { projectId: projectId },
      include: { analysis: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!prdVersion || !("analysis" in prdVersion) || !prdVersion.analysis) {
      return res.status(404).json({ error: "No analysis found for this project." });
    }

    const config = (prdVersion.analysis as any).requestlyConfig || {};

    // Set headers to trigger download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=requestly-mocks-${projectId}.json`);
    res.send(JSON.stringify(config, null, 2));

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/* =========================================================
   SERVER
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Modular Gemini Backend running on http://localhost:${PORT}`
  );
});