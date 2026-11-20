"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  return (
    <div className={cn("w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue: value, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ className, children, activeValue, onValueChange }: any) {
  return (
    <div className={cn("inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 p-1 text-slate-500", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeValue, onValueChange } as any);
        }
        return child;
      })}
    </div>
  );
}

export function TabsTrigger({ value, children, className, activeValue, onValueChange }: any) {
  const isSelected = activeValue === value;
  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-white text-indigo-700 shadow-sm font-semibold"
          : "hover:bg-slate-200/60 hover:text-slate-900 text-slate-600",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, children, className }: any) {
  if (value !== activeValue) return null;
  return <div className={cn("mt-4 ring-offset-background focus-visible:outline-none", className)}>{children}</div>;
}
