import { Router } from "express";
import type { ProductRepository } from "../repositories/product.repository.js";

export function createProductsRouter(repository: ProductRepository): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const products = await repository.findAll();
      res.json(products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      const product = await repository.findById(req.params.id);
      if (!product) {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      res.json(product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  return router;
}
