"use server";

import { verifyAuth } from "@/lib/auth";
import { findVariantById, deleteVariant } from "@/lib/db/helpers";

export async function deleteVariantAction(id: string) {
  await verifyAuth();

  const variant = await findVariantById(id);
  if (!variant) {
    throw new Error("Variante não encontrada");
  }

  await deleteVariant(id);
}

