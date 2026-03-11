// src/pages/Sprints.tsx
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Filter, 
  Search, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  CircleDashed,
  GripVertical
} from "lucide-react";
import { Input } from "@/components/ui/input";

const mockTasks = [
  { id: "TASK-1", title: "Setup PostgreSQL Database Schema", status: "todo", priority: "High", type: "Backend", estimate: "4h" },
  { id: "TASK-2", title: "Implement JWT Auth Middleware", status: "todo", priority: "High", type: "Security", estimate: "3h" },
  { id: "TASK-3", title: "Create API Gateway Configuration", status: "in-progress", priority: "Medium", type: "Infrastructure", estimate: "2h" },
  { id: "TASK-4", title: "Design User Login UI Components", status: "in-progress", priority: "Medium", type: "Frontend", estimate: "5h" },
  { id: "TASK-5", title: "Initialize Monorepo Structure", status: "done", priority: "High", type: "DevOps", estimate: "1h" },
];

export default function Sprints() {
  const [tasks, setTasks] = useState(mockTasks);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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

  const renderTaskCard = (task: typeof mockTasks[0]) => (
    <Card 
      key={task.id} 
      id={task.id}
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
      onDragEnd={(e) => handleDragEnd(e, task.id)}
      className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-grab active:cursor-grabbing mb-3 group"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="text-xs font-mono text-zinc-500">{task.id}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white -mr-2 -mt-2">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        <h3 className="text-sm font-medium text-white mb-3 leading-snug">{task.title}</h3>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {task.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">{task.estimate}</span>
            <Avatar className="w-6 h-6 border border-zinc-700">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.id}`} />
              <AvatarFallback>U</AvatarFallback>
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
          <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-primary hover:brightness-110 text-primary-foreground gap-2 glow-orange">
            <Plus className="w-4 h-4" /> New Task
          </Button>
        </div>
      </div>

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