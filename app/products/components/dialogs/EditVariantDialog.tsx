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
import { Plus, X } from "lucide-react";
import React from "react";
import { Product, ProductVariant } from "../../types/product";

interface EditVariantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; variantId: string; data: any }) => void;
  isLoading: boolean;
  product: Product | null;
  variant: ProductVariant | null;
  unitTypes: ('weight' | 'piece')[];
}

export const EditVariantDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  product,
  variant,
  unitTypes,
}: EditVariantDialogProps) => {
  const [localVariant, setLocalVariant] = React.useState<ProductVariant | null>(variant);

  React.useEffect(() => {
    setLocalVariant(variant);
  }, [variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !localVariant || !localVariant.variant_id) return;

    const data = {
      variant_id: localVariant.variant_id,
      variant_name: localVariant.variant_name || "",
      price: localVariant.price,
      unit_type: localVariant.unit_type,
      grams: localVariant.grams,
      options: localVariant.options || [],
    };

    onSubmit({
      productId: product.id,
      variantId: localVariant.variant_id,
      data,
    });
  };

  const updateVariant = (field: keyof ProductVariant, value: any) => {
    if (!localVariant) return;
    setLocalVariant({ ...localVariant, [field]: value });
  };

  const addOption = () => {
    if (!localVariant) return;
    const newOptions = [...(localVariant.options || []), { name: "", value: "" }];
    updateVariant("options", newOptions);
  };

  const updateOption = (index: number, field: 'name' | 'value', value: string) => {
    if (!localVariant) return;
    const newOptions = [...(localVariant.options || [])];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateVariant("options", newOptions);
  };

  const removeOption = (index: number) => {
    if (!localVariant) return;
    const newOptions = (localVariant.options || []).filter((_, i) => i !== index);
    updateVariant("options", newOptions);
  };

  if (!localVariant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier le variant</DialogTitle>
          <DialogDescription>
            Modifiez les informations du variant
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_variant_id">ID du variant</Label>
              <Input
                id="edit_variant_id"
                value={localVariant.variant_id}
                onChange={(e) => updateVariant("variant_id", e.target.value)}
                placeholder="ex: citron-jaune-1kg"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_variant_name">Nom du variant</Label>
              <Input
                id="edit_variant_name"
                value={localVariant.variant_name || ""}
                onChange={(e) => updateVariant("variant_name", e.target.value)}
                placeholder="ex: Citron Jaune"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit_variant_unit_type">Type d'unité</Label>
              <Select
                value={localVariant.unit_type}
                onValueChange={(value) => updateVariant("unit_type", value as 'weight' | 'piece')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type d'unité" />
                </SelectTrigger>
                <SelectContent>
                  {unitTypes.map((unitType) => (
                    <SelectItem key={unitType} value={unitType}>
                      {unitType === 'weight' ? 'Poids' : 'Pièce'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {localVariant.unit_type === 'weight' && (
              <div>
                <Label htmlFor="edit_variant_grams">Grammes</Label>
                <Input
                  id="edit_variant_grams"
                  type="number"
                  min="1"
                  value={localVariant.grams || ""}
                  onChange={(e) =>
                    updateVariant("grams", e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="ex: 1000"
                />
              </div>
            )}

            <div>
              <Label htmlFor="edit_variant_price">Prix (€)</Label>
              <Input
                id="edit_variant_price"
                type="number"
                min="0"
                step="0.01"
                value={localVariant.price}
                onChange={(e) =>
                  updateVariant("price", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Options du variant</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="w-3 h-3 mr-1" />
                Option
              </Button>
            </div>
            {localVariant.options?.map((option, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Nom (ex: Couleur)"
                  value={option.name}
                  onChange={(e) => updateOption(index, 'name', e.target.value)}
                />
                <Input
                  placeholder="Valeur (ex: Rouge)"
                  value={option.value}
                  onChange={(e) => updateOption(index, 'value', e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
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