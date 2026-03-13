// src/pages/CodeGenerator.tsx
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"; // <-- ADDED TOAST IMPORT
const VSCodeIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className} 
    fill="currentColor" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-5.58-4.312a1.495 1.495 0 0 0-1.819.021L.348 5.629a1.494 1.494 0 0 0-.14 2.112l4.636 5.25L.208 18.24a1.494 1.494 0 0 0 .14 2.112l.618.503a1.495 1.495 0 0 0 1.819.021l5.58-4.312 9.46 8.63a1.494 1.494 0 0 0 1.705.29l4.94-2.377A1.5 1.5 0 0 0 24 21.785V5.214a1.5 1.5 0 0 0-.85-1.352zM18 18.962l-4.59-4.183L18 12V18.962zM4.215 15.895l-2.057-2.33 2.057-2.33 1.151 1.151-1.151 1.151z" />
  </svg>
);
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
import JSZip from "jszip";

// ==========================================
// 1. TYPES & INTERFACES
// ==========================================
interface CodeFile {
  path: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: CodeFile[];
}

// ==========================================
// 2. MOCK DATA
// ==========================================
const mockFileTree: CodeFile[] = [
  {
    path: "/src", name: "src", type: "folder",
    children: [
      {
        path: "/src/controllers", name: "controllers", type: "folder",
        children: [
          { path: "/src/controllers/auth.controller.ts", name: "auth.controller.ts", type: "file", language: "typescript", content: "export const login = async (req: Request, res: Response) => {\n  // TODO: Implement JWT generation\n  res.status(200).json({ token: 'mock-jwt-token' });\n};\n\nexport const register = async (req: Request, res: Response) => {\n  // TODO: Hash password and save to Users DB\n  res.status(201).json({ message: 'User created' });\n};" }
        ]
      },
      {
        path: "/src/routes", name: "routes", type: "folder",
        children: [
          { path: "/src/routes/auth.routes.ts", name: "auth.routes.ts", type: "file", language: "typescript", content: "import { Router } from 'express';\nimport { login, register } from '../controllers/auth.controller';\n\nconst router = Router();\n\nrouter.post('/login', login);\nrouter.post('/register', register);\n\nexport default router;" }
        ]
      },
      { path: "/src/index.ts", name: "index.ts", type: "file", language: "typescript", content: "import express from 'express';\nimport authRoutes from './routes/auth.routes';\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\napp.use(express.json());\napp.use('/api/v1/auth', authRoutes);\n\napp.listen(PORT, () => {\n  console.log(`Server running on port ${PORT}`);\n});" }
    ]
  },
  { path: "/package.json", name: "package.json", type: "file", language: "json", content: "{\n  \"name\": \"auth-service\",\n  \"version\": \"1.0.0\",\n  \"main\": \"src/index.ts\",\n  \"dependencies\": {\n    \"express\": \"^4.18.2\",\n    \"jsonwebtoken\": \"^9.0.0\"\n  }\n}" },
  { path: "/Dockerfile", name: "Dockerfile", type: "file", language: "dockerfile", content: "FROM node:18-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD [\"npm\", \"start\"]" }
];

export default function CodeGenerator() {
  const { toast } = useToast();

  const handleOpenVSCode = async () => {
    try {
      toast({
        title: "Initializing Workspace",
        description: "Connecting to local bridge server...",
      });

      // We send the entire file tree to the bridge server.
      // The bridge server will handle folder selection (native), writing, and opening VS Code.
      const response = await fetch('http://localhost:3001/scaffold-and-open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: fileTree
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Bridge server not responding' }));
        throw new Error(data.error || 'Failed to communicate with bridge server');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `Project scaffolded to ${data.path} and opened in VS Code!`,
      });

    } catch (error: any) {
      console.error(error);
      toast({
        title: "VS Code Integration Failed",
        description: error.message || "Ensure the bridge server is running (npm run bridge).",
        variant: "destructive",
      });
    }
  };


  const handleDownloadZip = async () => {
    const zip = new JSZip();

    const addFilesToZip = (files: CodeFile[], currentZip: JSZip) => {
      files.forEach((file) => {
        if (file.type === "folder" && file.children) {
          const folder = currentZip.folder(file.name);
          if (folder) addFilesToZip(file.children, folder);
        } else if (file.type === "file") {
          currentZip.file(file.name, file.content || "");
        }
      });
    };

    toast({
      title: "Packaging Repository",
      description: "Compressing generated microservices into a .zip file...",
    });

    try {
      addFilesToZip(fileTree, zip);
      const content = await zip.generateAsync({ type: "blob" });
      
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "generated-project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Source code repository downloaded successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Download Failed",
        description: "There was an error generating the ZIP file.",
        variant: "destructive",
      });
    }
  };

  // ==========================================
  // 3. STATE MANAGEMENT
  // ==========================================
  const [fileTree, setFileTree] = useState<CodeFile[]>([]);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/src", "/src/routes", "/src/controllers"]));
  
  // Shiki specific state
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [isHighlighting, setIsHighlighting] = useState(false);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchGeneratedCode = async () => {
      setIsLoading(true);
      try {
        setTimeout(() => {
          setFileTree(mockFileTree);
          const firstFile = mockFileTree[0]?.children?.find(c => c.type === 'file') || mockFileTree[1];
          setActiveFile(firstFile);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to fetch code:", error);
      }
    };
    fetchGeneratedCode();
  }, []);

  // --- SHIKI HIGHLIGHTING EFFECT ---
  useEffect(() => {
    if (!activeFile?.content) {
      setHighlightedHtml("");
      return;
    }

    let isMounted = true;
    setIsHighlighting(true);

    const highlightCode = async () => {
      try {
        const html = await codeToHtml(activeFile.content || "", {
          lang: activeFile.language || "typescript",
          theme: "vitesse-dark", 
        });
        
        if (isMounted) {
          setHighlightedHtml(html);
          setIsHighlighting(false);
        }
      } catch (error) {
        console.error("Error highlighting code:", error);
        if (isMounted) {
          setHighlightedHtml(`<pre><code>${activeFile.content}</code></pre>`);
          setIsHighlighting(false);
        }
      }
    };

    highlightCode();

    return () => {
      isMounted = false;
    };
  }, [activeFile]);

  // ==========================================
  // 4. HELPER FUNCTIONS
  // ==========================================
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) newExpanded.delete(path);
    else newExpanded.add(path);
    setExpandedFolders(newExpanded);
  };

  const copyToClipboard = () => {
    if (!activeFile?.content) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.ts') || name.endsWith('.js')) return <FileCode2 className="w-4 h-4 text-primary" />;
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-400" />;
    return <FileText className="w-4 h-4 text-zinc-400" />;
  };

  const FileTreeNode = ({ node, depth = 0 }: { node: CodeFile; depth?: number }) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = activeFile?.path === node.path;

    if (node.type === "folder") {
      return (
        <div className="select-none">
          <div 
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800/50 rounded-md cursor-pointer text-sm text-zinc-300 transition-colors"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? <FolderOpen className="w-4 h-4 text-primary" /> : <Folder className="w-4 h-4 text-primary/70" />}
            {node.name}
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => <FileTreeNode key={child.path} node={child} depth={depth + 1} />)}
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm transition-colors
          ${isSelected ? "bg-primary/10 text-primary" : "hover:bg-zinc-800/50 text-zinc-400"}
        `}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => setActiveFile(node)}
      >
        {getFileIcon(node.name)}
        {node.name}
      </div>
    );
  };

  // ==========================================
  // 5. UI RENDER
  // ==========================================
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Code Scaffolding</h1>
          <p className="text-zinc-400 mt-1">Review and download the generated boilerplate for your services.</p>
        </div>
        <div className="flex gap-3">
          {/* UPDATED TO OPEN IN VSCODE */}
          <Button 
            variant="outline" 
            className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
            onClick={handleOpenVSCode}
          >
            <VSCodeIcon className="w-4 h-4" /> Open in VS Code
          </Button>

          {/* UPDATED ZIP DOWNLOAD BUTTON */}
          <Button 
            className="bg-primary hover:brightness-110 text-primary-foreground gap-2 glow-orange"
            onClick={handleDownloadZip}
          >
            <Download className="w-4 h-4" /> Download .ZIP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Left Panel: File Explorer */}
        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-zinc-800 pb-3 bg-zinc-950/50 px-4 pt-4">
            <CardTitle className="text-white text-sm flex items-center gap-2 uppercase tracking-wider font-semibold">
              <Code2 className="w-4 h-4 text-primary" />
              Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {isLoading ? (
            <div className="p-4 space-y-3">
              <Skeleton className="h-4 w-[80%] bg-zinc-800" />
              <Skeleton className="h-4 w-[60%] bg-zinc-800 ml-4" />
              <Skeleton className="h-4 w-[70%] bg-zinc-800 ml-4" />
              <Skeleton className="h-4 w-[50%] bg-zinc-800 ml-8" />
            </div>
          ) : (
            fileTree.map(node => <FileTreeNode key={node.path} node={node} />)
          )}
          </CardContent>
        </Card>

        {/* Right Panel: Shiki Viewer */}
        <Card className="lg:col-span-3 bg-[#121212] border-zinc-800 flex flex-col overflow-hidden relative">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2 relative z-20">
            <div className="flex items-center gap-2">
              {activeFile && getFileIcon(activeFile.name)}
              <span className="text-sm font-mono text-zinc-300">
                {activeFile ? activeFile.path : "Select a file"}
              </span>
            </div>
            {activeFile && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyToClipboard}
                className="text-zinc-400 hover:text-white h-8"
              >
                {copied ? <Check className="w-4 h-4 text-green-500 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Code"}
              </Button>
            )}
          </div>

          {/* Editor Content Area */}
          <CardContent className="flex-1 overflow-hidden p-0 relative group">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                Generating source code...
              </div>
            ) : !activeFile ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                <FileCode2 className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a file to view its contents</p>
              </div>
            ) : (
              <div className="relative h-full w-full">
                {/* Shiki sets a background color on its <pre> tag. The Tailwind arbitary variants here override it so it matches our card background smoothly */}
                <div 
                  className={`
                    h-full w-full overflow-auto text-sm font-mono custom-scrollbar
                    [&>pre]:!bg-transparent [&>pre]:p-6 [&>pre]:m-0
                    transition-opacity duration-300
                    ${isHighlighting ? "opacity-30" : "opacity-100"}
                  `}
                  dangerouslySetInnerHTML={{ __html: highlightedHtml }} 
                />
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}