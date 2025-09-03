// components/dialogs/EditVariantDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductVariant } from "../../types/product";

interface EditVariantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; variantId: string; data: any }) => void;
  isLoading: boolean;
  product: Product | null;
  variant: ProductVariant | null;
  units: string[];
}

export const EditVariantDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  product,
  variant,
  units,
}: EditVariantDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !variant || !variant.id) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      unit: formData.get("unit") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      quantity: 1,
    };

    onSubmit({
      productId: product.id,
      variantId: variant.id,
      data,
    });
  };

  if (!variant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le variant</DialogTitle>
          <DialogDescription>
            Modifiez les informations du variant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit_variant_unit">Unité</Label>
            <Select name="unit" defaultValue={variant.unit}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une unité" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit_variant_price">Prix (€)</Label>
            <Input
              id="edit_variant_price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={variant.price}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit_variant_stock">Stock</Label>
            <Input
              id="edit_variant_stock"
              name="stock"
              type="number"
              min="0"
              defaultValue={variant.stock}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Mise à jour..." : "Mettre à jour"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};