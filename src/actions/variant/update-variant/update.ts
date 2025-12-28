"use server";

import { verifyAuth } from "@/lib/auth";
import {
  findVariantById,
  updateVariant,
  findManyVariants,
} from "@/lib/db/helpers";
import type { UpdateProductVariantInput } from "@/lib/db/schema";
import { z } from "zod";

const updateVariantSchema = z.object({
  color: z.string().optional(),
  size: z.string().optional(),
  costPrice: z
    .number()
    .nonnegative("Preço de custo deve ser positivo")
    .optional(),
  salePrice: z
    .number()
    .nonnegative("Preço de venda deve ser positivo")
    .optional(),
  stockQuantity: z
    .number()
    .int()
    .min(0, "Quantidade deve ser maior ou igual a 0")
    .optional(),
});

export async function updateVariantAction(
  id: string,
  data: UpdateProductVariantInput
) {
  await verifyAuth();

  const variant = await findVariantById(id);
  if (!variant) {
    throw new Error("Variante não encontrada");
  }

  const validation = updateVariantSchema.safeParse(data);
  if (!validation.success) {
    throw new Error("Dados inválidos");
  }

  // Verificar se a nova combinação de cor/tamanho já existe em outra variante
  if (data.color !== undefined || data.size !== undefined) {
    const existingVariants = await findManyVariants({
      productId: variant.productId,
    });
    const newColor = data.color !== undefined ? data.color : variant.color;
    const newSize = data.size !== undefined ? data.size : variant.size;

    const duplicate = existingVariants.find(
      (v) => v.id !== id && v.color === newColor && v.size === newSize
    );

    if (duplicate) {
      throw new Error(
        "Já existe uma variante com esta combinação de cor e tamanho"
      );
    }
  }

  const updatedVariant = await updateVariant(id, validation.data);
  return updatedVariant;
}
