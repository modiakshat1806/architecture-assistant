// src/pages/CodeGenerator.tsx
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

import {
  Folder,
  FolderOpen,
  FileCode2,
  FileJson,
  FileText,
  Copy,
  Check,
  Download,
  Terminal,
  Code2
} from "lucide-react";

import { codeToHtml } from "shiki";

interface CodeFile {
  path: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: CodeFile[];
}

export default function CodeGenerator() {

  const { toast } = useToast();

  const [fileTree, setFileTree] = useState<CodeFile[]>([]);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [expandedFolders, setExpandedFolders] =
    useState<Set<string>>(new Set());

  const [highlightedHtml, setHighlightedHtml] = useState("");
  const [isHighlighting, setIsHighlighting] = useState(false);

  /*
  ======================================
  LOAD PIPELINE CODE STRUCTURE
  ======================================
  */

  useEffect(() => {

    try {

      const raw = localStorage.getItem("blueprint_project_data");

      if (!raw) {
        setIsLoading(false);
        return;
      }

      const data = JSON.parse(raw);

      const codeStructure = data.codeStructure || [];

      setFileTree(codeStructure);

      const findFirstFile = (nodes: CodeFile[]): CodeFile | null => {

        for (const n of nodes) {

          if (n.type === "file") return n;

          if (n.children) {
            const f = findFirstFile(n.children);
            if (f) return f;
          }

        }

        return null;
      };

      const firstFile = findFirstFile(codeStructure);

      if (firstFile) setActiveFile(firstFile);

      setIsLoading(false);

    } catch (err) {

      console.error("Failed to load code structure:", err);
      setIsLoading(false);

    }

  }, []);

  /*
  ======================================
  SHIKI HIGHLIGHTING
  ======================================
  */

  useEffect(() => {

    if (!activeFile?.content) {
      setHighlightedHtml("");
      return;
    }

    let mounted = true;

    const highlight = async () => {

      setIsHighlighting(true);

      try {

        const html = await codeToHtml(activeFile.content || "", {
          lang: activeFile.language || "typescript",
          theme: "vitesse-dark"
        });

        if (mounted) {
          setHighlightedHtml(html);
          setIsHighlighting(false);
        }

      } catch {

        if (mounted) {
          setHighlightedHtml(`<pre>${activeFile.content}</pre>`);
          setIsHighlighting(false);
        }

      }

    };

    highlight();

    return () => {
      mounted = false;
    };

  }, [activeFile]);

  /*
  ======================================
  HELPERS
  ======================================
  */

  const toggleFolder = (path: string) => {

    const next = new Set(expandedFolders);

    if (next.has(path)) next.delete(path);
    else next.add(path);

    setExpandedFolders(next);

  };

  const copyToClipboard = () => {

    if (!activeFile?.content) return;

    navigator.clipboard.writeText(activeFile.content);

    setCopied(true);

    setTimeout(() => setCopied(false), 2000);

  };

  const getFileIcon = (name: string) => {

    if (name.endsWith(".ts") || name.endsWith(".js"))
      return <FileCode2 className="w-4 h-4 text-primary" />;

    if (name.endsWith(".json"))
      return <FileJson className="w-4 h-4 text-yellow-400" />;

    return <FileText className="w-4 h-4 text-zinc-400" />;

  };

  /*
  ======================================
  FILE TREE NODE
  ======================================
  */

  const FileTreeNode = ({
    node,
    depth = 0
  }: {
    node: CodeFile;
    depth?: number;
  }) => {

    const isExpanded = expandedFolders.has(node.path);
    const isSelected = activeFile?.path === node.path;

    if (node.type === "folder") {

      return (
        <div>

          <div
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800 rounded-md cursor-pointer text-sm"
            style={{ paddingLeft: depth * 12 + 8 }}
            onClick={() => toggleFolder(node.path)}
          >

            {isExpanded
              ? <FolderOpen className="w-4 h-4 text-primary" />
              : <Folder className="w-4 h-4 text-primary/70" />}

            {node.name}

          </div>

          {isExpanded && node.children && (
            <div>
              {node.children.map(child => (
                <FileTreeNode
                  key={child.path}
                  node={child}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}

        </div>
      );

    }

    return (

      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer text-sm
        ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-zinc-800 text-zinc-400"}`}
        style={{ paddingLeft: depth * 12 + 8 }}
        onClick={() => setActiveFile(node)}
      >

        {getFileIcon(node.name)}
        {node.name}

      </div>

    );

  };

  /*
  ======================================
  UI
  ======================================
  */

  return (

    <DashboardLayout>

      <div className="flex justify-between items-center mb-8">

        <div>

          <h1 className="text-3xl font-bold text-white">
            Code Scaffolding
          </h1>

          <p className="text-zinc-400">
            Review the generated backend structure
          </p>

        </div>

        <div className="flex gap-3">

          <Button
            variant="outline"
            onClick={() =>
              toast({
                title: "Opening StackBlitz",
                description: "Launching cloud dev environment"
              })
            }
          >
            <Terminal className="w-4 h-4 mr-2" />
            StackBlitz
          </Button>

          <Button
            onClick={() =>
              toast({
                title: "Preparing ZIP",
                description: "Packaging repository"
              })
            }
          >
            <Download className="w-4 h-4 mr-2" />
            Download ZIP
          </Button>

        </div>

      </div>

      <div className="grid grid-cols-4 gap-6 h-[70vh]">

        {/* Explorer */}

        <Card className="col-span-1 bg-zinc-900 border-zinc-800">

          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Explorer
            </CardTitle>
          </CardHeader>

          <CardContent>

            {isLoading ? (

              <Skeleton className="h-4 w-full" />

            ) : (

              fileTree.map(n => (
                <FileTreeNode key={n.path} node={n} />
              ))

            )}

          </CardContent>

        </Card>

        {/* Code Viewer */}

        <Card className="col-span-3 bg-[#121212] border-zinc-800">

          <CardHeader className="flex justify-between">

            <div className="flex gap-2 items-center">

              {activeFile && getFileIcon(activeFile.name)}

              <span className="font-mono text-sm">
                {activeFile?.path}
              </span>

            </div>

            {activeFile && (

              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
              >

                {copied
                  ? <Check className="w-4 h-4 text-green-400" />
                  : <Copy className="w-4 h-4" />}

              </Button>

            )}

          </CardHeader>

          <CardContent className="overflow-auto">

            {isHighlighting ? (

              <p className="text-zinc-500">
                Highlighting code...
              </p>

            ) : (

              <div
                dangerouslySetInnerHTML={{
                  __html: highlightedHtml
                }}
              />

            )}

          </CardContent>

        </Card>

      </div>

    </DashboardLayout>

  );

}