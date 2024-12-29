"use client";

import { cn } from "@/lib/utils";
// import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster !top-[calc(var(--header-height)+0.5rem)] container group"
      offset={10}
      position="top-center"
      invert={false}
      toastOptions={{
        classNames: {
          content: "flex-1 min-w-0",
          toast: cn(
            "group right-2.5 items-start toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            "group-[.toaster]:data-[type=success]:text-[--success-text]",
            "group-[.toaster]:data-[type=error]:text-[--error-text]",
            "group-[.toaster]:data-[type=info]:text-[--info-text]"
          ),
          description: "group-[.toast]:text-muted-foreground",
          icon: "mt-0.5",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
