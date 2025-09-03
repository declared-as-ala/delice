"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  Percent,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth-store";
import { useState } from "react";
import toast from "react-hot-toast";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Clients", href: "/customers", icon: Users },
  { name: "Commandes", href: "/orders", icon: ShoppingCart },
  { name: "Produits", href: "/products", icon: Package },
  { name: "Réductions", href: "/discounts", icon: Percent },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

interface SidebarProps {
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  isMobile = false,
  isOpen = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, admin, isLoggingOut: storeLoggingOut } = useAuthStore();
  const [localLoggingOut, setLocalLoggingOut] = useState(false);

  // Use either store state or local state for loading
  const isLoggingOut = storeLoggingOut || localLoggingOut;

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks

    setLocalLoggingOut(true);

    try {
      // Show loading toast
      const loadingToast = toast.loading("Déconnexion en cours...");

      // Use the store logout method
      await logout();

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      // Show success message
      toast.success("Déconnecté avec succès");

      // Redirect using Next.js router
      router.push("/login?message=logged-out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");

      // Still redirect to login even if logout failed
      router.push("/login");
    } finally {
      setLocalLoggingOut(false);
    }
  };

  const sidebarClasses = cn(
    "flex flex-col h-full bg-card border-r border-border",
    isMobile ? "w-full" : "w-64"
  );

  if (isMobile && !isOpen) return null;

  return (
    <aside className={sidebarClasses}>
      {/* Header */}
      <div className="flex flex-col items-center justify-center p-6 border-b border-border">
        {/* Logo */}
        <div className="w-40 h-40 relative mb-2">
          <Image
            src="/logo.png"
            alt="Les Délices Logo"
            fill
            className="object-contain rounded-lg"
            priority
          />
        </div>
        <span className="font-semibold text-xl text-center">Les Délices</span>
        {isMobile && onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4"
            disabled={isLoggingOut}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && onClose?.()}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                // Disable navigation during logout
                isLoggingOut && "pointer-events-none opacity-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg bg-accent/50">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-medium text-xs">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{admin?.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {admin?.email}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full"
        >
          {isLoggingOut ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Déconnexion...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
