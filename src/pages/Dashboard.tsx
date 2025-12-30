import { Users, IndianRupee, Receipt, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CollectionChart } from "@/components/dashboard/CollectionChart";

const stats = [
  {
    title: "Total Students",
    value: "1,547",
    change: "+23 this month",
    changeType: "positive" as const,
    icon: Users,
    iconColor: "bg-primary/10 text-primary",
  },
  {
    title: "Total Collection",
    value: "₹24.5L",
    change: "+12.5% vs last month",
    changeType: "positive" as const,
    icon: IndianRupee,
    iconColor: "bg-success/10 text-success",
  },
  {
    title: "Pending Invoices",
    value: "234",
    change: "₹8.2L outstanding",
    changeType: "neutral" as const,
    icon: Receipt,
    iconColor: "bg-warning/10 text-warning",
  },
  {
    title: "Overdue Payments",
    value: "47",
    change: "-8 from last week",
    changeType: "positive" as const,
    icon: AlertTriangle,
    iconColor: "bg-destructive/10 text-destructive",
  },
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Good morning, Admin! 👋
              </h1>
              <p className="mt-1 text-muted-foreground">
                Here's what's happening with your school finances today.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
              <Clock className="h-4 w-4" />
              <span>Last updated: Just now</span>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <StatCard key={stat.title} {...stat} delay={idx * 100} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <CollectionChart />
          </div>
          {/* Quick Actions */}
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Recent Payments */}
        <RecentPayments />
      </div>
    </DashboardLayout>
  );
}
