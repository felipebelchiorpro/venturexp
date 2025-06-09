
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { KPI_DATA, MOCK_USER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChartHorizontalBig, LineChart, TrendingUp, Activity, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutivePlaceholderContent } from '@/components/dashboard/ExecutivePlaceholderContent';

export default function DashboardPage() {
  const [currentDateTime, setCurrentDateTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDateTime(format(new Date(), "PPP, p")); // Format example: Oct 29, 2023, 4:30 PM
  }, []);

  return (
    <div className="space-y-6">
      {currentDateTime && (
        <p className="text-xl text-muted-foreground mb-2">
          Welcome back, {MOCK_USER.name}!
        </p>
      )}
      <PageHeader 
        title="Dashboard" 
        description={currentDateTime ? `Today is ${currentDateTime}. Here's your agency's performance at a glance.` : "Loading date... Here's your agency's performance at a glance."}
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
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center">
              <BarChartHorizontalBig className="mr-2 h-5 w-5 text-muted-foreground" />
              Project Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutivePlaceholderContent message="Chart displaying project completion status will be shown here." icon={<TrendingUp size={48}/>} />
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground flex items-center">
              <LineChart className="mr-2 h-5 w-5 text-muted-foreground" />
              Monthly Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExecutivePlaceholderContent message="Chart showing monthly revenue trends will be displayed here." icon={<LineChart size={48}/>} />
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Recent Activity</h3>
          <ExecutivePlaceholderContent message="Activity feed will be shown here. (e.g., New lead added, Proposal sent, Task completed)" icon={<Activity size={32}/>} />
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">Upcoming Deadlines</h3>
          <ExecutivePlaceholderContent message="A list of upcoming deadlines will be shown here." icon={<CalendarClock size={32}/>} />
        </div>
      </div>
    </div>
  );
}
