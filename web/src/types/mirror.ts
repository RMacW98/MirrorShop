export type MirrorFinish = "polished" | "heat-soaked";

export const FINISH_OPTIONS: MirrorFinish[] = ["polished", "heat-soaked"];

export const FINISH_LABELS: Record<MirrorFinish, string> = {
  polished: "Polished",
  "heat-soaked": "Heat soaked",
 };

export function normalizeFinishes(finishes: MirrorFinish[]): MirrorFinish[] {
  return FINISH_OPTIONS.filter((finish) => finishes.includes(finish));
}

export interface MirrorOptions {
  finishes: MirrorFinish[];
  height: number; // cm
  width: number;  // cm
}

export interface Mirror {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}
