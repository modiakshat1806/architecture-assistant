import { Router } from "express";
import { postSlackUpdate } from "../services/slackService.js";

const slackRouter = Router();

slackRouter.post("/notify", async (req, res) => {
  try {
    const result = await postSlackUpdate(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default slackRouter;
