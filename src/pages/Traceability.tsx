import { useState, useCallback, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  GitMerge, 
  Search, 
  Info, 
  X, 
  Zap, 
  FileText, 
  Server, 
  Code2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from "lucide-react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { initialTraceNodes, initialTraceEdges, markerEnd } from "@/data/traceabilityData";
import { jsPDF } from "jspdf";

// ==========================================
// CUSTOM TRACEABILITY NODE
// ==========================================
const TraceNode = ({ data, selected }: any) => {
  const getStyles = () => {
    switch (data.type) {
      case 'requirement': return { border: "border-blue-500", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" };
      case 'service': return { border: "border-purple-500", icon: Server, color: "text-purple-400", bg: "bg-purple-500/10" };
      case 'api': return { border: "border-amber-500", icon: Code2, color: "text-amber-400", bg: "bg-amber-500/10" };
      case 'task': return { border: "border-green-500", icon: GitMerge, color: "text-green-400", bg: "bg-green-500/10" };
      default: return { border: "border-zinc-700", icon: Info, color: "text-zinc-400", bg: "bg-zinc-900" };
    }
  };

  const styles = getStyles();
  const Icon = styles.icon;

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-xl border-2 w-64 transition-all duration-300 bg-zinc-950 backdrop-blur-xl
      ${selected ? `${styles.border} shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] scale-105 z-20` : "border-zinc-800 hover:border-zinc-600 opacity-80"}
      ${data.highlighted ? `${styles.border} opacity-100 ring-4 ring-white/5` : ""}
      ${data.dimmed ? "opacity-30 grayscale-[0.5]" : ""}
    `}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-zinc-600 border-none" />

      <div className={`p-2.5 rounded-lg ${styles.bg}`}>
        <Icon className={`w-5 h-5 ${styles.color}`} />
      </div>

      <div className="flex flex-col overflow-hidden flex-1">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-wider ${styles.color}`}>{data.badge}</span>
          {data.type === 'task' && (
             <Badge variant="outline" className={`text-[8px] h-4 px-1 leading-none ${data.status === 'Done' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-zinc-500 border-zinc-700 bg-zinc-900'}`}>
                {data.status}
             </Badge>
          )}
        </div>
        <span className="text-sm font-semibold text-white truncate leading-tight mt-0.5">{data.label}</span>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-zinc-600 border-none" />
      
      {data.highlighted && data.type === 'requirement' && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-zinc-950 px-3 py-1 rounded-full text-[10px] font-bold shadow-xl animate-bounce">
          IMPACT ANALYSIS ACTIVE
        </div>
      )}
    </div>
  );
};

const nodeTypes = { trace: TraceNode };

export default function Traceability() {
  const { toast } = useToast();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialTraceNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialTraceEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState(false);
  const [originalEdges, setOriginalEdges] = useState<any[]>(initialTraceEdges);

  // Load from local storage dynamically
  useEffect(() => {
    const rawData = localStorage.getItem("blueprint_project_data");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        const aiFeatures = parsed.features || [];
        const aiTasks = parsed.tasks || [];
        const aiArch = parsed.architecture || { nodes: [], edges: [] };

        if (!aiFeatures.length || !aiTasks.length) return;

        const newNodes: any[] = [];
        const newEdges: any[] = [];

        // 1. Process Architecture Nodes
        const servicesAndApis = aiArch.nodes || [];
        
        let services = servicesAndApis.filter((n: any) => !n.label?.toLowerCase().includes('api') && !n.label?.toLowerCase().includes('gateway'));
        let apis = servicesAndApis.filter((n: any) => n.label?.toLowerCase().includes('api') || n.label?.toLowerCase().includes('gateway'));

        if (services.length === 0) services = servicesAndApis;
        if (apis.length === 0) apis = servicesAndApis;

        // Fallbacks if absolutely no architecture
        if (services.length === 0) services.push({ id: 's-mock', label: 'Core Service', type: 'service' });
        if (apis.length === 0) apis.push({ id: 'a-mock', label: 'Core API', type: 'api' });

        let taskY = 0;
        const serviceNodeIds = new Set();
        const apiNodeIds = new Set();

        services.forEach((s: any, idx: number) => {
          if (!serviceNodeIds.has(s.id)) {
            newNodes.push({
              id: s.id,
              type: 'trace',
              position: { x: 300, y: idx * 150 },
              data: { label: s.label || s.id, type: 'service', badge: s.type || 'Microservice', description: s.description || 'Core service component' }
            });
            serviceNodeIds.add(s.id);
          }
        });

        apis.forEach((a: any, idx: number) => {
          if (!apiNodeIds.has(a.id)) {
            let method = a.method;
            let endpoint = a.endpoint;
            
            // If explicit method/endpoint are missing, try to parse from the label
            const labelStr = (a.label || a.id).trim();
            if (!method || !endpoint) {
              const methodMatch = labelStr.match(/^(GET|POST|PUT|DELETE|PATCH)\s+(.*)/i);
              if (methodMatch) {
                method = methodMatch[1].toUpperCase();
                endpoint = methodMatch[2].trim();
              } else {
                method = method || 'GET';
                endpoint = endpoint || (labelStr.startsWith('/') ? labelStr : `/${labelStr.replace(/\s+/g, '-').toLowerCase()}`);
              }
            }

            newNodes.push({
              id: a.id,
              type: 'trace',
              position: { x: 600, y: idx * 120 },
              data: { 
                label: labelStr, 
                type: 'api', 
                badge: a.type || 'API', 
                description: a.description || 'API endpoint',
                method,
                endpoint
              }
            });
            apiNodeIds.add(a.id);
          }
        });

        // 2. Loop over features and build chains
        aiFeatures.forEach((f: any, fIdx: number) => {
          const featureId = typeof f === 'string' ? `feat-${fIdx}` : (f.id || `feat-${fIdx}`);
          const featureName = typeof f === 'string' ? f : (f.title || f.name);
          const featureDesc = typeof f === 'string' ? "Feature requirements" : (f.description || "Core feature reqs");

          newNodes.push({
            id: featureId,
            type: 'trace',
            position: { x: 0, y: fIdx * 200 },
            data: { label: featureName, type: 'requirement', badge: `FEAT-${fIdx+1}`, description: featureDesc }
          });

          // Connect Feature to a Service
          const s = services[fIdx % services.length];
          if (s) {
            newEdges.push({
              id: `e-${featureId}-${s.id}`,
              source: featureId,
              target: s.id,
              animated: true,
              style: { stroke: '#52525b', strokeWidth: 2 }
            });

            // Connect Service to an API
            const a = apis[fIdx % apis.length];
            if (a) {
              const edgeId = `e-${s.id}-${a.id}`;
              if (!newEdges.find(e => e.id === edgeId)) {
                newEdges.push({
                  id: edgeId,
                  source: s.id,
                  target: a.id,
                  style: { stroke: '#52525b', strokeWidth: 2 }
                });
              }

              // Connect API to Tasks
              const featureTasks = aiTasks.filter((t: any) => typeof f === 'string' ? false : t.featureId === f.id);
              let ftTasks = featureTasks;
              // If no explicit featureId match, assign slice iteratively
              if (ftTasks.length === 0) {
                 const step = Math.max(1, Math.floor(aiTasks.length / aiFeatures.length));
                 ftTasks = aiTasks.slice(fIdx * step, (fIdx + 1) * step);
              }

              ftTasks.forEach((t: any) => {
                newNodes.push({
                  id: t.id,
                  type: 'trace',
                  position: { x: 900, y: taskY },
                  data: { label: t.title, type: 'task', badge: t.type || 'TASK', status: t.status || 'Open', description: t.description }
                });
                
                newEdges.push({
                  id: `e-${a.id}-${t.id}`,
                  source: a.id,
                  target: t.id,
                  style: { stroke: '#52525b', strokeWidth: 2 }
                });

                taskY += 80;
              });
            }
          }
        });

        const configuredEdges = newEdges.map(e => ({
          ...e, 
          markerEnd: { ...markerEnd, color: '#52525b' }
        }));

        if (newNodes.length > 0) {
          setNodes(newNodes);
          setEdges(configuredEdges);
          setOriginalEdges(configuredEdges); // Store dynamic edges for impact analysis traversal
        }
      } catch (err) {
        console.error("Failed to parse", err);
      }
    }
  }, [setNodes, setEdges]);

  // Impact Analysis (Recursive Discovery)
  const performImpactAnalysis = useCallback((nodeId: string) => {
    const affectedNodeIds = new Set<string>();
    const affectedEdgeIds = new Set<string>();

    const traverse = (id: string) => {
      affectedNodeIds.add(id);
      originalEdges.forEach(edge => {
        if (edge.source === id) {
          affectedEdgeIds.add(edge.id);
          traverse(edge.target);
        }
      });
    };

    traverse(nodeId);

    setNodes(nds => nds.map(n => ({
      ...n,
      data: {
        ...n.data,
        highlighted: affectedNodeIds.has(n.id),
        dimmed: !affectedNodeIds.has(n.id)
      }
    })));

    setEdges(eds => eds.map(e => ({
      ...e,
      animated: affectedEdgeIds.has(e.id),
      style: affectedEdgeIds.has(e.id) ? { stroke: '#ffffff', strokeWidth: 3 } : { stroke: '#3f3f46', opacity: 0.2 },
      markerEnd: affectedEdgeIds.has(e.id) ? { ...markerEnd, color: '#ffffff' } : { ...markerEnd, color: '#3f3f46' }
    })));

    setImpactAnalysis(true);
    toast({
      title: "Impact Analysis Loaded",
      description: `Analysis complete for ${nodeId}. Downstream dependencies highlighted.`,
      variant: "default"
    });
  }, [originalEdges, setNodes, setEdges, toast]);

  const resetAnalysis = useCallback(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, highlighted: false, dimmed: false }
    })));
    setEdges(eds => eds.map(e => ({
      ...e,
      animated: originalEdges.find(o => o.id === e.id)?.animated || false,
      style: { stroke: '#52525b', strokeWidth: 2 },
      markerEnd: { ...markerEnd, color: '#52525b' }
    })));
    setImpactAnalysis(false);
  }, [originalEdges, setNodes, setEdges]);

  // Node Selection Handler
  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
    if (node.data.type === 'requirement') {
      performImpactAnalysis(node.id);
    } else if (impactAnalysis) {
      // If already in analysis mode and clicked something else, don't reset yet unless desired
    }
  };

  const handleExport = () => {
    try {
      toast({ title: "Exporting Report", description: "Generating traceability and compliance PDF..." });
      
      const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for traceability matrix
      let yPos = 20;

      // Helper for clean text wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * 7);
      };

      // Header
      doc.setFontSize(22);
      doc.setTextColor(249, 115, 22); // Primary orange
      doc.text("Requirement Traceability Matrix", 20, yPos);
      yPos += 12;

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      const projectName = JSON.parse(localStorage.getItem("blueprint_project_data") || "{}").projectName || "Project";
      doc.text(projectName, 20, yPos);
      yPos += 20;

      // Table Header
      doc.setDrawColor(82, 82, 91);
      doc.setFillColor(24, 24, 27);
      doc.rect(20, yPos, 257, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.text("Requirement (Feature)", 25, yPos + 7);
      doc.text("Technical Service", 90, yPos + 7);
      doc.text("API Endpoint", 150, yPos + 7);
      doc.text("Implementation Task", 210, yPos + 7);
      yPos += 15;

      doc.setTextColor(50, 50, 50);
      doc.setFont("helvetica", "normal");

      // Generate Table Rows based on current nodes/edges structure
      const requirements = nodes.filter(n => n.data.type === 'requirement');
      
      requirements.forEach((req) => {
        const connectedEdges = edges.filter(e => e.source === req.id);
        
        connectedEdges.forEach((edgeS) => {
          const service = nodes.find(n => n.id === edgeS.target);
          if (!service) return;

          const apiEdges = edges.filter(e => e.source === service.id);
          
          apiEdges.forEach((edgeA) => {
            const api = nodes.find(n => n.id === edgeA.target);
            if (!api) return;

            const taskEdges = edges.filter(e => e.source === api.id);
            
            taskEdges.forEach((edgeT) => {
              const task = nodes.find(n => n.id === edgeT.target);
              if (!task) return;

              if (yPos > 180) {
                doc.addPage();
                yPos = 20;
                // Redraw Header on new page
                doc.setFillColor(24, 24, 27);
                doc.rect(20, yPos, 257, 10, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.text("Requirement (Feature)", 25, yPos + 7);
                doc.text("Technical Service", 90, yPos + 7);
                doc.text("API Endpoint", 150, yPos + 7);
                doc.text("Implementation Task", 210, yPos + 7);
                yPos += 15;
                doc.setTextColor(50, 50, 50);
                doc.setFont("helvetica", "normal");
              }

              doc.setFontSize(9);
              // Wrap text for columns
              const reqLines = doc.splitTextToSize(req.data.label, 60);
              const svcLines = doc.splitTextToSize(service.data.label, 55);
              const apiLines = doc.splitTextToSize(`${api.data.method} ${api.data.endpoint}`, 55);
              const taskLines = doc.splitTextToSize(task.data.label, 65);

              const rowHeight = Math.max(reqLines.length, svcLines.length, apiLines.length, taskLines.length) * 5 + 5;

              doc.text(reqLines, 25, yPos);
              doc.text(svcLines, 90, yPos);
              doc.text(apiLines, 150, yPos);
              doc.text(taskLines, 210, yPos);

              doc.setDrawColor(230, 230, 230);
              doc.line(20, yPos + rowHeight - 2, 277, yPos + rowHeight - 2);

              yPos += rowHeight;
            });
          });
        });
      });

      doc.save(`${projectName.replace(/\s+/g, '-').toLowerCase()}-traceability.pdf`);

      toast({
        title: "Export Success",
        description: "Traceability matrix has been downloaded."
      });
    } catch (err) {
      console.error("Export error", err);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate PDF matrix."
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <GitMerge className="w-8 h-8 text-primary" />
            Requirement Traceability
          </h1>
          <p className="text-zinc-400 mt-1">
            Map PRD requirements directly to services, APIs, and engine tasks.
          </p>
        </div>
        <div className="flex gap-3">
          {impactAnalysis && (
            <Button 
              variant="outline" 
              onClick={resetAnalysis}
              className="bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white"
            >
              Reset View
            </Button>
          )}
          <Button
            className="bg-primary hover:brightness-110 text-white gap-2 shadow-[0_0_15px_-3px_rgba(249,115,22,0.4)]"
            onClick={handleExport}
          >
            Export Traceability Matrix
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
        {/* Main Graph Panel */}
        <Card className="lg:col-span-3 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden relative">
          <CardHeader className="border-b border-zinc-800 bg-zinc-950/50 p-4 flex flex-row items-center justify-between z-10">
            <CardTitle className="text-white text-[10px] flex items-center gap-2 uppercase tracking-widest opacity-70">
              Lineage Graph Visualization
            </CardTitle>
            <div className="flex gap-4 text-[10px] font-bold uppercase overflow-x-auto pb-1 max-w-[50%]">
              <span className="flex items-center gap-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-blue-500" /> PRD</span>
              <span className="flex items-center gap-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-purple-500" /> Service</span>
              <span className="flex items-center gap-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-amber-500" /> API</span>
              <span className="flex items-center gap-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-green-500" /> Task</span>
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-0 bg-[#050505] relative">


            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
              colorMode="dark"
              minZoom={0.2}
              maxZoom={1.5}
            >
              <Background color="#111" gap={20} size={1} />
              <Controls position="bottom-right" className="bg-zinc-900 border-zinc-800" />
            </ReactFlow>
          </CardContent>
        </Card>

        {/* Side Detail Panel */}
        <AnimatePresence>
          {selectedNode ? (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${
                    selectedNode.data.type === 'requirement' ? 'bg-blue-500/10 text-blue-400' :
                    selectedNode.data.type === 'service' ? 'bg-purple-500/10 text-purple-400' :
                    selectedNode.data.type === 'api' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-green-500/10 text-green-400'
                  }`}>
                    <Info className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Node Details</h3>
                </div>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-zinc-800 rounded-md transition-colors text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-tighter">{selectedNode.data.badge}</span>
                    <Badge variant="outline" className="text-[9px] uppercase bg-zinc-950 border-zinc-800 text-zinc-400">
                      {selectedNode.data.type}
                    </Badge>
                  </div>
                  <h2 className="text-xl font-bold text-white leading-tight">{selectedNode.data.label}</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-zinc-500">Overview</label>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {selectedNode.data.description || "No detailed description available for this node."}
                  </p>
                </div>

                {selectedNode.data.type === 'api' && (
                  <div className="space-y-3 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Method:</span>
                      <span className="font-bold text-amber-400">{selectedNode.data.method}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Endpoint:</span>
                      <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-300 font-mono">{selectedNode.data.endpoint}</code>
                    </div>
                  </div>
                )}

                {selectedNode.data.type === 'task' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Status</label>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${selectedNode.data.status === 'Done' ? 'bg-green-500' : 'bg-amber-500 animation-pulse'}`} />
                          <span className="text-sm text-white font-medium">{selectedNode.data.status}</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500">Effort</label>
                        <div className="text-sm text-white font-medium">3 Story Pts</div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {selectedNode.data.type === 'requirement' && (
                <div className="p-4 bg-blue-500/5 border-t border-blue-500/20">
                  <p className="text-[10px] text-blue-400 font-medium leading-tight">
                    Selecting this requirement automatically performs a downstream impact analysis.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="lg:col-span-1 border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-zinc-950/20">
              <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                <Search className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-500 font-medium">Select a node to view traceability details and impact analysis.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}