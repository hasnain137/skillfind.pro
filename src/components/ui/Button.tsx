
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/cn"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#3B4D9D] to-[#304090] text-white shadow-md hover:shadow-lg hover:shadow-[#3B4D9D]/20 hover:from-[#304090] hover:to-[#2A3A80]",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700",
        outline:
          "border border-[#E5E7EB] bg-white/80 backdrop-blur-sm hover:bg-white hover:border-[#3B4D9D]/30 hover:shadow-sm",
        secondary:
          "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] shadow-sm",
        ghost: "hover:bg-[#F3F4F6] hover:text-[#1F2937]",
        link: "text-[#3B4D9D] underline-offset-4 hover:underline",
        // Premium glass button
        glass: "glass-card text-[#1F2937] hover:shadow-glass-hover",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      isLoading: {
        true: "cursor-not-allowed opacity-70",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      isLoading: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className, isLoading }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
