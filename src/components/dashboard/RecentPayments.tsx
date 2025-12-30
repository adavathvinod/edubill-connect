import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const recentPayments = [
  {
    id: "PAY-001",
    student: "Aarav Sharma",
    class: "Class 10-A",
    amount: "₹15,000",
    date: "Today, 2:30 PM",
    status: "completed",
    method: "UPI",
  },
  {
    id: "PAY-002",
    student: "Priya Patel",
    class: "Class 8-B",
    amount: "₹12,500",
    date: "Today, 1:15 PM",
    status: "completed",
    method: "Card",
  },
  {
    id: "PAY-003",
    student: "Rohan Kumar",
    class: "Class 12-A",
    amount: "₹18,000",
    date: "Today, 11:00 AM",
    status: "pending",
    method: "NetBanking",
  },
  {
    id: "PAY-004",
    student: "Ananya Singh",
    class: "Class 6-C",
    amount: "₹10,000",
    date: "Yesterday",
    status: "completed",
    method: "UPI",
  },
  {
    id: "PAY-005",
    student: "Vikram Reddy",
    class: "Class 9-A",
    amount: "₹14,000",
    date: "Yesterday",
    status: "failed",
    method: "Card",
  },
];

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

export function RecentPayments() {
  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-display font-semibold text-lg text-foreground">Recent Payments</h3>
      </div>
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
            {recentPayments.map((payment, idx) => {
              const status = statusConfig[payment.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;
              return (
                <tr
                  key={payment.id}
                  className="hover:bg-muted/30 transition-colors"
                  style={{ animationDelay: `${400 + idx * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-foreground">{payment.student}</p>
                      <p className="text-sm text-muted-foreground">{payment.class}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-foreground">{payment.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">{payment.method}</span>
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
                    <span className="text-sm text-muted-foreground">{payment.date}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
