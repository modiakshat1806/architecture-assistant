// src/pages/PRDUpload.tsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UploadCloud, FileType2, X, ArrowRight } from "lucide-react";

export default function PRDUpload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    // In a real app, this is where you'd upload the file to your backend
    navigate("/dashboard/processing");
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Upload PRD</h1>
          <p className="text-zinc-400 mt-2">Upload your Product Requirements Document to begin architecture translation.</p>
        </div>

        {!file ? (
          <Card 
            className={`
              bg-zinc-900 border-2 border-dashed transition-all duration-200 ease-in-out
              ${isDragging ? "border-primary-500 bg-primary-500/5 scale-[1.02]" : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"}
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
              <p className="text-zinc-400 mb-6 max-w-sm">
                Supports Markdown (.md), Text (.txt), and PDF files. Max size 10MB.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept=".md,.txt,.pdf"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800">
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
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="ghost" onClick={() => setFile(null)} className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                Cancel
              </Button>
              <Button onClick={handleProcess} className="bg-primary hover:brightness-110 text-white gap-2">
                Generate Architecture <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}