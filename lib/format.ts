const vnd = new Intl.NumberFormat("vi-VN");

export function formatPrice(amount: number) {
  return `${vnd.format(amount)}đ`;
}
