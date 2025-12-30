import { useState } from "react";
import { Search, Filter, UserPlus, Download, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const students = [
  { id: "STU001", name: "Aarav Sharma", class: "10-A", admNo: "2024001", parent: "Rajesh Sharma", phone: "+91 98765 43210", status: "active", fees: "paid" },
  { id: "STU002", name: "Priya Patel", class: "8-B", admNo: "2024015", parent: "Amit Patel", phone: "+91 98765 43211", status: "active", fees: "partial" },
  { id: "STU003", name: "Rohan Kumar", class: "12-A", admNo: "2022089", parent: "Vijay Kumar", phone: "+91 98765 43212", status: "active", fees: "pending" },
  { id: "STU004", name: "Ananya Singh", class: "6-C", admNo: "2024102", parent: "Deepak Singh", phone: "+91 98765 43213", status: "active", fees: "paid" },
  { id: "STU005", name: "Vikram Reddy", class: "9-A", admNo: "2023045", parent: "Krishna Reddy", phone: "+91 98765 43214", status: "inactive", fees: "pending" },
  { id: "STU006", name: "Sneha Gupta", class: "11-B", admNo: "2023078", parent: "Rakesh Gupta", phone: "+91 98765 43215", status: "active", fees: "paid" },
  { id: "STU007", name: "Arjun Nair", class: "7-A", admNo: "2024056", parent: "Suresh Nair", phone: "+91 98765 43216", status: "active", fees: "partial" },
  { id: "STU008", name: "Kavya Iyer", class: "10-B", admNo: "2023112", parent: "Venkat Iyer", phone: "+91 98765 43217", status: "active", fees: "paid" },
];

const feeStatusConfig = {
  paid: { label: "Paid", color: "bg-success/10 text-success" },
  partial: { label: "Partial", color: "bg-warning/10 text-warning" },
  pending: { label: "Pending", color: "bg-destructive/10 text-destructive" },
};

export default function Students() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.class.startsWith(classFilter);
    return matchesSearch && matchesClass;
  });

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Students</h1>
              <p className="mt-1 text-muted-foreground">
                Manage all student records and information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="secondary" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Student
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or admission number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="6">Class 6</SelectItem>
              <SelectItem value="7">Class 7</SelectItem>
              <SelectItem value="8">Class 8</SelectItem>
              <SelectItem value="9">Class 9</SelectItem>
              <SelectItem value="10">Class 10</SelectItem>
              <SelectItem value="11">Class 11</SelectItem>
              <SelectItem value="12">Class 12</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            More Filters
          </Button>
        </div>

        {/* Students Table */}
        <div className="rounded-xl bg-card border border-border/50 shadow-md overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Admission No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Parent/Guardian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Fee Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStudents.map((student) => {
                  const feeStatus = feeStatusConfig[student.fees as keyof typeof feeStatusConfig];
                  return (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">
                              {student.name.split(" ").map((n) => n[0]).join("")}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className={cn(
                              "text-xs",
                              student.status === "active" ? "text-success" : "text-muted-foreground"
                            )}>
                              {student.status === "active" ? "● Active" : "○ Inactive"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-foreground">{student.admNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-muted text-sm font-medium text-foreground">
                          {student.class}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-foreground">{student.parent}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{student.phone}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                          feeStatus.color
                        )}>
                          {feeStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{filteredStudents.length}</span> of{" "}
              <span className="font-medium">1,547</span> students
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
