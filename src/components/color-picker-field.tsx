"use client";

import { Shuffle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_COLOR = "#64748b";

function randomHexColor() {
  const hue = Math.random() * 360;
  const saturation = 0.72 + Math.random() * 0.28;
  const lightness = 0.58 + Math.random() * 0.2;

  return hslToHex(hue, saturation, lightness);
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = hue / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));
  const match = lightness - chroma / 2;
  let red = 0;
  let green = 0;
  let blue = 0;

  if (huePrime < 1) {
    red = chroma;
    green = x;
  } else if (huePrime < 2) {
    red = x;
    green = chroma;
  } else if (huePrime < 3) {
    green = chroma;
    blue = x;
  } else if (huePrime < 4) {
    green = x;
    blue = chroma;
  } else if (huePrime < 5) {
    red = x;
    blue = chroma;
  } else {
    red = chroma;
    blue = x;
  }

  return `#${[red, green, blue]
    .map((value) =>
      Math.round((value + match) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function ColorPickerField({
  id,
  label = "Color",
  value,
  onChange,
}: {
  id: string;
  label?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}) {
  const colorValue = value || DEFAULT_COLOR;

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          type="color"
          value={colorValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-12 p-1"
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Randomize color"
          onClick={() => onChange(randomHexColor())}
        >
          <Shuffle className="size-4" />
        </Button>
        <Input
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value || undefined)}
          placeholder="No color"
          pattern="^#[0-9a-fA-F]{6}$"
        />
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Clear color"
          onClick={() => onChange(undefined)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
