import type { Id } from "@convex/_generated/dataModel";
import type { TransactionType } from "@/features/transactions/types";
import type { Category, CategoryOption } from "./types";

export const OTHER_CATEGORY_VALUE = "__other__";
export const ALL_CATEGORIES_VALUE = "__all__";

export function getOtherCategoryOption(type: TransactionType): CategoryOption {
  return {
    id: null,
    type,
    name: "Other",
    permanent: true,
  };
}

export function withOtherCategory(
  categories: Category[] | undefined,
  type: TransactionType,
) {
  const stored = (categories ?? [])
    .filter((category) => category.type === type)
    .map<CategoryOption>((category) => ({
      id: category._id,
      type: category.type,
      name: category.name,
      color: category.color,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...stored, getOtherCategoryOption(type)];
}

export function categoryIdToSelectValue(id: Id<"categories"> | null) {
  return id ?? OTHER_CATEGORY_VALUE;
}

export function selectValueToCategoryId(value: string) {
  return value === OTHER_CATEGORY_VALUE ? null : (value as Id<"categories">);
}
