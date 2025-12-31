import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Trash2 } from "lucide-react";

interface UserWithRole {
  id: string;
  user_id: string;
  role: "admin" | "accountant" | "staff";
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  } | null;
}

interface ConfigureRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: {
    id: string;
    name: string;
    description: string;
  };
  onUpdate: () => void;
}

export function ConfigureRoleDialog({ open, onOpenChange, role, onUpdate }: ConfigureRoleDialogProps) {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [allProfiles, setAllProfiles] = useState<{ id: string; email: string; full_name: string | null }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchRoleUsers();
      fetchAllProfiles();
    }
  }, [open, role.id]);

  const fetchRoleUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq("role", role.id as "admin" | "accountant" | "staff");

      if (error) throw error;
      setUsers((data as unknown as UserWithRole[]) || []);
    } catch (error: any) {
      console.error("Error fetching role users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users for this role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (error) throw error;
      setAllProfiles(data || []);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) return;

    setAdding(true);
    try {
      // Check if user already has this role
      const existingRole = users.find(u => u.user_id === selectedUserId);
      if (existingRole) {
        toast({
          title: "Already assigned",
          description: "This user already has this role",
          variant: "destructive",
        });
        setAdding(false);
        return;
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: selectedUserId,
          role: role.id as "admin" | "accountant" | "staff",
        });

      if (error) throw error;

      toast({
        title: "User added",
        description: `User has been assigned the ${role.name} role`,
      });

      setSelectedUserId("");
      fetchRoleUsers();
      onUpdate();
    } catch (error: any) {
      console.error("Error adding user to role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add user to role",
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveUser = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "User removed",
        description: `User has been removed from the ${role.name} role`,
      });

      fetchRoleUsers();
      onUpdate();
    } catch (error: any) {
      console.error("Error removing user from role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove user from role",
        variant: "destructive",
      });
    }
  };

  // Filter out users who already have this role
  const availableProfiles = allProfiles.filter(
    p => !users.some(u => u.user_id === p.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure {role.name} Role</DialogTitle>
          <DialogDescription>{role.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add User Section */}
          <div className="space-y-3">
            <Label>Add User to This Role</Label>
            <div className="flex gap-2">
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.length === 0 ? (
                    <SelectItem value="none" disabled>No available users</SelectItem>
                  ) : (
                    availableProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.full_name || profile.email}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddUser} 
                disabled={!selectedUserId || adding}
                className="gap-2"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            <Label>Users with {role.name} Role ({users.length})</Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users have this role yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.profiles?.full_name || "N/A"}
                      </TableCell>
                      <TableCell>{user.profiles?.email || "N/A"}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Role Permissions Info */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-sm">Role Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {role.id === "admin" && (
                <>
                  <Badge variant="secondary">Full Access</Badge>
                  <Badge variant="secondary">Manage Users</Badge>
                  <Badge variant="secondary">Manage Settings</Badge>
                  <Badge variant="secondary">All Reports</Badge>
                </>
              )}
              {role.id === "accountant" && (
                <>
                  <Badge variant="secondary">Billing</Badge>
                  <Badge variant="secondary">Payments</Badge>
                  <Badge variant="secondary">Invoices</Badge>
                  <Badge variant="secondary">Reports</Badge>
                </>
              )}
              {role.id === "staff" && (
                <>
                  <Badge variant="secondary">View Students</Badge>
                  <Badge variant="secondary">View Invoices</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}