import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, FileSearch, MessageSquare, ListChecks, Calendar,
  Network, GitBranch, Code2, FlaskConical, Zap, ChevronLeft, ChevronRight,
  ArrowRight, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoProject, demoAnalysis, demoChatMessages } from '@/data/demo/project';
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
        to="/"
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

      {/* Metrics */}
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

      {/* Stats row */}
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

      {/* Features */}
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

function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-xl bg-elevated border border-border flex items-center justify-center mb-4">
        <Network className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="text-heading-md text-foreground font-satoshi">{title}</h3>
      <p className="text-body text-muted-foreground mt-2 max-w-md">{description}</p>
      <p className="text-label-sm text-text-muted mt-4 font-mono">Available when teammate's code is merged</p>
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
      case 'tasks': return <PlaceholderPanel title="Task Board" description="3-column hierarchy with feature → story → task navigation. 89 generated tasks with priority and sprint assignment." />;
      case 'sprints': return <PlaceholderPanel title="Sprint Planner" description="Drag-and-drop Kanban board with 4 planned sprints. Tasks distributed by story points and priority." />;
      case 'architecture': return <PlaceholderPanel title="Architecture Diagrams" description="System architecture, API flow, and ER diagrams rendered with Mermaid.js in Blueprint's dark theme." />;
      case 'traceability': return <PlaceholderPanel title="Traceability Graph" description="Interactive React Flow graph mapping requirements → stories → tasks → code → tests." />;
      case 'code': return <PlaceholderPanel title="Code Generator" description="VS Code-style file tree with syntax-highlighted code skeletons for 12+ files." />;
      case 'automation': return <PlaceholderPanel title="Automation" description="GitHub, Jira, and Slack integration cards for push-to-repo and task sync." />;
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <DemoBanner />

      <div className="flex flex-1">
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

          <nav className="flex-1 p-2 space-y-0.5">
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
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="p-6"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
