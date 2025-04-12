import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "SpoilSports",
  description: "Test your sports knowledge!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Header />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
