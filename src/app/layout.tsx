
import type { Metadata } from 'next';
import { Lemonada } from 'next/font/google';
import './globals.css';


const outfit = Lemonada({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Lá và Sương - Coffee & Milk Tea',
  description: 'Lá và Sương – Quán trà sữa & cà phê với phong cách tự nhiên hiện đại, nổi bật cùng hình ảnh chú cáo và lá cây dễ thương. Thưởng thức trà sữa đậm vị, trái cây tươi và cà phê nguyên chất, gần gũi tại Việt Nam.',
  openGraph: {
    title: "Lá và Sương – Trà sữa & Cà phê phong cách tự nhiên hiện đại",
    description: "Khám phá hương vị đặc biệt tại Lá và Sương – nơi hội tụ trà sữa đậm đà, cà phê nguyên chất và không gian độc đáo cùng hình ảnh chú cáo và lá cây dễ thương.",
    url: "https://www.lavasuong.vn", // cập nhật nếu bạn có domain thực tế
    siteName: "Lá và Sương",
    images: [
      {
        url: "https://cdn.demo-online.xyz/2367a079-72f1-4a01-a6f8-af7be0d1084a.png", // đường dẫn tuyệt đối đến hình OG
        width: 1536,
        height: 1024,
        alt: "Lá và Sương - Logo chú cáo và lá cây",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
            {children}
      </body>
    </html>
  );
}
