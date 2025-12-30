import { useState } from "react";
import { Plus, Edit, Trash2, Calendar, IndianRupee, Percent } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const feeStructures = [
  {
    id: "FS001",
    name: "Primary Classes (1-5)",
    classes: ["1", "2", "3", "4", "5"],
    components: [
      { name: "Tuition Fee", amount: 3000, frequency: "monthly" },
      { name: "Annual Charges", amount: 15000, frequency: "annual" },
      { name: "Computer Lab", amount: 500, frequency: "monthly" },
      { name: "Sports & Activities", amount: 2000, frequency: "quarterly" },
    ],
    totalMonthly: 3500,
    totalAnnual: 65000,
  },
  {
    id: "FS002",
    name: "Middle School (6-8)",
    classes: ["6", "7", "8"],
    components: [
      { name: "Tuition Fee", amount: 4000, frequency: "monthly" },
      { name: "Annual Charges", amount: 18000, frequency: "annual" },
      { name: "Computer Lab", amount: 600, frequency: "monthly" },
      { name: "Science Lab", amount: 400, frequency: "monthly" },
      { name: "Sports & Activities", amount: 2500, frequency: "quarterly" },
    ],
    totalMonthly: 5000,
    totalAnnual: 88000,
  },
  {
    id: "FS003",
    name: "Secondary (9-10)",
    classes: ["9", "10"],
    components: [
      { name: "Tuition Fee", amount: 5000, frequency: "monthly" },
      { name: "Annual Charges", amount: 20000, frequency: "annual" },
      { name: "Computer Lab", amount: 800, frequency: "monthly" },
      { name: "Science Lab", amount: 600, frequency: "monthly" },
      { name: "Board Exam Prep", amount: 3000, frequency: "quarterly" },
    ],
    totalMonthly: 6400,
    totalAnnual: 108800,
  },
  {
    id: "FS004",
    name: "Senior Secondary (11-12)",
    classes: ["11", "12"],
    components: [
      { name: "Tuition Fee", amount: 6000, frequency: "monthly" },
      { name: "Annual Charges", amount: 25000, frequency: "annual" },
      { name: "Computer Lab", amount: 1000, frequency: "monthly" },
      { name: "Science/Commerce Lab", amount: 800, frequency: "monthly" },
      { name: "Board Exam Prep", amount: 5000, frequency: "quarterly" },
    ],
    totalMonthly: 7800,
    totalAnnual: 143600,
  },
];

const discounts = [
  { id: "D001", name: "Sibling Discount", type: "percentage", value: 10, applicability: "Second child onwards" },
  { id: "D002", name: "Staff Ward", type: "percentage", value: 50, applicability: "School staff children" },
  { id: "D003", name: "Merit Scholarship", type: "percentage", value: 25, applicability: "Top 5% students" },
  { id: "D004", name: "Early Bird", type: "fixed", value: 2000, applicability: "Annual fee payment by April 30" },
];

const frequencyColors = {
  monthly: "bg-primary/10 text-primary",
  quarterly: "bg-secondary/10 text-secondary",
  annual: "bg-accent/10 text-accent",
};

export default function Fees() {
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
            <Button variant="secondary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Fee Structure
            </Button>
          </div>
        </header>

        {/* Fee Structures Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {feeStructures.map((structure, idx) => (
            <Card
              key={structure.id}
              className="overflow-hidden hover-lift animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-lg">{structure.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {structure.classes.map((cls) => (
                        <Badge key={cls} variant="secondary" className="text-xs">
                          Class {cls}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {structure.components.map((component) => (
                    <div
                      key={component.name}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground">{component.name}</span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            frequencyColors[component.frequency as keyof typeof frequencyColors]
                          )}
                        >
                          {component.frequency}
                        </span>
                      </div>
                      <span className="font-semibold text-foreground">
                        ₹{component.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="font-display font-bold text-lg text-foreground">
                      ₹{structure.totalMonthly.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Annual Total</p>
                    <p className="font-display font-bold text-lg text-secondary">
                      ₹{structure.totalAnnual.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Discounts Section */}
        <div className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-foreground">Discounts & Concessions</h2>
            <Button variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Discount
            </Button>
          </div>
          <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden">
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
                      <span className="inline-flex items-center gap-1.5">
                        {discount.type === "percentage" ? (
                          <Percent className="h-4 w-4 text-secondary" />
                        ) : (
                          <IndianRupee className="h-4 w-4 text-secondary" />
                        )}
                        <span className="capitalize text-sm text-muted-foreground">{discount.type}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-foreground">
                        {discount.type === "percentage" ? `${discount.value}%` : `₹${discount.value}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{discount.applicability}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
