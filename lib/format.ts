const vnd = new Intl.NumberFormat("vi-VN");

export function formatPrice(amount: number) {
  return `${vnd.format(amount)}đ`;
}

const dateTime = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

export function formatDate(iso: string) {
  return dateTime.format(new Date(iso));
}
