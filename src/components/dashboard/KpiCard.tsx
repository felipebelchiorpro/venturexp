import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  ClipboardList, 
  Users, 
  FileText, 
  TrendingUp, 
  CalendarClock, 
  Minus,
  DollarSign,
  CreditCard,
  Award,
  Activity,
  CheckCircle,
  XCircle,
  CalendarCheck2,
  CalendarX2
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  iconName: IconName;
  description?: string;
}

export type IconName = 
  | "ClipboardList" 
  | "Users" 
  | "FileText" 
  | "TrendingUp" 
  | "CalendarClock"
  | "DollarSign"
  | "CreditCard"
  | "Award"
  | "Activity"
  | "CheckCircle"
  | "XCircle"
  | "CalendarCheck2"
  | "CalendarX2";

const iconMap: Record<IconName, LucideIcon> = {
  ClipboardList,
  Users,
  FileText,
  TrendingUp,
  CalendarClock,
  DollarSign,
  CreditCard,
  Award,
  Activity,
  CheckCircle,
  XCircle,
  CalendarCheck2,
  CalendarX2,
};

export function KpiCard({ title, value, change, trend, iconName, description }: KpiCardProps) {
  const IconComponent = iconMap[iconName];
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {change && (
          <p className={cn(
            "text-xs text-muted-foreground flex items-center",
            trend === "up" && "text-green-600",
            trend === "down" && "text-red-600"
          )}>
            <TrendIcon className={cn(
              "mr-1 h-4 w-4",
              trend === "up" && "fill-green-600/20",
              trend === "down" && "fill-red-600/20",
            )} />
            {change}
          </p>
        )}
        {description && !change && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
