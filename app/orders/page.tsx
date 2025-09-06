"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { orderService } from "@/lib/api";
import {
  Search,
  Eye,
  Truck,
  Trash2,
  Filter,
  MapPin,
  Store,
  Phone,
  Mail,
  Package,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function OrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [statusDialog, setStatusDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const queryClient = useQueryClient();

  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ["orders", currentPage, searchTerm, statusFilter, paymentFilter],
    queryFn: () =>
      orderService.getAll(
        currentPage,
        10,
        statusFilter === "all" ? "" : statusFilter,
        paymentFilter === "all" ? "" : paymentFilter,
        searchTerm
      ),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStatusDialog(false);
      toast.success("Statut mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    },
  });

  // Updated mutation to handle both delivery and pickup
  const toggleDeliveryMutation = useMutation({
    mutationFn: (id: string) => orderService.toggleDelivery(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Statut mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setDeleteDialog(false);
      toast.success("Commande supprimée avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  const orders = ordersResponse?.data?.data || [];
  const pagination = ordersResponse?.data?.pagination || {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      en_attente: "destructive",
      payé: "default",
      terminé: "secondary",
      annulé: "outline",
    };

    const labels = {
      en_attente: "En attente",
      payé: "Payé",
      terminé: "Terminé",
      annulé: "Annulé",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getPickupTypeBadge = (pickupType: string) => {
    return pickupType === "delivery" ? (
      <Badge variant="outline" className="flex items-center gap-1">
        <Truck className="w-3 h-3" />
        Livraison
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Store className="w-3 h-3" />
        Retrait magasin
      </Badge>
    );
  };

  const handleView = async (id: string) => {
    try {
      const response = await orderService.getById(id);
      setSelectedOrder(response.data.data);
      setViewDialog(true);
    } catch (error) {
      toast.error("Erreur lors du chargement des détails");
    }
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialog(true);
  };

  const handleDelete = (order: any) => {
    setSelectedOrder(order);
    setDeleteDialog(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder || !newStatus) return;
    updateStatusMutation.mutate({ id: selectedOrder._id, status: newStatus });
  };

  // Updated function to handle both delivery and pickup toggle
  const handleDeliveryToggle = (order: any) => {
    toggleDeliveryMutation.mutate(order._id);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getRowClassName = (status: string) => {
    return status === "en_attente" ? "bg-red-50 dark:bg-red-950/20" : "";
  };

  return (
    <DashboardLayout title="Gestion des commandes">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Commandes</h1>
            <p className="text-muted-foreground">
              Gérez et suivez toutes les commandes ({pagination.total} au total)
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="payé">Payé</SelectItem>
                  <SelectItem value="terminé">Terminé</SelectItem>
                  <SelectItem value="annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Méthode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les méthodes</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="especes">Espèces</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                  setCurrentPage(1);
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Liste des commandes</span>
              <Badge variant="secondary">
                Page {pagination.page} sur {pagination.pages}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Commande</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Type de retrait</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Paiement</TableHead>
                        <TableHead>Status retrait/livraison</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order: any) => (
                        <TableRow
                          key={order._id}
                          className={getRowClassName(order.status)}
                        >
                          <TableCell className="font-mono text-sm font-medium">
                            #{order._id?.slice(-8)?.toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {order.customer?.fullName}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {order.customer?.email}
                              </div>
                              {order.customer?.phone && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {order.customer.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getPickupTypeBadge(order.pickupType)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">
                                {order.amount?.toFixed(2)}€
                              </p>
                              {order.deliveryFee > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  + {order.deliveryFee.toFixed(2)}€ livraison
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(order.status)}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUpdateStatus(order)}
                                className="h-6 px-2"
                              >
                                <Truck className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="flex items-center gap-1 w-fit"
                            >
                              <CreditCard className="w-3 h-3" />
                              {order.paymentMethod || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {/* Updated delivery/pickup status section */}
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={order.isDelivered || false}
                                onCheckedChange={() => handleDeliveryToggle(order)}
                                disabled={toggleDeliveryMutation.isPending}
                              />
                              <div className="flex items-center gap-1">
                                {order.pickupType === "delivery" ? (
                                  <Truck className="w-3 h-3" />
                                ) : (
                                  <Store className="w-3 h-3" />
                                )}
                                <span className="text-xs">
                                  {order.isDelivered 
                                    ? (order.pickupType === "delivery" ? "Livré" : "Retiré")
                                    : (order.pickupType === "delivery" ? "En cours" : "En attente")
                                  }
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(order.createdAt), "dd/MM/yyyy", {
                                locale: fr,
                              })}
                            </div>
                            <div className="text-xs mt-1">
                              {format(new Date(order.createdAt), "HH:mm", {
                                locale: fr,
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(order._id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(order)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Affichage de{" "}
                      {(pagination.page - 1) * pagination.limit + 1} à{" "}
                      {Math.min(
                        pagination.page * pagination.limit,
                        pagination.total
                      )}{" "}
                      sur {pagination.total} commandes
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, pagination.pages) },
                          (_, i) => {
                            let pageNum: number = 1;

                            if (pagination.pages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                              pageNum = i + 1;
                            } else if (
                              pagination.page >=
                              pagination.pages - 2
                            ) {
                              pageNum = pagination.pages - 4 + i;
                            } else {
                              pageNum = pagination.page - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pageNum === pagination.page
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Détails de la commande #
                {selectedOrder?._id?.slice(-8)?.toUpperCase()}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer & Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Informations client
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">
                          Nom complet
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.customer?.fullName}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.customer?.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Téléphone</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedOrder.customer?.phone || "Non renseigné"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Détails commande
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">
                          Date de commande
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(selectedOrder.createdAt),
                            "dd/MM/yyyy à HH:mm",
                            {
                              locale: fr,
                            }
                          )}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Type de retrait
                        </Label>
                        <div className="mt-1">
                          {getPickupTypeBadge(selectedOrder.pickupType)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Statut</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Méthode de paiement
                        </Label>
                        <Badge variant="outline" className="mt-1">
                          {selectedOrder.paymentMethod || "N/A"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pickup/Delivery Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedOrder.pickupType === "delivery" ? (
                        <>
                          <Truck className="w-5 h-5" />
                          Adresse de livraison
                        </>
                      ) : (
                        <>
                          <Store className="w-5 h-5" />
                          Lieu de retrait
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.pickupType === "delivery" ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Adresse</Label>
                          <p className="text-sm text-muted-foreground">
                            {selectedOrder.deliveryAddress?.street}
                            <br />
                            {selectedOrder.deliveryAddress?.city}{" "}
                            {selectedOrder.deliveryAddress?.postalCode}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">
                            Frais de livraison
                          </Label>
                          <p className="text-sm font-semibold">
                            {selectedOrder.deliveryFee?.toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            Statut de livraison
                          </Label>
                          <Badge
                            variant={
                              selectedOrder.isDelivered
                                ? "default"
                                : "secondary"
                            }
                          >
                            {selectedOrder.isDelivered
                              ? "Livré"
                              : "En cours de livraison"}
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">
                            Lieu de retrait
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            <strong>{selectedOrder.pickupLocation?.name}</strong>
                            <br />
                            {selectedOrder.pickupLocation?.address}
                          </p>
                          {selectedOrder.pickupLocation?.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedOrder.pickupLocation.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">
                            Statut de retrait
                          </Label>
                          <Badge
                            variant={
                              selectedOrder.isDelivered
                                ? "default"
                                : "secondary"
                            }
                          >
                            <div className="flex items-center gap-1">
                              {selectedOrder.isDelivered ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Store className="w-3 h-3" />
                              )}
                              {selectedOrder.isDelivered
                                ? "Retiré"
                                : "En attente de retrait"}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Articles commandés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item: any, index: number) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 border rounded-lg"
                          >
                            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package className="w-6 h-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.variantUnit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                Qté: {item.quantity}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {item.price?.toFixed(2)}€ / unité
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {(item.quantity * item.price).toFixed(2)}€
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Total */}
                      <div className="mt-4 pt-4 border-t">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Sous-total</span>
                            <span>
                              {(
                                selectedOrder.amount -
                                (selectedOrder.deliveryFee || 0)
                              ).toFixed(2)}
                              €
                            </span>
                          </div>
                          {selectedOrder.deliveryFee > 0 && (
                            <div className="flex justify-between text-sm">
                              <span>Frais de livraison</span>
                              <span>
                                {selectedOrder.deliveryFee.toFixed(2)}€
                              </span>
                            </div>
                          )}
                          {selectedOrder.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Remise ({selectedOrder.discountCode})</span>
                              <span>
                                -{selectedOrder.discountAmount.toFixed(2)}€
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                            <span>Total</span>
                            <span>{selectedOrder.amount?.toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le statut</DialogTitle>
              <DialogDescription>
                Choisissez le nouveau statut pour la commande #
                {selectedOrder?._id?.slice(-8)?.toUpperCase()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Statut actuel</Label>
                <div className="mt-1">
                  {selectedOrder && getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              <div>
                <Label>Nouveau statut</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en_attente">En attente</SelectItem>
                    <SelectItem value="payé">Payé</SelectItem>
                    <SelectItem value="terminé">Terminé</SelectItem>
                    <SelectItem value="annulé">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialog(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={
                  updateStatusMutation.isPending ||
                  newStatus === selectedOrder?.status
                }
              >
                {updateStatusMutation.isPending
                  ? "Mise à jour..."
                  : "Mettre à jour"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer la commande</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer la commande #
                {selectedOrder?._id?.slice(-8)?.toUpperCase()} ? Cette action
                est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  selectedOrder && deleteMutation.mutate(selectedOrder._id)
                }
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}