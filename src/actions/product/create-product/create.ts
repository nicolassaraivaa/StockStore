"use server";

import { findProductBy, createProduct } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";
import type { CreateProductInput } from "@/lib/db/schema";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  categoryId: z.string().uuid("Categoria inválida"),
  description: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  costPrice: z
    .number({
      required_error: "Preço de custo é obrigatório",
      invalid_type_error: "Preço de custo deve ser um número",
    })
    .min(0.01, "Preço de custo é obrigatório e deve ser maior que zero"),
  salePrice: z
    .number({
      required_error: "Preço de venda é obrigatório",
      invalid_type_error: "Preço de venda deve ser um número",
    })
    .min(0.01, "Preço de venda é obrigatório e deve ser maior que zero"),
  stockQuantity: z
    .number({
      required_error: "Quantidade em estoque é obrigatória",
      invalid_type_error: "Quantidade em estoque deve ser um número",
    })
    .int("Quantidade em estoque deve ser um número inteiro")
    .min(0, "Quantidade em estoque deve ser maior ou igual a zero"),
});

export async function createProductAction(data: CreateProductInput) {
  const userId = await verifyAuth();
  const validation = createProductSchema.safeParse(data);

  if (!validation.success) {
    throw new Error(validation.error.errors[0]?.message || "Dados inválidos");
  }

  const product = await createProduct({ ...validation.data, userId });
  return product;
}
