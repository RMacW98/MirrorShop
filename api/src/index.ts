import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";

config({ path: join(dirname(fileURLToPath(import.meta.url)), "..", ".env") });

import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma.js";
import { createProductsRouter } from "./routes/products.js";
import { createAuthRouter } from "./routes/auth.js";
import { createOrdersRouter } from "./routes/orders.js";
import { PrismaProductRepository } from "./repositories/prisma-product.repository.js";

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set in .env. Auth will not work.");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const productRepository = new PrismaProductRepository();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", createAuthRouter());
app.use("/api/products", createProductsRouter(productRepository));
app.use("/api/orders", createOrdersRouter());

app.get("/api/debug/mirrors", async (_req, res) => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    const dbUrlRedacted = dbUrl ? dbUrl.replace(/:[^:@]+@/, ":****@") : "undefined";
    const raw = await prisma.$queryRaw`SELECT id, name, type FROM Mirror ORDER BY createdAt DESC`;
    const viaRepository = await productRepository.findAll();
    res.json({ databaseUrl: dbUrlRedacted, rawCount: Array.isArray(raw) ? raw.length : 0, raw, viaRepository });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Mirror Shop API running at http://localhost:${PORT}`);
});
