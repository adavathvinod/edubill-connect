import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X } from "lucide-react";
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

const studentSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  admission_number: z.string().min(1, "Admission number is required").max(20),
  class: z.string().min(1, "Class is required"),
  section: z.string().min(1, "Section is required"),
  parent_name: z.string().min(1, "Parent name is required").max(100),
  parent_phone: z.string().min(10, "Valid phone number required").max(15),
  parent_email: z.string().email("Valid email required").optional().or(z.literal("")),
  address: z.string().optional(),
  date_of_birth: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const classes = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const sections = ["A", "B", "C", "D"];

export function AddStudentDialog({ open, onOpenChange, onSuccess }: AddStudentDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = async (data: StudentFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("students").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        admission_number: data.admission_number,
        class: data.class,
        section: data.section,
        parent_name: data.parent_name,
        parent_phone: data.parent_phone,
        parent_email: data.parent_email || null,
        address: data.address || null,
        date_of_birth: data.date_of_birth || null,
      });

      if (error) throw error;

      toast({
        title: "Student added",
        description: `${data.first_name} ${data.last_name} has been added successfully.`,
      });
      
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add New Student</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" {...register("first_name")} placeholder="Enter first name" />
              {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" {...register("last_name")} placeholder="Enter last name" />
              {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admission_number">Admission No. *</Label>
              <Input id="admission_number" {...register("admission_number")} placeholder="e.g., 2024001" />
              {errors.admission_number && <p className="text-sm text-destructive">{errors.admission_number.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Class *</Label>
              <Select onValueChange={(value) => setValue("class", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls} value={cls}>Class {cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.class && <p className="text-sm text-destructive">{errors.class.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Section *</Label>
              <Select onValueChange={(value) => setValue("section", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.section && <p className="text-sm text-destructive">{errors.section.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-4">Parent/Guardian Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent Name *</Label>
                <Input id="parent_name" {...register("parent_name")} placeholder="Enter parent name" />
                {errors.parent_name && <p className="text-sm text-destructive">{errors.parent_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_phone">Phone Number *</Label>
                <Input id="parent_phone" {...register("parent_phone")} placeholder="+91 98765 43210" />
                {errors.parent_phone && <p className="text-sm text-destructive">{errors.parent_phone.message}</p>}
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Label htmlFor="parent_email">Email</Label>
              <Input id="parent_email" type="email" {...register("parent_email")} placeholder="parent@email.com" />
              {errors.parent_email && <p className="text-sm text-destructive">{errors.parent_email.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} placeholder="Enter full address" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
