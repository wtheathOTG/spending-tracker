import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    type: v.union(v.literal("expense"), v.literal("income")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_type_name", ["type", "name"]),

  groups: defineTable({
    name: v.string(),
    color: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_name", ["name"]),

  transactions: defineTable({
    type: v.union(v.literal("expense"), v.literal("income")),
    categoryId: v.union(v.id("categories"), v.null()),
    groupId: v.union(v.id("groups"), v.null()),
    amountCents: v.number(),
    date: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_type_date", ["type", "date"])
    .index("by_category_date", ["categoryId", "date"])
    .index("by_group_date", ["groupId", "date"]),
});
