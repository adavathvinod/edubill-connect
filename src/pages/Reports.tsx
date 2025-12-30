import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Users, IndianRupee, PieChart, BarChart3, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateReport } from "@/lib/pdf";
import { useToast } from "@/hooks/use-toast";

const reportTypes = [
  {
    id: "daily-collection",
    title: "Daily Collection Report",
    description: "Summary of all payments received on a specific date",
    icon: IndianRupee,
    color: "bg-success/10 text-success",
    formats: ["PDF", "Print"],
    needsDate: true,
  },
  {
    id: "pending-fees",
    title: "Pending Fees Report",
    description: "List of all outstanding fee payments",
    icon: FileText,
    color: "bg-warning/10 text-warning",
    formats: ["PDF", "Print"],
    needsDate: false,
  },
  {
    id: "class-wise",
    title: "Class-wise Collection",
    description: "Fee collection summary by class",
    icon: BarChart3,
    color: "bg-accent/10 text-accent",
    formats: ["PDF", "Print"],
    needsDate: false,
  },
];

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = async (reportId: string) => {
    setLoadingReport(reportId);
    try {
      await generateReport(
        reportId as "daily-collection" | "pending-fees" | "class-wise",
        { startDate: selectedDate }
      );
      toast({
        title: "Report generated",
        description: "The report has been opened in a new window for printing.",
      });
    } catch (error: any) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Reports</h1>
              <p className="mt-1 text-muted-foreground">
                Generate and download financial reports
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="report-date" className="text-sm text-muted-foreground">Date:</Label>
                <Input
                  id="report-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reportTypes.map((report, idx) => (
            <Card
              key={report.id}
              className="overflow-hidden hover-lift animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${report.color}`}>
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1">
                    {report.formats.map((format) => (
                      <span
                        key={format}
                        className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={loadingReport === report.id}
                  >
                    {loadingReport === report.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {loadingReport === report.id ? "Generating..." : "Generate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="animate-slide-up" style={{ animationDelay: "400ms" }}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">
                  How Reports Work
                </h3>
                <p className="text-muted-foreground text-sm">
                  Click "Generate" to create a report. A new window will open with the formatted report.
                  Use your browser's print function (Ctrl/Cmd + P) to save as PDF or print directly.
                  Reports are generated from live database data and reflect the current state of your records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
