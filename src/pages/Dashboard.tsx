import { useState, useEffect } from "react";
import { Users, IndianRupee, Receipt, AlertTriangle, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CollectionChart } from "@/components/dashboard/CollectionChart";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalCollection: 0,
    pendingInvoices: 0,
    overduePayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch student counts
        const { count: totalStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        const { count: activeStudents } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // Fetch payment totals
        const { data: payments } = await supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed");

        const totalCollection = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

        // Fetch pending invoices
        const { count: pendingInvoices } = await supabase
          .from("invoices")
          .select("*", { count: "exact", head: true })
          .in("status", ["pending", "partial"]);

        // Fetch overdue invoices
        const { count: overduePayments } = await supabase
          .from("invoices")
          .select("*", { count: "exact", head: true })
          .eq("status", "overdue");

        setStats({
          totalStudents: totalStudents || 0,
          activeStudents: activeStudents || 0,
          totalCollection,
          pendingInvoices: pendingInvoices || 0,
          overduePayments: overduePayments || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Admin";

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents.toLocaleString(),
      change: `${stats.activeStudents} active`,
      changeType: "neutral" as const,
      icon: Users,
      iconColor: "bg-primary/10 text-primary",
    },
    {
      title: "Total Collection",
      value: formatCurrency(stats.totalCollection),
      change: "All time",
      changeType: "positive" as const,
      icon: IndianRupee,
      iconColor: "bg-success/10 text-success",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices.toString(),
      change: "Awaiting payment",
      changeType: "neutral" as const,
      icon: Receipt,
      iconColor: "bg-warning/10 text-warning",
    },
    {
      title: "Overdue Payments",
      value: stats.overduePayments.toString(),
      change: "Need attention",
      changeType: stats.overduePayments > 0 ? "negative" as const : "positive" as const,
      icon: AlertTriangle,
      iconColor: "bg-destructive/10 text-destructive",
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Good {getGreeting()}, {userName}! 👋
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
          {statCards.map((stat, idx) => (
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
