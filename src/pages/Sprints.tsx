import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Filter, 
  Search, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  CircleDashed,
  GripVertical,
  BookOpen,
  X,
  Edit2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const ClickUpIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5.385 13.911c.712-.511 1.631-.692 2.508-.491a4.341 4.341 0 011.696.864c.25.196.486.417.702.659.394.437.494.675 1.115.675.621 0 .721-.238 1.115-.675.216-.242.452-.463.702-.659a4.341 4.341 0 011.696-.864 3.737 3.737 0 012.508.491.439.439 0 01-.013.738l-4.706 3.124a1.295 1.295 0 01-1.42 0l-4.706-3.124a.439.439 0 01-.01-.738zM2.512 8.44l8.369-5.753c.677-.465 1.56-.465 2.237 0l8.369 5.753c.697.479.79 1.455.204 2.052l-2.008 2.049a.439.439 0 01-.637-.015l-4.108-4.223a.439.439 0 00-.731.314v8.834a.439.439 0 01-.439.439h-3.536a.439.439 0 01-.439-.439V8.911a.439.439 0 00-.731-.314l-4.108 4.223a.439.439 0 01-.637.015l-2.008-2.049c-.586-.597-.493-1.573.204-2.052z" />
  </svg>
);

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  type: string;
  points: number;
  story: string;
  assignee: string;
}

const initialTasks: Task[] = [
  { id: "SYS-001", title: "Setup API Gateway Routing", status: "todo", priority: "High", type: "Infrastructure", points: 5, story: "Core Infra", assignee: "Alex Rivet" },
  { id: "AUTH-102", title: "User Registration Endpoint", status: "todo", priority: "High", type: "Feature", points: 5, story: "Auth & Security", assignee: "Sarah Connor" },
  { id: "DB-042", title: "Provision PostgreSQL RDS", status: "in-progress", priority: "Medium", type: "Infrastructure", points: 8, story: "Core Infra", assignee: "Mike Ross" },
  { id: "AUTH-101", title: "Implement JWT Middleware", status: "in-progress", priority: "High", type: "Security", points: 3, story: "Auth & Security", assignee: "Alex Rivet" },
  { id: "PAY-201", title: "Stripe Webhook Integration", status: "done", priority: "High", type: "Feature", points: 5, story: "Payments", assignee: "Sarah Connor" },
];

export default function Sprints() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Omit<Task, 'id' | 'status'>>({
    title: "",
    priority: "Medium",
    type: "Feature",
    points: 3,
    story: "Backlog",
    assignee: "Unassigned"
  });

  const { toast } = useToast();

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;
    const query = searchQuery.toLowerCase();
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query) || 
      task.id.toLowerCase().includes(query) ||
      task.priority.toLowerCase().includes(query) ||
      task.story.toLowerCase().includes(query)
    );
  }, [tasks, searchQuery]);

  const openCreateModal = () => {
    setCurrentTask(null);
    setFormData({
      title: "",
      priority: "Medium",
      type: "Feature",
      points: 3,
      story: "Backlog",
      assignee: "Unassigned"
    });
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      priority: task.priority,
      type: task.type,
      points: task.points,
      story: task.story,
      assignee: task.assignee
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (currentTask) {
      setTasks(prev => prev.map(t => t.id === currentTask.id ? { ...t, ...formData } : t));
      toast({ title: "Task Updated", description: `Changes saved for ${currentTask.id}` });
    } else {
      const newId = `TASK-${Math.floor(Math.random() * 900) + 100}`;
      const newTask: Task = {
        id: newId,
        status: "todo",
        ...formData
      };
      setTasks(prev => [newTask, ...prev]);
      toast({ title: "Task Created", description: `Added ${newId} to backlog` });
    }

    setHasChanges(true);
    setIsTaskModalOpen(false);
  };

  const handlePushToClickUp = () => {
    toast({
      title: "Syncing with ClickUp",
      description: `Pushing ${tasks.length} tasks to ClickUp Workspace...`,
    });
    
    setTimeout(() => {
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Tasks synced successfully with ClickUp!",
        className: "bg-zinc-900 border-green-500 text-white",
      });
    }, 1500);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) element.style.opacity = "0.4";
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(null);
    const element = document.getElementById(id);
    if (element) element.style.opacity = "1";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedTaskId) return;

    const taskToMove = tasks.find(t => t.id === draggedTaskId);
    if (taskToMove && taskToMove.status !== status) {
      setTasks((prev) => 
        prev.map((task) => 
          task.id === draggedTaskId ? { ...task, status } : task
        )
      );
      
      if (!hasChanges) {
        setHasChanges(true);
        toast({
          title: "Tasks Reorganized",
          description: "Click 'Push to ClickUp' to sync your changes.",
          className: "bg-zinc-900 border-primary text-white",
        });
      }
    }
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
      onDragEnd={(e) => handleDragEnd(e, task.id)}
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing mb-3 group relative overflow-hidden"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${task.type === 'Infrastructure' ? 'bg-purple-500' : task.type === 'Security' ? 'bg-red-500' : 'bg-blue-500'}`} />
      
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
              openEditModal(task);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <h3 className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</h3>
        
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-4 bg-zinc-950 w-fit px-2 py-1 rounded border border-zinc-800/80">
          <BookOpen className="w-3 h-3 text-blue-400" />
          {task.story}
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50">
          <div className="flex gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary" title={`${task.points} Story Points`}>
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

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Tasks & Sprint Planner</h1>
          <p className="text-zinc-400 mt-1">Manage the engineering tickets generated from your architecture.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            className={`gap-2 border-zinc-700 transition-all ${hasChanges ? 'bg-primary/10 border-primary text-primary hover:bg-primary/20 animate-pulse' : 'bg-zinc-950 text-zinc-500 opacity-50 cursor-not-allowed'}`}
            disabled={!hasChanges}
            onClick={handlePushToClickUp}
          >
            <ClickUpIcon className="w-4 h-4" /> Push to ClickUp
          </Button>

          <Button 
            variant="outline" 
            className={`${isFilterOpen ? 'bg-zinc-800' : 'bg-zinc-950'} border-zinc-700 text-white hover:bg-zinc-800 gap-2`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>
          
          <Button 
            className="bg-primary hover:brightness-110 text-primary-foreground gap-2 glow-orange"
            onClick={openCreateModal}
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
        <TabsList className="bg-zinc-900 border border-zinc-800 text-zinc-400 mb-6">
          <TabsTrigger value="board" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-8">Board</TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white px-8">List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="board" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-20rem)] min-h-[500px]">
            {['todo', 'in-progress', 'done'].map((status) => (
              <div 
                key={status}
                className="flex flex-col bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-semibold text-white capitalize flex items-center gap-2">
                    {status === 'todo' && <CircleDashed className="w-4 h-4 text-zinc-500" />}
                    {status === 'in-progress' && <Clock className="w-4 h-4 text-blue-400" />}
                    {status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {status.replace('-', ' ')}
                  </h2>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                    {filteredTasks.filter(t => t.status === status).length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {filteredTasks.filter(t => t.status === status).map(renderTaskCard)}
                  {filteredTasks.filter(t => t.status === status).length === 0 && (
                    <div className="h-24 rounded-lg border-2 border-dashed border-zinc-800 flex items-center justify-center text-sm text-zinc-600">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="m-0">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Points</th>
                      <th className="px-6 py-4">Assignee</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-500">{task.id}</td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-zinc-200">{task.title}</div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                              <BookOpen className="w-2.5 h-2.5" /> {task.story}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={`text-[10px] uppercase ${
                            task.status === 'done' ? 'border-green-500/50 text-green-400 bg-green-500/5' :
                            task.status === 'in-progress' ? 'border-blue-500/50 text-blue-400 bg-blue-500/5' :
                            'border-zinc-700 text-zinc-400 bg-zinc-950'
                          }`}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {task.points}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 border border-zinc-700">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} />
                              <AvatarFallback>{task.assignee.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-zinc-300">{task.assignee}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-zinc-500 hover:text-primary hover:bg-primary/10"
                            onClick={() => openEditModal(task)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTasks.length === 0 && (
                  <div className="py-20 text-center">
                    <div className="text-zinc-500 text-sm">No tasks matching your filters</div>
                    <Button variant="link" className="text-primary mt-2" onClick={() => setSearchQuery("")}>Clear search</Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>{currentTask ? `Edit Task ${currentTask.id}` : "Create New Task"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-400">Task Title</Label>
              <Input 
                id="title" 
                placeholder="e.g. Implement JWT Middleware" 
                className="bg-zinc-950 border-zinc-800 focus:ring-primary"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-zinc-400">Priority</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label className="text-zinc-400">Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
                >
                  <SelectTrigger className="bg-zinc-950 border-zinc-800">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Bugs">Bugs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="points" className="text-zinc-400">Story Points</Label>
                <Input 
                  id="points" 
                  type="number"
                  className="bg-zinc-950 border-zinc-800 focus:ring-primary"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="story" className="text-zinc-400">Parent Story</Label>
                <Input 
                  id="story" 
                  placeholder="e.g. Auth & Security"
                  className="bg-zinc-950 border-zinc-800 focus:ring-primary"
                  value={formData.story}
                  onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignee" className="text-zinc-400">Assignee Name</Label>
              <Input 
                id="assignee" 
                placeholder="e.g. Alex Rivet" 
                className="bg-zinc-950 border-zinc-800 focus:ring-primary"
                value={formData.assignee}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="border-zinc-700 hover:bg-zinc-800">
              Cancel
            </Button>
            <Button onClick={handleSaveTask} className="bg-primary hover:brightness-110 text-primary-foreground">
              {currentTask ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}