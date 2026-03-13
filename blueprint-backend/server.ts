// server.ts

import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import { runPrdPipeline } from "./src/lib/pipeline/prdPipeline.js";
import { createRepo, pushFiles } from "./src/lib/integrations/github.js";
import { syncSprint } from "./src/lib/integrations/clickup.js";
dotenv.config({ debug: true });

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

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

    const documentPart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    console.log("-> 6. Running Gemini AI Pipeline...");
    const pipelineResult = await runPrdPipeline(documentPart);

    console.log("-> 7. Saving Project & AI Analysis to DB...");
    const savedProject = await prisma.project.create({
      data: {
        profileId: userProfile.id, // Safely use the confirmed profile ID
        name: projectName || req.file.originalname.replace(".pdf", ""),
        prdVersions: {
          create: {
            versionNumber: 1,
            parsedText: "Extracted via Gemini AI",
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
                devops: pipelineResult.devops || {},
              },
            },
          },
        },
      },
      include: {
        prdVersions: {
          include: {
            analysis: true,
          },
        },
      },
    });

    console.log("=== UPLOAD COMPLETE & SAVED ===\n");

    return res.json({
      success: true,
      projectId: savedProject.id,
      data: pipelineResult,
    });

  } catch (error: any) {
    console.error("\n❌ PIPELINE ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * 2. Fetch tasks
 */
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

    const { repoName, files } = req.body;

    const repo = await createRepo(
      repoName,
      "Generated by Architecture Assistant"
    );

    await pushFiles(
      process.env.GITHUB_USERNAME!,
      repo.name,
      files,
      "main"
    );

    res.json({ success: true, repo });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Sync sprint to ClickUp
 */
app.post("/api/sync-clickup", async (req, res) => {
  try {

    const { projectId, sprint } = req.body;

    const result = await syncSprint(projectId, sprint);

    res.json({ success: true, result });

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