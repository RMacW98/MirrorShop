export interface Mirror {
  id: string;
  name: string;
  type: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
}
