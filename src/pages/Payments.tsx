import { useState, useEffect } from "react";
import { Search, Plus, Download, CreditCard, Smartphone, Building2, CheckCircle2, Clock, XCircle, Loader2, Banknote } from "lucide-react";
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
import { RecordPaymentDialog } from "@/components/payments/RecordPaymentDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  payment_method: string;
  status: string;
  reference_number: string | null;
  created_at: string;
  invoices: {
    invoice_number: string;
    students: {
      first_name: string;
      last_name: string;
      class: string;
      section: string;
    };
  };
}

const methodIcons: Record<string, any> = {
  upi: Smartphone,
  card: CreditCard,
  netbanking: Building2,
  cash: Banknote,
  cheque: Banknote,
};

const methodLabels: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cash: "Cash",
  cheque: "Cheque",
};

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "bg-success/10 text-success", label: "Completed" },
  pending: { icon: Clock, color: "bg-warning/10 text-warning", label: "Pending" },
  failed: { icon: XCircle, color: "bg-destructive/10 text-destructive", label: "Failed" },
  refunded: { icon: XCircle, color: "bg-muted text-muted-foreground", label: "Refunded" },
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          transaction_id,
          amount,
          payment_method,
          status,
          reference_number,
          created_at,
          invoices (
            invoice_number,
            students (
              first_name,
              last_name,
              class,
              section
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error: any) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) => {
    const student = payment.invoices?.students;
    const matchesSearch =
      `${student?.first_name} ${student?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const todayPayments = payments.filter((p) => {
    const today = new Date().toISOString().split("T")[0];
    return p.created_at.startsWith(today) && p.status === "completed";
  });

  const todayTotal = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const monthTotal = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportPayments = () => {
    const headers = ["Transaction ID", "Student", "Amount", "Method", "Status", "Date"];
    const csvContent = [
      headers.join(","),
      ...filteredPayments.map((p) => [
        p.transaction_id,
        `${p.invoices?.students?.first_name} ${p.invoices?.students?.last_name}`,
        p.amount,
        methodLabels[p.payment_method] || p.payment_method,
        p.status,
        formatDate(p.created_at),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export complete",
      description: `${filteredPayments.length} payments exported to CSV`,
    });
  };

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
            <Button variant="secondary" className="gap-2" onClick={() => setRecordDialogOpen(true)}>
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
            <p className="text-sm opacity-75 mt-2">{todayPayments.length} transactions</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <p className="text-sm text-muted-foreground">Total Collection</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">₹{monthTotal.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground mt-2">All completed payments</p>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border/50 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
            <p className="text-3xl font-display font-bold text-foreground mt-1">{payments.length}</p>
            <p className="text-sm text-muted-foreground mt-2">All time</p>
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
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={exportPayments}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Payments Table */}
        <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-secondary" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No payments found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || methodFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Record your first payment to get started"}
              </p>
              {!searchQuery && methodFilter === "all" && (
                <Button variant="secondary" onClick={() => setRecordDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              )}
            </div>
          ) : (
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
                    const status = statusConfig[payment.status] || statusConfig.pending;
                    const StatusIcon = status.icon;
                    const MethodIcon = methodIcons[payment.payment_method] || CreditCard;
                    const student = payment.invoices?.students;

                    return (
                      <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-mono text-sm font-medium text-foreground">
                              {payment.transaction_id}
                            </p>
                            {payment.reference_number && (
                              <p className="text-xs text-muted-foreground">{payment.reference_number}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {student?.first_name} {student?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {payment.invoices?.invoice_number}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-foreground">
                            ₹{Number(payment.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                            <MethodIcon className="h-4 w-4" />
                            {methodLabels[payment.payment_method] || payment.payment_method}
                          </span>
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
                        <td className="px-6 py-4">
                          <span className="text-sm text-muted-foreground">{formatDate(payment.created_at)}</span>
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
      <RecordPaymentDialog
        open={recordDialogOpen}
        onOpenChange={setRecordDialogOpen}
        onSuccess={fetchPayments}
      />
    </DashboardLayout>
  );
}
