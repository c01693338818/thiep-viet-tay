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

export type PaymentMethod = "cod" | "bank_transfer";

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  cod: "Thanh toán khi nhận hàng (COD)",
  bank_transfer: "Chuyển khoản ngân hàng",
};

export type OrderStatus = "new" | "confirmed" | "writing" | "shipped" | "done" | "cancelled";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Mới đặt",
  confirmed: "Đã xác nhận",
  writing: "Đang viết thiệp",
  shipped: "Đang giao",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
};

export type Order = {
  id: string;
  code: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string | null;
  shipping_fee: number;
  total: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  tracking_code: string | null;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  price: number;
  quantity: number;
  custom_message: string | null;
  proof_image_url: string | null;
};
