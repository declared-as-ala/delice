"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading, initializeAuth, accessToken } =
    useAuthStore();
  const router = useRouter();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth on mount only once
    if (!hasInitialized) {
      initializeAuth().finally(() => setHasInitialized(true));
    }
  }, [initializeAuth, hasInitialized]);

  useEffect(() => {
    // Only redirect if we've finished initializing and user is not authenticated
    if (hasInitialized && !isLoading && !isAuthenticated && !accessToken) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router, hasInitialized, accessToken]);

  // Show loading while initializing or while auth is loading
  if (!hasInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated && !accessToken) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="fixed left-0 top-0 h-full w-80 max-w-sm">
            <Sidebar
              isMobile
              isOpen={isMobileMenuOpen}
              onClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} title={title} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          className: "bg-background text-foreground border",
          duration: 4000,
        }}
      />
    </div>
  );
}
