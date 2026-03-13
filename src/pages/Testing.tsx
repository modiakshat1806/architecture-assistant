import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical,
  ShieldAlert,
  AlertTriangle,
  Code2,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

type TestStatus = "pass" | "fail" | "edge";

type TestCase = {
  id: string;
  method: string;
  endpoint: string;
  description: string;
  expected: string;
  status: TestStatus;
};

type Category = "functional" | "edge" | "negative" | "unit" | "postman";

export default function Testing() {

  const [active, setActive] = useState<Category>("functional");

  const [functionalTests, setFunctionalTests] = useState<TestCase[]>([]);
  const [edgeCaseTests, setEdgeCaseTests] = useState<TestCase[]>([]);
  const [negativeTests, setNegativeTests] = useState<TestCase[]>([]);
  const [unitStubs, setUnitStubs] = useState<TestCase[]>([]);
  const [postmanCollection, setPostmanCollection] = useState<any>({});

  /*
  =====================================
  LOAD TESTS FROM PIPELINE
  =====================================
  */

  useEffect(() => {

    const raw = localStorage.getItem("blueprint_project_data");

    if (!raw) return;

    const data = JSON.parse(raw);

    const tests = data.tests || [];

    setFunctionalTests(tests.filter((t: any) => t.category === "functional"));
    setEdgeCaseTests(tests.filter((t: any) => t.category === "edge"));
    setNegativeTests(tests.filter((t: any) => t.category === "negative"));
    setUnitStubs(tests.filter((t: any) => t.category === "unit"));

    setPostmanCollection(data.postmanCollection || {});

  }, []);

  /*
  =====================================
  CATEGORY DATA
  =====================================
  */

  const categoryData = {
    functional: functionalTests,
    edge: edgeCaseTests,
    negative: negativeTests,
    unit: unitStubs
  };

  const categories = [
    { key: "functional", label: "Functional Tests", icon: FlaskConical, count: functionalTests.length },
    { key: "edge", label: "Edge Cases", icon: AlertTriangle, count: edgeCaseTests.length },
    { key: "negative", label: "Negative Tests", icon: ShieldAlert, count: negativeTests.length },
    { key: "unit", label: "Unit Test Stubs", icon: Code2, count: unitStubs.length },
    { key: "postman", label: "Postman Collection", icon: Send, count: 0 }
  ];

  /*
  =====================================
  STATUS CONFIG
  =====================================
  */

  const statusConfig = {
    pass: {
      label: "PASS",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-400 border-green-500/30"
    },
    fail: {
      label: "FAIL",
      icon: XCircle,
      className: "bg-red-500/10 text-red-400 border-red-500/30"
    },
    edge: {
      label: "EDGE",
      icon: AlertCircle,
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
    }
  };

  function StatusBadge({ status }: { status: TestStatus }) {

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border",
        config.className
      )}>
        <Icon className="h-3 w-3"/>
        {config.label}
      </span>
    );
  }

  /*
  =====================================
  POSTMAN VIEWER
  =====================================
  */

  function PostmanViewer() {

    const [copied, setCopied] = useState(false);

    const json = JSON.stringify(postmanCollection, null, 2);

    const copy = () => {

      navigator.clipboard.writeText(json);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);

    };

    const download = () => {

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "api-collection.json";
      a.click();

      URL.revokeObjectURL(url);

    };

    return (
      <div className="space-y-4">

        <div className="flex gap-2">

          <button onClick={copy} className="btn">
            {copied ? <Check/> : <Copy/>}
          </button>

          <button onClick={download} className="btn">
            <Download/>
          </button>

        </div>

        <pre className="bg-zinc-900 p-4 rounded overflow-auto">
          <code>{json}</code>
        </pre>

      </div>
    );

  }

  /*
  =====================================
  STATS
  =====================================
  */

  const allTests = Object.values(categoryData).flat();

  const passCount = allTests.filter(t => t.status === "pass").length;
  const failCount = allTests.filter(t => t.status === "fail").length;
  const totalCount = allTests.length;

  /*
  =====================================
  UI
  =====================================
  */

  return (

    <div className="flex h-full">

      {/* Sidebar */}

      <aside className="w-[220px] border-r p-4">

        {categories.map(cat => {

          const Icon = cat.icon;

          return (
            <button
              key={cat.key}
              onClick={() => setActive(cat.key as Category)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded text-sm",
                active === cat.key ? "bg-zinc-800 text-white" : "text-zinc-400"
              )}
            >
              <Icon className="h-4 w-4"/>
              {cat.label}
            </button>
          );

        })}

        <div className="mt-6 text-xs space-y-1">

          <div>Total: {totalCount}</div>
          <div className="text-green-400">Passing: {passCount}</div>
          <div className="text-red-400">Failing: {failCount}</div>

        </div>

      </aside>

      {/* Main */}

      <main className="flex-1 p-6 overflow-auto">

        <AnimatePresence mode="wait">

          {active === "postman" ? (

            <PostmanViewer/>

          ) : (

            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >

              <div className="space-y-3">

                {categoryData[active].map(test => (

                  <div key={test.id} className="p-4 border rounded bg-zinc-900">

                    <div className="flex justify-between">

                      <div>

                        <div className="font-mono text-orange-400">
                          {test.method} {test.endpoint}
                        </div>

                        <p className="text-sm text-zinc-400">
                          {test.description}
                        </p>

                        <p className="text-xs text-zinc-500">
                          Expected: {test.expected}
                        </p>

                      </div>

                      <StatusBadge status={test.status}/>

                    </div>

                  </div>

                ))}

              </div>

            </motion.div>

          )}

        </AnimatePresence>

      </main>

    </div>

  );

}