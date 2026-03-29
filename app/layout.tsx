import "./globals.css";

export const metadata = {
  title: "Raphael Production House Invoice Editor",
  description: "Generate and edit live invoices dynamically.",
  icons: {
    icon: "/logo.jpeg", // Points directly to the jpeg in public/
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
