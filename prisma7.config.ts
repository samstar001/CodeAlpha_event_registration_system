// prisma7.config.ts — CLI-side config: tells Prisma commands (migrate, studio) where the DB is
import "dotenv/config"; // loads .env so env() below can read it
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma", // location of the schema file
  datasource: {
    url: env("DATABASE_URL"), // connection string used by CLI commands (migrate, studio)
  },
});
