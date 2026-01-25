import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ComicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline";
  isLoading?: boolean;
}

export function ComicButton({ 
  className, 
  variant = "primary", 
  isLoading,
  children, 
  ...props 
}: ComicButtonProps) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90",
    outline: "bg-white text-foreground hover:bg-gray-50",
  };

  return (
    <button
      className={cn(
        "relative px-6 py-3 font-comic text-xl tracking-wider uppercase transition-all duration-200",
        "border-2 border-black rounded-lg",
        "comic-shadow comic-shadow-hover active:comic-shadow-active",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none",
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin inline-block" />}
      {children}
    </button>
  );
}
