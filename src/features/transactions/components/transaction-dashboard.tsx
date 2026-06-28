"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategoryManager } from "@/features/categories/components/category-manager";
import { GroupManager } from "@/features/groups/components/group-manager";
import { useGroups } from "@/features/groups/hooks/use-groups";
import {
  useCategories,
  useCategoryMutations,
} from "@/features/categories/hooks/use-categories";
import { TransactionFilters } from "./transaction-filters";
import { MonthlySpend } from "./monthly-spend";
import { SpendingBreakdown } from "./spending-breakdown";
import { TransactionSummary } from "./transaction-summary";
import { TransactionTable } from "./transaction-table";
import {
  TransactionDetailDialog,
  type TransactionSubmitValues,
} from "./transaction-detail-dialog";
import { useTransactionFilters } from "../hooks/use-transaction-filters";
import type { Transaction } from "../types";

export function TransactionDashboard() {
  const categories = useCategories();
  const { ensureDefaults } = useCategoryMutations();
  const {
    filters,
    queryArgs,
    cardQueryArgs,
    setTypeFilter,
    setCategoryIds,
    setGroupId,
    setFromDate,
    setToDate,
    clearFilters,
  } = useTransactionFilters();
  const groups = useGroups();
  const transactions = useQuery(api.transactions.list, queryArgs);
  const cardTransactions = useQuery(api.transactions.list, cardQueryArgs);
  const summary = useQuery(api.transactions.summary, cardQueryArgs);
  const createTransaction = useMutation(api.transactions.create);
  const updateTransaction = useMutation(api.transactions.update);
  const removeTransaction = useMutation(api.transactions.remove);
  const defaultsRequested = useRef(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  useEffect(() => {
    if (!defaultsRequested.current && categories && categories.length === 0) {
      defaultsRequested.current = true;
      void ensureDefaults().catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not initialize categories",
        );
      });
    }
  }, [categories, ensureDefaults]);

  async function handleCreate(values: TransactionSubmitValues) {
    try {
      await createTransaction(values);
      setIsCreateOpen(false);
      toast.success("Transaction added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Create failed");
    }
  }

  async function handleUpdate(values: TransactionSubmitValues) {
    if (!selectedTransaction) return;

    try {
      await updateTransaction({
        id: selectedTransaction._id,
        ...values,
      });
      setSelectedTransaction(null);
      toast.success("Transaction updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  }

  async function handleDelete(transaction: Transaction) {
    try {
      await removeTransaction({ id: transaction._id });
      setTransactionToDelete(null);
      setSelectedTransaction((current) =>
        current?._id === transaction._id ? null : current,
      );
      toast.success("Transaction deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    }
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6 px-3 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 text-xl font-semibold sm:text-3xl">
            Spending Tracker
          </h1>
          <div className="flex shrink-0 flex-nowrap items-center gap-2 overflow-x-auto">
            <ThemeToggle />
            <GroupManager />
            <CategoryManager />
            <Button size="icon" onClick={() => setIsCreateOpen(true)}>
              <Plus className="size-4" />
            </Button>
          </div>
        </header>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="flex min-w-0 flex-col gap-4">
            <TransactionSummary summary={summary} />
            <SpendingBreakdown transactions={cardTransactions} />
            <MonthlySpend transactions={cardTransactions} />
          </aside>

          <div className="flex min-w-0 flex-col gap-4">
            <TransactionFilters
              filters={filters}
              categories={categories}
              groups={groups}
              onTypeChange={setTypeFilter}
              onCategoryChange={setCategoryIds}
              onGroupChange={(id) =>
                setGroupId(id as Id<"groups"> | null | "all")
              }
              onFromDateChange={setFromDate}
              onToDateChange={setToDate}
              onClear={clearFilters}
            />

            <TransactionTable
              transactions={transactions}
              onOpen={setSelectedTransaction}
              onDelete={setTransactionToDelete}
            />
          </div>
        </div>
      </div>

      {isCreateOpen ? (
        <TransactionDetailDialog
          key="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          categories={categories}
          groups={groups}
          onSubmit={handleCreate}
        />
      ) : null}

      {selectedTransaction ? (
        <TransactionDetailDialog
          key={selectedTransaction._id}
          open={Boolean(selectedTransaction)}
          onOpenChange={(open) => {
            if (!open) setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          categories={categories}
          groups={groups}
          onSubmit={handleUpdate}
          onDelete={() => handleDelete(selectedTransaction)}
        />
      ) : null}

      <AlertDialog
        open={Boolean(transactionToDelete)}
        onOpenChange={(open) => {
          if (!open) setTransactionToDelete(null);
        }}
      >
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
                if (transactionToDelete) {
                  void handleDelete(transactionToDelete);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
