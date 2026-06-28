import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrencyFromCents } from "../utils";

type Summary = {
  incomeCents: number;
  expenseCents: number;
  netCents: number;
  count: number;
};

export function TransactionSummary({ summary }: { summary?: Summary }) {
  const values = summary ?? {
    incomeCents: 0,
    expenseCents: 0,
    netCents: 0,
    count: 0,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Totals</CardTitle>
        <CardAction className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{values.count}</span>{" "}
          Transactions
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid">
          <div className="text-sm font-medium text-muted-foreground">Net</div>
          <div
            className={
              values.netCents < 0
                ? "text-4xl font-semibold tracking-normal text-expense"
                : "text-4xl font-semibold tracking-normal text-income"
            }
          >
            {formatCurrencyFromCents(values.netCents)}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid">
            <div className="text-xs font-medium text-muted-foreground">
              Income
            </div>
            <div className="text-sm font-semibold text-income">
              {formatCurrencyFromCents(values.incomeCents)}
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-xs font-medium text-muted-foreground">
              Expenses
            </div>
            <div className="text-sm font-semibold text-expense">
              {formatCurrencyFromCents(values.expenseCents)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
