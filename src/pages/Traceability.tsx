// src/pages/Traceability.tsx
import { useCallback } from "react";
import { jsPDF } from "jspdf";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  GitMerge, 
  FileText, 
  Server, 
  ListTodo,
  Download
} from "lucide-react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState, 
  Handle, 
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ==========================================
// CUSTOM TRACEABILITY NODE
// ==========================================
const TraceNode = ({ data, selected }: any) => {
  const Icon = data.icon;
  
  // Choose colors based on the node type (PRD, Service, or Task)
  const getColors = () => {
    switch(data.type) {
      case 'requirement': return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case 'service': return "border-primary/50 text-primary bg-primary/10";
      case 'task': return "border-green-500/50 text-green-400 bg-green-500/10";
      default: return "border-zinc-700 text-zinc-400 bg-zinc-900";
    }
  };

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border-2 w-64 transition-all bg-zinc-950
      ${selected ? "border-white shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)] scale-105 z-10" : "border-zinc-800 hover:border-zinc-600"}
    `}>
      {data.type !== 'requirement' && <Handle type="target" position={Position.Left} className="w-2 h-2 bg-zinc-500 border-none" />}
      
      <div className={`p-2 rounded-md ${getColors()}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{data.badge}</span>
        <span className="text-sm font-medium text-white leading-tight mt-0.5">{data.label}</span>
      </div>

      {data.type !== 'task' && <Handle type="source" position={Position.Right} className="w-2 h-2 bg-zinc-500 border-none" />}
    </div>
  );
};

const nodeTypes = { trace: TraceNode };

// ==========================================
// MOCK TRACEABILITY DATA
// ==========================================
const initialNodes = [
  // COLUMN 1: PRD Requirements (x: 50)
  { id: "req-1", type: "trace", position: { x: 50, y: 100 }, data: { label: "User Authentication", badge: "PRD-01", type: "requirement", icon: FileText } },
  { id: "req-2", type: "trace", position: { x: 50, y: 250 }, data: { label: "Payment Processing", badge: "PRD-02", type: "requirement", icon: FileText } },
  { id: "req-3", type: "trace", position: { x: 50, y: 400 }, data: { label: "Real-time Notifications", badge: "PRD-03", type: "requirement", icon: FileText } },

  // COLUMN 2: Architecture Services (x: 400)
  { id: "srv-1", type: "trace", position: { x: 400, y: 100 }, data: { label: "Auth Service", badge: "Microservice", type: "service", icon: Server } },
  { id: "srv-2", type: "trace", position: { x: 400, y: 250 }, data: { label: "Stripe Gateway", badge: "Microservice", type: "service", icon: Server } },
  { id: "srv-3", type: "trace", position: { x: 400, y: 400 }, data: { label: "Websocket Hub", badge: "Microservice", type: "service", icon: Server } },

  // COLUMN 3: Jira Tasks (x: 750)
  { id: "tsk-1", type: "trace", position: { x: 750, y: 50 }, data: { label: "Setup JWT Middleware", badge: "TASK-101", type: "task", icon: ListTodo } },
  { id: "tsk-2", type: "trace", position: { x: 750, y: 150 }, data: { label: "Configure OAuth Providers", badge: "TASK-102", type: "task", icon: ListTodo } },
  { id: "tsk-3", type: "trace", position: { x: 750, y: 250 }, data: { label: "Integrate Stripe Webhooks", badge: "TASK-201", type: "task", icon: ListTodo } },
  { id: "tsk-4", type: "trace", position: { x: 750, y: 400 }, data: { label: "Deploy Redis Pub/Sub", badge: "TASK-301", type: "task", icon: ListTodo } },
];

const edgeStyle = {
  stroke: '#52525b',
  strokeWidth: 2,
};

const markerEnd = {
  type: MarkerType.ArrowClosed,
  width: 15,
  height: 15,
  color: '#52525b',
};

const initialEdges = [
  // Req -> Service
  { id: 'e-r1-s1', source: 'req-1', target: 'srv-1', animated: true, style: edgeStyle, markerEnd },
  { id: 'e-r2-s2', source: 'req-2', target: 'srv-2', animated: true, style: edgeStyle, markerEnd },
  { id: 'e-r3-s3', source: 'req-3', target: 'srv-3', animated: true, style: edgeStyle, markerEnd },
  
  // Service -> Task
  { id: 'e-s1-t1', source: 'srv-1', target: 'tsk-1', style: edgeStyle, markerEnd },
  { id: 'e-s1-t2', source: 'srv-1', target: 'tsk-2', style: edgeStyle, markerEnd },
  { id: 'e-s2-t3', source: 'srv-2', target: 'tsk-3', style: edgeStyle, markerEnd },
  { id: 'e-s3-t4', source: 'srv-3', target: 'tsk-4', style: edgeStyle, markerEnd },
];

export default function Traceability() {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(22);
    doc.text("Compliance & Traceability Matrix", 20, 20);
    
    // Meta info
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text("Project: Food Delivery Platform (Demo)", 20, 37);
    
    // Table Headers
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Requirement ID", 20, 55);
    doc.text("Microservice", 80, 55);
    doc.text("Engineering Task", 140, 55);
    
    doc.setLineWidth(0.5);
    doc.line(20, 58, 190, 58);
    
    // Data Extraction and Rendering
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let y = 65;
    const requirements = initialNodes.filter(n => n.data.type === 'requirement');
    
    requirements.forEach((req) => {
      // Find services connected to this requirement
      const serviceEdges = initialEdges.filter(e => e.source === req.id);
      
      serviceEdges.forEach((sEdge) => {
        const service = initialNodes.find(n => n.id === sEdge.target);
        if (!service) return;
        
        // Find tasks connected to this service
        const taskEdges = initialEdges.filter(e => e.source === service.id);
        
        taskEdges.forEach((tEdge) => {
          const task = initialNodes.find(n => n.id === tEdge.target);
          if (!task) return;
          
          doc.text(req.data.badge, 20, y);
          doc.text(service.data.label, 80, y);
          doc.text(task.data.badge, 140, y);
          
          y += 7;
          
          // Page break
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
        });
      });
    });
    
    // Summary Section
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    
    y += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Traceability Summary", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Requirements Tracked: ${requirements.length}`, 25, y);
    doc.text(`Total Engineering Tasks Linked: ${initialNodes.filter(n => n.data.type === 'task').length}`, 25, y + 5);
    doc.text("Status: 100% Compliant", 25, y + 10);
    
    doc.save("Compliance_Traceability_Report.pdf");
    toast({ title: "Success", description: "Traceability matrix exported as PDF." });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-primary" />
            Traceability Matrix
          </h1>
          <p className="text-zinc-400 mt-1">Map business requirements to microservices and engineering tasks.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 flex flex-col relative overflow-hidden h-[calc(100vh-12rem)] min-h-[600px]">
        <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50 relative z-10 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-primary" />
            Requirement Mapping Graph
          </CardTitle>
          <div className="flex gap-6 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Business PRD</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary"></div> Architecture</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Engineering Tasks</span>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 relative z-10 w-full h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
    </DashboardLayout>
  );
}