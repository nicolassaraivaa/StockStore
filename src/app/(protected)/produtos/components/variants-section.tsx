"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVariants, useDeleteVariant } from "@/hooks/useVariants";
import { formatCurrency } from "@/utils/formatter";
import VariantModal from "./variant-modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VariantsSectionProps {
  productId: string;
}

export default function VariantsSection({ productId }: VariantsSectionProps) {
  const { data: variants = [], isLoading } = useVariants(productId);
  const deleteMutation = useDeleteVariant();
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  );

  const handleEdit = (variant: any) => {
    setEditingVariant(variant);
    setIsVariantModalOpen(true);
  };

  const handleDelete = (variantId: string) => {
    setDeletingVariantId(variantId);
  };

  const confirmDelete = () => {
    if (deletingVariantId) {
      deleteMutation.mutate(deletingVariantId, {
        onSuccess: () => {
          setDeletingVariantId(null);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setIsVariantModalOpen(false);
    setEditingVariant(null);
  };

  const handleNewVariant = () => {
    setEditingVariant(null);
    setIsVariantModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
        {/* Barra com input e botão */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Buscar variante..."
            className="flex-1 bg-white border-gray-300 text-gray-900"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          />
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleNewVariant();
            }}
            className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg px-4 py-2 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Variante
          </Button>
        </div>

        {variants.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center border border-gray-200 min-h-[300px] flex flex-col items-center justify-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-6 text-base">
              Nenhuma variante cadastrada
            </p>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNewVariant();
              }}
              className="bg-[#10B981] hover:bg-[#059669] text-white rounded-lg px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar primeira variante
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variants.map((variant) => {
              const profit =
                (variant.salePrice || 0) - (variant.costPrice || 0);
              const margin =
                variant.costPrice && variant.costPrice > 0
                  ? ((variant.salePrice || 0) - variant.costPrice) /
                    variant.costPrice
                  : 0;

              return (
                <div
                  key={variant.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {(variant.color || variant.size) && (
                          <span className="text-sm font-medium text-gray-900">
                            {[variant.color, variant.size]
                              .filter(Boolean)
                              .join(" - ")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(variant)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Editar variante"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Excluir variante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    {variant.costPrice && variant.salePrice && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Custo:</span>
                          <span className="text-gray-900">
                            {formatCurrency(variant.costPrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Venda:</span>
                          <span className="text-gray-900">
                            {formatCurrency(variant.salePrice)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lucro:</span>
                          <span
                            className={`font-semibold ${
                              profit >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(profit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Margem:</span>
                          <span
                            className={`font-semibold ${
                              margin >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {(margin * 100).toFixed(1)}%
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Estoque:</span>
                      <span className="font-semibold text-gray-900">
                        {variant.stockQuantity} un.
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <VariantModal
        open={isVariantModalOpen}
        onClose={handleCloseModal}
        productId={productId}
        variant={editingVariant}
      />

      <AlertDialog
        open={!!deletingVariantId}
        onOpenChange={() => setDeletingVariantId(null)}
      >
        <AlertDialogContent className="bg-gray-800 border-gray-700 max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-50 text-xl font-bold">
              Excluir variante
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-base mt-2">
              Tem certeza que deseja excluir esta variante? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row justify-end gap-3 mt-6">
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-gray-50 border-gray-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
