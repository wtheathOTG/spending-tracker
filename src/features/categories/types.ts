import type { Id } from "@convex/_generated/dataModel";
import type { TransactionType } from "@/features/transactions/types";

export type Category = {
  _id: Id<"categories">;
  name: string;
  color?: string;
  type: TransactionType;
  createdAt: number;
  updatedAt: number;
};

export type CategoryOption = {
  id: Id<"categories"> | null;
  type: TransactionType;
  name: string;
  color?: string;
  permanent?: boolean;
};
