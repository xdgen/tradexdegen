import * as React from "react";
import { DayPicker } from "react-day-picker";

import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center mb-4",
        caption_label: "text-base font-semibold text-white",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-gray-800/80 hover:bg-gray-700/80 p-0 text-white border-gray-600 hover:border-gray-500 rounded-md flex items-center justify-center"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-0 mb-2",
        head_cell:
          "text-white/70 w-9 h-9 font-normal text-[0.8rem] flex items-center justify-center",
        row: "grid grid-cols-7 gap-0",
        cell: "h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-white/10 rounded-md transition-colors flex items-center justify-center"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black font-medium rounded-md",
        day_today: "bg-white/20 text-white border border-white/30 rounded-md",
        day_outside:
          "text-white/40 opacity-50 aria-selected:bg-white/10 aria-selected:text-white/60",
        day_disabled: "text-white/30 opacity-40 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-white/10 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };