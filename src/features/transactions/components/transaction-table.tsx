"use client";

import { MoreHorizontal } from "lucide-react";
import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Transaction } from "../types";
import { formatCurrencyFromCents, formatTransactionDate } from "../utils";

function getBadgeStyle(color?: string): CSSProperties | undefined {
  if (!color) return undefined;

  return {
    backgroundColor: `${color}25`,
    borderColor: `${color}10`,
    color,
  };
}

export function TransactionTable({
  transactions,
  onOpen,
  onDelete,
}: {
  transactions?: Transaction[];
  onOpen: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  if (transactions === undefined) {
    return (
      <div className="rounded-md border p-6 text-sm text-muted-foreground">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-28 text-center text-muted-foreground"
              >
                No transactions match the current view.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow
                key={transaction._id}
                className="cursor-pointer"
                onClick={() => onOpen(transaction)}
              >
                <TableCell
                  className={
                    transaction.type === "income"
                      ? "font-medium text-income"
                      : "font-medium text-expense"
                  }
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrencyFromCents(transaction.amountCents)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={getBadgeStyle(transaction.categoryColor)}
                  >
                    {transaction.categoryName}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={getBadgeStyle(transaction.groupColor)}
                  >
                    {transaction.groupName}
                  </Badge>
                </TableCell>
                <TableCell>{formatTransactionDate(transaction.date)}</TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {transaction.note || "-"}
                </TableCell>
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label="Actions">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onOpen(transaction)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(transaction)}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
