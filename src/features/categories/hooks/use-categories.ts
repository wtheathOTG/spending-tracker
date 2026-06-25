"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { TransactionType } from "@/features/transactions/types";

export function useCategories(type?: TransactionType) {
  return useQuery(api.categories.list, type ? { type } : {});
}

export function useCategoryMutations() {
  return {
    ensureDefaults: useMutation(api.categories.ensureDefaults),
    createCategory: useMutation(api.categories.create),
    updateCategory: useMutation(api.categories.update),
    removeCategory: useMutation(api.categories.remove),
  };
}
