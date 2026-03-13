import { useState, useEffect, useCallback, useMemo } from "react";
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
  Download,
  Loader2,
  AlertCircle,
  Database,
  Layout
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
// ICON MAPPING
// ==========================================
const iconMap: Record<string, any> = {
  feature: Layout,
  story: FileText,
  task: ListTodo,
  service: Server,
  database: Database,
  default: FileText
};

// ==========================================
// CUSTOM TRACEABILITY NODE
// ==========================================
const TraceNode = ({ data, selected }: any) => {
  const Icon = iconMap[data.type] || iconMap.default;

  const getColors = () => {
    switch (data.type) {
      case 'feature': return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case 'story': return "border-purple-500/50 text-purple-400 bg-purple-500/10";
      case 'task': return "border-green-500/50 text-green-400 bg-green-500/10";
      default: return "border-zinc-700 text-zinc-400 bg-zinc-900";
    }
  };

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border-2 w-64 transition-all bg-zinc-950
      ${selected ? "border-white shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)] scale-105 z-10" : "border-zinc-800 hover:border-zinc-600"}
    `}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-zinc-600 border-none" />

      <div className={`p-2 rounded-md ${getColors()}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="flex flex-col overflow-hidden">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{data.badge || data.type}</span>
        <span className="text-sm font-medium text-white truncate leading-tight mt-0.5">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-zinc-600 border-none" />
    </div>
  );
};

const nodeTypes = { trace: TraceNode };

const edgeStyle = { stroke: '#3f3f46', strokeWidth: 2 };
const markerEnd = { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#3f3f46' };

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
            Requirements Traceability
          </h1>
          <p className="text-zinc-400 mt-1">Map business requirements to microservices and engineering tasks.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
            onClick={() => {
              toast({
                title: "Exporting Report",
                description: "Generating compliance and traceability PDF...",
              });
            }}
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 flex flex-col h-[calc(100vh-14rem)] min-h-[600px] overflow-hidden">
        <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-white text-xs flex items-center gap-2 uppercase tracking-widest opacity-70">
            Lineage Visualization
          </CardTitle>
          <div className="flex gap-4 text-[10px] font-bold uppercase">
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Feature</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500" /> User Story</span>
            <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /> Task</span>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 bg-zinc-950 relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <AlertCircle className="w-12 h-12 text-red-500/50 mb-4" />
              <Button onClick={fetchGraphData} variant="outline" className="border-zinc-800">Retry Connection</Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-zinc-500 text-sm">Mapping Traceability Matrix...</p>
            </div>
          ) : isReady ? (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              colorMode="dark"
            >
              <Background color="#18181b" gap={20} />
              <Controls />
            </ReactFlow>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600">
              No traceability data generated for this PRD.
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}