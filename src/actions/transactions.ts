"use server";

import { verifyAuth } from '@/lib/auth';
import { findManyTransactions, findTransactionById, createTransaction as createTransactionDb, deleteTransaction as deleteTransactionDb, findCategoryBy } from '@/lib/db/helpers';
import { db } from '@/lib/db/index';
import { categories } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createTransactionSchema, type CreateTransactionInput } from '@/lib/schemas/transaction.schema';
import { TransactionType } from '@/lib/db/schema';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/pt-br';
import type { CategorySummary } from '@/types/category.types';
import type { TransactionsSummary } from '@/types/transactions.type';

dayjs.extend(utc);
dayjs.locale('pt-br');

export async function getTransactions(filters?: {
  month?: number;
  year?: number;
  categoryId?: string;
  type?: TransactionType;
}) {
  const userId = await verifyAuth();

  const queryFilters: {
    userId: string;
    date?: { gte?: Date; lte?: Date };
    type?: TransactionType;
    categoryId?: string;
    orderBy?: { date?: 'desc' };
  } = { userId, orderBy: { date: 'desc' } };

  if (filters?.month && filters?.year) {
    const startDate = dayjs.utc(`${filters.year}-${filters.month}-01`).startOf('month').toDate();
    const endDate = dayjs.utc(startDate).endOf('month').toDate();

    queryFilters.date = { gte: startDate, lte: endDate };
  }

  if (filters?.type) {
    queryFilters.type = filters.type;
  }

  if (filters?.categoryId) {
    queryFilters.categoryId = filters.categoryId;
  }

  const transactions = await findManyTransactions(queryFilters);

  // Buscar categorias relacionadas
  const transactionsWithCategory = await Promise.all(
    transactions.map(async (transaction) => {
      const category = await db
        .select({
          color: categories.color,
          name: categories.name,
          type: categories.type,
        })
        .from(categories)
        .where(eq(categories.id, transaction.categoryId))
        .limit(1);
      
      return {
        ...transaction,
        category: category[0] || null,
      };
    })
  );

  return transactionsWithCategory;
}

export async function getTransactionSummary(month: number, year: number) {
  const userId = await verifyAuth();

  const startDate = dayjs.utc(`${year}-${month}-01`).startOf('month').toDate();
  const endDate = dayjs.utc(startDate).endOf('month').toDate();

  const transactions = await findManyTransactions({
    userId,
    date: { gte: startDate, lte: endDate },
    orderBy: { date: 'desc' },
  });

  // Buscar categorias relacionadas
  const transactionsWithCategory = await Promise.all(
    transactions.map(async (transaction) => {
      const category = await db
        .select()
        .from(categories)
        .where(eq(categories.id, transaction.categoryId))
        .limit(1);
      
      return {
        ...transaction,
        category: category[0] || null,
      };
    })
  );

  let totalExpenses = 0;
  let totalIncome = 0;
  const groupedExpenses = new Map<string, CategorySummary>();

  for (const transaction of transactionsWithCategory) {
    if (transaction.type === TransactionType.EXPENSE && transaction.category) {
      const categoryIdStr = transaction.categoryId;
      const existing =
        groupedExpenses.get(categoryIdStr) ?? {
          categoryId: categoryIdStr,
          categoryName: transaction.category.name,
          categoryColor: transaction.category.color,
          amount: 0,
          percentage: 0,
        };

      existing.amount += transaction.amount;
      groupedExpenses.set(categoryIdStr, existing);

      totalExpenses += transaction.amount;
    } else {
      totalIncome += transaction.amount;
    }
  }

  const summary: TransactionsSummary = {
    totalExpenses,
    totalIncome,
    balance: Number((totalIncome - totalExpenses).toFixed(2)),
    expensesByCategory: Array.from(groupedExpenses.values())
      .map((entry) => ({
        ...entry,
        percentage: Number.parseFloat(((entry.amount / totalExpenses) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.amount - a.amount),
  };

  return summary;
}

export async function getTransactionMonthly(month: number, year: number, months: number = 6) {
  const userId = await verifyAuth();

  const baseDate = new Date(year, month - 1, 1);

  const startDate = dayjs.utc(baseDate).subtract(months - 1, 'month').startOf('month').toDate();
  const endDate = dayjs.utc(baseDate).endOf('month').toDate();

  const transactions = await findManyTransactions({
    userId,
    date: { gte: startDate, lte: endDate },
  });

  const monthlyData = Array.from({ length: months }, (_, i) => {
    const data = dayjs.utc(baseDate).subtract(months - 1 - i, 'month');

    return {
      name: data.format('MMM/YYYY'),
      income: 0,
      expenses: 0,
    };
  });

  transactions.forEach((transaction) => {
    const monthKey = dayjs.utc(transaction.date).format('MMM/YYYY');
    const monthData = monthlyData.find((m) => m.name === monthKey);

    if (monthData) {
      if (transaction.type === 'INCOME') {
        monthData.income += transaction.amount;
      } else {
        monthData.expenses += transaction.amount;
      }
    }
  });

  return { history: monthlyData };
}

export async function createTransaction(data: CreateTransactionInput) {
  const userId = await verifyAuth();

  const result = createTransactionSchema.safeParse(data);

  if (!result.success) {
    throw new Error('Validação inválida');
  }

  const transaction = result.data;

  const category = await findCategoryBy({
    id: transaction.categoryId,
    type: transaction.type,
  });

  if (!category) {
    throw new Error('Categoria inválida');
  }

  const parseData = new Date(transaction.date);

  const newTransaction = await createTransactionDb({
    ...transaction,
    userId,
    date: parseData,
    categoryId: transaction.categoryId,
  });

  // Buscar categoria relacionada
  const categoryData = await db
    .select()
    .from(categories)
    .where(eq(categories.id, newTransaction.categoryId))
    .limit(1);

  return {
    ...newTransaction,
    category: categoryData[0] || null,
  };
}

export async function deleteTransaction(id: string) {
  const userId = await verifyAuth();

  const transaction = await findTransactionById(id, userId);

  if (!transaction) {
    throw new Error('ID da transação inválido');
  }

  await deleteTransactionDb(id);
}

