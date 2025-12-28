"use server";

import { verifyAuth } from "@/lib/auth";
import { findManyVariants, createVariant } from "@/lib/db/helpers";
import type { CreateProductVariantInput } from "@/lib/db/schema";
import { z } from "zod";

const createVariantSchema = z.object({
  productId: z.string().uuid("ID do produto inválido"),
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
    .min(0, "Quantidade deve ser maior ou igual a 0"),
});

export async function createVariantAction(data: CreateProductVariantInput) {
  await verifyAuth();

  const validation = createVariantSchema.safeParse(data);

  if (!validation.success) {
    throw new Error("Dados inválidos");
  }

  // Verificar se já existe variante com a mesma combinação de produto, cor e tamanho
  const existingVariants = await findManyVariants({
    productId: data.productId,
  });
  const duplicate = existingVariants.find(
    (v) => v.color === data.color && v.size === data.size
  );

  if (duplicate) {
    throw new Error(
      "Já existe uma variante com esta combinação de cor e tamanho"
    );
  }

  const variant = await createVariant(validation.data);
  return variant;
}
