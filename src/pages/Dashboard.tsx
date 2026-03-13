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

// Helper to get relative time
function getRelativeTime(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);

  if (diffInMins < 1) return "Just now";
  if (diffInMins < 60) return `${diffInMins} mins ago`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [newProjectName, setNewProjectName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userName, setUserName] = useState("Developer");

  // ---> ADDED: States for real projects
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  // Fetch the logged in user's name AND their real projects
  useEffect(() => {
    const fetchUserAndProjects = async () => {
      setIsLoadingProjects(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserName(user.user_metadata?.full_name || "Developer");

        // 1. Get projects from DB
        const { data: dbProjects, error } = await supabase
          .from('Project')
          .select('*')
          .eq('profileId', user.id)
          .order('updatedAt', { ascending: false });

        if (error) {
          console.error("Error fetching projects:", error);
        }

        let combinedProjects = dbProjects || [];

        // 2. Add local storage project as a fallback/current session
        const localRaw = localStorage.getItem("blueprint_project_data");
        if (localRaw) {
          try {
            const localData = JSON.parse(localRaw);
            // Check if this project (by name OR by real stored ID) is already in the DB list
            const alreadyExists = combinedProjects.some(p =>
              (localData.id && p.id === localData.id) || p.name === localData.projectName
            );

            if (!alreadyExists) {
              combinedProjects = [
                {
                  id: localData.id || 'local-session',
                  name: localData.projectName,
                  updatedAt: new Date().toISOString(),
                  isLocal: true,
                  healthScore: localData.healthScore?.score || 0,
                  stats: {
                    features: localData.features?.length || 0,
                    tasks: localData.tasks?.length || 0,
                  }
                },
                ...combinedProjects
              ];
            }
          } catch (e) {
            console.error("Error parsing local data", e);
          }
        }

        setProjects(combinedProjects);
      } else {
        navigate("/auth");
      }
      setIsLoadingProjects(false);
    };

    fetchUserAndProjects();
  }, [navigate]);

  // Fetch activities for all projects
  useEffect(() => {
    const fetchAllActivities = async () => {
      const dbProjectIds = projects.filter(p => !p.isLocal).map(p => p.id);
      let allActivities: any[] = [];

      for (const id of dbProjectIds) {
        try {
          const res = await fetch(`http://localhost:5000/api/projects/${id}/activities`);
          const data = await res.json();
          if (Array.isArray(data)) {
            const projectName = projects.find(p => p.id === id)?.name || "Project";
            allActivities = [...allActivities, ...data.map(a => ({ ...a, projectName }))];
          }
        } catch (e) {
          console.error("Error fetching activities", e);
        }
      }

      if (projects.some(p => p.isLocal)) {
        const localProject = projects.find(p => p.isLocal);
        
        // FETCH FROM LOCAL STORAGE
        const localActivitiesRaw = localStorage.getItem("blueprint_local_activities");
        const localActivities = localActivitiesRaw ? JSON.parse(localActivitiesRaw) : [];
        
        // Fallback for first-time session
        const defaultLocalActivities = [
          {
            id: 'local-1',
            type: 'ANALYSIS_COMPLETED',
            description: "Final architecture analysis ready.",
            projectName: localProject.name,
            createdAt: new Date().toISOString()
          },
          {
            id: 'local-2',
            type: 'PRD_UPLOADED',
            description: "Initial PRD interpreted.",
            projectName: localProject.name,
            createdAt: new Date(Date.now() - 120000).toISOString()
          }
        ];

        const combinedLocal = localActivities.length > 0 ? localActivities : defaultLocalActivities;
        allActivities = [...combinedLocal, ...allActivities];
      }

      allActivities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setActivities(allActivities.slice(0, 10)); // Top 10
    };

    if (projects.length > 0) {
      fetchAllActivities();
    }
  }, [projects]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsDialogOpen(false);
    navigate(`/dashboard/upload`, { state: { projectName: newProjectName } });
  };

  const handleViewAll = (section: string) => {
    toast({ title: `Opening ${section}`, description: "This feature is coming in the next update." });
  };

  const handlePRDAction = async (project: any, action: string) => {
    if (action === "Update PRD") {
      navigate('/dashboard/upload', { state: { projectName: project.name, isUpdateFlow: true } });
    }

    if (action === "View PRD") {
      const targetId = project.id;

      if (targetId === 'local-session') {
        toast({ title: "Local Session", description: "Save this project to enable cloud storage and PDF viewing." });
        return;
      }

      try {
        toast({ title: "Opening PRD", description: "Locating PDF file..." });
        const res = await fetch(`http://localhost:5000/api/projects/${targetId}/latest-prd`);
        const data = await res.json();
        if (data.fileUrl) {
          window.open(data.fileUrl, '_blank');
        } else {
          throw new Error("PDF not found");
        }
      } catch (e) {
        toast({ variant: "destructive", title: "Error", description: "Could not open original PDF." });
      }
    }
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
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider border ${project.isLocal
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                        }`}>
                        {project.isLocal ? "Currently Working" : "Active / Ready"}
                      </span>
                      {project.healthScore !== undefined && project.healthScore > 0 && (
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          Health: <span className="text-primary">{project.healthScore}%</span>
                        </span>
                      )}
                    </div>
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
                        handlePRDAction(project, "View PRD");
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
                        handlePRDAction(project, "Update PRD");
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

      {/* Recent Activity Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${activity.type === 'ANALYSIS_COMPLETED' ? 'bg-green-500/10' :
                      activity.type === 'PRD_UPDATED' ? 'bg-blue-500/10' : 'bg-primary/10'
                    }`}>
                    {activity.type === 'ANALYSIS_COMPLETED' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : activity.type === 'PRD_UPDATED' ? (
                      <RefreshCcw className="w-5 h-5 text-blue-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{activity.description}</p>
                    <p className="text-xs text-zinc-500">
                      {activity.projectName} • {getRelativeTime(activity.createdAt)}
                      {activity.metadata?.version && ` • Version ${activity.metadata.version}`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
              <p className="text-zinc-500">No project activity found yet.</p>
            </div>
          )}
        </div>
      </section>
    </DashboardLayout>
  );
}