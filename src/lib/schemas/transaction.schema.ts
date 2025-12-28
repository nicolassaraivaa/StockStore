import { z } from "zod";
import { TransactionType } from "@/lib/db/schema";

export const createTransactionSchema = z.object({
  productId: z.string().uuid({
    message: "Product ID must be a valid UUID",
  }),
  variantId: z
    .string()
    .uuid({
      message: "Variant ID must be a valid UUID",
    })
    .optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().positive("Unit price must be a positive number"),
  date: z.coerce.date({
    errorMap: () => ({ message: "Data must be a valid date" }),
  }),
  type: z.enum([TransactionType.EXPENSE, TransactionType.INCOME], {
    errorMap: () => ({ message: "Wrong information!" }),
  }),
  clientName: z.string().optional(),
  observations: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
