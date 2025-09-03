// hooks/useProductMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/lib/api";
import toast from "react-hot-toast";
import { ProductVariant } from "../types/product";

interface MutationCallbacks {
  onCreateSuccess?: () => void;
  onEditSuccess?: () => void;
}

export const useProductMutations = (
  queryClient: ReturnType<typeof useQueryClient>,
  callbacks?: MutationCallbacks
) => {
  // Product CRUD mutations
  const createProduct = useMutation({
    mutationFn: (data: any) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      callbacks?.onCreateSuccess?.();
      toast.success("Produit créé avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création"
      );
    },
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      callbacks?.onEditSuccess?.();
      toast.success("Produit mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la suppression"
      );
    },
  });

  // Variant CRUD mutations
  const addVariant = useMutation({
    mutationFn: ({
      productId,
      data,
    }: {
      productId: string;
      data: ProductVariant;
    }) => productService.addVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de l'ajout du variant"
      );
    },
  });

  const updateVariant = useMutation({
    mutationFn: ({
      productId,
      variantId,
      data,
    }: {
      productId: string;
      variantId: string;
      data: ProductVariant;
    }) => productService.updateVariant(productId, variantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du variant"
      );
    },
  });

  const deleteVariant = useMutation({
    mutationFn: ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => productService.deleteVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Variant supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression du variant"
      );
    },
  });

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    addVariant,
    updateVariant,
    deleteVariant,
  };
};
