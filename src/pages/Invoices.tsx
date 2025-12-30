import { useState } from "react";
import { Search, Filter, Plus, Download, Send, Eye, MoreHorizontal, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const invoices = [
  { id: "INV-2024-001", student: "Aarav Sharma", class: "10-A", amount: 15000, dueDate: "2024-01-15", status: "paid", paidDate: "2024-01-12" },
  { id: "INV-2024-002", student: "Priya Patel", class: "8-B", amount: 12500, dueDate: "2024-01-15", status: "partial", paidAmount: 6000 },
  { id: "INV-2024-003", student: "Rohan Kumar", class: "12-A", amount: 18000, dueDate: "2024-01-10", status: "overdue", daysOverdue: 5 },
  { id: "INV-2024-004", student: "Ananya Singh", class: "6-C", amount: 10000, dueDate: "2024-01-20", status: "pending" },
  { id: "INV-2024-005", student: "Vikram Reddy", class: "9-A", amount: 14000, dueDate: "2024-01-18", status: "pending" },
  { id: "INV-2024-006", student: "Sneha Gupta", class: "11-B", amount: 16500, dueDate: "2024-01-15", status: "paid", paidDate: "2024-01-14" },
  { id: "INV-2024-007", student: "Arjun Nair", class: "7-A", amount: 11000, dueDate: "2024-01-05", status: "overdue", daysOverdue: 10 },
  { id: "INV-2024-008", student: "Kavya Iyer", class: "10-B", amount: 15000, dueDate: "2024-01-20", status: "draft" },
];

const statusConfig = {
  paid: { icon: CheckCircle2, color: "bg-success/10 text-success", label: "Paid" },
  partial: { icon: Clock, color: "bg-warning/10 text-warning", label: "Partial" },
  pending: { icon: Clock, color: "bg-muted text-muted-foreground", label: "Pending" },
  overdue: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Overdue" },
  draft: { icon: FileText, color: "bg-muted text-muted-foreground", label: "Draft" },
};

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending" || i.status === "partial").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Invoices</h1>
              <p className="mt-1 text-muted-foreground">
                Create, manage, and track fee invoices
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Send className="h-4 w-4" />
                Send Reminders
              </Button>
              <Button variant="secondary" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Invoices", value: stats.total, color: "text-foreground" },
            { label: "Paid", value: stats.paid, color: "text-success" },
            { label: "Pending", value: stats.pending, color: "text-warning" },
            { label: "Overdue", value: stats.overdue, color: "text-destructive" },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-4 border border-border/50 animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-display font-bold", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice ID or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "250ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Invoice ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInvoices.map((invoice) => {
                  const status = statusConfig[invoice.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-foreground">{invoice.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{invoice.student}</p>
                          <p className="text-sm text-muted-foreground">{invoice.class}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-foreground">₹{invoice.amount.toLocaleString()}</p>
                          {invoice.status === "partial" && (
                            <p className="text-xs text-muted-foreground">
                              Paid: ₹{(invoice as any).paidAmount?.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{invoice.dueDate}</span>
                        {invoice.status === "overdue" && (
                          <p className="text-xs text-destructive">{(invoice as any).daysOverdue} days overdue</p>
                        )}
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
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Download className="h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Send className="h-4 w-4" />
                              Send Reminder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
