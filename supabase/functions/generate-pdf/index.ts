import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceData {
  invoiceId: string;
}

interface ReportData {
  reportType: "daily-collection" | "monthly-collection" | "pending-fees" | "class-wise";
  startDate?: string;
  endDate?: string;
  classFilter?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { type, data } = await req.json();
    console.log("PDF generation request:", { type, data });

    let pdfContent = "";
    let fileName = "";

    if (type === "invoice") {
      const invoiceData = data as InvoiceData;
      
      // Fetch invoice with student details
      const { data: invoice, error: invoiceError } = await supabaseClient
        .from("invoices")
        .select(`
          *,
          students (
            first_name,
            last_name,
            admission_number,
            class,
            section,
            parent_name,
            parent_phone,
            parent_email
          ),
          invoice_items (
            description,
            amount
          )
        `)
        .eq("id", invoiceData.invoiceId)
        .maybeSingle();

      if (invoiceError) {
        console.error("Error fetching invoice:", invoiceError);
        throw new Error("Failed to fetch invoice details");
      }

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      fileName = `invoice_${invoice.invoice_number}.html`;
      
      // Generate invoice HTML
      pdfContent = generateInvoiceHTML(invoice);
      
    } else if (type === "report") {
      const reportData = data as ReportData;
      
      let reportHTML = "";
      const today = new Date().toISOString().split("T")[0];
      
      switch (reportData.reportType) {
        case "daily-collection":
          const { data: dailyPayments } = await supabaseClient
            .from("payments")
            .select(`
              *,
              invoices (
                invoice_number,
                students (
                  first_name,
                  last_name,
                  class,
                  section
                )
              )
            `)
            .gte("created_at", `${reportData.startDate || today}T00:00:00`)
            .lte("created_at", `${reportData.startDate || today}T23:59:59`)
            .eq("status", "completed");
          
          fileName = `daily_collection_${reportData.startDate || today}.html`;
          reportHTML = generateDailyCollectionHTML(dailyPayments || [], reportData.startDate || today);
          break;

        case "pending-fees":
          const { data: pendingInvoices } = await supabaseClient
            .from("invoices")
            .select(`
              *,
              students (
                first_name,
                last_name,
                admission_number,
                class,
                section,
                parent_name,
                parent_phone
              )
            `)
            .in("status", ["pending", "partial", "overdue"]);
          
          fileName = `pending_fees_${today}.html`;
          reportHTML = generatePendingFeesHTML(pendingInvoices || [], today);
          break;

        case "class-wise":
          const { data: classPayments } = await supabaseClient
            .from("payments")
            .select(`
              amount,
              status,
              invoices (
                students (
                  class
                )
              )
            `)
            .eq("status", "completed");
          
          fileName = `class_wise_collection_${today}.html`;
          reportHTML = generateClassWiseHTML(classPayments || [], today);
          break;

        default:
          throw new Error("Invalid report type");
      }
      
      pdfContent = reportHTML;
    } else {
      throw new Error("Invalid type specified");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        html: pdfContent,
        fileName 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in generate-pdf function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateInvoiceHTML(invoice: any): string {
  const student = invoice.students;
  const items = invoice.invoice_items || [];
  const balance = invoice.amount - invoice.paid_amount;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #f8f9fa; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #1a365d; }
    .logo { font-size: 28px; font-weight: 700; color: #1a365d; }
    .logo-sub { font-size: 12px; color: #666; }
    .invoice-details { text-align: right; }
    .invoice-number { font-size: 24px; font-weight: 600; color: #1a365d; }
    .invoice-date { color: #666; margin-top: 8px; }
    .status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-top: 8px; }
    .status-paid { background: #d4edda; color: #155724; }
    .status-pending { background: #fff3cd; color: #856404; }
    .status-overdue { background: #f8d7da; color: #721c24; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
    .party h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 12px; letter-spacing: 1px; }
    .party p { margin: 4px 0; color: #333; }
    .party .name { font-weight: 600; font-size: 18px; color: #1a365d; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #1a365d; color: white; padding: 14px; text-align: left; font-weight: 500; }
    td { padding: 14px; border-bottom: 1px solid #eee; }
    tr:last-child td { border-bottom: none; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 300px; }
    .totals-table tr td { padding: 10px 14px; }
    .totals-table tr:last-child { background: #1a365d; color: white; font-weight: 600; }
    .totals-table tr:last-child td { border-radius: 6px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }
    @media print { body { padding: 0; background: white; } .invoice { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="logo">EduBill</div>
        <div class="logo-sub">School Billing System</div>
      </div>
      <div class="invoice-details">
        <div class="invoice-number">${invoice.invoice_number}</div>
        <div class="invoice-date">Issue Date: ${new Date(invoice.created_at).toLocaleDateString()}</div>
        <div class="invoice-date">Due Date: ${new Date(invoice.due_date).toLocaleDateString()}</div>
        <div class="status status-${invoice.status}">${invoice.status}</div>
      </div>
    </div>
    
    <div class="parties">
      <div class="party">
        <h3>Bill To</h3>
        <p class="name">${student.first_name} ${student.last_name}</p>
        <p>Admission No: ${student.admission_number}</p>
        <p>Class: ${student.class}-${student.section}</p>
        <p>Parent: ${student.parent_name}</p>
        <p>${student.parent_phone}</p>
        ${student.parent_email ? `<p>${student.parent_email}</p>` : ""}
      </div>
      <div class="party">
        <h3>From</h3>
        <p class="name">Delhi Public School</p>
        <p>123 Education Street</p>
        <p>New Delhi, 110001</p>
        <p>Phone: +91 11 2345 6789</p>
        <p>admin@dps.edu</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map((item: any, idx: number) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.description}</td>
            <td style="text-align: right;">₹${Number(item.amount).toLocaleString()}</td>
          </tr>
        `).join("") : `
          <tr>
            <td>1</td>
            <td>${invoice.description || "Fee Payment"}</td>
            <td style="text-align: right;">₹${Number(invoice.amount).toLocaleString()}</td>
          </tr>
        `}
      </tbody>
    </table>
    
    <div class="totals">
      <table class="totals-table">
        <tr>
          <td>Subtotal</td>
          <td style="text-align: right;">₹${Number(invoice.amount).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Paid Amount</td>
          <td style="text-align: right;">₹${Number(invoice.paid_amount).toLocaleString()}</td>
        </tr>
        <tr>
          <td>Balance Due</td>
          <td style="text-align: right;">₹${balance.toLocaleString()}</td>
        </tr>
      </table>
    </div>
    
    <div class="footer">
      <p>Thank you for your payment. For any queries, contact the accounts department.</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateDailyCollectionHTML(payments: any[], date: string): string {
  const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Daily Collection Report - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
    .report { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1a365d; }
    .header h1 { color: #1a365d; font-size: 24px; }
    .header p { color: #666; margin-top: 8px; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
    .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
    .summary-card h3 { color: #666; font-size: 12px; text-transform: uppercase; }
    .summary-card p { font-size: 28px; font-weight: 700; color: #1a365d; margin-top: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a365d; color: white; padding: 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #eee; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>Daily Collection Report</h1>
      <p>Date: ${new Date(date).toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
      <div class="summary-card">
        <h3>Total Transactions</h3>
        <p>${payments.length}</p>
      </div>
      <div class="summary-card">
        <h3>Total Collection</h3>
        <p>₹${total.toLocaleString()}</p>
      </div>
      <div class="summary-card">
        <h3>Report Generated</h3>
        <p>${new Date().toLocaleTimeString()}</p>
      </div>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Student</th>
          <th>Class</th>
          <th>Invoice</th>
          <th>Method</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${payments.map(p => `
          <tr>
            <td>${p.transaction_id}</td>
            <td>${p.invoices?.students?.first_name} ${p.invoices?.students?.last_name}</td>
            <td>${p.invoices?.students?.class}-${p.invoices?.students?.section}</td>
            <td>${p.invoices?.invoice_number}</td>
            <td>${p.payment_method?.toUpperCase()}</td>
            <td style="text-align: right;">₹${Number(p.amount).toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    
    <div class="footer">
      <p>Generated by EduBill School Billing System</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePendingFeesHTML(invoices: any[], date: string): string {
  const total = invoices.reduce((sum, i) => sum + (Number(i.amount) - Number(i.paid_amount)), 0);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pending Fees Report - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
    .report { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1a365d; }
    .header h1 { color: #1a365d; font-size: 24px; }
    .header p { color: #666; margin-top: 8px; }
    .summary { background: #fff3cd; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
    .summary h2 { color: #856404; font-size: 32px; }
    .summary p { color: #856404; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a365d; color: white; padding: 12px; text-align: left; font-size: 12px; }
    td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
    .status { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .status-pending { background: #e2e8f0; color: #4a5568; }
    .status-partial { background: #fef3c7; color: #92400e; }
    .status-overdue { background: #fee2e2; color: #991b1b; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>Pending Fees Report</h1>
      <p>As of: ${new Date(date).toLocaleDateString()}</p>
    </div>
    
    <div class="summary">
      <p>Total Outstanding Amount</p>
      <h2>₹${total.toLocaleString()}</h2>
      <p>${invoices.length} invoices pending</p>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Invoice</th>
          <th>Student</th>
          <th>Class</th>
          <th>Parent</th>
          <th>Contact</th>
          <th>Due Date</th>
          <th>Status</th>
          <th style="text-align: right;">Balance</th>
        </tr>
      </thead>
      <tbody>
        ${invoices.map(i => `
          <tr>
            <td>${i.invoice_number}</td>
            <td>${i.students?.first_name} ${i.students?.last_name}</td>
            <td>${i.students?.class}-${i.students?.section}</td>
            <td>${i.students?.parent_name}</td>
            <td>${i.students?.parent_phone}</td>
            <td>${new Date(i.due_date).toLocaleDateString()}</td>
            <td><span class="status status-${i.status}">${i.status}</span></td>
            <td style="text-align: right;">₹${(Number(i.amount) - Number(i.paid_amount)).toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    
    <div class="footer">
      <p>Generated by EduBill School Billing System</p>
    </div>
  </div>
</body>
</html>
  `;
}

function generateClassWiseHTML(payments: any[], date: string): string {
  // Group by class
  const classData: Record<string, number> = {};
  payments.forEach(p => {
    const className = p.invoices?.students?.class || "Unknown";
    classData[className] = (classData[className] || 0) + Number(p.amount);
  });
  
  const sortedClasses = Object.entries(classData).sort((a, b) => b[1] - a[1]);
  const total = sortedClasses.reduce((sum, [, amount]) => sum + amount, 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Class-wise Collection Report - ${date}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; padding: 40px; }
    .report { max-width: 700px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #1a365d; }
    .header h1 { color: #1a365d; font-size: 24px; }
    .header p { color: #666; margin-top: 8px; }
    .total { background: linear-gradient(135deg, #1a365d, #2d4a7c); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
    .total h2 { font-size: 36px; }
    .total p { opacity: 0.8; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1a365d; color: white; padding: 14px; text-align: left; }
    td { padding: 14px; border-bottom: 1px solid #eee; }
    .bar { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, #1a9d8f, #38b2ac); border-radius: 4px; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="report">
    <div class="header">
      <h1>Class-wise Collection Report</h1>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="total">
      <p>Total Collection</p>
      <h2>₹${total.toLocaleString()}</h2>
    </div>
    
    <table>
      <thead>
        <tr>
          <th>Class</th>
          <th>Collection</th>
          <th style="width: 30%;">Distribution</th>
        </tr>
      </thead>
      <tbody>
        ${sortedClasses.map(([className, amount]) => `
          <tr>
            <td><strong>Class ${className}</strong></td>
            <td>₹${amount.toLocaleString()}</td>
            <td>
              <div class="bar">
                <div class="bar-fill" style="width: ${(amount / total * 100).toFixed(1)}%"></div>
              </div>
              <small style="color: #666;">${(amount / total * 100).toFixed(1)}%</small>
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
    
    <div class="footer">
      <p>Generated by EduBill School Billing System</p>
    </div>
  </div>
</body>
</html>
  `;
}
