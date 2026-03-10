// src/pages/CodeGenerator.tsx
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// ==========================================
// 1. TYPES & INTERFACES (Modular Setup)
// ==========================================
// This defines the exact structure your backend should return.
interface CodeFile {
  path: string;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: CodeFile[];
}

// ==========================================
// 2. MOCK DATA (To be replaced by API)
// ==========================================
const mockFileTree: CodeFile[] = [
  {
    path: "/src", name: "src", type: "folder",
    children: [
      {
        path: "/src/controllers", name: "controllers", type: "folder",
        children: [
          { path: "/src/controllers/auth.controller.ts", name: "auth.controller.ts", type: "file", language: "typescript", content: "export const login = async (req, res) => {\n  // TODO: Implement JWT generation\n  res.status(200).json({ token: 'mock-jwt-token' });\n};\n\nexport const register = async (req, res) => {\n  // TODO: Hash password and save to Users DB\n  res.status(201).json({ message: 'User created' });\n};" }
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
  // ==========================================
  // 3. STATE MANAGEMENT
  // ==========================================
  const [fileTree, setFileTree] = useState<CodeFile[]>([]);
  const [activeFile, setActiveFile] = useState<CodeFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/src", "/src/routes", "/src/controllers"]));

  // --- BACKEND INTEGRATION POINT ---
  // When hooking up to the backend, replace this setTimeout with a real fetch()/axios call.
  useEffect(() => {
    const fetchGeneratedCode = async () => {
      setIsLoading(true);
      try {
        // const response = await fetch('/api/projects/123/code');
        // const data = await response.json();
        // setFileTree(data.tree);
        
        // Simulating API delay
        setTimeout(() => {
          setFileTree(mockFileTree);
          // Auto-select the first file (index.ts in this case)
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
    if (name.endsWith('.ts') || name.endsWith('.js')) return <FileCode2 className="w-4 h-4 text-primary-400" />;
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-400" />;
    return <FileText className="w-4 h-4 text-zinc-400" />;
  };

  // Recursive component to render the file tree
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
            {isExpanded ? <FolderOpen className="w-4 h-4 text-primary-400" /> : <Folder className="w-4 h-4 text-primary-500" />}
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
          ${isSelected ? "bg-primary-500/10 text-primary-400" : "hover:bg-zinc-800/50 text-zinc-400"}
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
          <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2">
            <Terminal className="w-4 h-4" /> Open in StackBlitz
          </Button>
          <Button className="bg-primary hover:brightness-110 text-white gap-2">
            <Download className="w-4 h-4" /> Download .ZIP
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        
        {/* Left Panel: File Explorer */}
        <Card className="lg:col-span-1 bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
          <CardHeader className="border-b border-zinc-800 pb-3 bg-zinc-950/50 px-4 pt-4">
            <CardTitle className="text-white text-sm flex items-center gap-2 uppercase tracking-wider font-semibold">
              <Code2 className="w-4 h-4 text-primary-500" />
              Explorer
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-zinc-500 text-sm p-4 text-center animate-pulse">Loading file tree...</div>
            ) : (
              fileTree.map(node => <FileTreeNode key={node.path} node={node} />)
            )}
          </CardContent>
        </Card>

        {/* Right Panel: Code Editor/Viewer */}
        <Card className="lg:col-span-3 bg-zinc-950 border-zinc-800 flex flex-col overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
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
          <CardContent className="flex-1 overflow-auto p-0 relative group custom-scrollbar bg-[#0d1117]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm">
                Generating source code...
              </div>
            ) : activeFile?.content ? (
              // In production, you would replace this <pre> tag with a library like 'shiki' or '@monaco-editor/react'
              <pre className="p-4 text-sm font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                <code>{activeFile.content}</code>
              </pre>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500">
                <FileCode2 className="w-12 h-12 mb-4 opacity-20" />
                <p>Select a file to view its contents</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}