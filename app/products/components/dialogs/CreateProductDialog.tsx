// components/dialogs/CreateProductDialog.tsx
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { ProductVariant } from "../../types/product";

interface CreateProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  categories: string[];
  unitTypes: ('weight' | 'piece')[];
  variants: ProductVariant[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (index: number, field: keyof ProductVariant, value: any) => void;
}

export const CreateProductDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  categories,
  unitTypes,
  variants,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
}: CreateProductDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      variants: variants.map((variant) => ({
        variant_id: variant.variant_id,
        variant_name: variant.variant_name || "",
        price: variant.price,
        unit_type: variant.unit_type,
        grams: variant.grams,
        options: variant.options || [],
      })),
      Image: (formData.get("image") as string) || "",
    };

    onSubmit(data);
  };

  const addVariantOption = (variantIndex: number) => {
    const variant = variants[variantIndex];
    const newOptions = [...(variant.options || []), { name: "", value: "" }];
    onUpdateVariant(variantIndex, "options", newOptions);
  };

  const updateVariantOption = (variantIndex: number, optionIndex: number, field: 'name' | 'value', value: string) => {
    const variant = variants[variantIndex];
    const newOptions = [...(variant.options || [])];
    newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
    onUpdateVariant(variantIndex, "options", newOptions);
  };

  const removeVariantOption = (variantIndex: number, optionIndex: number) => {
    const variant = variants[variantIndex];
    const newOptions = (variant.options || []).filter((_, i) => i !== optionIndex);
    onUpdateVariant(variantIndex, "options", newOptions);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
          <DialogDescription>
            Remplissez les informations du produit et configurez ses variants
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titre du produit</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="create_category">Catégorie</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div>
            <Label htmlFor="image">URL de l'image</Label>
            <Input
              id="image"
              name="image"
              type="url"
              placeholder="https://..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Variants du produit</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddVariant}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un variant
              </Button>
            </div>
            <div className="space-y-4">
              {variants.map((variant, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveVariant(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>ID du variant</Label>
                          <Input
                            value={variant.variant_id}
                            onChange={(e) =>
                              onUpdateVariant(index, "variant_id", e.target.value)
                            }
                            placeholder="ex: citron-jaune-1kg"
                            required
                          />
                        </div>
                        <div>
                          <Label>Nom du variant (optionnel)</Label>
                          <Input
                            value={variant.variant_name || ""}
                            onChange={(e) =>
                              onUpdateVariant(index, "variant_name", e.target.value)
                            }
                            placeholder="ex: Citron Jaune"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Type d'unité</Label>
                          <Select
                            value={variant.unit_type}
                            onValueChange={(value) =>
                              onUpdateVariant(index, "unit_type", value as 'weight' | 'piece')
                            }
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
                            <Label>Grammes</Label>
                            <Input
                              type="number"
                              min="1"
                              value={variant.grams || ""}
                              onChange={(e) =>
                                onUpdateVariant(
                                  index,
                                  "grams",
                                  e.target.value ? parseInt(e.target.value) : null
                                )
                              }
                              placeholder="ex: 1000"
                            />
                          </div>
                        )}
                        
                        <div>
                          <Label>Prix (€)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) =>
                              onUpdateVariant(
                                index,
                                "price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            required
                          />
                        </div>
                      </div>

                      {/* Variant Options */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Options du variant</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addVariantOption(index)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Option
                          </Button>
                        </div>
                        {variant.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex gap-2 mb-2">
                            <Input
                              placeholder="Nom (ex: Couleur)"
                              value={option.name}
                              onChange={(e) =>
                                updateVariantOption(index, optionIndex, 'name', e.target.value)
                              }
                            />
                            <Input
                              placeholder="Valeur (ex: Rouge)"
                              value={option.value}
                              onChange={(e) =>
                                updateVariantOption(index, optionIndex, 'value', e.target.value)
                              }
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariantOption(index, optionIndex)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création..." : "Créer le produit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};