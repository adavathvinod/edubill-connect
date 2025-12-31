import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Search } from "lucide-react";
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

const invoiceSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  due_date: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceItem {
  description: string;
  amount: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class: string;
  section: string;
}

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateInvoiceDialog({ open, onOpenChange, onSuccess }: CreateInvoiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", amount: "" }]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const selectedStudentId = watch("student_id");

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, first_name, last_name, admission_number, class, section")
        .eq("is_active", true)
        .order("first_name");

      if (!error && data) {
        setStudents(data);
      }
    };

    if (open) {
      fetchStudents();
    }
  }, [open]);

  const filteredStudents = students.filter(
    (s) =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.admission_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addItem = () => {
    setItems([...items, { description: "", amount: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  const onSubmit = async (data: InvoiceFormData) => {
    const validItems = items.filter((i) => i.description && i.amount);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one invoice item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{
          student_id: data.student_id,
          amount: totalAmount,
          due_date: data.due_date,
          description: data.description || null,
          status: "pending" as const,
          invoice_number: "TEMP", // Will be overwritten by database trigger
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const itemsToInsert = validItems.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        amount: parseFloat(item.amount),
      }));

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: "Invoice created",
        description: `Invoice ${invoice.invoice_number} has been created successfully.`,
      });

      reset();
      setItems([{ description: "", amount: "" }]);
      setSearchQuery("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Create Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Select Student *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                {filteredStudents.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No students found</p>
                ) : (
                  filteredStudents.slice(0, 5).map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full p-3 text-left hover:bg-muted/50 transition-colors flex justify-between items-center"
                      onClick={() => {
                        setValue("student_id", student.id);
                        setSearchQuery("");
                      }}
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {student.first_name} {student.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.admission_number} | Class {student.class}-{student.section}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedStudent && (
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="font-medium text-foreground">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedStudent.admission_number} | Class {selectedStudent.class}-{selectedStudent.section}
                </p>
              </div>
            )}
            {errors.student_id && <p className="text-sm text-destructive">{errors.student_id.message}</p>}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date *</Label>
            <Input id="due_date" type="date" {...register("due_date")} />
            {errors.due_date && <p className="text-sm text-destructive">{errors.due_date.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="e.g., Q1 Fee 2024-25" />
          </div>

          {/* Invoice Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Invoice Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <Input
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder="e.g., Tuition Fee"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(index, "amount", e.target.value)}
                    placeholder="Amount"
                  />
                </div>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
