// src/pages/Architecture.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // <-- ADDED TOAST IMPORT
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
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ==========================================
// 1. CUSTOM NODE DEFINITION
// ==========================================
const BlueprintNode = ({ data, selected }: any) => {
  const Icon = data.icon;
  return (
    <div className="flex flex-col items-center gap-2 group transition-all w-32">
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary border-none" />
      
      <div className={`
        w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200 bg-zinc-950
        ${selected 
          ? "border-primary text-primary shadow-[0_0_20px_-5px_hsl(var(--accent-orange)/0.5)] scale-110 z-10" 
          : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"}
      `}>
        <Icon className="w-8 h-8" />
      </div>
      
      <span className={`text-xs font-medium px-2 py-1 rounded-md text-center ${selected ? "bg-primary/10 text-primary" : "bg-zinc-900 text-zinc-400"}`}>
        {data.label}
      </span>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary border-none" />
    </div>
  );
};

const nodeTypes = { blueprint: BlueprintNode };

// ==========================================
// 2. INITIAL DIAGRAM DATA
// ==========================================
const initialNodes = [
  { id: "gateway", type: "blueprint", position: { x: 250, y: 0 }, data: { label: "API Gateway", icon: Globe, type: "gateway", description: "Routes incoming traffic to the appropriate microservices.", tech: "Kong / Nginx" } },
  { id: "auth", type: "blueprint", position: { x: 100, y: 150 }, data: { label: "Auth Service", icon: Lock, type: "service", description: "Handles user login, registration, and JWT validation.", tech: "Node.js + Express" } },
  { id: "payments", type: "blueprint", position: { x: 400, y: 150 }, data: { label: "Payment Service", icon: CreditCard, type: "service", description: "Processes subscriptions and invoices via Stripe.", tech: "Go / Fiber" } },
  { id: "users_db", type: "blueprint", position: { x: 100, y: 300 }, data: { label: "Users DB", icon: Database, type: "database", description: "Stores user profiles and credentials securely.", tech: "PostgreSQL" } },
  { id: "cache", type: "blueprint", position: { x: 400, y: 300 }, data: { label: "Redis Cache", icon: Server, type: "cache", description: "Caches frequent API responses to reduce latency.", tech: "Redis" } },
];

const initialEdges = [
  { id: 'e1-2', source: 'gateway', target: 'auth', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e1-3', source: 'gateway', target: 'payments', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e2-4', source: 'auth', target: 'users_db', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e3-5', source: 'payments', target: 'cache', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
];

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
export default function Architecture() {
  const navigate = useNavigate();
  const { toast } = useToast(); // <-- INITIALIZE TOAST
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Detail panel state
  const [selectedNodeData, setSelectedNodeData] = useState(initialNodes[0].data);

  // Update right panel when a node is clicked
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNodeData(node.data);
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Architecture</h1>
          <p className="text-zinc-400 mt-1">Interactive map of your generated services and databases.</p>
        </div>
        <div className="flex gap-3">
          {/* UPDATED EXPORT BUTTON */}
          <Button 
            variant="outline" 
            className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
            onClick={() => {
              toast({
                title: "Exporting Diagram",
                description: "Preparing your architecture graph as a high-res PNG...",
              });
            }}
          >
            <Download className="w-4 h-4" /> Export Diagram
          </Button>
          <Button onClick={() => navigate('/dashboard/code')} className="bg-primary hover:brightness-110 text-white gap-2 glow-orange">
            <Code2 className="w-4 h-4" /> Generate Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Left Panel: React Flow Canvas */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800 flex flex-col relative overflow-hidden">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50 relative z-10">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <Cloud className="w-4 h-4 text-primary" />
              Service Topology (Interactive)
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 relative z-10 w-full h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              className="bg-zinc-950"
              colorMode="dark"
            >
              <Background color="#3f3f46" gap={24} size={1} />
              <Controls className="fill-zinc-400 text-zinc-400" />
            </ReactFlow>
          </CardContent>
        </Card>

        {/* Right Panel: Node Details */}
        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 flex flex-col">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
            <CardTitle className="text-white text-sm">Component Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <selectedNodeData.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedNodeData.label}</h2>
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">{selectedNodeData.type}</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-2">Description</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {selectedNodeData.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-white mb-2">Recommended Tech Stack</h3>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-950 border border-zinc-800 text-sm text-primary font-mono">
                {selectedNodeData.tech}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-white mb-4">Endpoints / Interfaces</h3>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-green-500/10 text-green-400">GET</span>
                      <span className="text-xs text-zinc-300 font-mono">/api/v1/{selectedNodeData.label.toLowerCase().split(' ')[0]}</span>
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