"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getVariants,
  createVariantAction,
  updateVariantAction,
  deleteVariantAction,
} from "@/actions/variant";
import type {
  CreateProductVariantInput,
  UpdateProductVariantInput,
} from "@/lib/db/schema";

export function useVariants(productId?: string) {
  return useQuery({
    queryKey: ["variants", productId],
    queryFn: () => getVariants(productId!),
    enabled: !!productId,
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductVariantInput) => createVariantAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["variants", variables.productId],
      });
      queryClient.invalidateQueries({ queryKey: ["variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      console.error("Erro ao criar variante:", error);
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductVariantInput;
    }) => updateVariantAction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVariantAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["variants"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
