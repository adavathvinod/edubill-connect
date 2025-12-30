import { useState } from "react";
import { Search, Filter, Plus, Download, CreditCard, Smartphone, Building2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const payments = [
  { id: "TXN001", invoice: "INV-2024-001", student: "Aarav Sharma", amount: 15000, method: "upi", status: "completed", date: "2024-01-12 14:30", reference: "UPI123456789" },
  { id: "TXN002", invoice: "INV-2024-006", student: "Sneha Gupta", amount: 16500, method: "card", status: "completed", date: "2024-01-14 10:15", reference: "CARD987654321" },
  { id: "TXN003", invoice: "INV-2024-002", student: "Priya Patel", amount: 6000, method: "netbanking", status: "completed", date: "2024-01-13 16:45", reference: "NB456789123" },
  { id: "TXN004", invoice: "INV-2024-009", student: "Rahul Mehta", amount: 12000, method: "upi", status: "pending", date: "2024-01-15 09:00", reference: "UPI789123456" },
  { id: "TXN005", invoice: "INV-2024-010", student: "Divya Joshi", amount: 14500, method: "card", status: "failed", date: "2024-01-15 11:30", reference: "CARD321654987" },
  { id: "TXN006", invoice: "INV-2024-011", student: "Karthik Rajan", amount: 13000, method: "upi", status: "completed", date: "2024-01-15 08:20", reference: "UPI654321789" },
];

const methodIcons = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Building2,
};

const methodLabels = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
};

const statusConfig = {
  completed: { icon: CheckCircle2, color: "bg-success/10 text-success", label: "Completed" },
  pending: { icon: Clock, color: "bg-warning/10 text-warning", label: "Pending" },
  failed: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Failed" },
};

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const todayTotal = payments
    .filter((p) => p.status === "completed" && p.date.startsWith("2024-01-15"))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Payments</h1>
              <p className="mt-1 text-muted-foreground">
                Track and manage all payment transactions
              </p>
            </div>
            <Button variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-xl p-6 text-secondary-foreground animate-slide-up">
            <p className="text-sm opacity-90">Today's Collection</p>
            <p className="text-3xl font-display font-bold mt-1">₹{todayTotal.toLocaleString()}</p>
            <p className="text-sm opacity-75 mt-2">2 successful transactions</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">₹4,24,500</p>
            <p className="text-sm text-success mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-muted-foreground">Pending Payments</p>
            <p className="text-3xl font-display font-bold text-warning mt-1">₹82,000</p>
            <p className="text-sm text-muted-foreground mt-2">23 transactions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by student name or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="netbanking">Net Banking</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Payments Table */}
        <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Method
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => {
                  const status = statusConfig[payment.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  const MethodIcon = methodIcons[payment.method as keyof typeof methodIcons];
                  return (
                    <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-sm font-medium text-foreground">{payment.id}</p>
                          <p className="text-xs text-muted-foreground">{payment.reference}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{payment.student}</p>
                          <p className="text-sm text-muted-foreground">{payment.invoice}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">₹{payment.amount.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                          <MethodIcon className="h-4 w-4" />
                          {methodLabels[payment.method as keyof typeof methodLabels]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          status.color
                        )}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{payment.date}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
