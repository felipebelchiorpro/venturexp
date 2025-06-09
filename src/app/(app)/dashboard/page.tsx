import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KPI_DATA } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's your agency's performance at a glance."
        actions={
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
        }
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {KPI_DATA.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend as "up" | "down" | "neutral"}
            iconName={kpi.iconName as any}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">Activity feed will be shown here. (e.g., New lead added, Proposal sent, Task completed)</p>
          {/* Placeholder for activity items */}
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Upcoming Deadlines</h3>
          <p className="text-sm text-muted-foreground">A list of upcoming deadlines will be shown here.</p>
          {/* Placeholder for deadline items */}
        </div>
      </div>
    </div>
  );
}
