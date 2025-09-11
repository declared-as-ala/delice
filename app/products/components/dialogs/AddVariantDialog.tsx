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
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Product } from "../../types/product";

interface AddVariantDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { productId: string; data: any }) => void;
  isLoading: boolean;
  product: Product | null;
  unitTypes: ('weight' | 'piece')[];
}

export const AddVariantDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  product,
  unitTypes,
}: AddVariantDialogProps) => {
  const [variant, setVariant] = useState({
    variant_id: "",
    variant_name: "",
    price: 0,
    unit_type: "piece" as 'weight' | 'piece',
    grams: null as number | null,
    options: [] as { name: string; value: string }[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const data = {
      variant_id: variant.variant_id,
      variant_name: variant.variant_name || "",
      price: variant.price,
      unit_type: variant.unit_type,
      grams: variant.grams,
      options: variant.options,
    };

    onSubmit({
      productId: product.id,
      data,
    });

    // Reset form
    setVariant({
      variant_id: "",
      variant_name: "",
      price: 0,
      unit_type: "piece",
      grams: null,
      options: [],
    });
  };

  const updateVariant = (field: string, value: any) => {
    setVariant(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate variant_id if certain fields change
    if (field === 'variant_name' || field === 'unit_type' || field === 'grams') {
      const name = field === 'variant_name' ? value : variant.variant_name || "default";
      const unitType = field === 'unit_type' ? value : variant.unit_type;
      const grams = field === 'grams' ? value : variant.grams;
      
      const unit = unitType === 'weight' && grams ? `${grams}g` : unitType;
      const generatedId = `${name}-${unit}`.toLowerCase().replace(/\s+/g, '-');
      
      setVariant(prev => ({ ...prev, [field]: value, variant_id: generatedId }));
    }
  };

  const addOption = () => {
    setVariant(prev => ({
      ...prev,
      options: [...prev.options, { name: "", value: "" }]
    }));
  };

  const updateOption = (index: number, field: 'name' | 'value', value: string) => {
    const newOptions = [...variant.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setVariant(prev => ({ ...prev, options: newOptions }));
  };

  const removeOption = (index: number) => {
    setVariant(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un variant</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau variant pour le produit "{product.title}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="add_variant_id">ID du variant</Label>
              <Input
                id="add_variant_id"
                value={variant.variant_id}
                onChange={(e) => updateVariant("variant_id", e.target.value)}
                placeholder="ex: citron-jaune-1kg"
                required
              />
            </div>
            <div>
              <Label htmlFor="add_variant_name">Nom du variant</Label>
              <Input
                id="add_variant_name"
                value={variant.variant_name}
                onChange={(e) => updateVariant("variant_name", e.target.value)}
                placeholder="ex: Citron Jaune"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="add_variant_unit_type">Type d'unité</Label>
              <Select
                value={variant.unit_type}
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

            {variant.unit_type === 'weight' && (
              <div>
                <Label htmlFor="add_variant_grams">Grammes</Label>
                <Input
                  id="add_variant_grams"
                  type="number"
                  min="1"
                  value={variant.grams || ""}
                  onChange={(e) =>
                    updateVariant("grams", e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="ex: 1000"
                />
              </div>
            )}

            <div>
              <Label htmlFor="add_variant_price">Prix (€)</Label>
              <Input
                id="add_variant_price"
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
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
            {variant.options.map((option, index) => (
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
              {isLoading ? "Ajout..." : "Ajouter le variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};