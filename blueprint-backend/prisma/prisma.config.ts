import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // The Prisma CLI uses the DIRECT_URL to build/push your tables
    url: env("DIRECT_URL"), 
  },
});