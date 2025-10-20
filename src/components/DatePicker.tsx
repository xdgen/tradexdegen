import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";

interface DatePickerProps {
  value: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  error?: string;
  label?: string;
}

function DatePicker({
   value,
   onChange,
   error,
   label,
   placeholder = "Pick a date",
 }: DatePickerProps) {
   const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-2 w-full">
          {label && <Label data-slot="form-label">{label}</Label>}
          <Button
            type="button"
            variant="outline"
            data-empty={!value}
            className="h-12 data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
          >
            <CalendarIcon className="size-4 mr-1.5" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
          {error && <span className="text-destructive text-sm">{error}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
