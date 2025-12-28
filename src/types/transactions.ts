import type { Product } from "@/lib/db/schema";

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export interface Transactions {
  id: string;
  userId: string;
  productId: string | null;
  variantId?: string | null;
  quantity: number;
  unitPrice: number;
  date: string | Date;
  type: TransactionType;
  clientName?: string | null;
  observations?: string | null;
  product?: Product | null;
  variant?: {
    id: string;
    color?: string | null;
    size?: string | null;
    sku?: string | null;
  } | null;
  updatedAt: string | Date;
  createdAt: string | Date;
}

export interface CreateTransactionDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  date: string | Date;
  type: TransactionType;
  clientName?: string;
  observations?: string;
}

// TransactionFilter e TransactionSummary estão em transactions.type.ts
// TransactionFilter do frontend (sem userId) vs backend (com userId)

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: any[];
}

export interface MonthlyItem {
  name: string;
  expenses: number;
  income: number;
}
