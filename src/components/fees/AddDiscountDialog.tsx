import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

const discountSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  discount_type: z.enum(["percentage", "fixed"]),
  value: z.string().min(1, "Value is required"),
  applicability: z.string().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

interface AddDiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddDiscountDialog({ open, onOpenChange, onSuccess }: AddDiscountDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discount_type: "percentage",
    },
  });

  const discountType = watch("discount_type");

  const onSubmit = async (data: DiscountFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("discounts").insert({
        name: data.name,
        discount_type: data.discount_type,
        value: parseFloat(data.value),
        applicability: data.applicability || null,
      });

      if (error) throw error;

      toast({
        title: "Discount created",
        description: `${data.name} has been added successfully.`,
      });

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating discount:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create discount",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add Discount</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Discount Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Sibling Discount"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={discountType}
                onValueChange={(value) => setValue("discount_type", value as "percentage" | "fixed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                {...register("value")}
                placeholder={discountType === "percentage" ? "10" : "2000"}
              />
              {errors.value && <p className="text-sm text-destructive">{errors.value.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicability">Applicability</Label>
            <Input
              id="applicability"
              {...register("applicability")}
              placeholder="e.g., Second child onwards"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? "Creating..." : "Create Discount"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
