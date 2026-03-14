import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Github, Trello, Slack, CheckCircle2, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const backendBase = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [connections, setConnections] = useState({
    github: false,
    clickup: false,
    slack: false
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // GitHub State
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [linkedRepo, setLinkedRepo] = useState("");
  const [newRepoName, setNewRepoName] = useState("");

  // Slack State
  const [slackChannels, setSlackChannels] = useState<any[]>([]);
  const [selectedSlackChannel, setSelectedSlackChannel] = useState("");
  const [slackWorkspace, setSlackWorkspace] = useState("");
  const [slackSelectedChannelName, setSlackSelectedChannelName] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const savedProject = localStorage.getItem("blueprint_project_id");
      if (savedProject) setProjectId(savedProject);

      fetchClickUpStatus(user.id);
      fetchGitHubStatus(user.id, savedProject);
      fetchSlackStatus(user.id);
    };
    init();
  }, []);

  const fetchClickUpStatus = async (uid: string) => {
    try {
      const res = await fetch(`${backendBase}/api/clickup/status?profileId=${uid}`);
      const data = await res.json();
      if (data.isConnected) {
        setConnections(prev => ({ ...prev, clickup: true }));
      }
    } catch (err) {
      console.error("Failed to fetch ClickUp status", err);
    }
  };

  const fetchGitHubStatus = async (uid: string, pid: string | null) => {
    try {
      const res = await fetch(`${backendBase}/api/github/connection?profileId=${uid}`);
      const data = await res.json();
      if (data.connected) {
        setConnections(prev => ({ ...prev, github: true }));
        loadGitHubRepos(uid);
        if (pid) loadLinkedRepo(pid);
      }
    } catch (err) {
      console.error("Failed to fetch GitHub status", err);
    }
  };

  const loadGitHubRepos = async (uid: string) => {
    try {
      const res = await fetch(`${backendBase}/api/github/repos?profileId=${uid}`);
      const data = await res.json();
      if (data.repos) setRepos(data.repos);
    } catch (err) {
      console.error("Failed to load GitHub repos", err);
    }
  };

  const loadLinkedRepo = async (pid: string) => {
    try {
      const res = await fetch(`${backendBase}/api/github/projects/${pid}/link-repo`);
      const data = await res.json();
      if (data.mapping) {
        setLinkedRepo(`${data.mapping.owner}/${data.mapping.repo}`);
        setSelectedRepo(`${data.mapping.owner}/${data.mapping.repo}`);
      }
    } catch (err) {
      console.error("Failed to load linked repo", err);
    }
  };

  const fetchSlackStatus = async (uid: string) => {
    try {
      const res = await fetch(`${backendBase}/api/slack/connection?profileId=${uid}`);
      const data = await res.json();
      if (data.connected) {
        setConnections(prev => ({ ...prev, slack: true }));
        setSlackWorkspace(data.connection.workspaceName);
        setSlackSelectedChannelName(data.connection.channelName);
        setSelectedSlackChannel(data.connection.channelId);
        loadSlackChannels(uid);
      }
    } catch (err) {
      console.error("Failed to fetch Slack status", err);
    }
  };

  const loadSlackChannels = async (uid: string) => {
    try {
      const res = await fetch(`${backendBase}/api/slack/channels?profileId=${uid}`);
      const data = await res.json();
      if (data.channels) setSlackChannels(data.channels);
    } catch (err) {
      console.error("Failed to load Slack channels", err);
    }
  };

  const createRepo = async () => {
    if (!userId || !newRepoName) return;
    const res = await fetch(`${backendBase}/api/github/repos/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: userId, name: newRepoName, isPrivate: true })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create repo");
    loadGitHubRepos(userId);
    setNewRepoName("");
    return data.repo;
  };

  const linkRepo = async () => {
    if (!userId || !projectId || !selectedRepo) return;
    const [owner, repo] = selectedRepo.split("/");
    const res = await fetch(`${backendBase}/api/github/projects/${projectId}/link-repo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: userId, owner, repo, allowRelink: true })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to link repo");
    setLinkedRepo(selectedRepo);
  };

  const pushProject = async () => {
    if (!userId || !projectId || !linkedRepo) return;
    
    // Get generated files from localStorage (saved in CodeGenerator.tsx)
    const rawFiles = localStorage.getItem("generatedCodeFiles");
    if (!rawFiles) {
      toast({ title: "No Code", description: "Generate code in the Code Scaffolding page first.", variant: "destructive" });
      return;
    }
    const files = JSON.parse(rawFiles);

    toast({ title: "Pushing...", description: "Pushing code to GitHub repository." });
    
    const res = await fetch(`${backendBase}/api/github/projects/${projectId}/push`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        files, 
        branch: "main", 
        commitMessage: "feat: initial blueprint scaffold" 
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to push code");
    toast({ title: "Success", description: "Code pushed to GitHub successfully!" });
  };

  const selectSlackChannel = async (cid: string) => {
    if (!userId) return;
    const channel = slackChannels.find(c => c.slackChannelId === cid);
    const res = await fetch(`${backendBase}/api/slack/channel/select`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: userId, channelId: cid, channelName: channel?.name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to select channel");
    setSelectedSlackChannel(cid);
    setSlackSelectedChannelName(channel?.name || cid);
  };

  const testSlack = async () => {
    if (!userId) return;
    const res = await fetch(`${backendBase}/api/slack/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to send test message");
  };

  const disconnectSlack = async () => {
    if (!userId) return;
    const res = await fetch(`${backendBase}/api/slack/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to disconnect Slack");
    setConnections(prev => ({ ...prev, slack: false }));
    setSlackWorkspace("");
    setSlackSelectedChannelName("");
    setSelectedSlackChannel("");
  };

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
        const res = await fetch(`${backendBase}/api/clickup/auth-url`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Backend failed to generate ClickUp URL.");
        }

        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error("No authorization URL returned from backend.");
        }
      } catch (err: any) {
        toast({ 
          title: "ClickUp Auth Error", 
          description: err.message || "Failed to fetch auth URL.", 
          variant: "destructive" 
        });
        console.error("ClickUp Auth Error:", err);
        return;
      }
    }

    if (id === "github" && !connections.github) {
      if (!userId) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }
      toast({ title: "Redirecting...", description: "Taking you to GitHub to authorize." });
      try {
        const res = await fetch(`${backendBase}/api/github/oauth/start?profileId=${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get GitHub auth URL");
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error("No URL returned from backend");
        }
      } catch (err: any) {
        toast({ title: "GitHub Auth Error", description: err.message, variant: "destructive" });
        return;
      }
    }

    if (id === "slack" && !connections.slack) {
      if (!userId) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }
      toast({ title: "Redirecting...", description: "Taking you to Slack to authorize." });
      try {
        const res = await fetch(`${backendBase}/api/slack/oauth/start?profileId=${userId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to get Slack auth URL");
        if (data.url) {
          window.location.href = data.url;
          return;
        } else {
          throw new Error("No URL returned from backend");
        }
      } catch (err: any) {
        toast({ title: "Slack Auth Error", description: err.message, variant: "destructive" });
        return;
      }
    }

    const nextState = !connections[id as keyof typeof connections];
    setConnections(prev => ({ ...prev, [id]: nextState }));

    if (!nextState && id === "clickup") {
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
            Automations &amp; Integrations
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
                    className="data-[state=checked]:bg-green-500"
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

                {/* ── GitHub card body ── */}
                {int.id === "github" && (
                  <div className="mt-4 space-y-3">
                    <div className="text-xs text-zinc-500 break-all">projectId: {projectId || "(missing)"}</div>
                    <div className="text-xs text-zinc-500 break-all">linked: {linkedRepo || "(not linked)"}</div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300">Select repository</Label>
                      <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Choose repo" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                          {repos.length === 0 && (
                            <div className="px-2 py-2 text-xs text-zinc-400">No repositories found for this GitHub account.</div>
                          )}
                          {repos.map((repo) => (
                            <SelectItem key={repo.fullName} value={repo.fullName}>
                              {repo.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        placeholder="new repo name"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        className="bg-zinc-950 border-zinc-700 text-zinc-100"
                      />
                      <Button disabled={busy || !connections.github} onClick={() => {
                        setBusy(true);
                        createRepo()
                          .then(() => toast({ title: "Repository created" }))
                          .catch((error: any) => toast({ title: "Create repo failed", description: error.message, variant: "destructive" }))
                          .finally(() => setBusy(false));
                      }}>
                        Create
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button className="w-full" disabled={busy || !connections.github || !selectedRepo} onClick={() => {
                        setBusy(true);
                        linkRepo()
                          .then(() => toast({ title: "Repository linked" }))
                          .catch((error: any) => toast({ title: "Link failed", description: error.message, variant: "destructive" }))
                          .finally(() => setBusy(false));
                      }}>
                        Link Repo
                      </Button>
                      <Button className="w-full" disabled={busy || !connections.github || !linkedRepo} onClick={() => {
                        setBusy(true);
                        pushProject()
                          .catch((error: any) => toast({ title: "Push failed", description: error.message, variant: "destructive" }))
                          .finally(() => setBusy(false));
                      }}>
                        Push
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── Slack card body ── */}
                {int.id === "slack" && connections.slack && (
                  <div className="mt-4 space-y-3">
                    <div className="text-xs text-zinc-500 break-all">
                      workspace: {slackWorkspace || "(unknown)"}
                    </div>
                    <div className="text-xs text-zinc-500 break-all">
                      channel: {slackSelectedChannelName || "(none selected)"}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300">Select channel</Label>
                      <Select value={selectedSlackChannel} onValueChange={(val) => {
                        setBusy(true);
                        selectSlackChannel(val)
                          .then(() => toast({ title: "Channel selected" }))
                          .catch((error: any) => toast({ title: "Channel select failed", description: error.message, variant: "destructive" }))
                          .finally(() => setBusy(false));
                      }}>
                        <SelectTrigger className="bg-zinc-950 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Choose channel" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
                          {slackChannels.length === 0 && (
                            <div className="px-2 py-2 text-xs text-zinc-400">No channels found. Invite the bot to channels first.</div>
                          )}
                          {slackChannels.map((ch) => (
                            <SelectItem key={ch.slackChannelId} value={ch.slackChannelId}>
                              #{ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="w-full"
                        disabled={busy || !selectedSlackChannel}
                        onClick={() => {
                          setBusy(true);
                          testSlack()
                            .then(() => toast({ title: "Test message sent", description: "Check your Slack channel." }))
                            .catch((error: any) => toast({ title: "Test failed", description: error.message, variant: "destructive" }))
                            .finally(() => setBusy(false));
                        }}
                      >
                        Send Test
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-red-800/30 text-red-400 hover:bg-red-950/20"
                        disabled={busy}
                        onClick={() => {
                          setBusy(true);
                          disconnectSlack()
                            .then(() => toast({ title: "Slack disconnected" }))
                            .catch((error: any) => toast({ title: "Disconnect failed", description: error.message, variant: "destructive" }))
                            .finally(() => setBusy(false));
                        }}
                      >
                        Disconnect
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

    </DashboardLayout>
  );
}