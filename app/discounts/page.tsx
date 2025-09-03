"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { discountService } from "@/lib/api";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  Calendar,
  Percent,
  Euro,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Copy,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Form component for creating/editing discounts
const DiscountForm = ({ discount, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: discount?.code || "",
    type: discount?.type || "percentage",
    discount: discount?.discount || "",
    active: discount?.active ?? true,
    validFrom: discount?.validFrom
      ? new Date(discount.validFrom).toISOString().split("T")[0]
      : "",
    validTo: discount?.validTo
      ? new Date(discount.validTo).toISOString().split("T")[0]
      : "",
    usageLimit: discount?.usageLimit || "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => {
      if (discount?._id) {
        return discountService.update(discount._id, data);
      }
      return discountService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["discounts"]);
      onSuccess();
      onClose();
      setFormData({
        code: "",
        type: "percentage",
        discount: "",
        active: true,
        validFrom: "",
        validTo: "",
        usageLimit: "",
      });
    },
    onError: (error) => {
      console.error("Error saving discount:", error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      discount: Number(formData.discount),
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
      validFrom: formData.validFrom ? new Date(formData.validFrom) : undefined,
      validTo: formData.validTo ? new Date(formData.validTo) : undefined,
    };

    mutation.mutate(submitData);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {discount?._id ? "Modifier la remise" : "Créer une remise"}
          </DialogTitle>
          <DialogDescription>
            {discount?._id
              ? "Modifiez les informations de la remise"
              : "Créez une nouvelle remise pour vos clients"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code de remise</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="PROMO2024"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={generateCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type de remise</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Montant fixe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">
              Valeur de la remise
              {formData.type === "percentage" ? " (%)" : " (€)"}
            </Label>
            <Input
              id="discount"
              type="number"
              min="0"
              step={formData.type === "percentage" ? "1" : "0.01"}
              max={formData.type === "percentage" ? "100" : undefined}
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
              placeholder={formData.type === "percentage" ? "10" : "5.00"}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Date de début</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validTo">Date de fin</Label>
              <Input
                id="validTo"
                type="date"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData({ ...formData, validTo: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Limite d'utilisation (optionnel)</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              placeholder="100"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label htmlFor="active">Remise active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Enregistrement..."
                : discount?._id
                ? "Modifier"
                : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function DiscountPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const queryClient = useQueryClient();

  // Fetch discounts
  const {
    data: discountsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["discounts", page, search],
    queryFn: () => discountService.getAll(page, 10, search),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => discountService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["discounts"]);
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }) => discountService.update(id, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries(["discounts"]);
    },
  });

  const handleDelete = (discount) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la remise "${discount.code}" ?`
      )
    ) {
      deleteMutation.mutate(discount._id);
    }
  };

  const handleToggleActive = (discount) => {
    toggleActiveMutation.mutate({
      id: discount._id,
      active: !discount.active,
    });
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    // You could add a toast notification here
  };

  const formatDiscount = (discount) => {
    return discount.type === "percentage"
      ? `${discount.discount}%`
      : `€${discount.discount.toFixed(2)}`;
  };

  const isExpired = (validTo) => {
    return validTo && new Date(validTo) < new Date();
  };

  const isNotYetActive = (validFrom) => {
    return validFrom && new Date(validFrom) > new Date();
  };

  const getStatusBadge = (discount) => {
    if (!discount.active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (isExpired(discount.validTo)) {
      return <Badge variant="destructive">Expirée</Badge>;
    }
    if (isNotYetActive(discount.validFrom)) {
      return <Badge variant="outline">En attente</Badge>;
    }
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return <Badge variant="destructive">Limite atteinte</Badge>;
    }
    return (
      <Badge variant="default" className="bg-green-500">
        Active
      </Badge>
    );
  };

  // Filter discounts - Fixed data extraction
  const discounts = discountsData?.data?.data || []; // The discounts array is in data.data

  const filteredDiscounts = discounts.filter((discount) => {
    if (filterType !== "all" && discount.type !== filterType) return false;
    if (filterStatus === "active" && !discount.active) return false;
    if (filterStatus === "inactive" && discount.active) return false;
    if (filterStatus === "expired" && !isExpired(discount.validTo))
      return false;
    return true;
  });

  const stats = {
    total: discounts.length,
    active: discounts.filter((d) => d.active && !isExpired(d.validTo)).length,
    expired: discounts.filter((d) => isExpired(d.validTo)).length,
    used: discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0),
  };

  if (error) {
    return (
      <DashboardLayout title="Gestion des Remises">
        <div className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Erreur lors du chargement des remises. Veuillez rafraîchir la
              page.
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Gestion des Remises">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Gestion des Remises
            </h1>
            <p className="text-muted-foreground">
              Créez et gérez les codes de réduction pour vos clients
            </p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Créer une remise
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Actives
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Expirées
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.expired}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Utilisations
                  </p>
                  <p className="text-2xl font-bold">{stats.used}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Rechercher par code..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    <SelectItem value="percentage">Pourcentage</SelectItem>
                    <SelectItem value="fixed">Montant fixe</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actives</SelectItem>
                    <SelectItem value="inactive">Inactives</SelectItem>
                    <SelectItem value="expired">Expirées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discounts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Liste des Remises
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Valeur</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscounts.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Aucune remise trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDiscounts.map((discount) => (
                      <TableRow key={discount._id}>
                        <TableCell className="font-mono font-semibold">
                          <div className="flex items-center gap-2">
                            {discount.code}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(discount.code)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {discount.type === "percentage" ? (
                              <Percent className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Euro className="w-4 h-4 text-green-600" />
                            )}
                            {discount.type === "percentage"
                              ? "Pourcentage"
                              : "Montant fixe"}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatDiscount(discount)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-semibold">
                              {discount.usedCount || 0}
                            </span>
                            {discount.usageLimit && (
                              <span className="text-muted-foreground">
                                /{discount.usageLimit}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {discount.validFrom || discount.validTo ? (
                            <div className="space-y-1">
                              {discount.validFrom && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    discount.validFrom
                                  ).toLocaleDateString("fr-FR")}
                                </div>
                              )}
                              {discount.validTo && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(
                                    discount.validTo
                                  ).toLocaleDateString("fr-FR")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Illimitée
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(discount)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDiscount(discount);
                                  setIsFormOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(discount)}
                              >
                                {discount.active ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Activer
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => copyToClipboard(discount.code)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copier le code
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(discount)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination could be added here */}

        <DiscountForm
          discount={selectedDiscount}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedDiscount(null);
          }}
          onSuccess={() => {
            // Could add toast notification here
          }}
        />
      </div>
    </DashboardLayout>
  );
}
