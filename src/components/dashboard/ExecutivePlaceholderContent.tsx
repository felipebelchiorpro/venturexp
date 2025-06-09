import { CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExecutivePlaceholderContentProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ExecutivePlaceholderContent({ message, icon, className }: ExecutivePlaceholderContentProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center h-full py-8 text-center", className)}>
      {icon && <div className="mb-3 text-muted-foreground">{icon}</div>}
      <CardDescription>{message}</CardDescription>
    </div>
  );
}
