import { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ShieldAlert, AlertTriangle, Code2, Send, CheckCircle2, XCircle, AlertCircle, Copy, Check, Download, TestTube } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  functionalTests as demoFunctional,
  edgeCaseTests as demoEdge,
  negativeTests as demoNegative,
  unitStubs as demoUnit,
  postmanCollection as demoPostman,
  type TestCase,
  type TestStatus,
} from '@/data/demo/tests';
import {
  functionalTests as mainFunctional,
  edgeCaseTests as mainEdge,
  negativeTests as mainNegative,
  unitStubs as mainUnit,
  postmanCollection as mainPostman,
} from '@/data/mainProjectTests';

type Category = 'functional' | 'edge' | 'negative' | 'unit' | 'postman';

const statusConfig: Record<TestStatus, { label: string; icon: React.ElementType; className: string }> = {
  pass: { label: 'PASS', icon: CheckCircle2, className: 'bg-accent-green/15 text-accent-green border-accent-green/30' },
  fail: { label: 'FAIL', icon: XCircle, className: 'bg-accent-red/15 text-accent-red border-accent-red/30' },
  edge: { label: 'EDGE', icon: AlertCircle, className: 'bg-accent-yellow/15 text-accent-yellow border-accent-yellow/30' },
};

function StatusBadge({ status }: { status: TestStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-mono border', config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

function TestItem({ test, isDemo }: { test: TestCase, isDemo: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isDemo 
          ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" 
          : "border-border bg-surface hover:border-border-emphasis"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-code text-accent-orange font-medium">{test.method}</span>
            <span className={cn("font-mono text-code truncate", isDemo ? "text-zinc-300" : "text-foreground")}>{test.endpoint}</span>
          </div>
          <p className={cn("text-body mb-2", isDemo ? "text-zinc-400" : "text-muted-foreground")}>{test.description}</p>
          <p className="font-mono text-code text-text-secondary">
            Expected: <span className={isDemo ? "text-primary/80" : "text-text-code"}>{test.expected}</span>
          </p>
        </div>
        <StatusBadge status={test.status} />
      </div>
    </motion.div>
  );
}

function PostmanViewer({ isDemo, postmanData }: { isDemo: boolean, postmanData: any }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(postmanData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blueprint-api-collection.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className={cn("text-heading-md font-satoshi", isDemo ? "text-white" : "text-foreground")}>Postman Collection</h3>
          <p className={cn("text-body mt-1", isDemo ? "text-zinc-400" : "text-muted-foreground")}>Export and import into Postman or Insomnia</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-body transition-colors",
              isDemo
                ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                : "border-border bg-surface text-muted-foreground hover:text-foreground hover:border-border-emphasis"
            )}
          >
            {copied ? <Check className="h-3.5 w-3.5 text-accent-green" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-body font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Export .json
          </button>
        </div>
      </div>
      <div className={cn("flex-1 rounded-lg border overflow-auto", isDemo ? "bg-black border-zinc-800" : "border-border bg-elevated")}>
        <pre className={cn("p-4 text-code font-mono leading-relaxed", isDemo ? "text-zinc-500" : "text-text-secondary")}>
          <code>{json}</code>
        </pre>
      </div>
    </div>
  );
}

export default function Testing({ isDemo = false }: { isDemo?: boolean }) {
  const [active, setActive] = useState<Category>('functional');

  const fTests = isDemo ? demoFunctional : mainFunctional;
  const eTests = isDemo ? demoEdge : mainEdge;
  const nTests = isDemo ? demoNegative : mainNegative;
  const uTests = isDemo ? demoUnit : mainUnit;

  const categories: { key: Category; label: string; icon: React.ElementType; count: number }[] = [
    { key: 'functional', label: 'Functional Tests', icon: FlaskConical, count: fTests.length },
    { key: 'edge', label: 'Edge Cases', icon: AlertTriangle, count: eTests.length },
    { key: 'negative', label: 'Negative Tests', icon: ShieldAlert, count: nTests.length },
    { key: 'unit', label: 'Unit Test Stubs', icon: Code2, count: uTests.length },
    { key: 'postman', label: 'Postman Collection', icon: Send, count: 0 },
  ];

  const categoryData: Record<Exclude<Category, 'postman'>, TestCase[]> = {
    functional: fTests,
    edge: eTests,
    negative: nTests,
    unit: uTests,
  };

  const passCount = Object.values(categoryData).flat().filter(t => t.status === 'pass').length;
  const failCount = Object.values(categoryData).flat().filter(t => t.status === 'fail').length;
  const totalCount = Object.values(categoryData).flat().length;

  const content = (
    <div className={cn(
      "flex rounded-xl border overflow-hidden", 
      isDemo ? "h-full bg-black border-zinc-800" : "h-[calc(100vh-10rem)] bg-canvas border-border-subtle"
    )}>
      <aside className={cn(
        "w-[220px] shrink-0 border-r p-4 flex flex-col gap-1",
        isDemo ? "bg-zinc-950 border-zinc-800" : "border-border bg-surface"
      )}>
        <h2 className={cn("text-label-sm uppercase tracking-wider mb-3 px-2", isDemo ? "text-zinc-500" : "text-muted-foreground")}>Test Categories</h2>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = active === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-body transition-colors text-left',
                isActive
                  ? (isDemo ? 'bg-zinc-900 text-primary border-l-2 border-primary' : 'bg-elevated text-foreground border-l-2 border-primary')
                  : (isDemo ? 'text-zinc-400 hover:text-white hover:bg-zinc-900/50' : 'text-muted-foreground hover:text-foreground hover:bg-elevated/50')
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{cat.label}</span>
              {cat.count > 0 && (
                <span className={cn('text-label-sm font-mono', isActive ? 'text-primary' : (isDemo ? 'text-zinc-600' : 'text-text-muted'))}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Summary stats */}
        <div className={cn("mt-auto pt-4 border-t space-y-2 px-2", isDemo ? "border-zinc-800" : "border-border")}>
          <div className="flex justify-between text-label-sm">
            <span className={isDemo ? "text-zinc-500" : "text-muted-foreground"}>Total</span>
            <span className={cn("font-mono", isDemo ? "text-zinc-300" : "text-foreground")}>{totalCount}</span>
          </div>
          <div className="flex justify-between text-label-sm">
            <span className="text-accent-green">Passing</span>
            <span className="text-accent-green font-mono">{passCount}</span>
          </div>
          <div className="flex justify-between text-label-sm">
            <span className="text-accent-red">Failing</span>
            <span className="text-accent-red font-mono">{failCount}</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {active === 'postman' ? (
            <motion.div key="postman" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-hidden">
              <PostmanViewer isDemo={isDemo} postmanData={isDemo ? demoPostman : mainPostman} />
            </motion.div>
          ) : (
            <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className={cn("text-heading-md font-satoshi", isDemo ? "text-white" : "text-foreground")}>
                    {categories.find(c => c.key === active)?.label}
                  </h3>
                  <p className={cn("text-body mt-1", isDemo ? "text-zinc-400" : "text-muted-foreground")}>
                    {active === 'functional' && 'Core endpoint tests validating expected behavior'}
                    {active === 'edge' && 'Boundary conditions and unusual but valid inputs'}
                    {active === 'negative' && 'Invalid inputs and unauthorized access attempts'}
                    {active === 'unit' && 'Service-level unit test stubs for core logic'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {(['pass', 'fail', 'edge'] as TestStatus[]).map(s => {
                    const count = categoryData[active].filter(t => t.status === s).length;
                    if (count === 0) return null;
                    return (
                      <div key={s} className="flex items-center gap-1.5 text-label-sm">
                        <StatusBadge status={s} />
                        <span className={cn("font-mono", isDemo ? "text-zinc-500" : "text-text-muted")}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {categoryData[active].map((test) => (
                  <TestItem key={test.id} test={test} isDemo={isDemo} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );

  return isDemo ? content : <DashboardLayout>{content}</DashboardLayout>;
}
