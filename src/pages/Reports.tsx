import { Download, FileText, Calendar, TrendingUp, Users, IndianRupee, PieChart, BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportTypes = [
  {
    id: "daily-collection",
    title: "Daily Collection Report",
    description: "Summary of all payments received today",
    icon: IndianRupee,
    color: "bg-success/10 text-success",
    formats: ["PDF", "Excel"],
  },
  {
    id: "monthly-collection",
    title: "Monthly Collection Report",
    description: "Detailed breakdown of monthly fee collection",
    icon: Calendar,
    color: "bg-secondary/10 text-secondary",
    formats: ["PDF", "Excel"],
  },
  {
    id: "pending-fees",
    title: "Pending Fees Report",
    description: "List of all outstanding fee payments",
    icon: FileText,
    color: "bg-warning/10 text-warning",
    formats: ["PDF", "Excel"],
  },
  {
    id: "student-ledger",
    title: "Student Ledger",
    description: "Individual student payment history",
    icon: Users,
    color: "bg-primary/10 text-primary",
    formats: ["PDF"],
  },
  {
    id: "class-wise",
    title: "Class-wise Collection",
    description: "Fee collection summary by class",
    icon: BarChart3,
    color: "bg-accent/10 text-accent",
    formats: ["PDF", "Excel"],
  },
  {
    id: "payment-mode",
    title: "Payment Mode Analysis",
    description: "Breakdown by payment methods (UPI, Card, etc.)",
    icon: PieChart,
    color: "bg-muted text-muted-foreground",
    formats: ["PDF", "Excel"],
  },
];

const recentReports = [
  { name: "Daily Collection - Jan 15, 2024", date: "Today, 6:00 PM", size: "245 KB", type: "PDF" },
  { name: "Monthly Collection - December 2023", date: "Jan 1, 2024", size: "1.2 MB", type: "Excel" },
  { name: "Pending Fees Q4 2023", date: "Dec 31, 2023", size: "890 KB", type: "PDF" },
  { name: "Class 10 Ledger - 2023-24", date: "Dec 28, 2023", size: "2.1 MB", type: "PDF" },
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Reports</h1>
              <p className="mt-1 text-muted-foreground">
                Generate and download financial reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select defaultValue="2024">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2023-24</SelectItem>
                  <SelectItem value="2023">2022-23</SelectItem>
                  <SelectItem value="2022">2021-22</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report, idx) => (
            <Card
              key={report.id}
              className="overflow-hidden hover-lift animate-slide-up cursor-pointer group"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${report.color}`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    {report.formats.map((format) => (
                      <span
                        key={format}
                        className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Recent Reports</h2>
          <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Report Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Generated
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Size
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentReports.map((report) => (
                  <tr key={report.name} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{report.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{report.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-muted text-xs font-medium text-muted-foreground">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{report.size}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
