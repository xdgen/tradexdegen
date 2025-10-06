import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Label } from "./ui/label";

interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
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
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="flex flex-col gap-y-2">
          {label && (
            <Label 
              data-slot="form-label" 
              className="text-white/90 text-sm font-medium"
            >
              {label}
            </Label>
          )}
          <Button
            type="button"
            variant="outline"
            data-empty={!value}
            className="h-12 data-[empty=true]:text-muted-foreground justify-start text-left font-normal bg-secondary/50 border-white/10 text-white hover:bg-secondary/70 hover:border-white/20"
          >
            <CalendarIcon className="size-4 mr-1.5" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
          {error && <span className="text-red-400 text-sm">{error}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-secondary border-white/10 shadow-xl"
        align="center"
        side="bottom"
      >
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