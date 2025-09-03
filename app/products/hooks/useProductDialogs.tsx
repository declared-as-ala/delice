// hooks/useProductDialogs.ts
import { useState } from "react";
import { Product, ProductVariant } from "../types/product.ts";

export const useProductDialogs = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [addVariantDialog, setAddVariantDialog] = useState(false);
  const [editVariantDialog, setEditVariantDialog] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1);

  const openCreate = () => setCreateDialog(true);
  const closeCreate = () => setCreateDialog(false);

  const openEdit = (product: Product) => {
    setSelectedProduct(product);
    setEditDialog(true);
  };
  const closeEdit = () => {
    setEditDialog(false);
    setSelectedProduct(null);
  };

  const openView = (product: Product) => {
    setSelectedProduct(product);
    setViewDialog(true);
  };
  const closeView = () => {
    setViewDialog(false);
    setSelectedProduct(null);
  };

  const openDelete = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialog(true);
  };
  const closeDelete = () => {
    setDeleteDialog(false);
    setSelectedProduct(null);
  };

  const openAddVariant = (product: Product) => {
    setSelectedProduct(product);
    setAddVariantDialog(true);
  };
  const closeAddVariant = () => {
    setAddVariantDialog(false);
    setSelectedProduct(null);
  };

  const openEditVariant = (
    product: Product,
    variant: ProductVariant,
    index: number
  ) => {
    setSelectedProduct(product);
    setSelectedVariant(variant);
    setSelectedVariantIndex(index);
    setEditVariantDialog(true);
  };
  const closeEditVariant = () => {
    setEditVariantDialog(false);
    setSelectedProduct(null);
    setSelectedVariant(null);
    setSelectedVariantIndex(-1);
  };

  return {
    selectedProduct,
    selectedVariant,
    selectedVariantIndex,
    createDialog,
    editDialog,
    deleteDialog,
    viewDialog,
    addVariantDialog,
    editVariantDialog,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    openView,
    closeView,
    openDelete,
    closeDelete,
    openAddVariant,
    closeAddVariant,
    openEditVariant,
    closeEditVariant,
  };
};
