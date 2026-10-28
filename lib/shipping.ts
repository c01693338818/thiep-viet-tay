// Bảng phí ship cố định. Đổi số ở đây là đủ, chưa cần API vận chuyển.
export const SHIPPING_ZONES = [
  { id: "hcm", label: "TP. Hồ Chí Minh", fee: 20000 },
  { id: "hn", label: "Hà Nội", fee: 25000 },
  { id: "other", label: "Tỉnh / thành khác", fee: 35000 },
] as const;

export type ShippingZoneId = (typeof SHIPPING_ZONES)[number]["id"];

export function getShippingFee(zone: ShippingZoneId) {
  return SHIPPING_ZONES.find((z) => z.id === zone)?.fee ?? SHIPPING_ZONES[2].fee;
}
