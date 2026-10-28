"use client";

import { useActionState } from "react";
import { ImageInput } from "@/components/admin/image-input";
import { SubmitButton } from "@/components/admin/submit-button";
import { uploadProof } from "@/app/actions/admin";

export function ProofUploadForm({
  orderId,
  itemId,
  hasProof,
}: {
  orderId: string;
  itemId: string;
  hasProof: boolean;
}) {
  const [state, action] = useActionState(uploadProof.bind(null, orderId, itemId), null);

  return (
    <form action={action} className="flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <ImageInput name="proof" required />
        <SubmitButton variant="outline" pendingText="Đang tải lên…">
          {hasProof ? "Thay ảnh thiệp" : "Tải ảnh thiệp đã viết"}
        </SubmitButton>
      </div>
      {state?.error && <p className="text-xs text-destructive">{state.error}</p>}
      {state?.ok && <p className="text-xs text-muted-foreground">Đã lưu ảnh.</p>}
    </form>
  );
}
