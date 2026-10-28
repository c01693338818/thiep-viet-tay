import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: `Câu chuyện của ${site.name}: thiệp viết tay và postcard làm thủ công.`,
};

// Sửa nội dung tại đây cho đúng câu chuyện của bạn.
export default function AboutPage() {
  return (
    <article className="prose-custom mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Về {site.name}</h1>

      <p>
        Chúng mình tin rằng một dòng chữ viết tay có sức nặng hơn hàng trăm tin nhắn. {site.name} ra
        đời để giúp bạn gửi đi những lời muốn nói — bằng mực, bằng giấy, và bằng thời gian ngồi
        xuống viết thật chậm.
      </p>

      <h2>Cách hoạt động</h2>
      <ol>
        <li>Bạn chọn mẫu thiệp hoặc postcard, soạn lời nhắn (tối đa 200 ký tự).</li>
        <li>Chúng mình viết tay bằng bút mực lên giấy mỹ thuật, chụp ảnh cập nhật vào đơn.</li>
        <li>Thiệp được bỏ phong bì, gửi tới người nhận trong 2–4 ngày làm việc.</li>
      </ol>

      <h2>Chất liệu</h2>
      <p>
        Postcard in trên giấy mỹ thuật 300gsm, kích thước 10×15cm. Thiệp gấp 12×17cm, giấy kraft
        hoặc giấy trắng ngà, kèm phong bì cùng tông.
      </p>

      <h2>Liên hệ</h2>
      <ul>
        {site.contact.email && (
          <li>Email: <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a></li>
        )}
        {site.contact.phone && (
          <li>Điện thoại / Zalo: <a href={`tel:${site.contact.phone}`}>{site.contact.phone}</a></li>
        )}
        {site.contact.facebook && (
          <li><a href={site.contact.facebook} target="_blank" rel="noreferrer">Facebook</a></li>
        )}
        {site.contact.instagram && (
          <li><a href={site.contact.instagram} target="_blank" rel="noreferrer">Instagram</a></li>
        )}
        {!site.contact.email && !site.contact.phone && (
          <li className="text-muted-foreground">Thông tin liên hệ sẽ được cập nhật sớm.</li>
        )}
      </ul>

      <div className="not-prose mt-8">
        <Button render={<Link href="/san-pham" />}>Xem sản phẩm</Button>
      </div>
    </article>
  );
}
