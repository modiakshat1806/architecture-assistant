import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Github, Trello, Slack, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

const ClickUpIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5.385 13.911c.712-.511 1.631-.692 2.508-.491a4.341 4.341 0 011.696.864c.25.196.486.417.702.659.394.437.494.675 1.115.675.621 0 .721-.238 1.115-.675.216-.242.452-.463.702-.659a4.341 4.341 0 011.696-.864 3.737 3.737 0 012.508.491.439.439 0 01-.013.738l-4.706 3.124a1.295 1.295 0 01-1.42 0l-4.706-3.124a.439.439 0 01-.01-.738zM2.512 8.44l8.369-5.753c.677-.465 1.56-.465 2.237 0l8.369 5.753c.697.479.79 1.455.204 2.052l-2.008 2.049a.439.439 0 01-.637-.015l-4.108-4.223a.439.439 0 00-.731.314v8.834a.439.439 0 01-.439.439h-3.536a.439.439 0 01-.439-.439V8.911a.439.439 0 00-.731-.314l-4.108 4.223a.439.439 0 01-.637.015l-2.008-2.049c-.586-.597-.493-1.573.204-2.052z" />
  </svg>
);

export default function Automation() {
  const [connections, setConnections] = useState({
    github: true,
    clickup: false,
    slack: false
  });
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUserId(user.id);
      
      try {
        const res = await fetch(`http://localhost:5000/api/clickup/status?profileId=${user.id}`);
        const data = await res.json();
        if (data.isConnected) {
          setConnections(prev => ({ ...prev, clickup: true }));
        }
      } catch (err) {
        console.error("Failed to fetch ClickUp status", err);
      }
    };
    fetchStatus();
  }, []);

  const integrations = [
    { id: "github", name: "GitHub", desc: "Push scaffolded code directly to your repositories.", icon: Github },
    { id: "clickup", name: "ClickUp", desc: "Push sprints and tasks to your ClickUp Workspace.", icon: ClickUpIcon },
    { id: "slack", name: "Slack", desc: "Receive real-time notifications for architecture changes.", icon: Slack }
  ];

  const handleToggle = async (id: string) => {
    if (id === "clickup" && !connections.clickup) {
      if (!userId) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }
      toast({ title: "Redirecting...", description: "Taking you to ClickUp to authorize." });
      try {
        const res = await fetch("http://localhost:5000/api/clickup/auth-url");
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to fetch auth URL.", variant: "destructive" });
        return;
      }
    }

    const nextState = !connections[id as keyof typeof connections];
    setConnections(prev => ({ ...prev, [id]: nextState }));
    
    if (!nextState && id === "clickup") {
      // In a real app we'd also call a backend disconnect route
      toast({
        title: "Connection Severed",
        description: "ClickUp disconnected successfully.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Automations & Integrations
          </h1>
          <p className="text-zinc-400 mt-1">Connect your workspace to your engineering stack to sync code and tasks seamlessly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((int) => {
          const isConnected = connections[int.id as keyof typeof connections];
          return (
            <Card key={int.id} className={cn("bg-zinc-900 border transition-all duration-300", isConnected ? "border-primary/30 shadow-[0_0_15px_rgba(249,115,22,0.05)]" : "border-zinc-800")}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-colors", isConnected ? "bg-primary/10 text-primary" : "bg-zinc-950 text-zinc-500")}>
                    <int.icon className="w-6 h-6" />
                  </div>
                  <Switch 
                    checked={isConnected} 
                    onCheckedChange={() => handleToggle(int.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <CardTitle className="text-white text-xl">{int.name}</CardTitle>
                <CardDescription className="text-zinc-400 mt-2 h-10 leading-relaxed text-sm">{int.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 animate-pulse" /> 
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <AlertCircle className="w-4 h-4" /> 
                      Not connected
                    </div>
                  )}
                  {isConnected && (
                    <Badge variant="outline" className="text-[10px] uppercase border-primary/20 bg-primary/5 text-primary">Active</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </DashboardLayout>
  );
}