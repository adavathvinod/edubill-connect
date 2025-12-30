import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddFeeStructureDialog } from "@/components/fees/AddFeeStructureDialog";
import { AddDiscountDialog } from "@/components/fees/AddDiscountDialog";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FeeComponent {
  id: string;
  name: string;
  amount: number;
  frequency: string;
}

interface FeeStructure {
  id: string;
  name: string;
  classes: string[];
  fee_components: FeeComponent[];
}

interface Discount {
  id: string;
  name: string;
  discount_type: string;
  value: number;
  applicability: string | null;
  is_active: boolean;
}

const frequencyColors: Record<string, string> = {
  monthly: "bg-primary/10 text-primary",
  quarterly: "bg-secondary/10 text-secondary",
  annual: "bg-accent/10 text-accent",
};

export default function Fees() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [addStructureOpen, setAddStructureOpen] = useState(false);
  const [addDiscountOpen, setAddDiscountOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"structure" | "discount">("structure");
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch fee structures with components
      const { data: structures, error: structuresError } = await supabase
        .from("fee_structures")
        .select(`
          id,
          name,
          classes,
          fee_components (
            id,
            name,
            amount,
            frequency
          )
        `)
        .order("created_at", { ascending: false });

      if (structuresError) throw structuresError;

      // Fetch discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from("discounts")
        .select("*")
        .order("created_at", { ascending: false });

      if (discountsError) throw discountsError;

      setFeeStructures(structures || []);
      setDiscounts(discountsData || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load fee data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (type: "structure" | "discount", item: { id: string; name: string }) => {
    setDeleteType(type);
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setDeleteLoading(true);
    try {
      const table = deleteType === "structure" ? "fee_structures" : "discounts";
      const { error } = await supabase.from(table).delete().eq("id", selectedItem.id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: `${selectedItem.name} has been removed.`,
      });

      fetchData();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      console.error("Error deleting:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const calculateTotals = (components: FeeComponent[]) => {
    let monthly = 0;
    let annual = 0;

    components.forEach((c) => {
      const amount = Number(c.amount);
      if (c.frequency === "monthly") {
        monthly += amount;
        annual += amount * 12;
      } else if (c.frequency === "quarterly") {
        annual += amount * 4;
      } else if (c.frequency === "annual") {
        annual += amount;
      }
    });

    return { monthly, annual };
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Fee Structure</h1>
              <p className="mt-1 text-muted-foreground">
                Manage fee components, discounts, and payment schedules
              </p>
            </div>
            <Button variant="secondary" className="gap-2" onClick={() => setAddStructureOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Fee Structure
            </Button>
          </div>
        </header>

        {/* Fee Structures Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-secondary" />
              <p className="text-muted-foreground">Loading fee structures...</p>
            </div>
          </div>
        ) : feeStructures.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/50 mb-8">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">No fee structures</h3>
            <p className="text-muted-foreground mb-4">Create your first fee structure to get started</p>
            <Button variant="secondary" onClick={() => setAddStructureOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {feeStructures.map((structure, idx) => {
              const totals = calculateTotals(structure.fee_components);
              return (
                <Card
                  key={structure.id}
                  className="overflow-hidden hover-lift animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="font-display text-lg">{structure.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {structure.classes.map((cls) => (
                            <Badge key={cls} variant="secondary" className="text-xs">
                              Class {cls}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteClick("structure", { id: structure.id, name: structure.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {structure.fee_components.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No fee components added</p>
                    ) : (
                      <div className="space-y-3">
                        {structure.fee_components.map((component) => (
                          <div
                            key={component.id}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-foreground">{component.name}</span>
                              <span
                                className={cn(
                                  "text-xs px-2 py-0.5 rounded-full capitalize",
                                  frequencyColors[component.frequency] || "bg-muted text-muted-foreground"
                                )}
                              >
                                {component.frequency}
                              </span>
                            </div>
                            <span className="font-semibold text-foreground">
                              ₹{Number(component.amount).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-border flex justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                        <p className="font-display font-bold text-lg text-foreground">
                          ₹{totals.monthly.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Annual Total</p>
                        <p className="font-display font-bold text-lg text-secondary">
                          ₹{totals.annual.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Discounts Section */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Discounts & Concessions</h2>
            <Button variant="outline" className="gap-2" onClick={() => setAddDiscountOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Discount
            </Button>
          </div>
          <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden">
            {discounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No discounts configured</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Discount Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Applicability
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {discounts.map((discount) => (
                    <tr key={discount.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-foreground">{discount.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-sm text-muted-foreground">{discount.discount_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-foreground">
                          {discount.discount_type === "percentage" ? `${discount.value}%` : `₹${discount.value}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{discount.applicability || "-"}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteClick("discount", { id: discount.id, name: discount.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AddFeeStructureDialog
        open={addStructureOpen}
        onOpenChange={setAddStructureOpen}
        onSuccess={fetchData}
      />

      <AddDiscountDialog
        open={addDiscountOpen}
        onOpenChange={setAddDiscountOpen}
        onSuccess={fetchData}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title={`Delete ${deleteType === "structure" ? "Fee Structure" : "Discount"}`}
        description={`Are you sure you want to delete "${selectedItem?.name}"? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}
