export interface Mirror {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
}
