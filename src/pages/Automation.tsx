// src/pages/Automation.tsx
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  Github, 
  Trello, // Using Trello icon as a stand-in for Kanban/ClickUp
  Slack, 
  Workflow,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";

// Mock data for integrations
const initialIntegrations = [
  {
    id: "github",
    name: "GitHub",
    description: "Automatically create repositories, branch workflows, and push scaffolded code.",
    icon: Github,
    connected: true,
    account: "blueprint-dev-team"
  },
  {
    id: "jira",
    name: "Jira Software",
    description: "Sync generated architecture tasks directly into your project backlogs and sprints.",
    icon: Trello, // Placeholder for Jira/ClickUp
    connected: false,
    account: null
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receive notifications when PRD processing is complete and architecture is ready.",
    icon: Slack,
    connected: false,
    account: null
  }
];

export default function Automation() {
  const [integrations, setIntegrations] = useState(initialIntegrations);

  const toggleConnection = (id: string) => {
    setIntegrations(integrations.map(integration => {
      if (integration.id === id) {
        return { 
          ...integration, 
          connected: !integration.connected,
          account: !integration.connected ? "user-workspace-connected" : null
        };
      }
      return integration;
    }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Automations</h1>
            <p className="text-zinc-400 mt-1">Connect your workspace to your favorite development tools.</p>
          </div>
          <Button className="bg-primary hover:brightness-110 text-white gap-2">
            <Workflow className="w-4 h-4" /> Custom Webhook
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            
            return (
              <Card key={integration.id} className={`
                bg-zinc-900 border transition-all
                ${integration.connected ? "border-primary-500/30" : "border-zinc-800"}
              `}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className={`
                      w-12 h-12 rounded-xl flex items-center justify-center mb-2
                      ${integration.connected ? "bg-primary-500/10 text-primary-400" : "bg-zinc-950 text-zinc-400"}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Switch 
                      checked={integration.connected} 
                      onCheckedChange={() => toggleConnection(integration.id)}
                      className="data-[state=checked]:bg-orange-600"
                    />
                  </div>
                  <CardTitle className="text-white text-xl">{integration.name}</CardTitle>
                  <CardDescription className="text-zinc-400 mt-2 h-12">
                    {integration.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                    {integration.connected ? (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">{integration.account}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <AlertCircle className="w-4 h-4" />
                        Not connected
                      </div>
                    )}
                    
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 px-2">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}