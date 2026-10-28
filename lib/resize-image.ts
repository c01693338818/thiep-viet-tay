// Thu nhỏ ảnh trên trình duyệt trước khi upload: cạnh dài tối đa `maxSize`px, xuất JPEG.
// Ảnh điện thoại 5–8MB sau khi nén thường còn 200–400KB.
export async function resizeImage(file: File, maxSize = 1600, quality = 0.85): Promise<File> {
  // createImageBitmap tự xoay theo EXIF; trình duyệt không hỗ trợ định dạng (VD HEIC) sẽ ném lỗi.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không tạo được canvas");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("Không nén được ảnh");

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
}
