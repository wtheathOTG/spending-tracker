"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/features/categories/types";
import {
  categoryIdToSelectValue,
  selectValueToCategoryId,
  withOtherCategory,
} from "@/features/categories/utils";
import type { Group } from "@/features/groups/types";
import {
  groupIdToSelectValue,
  selectValueToGroupId,
  withNoGroup,
} from "@/features/groups/utils";
import { useTransactionForm } from "../hooks/use-transaction-form";
import type {
  Transaction,
  TransactionFormValues,
  TransactionType,
} from "../types";
import { parseCurrencyToCents, toStartOfDayTimestamp } from "../utils";
import { DatePickerButton } from "./date-picker-button";

export type TransactionSubmitValues = {
  type: TransactionType;
  categoryId: Id<"categories"> | null;
  groupId: Id<"groups"> | null;
  amountCents: number;
  date: number;
  note?: string;
};

function buildSubmitValues(values: TransactionFormValues) {
  const amountCents = parseCurrencyToCents(values.amount);

  if (!amountCents) {
    return { error: "Enter a valid amount greater than zero." } as const;
  }

  return {
    value: {
      type: values.type,
      categoryId: values.categoryId,
      groupId: values.groupId,
      amountCents,
      date: toStartOfDayTimestamp(values.date),
      note: values.note.trim() || undefined,
    },
  } as const;
}

export function TransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
  categories,
  groups,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: Transaction | null;
  categories?: Category[];
  groups?: Group[];
  onSubmit: (values: TransactionSubmitValues) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const { values, update, updateType } = useTransactionForm(
    categories,
    transaction,
  );
  const categoryOptions = withOtherCategory(categories, values.type);
  const groupOptions = withNoGroup(groups);
  const mode = transaction ? "edit" : "create";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = buildSubmitValues(values);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    await onSubmit(result.value);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add transaction" : "Transaction details"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Log an expense or income entry."
              : "Review and update this payment entry."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="transaction-type">Type</Label>
              <Select
                value={values.type}
                onValueChange={(value) => updateType(value as TransactionType)}
              >
                <SelectTrigger id="transaction-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="transaction-category">Category</Label>
              <Select
                value={categoryIdToSelectValue(values.categoryId)}
                onValueChange={(value) =>
                  update("categoryId", selectValueToCategoryId(value))
                }
              >
                <SelectTrigger id="transaction-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem
                      key={category.id ?? "other"}
                      value={categoryIdToSelectValue(category.id)}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transaction-group">Group</Label>
            <Select
              value={groupIdToSelectValue(values.groupId)}
              onValueChange={(value) =>
                update("groupId", selectValueToGroupId(value))
              }
            >
              <SelectTrigger id="transaction-group">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="transaction-amount">Amount</Label>
              <Input
                id="transaction-amount"
                inputMode="decimal"
                placeholder="0.00"
                value={values.amount}
                onChange={(event) => update("amount", event.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <DatePickerButton
                date={values.date}
                onChange={(date) => {
                  if (date) update("date", date);
                }}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="transaction-note">Note</Label>
            <Textarea
              id="transaction-note"
              placeholder="Optional details"
              value={values.note}
              onChange={(event) => update("note", event.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            {mode === "edit" && onDelete ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the transaction permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        void onDelete();
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <span />
            )}

            <Button type="submit">
              {mode === "create" ? "Add transaction" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
