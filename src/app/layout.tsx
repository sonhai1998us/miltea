import { Lemonada } from 'next/font/google';
import './globals.css';


const outfit = Lemonada({
  subsets: ["latin"],
});

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
