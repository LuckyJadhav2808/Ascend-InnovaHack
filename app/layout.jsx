"use client";

import "./globals.css";
import { StoreProvider } from "@/lib/storeContext";
import { ToastProvider } from "@/lib/toastContext";
import LeftRail from "@/components/layout/LeftRail";
import TopBar from "@/components/layout/TopBar";
import { usePathname } from "next/navigation";

function LayoutContent({ children }) {
  const pathname = usePathname();
  // Hide main dashboard sidebar and top bar on landing and auth pages
  const isPublicPage = pathname === "/" || pathname === "/login" || pathname === "/signup";

  if (isPublicPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <div className="flex w-full max-w-full min-h-screen overflow-x-hidden">
      {/* Left Vertical Navigation Rail (Fixed) */}
      <LeftRail />

      {/* Main Dashboard Application Area (offset for fixed sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden md:ml-20">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full max-w-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
