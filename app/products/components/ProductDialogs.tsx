// components/ProductDialogs.tsx
import { CreateProductDialog } from "./dialogs/CreateProductDialog";
import { EditProductDialog } from "./dialogs/EditProductDialog";
import { ViewProductDialog } from "./dialogs/ViewProductDialog";
import { DeleteProductDialog } from "./dialogs/DeleteProductDialog";
import { AddVariantDialog } from "./dialogs/AddVariantDialog";
import { EditVariantDialog } from "./dialogs/EditVariantDialog";
import { ProductVariant } from "../types/product";

interface ProductDialogsProps {
  dialogs: any;
  mutations: any;
  categories: string[];
  units: string[];
  createVariants: ProductVariant[];
  editVariants: ProductVariant[];
  onAddCreateVariant: () => void;
  onRemoveCreateVariant: (index: number) => void;
  onUpdateCreateVariant: (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => void;
  onAddEditVariant: () => void;
  onRemoveEditVariant: (index: number) => void;
  onUpdateEditVariant: (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => void;
  onDeleteVariant: (productId: string, variantId: string) => void;
  onEditVariant: (product: any, variant: ProductVariant, index: number) => void;
}

export const ProductDialogs = ({
  dialogs,
  mutations,
  categories,
  units,
  createVariants,
  editVariants,
  onAddCreateVariant,
  onRemoveCreateVariant,
  onUpdateCreateVariant,
  onAddEditVariant,
  onRemoveEditVariant,
  onUpdateEditVariant,
  onDeleteVariant,
  onEditVariant,
}: ProductDialogsProps) => {
  return (
    <>
      <CreateProductDialog
        open={dialogs.createDialog}
        onClose={dialogs.closeCreate}
        onSubmit={mutations.createProduct.mutate}
        isLoading={mutations.createProduct.isPending}
        categories={categories}
        units={units}
        variants={createVariants}
        onAddVariant={onAddCreateVariant}
        onRemoveVariant={onRemoveCreateVariant}
        onUpdateVariant={onUpdateCreateVariant}
      />

      <EditProductDialog
        open={dialogs.editDialog}
        onClose={dialogs.closeEdit}
        onSubmit={mutations.updateProduct.mutate}
        isLoading={mutations.updateProduct.isPending}
        product={dialogs.selectedProduct}
        categories={categories}
        units={units}
        variants={editVariants}
        onAddVariant={onAddEditVariant}
        onRemoveVariant={onRemoveEditVariant}
        onUpdateVariant={onUpdateEditVariant}
      />

      <ViewProductDialog
        open={dialogs.viewDialog}
        onClose={dialogs.closeView}
        product={dialogs.selectedProduct}
        onAddVariant={dialogs.openAddVariant}
        onEditVariant={onEditVariant}
        onDeleteVariant={onDeleteVariant}
      />

      <DeleteProductDialog
        open={dialogs.deleteDialog}
        onClose={dialogs.closeDelete}
        onConfirm={mutations.deleteProduct.mutate}
        isLoading={mutations.deleteProduct.isPending}
        product={dialogs.selectedProduct}
      />

      <AddVariantDialog
        open={dialogs.addVariantDialog}
        onClose={dialogs.closeAddVariant}
        onSubmit={mutations.addVariant.mutate}
        isLoading={mutations.addVariant.isPending}
        product={dialogs.selectedProduct}
        units={units}
      />

      <EditVariantDialog
        open={dialogs.editVariantDialog}
        onClose={dialogs.closeEditVariant}
        onSubmit={mutations.updateVariant.mutate}
        isLoading={mutations.updateVariant.isPending}
        product={dialogs.selectedProduct}
        variant={dialogs.selectedVariant}
        units={units}
      />
    </>
  );
};
