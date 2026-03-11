// src/pages/Tasks.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ListTodo, ArrowRight, CircleDashed, Filter, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// BUG 10 FIXED: Grouped tasks into actual User Stories with aggregated Fibonacci Story Points
const BACKLOG_STORIES = [
  {
    id: "STORY-1",
    title: "User Authentication & Security",
    description: "As a user, I want to securely log in and register so my data is protected.",
    totalPoints: 8,
    tasks: [
      { id: "AUTH-101", title: "Implement JWT Middleware", priority: "High", type: "Security", points: 3 },
      { id: "AUTH-102", title: "User Registration Endpoint", priority: "High", type: "Feature", points: 5 },
    ]
  },
  {
    id: "STORY-2",
    title: "Core Infrastructure Setup",
    description: "As an engineer, I need the base infrastructure provisioned to deploy services.",
    totalPoints: 15,
    tasks: [
      { id: "SYS-001", title: "Setup API Gateway Routing", priority: "High", type: "Infrastructure", points: 5 },
      { id: "DB-042", title: "Provision PostgreSQL RDS", priority: "Medium", type: "Infrastructure", points: 8 },
      { id: "CORE-009", title: "Configure Redis Caching Layer", priority: "Low", type: "Infrastructure", points: 2 },
    ]
  },
  {
    id: "STORY-3",
    title: "Payment Processing",
    description: "As a user, I want to securely pay for my subscription.",
    totalPoints: 5,
    tasks: [
      { id: "PAY-201", title: "Stripe Webhook Integration", priority: "High", type: "Feature", points: 5 },
    ]
  }
];

export default function Tasks() {
  const navigate = useNavigate();
  const { toast } = useToast(); // <-- Init hook

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-primary" />
            Project Backlog
          </h1>
          <p className="text-zinc-400 mt-1">Review AI-generated User Stories and effort estimations.</p>
        </div>
        <div className="flex gap-3">
          {/* WIRED UP FILTER BUTTON */}
          <Button 
            variant="outline" 
            className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
            onClick={() => toast({ title: "Filters", description: "Opening advanced backlog filters..." })}
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button onClick={() => navigate('/dashboard/sprints')} className="bg-primary hover:brightness-110 text-white gap-2 glow-orange">
            Generate Sprint Plan <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {BACKLOG_STORIES.map((story) => (
          <Card key={story.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
            {/* Story Header */}
            <CardHeader className="border-b border-zinc-800 bg-zinc-950/80 py-4 flex flex-row items-start justify-between">
              <div className="flex gap-3 items-start">
                <div className="mt-1 bg-blue-500/10 p-1.5 rounded-md border border-blue-500/20 text-blue-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-white text-base">{story.title}</CardTitle>
                    <span className="text-xs font-mono text-zinc-500">{story.id}</span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">{story.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium">Story Points:</span>
                <span className="text-sm font-bold text-primary">{story.totalPoints}</span>
              </div>
            </CardHeader>

            {/* Tasks inside the Story */}
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/50">
                {story.tasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group cursor-pointer pl-12">
                    <div className="flex items-center gap-3">
                      <CircleDashed className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                      <div>
                        <h4 className="text-sm font-medium text-zinc-200">{task.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">{task.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-[10px] uppercase bg-zinc-950 border-zinc-700 text-zinc-400">
                        {task.type}
                      </Badge>
                      <div className="flex items-center gap-2 min-w-[70px]">
                        <span className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                        <span className="text-xs text-zinc-400">{task.priority}</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary" title="Story Points">
                        {task.points}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}