export type MirrorFinish = "polished" | "heat-soaked";

export interface MirrorOptions {
  finish: MirrorFinish;
  height: number; // cm
  width: number;  // cm
}

export interface Mirror {
  id: string;
  name: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}
