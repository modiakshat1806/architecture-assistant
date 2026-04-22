// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, FileText, ArrowRight, Activity, ListTodo, RefreshCcw, CheckCircle2, Eye, Badge, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase"; 

// Keep recent activity mocked for now, or update it later
const recentActivity = [
  {
    id: 1,
    project: "E-Commerce Replatforming",
    type: "PRD_UPDATE",
    description: "PRD updated: Added 'Loyalty Points' logic.",
    timestamp: "12 mins ago",
    icon: RefreshCcw,
    color: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  // ... other mock activities
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("Developer"); 
  
  // ---> ADDED: States for real projects
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  // Fetch the logged in user's name AND their real projects
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      setIsLoadingProjects(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log("User ID:", user.id); // Debug: Check user ID
        setUserName(user.user_metadata?.full_name || "Developer");
        
        // Fetch real projects from Supabase database
        // Changed table name to lowercase 'projects' (adjust if your schema differs)
        const { data, error } = await supabase
          .from('Project')        // <-- Matches Prisma schema
          .select('*')
          .eq('profileId', user.id)  // <-- Matches Prisma schema
          .order('updatedAt', { ascending: false });

        console.log("Fetched projects:", data, "Error:", error); // Debug: Check results

        if (error) {
          console.error("Error fetching projects:", error);
        } else if (data) {
          setProjects(data);
        }
      } else {
        navigate("/auth"); // Redirect if not logged in
      }
      setIsLoadingProjects(false);
    };
    
    fetchUserAndProjects();
  }, [navigate]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsDialogOpen(false);
    navigate(`/dashboard/upload`, { state: { projectName: newProjectName } });
  };

  const handleViewAll = (section: string) => {
    toast({ title: `Opening ${section}`, description: "This feature is coming in the next update." });
  };

  const handlePRDAction = (projectId: string, action: string) => {
    toast({ title: `${action}`, description: `Navigating to ${action.toLowerCase()} flow...` });
    if (action === "Update PRD") navigate('/dashboard/upload');
    if (action === "View PRD") navigate('/dashboard/overview');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Workspace</h1>
          <p className="text-zinc-400 mt-1">Manage your architecture translations, {userName}.</p>
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
                  <Input
                    id="name"
                    placeholder="e.g., Auth Microservice Refactor"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-primary text-white"
                    autoFocus
                  />
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

      {/* Active Projects Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Projects</h2>
        </div>

        {isLoadingProjects ? (
          <div className="flex items-center justify-center p-12 border border-zinc-800 rounded-lg bg-zinc-900/50">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
            <p className="text-zinc-500 mb-4">You haven't created any projects yet.</p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-zinc-700 text-white bg-zinc-800 hover:bg-zinc-700">
              Create your first project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card
                key={project.id}
                onClick={() => navigate('/dashboard/overview')}
                className="bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-all cursor-pointer group"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-white text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                    <span className="text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20">
                      Active
                    </span>
                  </div>
                  <CardDescription className="flex items-center gap-1.5 text-zinc-500 mt-2">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                      <FileText className="w-4 h-4 text-zinc-500" />
                      <span className="text-white font-medium">View Analysis</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePRDAction(project.id, "View PRD");
                      }}
                    >
                      <Eye className="w-3 h-3" /> View PRD
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePRDAction(project.id, "Update PRD");
                      }}
                    >
                      <RefreshCcw className="w-3 h-3" /> Update PRD
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ... (The rest of your Overview/Recent Activity sections remain exactly the same) ... */}
    </DashboardLayout>
  );
}