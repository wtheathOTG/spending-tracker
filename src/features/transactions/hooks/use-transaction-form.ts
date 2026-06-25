"use client";

import { useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type {
  Transaction,
  TransactionFormValues,
  TransactionType,
} from "@/features/transactions/types";
import { centsToInputValue } from "@/features/transactions/utils";
import type { Category } from "@/features/categories/types";

export function useTransactionForm(
  categories: Category[] | undefined,
  transaction?: Transaction | null,
) {
  const [values, setValues] = useState<TransactionFormValues>(() => ({
    type: transaction?.type ?? "expense",
    categoryId: transaction?.categoryId ?? null,
    groupId: transaction?.groupId ?? null,
    amount: transaction ? centsToInputValue(transaction.amountCents) : "",
    date: transaction ? new Date(transaction.date) : new Date(),
    note: transaction?.note ?? "",
  }));

  const categoryIdsByType = useMemo(() => {
    const map = new Map<TransactionType, Set<Id<"categories">>>();
    map.set("expense", new Set());
    map.set("income", new Set());

    for (const category of categories ?? []) {
      map.get(category.type)?.add(category._id);
    }

    return map;
  }, [categories]);

  function update<K extends keyof TransactionFormValues>(
    key: K,
    value: TransactionFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updateType(type: TransactionType) {
    setValues((current) => {
      const selectedIsValid =
        current.categoryId === null ||
        categoryIdsByType.get(type)?.has(current.categoryId);

      return {
        ...current,
        type,
        categoryId: selectedIsValid ? current.categoryId : null,
      };
    });
  }

  return {
    values,
    update,
    updateType,
  };
}
