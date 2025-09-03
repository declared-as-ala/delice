"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { User, Mail, Lock, Save, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { admin, setAuth } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const queryClient = useQueryClient();

  const { data: profileData, isPending } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: () => authService.getProfile(),
    enabled: !!admin,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string; password?: string }) =>
      authService.updateProfile(data),
    onSuccess: (response) => {
      // Update the admin data in the store
      if (response.data.admin) {
        setAuth({
          admin: response.data.admin,
          accessToken:
            response.data.accessToken || useAuthStore.getState().accessToken!,
          refreshToken:
            response.data.refreshToken || useAuthStore.getState().refreshToken!,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    },
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    const updateData: { name?: string; email?: string } = {};

    if (name && name !== admin?.name) {
      updateData.name = name;
    }

    if (email && email !== admin?.email) {
      updateData.email = email;
    }

    if (Object.keys(updateData).length > 0) {
      updateProfileMutation.mutate(updateData);
    } else {
      toast.error("Aucune modification détectée");
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!newPassword || !confirmPassword) {
      toast.error("Tous les champs sont requis");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    updateProfileMutation.mutate({ password: newPassword });

    // Reset form
    (e.target as HTMLFormElement).reset();
  };

  if (isPending) {
    return (
      <DashboardLayout title="Paramètres">
        <div className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </DashboardLayout>
    );
  }

  const currentAdmin = profileData?.data || admin;

  return (
    <DashboardLayout title="Paramètres">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez vos informations de profil et préférences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informations du profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={currentAdmin?.name || ""}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={currentAdmin?.email || ""}
                    placeholder="votre@email.com"
                    required
                  />
                </div>

                <div>
                  <Label>Rôle</Label>
                  <Input
                    value={currentAdmin?.role || "admin"}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div>
                  <Label>Date de création</Label>
                  <Input
                    value={
                      currentAdmin?.createdAt
                        ? new Date(currentAdmin.createdAt).toLocaleDateString(
                            "fr-FR"
                          )
                        : "N/A"
                    }
                    disabled
                    className="bg-muted"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Mettre à jour le profil
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Changer le mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    Confirmer le mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                  variant="outline"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Changer le mot de passe
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Email vérifié</p>
                <p className="text-xs text-muted-foreground">
                  {currentAdmin?.email}
                </p>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <User className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Statut du compte</p>
                <p className="text-xs text-muted-foreground">Actif</p>
              </div>

              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <Lock className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Sécurité</p>
                <p className="text-xs text-muted-foreground">
                  Mot de passe sécurisé
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
