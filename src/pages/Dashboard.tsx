// src/pages/Dashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Clock, FileText, ArrowRight } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";

const projects = [
  { id: 1, name: "E-Commerce Replatforming", status: "Analyzed", date: "2 hrs ago", tasks: 24 },
  { id: 2, name: "Fintech Mobile App", status: "Processing", date: "1 day ago", tasks: 0 },
  { id: 3, name: "Internal CRM Dashboard", status: "Draft", date: "3 days ago", tasks: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    // In a real app, you'd save to the DB here. For now, we route to the upload page.
    setIsDialogOpen(false);
    navigate(`/dashboard/upload`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-zinc-400 mt-1">Manage your architecture translations.</p>
        </div>
        
        {/* New Project Dialog */}
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
                    className="bg-zinc-950 border-zinc-800 focus-visible:ring-primary-500"
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

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.id} 
            onClick={() => navigate('/dashboard/code')} 
            className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
          >
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{project.name}</CardTitle>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  project.status === 'Analyzed' ? 'bg-green-500/10 text-green-400' :
                  project.status === 'Processing' ? 'bg-primary-500/10 text-primary-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {project.status}
                </span>
              </div>
              <CardDescription className="flex items-center gap-1 text-zinc-500 mt-2">
                <Clock className="w-3 h-3" />
                Updated {project.date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <FileText className="w-4 h-4" />
                  {project.tasks > 0 ? `${project.tasks} Tasks Generated` : "Awaiting PRD"}
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}