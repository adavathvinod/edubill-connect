import { Link } from "react-router-dom";
import { UserPlus, FileText, CreditCard, Download, Send, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    icon: UserPlus,
    label: "Add Student",
    description: "Register new student",
    path: "/students",
    color: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
  },
  {
    icon: FileText,
    label: "Create Invoice",
    description: "Generate new invoice",
    path: "/invoices",
    color: "bg-secondary/10 text-secondary hover:bg-secondary hover:text-secondary-foreground",
  },
  {
    icon: CreditCard,
    label: "Record Payment",
    description: "Add manual payment",
    path: "/payments",
    color: "bg-success/10 text-success hover:bg-success hover:text-success-foreground",
  },
  {
    icon: Send,
    label: "Send Reminders",
    description: "Fee payment alerts",
    path: "/invoices",
    color: "bg-warning/10 text-warning hover:bg-warning hover:text-warning-foreground",
  },
  {
    icon: Download,
    label: "Export Report",
    description: "Download data",
    path: "/reports",
    color: "bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground",
  },
  {
    icon: Calculator,
    label: "Fee Structure",
    description: "Manage fees",
    path: "/fees",
    color: "bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-display font-semibold text-lg text-foreground">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action, idx) => (
          <Link
            key={action.label}
            to={action.path}
            className={cn(
              "group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300",
              action.color
            )}
            style={{ animationDelay: `${250 + idx * 50}ms` }}
          >
            <action.icon className="h-6 w-6" />
            <div className="text-center">
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs opacity-70">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
