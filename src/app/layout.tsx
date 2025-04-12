import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FanFrenzy",
  description: "Test your memory of legendary sports moments. Daily challenges, team rewind, and more!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <AuthProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Header />
          <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-128px)]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
