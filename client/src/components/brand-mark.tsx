import { cn } from "@/lib/utils";

const sizeMap = {
  sm: "h-9 w-9 rounded-xl text-sm",
  md: "h-11 w-11 rounded-2xl text-base",
  lg: "h-14 w-14 rounded-2xl text-xl",
  xl: "h-16 w-16 rounded-[1.35rem] text-2xl",
} as const;

interface BrandMarkProps {
  size?: keyof typeof sizeMap;
  className?: string;
  labelClassName?: string;
}

export function BrandMark({ size = "md", className, labelClassName }: BrandMarkProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden border border-white/10 bg-primary font-black tracking-[-0.08em] text-primary-foreground shadow-[0_18px_45px_rgba(30,58,138,0.34)]",
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.34),transparent_44%)]",
        sizeMap[size],
        className,
      )}
      aria-label="SmartResult"
    >
      <span className={cn("relative z-10", labelClassName)}>SR</span>
    </div>
  );
}
