import type { Mirror } from "../types/mirror.js";

export interface ProductRepository {
  findAll(): Promise<Mirror[]>;
  findById(id: string): Promise<Mirror | null>;
}
