// components/dialogs/ViewProductDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2 } from "lucide-react";
import { Product, ProductVariant } from "../../types/product";

interface ViewProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onAddVariant: (product: Product) => void;
  onEditVariant: (product: Product, variant: ProductVariant, index: number) => void;
  onDeleteVariant: (productId: string, variantId: string) => void;
}

export const ViewProductDialog = ({
  open,
  onClose,
  product,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
}: ViewProductDialogProps) => {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {product.image && (
            <div className="flex justify-center">
              <img
                src={product.image}
                alt={product.title}
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Titre</Label>
              <p className="text-sm text-muted-foreground">{product.title}</p>
            </div>
            <div>
              <Label>Catégorie</Label>
              <Badge variant="outline">{product.category}</Badge>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <p className="text-sm text-muted-foreground">
              {product.description || "Aucune description"}
            </p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {product.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Variants</Label>
              <Button size="sm" onClick={() => onAddVariant(product)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter variant
              </Button>
            </div>
            <div className="space-y-2">
              {product.variants?.map((variant: ProductVariant, index: number) => (
                <div
                  key={variant.id || index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {variant.unit}
                      {variant.isDefault && (
                        <Badge variant="default" className="ml-2 text-xs">
                          Par défaut
                        </Badge>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {variant.price?.toFixed(2)}€
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Stock: {variant.stock || 0}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVariant(product, variant, index)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {variant.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDeleteVariant(product.id, variant.id!)
                          }
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Statut</Label>
            <Badge variant={product.isActive ? "default" : "secondary"}>
              {product.isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};