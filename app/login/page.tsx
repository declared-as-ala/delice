"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/lib/api";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Store and routing
  const {
    setAuth,
    isLoggingIn,
    setLoggingIn,
    error,
    setError,
    clearError,
    isAuthenticated,
  } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for URL messages
  const urlMessage = searchParams.get("message");
  const redirectTo = searchParams.get("redirect") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  // Handle URL messages
  useEffect(() => {
    if (urlMessage) {
      switch (urlMessage) {
        case "password-changed":
          toast.success(
            "Mot de passe modifié avec succès. Veuillez vous reconnecter."
          );
          break;
        case "session-expired":
          toast.error("Votre session a expiré. Veuillez vous reconnecter.");
          break;
        case "unauthorized":
          toast.error("Accès non autorisé. Veuillez vous connecter.");
          break;
        default:
          break;
      }
    }
  }, [urlMessage]);

  // Form validation
  const validateForm = () => {
    const errors: typeof formErrors = {};

    if (!email.trim()) {
      errors.email = "L'adresse email est requise";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Format d'email invalide";
    }

    if (!password) {
      errors.password = "Le mot de passe est requis";
    } else if (password.length < 6) {
      errors.password = "Le mot de passe doit contenir au moins 6 caractères";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ This should prevent refresh
    e.stopPropagation(); // ✅ Add this to prevent event bubbling

    // Clear previous errors
    clearError();
    setFormErrors({});

    // Validate form
    if (!validateForm()) {
      return; // ✅ Early return prevents further execution
    }

    setLoggingIn(true);

    try {
      const response = await authService.login(email.trim(), password);
      const { admin, accessToken, refreshToken } = response;

      // Set auth in store
      setAuth({ admin, accessToken, refreshToken });

      // Show success message
      toast.success(`Bienvenue, ${admin.name}!`);

      // Redirect
      router.push(redirectTo);
    } catch (error: any) {
      console.error("Login error:", error);

      const errorMessage =
        error.response?.data?.message || error.message || "Erreur de connexion";

      // Handle specific error types
      if (error.response?.status === 401) {
        setFormErrors({ general: "Email ou mot de passe incorrect" });
      } else if (error.response?.status === 403) {
        setFormErrors({
          general: "Compte désactivé. Contactez l'administrateur.",
        });
      } else if (error.response?.status === 429) {
        setFormErrors({
          general: "Trop de tentatives. Veuillez réessayer plus tard.",
        });
      } else {
        setFormErrors({ general: errorMessage });
      }

      setError(errorMessage);
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle input changes to clear errors
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: undefined }));
    }
    if (error) clearError();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (error) clearError();
  };

  // Check for saved credentials
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Save/remove email based on remember me
  useEffect(() => {
    if (rememberMe && email) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
  }, [rememberMe, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2 pb-6">
          {/* Logo */}
          <div className="w-40 h-60 mx-auto mb-4 relative">
            <Image
              src="/logo.png"
              alt="Les Délices du Verger Logo"
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Les Délices du Verger
          </CardTitle>
          <CardDescription className="text-gray-600">
            Administration
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Success/Error Messages */}
          {formErrors.general && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {formErrors.general}
              </AlertDescription>
            </Alert>
          )}

          {urlMessage === "password-changed" && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Mot de passe modifié avec succès. Veuillez vous reconnecter.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@lesdelices.com"
                value={email}
                onChange={handleEmailChange}
                disabled={isLoggingIn}
                className={`transition-colors ${
                  formErrors.email
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "focus:border-primary focus:ring-primary/20"
                }`}
                autoComplete="email"
              />
              {formErrors.email && (
                <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Mot de passe
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={isLoggingIn}
                  className={`pr-10 transition-colors ${
                    formErrors.password
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "focus:border-primary focus:ring-primary/20"
                  }`}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1 hover:bg-gray-100"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoggingIn}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                disabled={isLoggingIn}
              />
              <Label
                htmlFor="remember"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Se souvenir de moi
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Problème de connexion ?{" "}
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
                onClick={() =>
                  toast.success("Contactez l'administrateur système")
                }
              >
                Contactez le support
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Loading Overlay */}
      {isLoggingIn && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-gray-700 font-medium">
                Connexion en cours...
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
