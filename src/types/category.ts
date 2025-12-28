import type { TransactionType } from "./transactions";

export interface Category {
  id: string;
  name: string;
  color: string;
  type: TransactionType
}

// CategorySummary está em category.types.ts