import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

export const TooltipProvider = TooltipPrimitive.Provider

interface CustomTooltipProps {
  content: string;
  children: React.ReactNode;
}
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={`z-50 overflow-hidden rounded-md border border-white/10 bg-secondary px-2 py-1 text-xs text-gray-200 shadow-md ${className ?? ""}`}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

const CustomTooltip: React.FC<CustomTooltipProps> = ({ content, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <span className="tooltip-text">{content}</span>
    </div>
  );
};

export { CustomTooltip }
