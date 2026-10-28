export type ProductType = "postcard" | "handwritten";

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  type: ProductType;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  postcard: "Postcard",
  handwritten: "Thiệp viết tay",
};

export const MAX_MESSAGE_LENGTH = 200;
