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

  const formatVariantDisplay = (variant: ProductVariant) => {
    let display = variant.variant_name || variant.variant_id;
    if (variant.unit_type === 'weight' && variant.grams) {
      display += ` (${variant.grams}g)`;
    } else if (variant.unit_type === 'piece') {
      display += ' (pièce)';
    }
    return display;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails du produit</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {product.Image && (
            <div className="flex justify-center">
              <img
                src={product.Image}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date de création</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(product.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <Label>Dernière mise à jour</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(product.updatedAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

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
                  key={variant.variant_id || index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">
                        {formatVariantDisplay(variant)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {variant.unit_type === 'weight' ? 'Poids' : 'Pièce'}
                      </Badge>
                    </div>
                    
                    {variant.options && variant.options.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {variant.options.map((option, optIndex) => (
                          <Badge key={optIndex} variant="outline" className="text-xs">
                            {option.name}: {option.value}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {variant.variant_id}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {variant.price?.toFixed(2)}€
                      </p>
                      {variant.unit_type === 'weight' && variant.grams && (
                        <p className="text-xs text-muted-foreground">
                          {(variant.price / (variant.grams / 1000)).toFixed(2)}€/kg
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditVariant(product, variant, index)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {variant.variant_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onDeleteVariant(product.id, variant.variant_id)
                          }
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!product.variants || product.variants.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun variant disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};