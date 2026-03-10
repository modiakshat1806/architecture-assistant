import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Demo from "./pages/Demo.tsx";
import Auth from "./pages/Auth.tsx";          // Add this import
import Dashboard from "./pages/Dashboard.tsx"; // Add this import
import PRDUpload from "./pages/PRDUpload.tsx";
import Processing from "./pages/Processing.tsx";
import Analysis from "./pages/Analysis.tsx";
import Architecture from "./pages/Architecture.tsx";
import Tasks from "./pages/Tasks.tsx";
import CodeGenerator from "./pages/CodeGenerator.tsx";
import Chat from "./pages/Chat.tsx";
import Automation from "./pages/Automation.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/auth" element={<Auth />} />             {/* Add Auth Route */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/upload" element={<PRDUpload />} />
          <Route path="/dashboard/processing" element={<Processing />} />
          <Route path="/dashboard/analysis" element={<Analysis />} />
          <Route path="/dashboard/architecture" element={<Architecture />} />
          <Route path="/dashboard/tasks" element={<Tasks />} />
          <Route path="/dashboard/code" element={<CodeGenerator />} />
          <Route path="/dashboard/chat" element={<Chat />} />
          <Route path="/dashboard/automation" element={<Automation />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;