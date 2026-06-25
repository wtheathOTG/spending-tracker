"use client";

import type { Id } from "@convex/_generated/dataModel";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/features/categories/types";
import type { Group } from "@/features/groups/types";
import {
  ALL_GROUPS_VALUE,
  groupIdToSelectValue,
  selectValueToGroupId,
  withNoGroup,
} from "@/features/groups/utils";
import type { TransactionFilters as Filters } from "../types";
import { DatePickerButton } from "./date-picker-button";

export function TransactionFilters({
  filters,
  categories,
  groups,
  onTypeChange,
  onCategoryChange,
  onGroupChange,
  onFromDateChange,
  onToDateChange,
  onClear,
}: {
  filters: {
    type: Filters["type"];
    categoryIds: Filters["categoryIds"];
    groupId: Filters["groupId"];
    fromDate?: Date;
    toDate?: Date;
  };
  categories?: Category[];
  groups?: Group[];
  onTypeChange: (type: Filters["type"]) => void;
  onCategoryChange: (ids: Id<"categories">[] | "all") => void;
  onGroupChange: (id: Id<"groups"> | null | "all") => void;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onClear: () => void;
}) {
  const storedCategoryOptions = [...(categories ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const expenseCategoryOptions = storedCategoryOptions.filter(
    (category) => category.type === "expense",
  );
  const incomeCategoryOptions = storedCategoryOptions.filter(
    (category) => category.type === "income",
  );
  const allCategoryIds = storedCategoryOptions.map((category) => category._id);
  const selectedCategoryIds =
    filters.categoryIds === "all" ? [] : filters.categoryIds;
  const selectedCategorySet = new Set(selectedCategoryIds);
  const allStoredCategoriesSelected =
    allCategoryIds.length > 0 &&
    allCategoryIds.every((id) => selectedCategorySet.has(id));
  const groupOptions = withNoGroup(groups);

  function toggleCategory(id: Id<"categories">, checked: boolean) {
    const next = checked
      ? [...selectedCategorySet, id]
      : selectedCategoryIds.filter((categoryId) => categoryId !== id);

    onCategoryChange(next);
  }

  function getCategoryLabel() {
    if (filters.categoryIds === "all") return "All Categories";
    if (selectedCategoryIds.length === 0) return "No categories";
    if (selectedCategoryIds.length === 1) {
      return (
        storedCategoryOptions.find(
          (category) => category._id === selectedCategoryIds[0],
        )?.name ?? "1 category"
      );
    }
    return `${selectedCategoryIds.length} categories`;
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <Tabs
        value={filters.type}
        onValueChange={(value) => onTypeChange(value as Filters["type"])}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="expense">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between font-normal lg:w-52"
          >
            <span className="truncate">{getCategoryLabel()}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="lg:w-52">
          <DropdownMenuItem onSelect={() => onCategoryChange("all")}>
            All Categories
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Expenses</DropdownMenuLabel>
          {expenseCategoryOptions.map((category) => (
            <DropdownMenuCheckboxItem
              key={category._id}
              checked={selectedCategorySet.has(category._id)}
              onCheckedChange={(checked) =>
                toggleCategory(category._id, checked === true)
              }
              onSelect={(event) => event.preventDefault()}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuLabel>Income</DropdownMenuLabel>
          {incomeCategoryOptions.map((category) => (
            <DropdownMenuCheckboxItem
              key={category._id}
              checked={selectedCategorySet.has(category._id)}
              onCheckedChange={(checked) =>
                toggleCategory(category._id, checked === true)
              }
              onSelect={(event) => event.preventDefault()}
            >
              {category.name}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={allStoredCategoriesSelected}
            disabled={allCategoryIds.length === 0}
            onCheckedChange={(checked) =>
              onCategoryChange(checked === true ? allCategoryIds : [])
            }
            onSelect={(event) => event.preventDefault()}
          >
            Select all
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Select
        value={
          filters.groupId === "all"
            ? ALL_GROUPS_VALUE
            : groupIdToSelectValue(filters.groupId)
        }
        onValueChange={(value) =>
          onGroupChange(
            value === ALL_GROUPS_VALUE ? "all" : selectValueToGroupId(value),
          )
        }
      >
        <SelectTrigger className="w-full lg:w-52">
          <SelectValue placeholder="Group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_GROUPS_VALUE}>All groups</SelectItem>
          {groupOptions.map((group) => (
            <SelectItem
              key={group.id ?? "no-group"}
              value={groupIdToSelectValue(group.id)}
            >
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid gap-2 sm:grid-cols-2 lg:flex">
        <DatePickerButton
          date={filters.fromDate}
          label="From"
          onChange={onFromDateChange}
        />
        <DatePickerButton
          date={filters.toDate}
          label="To"
          onChange={onToDateChange}
        />
      </div>

      <Button variant="ghost" className="lg:ml-auto" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
