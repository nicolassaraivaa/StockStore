"use server";

import { findProductById, deleteProduct } from "@/lib/db/helpers";
import { verifyAuth } from "@/lib/auth";

export async function deleteProductAction(id: string) {
  const userId = await verifyAuth();
  
  // Verificar se o produto existe e pertence ao usuário
  const product = await findProductById(id, userId);
  if (!product) {
    throw new Error("Produto não encontrado");
  }

  await deleteProduct(id, userId);
  return { success: true };
}

