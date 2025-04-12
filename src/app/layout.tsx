import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { Toaster } from "react-hot-toast";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`}>
        <AuthProvider>
          <ThemeProvider>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
