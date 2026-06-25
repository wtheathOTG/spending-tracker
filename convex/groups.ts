import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

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

async function findByName(ctx: QueryCtx | MutationCtx, name: string) {
  return await ctx.db
    .query("groups")
    .withIndex("by_name", (q) => q.eq("name", name))
    .unique();
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("groups").collect();
    return groups.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = cleanName(args.name);
    const color = cleanColor(args.color);

    if (!name) {
      throw new Error("Group name is required.");
    }

    const existing = await findByName(ctx, name);
    if (existing) {
      throw new Error("A group with that name already exists.");
    }

    const now = Date.now();
    return await ctx.db.insert("groups", {
      name,
      color,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("groups"),
    name: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (!group) {
      throw new Error("Group does not exist.");
    }

    const name = cleanName(args.name);
    if (!name) {
      throw new Error("Group name is required.");
    }

    const existing = await findByName(ctx, name);
    if (existing && existing._id !== args.id) {
      throw new Error("A group with that name already exists.");
    }

    await ctx.db.patch(args.id, {
      name,
      color: cleanColor(args.color),
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (!group) {
      return { changedTransactions: 0 };
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_group_date", (q) => q.eq("groupId", args.id))
      .collect();

    const now = Date.now();
    for (const transaction of transactions) {
      await ctx.db.patch(transaction._id, {
        groupId: null,
        updatedAt: now,
      });
    }

    await ctx.db.delete(args.id);
    return { changedTransactions: transactions.length };
  },
});
