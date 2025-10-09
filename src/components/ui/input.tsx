import * as React from "react";

import { cn } from "../../lib/utils";
import { FormItem } from "./form";
import { Label } from "./label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <FormItem>
        {label && (
          <Label
            data-slot="form-label"
            className={cn(className)}
            htmlFor={`input-${props.name}-${type}`}
          >
            {label}
          </Label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-destructive text-sm">{error}</span>}
      </FormItem>
    );
  }
);
Input.displayName = "Input";

export { Input };
