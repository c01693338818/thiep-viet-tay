import type { Metadata } from "next";
import { SHIPPING_ZONES } from "@/lib/shipping";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chính sách",
  description: "Chính sách giao hàng, thanh toán, đổi trả và bảo mật thông tin.",
};

// Sửa nội dung cho đúng cách bạn vận hành.
export default function PolicyPage() {
  return (
    <article className="prose-custom mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Chính sách</h1>

      <h2>Giao hàng</h2>
      <ul>
        {SHIPPING_ZONES.map((z) => (
          <li key={z.id}>
            {z.label}: {formatPrice(z.fee)}
          </li>
        ))}
      </ul>
      <p>
        Thiệp viết tay cần 1–2 ngày để viết, sau đó gửi qua đơn vị vận chuyển. Thời gian nhận hàng
        dự kiến 2–4 ngày làm việc tùy khu vực. Bạn có thể theo dõi trạng thái tại trang{" "}
        <a href="/tra-cuu">tra cứu đơn</a>.
      </p>

      <h2>Thanh toán</h2>
      <ul>
        <li>
          <strong>Chuyển khoản:</strong> quét mã QR trên trang đơn hàng, ghi đúng nội dung là mã đơn.
          Đơn được xác nhận trong vài giờ sau khi nhận tiền.
        </li>
        <li>
          <strong>COD:</strong> thanh toán tiền mặt khi nhận hàng. Chúng mình sẽ gọi xác nhận trước
          khi viết thiệp.
        </li>
      </ul>

      <h2>Đổi trả</h2>
      <p>
        Thiệp viết tay là sản phẩm làm theo yêu cầu nên không đổi trả, trừ khi sai nội dung so với
        lời nhắn bạn gửi hoặc hư hỏng khi vận chuyển. Trong trường hợp đó, chúng mình viết lại và
        gửi miễn phí — vui lòng liên hệ trong vòng 3 ngày kể từ khi nhận hàng, kèm ảnh.
      </p>
      <p>Postcard in sẵn được đổi trong 7 ngày nếu lỗi in hoặc hư hỏng, còn nguyên bao bì.</p>

      <h2>Bảo mật thông tin</h2>
      <p>
        Họ tên, số điện thoại, địa chỉ và lời nhắn chỉ dùng để xử lý và giao đơn hàng. {site.name}{" "}
        không chia sẻ thông tin cho bên thứ ba ngoài đơn vị vận chuyển, và không đăng nội dung lời
        nhắn của bạn ở bất cứ đâu khi chưa được đồng ý.
      </p>
    </article>
  );
}
