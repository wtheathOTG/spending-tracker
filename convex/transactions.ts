import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const transactionType = v.union(v.literal("expense"), v.literal("income"));
const categoryId = v.union(v.id("categories"), v.null());
const groupId = v.union(v.id("groups"), v.null());

async function validateCategory(
  ctx: MutationCtx,
  type: "expense" | "income",
  id: Id<"categories"> | null,
) {
  if (id === null) return;

  const category = await ctx.db.get(id);
  if (!category) {
    throw new Error("Category does not exist.");
  }

  if (category.type !== type) {
    throw new Error("Category does not match the transaction type.");
  }
}

async function validateGroup(ctx: MutationCtx, id: Id<"groups"> | null) {
  if (id === null) return;

  const group = await ctx.db.get(id);
  if (!group) {
    throw new Error("Group does not exist.");
  }
}

function validateAmount(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Amount must be a positive number of cents.");
  }
}

function normalizeNote(note: string | undefined) {
  const cleaned = note?.trim();
  return cleaned ? cleaned : undefined;
}

async function withCategoryName(
  ctx: QueryCtx,
  transaction: {
    _id: Id<"transactions">;
    _creationTime: number;
    type: "expense" | "income";
    categoryId: Id<"categories"> | null;
    groupId: Id<"groups"> | null;
    amountCents: number;
    date: number;
    note?: string;
    createdAt: number;
    updatedAt: number;
  },
) {
  const category = transaction.categoryId
    ? await ctx.db.get(transaction.categoryId)
    : null;
  const group = transaction.groupId
    ? await ctx.db.get(transaction.groupId)
    : null;

  return {
    ...transaction,
    categoryName: category?.name ?? "Other",
    categoryColor: category?.color,
    groupName: group?.name ?? "No group",
    groupColor: group?.color,
  };
}

export const list = query({
  args: {
    type: v.optional(transactionType),
    categoryId: v.optional(categoryId),
    categoryIds: v.optional(v.array(v.id("categories"))),
    groupId: v.optional(groupId),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db.query("transactions").collect();

    const filtered = transactions
      .filter((transaction) => {
        if (args.type && transaction.type !== args.type) return false;
        if ("categoryId" in args && transaction.categoryId !== args.categoryId) {
          return false;
        }
        if (
          args.categoryIds &&
          (!transaction.categoryId ||
            !args.categoryIds.includes(transaction.categoryId))
        ) {
          return false;
        }
        if ("groupId" in args && transaction.groupId !== args.groupId) {
          return false;
        }
        if (args.fromDate !== undefined && transaction.date < args.fromDate) {
          return false;
        }
        if (args.toDate !== undefined && transaction.date > args.toDate) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.date - a.date || b.createdAt - a.createdAt);

    return await Promise.all(
      filtered.map((transaction) => withCategoryName(ctx, transaction)),
    );
  },
});

export const summary = query({
  args: {
    type: v.optional(transactionType),
    categoryId: v.optional(categoryId),
    categoryIds: v.optional(v.array(v.id("categories"))),
    groupId: v.optional(groupId),
    fromDate: v.optional(v.number()),
    toDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db.query("transactions").collect();
    const filtered = transactions.filter((transaction) => {
      if (args.type && transaction.type !== args.type) return false;
      if ("categoryId" in args && transaction.categoryId !== args.categoryId) {
        return false;
      }
      if (
        args.categoryIds &&
        (!transaction.categoryId ||
          !args.categoryIds.includes(transaction.categoryId))
      ) {
        return false;
      }
      if ("groupId" in args && transaction.groupId !== args.groupId) {
        return false;
      }
      if (args.fromDate !== undefined && transaction.date < args.fromDate) {
        return false;
      }
      if (args.toDate !== undefined && transaction.date > args.toDate) {
        return false;
      }
      return true;
    });

    const incomeCents = filtered
      .filter((transaction) => transaction.type === "income")
      .reduce((total, transaction) => total + transaction.amountCents, 0);
    const expenseCents = filtered
      .filter((transaction) => transaction.type === "expense")
      .reduce((total, transaction) => total + transaction.amountCents, 0);

    return {
      incomeCents,
      expenseCents,
      netCents: incomeCents - expenseCents,
      count: filtered.length,
    };
  },
});

export const create = mutation({
  args: {
    type: transactionType,
    categoryId,
    groupId,
    amountCents: v.number(),
    date: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    validateAmount(args.amountCents);
    await validateCategory(ctx, args.type, args.categoryId);
    await validateGroup(ctx, args.groupId);

    const now = Date.now();
    return await ctx.db.insert("transactions", {
      type: args.type,
      categoryId: args.categoryId,
      groupId: args.groupId,
      amountCents: args.amountCents,
      date: args.date,
      note: normalizeNote(args.note),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transactions"),
    type: transactionType,
    categoryId,
    groupId,
    amountCents: v.number(),
    date: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      throw new Error("Transaction does not exist.");
    }

    validateAmount(args.amountCents);
    await validateCategory(ctx, args.type, args.categoryId);
    await validateGroup(ctx, args.groupId);

    await ctx.db.patch(args.id, {
      type: args.type,
      categoryId: args.categoryId,
      groupId: args.groupId,
      amountCents: args.amountCents,
      date: args.date,
      note: normalizeNote(args.note),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
