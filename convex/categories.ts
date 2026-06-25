import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const transactionType = v.union(v.literal("expense"), v.literal("income"));

const DEFAULT_CATEGORIES = {
  expense: ["Groceries", "Dining", "Clothing", "Recreational"],
  income: ["Work", "Gift", "Reimbursement"],
} as const;

function cleanName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function cleanColor(color: string | undefined) {
  const cleaned = color?.trim();

  if (!cleaned) return undefined;
  if (!/^#[0-9a-fA-F]{6}$/.test(cleaned)) {
    throw new Error("Color must be a valid hex color.");
  }

  return cleaned.toLowerCase();
}

function isReservedOther(name: string) {
  return name.localeCompare("Other", undefined, { sensitivity: "accent" }) === 0;
}

export const list = query({
  args: { type: v.optional(transactionType) },
  handler: async (ctx, args) => {
    const categories = args.type
      ? await ctx.db
          .query("categories")
          .withIndex("by_type", (q) => q.eq("type", args.type!))
          .collect()
      : await ctx.db.query("categories").collect();

    return categories.sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      return a.name.localeCompare(b.name);
    });
  },
});

export const ensureDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    let created = 0;
    const now = Date.now();

    for (const type of ["expense", "income"] as const) {
      for (const name of DEFAULT_CATEGORIES[type]) {
        const existing = await ctx.db
          .query("categories")
          .withIndex("by_type_name", (q) => q.eq("type", type).eq("name", name))
          .unique();

        if (!existing) {
          await ctx.db.insert("categories", {
            type,
            name,
            createdAt: now,
            updatedAt: now,
          });
          created += 1;
        }
      }
    }

    return { created };
  },
});

export const create = mutation({
  args: {
    type: transactionType,
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = cleanName(args.name);
    const color = cleanColor(args.color);

    if (!name) {
      throw new Error("Category name is required.");
    }

    if (isReservedOther(name)) {
      throw new Error("Other is permanent and is stored as a blank category.");
    }

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_type_name", (q) => q.eq("type", args.type).eq("name", name))
      .unique();

    if (existing) {
      throw new Error("A category with that name already exists.");
    }

    const now = Date.now();
    return await ctx.db.insert("categories", {
      type: args.type,
      name,
      color,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);

    if (!category) {
      throw new Error("Category does not exist.");
    }

    const name = cleanName(args.name);

    if (!name) {
      throw new Error("Category name is required.");
    }

    if (isReservedOther(name)) {
      throw new Error("Other is permanent and is stored as a blank category.");
    }

    const existing = await ctx.db
      .query("categories")
      .withIndex("by_type_name", (q) =>
        q.eq("type", category.type).eq("name", name),
      )
      .unique();

    if (existing && existing._id !== args.id) {
      throw new Error("A category with that name already exists.");
    }

    await ctx.db.patch(args.id, {
      name,
      color: cleanColor(args.color),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const category = await ctx.db.get(args.id);

    if (!category) {
      return { changedTransactions: 0 };
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_category_date", (q) => q.eq("categoryId", args.id))
      .collect();

    const now = Date.now();
    for (const transaction of transactions) {
      await ctx.db.patch(transaction._id, {
        categoryId: null,
        updatedAt: now,
      });
    }

    await ctx.db.delete(args.id);
    return { changedTransactions: transactions.length };
  },
});
