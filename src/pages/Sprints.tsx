import { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus, Filter, Search, MoreHorizontal, Clock, CheckCircle2,
  CircleDashed, GripVertical, BookOpen, Loader2, RefreshCcw, AlertCircle,
  X,
  Edit2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: string;
  title: string;
  status: string; // 'todo' | 'in-progress' | 'done'
  priority: string;
  type: string;
  points: number;
  story: string;
}

export default function Sprints() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const { toast } = useToast();

  // UPDATED PORT TO 5000
  const API_URL = "http://localhost:5000/tasks";

  // --- API ACTIONS ---

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Server responded with error");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(true);
      toast({
        variant: "destructive",
        title: "Sync Error",
        description: "Could not connect to the backend. Is the server running on port 5000?",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic UI Update
      const originalTasks = [...tasks];
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

      const response = await fetch(`${API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update task");

      toast({ title: "Live Sync", description: `Task ${taskId} updated to ${newStatus}` });
    } catch (err) {
      fetchTasks(); // Rollback to server state if it fails
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Changes could not be saved to the database.",
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- DRAG & DROP HANDLERS ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTaskId) {
      updateTaskStatus(draggedTaskId, status);
      setDraggedTaskId(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === draggedTaskId ? { ...task, status } : task
      )
    );
    setDraggedTaskId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "Medium": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      default: return "text-primary bg-primary/10 border-primary/20";
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
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.type === 'Infrastructure' ? 'bg-purple-500' : task.type === 'Security' ? 'bg-red-500' : 'bg-blue-500'}`} />
      <CardContent className="p-4 pl-5">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-mono text-zinc-500">{task.id}</span>
          </div>
          {/* WIRED UP 3-DOTS BUTTON HERE */}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-zinc-500 hover:text-white -mr-2 -mt-2"
            onClick={(e) => {
              e.stopPropagation(); // Prevents dragging when clicking the button
              toast({ title: "Task Options", description: `Opening settings for ${task.id}...` });
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        <h3 className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</h3>

        {/* Story Linkage */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4 bg-zinc-950 w-fit px-2 py-1 rounded border border-zinc-800/80">
          <BookOpen className="w-3 h-3 text-blue-400" />
          {task.story}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary">
              {task.points}
            </div>
            <Avatar className="w-6 h-6 border border-zinc-700">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} />
              <AvatarFallback>{task.assignee.substring(0, 1)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const syncToClickUp = async () => {
    try {
      toast({ title: "Syncing...", description: "Pushing tasks to ClickUp sprint board." });

      const response = await fetch("http://localhost:5000/api/sync-clickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Passing a mock listId and grouping tasks into a "Sprint" payload [cite: 484]
        body: JSON.stringify({
          listId: "demo-list-123",
          sprint: { name: "Sprint 1", tasks: tasks.map(t => t.id) }
        })
      });

      if (!response.ok) throw new Error("Sync failed");

      toast({
        title: "Sync Successful",
        description: "Tasks are now live in your external project manager.",
      });
    } catch (err) {
      toast({ variant: "destructive", title: "Sync Failed", description: "Check your API keys." });
    }
  };
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks & Sprint Planner</h1>
          <p className="text-zinc-400 mt-1">Real-time board synced with engineering backend.</p>
        </div>
        <div className="flex gap-3">
          {/* WIRED UP FILTER BUTTON HERE */}
          <Button
            variant="outline"
            className="bg-zinc-950 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-2"
            onClick={syncToClickUp}
          >
            <RefreshCcw className="w-4 h-4" /> Push to ClickUp
          </Button>
          {/* WIRED UP NEW TASK BUTTON HERE */}
          <Button
            className="bg-primary hover:brightness-110 text-primary-foreground gap-2 glow-orange"
            onClick={() => toast({ title: "Create Task", description: "Opening manual task creation modal..." })}
          >
            <Plus className="w-4 h-4" /> New Task
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
                  className={`cursor-pointer hover:bg-zinc-800 ${searchQuery === p ? 'bg-primary/20 border-primary text-primary' : 'bg-zinc-950 text-zinc-400'}`}
                  onClick={() => setSearchQuery(searchQuery === p ? "" : p)}
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

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-primary"
            />
          </div>
        </div>

        <TabsContent value="board" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
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
                  {tasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.filter(t => t.status === 'todo').map(renderTaskCard)}
                {tasks.filter(t => t.status === 'todo').length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>

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
                  {tasks.filter(t => t.status === 'in-progress').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.filter(t => t.status === 'in-progress').map(renderTaskCard)}
                {tasks.filter(t => t.status === 'in-progress').length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>

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
                  {tasks.filter(t => t.status === 'done').length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {tasks.filter(t => t.status === 'done').map(renderTaskCard)}
                {tasks.filter(t => t.status === 'done').length === 0 && (
                  <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <div className="text-center py-12 text-zinc-500">
                List view placeholder. The Kanban board is where the action is!
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
