import path from "node:path"
import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // We use the direct connection for migrations and pushes
    url: process.env.DIRECT_URL,
  },
})
