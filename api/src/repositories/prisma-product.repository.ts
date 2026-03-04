import { prisma } from "../lib/prisma.js";
import type { ProductRepository } from "./product.repository.js";
import type { Mirror } from "../types/mirror.js";

export class PrismaProductRepository implements ProductRepository {
  async findAll(): Promise<Mirror[]> {
    const mirrors = await prisma.mirror.findMany({
      orderBy: { createdAt: "desc" },
    });
    return mirrors.map(this.toMirror);
  }

  async findById(id: string): Promise<Mirror | null> {
    const mirror = await prisma.mirror.findUnique({
      where: { id },
    });
    return mirror ? this.toMirror(mirror) : null;
  }

  private toMirror(row: {
    id: string;
    name: string;
    type: string;
    price: number;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
  }): Mirror {
    return {
      id: row.id,
      name: row.name,
      type: row.type,
      price: row.price,
      description: row.description,
      imageUrl: row.imageUrl,
      createdAt: row.createdAt,
    };
  }
}
