"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTransactions,
  getTransactionSummary,
  getTransactionMonthly,
  createTransaction,
  deleteTransaction,
} from "@/actions/transaction/transactions";
import { getMostSoldProducts } from "@/actions/transaction/get-most-sold-products";
import type { CreateTransactionDTO } from "@/types/transactions";
import type { TransactionFilter } from "@/types/transactions.type";

export function useTransactions(filters?: {
  month?: number;
  year?: number;
  productId?: string;
  period?:
    | "current-month"
    | "last-3-months"
    | "last-6-months"
    | "last-12-months"
    | "all";
}) {
  return useQuery({
    queryKey: [
      "transactions",
      filters?.month,
      filters?.year,
      filters?.period,
      filters?.productId,
    ],
    queryFn: async () => {
      try {
        return await getTransactions(filters);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
    },
    retry: 1,
    // Não usar cache stale para garantir dados atualizados
    staleTime: 0,
    gcTime: 0,
  });
}

export function useTransactionSummary(
  month?: number,
  year?: number,
  period?:
    | "current-month"
    | "last-3-months"
    | "last-6-months"
    | "last-12-months"
    | "all"
) {
  return useQuery({
    queryKey: ["transaction-summary", month, year, period],
    queryFn: () => getTransactionSummary(month, year, period),
  });
}

export function useTransactionMonthly(
  month: number,
  year: number,
  months?: number
) {
  return useQuery({
    queryKey: ["transaction-monthly", month, year, months],
    queryFn: () => getTransactionMonthly(month, year, months || 6),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionData: CreateTransactionDTO) => {
      const result = await createTransaction({
        ...transactionData,
        date:
          transactionData.date instanceof Date
            ? transactionData.date
            : new Date(transactionData.date),
      } as any);

      // Se houver erro, lançar para ser capturado pelo onError
      if (!result.success) {
        throw new Error(result.error || "Falha ao adicionar transação!");
      }

      return result.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["most-sold-products"] });
      toast.success("Transação adicionada com sucesso!");
    },
    onError: (error: any) => {
      // Log adicional para debug
      console.error("Erro capturado no onError do hook:", error);
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-monthly"] });
      queryClient.invalidateQueries({ queryKey: ["most-sold-products"] });
    },
  });
}

export function useMostSoldProducts(
  month?: number,
  year?: number,
  period?:
    | "current-month"
    | "last-3-months"
    | "last-6-months"
    | "last-12-months"
    | "all",
  limit: number = 5
) {
  return useQuery({
    queryKey: ["most-sold-products", month, year, period, limit],
    queryFn: () => getMostSoldProducts(month, year, period, limit),
  });
}
