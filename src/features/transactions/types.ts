import type { Id } from "@convex/_generated/dataModel";

export const TRANSACTION_TYPES = ["expense", "income"] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export type Transaction = {
  _id: Id<"transactions">;
  type: TransactionType;
  categoryId: Id<"categories"> | null;
  categoryName: string;
  categoryColor?: string;
  groupId: Id<"groups"> | null;
  groupName: string;
  groupColor?: string;
  amountCents: number;
  date: number;
  note?: string;
  createdAt: number;
  updatedAt: number;
};

export type TransactionFilters = {
  type: TransactionType | "all";
  categoryIds: Id<"categories">[] | "all";
  groupId: Id<"groups"> | null | "all";
  fromDate?: number;
  toDate?: number;
};

export type TransactionFormValues = {
  type: TransactionType;
  categoryId: Id<"categories"> | null;
  groupId: Id<"groups"> | null;
  amount: string;
  date: Date;
  note: string;
};
