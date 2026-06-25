import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Income
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold text-income">
          {formatCurrencyFromCents(values.incomeCents)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold text-expense">
          {formatCurrencyFromCents(values.expenseCents)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net
          </CardTitle>
        </CardHeader>
        <CardContent
          className={
            values.netCents < 0
              ? "text-2xl font-semibold text-expense"
              : "text-2xl font-semibold text-income"
          }
        >
          {formatCurrencyFromCents(values.netCents)}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Count
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {values.count}
        </CardContent>
      </Card>
    </div>
  );
}
