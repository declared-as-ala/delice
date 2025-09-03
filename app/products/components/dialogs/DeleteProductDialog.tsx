// components/dialogs/DeleteProductDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "../../types/product";

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isLoading: boolean;
  product: Product | null;
}

export const DeleteProductDialog = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  product,
}: DeleteProductDialogProps) => {
  const handleConfirm = () => {
    if (product) {
      onConfirm(product.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer le produit</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est
            irréversible et supprimera également tous ses variants.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};