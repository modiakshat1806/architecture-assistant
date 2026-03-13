// src/pages/Dashboard.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, FileText, ArrowRight, Activity, Eye, RefreshCcw, CheckCircle2, ListTodo } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // <-- ADDED TOAST IMPORT

const projects = [
  { id: 1, name: "E-Commerce Replatforming", status: "Analyzed", date: "2 hrs ago", tasks: 24 },
  { id: 2, name: "Fintech Mobile App", status: "Processing", date: "1 day ago", tasks: 0 },
  { id: 3, name: "Internal CRM Dashboard", status: "Draft", date: "3 days ago", tasks: 0 },
];

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
  {
    id: 2,
    project: "E-Commerce Replatforming",
    type: "ANALYSIS_COMPLETE",
    description: "Feature extraction completed for checkout flows.",
    timestamp: "2 hours ago",
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10"
  },
  {
    id: 3,
    project: "E-Commerce Replatforming",
    type: "TASK_GEN",
    description: "24 new architectural tasks generated for Sprint 4.",
    timestamp: "2 hours ago",
    icon: ListTodo,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    id: 4,
    project: "Fintech Mobile App",
    type: "PRD_UPDATE",
    description: "Awaiting PRD upload and queued for processing.",
    timestamp: "1 day ago",
    icon: FileText,
    color: "text-zinc-400",
    bg: "bg-zinc-800"
  },
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

  const handlePRDAction = (projectId: number, action: string) => {
    toast({
      title: `${action} for Project #${projectId}`,
      description: `Navigating to ${action.toLowerCase()} flow...`
    });
    // For Demo: Navigate to upload for update, or show a simple toast for view
    if (action === "Update PRD") {
      navigate('/dashboard/upload');
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Project Workspace</h1>
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
              // REDIRECT TO OVERVIEW
              onClick={() => project.status === 'Analyzed' ? navigate('/dashboard/overview') : navigate('/dashboard/upload')}
              className="bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-all cursor-pointer group"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg group-hover:text-primary transition-colors">{project.name}</CardTitle>
                  <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider ${project.status === 'Analyzed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
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

                {/* PRD ACTIONS */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 h-8 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={project.tasks === 0}
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
                    className="bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2 h-8 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                    disabled={project.tasks === 0}
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
      </section>

      {/* Project Overview Quick Summary (NEW) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Latest Project Overview</h2>
          <Button variant="link" className="text-primary hover:text-primary/80 p-0 h-auto font-medium" onClick={() => navigate('/dashboard/overview')}>
            View full details
          </Button>
        </div>
        <Card className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-zinc-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-2">E-Commerce Replatforming</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Migrating legacy monolith to distributed microservices on AWS. Health score is optimal, mapping is 85% complete.
              </p>
              <div className="flex gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20">High Complexity</Badge>
                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">156 Tasks</Badge>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-zinc-800 pl-6">
              <span className="text-xs text-zinc-500 uppercase font-black mb-1">Health</span>
              <span className="text-3xl font-black text-primary">92%</span>
            </div>
            <div className="flex flex-col items-center justify-center border-l border-zinc-800 pl-6">
              <span className="text-xs text-zinc-500 uppercase font-black mb-1">Completeness</span>
              <span className="text-3xl font-black text-blue-400">85%</span>
            </div>
          </div>
        </Card>
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

        <div className="space-y-3">
          {recentActivity.map((item) => (
            <Card key={item.id} className="bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 transition-colors p-4 group">
              <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-lg ${item.bg} ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{item.project}</h4>
                    <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed truncate group-hover:text-zinc-300 transition-colors">
                    {item.description}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => navigate('/dashboard/analysis')}>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}