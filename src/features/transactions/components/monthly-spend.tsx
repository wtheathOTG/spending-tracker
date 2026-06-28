"use client";

import * as React from "react";
import {
  addMonths,
  differenceInCalendarMonths,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { Transaction } from "../types";
import { formatCurrencyFromCents } from "../utils";

type MonthlySpendItem = {
  month: string;
  label: string;
  totalCents: number;
  topCategoryKey: string;
  [categoryKey: string]: string | number;
};

type MonthlySpendCategory = {
  key: string;
  name: string;
  color: string;
};

const fallbackColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function getCategoryKey(categoryName: string) {
  return `category-${categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function getMonthRange(transactions: Transaction[]) {
  const expenseDates = transactions
    .filter((transaction) => transaction.type === "expense")
    .map((transaction) => transaction.date);
  const now = new Date();
  const latestDate = expenseDates.length
    ? new Date(Math.max(...expenseDates))
    : now;
  const earliestDate = expenseDates.length
    ? new Date(Math.min(...expenseDates))
    : now;
  const latestMonth = startOfMonth(latestDate);
  const earliestMonth = startOfMonth(earliestDate);
  const dataMonthCount =
    differenceInCalendarMonths(latestMonth, earliestMonth) + 1;
  const visibleMonthCount = Math.min(6, Math.max(3, dataMonthCount));
  const startMonth = addMonths(latestMonth, -(visibleMonthCount - 1));

  return Array.from({ length: visibleMonthCount }, (_, index) => {
    const date = addMonths(startMonth, index);

    return {
      start: startOfMonth(date).getTime(),
      end: endOfMonth(date).getTime(),
      month: format(date, "MMM"),
      label: format(date, "MMM yyyy"),
    };
  });
}

export function MonthlySpend({
  transactions,
}: {
  transactions?: Transaction[];
}) {
  const { chartData, chartConfig, categories } = React.useMemo(() => {
    const transactionList = transactions ?? [];
    const expenseTransactions = transactionList.filter(
      (transaction) => transaction.type === "expense",
    );
    const categoryMap = new Map<string, MonthlySpendCategory>();

    for (const transaction of expenseTransactions) {
      if (categoryMap.has(transaction.categoryName)) continue;

      categoryMap.set(transaction.categoryName, {
        key: getCategoryKey(transaction.categoryName),
        name: transaction.categoryName,
        color:
          transaction.categoryColor ??
          fallbackColors[categoryMap.size % fallbackColors.length],
      });
    }

    const categoryList = [...categoryMap.values()];
    const config = categoryList.reduce<ChartConfig>((acc, category) => {
      acc[category.key] = {
        label: category.name,
        color: category.color,
      };
      return acc;
    }, {});

    const data = getMonthRange(transactionList).map<MonthlySpendItem>(
      (month) => {
        const item: MonthlySpendItem = {
          month: month.month,
          label: month.label,
          totalCents: 0,
          topCategoryKey: "",
        };

        for (const category of categoryList) {
          item[category.key] = 0;
        }

        for (const transaction of expenseTransactions) {
          if (transaction.date < month.start || transaction.date > month.end) {
            continue;
          }

          const category = categoryMap.get(transaction.categoryName);
          if (!category) continue;

          item[category.key] =
            Number(item[category.key] ?? 0) + transaction.amountCents;
          item.totalCents += transaction.amountCents;
        }

        const topCategory = categoryList.findLast(
          (category) => Number(item[category.key]) > 0,
        );
        item.topCategoryKey = topCategory?.key ?? "";

        return item;
      },
    );

    return {
      chartData: data,
      chartConfig: config,
      categories: categoryList,
    };
  }, [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spend</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full min-w-0">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 4,
              left: 4,
            }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
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
            {categories.map((category) => (
              <Bar
                key={category.key}
                dataKey={category.key}
                stackId="spend"
                fill={`var(--color-${category.key})`}
              >
                <LabelList
                  position="top"
                  offset={6}
                  fill="var(--foreground)"
                  fontSize={10}
                  fontWeight={500}
                  valueAccessor={(entry) => {
                    const payload = entry.payload as MonthlySpendItem;

                    if (payload?.topCategoryKey !== category.key) return "";
                    if (payload.totalCents <= 0) return "";

                    return `$${Math.round(payload.totalCents / 100).toLocaleString()}`;
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
