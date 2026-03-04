import express from "express";
import cors from "cors";
import { createProductsRouter } from "./routes/products.js";
import { PrismaProductRepository } from "./repositories/prisma-product.repository.js";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const productRepository = new PrismaProductRepository();

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/products", createProductsRouter(productRepository));

app.listen(PORT, () => {
  console.log(`Mirror Shop API running at http://localhost:${PORT}`);
});
