// src/pages/Analysis.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { ListTodo, Zap, Network, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";

interface ParsedData {
  projectName: string;
  features: string[];
  stories: { id: string; story: string; acceptanceCriteria: string[] }[];
  tasks: { id: string; title: string; complexity: number }[];
  healthScore: { score: number; issues: string[] };
}

export default function Analysis() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<ParsedData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
  const rawSavedData = localStorage.getItem("blueprint_project_data");
  
  if (rawSavedData) {
    try {
      const parsed = JSON.parse(rawSavedData);
      const root = parsed.data || parsed;

      // 1. Stories Recovery (Keep this, it's working!)
      let finalStories = root.stories || root.userStories || [];
      if (finalStories.length === 0 && root.features) {
        finalStories = root.features.map((f: string, i: number) => ({
          id: `US-${i + 1}`,
          story: f,
          acceptanceCriteria: ["Technical requirement must be verified"]
        }));
      }

      // 2. Health Score - Let's be less restrictive. 
      // Even if the score is 0, we want to show it.
      const rawHealth = root.healthScore || root.health_score || { score: 0, issues: ["No issues identified"] };

      const validatedData: ParsedData = {
        projectName: root.projectName || root.project_name || "Project Analysis",
        features: root.features || [],
        stories: finalStories,
        tasks: root.tasks || root.backlog || [],
        healthScore: {
          // Explicitly check for 'undefined' rather than 'falsy' (since 0 is falsy)
          score: rawHealth.score !== undefined ? rawHealth.score : 0,
          issues: Array.isArray(rawHealth.issues) && rawHealth.issues.length > 0 
            ? rawHealth.issues 
            : ["Analysis complete"]
        }
      };

      console.log("RE-VERIFIED DATA:", validatedData);
      setData(validatedData);
    } catch (error) {
      console.error("Mapping Error:", error);
    }
  }
  setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]"><Loader2 className="animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <AlertCircle className="w-12 h-12 text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Analysis Data</h2>
          <Button onClick={() => navigate("/dashboard/upload")} className="bg-primary text-white">Go to Upload</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{data.projectName}</h1>
          <p className="text-zinc-400 mt-1">Technical Roadmap</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white">Export</Button>
          <Button onClick={() => navigate("/dashboard/tasks")} className="bg-primary text-white gap-2">
            View Tasks <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Panel 1: Health */}
        <Card className="lg:col-span-3 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Health
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-center mb-4">
              <p className="text-4xl font-black text-green-500">{data.healthScore.score}%</p>
            </div>
            <ul className="space-y-2 text-sm text-zinc-400">
              {data.healthScore.issues.map((issue, i) => (
                <li key={i} className="flex gap-2"><span className="text-amber-500">•</span>{issue}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Panel 2: Stories */}
        <Card className="lg:col-span-6 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
            <CardTitle className="text-white text-sm flex items-center justify-between">
              <div className="flex items-center gap-2"><ListTodo className="w-4 h-4 text-primary" /> Stories</div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{data.stories.length}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4">
            <Accordion type="single" collapsible className="w-full">
              {data.stories.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-zinc-800">
                  <AccordionTrigger className="text-white text-sm hover:no-underline py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-[10px]">{item.id}</span>
                      <span className="text-left">{item.story}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 bg-zinc-950/30 p-4 rounded-md">
                    <p className="text-[10px] font-bold uppercase mb-2">Acceptance Criteria</p>
                    <ul className="space-y-1">
                      {item.acceptanceCriteria.map((ac, i) => (
                        <li key={i} className="text-xs flex gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" />{ac}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Panel 3: Stats */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-2"><Zap className="w-4 h-4 text-amber-500" /> Tasks</div>
            <div className="text-3xl font-bold text-white">{data.tasks.length}</div>
          </CardContent></Card>
          <Card className="bg-zinc-900 border-zinc-800"><CardContent className="pt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase mb-2"><Network className="w-4 h-4 text-primary" /> Modules</div>
            <div className="text-3xl font-bold text-white">{data.features.length}</div>
          </CardContent></Card>
        </div>
      </div>
    </DashboardLayout>
  );
}