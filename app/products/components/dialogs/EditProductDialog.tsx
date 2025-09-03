// components/dialogs/EditProductDialog.tsx
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { Product, ProductVariant } from "../../types/product";

interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { id: string; data: any }) => void;
  isLoading: boolean;
  product: Product | null;
  categories: string[];
  units: string[];
  variants: ProductVariant[];
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (index: number, field: keyof ProductVariant, value: any) => void;
}

export const EditProductDialog = ({
  open,
  onClose,
  onSubmit,
  isLoading,
  product,
  categories,
  units,
  variants,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
}: EditProductDialogProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const formData = new FormData(e.target as HTMLFormElement);

    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as string,
      variants: variants.map((variant) => ({
        id: variant.id,
        unit: variant.unit,
        price: variant.price,
        stock: variant.stock,
        quantity: variant.quantity || 1,
        isDefault: variant.isDefault,
      })),
      isActive: formData.get("isActive") === "on",
      image: (formData.get("image") as string) || product.image,
      tags:
        (formData.get("tags") as string)
          ?.split(",")
          .map((tag) => tag.trim())
          .filter(Boolean) || [],
    };

    onSubmit({ id: product.id, data });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>
            Modifiez les informations du produit et gérez ses variants
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_title">Titre du produit</Label>
              <Input
                id="edit_title"
                name="title"
                defaultValue={product.title}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_category">Catégorie</Label>
              <Select name="category" defaultValue={product.category}>
                <SelectTrigger>
                  <SelectValue />
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
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              name="description"
              rows={3}
              defaultValue={product.description}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_image">URL de l'image</Label>
              <Input
                id="edit_image"
                name="image"
                type="url"
                placeholder="https://..."
                defaultValue={product.image}
              />
            </div>
            <div>
              <Label htmlFor="edit_tags">Tags (séparés par des virgules)</Label>
              <Input
                id="edit_tags"
                name="tags"
                placeholder="bio, local, frais"
                defaultValue={product.tags?.join(", ") || ""}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="edit_isActive"
              name="isActive"
              defaultChecked={product.isActive}
              className="rounded border-gray-300"
            />
            <Label htmlFor="edit_isActive">Produit actif</Label>
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
                <Card key={variant.id || index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">
                        Variant {index + 1}
                        {variant.id && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Existant
                          </Badge>
                        )}
                      </h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveVariant(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Unité</Label>
                        <Select
                          value={variant.unit}
                          onValueChange={(value) =>
                            onUpdateVariant(index, "unit", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Unité" />
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
                      <div>
                        <Label>Stock</Label>
                        <Input
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) =>
                            onUpdateVariant(
                              index,
                              "stock",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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