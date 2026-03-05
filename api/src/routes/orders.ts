import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

interface OrderLineInput {
  productId: string;
  productName: string;
  quantity: number;
  finish: string;
  height: number;
  width: number;
}

interface CreateOrderBody {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  lines: OrderLineInput[];
}

router.post("/", async (req, res) => {
  try {
    const body = req.body as CreateOrderBody;
    const { customerName, customerEmail, customerPhone, lines } = body;

    if (
      !customerName ||
      typeof customerName !== "string" ||
      !customerName.trim()
    ) {
      res.status(400).json({ error: "customerName is required" });
      return;
    }
    if (
      !customerEmail ||
      typeof customerEmail !== "string" ||
      !customerEmail.trim()
    ) {
      res.status(400).json({ error: "customerEmail is required" });
      return;
    }
    if (
      !customerPhone ||
      typeof customerPhone !== "string" ||
      !customerPhone.trim()
    ) {
      res.status(400).json({ error: "customerPhone is required" });
      return;
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      res.status(400).json({ error: "At least one order line is required" });
      return;
    }

    for (const line of lines) {
      if (
        !line.productId ||
        !line.productName ||
        typeof line.quantity !== "number" ||
        line.quantity < 1 ||
        !line.finish ||
        typeof line.height !== "number" ||
        typeof line.width !== "number"
      ) {
        res.status(400).json({
          error:
            "Each line must have productId, productName, quantity, finish, height, width",
        });
        return;
      }
    }

    const order = await prisma.order.create({
      data: {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        lines: {
          create: lines.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            quantity: l.quantity,
            finish: l.finish,
            height: l.height,
            width: l.width,
          })),
        },
      },
      include: {
        lines: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

export function createOrdersRouter(): Router {
  return router;
}
