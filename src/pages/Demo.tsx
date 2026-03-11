// src/pages/Demo.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, MessageSquare, ListChecks, Calendar,
  Network, GitBranch, Code2, FlaskConical, Zap, ChevronLeft, ChevronRight,
  ArrowRight, CheckCircle2, CircleDashed, Clock, Folder, FileCode2, FileJson, 
  Terminal, Download, GitMerge, FileText, Server, Database, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProject, demoAnalysis, demoChatMessages } from '@/data/demo/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Testing from '@/pages/Testing';

type DemoPage = 'overview' | 'analysis' | 'chat' | 'tasks' | 'sprints' | 'architecture' | 'traceability' | 'code' | 'tests' | 'automation';

const navItems: { key: DemoPage; label: string; icon: React.ElementType }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'analysis', label: 'PRD Analysis', icon: FileSearch },
  { key: 'chat', label: 'Clarification', icon: MessageSquare },
  { key: 'tasks', label: 'Tasks', icon: ListChecks },
  { key: 'sprints', label: 'Sprints', icon: Calendar },
  { key: 'architecture', label: 'Architecture', icon: Network },
  { key: 'traceability', label: 'Traceability', icon: GitBranch },
  { key: 'code', label: 'Code Generator', icon: Code2 },
  { key: 'tests', label: 'Testing', icon: FlaskConical },
  { key: 'automation', label: 'Automation', icon: Zap },
];

function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-accent-orange-dim border-b border-primary/30">
      <p className="text-body text-foreground font-medium">
        Demo Mode — Exploring the <span className="text-primary">Food Delivery Platform</span> project
      </p>
      <Link
        to="/auth"
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-primary text-primary-foreground text-label-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Sign Up Free <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function OverviewPanel() {
  const p = demoProject;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-lg font-satoshi text-foreground">{p.name}</h2>
        <p className="text-body text-muted-foreground mt-2 max-w-2xl">{p.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'PRD Health', value: `${p.healthScore} / 100`, color: 'text-primary' },
          { label: 'Completeness', value: `${p.completeness}%`, color: 'text-accent-blue' },
          { label: 'Complexity', value: p.complexity, color: 'text-accent-yellow' },
        ].map(m => (
          <div key={m.label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-label-sm text-muted-foreground uppercase tracking-wider">{m.label}</p>
            <p className={cn('text-display-lg font-satoshi mt-1', m.color)}>{m.value}</p>
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
          <div key={s.label} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-label-sm text-muted-foreground">{s.label}</p>
            <p className="text-heading-md text-foreground font-satoshi mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-heading-md text-foreground font-satoshi mb-3">Features</h3>
        <div className="space-y-2">
          {p.features.map(f => (
            <div key={f.id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 hover:border-border-emphasis transition-colors">
              <span className="text-body text-foreground">{f.name}</span>
              <div className="flex items-center gap-4 text-label-sm text-muted-foreground">
                <span>{f.storyCount} stories</span>
                <span>{f.taskCount} tasks</span>
                <span className={cn(
                  'px-2 py-0.5 rounded border text-label-sm font-mono',
                  f.complexity === 'Critical' ? 'border-accent-red/30 text-accent-red bg-accent-red/10' :
                  f.complexity === 'High' ? 'border-primary/30 text-primary bg-primary/10' :
                  'border-accent-yellow/30 text-accent-yellow bg-accent-yellow/10'
                )}>
                  {f.complexity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalysisPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-satoshi text-foreground">Ambiguities Detected</h2>
        <p className="text-body text-muted-foreground mt-1">Issues that need clarification before development</p>
      </div>
      <div className="space-y-3">
        {demoAnalysis.ambiguities.map(a => (
          <div key={a.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={cn(
                'px-2 py-0.5 rounded text-label-sm font-mono border',
                a.severity === 'high' ? 'border-accent-red/30 text-accent-red bg-accent-red/10' :
                a.severity === 'medium' ? 'border-accent-yellow/30 text-accent-yellow bg-accent-yellow/10' :
                'border-border text-muted-foreground bg-elevated'
              )}>
                {a.severity}
              </span>
              <span className="text-label-sm text-primary">{a.feature}</span>
            </div>
            <p className="text-body text-foreground">{a.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-heading-md font-satoshi text-foreground">Missing Requirements</h2>
        <p className="text-body text-muted-foreground mt-1">Requirements that should be specified but are absent</p>
      </div>
      <div className="space-y-3">
        {demoAnalysis.missingRequirements.map(m => (
          <div key={m.id} className="rounded-lg border border-accent-red/20 bg-accent-red/5 p-4">
            <span className="text-label-sm text-primary">{m.feature}</span>
            <p className="text-body text-foreground mt-1">{m.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatPanel() {
  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-auto space-y-4 p-4">
        {demoChatMessages.map(msg => (
          <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              'max-w-[75%] rounded-lg p-3',
              msg.role === 'user' ? 'bg-accent-orange-dim text-foreground' : 'bg-elevated text-foreground'
            )}>
              <p className="text-body whitespace-pre-wrap">{msg.content}</p>
              {msg.options && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.options.map(opt => (
                    <span key={opt} className="px-3 py-1 rounded-full border border-border bg-surface text-label-sm text-muted-foreground cursor-default">
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-4 bg-surface">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Demo mode — messages are read-only"
            disabled
            className="flex-1 px-3 py-2 rounded-md border border-border bg-elevated text-body text-text-muted placeholder:text-text-muted cursor-not-allowed"
          />
          <button disabled className="px-4 py-2 rounded-md bg-primary/50 text-primary-foreground text-body cursor-not-allowed">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// NEW DEMO PANELS (Replaces Placeholders)
// ==========================================

function SprintsDemoPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-satoshi text-foreground">Sprint Board (Read-only)</h2>
        <p className="text-body text-muted-foreground mt-1">Preview of the AI-generated execution plan.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col bg-elevated/50 rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <CircleDashed className="w-4 h-4 text-zinc-500" />
            <h3 className="font-semibold text-white">To Do</h3>
          </div>
          <div className="space-y-3">
            <Card className="bg-surface border-border p-4">
              <span className="text-[10px] font-mono text-zinc-500">TASK-102</span>
              <h4 className="text-sm font-medium text-white mt-1">Implement Stripe Webhooks</h4>
              <div className="flex gap-2 mt-3"><Badge variant="outline" className="text-primary bg-primary/10">High</Badge></div>
            </Card>
            <Card className="bg-surface border-border p-4">
              <span className="text-[10px] font-mono text-zinc-500">TASK-103</span>
              <h4 className="text-sm font-medium text-white mt-1">Setup Redis Cache</h4>
              <div className="flex gap-2 mt-3"><Badge variant="outline" className="text-yellow-400 bg-yellow-400/10">Med</Badge></div>
            </Card>
          </div>
        </div>
        <div className="flex flex-col bg-elevated/50 rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white">In Progress</h3>
          </div>
          <div className="space-y-3">
            <Card className="bg-surface border-border p-4">
              <span className="text-[10px] font-mono text-zinc-500">TASK-101</span>
              <h4 className="text-sm font-medium text-white mt-1">Database Schema Migration</h4>
              <div className="flex gap-2 mt-3"><Badge variant="outline" className="text-primary bg-primary/10">High</Badge></div>
            </Card>
          </div>
        </div>
        <div className="flex flex-col bg-elevated/50 rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <h3 className="font-semibold text-white">Done</h3>
          </div>
          <div className="space-y-3">
            <Card className="bg-surface border-border p-4 opacity-70">
              <span className="text-[10px] font-mono text-zinc-500">SYS-001</span>
              <h4 className="text-sm font-medium text-white mt-1">Initialize Monorepo</h4>
              <div className="flex gap-2 mt-3"><Badge variant="outline" className="text-green-400 bg-green-400/10">Done</Badge></div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CodeDemoPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-heading-md font-satoshi text-foreground">Scaffolded Code (Preview)</h2>
        <p className="text-body text-muted-foreground mt-1">Sign in to download the full .ZIP or push to GitHub.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[400px]">
        <Card className="col-span-1 bg-elevated border-border">
          <CardHeader className="p-4 border-b border-border"><CardTitle className="text-sm text-white">Explorer</CardTitle></CardHeader>
          <CardContent className="p-2 space-y-1">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-primary"><Folder className="w-4 h-4" /> src</div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 pl-6"><FileCode2 className="w-4 h-4" /> index.ts</div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 pl-6"><FileCode2 className="w-4 h-4" /> auth.routes.ts</div>
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-400 pl-2"><FileJson className="w-4 h-4 text-yellow-400" /> package.json</div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-[#1e1e1e] border-border flex items-center justify-center relative overflow-hidden">
          <pre className="text-sm font-mono text-zinc-300 p-6 absolute inset-0">
{`import express from 'express';
import authRoutes from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/auth', authRoutes);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`}
          </pre>
        </Card>
      </div>
    </div>
  );
}

function TraceabilityDemoPanel() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-xl bg-elevated border border-border flex items-center justify-center mb-4">
        <GitMerge className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-heading-md text-foreground font-satoshi">Traceability Matrix</h3>
      <p className="text-body text-muted-foreground mt-2 max-w-md">
        In the live app, this tab renders an interactive Bipartite Graph mapping your business requirements to their corresponding microservices and Jira tickets.
      </p>
      <Link to="/auth" className="mt-6 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:brightness-110 transition-all glow-orange">
        Sign in to view Live Graph
      </Link>
    </div>
  );
}

function ArchitectureDemoPanel() {
  return (
    <div className="space-y-6 flex flex-col items-center justify-center py-20 text-center">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 rounded-xl bg-elevated border border-border flex items-center justify-center"><Globe className="h-8 w-8 text-blue-400" /></div>
        <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center"><Server className="h-8 w-8 text-primary" /></div>
        <div className="w-16 h-16 rounded-xl bg-elevated border border-border flex items-center justify-center"><Database className="h-8 w-8 text-green-400" /></div>
      </div>
      <h3 className="text-heading-md text-foreground font-satoshi">Interactive Topology Graph</h3>
      <p className="text-body text-muted-foreground mt-2 max-w-md">
        Sign up to access the React Flow interactive canvas, where you can click on any node (API Gateway, Auth, Postgres) to view generated endpoints and configurations.
      </p>
      <Link to="/auth" className="mt-6 px-4 py-2 border border-border bg-surface text-white rounded-md text-sm font-medium hover:bg-elevated transition-all">
        Create an Account
      </Link>
    </div>
  );
}

export default function Demo() {
  const [active, setActive] = useState<DemoPage>('overview');
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (active) {
      case 'overview': return <OverviewPanel />;
      case 'analysis': return <AnalysisPanel />;
      case 'chat': return <ChatPanel />;
      case 'tests': return <Testing />;
      case 'tasks': return <SprintsDemoPanel />; // Routing to Kanban preview
      case 'sprints': return <SprintsDemoPanel />;
      case 'architecture': return <ArchitectureDemoPanel />;
      case 'traceability': return <TraceabilityDemoPanel />;
      case 'code': return <CodeDemoPanel />;
      case 'automation': return <div className="text-center py-20 text-zinc-500">Automation configs require an active GitHub/Jira connection.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <DemoBanner />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn(
          'shrink-0 border-r border-border bg-surface flex flex-col transition-all duration-200',
          collapsed ? 'w-14' : 'w-60'
        )}>
          <div className="p-3 border-b border-border flex items-center justify-between">
            {!collapsed && (
              <span className="text-label-sm text-primary font-mono font-medium truncate">blueprint.dev</span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-elevated text-muted-foreground hover:text-foreground transition-colors"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto custom-scrollbar">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  className={cn(
                    'flex items-center gap-2.5 w-full rounded-md transition-colors',
                    collapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2',
                    isActive
                      ? 'bg-overlay text-foreground border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-elevated/50'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="text-body truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6 md:p-10"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}