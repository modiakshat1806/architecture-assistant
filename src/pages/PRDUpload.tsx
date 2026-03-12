// src/pages/PRDUpload.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, FileType2, X, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function PRDUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // States
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get project name from Dashboard "New Project" dialog
  const projectName = location.state?.projectName || "Untitled Project";

  // Ensure user is logged in on mount
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF document.",
        });
      }
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    localStorage.removeItem("blueprint_project_data");

    try {
      // 1. Verify Authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication session expired. Please log in again.");

      // 2. Send to our Local AI Pipeline
      const formData = new FormData();
      formData.append("prd", file); 

      const response = await fetch("http://localhost:5000/api/prd/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error: " + response.status);

      const result = await response.json();
      
      // 3. Normalize the data before saving
      const rawData = result.data || {};
      const safeData = {
        // Use the friend's dynamic projectName if available, otherwise fallback to AI's name
        projectName: projectName !== "Untitled Project" ? projectName : (rawData.projectName || file.name.replace(".pdf", "")),
        features: rawData.features || [],
        stories: rawData.stories || [],
        tasks: rawData.tasks || [],
        architecture: rawData.architecture || { nodes: [], edges: [] },
        traceability: rawData.traceability || { nodes: [], edges: [] },
        healthScore: rawData.healthScore || { score: 0, issues: ["Analysis incomplete"] }
      };

      // 4. Save and Redirect
      localStorage.setItem("blueprint_project_data", JSON.stringify(safeData));
      toast({ title: "Analysis Complete", description: "Project roadmap generated." });
      navigate("/dashboard/analysis"); 

    } catch (err: any) {
      console.error("Upload process error:", err);
      setError(err.message || "An unexpected error occurred during upload.");
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mt-8 font-satoshi animate-in fade-in duration-500">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {projectName === "Untitled Project" ? "Upload PRD" : `PRD for: ${projectName}`}
          </h1>
          <p className="text-zinc-400 mt-2">
            Upload a PRD. Gemini 3 Flash will extract the technical backlog and API contracts.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!file ? (
          <Card 
            className={`
              bg-zinc-900 border-2 border-dashed transition-all duration-200 ease-in-out overflow-hidden
              ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
                <UploadCloud className={`w-8 h-8 ${isDragging ? "text-primary" : "text-zinc-500"}`} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Drag & drop your PRD</h3>
              <p className="text-zinc-400 mb-6 max-w-sm text-sm">
                Supports Markdown, Text, and PDF files. Max size 10MB.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".pdf"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 font-medium px-8 pointer-events-none">
                  Browse Files
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800 p-6 animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800 shadow-sm">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                  <FileType2 className="w-6 h-6 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white font-bold truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                  <p className="text-sm text-zinc-500 font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFile(null)} 
                disabled={isUploading}
                className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setFile(null)} 
                disabled={isUploading}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleProcess} 
                disabled={isUploading}
                className="bg-primary hover:brightness-110 text-white gap-2 font-bold px-8 glow-orange"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    Begin Analysis <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}