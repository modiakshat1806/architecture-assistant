// src/pages/Demo.tsx
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, MessageSquare, MessageSquareMore, ListChecks, Calendar,
  Network, GitBranch, Code2, FlaskConical, TestTube, Zap,
  ArrowRight, CheckCircle2, CircleDashed, Clock, Folder, FileCode2, FileJson,
  GitMerge, FileText, Server, Database, Globe, BookOpen,
  Lock, CreditCard, Github, Trello, Slack, AlertCircle, Layout, Menu, Search, X, Layers,
  ListTodo, ClipboardList, Store, Truck, Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProject, demoAnalysis, demoChatMessages } from '@/data/demo/project';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Testing from '@/pages/Testing';
import { ReactFlow, Background, Controls, Handle, Position, MarkerType, useNodesState, useEdgesState } from '@xyflow/react';
import JSZip from 'jszip';
import '@xyflow/react/dist/style.css';

type DemoPage = 'overview' | 'analysis' | 'chat' | 'tasks' | 'sprints' | 'architecture' | 'traceability' | 'code' | 'tests' | 'automation';

const navItems: { key: DemoPage; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analysis', label: 'PRD Analysis', icon: FileText },
  { key: 'chat', label: 'Chat & Clarify', icon: MessageSquareMore },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'sprints', label: 'Sprints', icon: Calendar },
  { key: 'architecture', label: 'Architecture', icon: Network },
  { key: 'traceability', label: 'Traceability', icon: GitMerge },
  { key: 'code', label: 'Code Generator', icon: Code2 },
  { key: 'tests', label: 'Testing', icon: TestTube },
  { key: 'automation', label: 'Automation', icon: Zap },
];

function DemoBanner() {
  return (
    <div className="flex items-center justify-between px-6 py-2.5 bg-primary/10 border-b border-primary/20 text-primary">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <p className="text-sm font-medium">
          You are viewing a read-only Demo of the <strong>Food Delivery Platform</strong> project.
        </p>
      </div>
    </div>
  );
}

// --- OVERVIEW, ANALYSIS, CHAT PANELS ---
function OverviewPanel() {
  const p = demoProject;
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{p.name}</h2>
        <p className="text-zinc-400 mt-1 max-w-2xl">{p.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'PRD Health', value: `${p.healthScore} / 100`, color: 'text-primary' },
          { label: 'Completeness', value: `${p.completeness}%`, color: 'text-blue-400' },
          { label: 'Complexity', value: p.complexity, color: 'text-amber-400' },
          { label: 'Estimate Timeline', value: '4-6 Weeks', color: 'text-purple-400' },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-1">{m.label}</p>
            <p className={cn('text-3xl font-bold', m.color)}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Features', value: p.features.length },
          { label: 'Tasks Generated', value: p.taskCount },
          { label: 'Sprints Planned', value: p.sprintCount },
          { label: 'Ambiguities Found', value: demoAnalysis.ambiguities.length },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
            <p className="text-xs text-zinc-500 font-medium mb-1">{s.label}</p>
            <p className="text-2xl text-white font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Strategic Initiatives */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-primary" />
          Strategic Initiatives
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {p.features.map(f => (
            <div key={f.id} className="group flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 hover:border-primary/50 transition-all cursor-pointer">
              <div>
                <span className="text-base font-bold text-white group-hover:text-primary transition-colors block mb-1">{f.name}</span>
                <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                  <span>{f.storyCount} Stories</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-700" />
                  <span>{f.taskCount} Tasks</span>
                </div>
              </div>
              <Badge variant="outline" className={cn(
                'rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-tighter',
                f.complexity === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                  f.complexity === 'High' ? 'text-primary bg-primary/10 border-primary/20' :
                    'text-zinc-400 bg-zinc-800 border-zinc-700'
              )}>
                {f.complexity}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Core Features Extracted Section (NEW) */}
      <div className="space-y-4 py-4">
        <h3 className="text-xl font-bold text-white">Core Features Extracted</h3>
        <div className="space-y-2">
          {[
            { name: "Order Tracking", stories: 1, tasks: 5, complexity: "High" },
            { name: "Kitchen Display", stories: 1, tasks: 4, complexity: "High" },
            { name: "POS Integration", stories: 1, tasks: 3, complexity: "Critical" },
            { name: "Rider Management", stories: 1, tasks: 2, complexity: "High" },
            { name: "Menu CMS", stories: 1, tasks: 2, complexity: "High" },
            { name: "Analytics Dashboard", stories: 1, tasks: 2, complexity: "Medium" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-900/50 transition-colors rounded-lg">
              <span className="text-sm font-semibold text-white">{feature.name}</span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                  <span>{feature.stories} stories</span>
                  <span>{feature.tasks} tasks</span>
                </div>
                <Badge variant="outline" className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-tight w-16 text-center justify-center',
                  feature.complexity === 'Critical' ? 'text-red-400 bg-red-500/10 border-red-500/20' :
                    feature.complexity === 'High' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' :
                      'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
                )}>
                  {feature.complexity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel() {
  const p = demoProject;
  const a = demoAnalysis;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
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
                {p.features.length} Found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {p.features.map((feature) => (
                <AccordionItem key={feature.id} value={feature.id} className="border-zinc-800">
                  <AccordionTrigger className="text-white hover:text-primary hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <CheckCircle2 className="w-4 h-4 text-green-500 hidden sm:block shrink-0" />
                      <span>{feature.name}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    <p className="mb-4 leading-relaxed">System component extracted from PRD analysis.</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Complexity: <span className="text-white font-medium ml-1">{feature.complexity}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800">
                        <ListTodo className="w-3.5 h-3.5 text-primary" />
                        <span className="text-white font-medium mx-1">{feature.taskCount}</span> Tasks
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
                {a.ambiguities.length} Found
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {a.ambiguities.map((ambiguity) => (
                <AccordionItem key={ambiguity.id} value={ambiguity.id} className="border-zinc-800">
                  <AccordionTrigger className="text-white hover:text-amber-400 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <AlertCircle className="w-4 h-4 text-amber-500 hidden sm:block shrink-0" />
                      <span>{ambiguity.feature}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    <p className="mb-4 leading-relaxed">{ambiguity.text}</p>
                    <div className="flex items-center gap-2 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800 w-fit">
                      <span className="text-zinc-500 capitalize">Severity:</span>
                      <span className={cn(
                        "font-bold",
                        ambiguity.severity === "high" ? "text-red-400" : ambiguity.severity === "medium" ? "text-amber-400" : "text-zinc-400"
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
                Missing Requirements / Clarifications
              </div>
              <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-medium">
                {a.missingRequirements.length} Identified
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Accordion type="single" collapsible className="w-full">
              {a.missingRequirements.map((req) => (
                <AccordionItem key={req.id} value={req.id} className="border-zinc-800">
                  <AccordionTrigger className="text-white hover:text-red-400 hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/30 flex-shrink-0" />
                      <span>{req.feature}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400">
                    <p className="mb-4 leading-relaxed">{req.text}</p>
                    <div className="flex items-center gap-2 text-xs bg-zinc-950 px-2.5 py-1.5 rounded-md border border-zinc-800 w-fit">
                      <span className="text-zinc-500">Related Feature:</span>
                      <span className="text-white font-medium">{req.feature}</span>
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
              <FileText className="w-4 h-4 text-primary" />
              PRD Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white mb-1">
              {p.healthScore}<span className="text-xl text-zinc-500 font-bold">/100</span>
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
            <div className="text-3xl font-bold text-white mb-1">{p.complexity}</div>
            <p className="text-xs text-zinc-500">Derived from {p.taskCount} architectural tasks.</p>
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
            <div className="text-3xl font-bold text-white mb-1">~6 Weeks</div>
            <p className="text-xs text-zinc-500">Assumes standard agile velocity.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col h-[600px] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
        <h3 className="text-sm font-semibold text-white">Blueprint AI Architect</h3>
      </div>
      <div className="flex-1 overflow-auto space-y-4 p-6">
        {demoChatMessages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed', msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700')}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.options && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {msg.options.map(opt => (
                    <span key={opt} className="px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-950 text-xs text-zinc-300 cursor-default">
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="flex gap-2">
          <input type="text" placeholder="Demo mode — messages are read-only" disabled className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-sm text-zinc-500 cursor-not-allowed" />
          <button disabled className="px-4 py-2.5 rounded-lg bg-primary/50 text-white text-sm font-medium cursor-not-allowed">Send</button>
        </div>
      </div>
    </div>
  );
}

// --- TASKS & SPRINTS PANELS ---
function TasksDemoPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Tasks</h2>
        <p className="text-zinc-400 mt-1">Review AI-generated User Stories and effort estimations.</p>
      </div>
      <div className="space-y-4">
        {[
          { id: "FEAT-1", title: "Authentication System", points: 8, tasks: [{ id: "AUTH-101", title: "Implement JWT Middleware", type: "Security", pts: 3 }, { id: "AUTH-102", title: "User Registration Endpoint", type: "Feature", pts: 2 }, { id: "AUTH-103", title: "Auth Database Schema", type: "Database", pts: 3 }] },
          { id: "FEAT-2", title: "Restaurant Management", points: 14, tasks: [{ id: "REST-501", title: "Menu CRUD API", type: "Feature", pts: 5 }, { id: "REST-502", title: "Image Upload Service", type: "Infrastructure", pts: 4 }, { id: "REST-503", title: "Opening Hours Logic", type: "Logic", pts: 3 }, { id: "REST-504", title: "Table QR Generator", type: "Feature", pts: 2 }] },
          { id: "FEAT-3", title: "Order Workflow", points: 18, tasks: [{ id: "ORD-201", title: "Setup Order State Machine", type: "Logic", pts: 5 }, { id: "ORD-202", title: "Restaurant Notification Hook", type: "Event", pts: 4 }, { id: "ORD-203", title: "Order History API", type: "API", pts: 4 }, { id: "ORD-204", title: "Live Tracking Widget", type: "UI", pts: 3 }, { id: "ORD-205", title: "Receipt PDF Generator", type: "Feature", pts: 2 }] },
          { id: "FEAT-4", title: "Payment Processing", points: 9, tasks: [{ id: "PAY-301", title: "Stripe Integration Setup", type: "Integration", pts: 5 }, { id: "PAY-302", title: "Webhook Handler", type: "Security", pts: 4 }] },
          { id: "FEAT-5", title: "Driver Dispatch", points: 8, tasks: [{ id: "DRV-401", title: "Geolocation Service", type: "Infrastructure", pts: 4 }, { id: "DRV-402", title: "Matching Algorithm", type: "Logic", pts: 4 }] },
          { id: "FEAT-6", title: "Notifications Service", points: 4, tasks: [{ id: "NOT-601", title: "Firebase Config", type: "Setup", pts: 2 }, { id: "NOT-602", title: "Email Template Engine", type: "Feature", pts: 2 }] }
        ].map(story => (
          <Card key={story.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="border-b border-zinc-800 bg-zinc-950/80 py-4 flex flex-row items-start justify-between">
              <div className="flex gap-3 items-start">
                <div className="mt-1 bg-blue-500/10 p-1.5 rounded-md border border-blue-500/20 text-blue-400"><BookOpen className="w-4 h-4" /></div>
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-white text-base">{story.title}</CardTitle>
                    <span className="text-xs font-mono text-zinc-500">{story.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                <span className="text-xs text-zinc-400 font-medium">Story Points:</span>
                <span className="text-sm font-bold text-primary">{story.points}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/50">
                {story.tasks.map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between pl-12 bg-zinc-900">
                    <div className="flex items-center gap-3">
                      <CircleDashed className="w-4 h-4 text-zinc-600" />
                      <div>
                        <h4 className="text-sm font-medium text-zinc-200">{t.title}</h4>
                        <p className="text-xs text-zinc-500 mt-0.5 font-mono">{t.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-[10px] uppercase bg-zinc-950 border-zinc-700 text-zinc-400">{t.type}</Badge>
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{t.pts}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function SprintsDemoPanel() {
  const boardTasks = {
    todo: [
      { id: "PAY-302", title: "Webhook Handler", priority: "High", pts: 4, sprint: "S5" },
      { id: "NOT-602", title: "Email Template Engine", priority: "Low", pts: 2, sprint: "S6" },
      { id: "DRV-402", title: "Matching Algorithm", priority: "High", pts: 4, sprint: "S7" },
      { id: "ORD-205", title: "Receipt PDF Generator", priority: "Low", pts: 2, sprint: "S8" },
    ],
    inProgress: [
      { id: "AUTH-102", title: "User Registration Endpoint", priority: "High", pts: 2, sprint: "S3" },
      { id: "ORD-203", title: "Order History API", priority: "Med", pts: 4, sprint: "S4" },
      { id: "DRV-401", title: "Geolocation Service", priority: "High", pts: 4, sprint: "S4" },
    ],
    done: [
      { id: "AUTH-101", title: "Implement JWT Middleware", priority: "High", pts: 3, sprint: "S1" },
      { id: "ORD-201", title: "Setup Order State Machine", priority: "High", pts: 5, sprint: "S2" },
      { id: "PAY-301", title: "Stripe Integration Setup", priority: "High", pts: 5, sprint: "S3" },
      { id: "REST-501", title: "Menu CRUD API", priority: "High", pts: 5, sprint: "S1" },
    ]
  };

  const renderColumn = (title: string, icon: any, tasks: any[], color: string) => (
    <div className="flex flex-col bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4 min-h-[500px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          {icon}
          {title}
        </h3>
        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-500">{tasks.length}</Badge>
      </div>
      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
        {tasks.map(t => (
          <Card key={t.id} className={cn(
            "bg-zinc-900 border-zinc-800 p-4 border-l-4 relative overflow-hidden hover:border-zinc-700 transition-colors",
            color === 'blue' ? 'border-l-blue-500' : color === 'purple' ? 'border-l-purple-500' : 'border-l-green-500'
          )}>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-zinc-500">{t.id}</span>
              <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-zinc-800 text-zinc-400 border-zinc-700 font-bold">{t.sprint}</Badge>
            </div>
            <h4 className="text-sm font-medium text-white mt-1.5">{t.title}</h4>
            <div className="flex justify-between items-center mt-3">
              <Badge variant="outline" className={cn(
                "text-[10px] bg-opacity-10 border-opacity-20",
                t.priority === "High" ? "text-red-400 bg-red-400 border-red-400" :
                  t.priority === "Med" ? "text-amber-400 bg-amber-400 border-amber-400" :
                    "text-blue-400 bg-blue-400 border-blue-400"
              )}>{t.priority}</Badge>
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-bold text-primary">{t.pts}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Active Sprint Board</h2>
        <p className="text-zinc-400 mt-1">Sprint Roadmap</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {renderColumn("To Do", <CircleDashed className="w-4 h-4 text-zinc-500" />, boardTasks.todo, 'blue')}
        {renderColumn("In Progress", <Clock className="w-4 h-4 text-blue-400" />, boardTasks.inProgress, 'purple')}
        {renderColumn("Done", <CheckCircle2 className="w-4 h-4 text-green-500" />, boardTasks.done, 'green')}
      </div>
    </div>
  );
}

// --- ARCHITECTURE & TRACEABILITY PANELS ---
const BlueprintNode = ({ data }: any) => {
  const Icon = data.icon;
  return (
    <div className="flex flex-col items-center gap-2 group transition-all w-32">
      <Handle type="target" position={Position.Top} className="w-2 h-2 bg-primary border-none" />
      <div className="w-16 h-16 rounded-xl border-2 border-zinc-700 bg-zinc-950 text-zinc-400 flex items-center justify-center">
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-xs font-medium px-2 py-1 rounded-md text-center bg-zinc-900 text-zinc-400">{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 bg-primary border-none" />
    </div>
  );
};
const archNodes = [
  // Level 0: Entry Point
  { id: "g", type: "blueprint", position: { x: 400, y: 0 }, data: { label: "API Gateway", icon: Globe } },
  
  // Level 1: Core Services (Pure symmetry around x=400)
  { id: "a", type: "blueprint", position: { x: 150, y: 150 }, data: { label: "Auth Service", icon: Lock } },
  { id: "o", type: "blueprint", position: { x: 400, y: 150 }, data: { label: "Order Engine", icon: ClipboardList } },
  { id: "p", type: "blueprint", position: { x: 650, y: 150 }, data: { label: "Payments API", icon: CreditCard } },
  
  // Level 2: Sub-components (Symmetrical groupings)
  { id: "auth-db", type: "blueprint", position: { x: 150, y: 300 }, data: { label: "Identity Store", icon: Database } },
  
  { id: "r", type: "blueprint", position: { x: 300, y: 300 }, data: { label: "Restaurant Hub", icon: Store } },
  { id: "drv", type: "blueprint", position: { x: 400, y: 300 }, data: { label: "Driver Dispatch", icon: Truck } },
  { id: "db", type: "blueprint", position: { x: 500, y: 300 }, data: { label: "Cloud Database", icon: Server } },
  
  { id: "pay-gw", type: "blueprint", position: { x: 600, y: 300 }, data: { label: "Stripe Gateway", icon: Zap } },
  { id: "pay-ledger", type: "blueprint", position: { x: 700, y: 300 }, data: { label: "Audit Ledger", icon: FileJson } },
];
const archEdges = [
  // Primary Flow
  { id: 'e1', source: 'g', target: 'a', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e2', source: 'g', target: 'o', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e3', source: 'g', target: 'p', animated: true, style: { stroke: '#52525b', strokeWidth: 2 } },
  
  // Service Dependencies
  { id: 'e-auth-db', source: 'a', target: 'auth-db', style: { stroke: '#52525b', strokeDasharray: '5,5' } },
  { id: 'e-pay-gw', source: 'p', target: 'pay-gw', style: { stroke: '#52525b', strokeDasharray: '5,5' } },
  { id: 'e-pay-ledger', source: 'p', target: 'pay-ledger', style: { stroke: '#52525b', strokeDasharray: '5,5' } },

  { id: 'e4', source: 'o', target: 'r', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e5', source: 'o', target: 'drv', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'e6', source: 'o', target: 'db', style: { stroke: '#52525b', strokeWidth: 2 } },
];

function ArchitectureDemoPanel() {
  const handleExport = () => {
    const data = { nodes: archNodes, edges: archEdges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'architecture_blueprint.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">System Architecture</h2>
          <p className="text-zinc-400 mt-1">Sign in to click nodes and view specific endpoints & logic.</p>
        </div>
        <Button 
          onClick={handleExport} 
          className="gap-2 bg-orange-600 hover:bg-orange-700 text-white border-none shadow-[0_0_15px_-3px_rgba(234,88,12,0.4)]"
        >
          <Download className="w-4 h-4" /> Export Architecture
        </Button>
      </div>
      <div className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden relative min-h-[400px]">
        <ReactFlow nodes={archNodes} edges={archEdges} nodeTypes={{ blueprint: BlueprintNode }} fitView fitViewOptions={{ padding: 0.1 }} nodesDraggable={false} panOnDrag={false} zoomOnScroll={false} colorMode="dark">
          <Background color="#3f3f46" gap={24} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}

const TraceNode = ({ data }: any) => {
  const isHighlighted = data.highlighted;
  const isDimmed = data.dimmed;

  const getColors = () => {
    switch (data.type) {
      case 'requirement': return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case 'service': return "text-purple-400 bg-purple-500/10 border-purple-500/30";
      case 'api': return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case 'task': return "text-green-400 bg-green-500/10 border-green-500/30";
      default: return "text-zinc-400 bg-zinc-900 border-zinc-800";
    }
  };

  return (
    <div className={`
      flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-300 bg-zinc-950 w-56
      ${isHighlighted ? "border-white ring-4 ring-white/10 scale-105" : "border-zinc-800 opacity-80"}
      ${isDimmed ? "opacity-20 grayscale" : ""}
    `}>
      <Handle type="target" position={Position.Left} className="w-1.5 h-1.5 bg-zinc-600 border-none" />
      <div className={cn("p-2 rounded-md", getColors())}>
        <Network className="w-4 h-4" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{data.badge}</span>
        <span className="text-sm font-medium text-white leading-tight mt-0.5 truncate">{data.label}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-1.5 h-1.5 bg-zinc-600 border-none" />
    </div>
  );
};

const initialTraceNodes: any[] = [
  // Authentication
  { id: "r1", type: "trace", position: { x: 0, y: 0 }, data: { label: "User Authentication", badge: "FEAT-1", type: "requirement", description: "Implement secure login for all users." } },
  { id: "s1", type: "trace", position: { x: 300, y: 0 }, data: { label: "Auth Service", badge: "Microservice", type: "service", description: "Node.js identity provider." } },
  { id: "api1", type: "trace", position: { x: 600, y: -40 }, data: { label: "/v1/auth/login", badge: "API", type: "api", description: "Login endpoint." } },
  { id: "api2", type: "trace", position: { x: 600, y: 40 }, data: { label: "/v1/auth/register", badge: "API", type: "api", description: "Register endpoint." } },
  { id: "t1", type: "trace", position: { x: 900, y: -60 }, data: { label: "JWT Middleware", badge: "AUTH-101", type: "task", description: "Configure JWT signing keys." } },
  { id: "t2", type: "trace", position: { x: 900, y: 0 }, data: { label: "Reg Endpoint", badge: "AUTH-102", type: "task", description: "Implement user registration." } },
  { id: "t3", type: "trace", position: { x: 900, y: 60 }, data: { label: "Auth Schema", badge: "AUTH-103", type: "task", description: "Setup auth tables." } },

  // Order Workflow
  { id: "r2", type: "trace", position: { x: 0, y: 150 }, data: { label: "Order Tracking", badge: "FEAT-2", type: "requirement", description: "Real-time tracking of food orders from kitchen to door." } },
  { id: "s2", type: "trace", position: { x: 300, y: 150 }, data: { label: "Order Engine", badge: "Microservice", type: "service", description: "Core order state management." } },
  { id: "api3", type: "trace", position: { x: 600, y: 150 }, data: { label: "/v1/orders/status", badge: "API", type: "api", description: "Status tracking." } },
  { id: "t4", type: "trace", position: { x: 900, y: 150 }, data: { label: "Order FSM", badge: "ORD-201", type: "task", description: "Implement order state machine." } },

  // Restaurant Management
  { id: "r3", type: "trace", position: { x: 0, y: 250 }, data: { label: "Restaurant CMS", badge: "FEAT-3", type: "requirement", description: "Interface for restaurants to manage menus." } },
  { id: "s3", type: "trace", position: { x: 300, y: 250 }, data: { label: "Restaurant Hub", badge: "Microservice", type: "service", description: "Menu and vendor management." } },
  { id: "api4", type: "trace", position: { x: 600, y: 250 }, data: { label: "/v1/menu/update", badge: "API", type: "api", description: "Update menu items." } },
  { id: "t5", type: "trace", position: { x: 900, y: 250 }, data: { label: "Menu CRUD", badge: "REST-501", type: "task", description: "Implement menu management API." } },

  // Driver Dispatch
  { id: "r4", type: "trace", position: { x: 0, y: 350 }, data: { label: "Driver Dispatch", badge: "FEAT-4", type: "requirement", description: "Automated matching of drivers to nearby orders." } },
  { id: "s4", type: "trace", position: { x: 300, y: 350 }, data: { label: "Dispatch Service", badge: "Microservice", type: "service", description: "Real-time dispatch coordination." } },
  { id: "api5", type: "trace", position: { x: 600, y: 350 }, data: { label: "/v1/dispatch/match", badge: "API", type: "api", description: "Match driver endpoint." } },
  { id: "t6", type: "trace", position: { x: 900, y: 350 }, data: { label: "Matching Logic", badge: "DRV-401", type: "task", description: "Implement proximity algorithm." } },

  // Payment Processing
  { id: "r5", type: "trace", position: { x: 0, y: 450 }, data: { label: "Payment Gateway", badge: "FEAT-5", type: "requirement", description: "Secure payment processing and audit trail." } },
  { id: "s5", type: "trace", position: { x: 300, y: 450 }, data: { label: "Payments API", badge: "Microservice", type: "service", description: "Financial transaction handling." } },
  { id: "api6", type: "trace", position: { x: 600, y: 450 }, data: { label: "/v1/payments/charge", badge: "API", type: "api", description: "Charge customer card." } },
  { id: "t7", type: "trace", position: { x: 900, y: 450 }, data: { label: "Stripe Setup", badge: "PAY-301", type: "task", description: "Initialize payment gateway." } },
];

const initialTraceEdges: any[] = [
  // Auth
  { id: 'tr1', source: 'r1', target: 's1', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr2', source: 's1', target: 'api1', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr3', source: 's1', target: 'api2', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr4', source: 'api1', target: 't1', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr5', source: 'api1', target: 't2', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr6', source: 'api2', target: 't3', style: { stroke: '#52525b', strokeWidth: 2 } },

  // Order
  { id: 'tr7', source: 'r2', target: 's2', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr8', source: 's2', target: 'api3', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr9', source: 'api3', target: 't4', style: { stroke: '#52525b', strokeWidth: 2 } },

  // Restaurant
  { id: 'tr10', source: 'r3', target: 's3', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr11', source: 's3', target: 'api4', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr12', source: 'api4', target: 't5', style: { stroke: '#52525b', strokeWidth: 2 } },

  // Dispatch
  { id: 'tr13', source: 'r4', target: 's4', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr14', source: 's4', target: 'api5', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr15', source: 'api5', target: 't6', style: { stroke: '#52525b', strokeWidth: 2 } },

  // Payment
  { id: 'tr16', source: 'r5', target: 's5', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr17', source: 's5', target: 'api6', style: { stroke: '#52525b', strokeWidth: 2 } },
  { id: 'tr18', source: 'api6', target: 't7', style: { stroke: '#52525b', strokeWidth: 2 } },
];

const markerEnd = {
  type: MarkerType.ArrowClosed,
  width: 20,
  height: 20,
  color: '#3f3f46',
};

function TraceabilityDemoPanel() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialTraceNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialTraceEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState(false);

  const performImpactAnalysis = useCallback((nodeId: string) => {
    const affectedNodeIds = new Set<string>();
    const affectedEdgeIds = new Set<string>();

    const traverse = (id: string) => {
      affectedNodeIds.add(id);
      initialTraceEdges.forEach(edge => {
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
  }, [setNodes, setEdges]);

  const resetAnalysis = useCallback(() => {
    setNodes(nds => nds.map(n => ({
      ...n,
      data: { ...n.data, highlighted: false, dimmed: false }
    })));
    setEdges(eds => eds.map(e => ({
      ...e,
      animated: false,
      style: { stroke: '#52525b', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b' }
    })));
    setImpactAnalysis(false);
  }, [setNodes, setEdges]);

  const onNodeClick = (_: any, node: any) => {
    setSelectedNode(node);
    if (node.data.type === 'requirement') {
      performImpactAnalysis(node.id);
    }
  };

  const handleExport = () => {
    const data = { nodes, edges };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'traceability_matrix.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Traceability Matrix</h2>
          <p className="text-zinc-400 mt-1">Shows how PRD requirements map to generated services and tickets.</p>
        </div>
        <div className="flex gap-2">
          {impactAnalysis && (
            <Button variant="outline" size="sm" onClick={resetAnalysis} className="text-xs border-zinc-800 bg-zinc-900/50">Reset Analysis</Button>
          )}
          <Button 
            onClick={handleExport} 
            className="gap-2 bg-orange-600 hover:bg-orange-700 text-white border-none shadow-[0_0_15px_-3px_rgba(234,88,12,0.4)]"
          >
            <Download className="w-4 h-4" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden relative min-h-[400px]">
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-lg backdrop-blur-sm">
              <p className="text-[10px] text-zinc-400">Click a <span className="text-blue-400 font-bold">Requirement node</span> to trigger impact analysis.</p>
            </div>
          </div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={{ trace: TraceNode }}
            onNodeClick={onNodeClick}
            fitView
            nodesDraggable={false}
            colorMode="dark"
          >
            <Background color="#3f3f46" gap={24} size={1} />
          </ReactFlow>
        </div>

        <AnimatePresence>
          {selectedNode ? (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] uppercase bg-zinc-950 border-zinc-800 text-zinc-500">
                  {selectedNode.data.type} details
                </Badge>
                <button onClick={() => setSelectedNode(null)} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>

              <div>
                <span className="text-[10px] font-mono text-primary mb-1 block">{selectedNode.data.badge}</span>
                <h3 className="text-lg font-bold text-white">{selectedNode.data.label}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">Description</label>
                  <p className="text-sm text-zinc-400 leading-relaxed">{selectedNode.data.description}</p>
                </div>

                {selectedNode.data.type === 'req' && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-[10px] text-blue-400">Traceability mapped to 1 service, 2 APIs, and 3 engineering tasks.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="lg:col-span-1 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center p-6 text-center">
              <Search className="w-8 h-8 text-zinc-700 mb-3" />
              <p className="text-xs text-zinc-500">Select a node to view full traceability details and lineage.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- CODE & AUTOMATION PANELS ---
function CodeDemoPanel() {
  const [activeFile, setActiveFile] = useState('index.ts');

  const fileContents: Record<string, string> = {
    'index.ts': `import express from 'express';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
    'auth.routes.ts': `import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

// Maps to Requirements in PRD-01
router.post('/login', login);
router.post('/register', register);

export default router;`,
    'package.json': `{
  "name": "auth-service",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0"
  }
}`
  };

  const handleExportZip = async () => {
    const zip = new JSZip();
    const src = zip.folder("src");

    // index.ts in src
    src?.file("index.ts", fileContents['index.ts']);

    // routes folder
    const routes = src?.folder("routes");
    routes?.file("auth.routes.ts", fileContents['auth.routes.ts']);

    // package.json in root
    zip.file("package.json", fileContents['package.json']);

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'demo-code-scaffolding.zip';
    link.click();
    URL.revokeObjectURL(url);
  };

  const files: Record<string, JSX.Element> = {
    'index.ts': (
      <>
        <span className="text-pink-400">import</span> express <span className="text-pink-400">from</span> <span className="text-green-400">'express'</span>;<br />
        <span className="text-pink-400">import</span> authRoutes <span className="text-pink-400">from</span> <span className="text-green-400">'./routes/auth.routes'</span>;<br /><br />
        <span className="text-blue-400">const</span> app = express();<br />
        <span className="text-blue-400">const</span> PORT = process.env.PORT || <span className="text-orange-400">3000</span>;<br /><br />
        app.use(express.json());<br />
        app.use(<span className="text-green-400">'/api/v1/auth'</span>, authRoutes);<br /><br />
        app.listen(PORT, () ={'>'} {'{\n'}
        {'  '}console.log(<span className="text-green-400">{"`Server running on port ${PORT}`"}</span>);{'\n}'});
      </>
    ),
    'auth.routes.ts': (
      <>
        <span className="text-pink-400">import</span> {'{'} Router {'}'} <span className="text-pink-400">from</span> <span className="text-green-400">'express'</span>;<br />
        <span className="text-pink-400">import</span> {'{'} login, register {'}'} <span className="text-pink-400">from</span> <span className="text-green-400">'../controllers/auth.controller'</span>;<br /><br />
        <span className="text-blue-400">const</span> router = Router();<br /><br />
        <span className="text-zinc-500">// Maps to Requirements in PRD-01</span><br />
        router.post(<span className="text-green-400">'/login'</span>, login);<br />
        router.post(<span className="text-green-400">'/register'</span>, register);<br /><br />
        <span className="text-pink-400">export default</span> router;
      </>
    ),
    'package.json': (
      <>
        {'{'}<br />
        {'  '}<span className="text-blue-400">"name"</span>: <span className="text-green-400">"auth-service"</span>,<br />
        {'  '}<span className="text-blue-400">"version"</span>: <span className="text-green-400">"1.0.0"</span>,<br />
        {'  '}<span className="text-blue-400">"dependencies"</span>: {'{\n'}
        {'    '}<span className="text-blue-400">"express"</span>: <span className="text-green-400">"^4.18.2"</span>,<br />
        {'    '}<span className="text-blue-400">"jsonwebtoken"</span>: <span className="text-green-400">"^9.0.0"</span><br />
        {'  }'}<br />
        {'}'}
      </>
    )
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Code Scaffolding</h2>
          <p className="text-zinc-400 mt-1">Sign in to download the full .ZIP or push directly to GitHub.</p>
        </div>
        <Button onClick={handleExportZip} className="gap-2 bg-primary hover:brightness-110 text-white">
          <Download className="w-4 h-4" /> Export (ZIP)
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[400px]">
        <Card className="col-span-1 bg-zinc-900 border-zinc-800 flex flex-col">
          <CardHeader className="p-4 border-b border-zinc-800"><CardTitle className="text-sm text-white">Explorer</CardTitle></CardHeader>
          <CardContent className="p-2 space-y-1 flex-1">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300"><Folder className="w-4 h-4 text-primary/70" /> src</div>
            <div onClick={() => setActiveFile('index.ts')} className={cn("flex items-center gap-2 px-2 py-1.5 text-sm pl-6 cursor-pointer rounded-md transition-colors", activeFile === 'index.ts' ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-zinc-800")}>
              <FileCode2 className="w-4 h-4" /> index.ts
            </div>
            <div onClick={() => setActiveFile('auth.routes.ts')} className={cn("flex items-center gap-2 px-2 py-1.5 text-sm pl-6 cursor-pointer rounded-md transition-colors", activeFile === 'auth.routes.ts' ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-zinc-800")}>
              <FileCode2 className="w-4 h-4" /> auth.routes.ts
            </div>
            <div onClick={() => setActiveFile('package.json')} className={cn("flex items-center gap-2 px-2 py-1.5 text-sm pl-2 cursor-pointer rounded-md transition-colors", activeFile === 'package.json' ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-zinc-800")}>
              <FileJson className="w-4 h-4 text-yellow-400" /> package.json
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-[#121212] border-zinc-800 flex flex-col relative overflow-hidden">
          <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 flex items-center gap-2">
            {activeFile.endsWith('.json') ? <FileJson className="w-4 h-4 text-yellow-400" /> : <FileCode2 className="w-4 h-4 text-primary" />}
            <span className="text-sm font-mono text-zinc-300">{activeFile}</span>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <pre className="text-sm font-mono text-zinc-300 leading-relaxed">
              {files[activeFile]}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}

function AutomationDemoPanel() {
  const integrations = [
    { id: "github", name: "GitHub", desc: "Push scaffolded code.", icon: Github, connected: true },
    { id: "clickup", name: "ClickUp", desc: "Manage tasks and goals.", icon: Layers, connected: false },
    { id: "slack", name: "Slack", desc: "Receive notifications.", icon: Slack, connected: false }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">Automations</h2>
        <p className="text-zinc-400 mt-1">Connect your workspace to your favorite tools.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((int) => (
          <Card key={int.id} className={cn("bg-zinc-900 border", int.connected ? "border-primary/30" : "border-zinc-800")}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-2", int.connected ? "bg-primary/10 text-primary" : "bg-zinc-950 text-zinc-400")}>
                  <int.icon className="w-6 h-6" />
                </div>
                <Switch checked={int.connected} disabled />
              </div>
              <CardTitle className="text-white text-xl">{int.name}</CardTitle>
              <CardDescription className="text-zinc-400 mt-2 h-6">{int.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                {int.connected ? (
                  <div className="flex items-center gap-2 text-sm text-green-400"><CheckCircle2 className="w-4 h-4" /> Connected</div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-zinc-500"><AlertCircle className="w-4 h-4" /> Not connected</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function Demo() {
  const [active, setActive] = useState<DemoPage>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (active) {
      case 'overview': return <OverviewPanel />;
      case 'analysis': return <AnalysisPanel />;
      case 'chat': return <ChatPanel />;
      case 'tests': return <Testing isDemo={true} />;
      case 'tasks': return <TasksDemoPanel />;
      case 'sprints': return <SprintsDemoPanel />;
      case 'architecture': return <ArchitectureDemoPanel />;
      case 'traceability': return <TraceabilityDemoPanel />;
      case 'code': return <CodeDemoPanel />;
      case 'automation': return <AutomationDemoPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 text-white">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-primary">
            <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" opacity="0.9" />
            <rect x="16" y="2" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
            <rect x="2" y="16" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
            <rect x="16" y="16" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" />
          </svg>
          <span className="font-bold">Blueprint.dev</span>
        </Link>
        <button className="p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* MATCHES DashboardLayout.tsx SIDEBAR EXACTLY */}
      <aside className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        md:block w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 transition-all duration-300 z-20
      `}>
        <div className="h-full flex flex-col">
          <Link to="/" className="hidden md:flex items-center gap-2 p-6 border-b border-zinc-800 text-white hover:bg-zinc-800/50 transition-colors">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-primary">
              <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" opacity="0.9" />
              <rect x="16" y="2" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="2" y="16" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
              <rect x="16" y="16" width="10" height="10" rx="2" fill="currentColor" opacity="0.3" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Blueprint.dev</span>
          </Link>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
            {navItems.map((item) => {
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setActive(item.key); setIsMobileMenuOpen(false); }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                    ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-zinc-500"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800">
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-white leading-none">Guest Mode</span>
                <span className="text-[10px] text-zinc-500 mt-1">Read-only Demo</span>
              </div>
              <Link to="/auth" className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 font-medium transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <DemoBanner />

        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4 text-zinc-400 text-sm">
            <span>Demo Workspace</span>
            <span>/</span>
            <span className="text-white font-medium">{navItems.find(i => i.key === active)?.label}</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button className="bg-primary hover:brightness-110 text-white gap-2 h-9 text-sm glow-orange">
                Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}