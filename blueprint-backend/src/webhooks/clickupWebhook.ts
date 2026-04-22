import { Router } from "express";

const clickupWebhookRouter = Router();

clickupWebhookRouter.post("/clickup", async (_req, res) => {
  res.json({ success: true, message: "ClickUp webhook received." });
});

export default clickupWebhookRouter;
