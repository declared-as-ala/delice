"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import { ProductFilters } from "./components/ProductFilters";
import { ProductTable } from "./components/ProductTable";
import { ProductDialogs } from "./components/ProductDialogs";
import { Pagination } from "./components/Pagination";
import { useProductMutations } from "./hooks/useProductMutations";
import { useProductDialogs } from "./hooks/useProductDialogs";
import { Product, ProductVariant } from "./types/product";
import { productService } from "@/lib/api";

export default function ProductsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [createVariants, setCreateVariants] = useState<ProductVariant[]>([
    { 
      variant_id: "", 
      variant_name: "", 
      price: 0, 
      unit_type: "piece",
      grams: null,
      options: []
    },
  ]);
  const [editVariants, setEditVariants] = useState<ProductVariant[]>([]);

  const queryClient = useQueryClient();
  const itemsPerPage = 10;

  // Convert "all" to empty string for API
  const getApiFilterValue = (filterValue: string) =>
    filterValue === "all" ? "" : filterValue;

  // Fetch products with pagination and filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", currentPage, searchTerm, categoryFilter],
    queryFn: () =>
      productService.getAll(
        currentPage,
        itemsPerPage,
        searchTerm,
        getApiFilterValue(categoryFilter)
      ),
  });

  // Derived data
  const products = productsData?.data?.data || [];
  const totalItems = productsData?.data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Product mutations
  const mutations = useProductMutations(queryClient, {
    onCreateSuccess: () => {
      setCreateVariants([
        { 
          variant_id: "", 
          variant_name: "", 
          price: 0, 
          unit_type: "piece",
          grams: null,
          options: []
        },
      ]);
    },
    onEditSuccess: () => setEditVariants([]),
  });

  const dialogs = useProductDialogs();

  // Categories & units
  const categories = [
    "Fruits De Saison",
    "Légumes",
    "Tomates",
    "Épicerie Fine",
    "Jus de Fruits",
    "Agrumes",
    "Salades",
    "Herbes Aromatiques",
    "Fruits Rouges",
    "Fruits Exotiques",
    "Fruits Coupés",
    "Fruits Secs",
    "Produits Laitiers",
    "Produits Alimentaires Variés",
  ];

  const unitTypes: ('weight' | 'piece')[] = ["weight", "piece"];

  // ----- Handlers -----
  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // reset page
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // reset page
  };

  const handleView = async (id: string) => {
    try {
      const response = await productService.getById(id);
      const product = response.data.data;
      if (!product) throw new Error("Product not found");
      dialogs.openView(product);
    } catch (error) {
      console.error("Error viewing product:", error);
      toast.error("Erreur lors du chargement du produit");
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await productService.getById(id);
      const product = response.data.data;
      if (!product) throw new Error("Product not found");
      setEditVariants([...product.variants]);
      dialogs.openEdit(product);
    } catch (error) {
      console.error("Error editing product:", error);
      toast.error("Erreur lors du chargement du produit");
    }
  };

  const handleDelete = (product: Product) => dialogs.openDelete(product);
  const handleAddVariant = (product: Product) =>
    dialogs.openAddVariant(product);
  const handleEditVariant = (
    product: Product,
    variant: ProductVariant,
    index: number
  ) => dialogs.openEditVariant(product, variant, index);

  const handleDeleteVariant = (productId: string, variantId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce variant ?")) {
      mutations.deleteVariant.mutate({ productId, variantId });
    }
  };

  // ----- Create variant handlers -----
  const addCreateVariant = () =>
    setCreateVariants([
      ...createVariants,
      { 
        variant_id: "", 
        variant_name: "", 
        price: 0, 
        unit_type: "piece",
        grams: null,
        options: []
      },
    ]);

  const removeCreateVariant = (index: number) =>
    createVariants.length > 1 &&
    setCreateVariants(createVariants.filter((_, i) => i !== index));

  const updateCreateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updated = [...createVariants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-generate variant_id if certain fields change
    if (field === 'variant_name' || field === 'unit_type' || field === 'grams') {
      const variant = updated[index];
      const name = variant.variant_name || "default";
      const unit = variant.unit_type === 'weight' && variant.grams ? `${variant.grams}g` : variant.unit_type;
      updated[index].variant_id = `${name}-${unit}`.toLowerCase().replace(/\s+/g, '-');
    }
    
    setCreateVariants(updated);
  };

  // ----- Edit variant handlers -----
  const addEditVariant = () =>
    setEditVariants([
      ...editVariants,
      { 
        variant_id: "", 
        variant_name: "", 
        price: 0, 
        unit_type: "piece",
        grams: null,
        options: []
      },
    ]);

  const removeEditVariant = (index: number) => {
    const variant = editVariants[index];
    if (variant.variant_id && dialogs.selectedProduct) {
      if (window.confirm("Voulez-vous supprimer ce variant ?")) {
        mutations.deleteVariant.mutate({
          productId: dialogs.selectedProduct.id,
          variantId: variant.variant_id,
        });
      }
    } else {
      setEditVariants(editVariants.filter((_, i) => i !== index));
    }
  };

  const updateEditVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updated = [...editVariants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-generate variant_id if certain fields change
    if (field === 'variant_name' || field === 'unit_type' || field === 'grams') {
      const variant = updated[index];
      const name = variant.variant_name || "default";
      const unit = variant.unit_type === 'weight' && variant.grams ? `${variant.grams}g` : variant.unit_type;
      updated[index].variant_id = `${name}-${unit}`.toLowerCase().replace(/\s+/g, '-');
    }
    
    setEditVariants(updated);
  };

  return (
    <DashboardLayout title="Gestion des produits">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Produits</h1>
            <p className="text-muted-foreground">
              Gérez votre catalogue de produits et leurs variants
            </p>
          </div>
          <Button
            onClick={() => dialogs.openCreate()}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau produit
          </Button>
        </div>

        {/* Filters */}
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={handleCategoryChange}
          categories={categories}
        />

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Catalogue ({totalItems})</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductTable
              products={products}
              isLoading={isLoading}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAddVariant={handleAddVariant}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <ProductDialogs
          dialogs={dialogs}
          mutations={mutations}
          categories={categories}
          unitTypes={unitTypes}
          createVariants={createVariants}
          editVariants={editVariants}
          onAddCreateVariant={addCreateVariant}
          onRemoveCreateVariant={removeCreateVariant}
          onUpdateCreateVariant={updateCreateVariant}
          onAddEditVariant={addEditVariant}
          onRemoveEditVariant={removeEditVariant}
          onUpdateEditVariant={updateEditVariant}
          onDeleteVariant={handleDeleteVariant}
          onEditVariant={handleEditVariant}
        />
      </div>
    </DashboardLayout>
  );
}