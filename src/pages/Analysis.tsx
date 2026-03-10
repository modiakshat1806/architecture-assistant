// src/pages/Analysis.tsx
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { FileText, ListTodo, Zap, Clock, Network, ArrowRight, CheckCircle2 } from "lucide-react";

// Mock data for the parsed PRD
const extractedFeatures = [
  {
    id: "feat-1",
    title: "User Authentication System",
    description: "JWT-based authentication with OAuth2 providers (Google, GitHub).",
    complexity: "High",
    tasks: 8
  },
  {
    id: "feat-2",
    title: "Real-time Dashboard",
    description: "WebSocket connection for live data updates and analytics visualization.",
    complexity: "Medium",
    tasks: 5
  },
  {
    id: "feat-3",
    title: "Payment Gateway Integration",
    description: "Stripe integration for subscription billing and invoicing.",
    complexity: "High",
    tasks: 12
  }
];

export default function Analysis() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PRD Analysis</h1>
          <p className="text-zinc-400 mt-1">Review the extracted requirements and system complexity.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800">
            Export Report
          </Button>
          <Button 
            onClick={() => navigate("/dashboard/architecture")}
            className="bg-primary hover:brightness-110 text-white gap-2"
          >
            View Architecture <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 3-Panel Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Panel 1: Original Source (col-span-3) */}
        <Card className="lg:col-span-3 bg-zinc-900 border-zinc-800 flex flex-col hidden lg:flex overflow-hidden">
          <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
            <CardTitle className="text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              Source Document
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 text-sm text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap">
            {`# Project: V2 Platform Refactor\n\n## 1. Overview\nThe goal of this project is to migrate the legacy monolithic authentication system to a distributed microservice... \n\n## 2. Core Requirements\n- Must support multi-tenant data isolation.\n- JWT tokens with 15-minute expiration.\n- Real-time event broadcasting for dashboard widgets.\n\n## 3. Non-Functional\n- 99.9% uptime SLA.\n- Response time < 200ms for core API routes.`}
          </CardContent>
        </Card>

        {/* Panel 2: Extracted Features (col-span-6) */}
        <Card className="lg:col-span-6 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
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
          <CardContent className="flex-1 overflow-y-auto p-4">
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
                    <div className="flex gap-4">
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

          <Card className="bg-gradient-to-br from-primary-900/20 to-zinc-900 border-primary-900/50 flex-1">
            <CardHeader>
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Network className="w-4 h-4 text-primary-400" />
                Next Step
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 mb-4">
                We've mapped these features to a microservices architecture diagram. 
              </p>
              <Button 
                onClick={() => navigate("/dashboard/architecture")}
                className="w-full bg-primary hover:brightness-110 text-white"
              >
                View Architecture Diagram
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}