import { TransactionType } from '@/lib/db/schema';
import type { CategorySummary } from './category.types';

export interface TransactionFilter {
  userId: string;
  date?: {
    gte: Date;
    lte: Date;
  };
  type?: TransactionType;
  categoryId?: string;
}

export interface TransactionsSummary {
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  expensesByCategory: CategorySummary[];
}

