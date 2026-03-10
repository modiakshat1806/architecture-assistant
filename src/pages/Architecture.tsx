import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Server, 
  Database, 
  Cloud, 
  Globe, 
  Lock, 
  CreditCard,
  ArrowRight,
  Download,
  Code2
} from "lucide-react";

const nodes = [
  { id: "gateway", name: "API Gateway", type: "gateway", icon: Globe, description: "Routes incoming traffic to the appropriate microservices.", tech: "Kong / Nginx" },
  { id: "auth", name: "Auth Service", type: "service", icon: Lock, description: "Handles user login, registration, and JWT validation.", tech: "Node.js + Express" },
  { id: "users_db", name: "Users DB", type: "database", icon: Database, description: "Stores user profiles and credentials securely.", tech: "PostgreSQL" },
  { id: "payments", name: "Payment Service", type: "service", icon: CreditCard, description: "Processes subscriptions and invoices via Stripe.", tech: "Go / Fiber" },
  { id: "cache", name: "Redis Cache", type: "cache", icon: Server, description: "Caches frequent API responses to reduce latency.", tech: "Redis" },
];

export default function Architecture() {
  const [selectedNode, setSelectedNode] = useState(nodes[0]);
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Architecture</h1>
          <p className="text-zinc-400 mt-1">Interactive map of your generated services and databases.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2">
            <Download className="w-4 h-4" /> Export Diagram
          </Button>
          <Button className="bg-primary hover:brightness-110 text-white gap-2">
            <Code2 className="w-4 h-4" /> Generate Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
          
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50 relative z-10">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-primary-500" />
              Service Topology
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-8 relative z-10 flex items-center justify-center">
            <div className="relative w-full max-w-lg aspect-video">
              {nodes.map((node, index) => {
                const isSelected = selectedNode.id === node.id;
                const Icon = node.icon;
                
                const positions = [
                  "top-0 left-1/2 -translate-x-1/2",
                  "top-1/2 left-0 -translate-y-1/2",
                  "bottom-0 left-1/4",              
                  "top-1/2 right-0 -translate-y-1/2",
                  "bottom-0 right-1/4"               
                ];

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`absolute ${positions[index]} flex flex-col items-center gap-2 group transition-all`}
                  >
                    <div className={`
                      w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200
                      ${isSelected 
                        ? "bg-primary-600/20 border-primary-500 text-primary-400 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)] scale-110 z-10" 
                        : "bg-zinc-950 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}
                    `}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${isSelected ? "bg-primary-500/10 text-primary-400" : "bg-zinc-900 text-zinc-400"}`}>
                      {node.name}
                    </span>
                  </button>
                );
              })}

              <svg className="absolute inset-0 w-full h-full -z-10 pointer-events-none stroke-zinc-700" style={{ strokeWidth: 2, strokeDasharray: '4 4' }}>
                <path d="M 250 50 L 100 150" />
                <path d="M 250 50 L 400 150" />
                <path d="M 100 180 L 150 250" />
                <path d="M 400 180 L 350 250" />
              </svg>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 flex flex-col">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
            <CardTitle className="text-white text-sm">Component Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-400">
                <selectedNode.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedNode.name}</h2>
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{selectedNode.type}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-2">Description</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-2">Recommended Tech Stack</h3>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-sm text-primary-400 font-mono">
                {selectedNode.tech}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-white mb-4">Endpoints / Interfaces</h3>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/10 text-green-400">GET</span>
                      <span className="text-xs text-zinc-300 font-mono">/api/v1/{selectedNode.name.toLowerCase().split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => navigate('/dashboard/tasks')} className="w-full bg-zinc-100 text-zinc-900 hover:bg-white mt-auto">
              View Generated Tasks <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}