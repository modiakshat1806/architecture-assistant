type LogLevel = "info" | "warn" | "error";

export function logIntegration(event: string, data: Record<string, unknown> = {}, level: LogLevel = "info") {
  const entry = {
    ts: new Date().toISOString(),
    domain: "github-integration",
    level,
    event,
    ...data,
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
    return;
  }

  if (level === "warn") {
    console.warn(JSON.stringify(entry));
    return;
  }

  console.info(JSON.stringify(entry));
}
