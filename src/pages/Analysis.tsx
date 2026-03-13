// src/pages/Analysis.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast"; // <-- 1. ADDED IMPORT
import { FileText, ListTodo, Zap, Clock, Network, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

interface ParsedData {
  projectName: string;
  features: string[];
  stories: { id: string; story: string; acceptanceCriteria: string[] }[];
  tasks: { id: string; title: string; complexity: number }[];
  healthScore: { score: number; issues: string[] };
}

const ambiguities = [
  { id: "amb-1", feature: "Authentication", text: "OAuth redirect URLs for staging env not defined.", severity: "Medium" },
  { id: "amb-2", feature: "Payments", text: "Currency support (multi-currency vs single) is unclear.", severity: "High" }
];

const mockData: ParsedData = {
  projectName: "E-Commerce Replatforming",
  features: ["Multi-tenant Auth", "Real-time Dashboards", "Event Sourcing"],
  stories: [],
  tasks: [],
  healthScore: { score: 92, issues: [] }
};

const mockFeatures = [
  { id: "feat-1", title: "Distributed Authentication", description: "Migrate JWT logic to a dedicated microservice with Redis session management.", complexity: "High", tasks: 8 },
  { id: "feat-2", title: "Real-time Event Bridge", description: "Implement WebSocket gateway for live data broadcasting to client widgets.", complexity: "Medium", tasks: 12 },
  { id: "feat-3", title: "Multi-tenant Data Isolation", description: "Row-level security policies for core PostgreSQL databases.", complexity: "High", tasks: 5 },
];

const mockAmbiguities = [
  { id: "amb-1", title: "OAuth Redirect URLs", description: "Redirect URLs for the staging environment are not explicitly defined in the security spec.", severity: "Medium" },
  { id: "amb-2", title: "Currency Support", description: "Unclear if the payment gateway needs to support multi-currency or single-currency transactions initially.", severity: "High" },
  { id: "amb-3", title: "Token Revocation", description: "Method for revoking tokens before expiration (e.g. blacklist vs database check) is not specified.", severity: "Medium" },
];

const mockMissingRequirements = [
  { id: "miss-1", title: "Rate Limiting", description: "Missing specific throughput requirements and rate limiting policies for the authentication endpoints.", feature: "Authentication" },
  { id: "miss-2", title: "Connection Timeouts", description: "Timeout intervals for WebSocket connections and automatic reconnection strategy are absent.", feature: "Real-time Bridge" },
  { id: "miss-3", title: "Audit Logging", description: "No requirement for auditing RLS bypass attempts or database administrative actions.", feature: "Data Isolation" },
];

export default function Analysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<ParsedData>(mockData);
  const [extractedFeatures, setExtractedFeatures] = useState<any[]>(mockFeatures);
  const [detectedAmbiguities, setDetectedAmbiguities] = useState<any[]>(mockAmbiguities);
  const [missingRequirements, setMissingRequirements] = useState<any[]>(mockMissingRequirements);

  useEffect(() => {
    const rawData = localStorage.getItem("blueprint_project_data");
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.analysis) {
          setData(parsed.analysis);
        }
        if (parsed.features) {
          setExtractedFeatures(parsed.features);
        }
        // In a real app we'd load these from the parsed data too
        // if (parsed.ambiguities) setDetectedAmbiguities(parsed.ambiguities);
        // if (parsed.missingRequirements) setMissingRequirements(parsed.missingRequirements);
      } catch (e) {
        console.error("Error parsing blueprint data", e);
      }
    }
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{data.projectName}</h1>
          <p className="text-zinc-400 mt-1">Technical Roadmap</p>
        </div>
        <div className="flex gap-3">
          {/* 3. WIRED UP DEAD BUTTON */}
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
        {/* Panel 2: Main Content Area (col-span-9) */}
        <div className="lg:col-span-9 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Section 1: Extracted Features */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-primary-500" />
                  Extracted Features
                </div>
                <span className="bg-primary/10 text-primary-400 px-2 py-0.5 rounded text-xs font-medium">
                  {extractedFeatures.length} Found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {extractedFeatures.map((feature) => (
                  <AccordionItem key={feature.id} value={feature.id} className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:text-primary-400 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-4 h-4 text-green-500 hidden sm:block" />
                        <span>{feature.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      <p className="mb-4">{feature.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                          <Zap className="w-3 h-3 text-amber-500" />
                          Complexity: <span className="text-white">{feature.complexity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                          <ListTodo className="w-3 h-3 text-primary-500" />
                          <span className="text-white">{feature.tasks}</span> Tasks Generated
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
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
              <Accordion type="single" collapsible className="w-full">
                {detectedAmbiguities.map((ambiguity) => (
                  <AccordionItem key={ambiguity.id} value={ambiguity.id} className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:text-amber-400 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <AlertCircle className="w-4 h-4 text-amber-500 hidden sm:block" />
                        <span>{ambiguity.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      <p className="mb-4">{ambiguity.description}</p>
                      <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800 w-fit">
                        <span className="text-zinc-500 capitalize">Severity:</span>
                        <span className={cn(
                          "font-bold",
                          ambiguity.severity === "High" ? "text-red-400" : "text-amber-400"
                        )}>{ambiguity.severity}</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Section 3: Missing Requirements */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-red-500" />
                  Missing Requirements
                </div>
                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-medium">
                  {missingRequirements.length} Identified
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
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
                      <p className="mb-4">{req.description}</p>
                      <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800 w-fit">
                        <span className="text-zinc-500">Feature:</span>
                        <span className="text-white">{req.feature}</span>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Panel 3: Metrics & Overview (col-span-3) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Project Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">High</div>
              <p className="text-xs text-zinc-500">Based on security and real-time requirements.</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                Estimated Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">4-6 Weeks</div>
              <p className="text-xs text-zinc-500">Assumes a team of 3 developers.</p>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}