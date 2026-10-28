// Thông tin chuyển khoản. Điền trong .env: NEXT_PUBLIC_BANK_ID (mã ngân hàng VietQR, VD: VCB, MB, TCB),
// NEXT_PUBLIC_BANK_ACCOUNT, NEXT_PUBLIC_BANK_HOLDER.
export const bank = {
  id: process.env.NEXT_PUBLIC_BANK_ID ?? "",
  account: process.env.NEXT_PUBLIC_BANK_ACCOUNT ?? "",
  holder: process.env.NEXT_PUBLIC_BANK_HOLDER ?? "",
};

export const bankConfigured = Boolean(bank.id && bank.account);

// VietQR tạo ảnh QR động, quét là ra đúng số tiền + nội dung. Không cần tài khoản.
export function vietQrUrl(amount: number, content: string) {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: content,
    accountName: bank.holder,
  });
  return `https://img.vietqr.io/image/${bank.id}-${bank.account}-compact2.png?${params}`;
}
