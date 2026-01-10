import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-swachh-green-500 text-white hover:bg-swachh-green-600 shadow-md hover:shadow-lg hover:shadow-swachh-green-500/25",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline:
          "border-2 border-swachh-green-500 bg-transparent text-swachh-green-500 hover:bg-swachh-green-500 hover:text-white",
        secondary:
          "bg-swachh-marigold-500 text-white hover:bg-swachh-marigold-600 shadow-md hover:shadow-lg hover:shadow-swachh-marigold-500/25",
        ghost:
          "hover:bg-accent hover:text-accent-foreground",
        link:
          "text-swachh-green-500 underline-offset-4 hover:underline",
        gradient:
          "btn-gradient-border text-foreground hover:scale-105 transform shadow-lg hover:shadow-xl hover:shadow-swachh-green-500/20 relative",
        glass:
          "glass text-foreground hover:bg-white/20 dark:hover:bg-white/10",
        glow:
          "bg-swachh-green-500 text-white btn-glow hover:scale-105 transform shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
