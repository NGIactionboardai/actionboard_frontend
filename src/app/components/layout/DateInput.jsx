"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar"; // shadcn calendar (react-day-picker)
import { cn } from "@/lib/utils";

function formatDateInput(value) {
    const digits = value.replace(/\D/g, "");
  
    if (digits.length < 2) {
      return digits; // typing day (dd)
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}` + (digits.length === 4 ? "/" : "");
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

export default function DateInput({ value, onChange, error, disabled }) {
  const [open, setOpen] = React.useState(false);

  const parseToDate = (val) => {
    const [d, m, y] = val.split("/").map(Number);
    if (!d || !m || !y) return null;
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleSelectDate = (date) => {
    if (!date) return;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    onChange(`${day}/${month}/${year}`);
    setOpen(false);
  };

  return (
    <div>
      <label
        htmlFor="dateOfBirth"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Date of Birth *
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="dateOfBirth"
              type="text"
              placeholder="dd/mm/yyyy"
              value={value}
              onChange={(e) => onChange(formatDateInput(e.target.value))}
              disabled={disabled}
              maxLength={10}
              className={cn(
                "w-full pl-11 pr-4 py-3 text-sm border-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                error
                  ? "border-red-300 bg-red-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            />
          </div>
        </PopoverTrigger>

        <PopoverContent className="p-3 w-auto rounded-2xl shadow-lg border bg-white">
          <Calendar
            mode="single"
            selected={parseToDate(value)}
            onSelect={handleSelectDate}
            disabled={(date) => date > new Date()}
            captionLayout="dropdown-years" // <-- enables month + year dropdowns
            fromYear={1900}           // <-- min year
            toYear={new Date().getFullYear()} // <-- max year
            className="rounded-xl"
            classNames={{
              months: "flex flex-col space-y-4",
              month: "space-y-4",
              caption: "flex justify-between items-center text-gray-700 font-medium px-2",
              caption_dropdowns: "flex gap-2 items-center",
            //   dropdown: "px-2 py-1 border rounded-md text-sm focus:ring-indigo-500",
              nav: "flex items-center space-x-1",
              nav_button:
                "h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors",
              table: "w-full border-collapse",
              head_row: "flex justify-between mb-2 text-sm text-gray-500 font-medium",
              head_cell: "w-9 text-center",
              row: "flex justify-between mb-1",
              cell: "h-9 w-9 text-center relative",
              day: "h-9 w-9 flex items-center justify-center rounded-full text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer",
              day_selected: "bg-indigo-600 text-white hover:bg-indigo-700",
              day_today: "border border-indigo-500 font-semibold",
              day_outside: "text-gray-300 cursor-not-allowed",
              day_disabled: "text-gray-300 opacity-50 cursor-not-allowed",
            }}
          />
        </PopoverContent>
      </Popover>

      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}
