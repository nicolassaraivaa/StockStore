"use server";

import { verifyAuth } from "@/lib/auth";
import { findManyVariants } from "@/lib/db/helpers";

export async function getVariants(productId?: string) {
  await verifyAuth();

  const variants = await findManyVariants(
    productId ? { productId } : undefined
  );

  return variants;
}

