import { useState, useEffect, useCallback, useMemo } from "react";
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
    switch(data.type) {
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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const API_URL = "http://localhost:5000/traceability";

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Sync Failed");
      
      const data = await response.json();

      // PROTECTIVE MAPPING: Ensures every node is valid before state update
      const validNodes = (data.nodes || [])
        .filter((n: any) => n && n.position && typeof n.position.x === 'number')
        .map((node: any) => ({
          ...node,
          type: 'trace', // Overwrite to use our custom node
          data: {
            ...node.data,
            type: node.data?.type || 'default'
          }
        }));

      const validEdges = (data.edges || []).map((edge: any) => ({
        ...edge,
        animated: true,
        style: edgeStyle,
        markerEnd
      }));

      setNodes(validNodes);
      setEdges(validEdges);
    } catch (err) {
      setError(true);
      toast({
        variant: "destructive",
        title: "Matrix Sync Error",
        description: "Check if the backend is running on port 5000.",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, setNodes, setEdges]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Only render ReactFlow if we have nodes with valid coordinates
  const isReady = useMemo(() => nodes.length > 0 && !loading, [nodes, loading]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-primary" />
            Requirements Traceability
          </h1>
          <p className="text-zinc-400 mt-1">Tracing the lineage from Business Features to Engineering Tasks.</p>
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