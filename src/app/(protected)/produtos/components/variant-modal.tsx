"use client";

import { useEffect, useState } from "react";
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from "@/hooks/useVariants";
import type {
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from "@/lib/db/schema";
import { formatCurrency } from "@/utils/formatter";
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

const variantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  costPrice: z
    .number()
    .nonnegative("Preço de custo deve ser maior ou igual a zero")
    .optional(),
  salePrice: z
    .number()
    .nonnegative("Preço de venda deve ser maior ou igual a zero")
    .optional(),
  stockQuantity: z
    .number()
    .int()
    .min(0, "Quantidade em estoque deve ser maior ou igual a zero"),
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface VariantModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  variant?: {
    id: string;
    color?: string | null;
    size?: string | null;
    costPrice?: number | null;
    salePrice?: number | null;
    stockQuantity: number;
  };
}

export default function VariantModal({
  open,
  onClose,
  productId,
  variant,
}: VariantModalProps) {
  const createMutation = useCreateVariant();
  const updateMutation = useUpdateVariant();
  const deleteMutation = useDeleteVariant();
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  );

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      color: "",
      size: "",
      costPrice: undefined,
      salePrice: undefined,
      stockQuantity: 0,
    },
  });

  // Função para formatar valor monetário (igual ao product-modal)
  const handleCurrencyChange = (
    value: string,
    onChange: (value: number) => void
  ) => {
    // Remove tudo exceto números
    const onlyNumbers = value.replace(/\D/g, "");
    // Divide por 100 para converter centavos em reais
    const numericValue = parseFloat(onlyNumbers) / 100;
    onChange(isNaN(numericValue) ? 0 : numericValue);
  };

  useEffect(() => {
    if (!open) return;

    if (variant) {
      form.reset({
        color: variant.color || "",
        size: variant.size || "",
        costPrice: variant.costPrice || undefined,
        salePrice: variant.salePrice || undefined,
        stockQuantity: variant.stockQuantity,
      });
    } else {
      form.reset({
        color: "",
        size: "",
        costPrice: undefined,
        salePrice: undefined,
        stockQuantity: 0,
      });
    }
  }, [variant, form, open]);

  const onSubmit = async (data: VariantFormValues) => {
    try {
      if (variant) {
        await updateMutation.mutateAsync({
          id: variant.id,
          data: data as UpdateProductVariantInput,
        });
      } else {
        await createMutation.mutateAsync({
          productId,
          ...data,
        } as CreateProductVariantInput);
      }
      form.reset();
      onClose();
    } catch (error) {
      // Erro já é tratado pelo hook
      console.error("Erro ao salvar variante:", error);
    }
  };

  const handleDelete = () => {
    if (deletingVariantId) {
      deleteMutation.mutate(deletingVariantId, {
        onSuccess: () => {
          setDeletingVariantId(null);
          onClose();
        },
      });
    }
  };

  const costPrice = form.watch("costPrice") || 0;
  const salePrice = form.watch("salePrice") || 0;
  const profit = salePrice - costPrice;
  const margin =
    costPrice > 0 ? ((salePrice - costPrice) / costPrice) * 100 : 0;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
      >
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-50 text-xl font-bold">
              {variant ? "Editar Variante" : "Nova Variante"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Cor</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Azul"
                          className="bg-gray-700 border-gray-600 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Tamanho</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: P, M, G"
                          className="bg-gray-700 border-gray-600 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="costPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Preço de Custo
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          value={field.value ? formatCurrency(field.value) : ""}
                          onChange={(e) => {
                            handleCurrencyChange(
                              e.target.value,
                              field.onChange
                            );
                          }}
                          className="bg-gray-700 border-gray-600 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">
                        Preço de Venda
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="R$ 0,00"
                          value={field.value ? formatCurrency(field.value) : ""}
                          onChange={(e) => {
                            handleCurrencyChange(
                              e.target.value,
                              field.onChange
                            );
                          }}
                          className="bg-gray-700 border-gray-600 text-gray-100"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {costPrice > 0 && salePrice > 0 && (
                <div className="bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Lucro:</span>
                    <span
                      className={`font-semibold ${
                        profit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatCurrency(profit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Margem:</span>
                    <span
                      className={`font-semibold ${
                        margin >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">
                      Quantidade em Estoque
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-gray-700 border-gray-600 text-gray-100"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                {variant && (
                  <Button
                    type="button"
                    onClick={() => setDeletingVariantId(variant.id)}
                    variant="destructive"
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-[#051626]"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {variant ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
              onClick={handleDelete}
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
