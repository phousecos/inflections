import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Inflections Studio",
  description: "Content creation and management for Inflections magazine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-studio-bg">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main content */}
          <main className="flex-1 ml-64">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
