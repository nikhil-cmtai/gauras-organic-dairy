export interface Product {
  _id?: string;
  name: string;
  price: number;
  image: string[];  // Changed from images to image to match backend
  categoryId: string;
  description: string;
  company: string;
  productCode: string;
  __v?: number;
} 