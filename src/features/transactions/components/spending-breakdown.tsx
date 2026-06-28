"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfigProvider,
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Transaction } from "../types";
import { formatCurrencyFromCents } from "../utils";

const fallbackColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type SpendingBreakdownItem = {
  category: string;
  amountCents: number;
  fill: string;
};

export function SpendingBreakdown({
  transactions,
}: {
  transactions?: Transaction[];
}) {
  const { chartData, chartConfig, totalSpendCents } = React.useMemo(() => {
    const expenseTotals = new Map<
      string,
      { amountCents: number; color?: string }
    >();

    for (const transaction of transactions ?? []) {
      if (transaction.type !== "expense") continue;

      const current = expenseTotals.get(transaction.categoryName) ?? {
        amountCents: 0,
        color: transaction.categoryColor,
      };

      expenseTotals.set(transaction.categoryName, {
        amountCents: current.amountCents + transaction.amountCents,
        color: current.color ?? transaction.categoryColor,
      });
    }

    const data: SpendingBreakdownItem[] = [...expenseTotals.entries()]
      .map(([category, value], index) => ({
        category,
        amountCents: value.amountCents,
        fill: value.color ?? fallbackColors[index % fallbackColors.length],
      }))
      .sort((a, b) => b.amountCents - a.amountCents);

    const config = data.reduce<ChartConfig>(
      (acc, item) => {
        acc[item.category] = {
          label: item.category,
          color: item.fill,
        };
        return acc;
      },
      {
        amountCents: {
          label: "Spend",
        },
      },
    );

    return {
      chartData: data,
      chartConfig: config,
      totalSpendCents: data.reduce(
        (total, item) => total + item.amountCents,
        0,
      ),
    };
  }, [transactions]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="-mb-4">
        <CardTitle>Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        {chartData.length > 0 ? (
          <div className="grid min-w-0">
            <ChartContainer
              config={chartConfig}
              className="mx-auto h-52 w-full max-w-56 sm:h-56"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      valueFormatter={(value) =>
                        formatCurrencyFromCents(Number(value))
                      }
                    />
                  }
                />
                <Pie
                  data={chartData}
                  dataKey="amountCents"
                  nameKey="category"
                  innerRadius={55}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-lg font-semibold"
                            >
                              {formatCurrencyFromCents(totalSpendCents)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Spend
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <ChartConfigProvider config={chartConfig}>
              <ChartLegendContent
                payload={chartData.map((item) => ({
                  value: item.category,
                  color: item.fill,
                  payload: item,
                }))}
                nameKey="category"
                className="min-w-0 flex-wrap gap-x-3 gap-y-2"
              />
            </ChartConfigProvider>
          </div>
        ) : (
          <div className="flex aspect-square max-h-56 items-center justify-center rounded-md border border-dashed text-center text-sm text-muted-foreground">
            No spending in this view.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
