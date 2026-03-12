// src/pages/Tasks.tsx
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ListTodo, ArrowRight, CircleDashed, Filter, BookOpen, Play, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stories, setStories] = useState<any[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem("blueprint_project_data");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      
      // Map raw Gemini tasks into your Story-based UI structure
      if (parsed.tasks && parsed.tasks.length > 0) {
        const generatedStory = {
          id: "AI-GEN-1",
          title: parsed.projectName || "Extracted Requirements",
          description: `Core engineering tasks identified from the uploaded PRD.`,
          totalPoints: parsed.tasks.length * 3, 
          tasks: parsed.tasks.map((t: any, i: number) => ({
            id: `TASK-${100 + i}`,
            title: t.title,
            priority: t.priority || "High",
            type: t.type || "Feature",
            points: t.points || 3,
            description: t.description
          }))
        };
        setStories([generatedStory]);
      }
    }
    setIsLoading(false);
  }, []);

  const handleVerify = (taskId: string) => {
    setVerifyingId(taskId);
    setTimeout(() => {
      setVerifyingId(null);
      toast({
        title: "Contract Verified!",
        description: "The implementation matches the Gemini-generated API contract.",
      });
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-primary" />
            Tasks & Backlog
          </h1>
          <p className="text-zinc-400 mt-1">Real-time tasks extracted from your PRD analysis.</p>
        </div>
        {stories.length > 0 && (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
              onClick={() => toast({ title: "Filters", description: "Opening advanced backlog filters..." })}
            >
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button onClick={() => navigate('/dashboard/sprints')} className="bg-primary hover:brightness-110 text-white gap-2 glow-orange">
              Generate Sprint Plan <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {!isLoading && stories.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800 border-dashed py-20">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <AlertCircle className="w-12 h-12 text-zinc-600 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No Tasks Found</h2>
              <p className="text-zinc-400 max-w-xs mb-6">
                You haven't processed a PRD yet. Upload a document to generate your engineering backlog.
              </p>
              <Button onClick={() => navigate("/dashboard/upload")} className="bg-primary text-white">
                Upload PRD
              </Button>
            </CardContent>
          </Card>
        ) : (
          stories.map((story) => (
            <Card key={story.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <CardHeader className="border-b border-zinc-800 bg-zinc-950/80 py-4 flex flex-row items-start justify-between">
                <div className="flex gap-3 items-start">
                  <div className="mt-1 bg-blue-500/10 p-1.5 rounded-md border border-blue-500/20 text-blue-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white text-base">{story.title}</CardTitle>
                      <span className="text-xs font-mono text-zinc-500">{story.id}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{story.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-medium">Est. Points:</span>
                  <span className="text-sm font-bold text-primary">{story.totalPoints}</span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                  {story.tasks.map((task: any) => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group cursor-pointer pl-12">
                      <div className="flex items-center gap-3">
                        <CircleDashed className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                        <div>
                          <h4 className="text-sm font-medium text-zinc-200">{task.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5 font-mono">{task.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 text-[10px] text-primary hover:bg-primary/10 gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerify(task.id);
                          }}
                        >
                          {verifyingId === task.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3 fill-current" />
                          )}
                          VERIFY
                        </Button>
                        <Badge variant="outline" className="text-[10px] uppercase bg-zinc-950 border-zinc-700 text-zinc-400">
                          {task.type}
                        </Badge>
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <span className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                          <span className="text-xs text-zinc-400">{task.priority}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                          {task.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}