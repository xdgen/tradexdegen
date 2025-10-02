import * as React from "react";

import { cn } from "../../lib/utils";
import { FormItem } from "./form";
import { Label } from "./label";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <FormItem>
        {label && (
          <Label
            data-slot="form-label"
            className={cn(className)}
            htmlFor={`textarea-${props.name}`}
          >
            {label}
          </Label>
        )}
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          id={`textarea-${props.name}`}
          ref={ref}
          {...props}
        />
        {error && <span className="text-destructive text-sm">{error}</span>}
      </FormItem>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
