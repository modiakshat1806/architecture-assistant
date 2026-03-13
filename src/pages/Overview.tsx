// src/pages/Overview.tsx
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Zap, Target, BarChart3, ListChecks, Clock } from "lucide-react";

const projectData = {
  name: "E-Commerce Replatforming",
  description: "Modernizing the legacy monolithic stack to a distributed microservices architecture on AWS. Focus on scalability, multi-tenant isolation, and real-time inventory management.",
  healthScore: 92,
  completeness: 85,
  complexity: "High",
  features: [
    { id: 1, name: "User Authentication", stories: 4, tasks: 12, complexity: "High" },
    { id: 2, name: "Inventory Management", stories: 6, tasks: 24, complexity: "Critical" },
    { id: 3, name: "Payment Processing", stories: 3, tasks: 15, complexity: "High" },
    { id: 4, name: "Search & Discovery", stories: 5, tasks: 18, complexity: "Medium" }
  ],
  stats: {
    features: 12,
    tasks: 156,
    sprints: 6,
    ambiguities: 4
  }
};

export default function Overview() {
  const navigate = useNavigate();
  const p = projectData;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                Active Project
              </Badge>
              <span className="text-zinc-500 text-sm font-medium">Updated 2 hours ago</span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-tight">{p.name}</h1>
            <p className="text-zinc-400 mt-3 text-lg leading-relaxed max-w-3xl">{p.description}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/dashboard/analysis")} className="bg-primary hover:brightness-110 text-white gap-2 shadow-lg glow-orange h-11 px-6">
              View Analysis <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'PRD Health', value: `${p.healthScore}/100`, color: 'text-primary', icon: BarChart3, desc: 'Overall requirement quality' },
            { label: 'Completeness', value: `${p.completeness}%`, color: 'text-blue-400', icon: Target, desc: 'Architecture mapping progress' },
            { label: 'Complexity', value: p.complexity, color: 'text-amber-400', icon: Zap, desc: 'Technical implementation difficulty' },
            { label: 'Estimate Timeline', value: '4-6 Weeks', color: 'text-purple-400', icon: Clock, desc: 'Projected delivery duration' },
          ].map(m => (
            <Card key={m.label} className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm group hover:border-zinc-700 transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{m.label}</p>
                  <m.icon className={cn('w-4 h-4', m.color)} />
                </div>
                <p className={cn('text-3xl font-black tracking-tight mb-1', m.color)}>{m.value}</p>
                <p className="text-sm text-zinc-500">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Core Features', value: p.stats.features },
            { label: 'Total Tasks', value: p.stats.tasks },
            { label: 'Planned Sprints', value: p.stats.sprints },
            { label: 'Ambiguities Found', value: p.stats.ambiguities },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-zinc-800/50 bg-zinc-900/30 p-5 flex flex-col items-center justify-center text-center">
              <p className="text-xs text-zinc-500 font-bold mb-1 uppercase tracking-wider">{s.label}</p>
              <p className="text-3xl text-white font-black">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Strategic Initiatives */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              Strategic Initiatives
            </h3>
            <Button variant="link" onClick={() => navigate("/dashboard/analysis")} className="text-zinc-500 hover:text-white p-0 h-auto">
              View all features
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {p.features.map(f => (
              <div key={f.id} className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-primary/50 transition-all cursor-pointer">
                <div>
                  <span className="text-base font-bold text-white group-hover:text-primary transition-colors block mb-1">{f.name}</span>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                    <span>{f.stories} Stories</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span>{f.tasks} Tasks</span>
                  </div>
                </div>
                <Badge variant="outline" className={cn(
                  'rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-tighter',
                  f.complexity === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                  f.complexity === 'High' ? 'text-primary bg-primary/10 border-primary/20' : 
                  'text-zinc-400 bg-zinc-800 border-zinc-700'
                )}>
                  {f.complexity}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Core Features Extracted Section (NEW) */}
        <div className="space-y-4 py-4">
          <h3 className="text-xl font-bold text-white">Core Features Extracted</h3>
          <div className="space-y-2">
            {[
              { name: "Authentication System", stories: 4, tasks: 12, complexity: "High" },
              { name: "Restaurant Management", stories: 5, tasks: 18, complexity: "High" },
              { name: "Order Workflow", stories: 4, tasks: 16, complexity: "Critical" },
              { name: "Payment Processing", stories: 3, tasks: 14, complexity: "High" },
              { name: "Driver Dispatch", stories: 4, tasks: 15, complexity: "High" },
              { name: "Notifications & Alerts", stories: 4, tasks: 14, complexity: "Medium" }
            ].map((feature, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-900/50 transition-colors rounded-lg">
                <span className="text-sm font-semibold text-white">{feature.name}</span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                    <span>{feature.stories} stories</span>
                    <span>{feature.tasks} tasks</span>
                  </div>
                  <Badge variant="outline" className={cn(
                    'rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-tight w-16 text-center justify-center',
                    feature.complexity === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                    feature.complexity === 'High' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 
                    'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                  )}>
                    {feature.complexity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
