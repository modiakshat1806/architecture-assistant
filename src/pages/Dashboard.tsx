// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, FileText, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; // <-- ADDED SUPABASE

const projects = [
  { id: 1, name: "E-Commerce Replatforming", status: "Analyzed", date: "2 hrs ago", tasks: 24 },
  { id: 2, name: "Fintech Mobile App", status: "Processing", date: "1 day ago", tasks: 0 },
  { id: 3, name: "Internal CRM Dashboard", status: "Draft", date: "3 days ago", tasks: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("Developer"); // <-- ADDED NAME STATE

  // Fetch the logged in user's name
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserName(user.user_metadata?.full_name || "Developer");
      } else {
        navigate("/auth"); // Redirect if not logged in
      }
    };
    fetchUser();
  }, [navigate]);

  const handleCreateProject = (e: React.FormEvent) => {
  e.preventDefault();
  if (!newProjectName.trim()) return;
  
  setIsDialogOpen(false);
  // We pass the name so the Upload page knows which project this file belongs to
  navigate(`/dashboard/upload`, { state: { projectName: newProjectName } });
};

  const handleViewAll = (section: string) => {
    toast({ title: `Opening ${section}`, description: "This feature is coming in the next update." });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, {userName}</h1>
          <p className="text-zinc-400 mt-1">Manage your architecture translations.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:brightness-110 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[425px]">
            <form onSubmit={handleCreateProject}>
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription className="text-zinc-400">Give your project a name to get started.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="bg-zinc-950 border-zinc-800 text-white" autoFocus />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                <Button type="submit" className="bg-primary text-white" disabled={!newProjectName.trim()}>Continue to Upload</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Keep the rest of your UI exactly the same! */}
      {/* ... */}
    </DashboardLayout>
  );
}