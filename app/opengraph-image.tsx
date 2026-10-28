import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Ảnh hiện khi share link lên Facebook / Zalo / Messenger.
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "linear-gradient(135deg, #fbf5ec 0%, #f3e4d2 100%)",
          color: "#3b2f27",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", opacity: 0.7 }}>
          {site.name}
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.1, marginTop: 24, maxWidth: 900 }}>
          Thiệp viết tay, gửi lời bạn muốn nói.
        </div>
        <div style={{ fontSize: 32, marginTop: 32, opacity: 0.8, maxWidth: 900 }}>
          Postcard &amp; thiệp giấy mỹ thuật, viết tay bằng bút mực theo lời nhắn của bạn.
        </div>
      </div>
    ),
    size
  );
}
