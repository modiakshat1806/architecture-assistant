// src/pages/Tasks.tsx
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ListTodo, ArrowRight, CheckCircle2, CircleDashed, Filter } from "lucide-react";

const BACKLOG_TASKS = [
  { id: "SYS-001", title: "Setup API Gateway Routing", priority: "High", type: "Infrastructure", points: 5 },
  { id: "AUTH-101", title: "Implement JWT Middleware", priority: "High", type: "Feature", points: 3 },
  { id: "DB-042", title: "Provision PostgreSQL RDS", priority: "Medium", type: "Infrastructure", points: 8 },
  { id: "PAY-201", title: "Stripe Webhook Integration", priority: "High", type: "Feature", points: 5 },
  { id: "CORE-009", title: "Configure Redis Caching Layer", priority: "Low", type: "Infrastructure", points: 2 },
  { id: "AUTH-102", title: "User Registration Endpoint", priority: "High", type: "Feature", points: 3 },
];

export default function Tasks() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-primary" />
            Project Backlog
          </h1>
          <p className="text-zinc-400 mt-1">All AI-generated tasks and requirements for this architecture.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button onClick={() => navigate('/dashboard/sprints')} className="bg-primary hover:brightness-110 text-white gap-2 glow-orange">
            Generate Sprint Plan <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="border-b border-zinc-800 bg-zinc-950/50">
          <CardTitle className="text-white text-sm">Generated Tickets ({BACKLOG_TASKS.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800">
            {BACKLOG_TASKS.map((task) => (
              <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <CircleDashed className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200">{task.title}</h4>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">{task.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-[10px] uppercase bg-zinc-950 border-zinc-700 text-zinc-400">
                    {task.type}
                  </Badge>
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <span className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <span className="text-xs text-zinc-400">{task.priority}</span>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                    {task.points}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}