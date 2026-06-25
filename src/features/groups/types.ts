import type { Id } from "@convex/_generated/dataModel";

export type Group = {
  _id: Id<"groups">;
  name: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
};

export type GroupOption = {
  id: Id<"groups"> | null;
  name: string;
  color?: string;
};
