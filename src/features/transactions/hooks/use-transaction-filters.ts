"use client";

import { useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import type {
  TransactionFilters,
  TransactionType,
} from "@/features/transactions/types";
import {
  toEndOfDayTimestamp,
  toStartOfDayTimestamp,
} from "@/features/transactions/utils";

export function useTransactionFilters() {
  const [type, setType] = useState<TransactionFilters["type"]>("all");
  const [categoryIds, setCategoryIds] =
    useState<TransactionFilters["categoryIds"]>("all");
  const [groupId, setGroupId] = useState<TransactionFilters["groupId"]>("all");
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const queryArgs = useMemo(
    () => ({
      ...(type !== "all" ? { type } : {}),
      ...(categoryIds !== "all" ? { categoryIds } : {}),
      ...(groupId !== "all"
        ? { groupId: groupId as Id<"groups"> | null }
        : {}),
      ...(fromDate ? { fromDate: toStartOfDayTimestamp(fromDate) } : {}),
      ...(toDate ? { toDate: toEndOfDayTimestamp(toDate) } : {}),
    }),
    [categoryIds, fromDate, groupId, toDate, type],
  );

  const cardQueryArgs = useMemo(
    () => ({
      ...(categoryIds !== "all" ? { categoryIds } : {}),
      ...(groupId !== "all"
        ? { groupId: groupId as Id<"groups"> | null }
        : {}),
      ...(fromDate ? { fromDate: toStartOfDayTimestamp(fromDate) } : {}),
      ...(toDate ? { toDate: toEndOfDayTimestamp(toDate) } : {}),
    }),
    [categoryIds, fromDate, groupId, toDate],
  );

  function setTypeFilter(nextType: TransactionType | "all") {
    setType(nextType);
  }

  function clearFilters() {
    setType("all");
    setCategoryIds("all");
    setGroupId("all");
    setFromDate(undefined);
    setToDate(undefined);
  }

  return {
    filters: { type, categoryIds, groupId, fromDate, toDate },
    queryArgs,
    cardQueryArgs,
    setTypeFilter,
    setCategoryIds,
    setGroupId,
    setFromDate,
    setToDate,
    clearFilters,
  };
}
