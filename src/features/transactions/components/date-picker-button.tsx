"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateButton } from "../utils";

export function DatePickerButton({
  date,
  onChange,
  label = "Pick a date",
}: {
  date?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="min-w-0 justify-start font-normal"
        >
          <CalendarIcon className="size-4" />
          <span className="truncate">{date ? formatDateButton(date) : label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
