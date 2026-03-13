import { Router } from "express";
import { syncClickUpPayload } from "../services/clickupService.js";

const clickupRouter = Router();

clickupRouter.post("/sync", async (req, res) => {
  try {
    const result = await syncClickUpPayload(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default clickupRouter;
