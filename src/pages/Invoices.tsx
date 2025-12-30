import { useState, useEffect } from "react";
import { Search, Plus, Download, Send, Eye, MoreHorizontal, FileText, CheckCircle2, Clock, XCircle, Loader2, Receipt } from "lucide-react";
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
import { CreateInvoiceDialog } from "@/components/invoices/CreateInvoiceDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/lib/pdf";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
  created_at: string;
  students: {
    first_name: string;
    last_name: string;
    class: string;
    section: string;
  };
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  paid: { icon: CheckCircle2, color: "bg-success/10 text-success", label: "Paid" },
  partial: { icon: Clock, color: "bg-warning/10 text-warning", label: "Partial" },
  pending: { icon: Clock, color: "bg-muted text-muted-foreground", label: "Pending" },
  overdue: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Overdue" },
  draft: { icon: FileText, color: "bg-muted text-muted-foreground", label: "Draft" },
  cancelled: { icon: XCircle, color: "bg-muted text-muted-foreground", label: "Cancelled" },
};

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          amount,
          paid_amount,
          due_date,
          status,
          created_at,
          students (
            first_name,
            last_name,
            class,
            section
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      console.error("Error fetching invoices:", error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDownloadPDF = async (invoiceId: string) => {
    setDownloadingId(invoiceId);
    try {
      await generateInvoicePDF(invoiceId);
      toast({
        title: "PDF Generated",
        description: "Invoice PDF has been opened in a new window.",
      });
    } catch (error: any) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const student = invoice.students;
    const matchesSearch =
      `${student?.first_name} ${student?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending" || i.status === "partial").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  };

  const getDaysOverdue = (dueDate: string, status: string) => {
    if (status !== "overdue") return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : null;
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
              <Button variant="secondary" className="gap-2" onClick={() => setCreateDialogOpen(true)}>
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
        </div>

        {/* Invoices Table */}
        <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "250ms" }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No invoices found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first invoice to get started"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button variant="secondary" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
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
                    const status = statusConfig[invoice.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const daysOverdue = getDaysOverdue(invoice.due_date, invoice.status);
                    const student = invoice.students;

                    return (
                      <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm font-medium text-foreground">
                            {invoice.invoice_number}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Class {student?.class}-{student?.section}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-foreground">
                              ₹{Number(invoice.amount).toLocaleString()}
                            </p>
                            {invoice.status === "partial" && (
                              <p className="text-xs text-muted-foreground">
                                Paid: ₹{Number(invoice.paid_amount).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </span>
                          {daysOverdue && (
                            <p className="text-xs text-destructive">{daysOverdue} days overdue</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                              status.color
                            )}
                          >
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
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => handleDownloadPDF(invoice.id)}
                                disabled={downloadingId === invoice.id}
                              >
                                <Download className="h-4 w-4" />
                                {downloadingId === invoice.id ? "Generating..." : "Download PDF"}
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
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateInvoiceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchInvoices}
      />
    </DashboardLayout>
  );
}
