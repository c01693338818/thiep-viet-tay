"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { resizeImage } from "@/lib/resize-image";

type Props = Omit<React.ComponentProps<typeof Input>, "type" | "accept" | "onChange">;

// Ô chọn ảnh tự nén trước khi submit form (thay file trong input bằng bản đã nén).
export function ImageInput(props: Props) {
  const [status, setStatus] = useState<string>("");

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) {
      setStatus("");
      return;
    }
    setStatus("Đang nén ảnh…");
    try {
      const resized = await resizeImage(file);
      const dt = new DataTransfer();
      dt.items.add(resized);
      input.files = dt.files;
      setStatus(`Đã nén: ${Math.round(resized.size / 1024)} KB`);
    } catch {
      // Không nén được (VD HEIC) → giữ file gốc, cảnh báo nếu quá lớn.
      const kb = Math.round(file.size / 1024);
      setStatus(kb > 3500 ? `Ảnh ${kb} KB, quá 3.5MB — hãy chọn ảnh JPG/PNG nhỏ hơn.` : `${kb} KB`);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-1">
      <Input type="file" accept="image/*" onChange={onChange} {...props} />
      {status && <p className="text-xs text-muted-foreground">{status}</p>}
    </div>
  );
}
