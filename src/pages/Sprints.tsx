// src/pages/Sprints.tsx
import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRight,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  CircleDashed,
  GripVertical,
  BookOpen,
  RefreshCcw,
  X,
  ListTodo
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  status: string; // 'todo' | 'in-progress' | 'done'
  priority: string;
  type: string;
  points: number;
  story: string;
  assignee: string;
  description?: string;
}

export default function Sprints() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // --- EDITING STATE ---
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // --- DATA LOADING ---
  useEffect(() => {
    const raw = localStorage.getItem("blueprint_project_data");
    if (!raw) return;
    
    try {
      const data = JSON.parse(raw);
      const aiTasks = data.tasks || [];
      const aiStories = data.stories || [];

      // Map AI tasks to the Kanban board structure
      const formattedTasks = aiTasks.map((t: any, i: number) => {
        // Find the parent user story for context
        const parentStory = aiStories.find((s: any) => s.id === t.storyId);

        return {
          id: t.id || t.taskId || `TSK-${i + 1}`,
          title: t.title || t.name || t.task || "Untitled Task",
          status: t.status || 'todo', // Default everything to the first column
          priority: t.priority || 'Medium',
          type: t.type || 'Backend',
          points: t.points || t.storyPoints || 3,
          story: parentStory ? (parentStory.title || parentStory.name) : "General Architecture",
          // Mock assignees for UI aesthetics
          assignee: t.assignee || ['Alex', 'Sarah', 'Mike', 'David'][i % 4],
          description: t.description || ""
        };
      });

      setTasks(formattedTasks);
    } catch (e) {
      console.error("Error loading task data", e);
    }
  }, []);

  const saveTaskDetails = () => {
    if (!editingTask) return;

    setTasks(prev => {
      const updatedTasks = prev.map(t => t.id === editingTask.id ? editingTask : t);
      
      // PERSIST TO LOCAL STORAGE
      const raw = localStorage.getItem("blueprint_project_data");
      if (raw) {
        try {
          const data = JSON.parse(raw);
          if (data.tasks) {
            data.tasks = data.tasks.map((t: any) => {
              const id = t.id || t.taskId;
              if (id === editingTask.id) {
                return { ...t, ...editingTask };
              }
              return t;
            });
            localStorage.setItem("blueprint_project_data", JSON.stringify(data));
          }

          // RECORD ACTIVITY
          const activity = {
            id: `act-${Date.now()}`,
            type: 'TASK_UPDATED',
            description: `Edited details for ${editingTask.id}`,
            projectName: data.projectName || "Local Project",
            createdAt: new Date().toISOString()
          };
          
          const existingActivitiesRaw = localStorage.getItem("blueprint_local_activities");
          const existingActivities = existingActivitiesRaw ? JSON.parse(existingActivitiesRaw) : [];
          localStorage.setItem("blueprint_local_activities", JSON.stringify([activity, ...existingActivities].slice(0, 50)));

        } catch (err) {
          console.error("Error persisting task edit", err);
        }
      }
      return updatedTasks;
    });

    setIsEditDialogOpen(false);
    toast({
      title: "Task Saved",
      description: `Details for ${editingTask.id} have been updated.`
    });
  };

  // --- FILTERING ---
  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(task =>
      task.id.toLowerCase().includes(query) ||
      task.title.toLowerCase().includes(query) ||
      task.priority.toLowerCase() === query ||
      task.story.toLowerCase().includes(query) ||
      task.type.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setIsDragging(false);
    if (!draggedTaskId) return;

    // Update local state instantly for UI
    setTasks(prev => {
      const updatedTasks = prev.map(t => t.id === draggedTaskId ? { ...t, status: newStatus } : t);
      
      // PERSIST TO LOCAL STORAGE
      const raw = localStorage.getItem("blueprint_project_data");
      if (raw) {
        try {
          const data = JSON.parse(raw);
          // Update the specific task in the data object
          if (data.tasks) {
            data.tasks = data.tasks.map((t: any) => {
              const id = t.id || t.taskId;
              if (id === draggedTaskId) {
                return { ...t, status: newStatus };
              }
              return t;
            });
            localStorage.setItem("blueprint_project_data", JSON.stringify(data));
          }

          // RECORD ACTIVITY
          const activity = {
            id: `act-${Date.now()}`,
            type: 'TASK_UPDATED',
            description: `Updated status of ${draggedTaskId} to ${newStatus}`,
            projectName: data.projectName || "Local Project",
            createdAt: new Date().toISOString()
          };
          
          const existingActivitiesRaw = localStorage.getItem("blueprint_local_activities");
          const existingActivities = existingActivitiesRaw ? JSON.parse(existingActivitiesRaw) : [];
          localStorage.setItem("blueprint_local_activities", JSON.stringify([activity, ...existingActivities].slice(0, 50)));

        } catch (err) {
          console.error("Error persisting task status", err);
        }
      }
      
      return updatedTasks;
    });
    setDraggedTaskId(null);
    
    toast({
      title: "Task Updated",
      description: `Task moved to ${newStatus === 'todo' ? 'To Do' : newStatus === 'in-progress' ? 'In Progress' : 'Done'}`
    });
  }, [draggedTaskId, toast]);

  // --- UTILITY FUNCTIONS ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return <Badge variant="outline" className="bg-zinc-950 text-zinc-400 border-zinc-800">To Do</Badge>;
      case 'in-progress': return <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">In Progress</Badge>;
      case 'done': return <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Done</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high": 
      case "critical": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-green-400 bg-green-500/10 border-green-500/20";
    }
  };

  const syncToClickUp = async () => {
    try {
      toast({ title: "Syncing...", description: "Pushing tasks to ClickUp sprint board." });
      const response = await fetch("http://localhost:5000/api/sync-clickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: "demo-project-123",
          sprint: { name: "Sprint 1", tasks: tasks.map(t => t.id) }
        })
      });
      if (!response.ok) throw new Error("Sync failed");
      toast({ title: "Synced", description: "Tasks successfully pushed to ClickUp." });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: "Could not sync to ClickUp. Ensure backend is running."
      });
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card
      key={task.id}
      id={task.id}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing mb-3 group relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.type?.toLowerCase() === 'infrastructure' ? 'bg-purple-500' : task.type?.toLowerCase() === 'frontend' ? 'bg-blue-500' : 'bg-orange-500'}`} />
      <CardContent className="p-4 pl-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-mono text-zinc-500">{task.id}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-500 hover:text-white -mr-2 -mt-2"
            onClick={(e) => {
              e.stopPropagation();
              setEditingTask(task);
              setIsEditDialogOpen(true);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        <h3 className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</h3>
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4 bg-zinc-950 w-fit px-2 py-1 rounded border border-zinc-800/80 line-clamp-1 max-w-full">
          <BookOpen className="w-3 h-3 text-blue-400 shrink-0" />
          <span className="truncate">{task.story}</span>
        </div>
        {task.description && (
          <p className="text-[11px] text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              {task.points}
            </div>
            <Avatar className="w-6 h-6 border border-zinc-700">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} />
              <AvatarFallback>{task.assignee?.substring(0, 1) || 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks & Sprint Planner</h1>
          <p className="text-zinc-400 mt-1">Real-time board synced with your PRD analysis.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className={`gap-2 transition-colors ${isFilterOpen ? 'bg-zinc-800 text-white border-zinc-600' : 'bg-zinc-950 border-zinc-700 text-zinc-400 hover:text-white'}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4" /> {isFilterOpen ? "Hide Filters" : "Filter"}
          </Button>
          <Button
            variant="outline"
            className="bg-zinc-950 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2"
            onClick={syncToClickUp}
          >
            <RefreshCcw className="w-4 h-4" /> Push to ClickUp
          </Button>
          <Button
            className="bg-primary hover:brightness-110 text-primary-foreground gap-2 shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)]"
            onClick={() => navigate('/dashboard/architecture')}
          >
            View Architecture <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <Card className="bg-zinc-900 border-zinc-800 mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <CardContent className="p-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search tasks, priorities, or stories..."
                className="pl-10 bg-zinc-950 border-zinc-800 text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {['High', 'Medium', 'Low'].map(p => (
                <Badge
                  key={p}
                  variant="outline"
                  className={`cursor-pointer hover:bg-zinc-800 ${searchQuery.toLowerCase() === p.toLowerCase() ? 'bg-primary/20 border-primary text-primary' : 'bg-zinc-950 text-zinc-400'}`}
                  onClick={() => setSearchQuery(searchQuery.toLowerCase() === p.toLowerCase() ? "" : p)}
                >
                  {p}
                </Badge>
              ))}
            </div>
            {searchQuery && (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-zinc-500">
                <X className="w-4 h-4 mr-2" /> Clear
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="board" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 text-zinc-400">
            <TabsTrigger value="board" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Board</TabsTrigger>
            <TabsTrigger value="list" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="board" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)] min-h-[600px]">
            
            {/* TO DO COLUMN */}
            <div
              className="flex flex-col bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'todo')}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CircleDashed className="w-4 h-4 text-zinc-500" />
                  To Do
                </h2>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                  {filteredTasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filteredTasks.filter(t => t.status === 'todo').map(renderTaskCard)}
                {filteredTasks.filter(t => t.status === 'todo').length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                    {searchQuery ? "No matching tasks" : "Drop tasks here"}
                  </div>
                )}
              </div>
            </div>

            {/* IN PROGRESS COLUMN */}
            <div
              className="flex flex-col bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'in-progress')}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  In Progress
                </h2>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                  {filteredTasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filteredTasks.filter(t => t.status === 'in-progress').map(renderTaskCard)}
                {filteredTasks.filter(t => t.status === 'in-progress').length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                    {searchQuery ? "No matching tasks" : "Drop tasks here"}
                  </div>
                )}
              </div>
            </div>

            {/* DONE COLUMN */}
            <div
              className="flex flex-col bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'done')}
            >
              <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Done
                </h2>
                <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                  {filteredTasks.filter(t => t.status === 'done').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {filteredTasks.filter(t => t.status === 'done').map(renderTaskCard)}
                {filteredTasks.filter(t => t.status === 'done').length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                    {searchQuery ? "No matching tasks" : "Drop tasks here"}
                  </div>
                )}
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-950/50 text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="px-6 py-4 font-medium">Task</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Priority</th>
                      <th className="px-6 py-4 font-medium">Type</th>
                      <th className="px-6 py-4 font-medium">Story</th>
                      <th className="px-6 py-4 font-medium">Points</th>
                      <th className="px-6 py-4 font-medium text-right">Assignee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-zinc-500 text-[10px] font-mono mb-1">{task.id}</span>
                            <span className="text-white font-medium group-hover:text-primary transition-colors">{task.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 capitalize text-xs">
                          {task.type}
                        </td>
                        <td className="px-6 py-4 max-w-[200px]">
                          <div className="flex items-center gap-1 text-xs truncate">
                            <BookOpen className="w-3 h-3 text-blue-400 shrink-0" />
                            {task.story}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-6 h-6 rounded-md bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-bold text-primary">
                            {task.points}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                             <span className="text-xs">{task.assignee}</span>
                             <Avatar className="w-6 h-6 border border-zinc-700">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} />
                              <AvatarFallback>{task.assignee?.substring(0, 1) || 'U'}</AvatarFallback>
                            </Avatar>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredTasks.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-20 text-zinc-600">
                          <p>No tasks found matching your filters.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* TASK EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Task Details</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update the details for task <span className="text-white font-mono">{editingTask?.id}</span>.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input 
                id="title" 
                value={editingTask?.title || ""} 
                onChange={(e) => editingTask && setEditingTask({...editingTask, title: e.target.value})}
                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-primary"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Describe the technical requirements or sub-tasks..."
                value={editingTask?.description || ""} 
                onChange={(e) => editingTask && setEditingTask({...editingTask, description: e.target.value})}
                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-primary min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <select 
                  id="priority"
                  className="bg-zinc-950 border-zinc-800 text-white rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                  value={editingTask?.priority || "Medium"}
                  onChange={(e) => editingTask && setEditingTask({...editingTask, priority: e.target.value})}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="points">Points</Label>
                <Input 
                  id="points" 
                  type="number"
                  value={editingTask?.points || 0} 
                  onChange={(e) => editingTask && setEditingTask({...editingTask, points: parseInt(e.target.value) || 0})}
                  className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input 
                id="assignee" 
                placeholder="Enter name (e.g. Alex, Sarah...)"
                value={editingTask?.assignee || ""} 
                onChange={(e) => editingTask && setEditingTask({...editingTask, assignee: e.target.value})}
                className="bg-zinc-950 border-zinc-800 text-white focus-visible:ring-primary"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={saveTaskDetails} className="bg-primary hover:brightness-110 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}