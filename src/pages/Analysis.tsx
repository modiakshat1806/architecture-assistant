// src/pages/Analysis.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { FileText, ListTodo, Zap, Clock, Network, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface ParsedData {
  projectName: string;
  features: any[];
  stories: any[];
  tasks: any[];
  healthScore: { score: number; issues: string[] };
}

const fallbackData: ParsedData = {
  projectName: "Analyzing Project...",
  features: [],
  stories: [],
  tasks: [],
  healthScore: { score: 0, issues: [] }
};

export default function Analysis() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dynamic States
  const [data, setData] = useState<ParsedData>(fallbackData);
  const [extractedFeatures, setExtractedFeatures] = useState<any[]>([]);
  const [detectedAmbiguities, setDetectedAmbiguities] = useState<any[]>([]);
  const [missingRequirements, setMissingRequirements] = useState<any[]>([]);

  useEffect(() => {
    const rawData = localStorage.getItem("blueprint_project_data");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);

        // 1. Set Top-level Data
        setData({
          projectName: parsed.projectName || "Untitled Project",
          features: parsed.features || [],
          stories: parsed.stories || [],
          tasks: parsed.tasks || [],
          healthScore: parsed.healthScore || { score: 0, issues: [] }
        });

        // 2. Safely format Features
        if (parsed.features && Array.isArray(parsed.features)) {
          const formattedFeatures = parsed.features.map((f: any, index: number) => {
            if (typeof f === 'string') {
              return { id: `feat-${index}`, title: f, description: "Extracted feature.", complexity: "Medium", tasks: 0 };
            }
            return {
              id: f.id || `feat-${index}`,
              title: f.title || f.name || "Unnamed Feature",
              description: f.description || "No description provided.",
              complexity: f.complexity || "Medium",
              tasks: f.tasks?.length || f.taskCount || 0
            };
          });
          setExtractedFeatures(formattedFeatures);
        }

        // 3. Safely format Ambiguities
        if (parsed.ambiguities && Array.isArray(parsed.ambiguities)) {
          const formattedAmbiguities = parsed.ambiguities.map((a: any, index: number) => {
            if (typeof a === 'string') {
              return { id: `amb-${index}`, title: "Detected Ambiguity", description: a, severity: "Medium" };
            }
            return {
              id: a.id || `amb-${index}`,
              title: a.title || a.issue || "Detected Ambiguity",
              description: a.description || a.context || a.text || "Needs clarification.",
              severity: a.severity || "Medium"
            };
          });
          setDetectedAmbiguities(formattedAmbiguities);
        }

        // 4. Map AI 'Clarifications' to your 'Missing Requirements' UI
        if (parsed.clarifications && Array.isArray(parsed.clarifications)) {
          const formattedMissing = parsed.clarifications.map((req: any, index: number) => {
            if (typeof req === 'string') {
              return { id: `miss-${index}`, title: "Missing Detail", description: req, feature: "General" };
            }
            return {
              id: req.id || `miss-${index}`,
              title: req.title || req.question || "Clarification Needed",
              description: req.description || req.reason || req.context || "Required for accurate architecture.",
              feature: req.feature || req.category || "General Architecture"
            };
          });
          setMissingRequirements(formattedMissing);
        }

      } catch (e) {
        console.error("Error parsing blueprint data", e);
      }
    }
  }, []);

  // Dynamic estimations based on actual AI generated tasks
  const totalTasks = data.tasks.length || extractedFeatures.reduce((acc, f) => acc + (f.tasks || 0), 0);
  const estimatedWeeks = Math.max(1, Math.ceil(totalTasks / 15));
  const overallComplexity = totalTasks > 50 ? "High" : totalTasks > 20 ? "Medium" : "Low";

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{data.projectName}</h1>
          <p className="text-zinc-400 mt-1">Technical Roadmap & Analysis</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="bg-orange-600 border-orange-700 text-white hover:bg-orange-700"
            onClick={() => toast({ title: "Exporting Report", description: "Generating PDF analysis report..." })}
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* 3-Panel Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">

        {/* Main Content Area (col-span-9) */}
        <div className="lg:col-span-9 space-y-6 overflow-y-auto pr-2 custom-scrollbar">

          {/* Section 1: Extracted Features */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-primary" />
                  Extracted Features
                </div>
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                  {extractedFeatures.length} Found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {extractedFeatures.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {extractedFeatures.map((feature) => (
                    <AccordionItem key={feature.id} value={feature.id} className="border-zinc-800">
                      <AccordionTrigger className="text-white hover:text-primary hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <CheckCircle2 className="w-4 h-4 text-green-500 hidden sm:block shrink-0" />
                          <span>{feature.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400">
                        <p className="mb-4 leading-relaxed">{feature.description}</p>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Complexity: <span className="text-white font-medium ml-1">{feature.complexity}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800">
                            <ListTodo className="w-3.5 h-3.5 text-primary" />
                            <span className="text-white font-medium mx-1">{feature.tasks}</span> Tasks
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-sm">No features extracted.</div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: Ambiguities Detected */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Ambiguities Detected
                </div>
                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-medium">
                  {detectedAmbiguities.length} Found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {detectedAmbiguities.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {detectedAmbiguities.map((ambiguity) => (
                    <AccordionItem key={ambiguity.id} value={ambiguity.id} className="border-zinc-800">
                      <AccordionTrigger className="text-white hover:text-amber-400 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <AlertCircle className="w-4 h-4 text-amber-500 hidden sm:block shrink-0" />
                          <span>{ambiguity.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400">
                        <p className="mb-4 leading-relaxed">{ambiguity.description}</p>
                        <div className="flex items-center gap-2 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800 w-fit">
                          <span className="text-zinc-500 capitalize">Severity:</span>
                          <span className={cn(
                            "font-bold",
                            ambiguity.severity?.toLowerCase() === "high" ? "text-red-400" : "text-amber-400"
                          )}>{ambiguity.severity}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-sm">No ambiguities detected in PRD!</div>
              )}
            </CardContent>
          </Card>

          {/* Section 3: Missing Requirements (Mapped from AI Clarifications) */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-red-500" />
                  Missing Requirements / Clarifications
                </div>
                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-medium">
                  {missingRequirements.length} Identified
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {missingRequirements.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {missingRequirements.map((req) => (
                    <AccordionItem key={req.id} value={req.id} className="border-zinc-800">
                      <AccordionTrigger className="text-white hover:text-red-400 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0" />
                          <span>{req.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400">
                        <p className="mb-4 leading-relaxed">{req.description}</p>
                        <div className="flex items-center gap-2 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800 w-fit">
                          <span className="text-zinc-500">Related Feature:</span>
                          <span className="text-white font-medium">{req.feature}</span>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-6 text-zinc-500 text-sm">All core requirements are clearly defined.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Panel 3: Metrics & Overview (col-span-3) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                PRD Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-white mb-1">
                {data.healthScore.score}<span className="text-xl text-zinc-500 font-bold">/100</span>
              </div>
              <p className="text-xs text-zinc-500">Based on clarity and completeness.</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Project Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">{overallComplexity}</div>
              <p className="text-xs text-zinc-500">Derived from {totalTasks} architectural tasks.</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                Estimated Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">~{estimatedWeeks} Weeks</div>
              <p className="text-xs text-zinc-500">Assumes standard agile velocity.</p>
            </CardContent>
          </Card>



        </div>
      </div>
    </DashboardLayout>
  );
}