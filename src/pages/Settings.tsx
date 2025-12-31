import { useState, useEffect } from "react";
import { Building2, Users, Shield, Bell, CreditCard, Database, Save, Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { ConfigureRoleDialog } from "@/components/settings/ConfigureRoleDialog";
import { useToast } from "@/hooks/use-toast";

const roleDefinitions = [
  { id: "admin", name: "Admin", description: "Full access to all modules", color: "bg-primary/10 text-primary" },
  { id: "accountant", name: "Accountant", description: "Billing and reports access", color: "bg-secondary/10 text-secondary" },
  { id: "staff", name: "Staff", description: "View-only access", color: "bg-muted text-muted-foreground" },
];

export default function Settings() {
  const [schoolName, setSchoolName] = useState("Delhi Public School");
  const [email, setEmail] = useState("admin@dps.edu");
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [selectedRole, setSelectedRole] = useState<typeof roleDefinitions[0] | null>(null);
  const [configureDialogOpen, setConfigureDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoleCounts();
  }, []);

  const fetchRoleCounts = async () => {
    setLoadingRoles(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role");

      if (error) throw error;

      // Count users per role
      const counts: Record<string, number> = {};
      (data || []).forEach((item: { role: string }) => {
        counts[item.role] = (counts[item.role] || 0) + 1;
      });
      setRoleCounts(counts);
    } catch (error: any) {
      console.error("Error fetching role counts:", error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleConfigureRole = (role: typeof roleDefinitions[0]) => {
    setSelectedRole(role);
    setConfigureDialogOpen(true);
  };

  const handleSaveSchoolInfo = () => {
    toast({
      title: "Settings saved",
      description: "School information has been updated",
    });
  };

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Configure system preferences and user access
          </p>
        </header>

        <Tabs defaultValue="school" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 animate-slide-up">
            <TabsTrigger value="school" className="gap-2">
              <Building2 className="h-4 w-4" />
              School Info
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              User Roles
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payment" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Gateway
            </TabsTrigger>
          </TabsList>

          {/* School Info Tab */}
          <TabsContent value="school" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
                <CardDescription>Update your school's basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 11 2345 6789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliation">Affiliation Number</Label>
                    <Input id="affiliation" placeholder="CBSE/2024/XXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="Full school address" />
                </div>
                <Button variant="secondary" className="gap-2" onClick={handleSaveSchoolInfo}>
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Roles Tab */}
          <TabsContent value="roles" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>User Roles & Permissions</CardTitle>
                <CardDescription>Manage access levels for different user types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {roleDefinitions.map((role) => (
                    <div
                      key={role.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", role.color)}>
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{role.name}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {loadingRoles ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            `${roleCounts[role.id] || 0} users`
                          )}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleConfigureRole(role)}
                        >
                          Configure
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure automated alerts and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { id: "invoice", label: "Invoice Generated", description: "Send email when new invoice is created" },
                  { id: "payment", label: "Payment Received", description: "Notify on successful payment" },
                  { id: "reminder", label: "Fee Reminders", description: "Automatic reminders for pending fees" },
                  { id: "overdue", label: "Overdue Alerts", description: "Alert when payment becomes overdue" },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Gateway Tab */}
          <TabsContent value="payment" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
                <CardDescription>Connect Razorpay for online payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg border border-secondary/30 bg-secondary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Razorpay</p>
                      <p className="text-sm text-muted-foreground">UPI, Cards, Net Banking</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rzpKey">API Key</Label>
                      <Input id="rzpKey" placeholder="rzp_live_xxxxxxxx" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rzpSecret">API Secret</Label>
                      <Input id="rzpSecret" placeholder="xxxxxxxxxxxxxxxx" type="password" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Test Mode</p>
                    <p className="text-sm text-muted-foreground">Use test credentials for development</p>
                  </div>
                  <Switch />
                </div>
                <Button variant="secondary" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Configure Role Dialog */}
        {selectedRole && (
          <ConfigureRoleDialog
            open={configureDialogOpen}
            onOpenChange={setConfigureDialogOpen}
            role={selectedRole}
            onUpdate={fetchRoleCounts}
          />
        )}
      </div>
    </DashboardLayout>
  );
}