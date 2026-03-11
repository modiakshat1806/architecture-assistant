// src/pages/Dashboard.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, FileText, ArrowRight, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // <-- ADDED TOAST IMPORT

const projects = [
  { id: 1, name: "E-Commerce Replatforming", status: "Analyzed", date: "2 hrs ago", tasks: 24 },
  { id: 2, name: "Fintech Mobile App", status: "Processing", date: "1 day ago", tasks: 0 },
  { id: 3, name: "Internal CRM Dashboard", status: "Draft", date: "3 days ago", tasks: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast(); // <-- INITIALIZED TOAST
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsDialogOpen(false);
    navigate(`/dashboard/upload`);
  };

  // Handler for dead links
  const handleViewAll = (section: string) => {
    toast({ 
      title: `Opening ${section}`, 
      description: "This feature is coming in the next update." 
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Overview</h1>
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
                <DialogDescription className="text-zinc-400">
                  Give your project a name to get started. You'll upload your PRD next.
                </DialogDescription>
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
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                  Cancel
                </Button>
                <Button type="submit" className="bg-primary hover:brightness-110 text-white" disabled={!newProjectName.trim()}>
                  Continue to Upload
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Projects Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Active Projects</h2>
          {/* WIRED VIEW ALL BUTTON */}
          <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-medium" onClick={() => handleViewAll("Projects directory")}>
            View all
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              // UX FIXED: Dynamic routing goes straight to analysis for analyzed projects!
              onClick={() => project.status === 'Analyzed' ? navigate('/dashboard/analysis') : navigate('/dashboard/upload')} 
              className="bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${
                    project.status === 'Analyzed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    project.status === 'Processing' ? 'bg-primary/10 text-primary border border-primary/20' :
                    'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <CardDescription className="flex items-center gap-1.5 text-zinc-500 mt-2">
                  <Clock className="w-3 h-3" />
                  Updated {project.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <FileText className="w-4 h-4 text-zinc-500" />
                    {project.tasks > 0 ? <span className="text-white font-medium">{project.tasks} Tasks Generated</span> : "Awaiting PRD"}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity Placeholder Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          {/* WIRED VIEW ALL BUTTON */}
          <Button variant="link" className="text-zinc-400 hover:text-white p-0 h-auto font-medium" onClick={() => handleViewAll("Activity logs")}>
            View all
          </Button>
        </div>
        
        <Card className="bg-zinc-900/50 border-zinc-800 border-dashed flex flex-col items-center justify-center py-12 text-center">
           <Activity className="w-8 h-8 text-zinc-600 mb-3" />
           <p className="text-zinc-400 text-sm font-medium">Your workspace activity will appear here.</p>
           <p className="text-zinc-500 text-xs mt-1">Upload a PRD to generate your first architecture flow.</p>
        </Card>
      </section>
    </DashboardLayout>
  );
}