"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-hidden [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, itemConfig]) => itemConfig.color,
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
[data-chart=${id}] {
${colorConfig
  .map(
    ([key, itemConfig]) =>
      `  --color-${key.replace(/[^a-zA-Z0-9_-]/g, "-")}: ${itemConfig.color};`,
  )
  .join("\n")}
}
`,
      }}
    />
  );
}

function ChartConfigProvider({
  children,
  config,
}: {
  children: React.ReactNode;
  config: ChartConfig;
}) {
  return (
    <ChartContext.Provider value={{ config }}>{children}</ChartContext.Provider>
  );
}

function ChartTooltip({
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip>) {
  return <RechartsPrimitive.Tooltip {...props} />;
}

function ChartTooltipContent({
  active,
  payload,
  className,
  hideLabel = false,
  valueFormatter,
}: React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: Array<{
    name?: string;
    dataKey?: string | number;
    value?: number | string;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  hideLabel?: boolean;
  valueFormatter?: (value: number | string) => React.ReactNode;
}) {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  const items = payload.filter((item) => Number(item.value ?? 0) > 0);

  if (!items.length) return null;

  return (
    <div
      className={cn(
        "grid min-w-32 gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!hideLabel ? (
        <div className="font-medium">{String(items[0].name ?? "")}</div>
      ) : null}
      {items.map((item) => {
        const dataKey = String(item.dataKey ?? item.name ?? "");
        const name = String(item.name ?? "");
        const label = config[name]?.label ?? config[dataKey]?.label ?? name;
        const value = item.value;
        const formattedValue =
          valueFormatter?.(value ?? "") ??
          (typeof value === "number" ? value.toLocaleString() : value);

        return (
          <div key={dataKey || name} className="flex items-center gap-2">
            <div
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate text-muted-foreground">{label}</span>
              <span className="font-mono font-medium tabular-nums">
                {formattedValue}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChartLegend({
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.Legend>) {
  return <RechartsPrimitive.Legend {...props} />;
}

function ChartLegendContent({
  className,
  payload,
  nameKey,
}: React.ComponentProps<"div"> & {
  payload?: Array<{
    value?: string;
    color?: string;
    payload?: Record<string, unknown>;
  }>;
  nameKey?: string;
}) {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {payload.map((item) => {
        const key = String(
          nameKey && item.payload?.[nameKey] ? item.payload[nameKey] : item.value,
        );
        const label = config[key]?.label ?? key;

        return (
          <div
            key={key}
            className="flex min-w-24 items-center gap-1.5 text-xs text-muted-foreground"
          >
            <div
              className="size-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export {
  ChartConfigProvider,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
};
