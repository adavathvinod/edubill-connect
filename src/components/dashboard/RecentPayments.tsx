import { useState, useEffect } from "react";
import { CheckCircle2, Clock, XCircle, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Payment {
  id: string;
  transaction_id: string;
  amount: number;
  payment_method: string;
  status: string;
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

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-success bg-success/10",
    label: "Completed",
  },
  pending: {
    icon: Clock,
    color: "text-warning bg-warning/10",
    label: "Pending",
  },
  failed: {
    icon: XCircle,
    color: "text-destructive bg-destructive/10",
    label: "Failed",
  },
};

const methodLabels: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  cash: "Cash",
  cheque: "Cheque",
};

export function RecentPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const { data, error } = await supabase
          .from("payments")
          .select(`
            id,
            transaction_id,
            amount,
            payment_method,
            status,
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
          .order("created_at", { ascending: false })
          .limit(5);

        if (error) throw error;
        setPayments(data || []);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `Today, ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (hours < 48) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-display font-semibold text-lg text-foreground">Recent Payments</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 rounded-full border-4 border-secondary border-t-transparent animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">No payments recorded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => {
                const status = statusConfig[payment.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = status.icon;
                const student = payment.invoices?.students;
                
                return (
                  <tr key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-foreground">
                          {student ? `${student.first_name} ${student.last_name}` : "Unknown"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student ? `Class ${student.class}-${student.section}` : ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">
                        ₹{Number(payment.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
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
  );
}
