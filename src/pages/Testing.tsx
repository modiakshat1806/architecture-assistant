import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ShieldAlert, AlertTriangle, Code2, Send, CheckCircle2, XCircle, AlertCircle, Copy, Check, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  functionalTests,
  edgeCaseTests,
  negativeTests,
  unitStubs,
  postmanCollection,
  type TestCase,
  type TestStatus,
} from '@/data/demo/tests';

type Category = 'functional' | 'edge' | 'negative' | 'unit' | 'postman';

const categories: { key: Category; label: string; icon: React.ElementType; count: number }[] = [
  { key: 'functional', label: 'Functional Tests', icon: FlaskConical, count: functionalTests.length },
  { key: 'edge', label: 'Edge Cases', icon: AlertTriangle, count: edgeCaseTests.length },
  { key: 'negative', label: 'Negative Tests', icon: ShieldAlert, count: negativeTests.length },
  { key: 'unit', label: 'Unit Test Stubs', icon: Code2, count: unitStubs.length },
  { key: 'postman', label: 'Postman Collection', icon: Send, count: 0 },
];

const categoryData: Record<Exclude<Category, 'postman'>, TestCase[]> = {
  functional: functionalTests,
  edge: edgeCaseTests,
  negative: negativeTests,
  unit: unitStubs,
};

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

function TestItem({ test }: { test: TestCase }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border bg-surface p-4 hover:border-border-emphasis transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-code text-accent-orange font-medium">{test.method}</span>
            <span className="font-mono text-code text-foreground truncate">{test.endpoint}</span>
          </div>
          <p className="text-body text-muted-foreground mb-2">{test.description}</p>
          <p className="font-mono text-code text-text-secondary">
            Expected: <span className="text-text-code">{test.expected}</span>
          </p>
        </div>
        <StatusBadge status={test.status} />
      </div>
    </motion.div>
  );
}

function PostmanViewer() {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(postmanCollection, null, 2);

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
          <h3 className="text-heading-md text-foreground font-satoshi">Postman Collection</h3>
          <p className="text-body text-muted-foreground mt-1">Export and import into Postman or Insomnia</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-surface text-body text-muted-foreground hover:text-foreground hover:border-border-emphasis transition-colors"
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
      <div className="flex-1 rounded-lg border border-border bg-elevated overflow-auto">
        <pre className="p-4 text-code font-mono text-text-secondary leading-relaxed">
          <code>{json}</code>
        </pre>
      </div>
    </div>
  );
}

export default function Testing() {
  const [active, setActive] = useState<Category>('functional');

  const passCount = Object.values(categoryData).flat().filter(t => t.status === 'pass').length;
  const failCount = Object.values(categoryData).flat().filter(t => t.status === 'fail').length;
  const totalCount = Object.values(categoryData).flat().length;

  return (
    <div className="flex h-full bg-canvas">
      {/* Categories sidebar */}
      <aside className="w-[220px] shrink-0 border-r border-border bg-surface p-4 flex flex-col gap-1">
        <h2 className="text-label-sm text-muted-foreground uppercase tracking-wider mb-3 px-2">Test Categories</h2>
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
                  ? 'bg-elevated text-foreground border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-elevated/50'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{cat.label}</span>
              {cat.count > 0 && (
                <span className={cn('text-label-sm font-mono', isActive ? 'text-primary' : 'text-text-muted')}>
                  {cat.count}
                </span>
              )}
            </button>
          );
        })}

        {/* Summary stats */}
        <div className="mt-auto pt-4 border-t border-border space-y-2 px-2">
          <div className="flex justify-between text-label-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="text-foreground font-mono">{totalCount}</span>
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
      <main className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          {active === 'postman' ? (
            <motion.div key="postman" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <PostmanViewer />
            </motion.div>
          ) : (
            <motion.div key={active} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-heading-md text-foreground font-satoshi">
                    {categories.find(c => c.key === active)?.label}
                  </h3>
                  <p className="text-body text-muted-foreground mt-1">
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
                        <span className="text-text-muted font-mono">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                {categoryData[active].map((test) => (
                  <TestItem key={test.id} test={test} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
