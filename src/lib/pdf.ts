import { supabase } from "@/integrations/supabase/client";

export async function generateInvoicePDF(invoiceId: string): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-pdf", {
      body: {
        type: "invoice",
        data: { invoiceId },
      },
    });

    if (error) throw error;

    if (data?.html) {
      // Open HTML in new window for printing/saving as PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.focus();
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw error;
  }
}

export async function generateReport(
  reportType: "daily-collection" | "monthly-collection" | "pending-fees" | "class-wise",
  options?: {
    startDate?: string;
    endDate?: string;
    classFilter?: string;
  }
): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-pdf", {
      body: {
        type: "report",
        data: {
          reportType,
          ...options,
        },
      },
    });

    if (error) throw error;

    if (data?.html) {
      // Open HTML in new window for printing/saving as PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(data.html);
        printWindow.document.close();
        printWindow.focus();
        // Auto-trigger print dialog after a short delay
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    }
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}
