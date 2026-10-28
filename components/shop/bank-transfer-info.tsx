import Image from "next/image";
import { bank, bankConfigured, vietQrUrl } from "@/lib/bank";
import { formatPrice } from "@/lib/format";

export function BankTransferInfo({ amount, code }: { amount: number; code: string }) {
  if (!bankConfigured) {
    return (
      <div className="rounded-xl bg-muted/50 p-5 text-sm ring-1 ring-foreground/10">
        <p className="font-medium">Chuyển khoản</p>
        <p className="mt-1 text-muted-foreground">
          Chúng mình sẽ liên hệ qua số điện thoại bạn để lại để gửi thông tin chuyển khoản.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 rounded-xl bg-muted/50 p-5 ring-1 ring-foreground/10 sm:grid-cols-[200px_1fr]">
      <Image
        src={vietQrUrl(amount, code)}
        alt={`Mã QR chuyển khoản ${formatPrice(amount)}`}
        width={200}
        height={260}
        unoptimized
        className="mx-auto rounded-lg bg-white"
      />
      <div className="flex flex-col gap-2 text-sm">
        <p className="font-medium">Quét mã hoặc chuyển khoản thủ công</p>
        <Field label="Ngân hàng" value={bank.id} />
        <Field label="Số tài khoản" value={bank.account} mono />
        <Field label="Chủ tài khoản" value={bank.holder} />
        <Field label="Số tiền" value={formatPrice(amount)} />
        <Field label="Nội dung" value={code} mono />
        <p className="mt-2 text-xs text-muted-foreground">
          Ghi đúng nội dung <strong>{code}</strong> để chúng mình đối soát nhanh. Đơn sẽ được
          xác nhận trong vòng vài giờ sau khi nhận được tiền.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}
