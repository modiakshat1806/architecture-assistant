// src/pages/PRDUpload.tsx
import { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, FileType2, X, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PRDUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  
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
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  }, []);

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

    try {
      // 1. Verify Authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Authentication session expired. Please log in again.");

      // 2. Prepare File Path (Organized by User ID and Project Name)
      const cleanProjectName = projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${user.id}/${cleanProjectName}/${timestamp}.${fileExt}`;
      
      // 3. Upload to 'prd-files' Bucket
      const { data, error: uploadError } = await supabase.storage
        .from('prd-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        if (uploadError.message.includes("Bucket not found")) {
          throw new Error("Storage Error: The 'prd-files' bucket does not exist in Supabase. Please create it.");
        }
        throw uploadError;
      }

      // 4. Success! Redirect to Processing
      // We pass the filePath and projectName so the AI Backend can find the file later
      navigate("/dashboard/processing", { 
        state: { 
          filePath: data.path,
          projectName: projectName,
          fileType: fileExt
        } 
      });

    } catch (err: any) {
      console.error("Upload process error:", err);
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {projectName === "Untitled Project" ? "Upload PRD" : `PRD for: ${projectName}`}
          </h1>
          <p className="text-zinc-400 mt-2">
            Upload your requirements to start the AI architecture generation.
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
              bg-zinc-900 border-2 border-dashed transition-all duration-200 ease-in-out
              ${isDragging ? "border-primary-500 bg-primary-500/5 scale-[1.01]" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6">
                <UploadCloud className={`w-8 h-8 ${isDragging ? "text-primary-500" : "text-zinc-400"}`} />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Drag & drop your document here</h3>
              <p className="text-zinc-400 mb-6 max-w-sm text-sm">
                Supports Markdown, Text, and PDF files. Max size 10MB.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".md,.txt,.pdf"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 pointer-events-none">
                  Browse Files
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <FileType2 className="w-5 h-5 text-primary-500" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-white font-medium truncate max-w-[200px] md:max-w-xs">{file.name}</p>
                  <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFile(null)} 
                disabled={isUploading}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                className="bg-primary hover:brightness-110 text-white gap-2 px-6"
              >
                {isUploading ? "Uploading..." : "Generate Architecture"} 
                {!isUploading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}