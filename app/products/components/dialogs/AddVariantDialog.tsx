// components/dialogs/AddVariantDialog.tsx
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
import { Product } from "../../types/product";

interface AddVariantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; data: any }) => void;
  isLoading: boolean;
  product: Product | null;
  units: string[];
}

export const AddVariantDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  product,
  units,
}: AddVariantDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      unit: formData.get("unit") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      quantity: 1,
    };

    onSubmit({ productId: product.id, data });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un variant</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau variant au produit &quot;{product?.title}&quot;
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="add_variant_unit">Unité</Label>
            <Select name="unit" required>
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
            <Label htmlFor="add_variant_price">Prix (€)</Label>
            <Input
              id="add_variant_price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div>
            <Label htmlFor="add_variant_stock">Stock</Label>
            <Input
              id="add_variant_stock"
              name="stock"
              type="number"
              min="0"
              defaultValue="0"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ajout..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
