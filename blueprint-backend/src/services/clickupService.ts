export async function syncClickUpPayload(payload: unknown) {
  return {
    success: true,
    source: "clickup",
    message: "ClickUp service placeholder ready for integration.",
    received: Boolean(payload),
  };
}
