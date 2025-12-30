import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const feeStructureSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

type FeeStructureFormData = z.infer<typeof feeStructureSchema>;

interface FeeComponent {
  name: string;
  amount: string;
  frequency: "monthly" | "quarterly" | "annual";
}

interface AddFeeStructureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const allClasses = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

export function AddFeeStructureDialog({ open, onOpenChange, onSuccess }: AddFeeStructureDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [components, setComponents] = useState<FeeComponent[]>([
    { name: "", amount: "", frequency: "monthly" }
  ]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeeStructureFormData>({
    resolver: zodResolver(feeStructureSchema),
  });

  const handleClassToggle = (cls: string) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const addComponent = () => {
    setComponents([...components, { name: "", amount: "", frequency: "monthly" }]);
  };

  const removeComponent = (index: number) => {
    setComponents(components.filter((_, i) => i !== index));
  };

  const updateComponent = (index: number, field: keyof FeeComponent, value: string) => {
    const updated = [...components];
    updated[index] = { ...updated[index], [field]: value };
    setComponents(updated);
  };

  const onSubmit = async (data: FeeStructureFormData) => {
    if (selectedClasses.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    const validComponents = components.filter((c) => c.name && c.amount);
    if (validComponents.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one fee component",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create fee structure
      const { data: structure, error: structureError } = await supabase
        .from("fee_structures")
        .insert({
          name: data.name,
          classes: selectedClasses,
        })
        .select()
        .single();

      if (structureError) throw structureError;

      // Create fee components
      const componentsToInsert = validComponents.map((c) => ({
        fee_structure_id: structure.id,
        name: c.name,
        amount: parseFloat(c.amount),
        frequency: c.frequency,
      }));

      const { error: componentsError } = await supabase
        .from("fee_components")
        .insert(componentsToInsert);

      if (componentsError) throw componentsError;

      toast({
        title: "Fee structure created",
        description: `${data.name} has been added successfully.`,
      });

      reset();
      setSelectedClasses([]);
      setComponents([{ name: "", amount: "", frequency: "monthly" }]);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating fee structure:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create fee structure",
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
          <DialogTitle className="font-display text-xl">Add Fee Structure</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Structure Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Primary Classes (1-5)"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Applicable Classes *</Label>
            <div className="flex flex-wrap gap-2">
              {allClasses.map((cls) => (
                <label
                  key={cls}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={selectedClasses.includes(cls)}
                    onCheckedChange={() => handleClassToggle(cls)}
                  />
                  <span className="text-sm">Class {cls}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Fee Components *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addComponent}>
                <Plus className="h-4 w-4 mr-1" />
                Add Component
              </Button>
            </div>

            {components.map((component, index) => (
              <div key={index} className="flex gap-3 items-start p-4 rounded-lg border border-border bg-muted/30">
                <div className="flex-1 space-y-2">
                  <Label>Component Name</Label>
                  <Input
                    value={component.name}
                    onChange={(e) => updateComponent(index, "name", e.target.value)}
                    placeholder="e.g., Tuition Fee"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={component.amount}
                    onChange={(e) => updateComponent(index, "amount", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="w-36 space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={component.frequency}
                    onValueChange={(value) => updateComponent(index, "frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {components.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-7 text-destructive"
                    onClick={() => removeComponent(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={loading}>
              {loading ? "Creating..." : "Create Structure"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
