// Thông tin chung của site, dùng cho metadata / sitemap / footer.
export const site = {
  name: process.env.NEXT_PUBLIC_SHOP_NAME ?? "Thiệp Viết Tay",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thiep-viet-tay.vercel.app",
  description:
    "Thiệp viết tay và postcard giấy mỹ thuật. Bạn soạn lời nhắn, chúng mình viết tay bằng bút mực và gửi tới tận tay người nhận.",
  // Sửa thông tin liên hệ tại đây
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
    facebook: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  },
};
