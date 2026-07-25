import "./globals.css";
import { StoreProvider } from "@/lib/storeContext";
import { ToastProvider } from "@/lib/toastContext";
import LayoutContent from "@/components/layout/LayoutContent";

export const metadata = {
  title: "Ascend — AI Placement & Technical Interview Coach",
  description: "Production-grade AI interview prep platform featuring real-time AI screens, adaptive skill graphs, ATS resume analyzer, and peer leagues.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#F7F6F3] text-[#1E1E1E] flex min-h-screen font-sans antialiased selection:bg-[#FF6B4A]/20">
        <StoreProvider>
          <ToastProvider>
            <LayoutContent>{children}</LayoutContent>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
