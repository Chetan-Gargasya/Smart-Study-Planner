import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { premium?: boolean, animated?: boolean }>(
  ({ className, premium = false, animated = false, ...props }, ref) => {
    const Component = animated ? motion.div : "div";
    const animationProps = animated ? {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.4 }
    } : {};

    return (
      <Component
        ref={ref as any}
        className={cn(
          "rounded-2xl border text-card-foreground shadow-sm transition-all duration-300",
          premium ? "glass-panel" : "bg-card/50 backdrop-blur-sm border-white/5",
          className
        )}
        {...animationProps}
        {...(props as any)}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight text-white", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0 text-gray-300", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
