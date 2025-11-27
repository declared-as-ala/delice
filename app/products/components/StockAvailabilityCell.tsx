"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Save, X } from "lucide-react";
import { productService } from "@/lib/api";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

interface StockAvailabilityCellProps {
  productId: string;
  initialStock: number;
  initialDisponible: boolean;
}

export const StockAvailabilityCell = ({
  productId,
  initialStock,
  initialDisponible,
}: StockAvailabilityCellProps) => {
  const [stock, setStock] = useState(initialStock);
  const [disponible, setDisponible] = useState(initialDisponible);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    if (stock < 0 || !Number.isInteger(stock)) {
      toast.error("Le stock doit être un nombre entier positif");
      return;
    }

    setIsSaving(true);
    try {
      await productService.updateStockAndAvailability(
        productId,
        stock,
        disponible
      );
      toast.success("Stock et disponibilité mis à jour avec succès");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setStock(initialStock);
    setDisponible(initialDisponible);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Stock: {stock}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-6 px-2"
          >
            Modifier
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={disponible}
            onCheckedChange={async (checked) => {
              setDisponible(checked);
              try {
                await productService.updateAvailability(productId, checked);
                toast.success(
                  `Produit ${checked ? "activé" : "désactivé"} avec succès`
                );
                queryClient.invalidateQueries({ queryKey: ["products"] });
              } catch (error: any) {
                setDisponible(!checked); // Revert on error
                toast.error(
                  error.response?.data?.message || "Erreur lors de la mise à jour"
                );
              }
            }}
          />
          <span className="text-xs text-muted-foreground">
            {disponible ? "Disponible" : "Indisponible"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-[200px]">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={stock}
          onChange={(e) => setStock(parseInt(e.target.value) || 0)}
          min="0"
          className="h-8 w-20"
        />
        <span className="text-xs text-muted-foreground">unités</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={disponible}
          onCheckedChange={setDisponible}
        />
        <span className="text-xs text-muted-foreground">
          {disponible ? "Disponible" : "Indisponible"}
        </span>
      </div>
      <div className="flex gap-1">
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-7 px-2 flex-1"
        >
          <Save className="w-3 h-3 mr-1" />
          Enregistrer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
          className="h-7 px-2"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};

