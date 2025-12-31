import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  invoice_id: z.string().min(1, "Invoice is required"),
  amount: z.string().min(1, "Amount is required"),
  payment_method: z.enum(["upi", "card", "netbanking", "cash", "cheque"]),
  reference_number: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  students: {
    first_name: string;
    last_name: string;
    class: string;
    section: string;
  };
}

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RecordPaymentDialog({ open, onOpenChange, onSuccess }: RecordPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_method: "upi",
    },
  });

  const selectedInvoiceId = watch("invoice_id");

  useEffect(() => {
    const fetchInvoices = async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          amount,
          paid_amount,
          status,
          students (
            first_name,
            last_name,
            class,
            section
          )
        `)
        .in("status", ["pending", "partial"])
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInvoices(data);
      }
    };

    if (open) {
      fetchInvoices();
    }
  }, [open]);

  const filteredInvoices = invoices.filter(
    (i) =>
      `${i.students?.first_name} ${i.students?.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const balanceDue = selectedInvoice
    ? Number(selectedInvoice.amount) - Number(selectedInvoice.paid_amount)
    : 0;

  const onSubmit = async (data: PaymentFormData) => {
    const paymentAmount = parseFloat(data.amount);
    
    if (paymentAmount > balanceDue) {
      toast({
        title: "Error",
        description: `Amount cannot exceed balance due (₹${balanceDue.toLocaleString()})`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create payment
      const { error: paymentError } = await supabase.from("payments").insert([{
        invoice_id: data.invoice_id,
        amount: paymentAmount,
        payment_method: data.payment_method as "upi" | "card" | "netbanking" | "cash" | "cheque",
        status: "completed" as const,
        reference_number: data.reference_number || null,
        transaction_id: "TEMP", // Will be overwritten by database trigger
      }]);

      if (paymentError) throw paymentError;

      // Update invoice
      const newPaidAmount = Number(selectedInvoice!.paid_amount) + paymentAmount;
      const newStatus = newPaidAmount >= Number(selectedInvoice!.amount) ? "paid" : "partial";

      const { error: updateError } = await supabase
        .from("invoices")
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
        })
        .eq("id", data.invoice_id);

      if (updateError) throw updateError;

      toast({
        title: "Payment recorded",
        description: `₹${paymentAmount.toLocaleString()} has been recorded successfully.`,
      });

      reset();
      setSearchQuery("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error recording payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <Label>Select Invoice *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                {filteredInvoices.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No pending invoices found</p>
                ) : (
                  filteredInvoices.slice(0, 5).map((invoice) => (
                    <button
                      key={invoice.id}
                      type="button"
                      className="w-full p-3 text-left hover:bg-muted/50 transition-colors"
                      onClick={() => {
                        setValue("invoice_id", invoice.id);
                        setValue("amount", String(Number(invoice.amount) - Number(invoice.paid_amount)));
                        setSearchQuery("");
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.students?.first_name} {invoice.students?.last_name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">
                            ₹{(Number(invoice.amount) - Number(invoice.paid_amount)).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">due</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedInvoice && (
              <div className="p-3 bg-secondary/10 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{selectedInvoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedInvoice.students?.first_name} {selectedInvoice.students?.last_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Balance Due</p>
                    <p className="text-xl font-display font-bold text-foreground">
                      ₹{balanceDue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {errors.invoice_id && <p className="text-sm text-destructive">{errors.invoice_id.message}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              {...register("amount")}
              placeholder="Enter amount"
            />
            {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select
              value={watch("payment_method")}
              onValueChange={(value) => setValue("payment_method", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="netbanking">Net Banking</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference/Transaction ID</Label>
            <Input
              id="reference_number"
              {...register("reference_number")}
              placeholder="e.g., UPI123456789"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
