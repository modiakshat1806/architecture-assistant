// src/pages/Analysis.tsx
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast"; // <-- 1. ADDED IMPORT
import { jsPDF } from "jspdf";
import { ListTodo, Zap, Clock, CheckCircle2, AlertCircle, TriangleAlert } from "lucide-react";

const extractedFeatures = [
  { id: "feat-1", title: "User Authentication System", description: "JWT-based authentication with OAuth2 providers (Google, GitHub).", complexity: "High", tasks: 8 },
  { id: "feat-2", title: "Real-time Dashboard", description: "WebSocket connection for live data updates and analytics visualization.", complexity: "Medium", tasks: 5 },
  { id: "feat-3", title: "Payment Gateway Integration", description: "Stripe integration for subscription billing and invoicing.", complexity: "High", tasks: 12 }
];

const ambiguities = [
  { id: "amb-1", feature: "Authentication", text: "OAuth redirect URLs for staging env not defined.", severity: "Medium" },
  { id: "amb-2", feature: "Payments", text: "Currency support (multi-currency vs single) is unclear.", severity: "High" }
];

const missingRequirements = [
  { id: "miss-1", feature: "User Profile", text: "No mention of profile picture storage limits or formats.", severity: "high" },
  { id: "miss-2", feature: "Notifications", text: "Email template localization strategy is missing.", severity: "medium" }
];

export default function Analysis() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleExport = () => {
    const doc = new jsPDF();
    let y = 20;

    const checkPageBreak = (neededSpace: number) => {
      if (y + neededSpace > 270) {
        doc.addPage();
        y = 20;
        return true;
      }
      return false;
    };

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("PRD Analysis Report", 20, y);
    y += 12;

    // Meta info
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
    y += 6;
    doc.text("Project: V2 Platform Refactor", 20, y);
    y += 12;

    // Overview Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("1. Project Summary", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Overall Complexity: High`, 25, y);
    y += 6;
    doc.text(`Estimated Timeline: 4-6 Weeks`, 25, y);
    y += 15;

    // Features Section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("2. Extracted Features", 20, y);
    y += 10;

    extractedFeatures.forEach((feature, index) => {
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${feature.title}`, 20, y);
      y += 6;

      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.text(`Complexity: ${feature.complexity} | Tasks: ${feature.tasks}`, 25, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitDescription = doc.splitTextToSize(feature.description, 170);
      doc.text(splitDescription, 25, y);
      y += (splitDescription.length * 5) + 10;
    });

    // Ambiguities Section
    y += 5;
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("3. Ambiguities Detected", 20, y);
    y += 10;

    ambiguities.forEach((a, index) => {
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${a.feature}`, 25, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(a.text, 165);
      doc.text(splitText, 30, y);
      y += (splitText.length * 5) + 8;
    });

    // Missing Requirements Section
    y += 5;
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("4. Missing Requirements", 20, y);
    y += 10;

    missingRequirements.forEach((m, index) => {
      checkPageBreak(20);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${index + 1}. ${m.feature}`, 25, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(m.text, 165);
      doc.text(splitText, 30, y);
      y += (splitText.length * 5) + 8;
    });

    doc.save("PRD_Analysis_Report.pdf");
    toast({ title: "Success", description: "Comprehensive analysis report downloaded." });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">PRD Analysis</h1>
          <p className="text-zinc-400 mt-1">Review the extracted requirements and system complexity.</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            className="bg-primary hover:brightness-110 text-white gap-2 shadow-lg glow-orange"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Restructured Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Insights (col-span-9) */}
        <div className="lg:col-span-9 space-y-6 pr-2">

          {/* Section: Extracted Features */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4 h-4 text-primary" />
                  Extracted Features
                </div>
                <span className="bg-primary/10 text-primary-400 px-2 py-0.5 rounded text-xs font-medium">
                  {extractedFeatures.length} Found
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {extractedFeatures.map((feature) => (
                  <AccordionItem key={feature.id} value={feature.id} className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:text-primary hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <CheckCircle2 className="w-4 h-4 text-green-500 hidden sm:block" />
                        <span>{feature.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      <p className="mb-4">{feature.description}</p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                          <Zap className="w-3 h-3 text-amber-500" />
                          Complexity: <span className="text-white">{feature.complexity}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                          <ListTodo className="w-3 h-3 text-primary" />
                          <span className="text-white">{feature.tasks}</span> Tasks Generated
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* New Section: Ambiguity Detected */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4 text-amber-500" />
                  Ambiguity Detected
                </div>
                <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-medium">
                  {ambiguities.length} Issues
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {ambiguities.map((a) => (
                  <AccordionItem key={a.id} value={a.id} className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:text-amber-500 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <Badge variant="outline" className={cn(
                          "uppercase text-[10px] px-1.5 py-0 h-4 border",
                          a.severity === 'High' ? "text-red-400 border-red-500/20 bg-red-500/5" : "text-amber-400 border-amber-500/20 bg-amber-500/5"
                        )}>
                          {a.severity}
                        </Badge>
                        <span className="font-semibold">{a.feature}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      <p className="text-sm">{a.text}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* New Section: Missing Requirements */}
          <Card className="bg-zinc-900 border-zinc-800 flex flex-col overflow-hidden">
            <CardHeader className="border-b border-zinc-800 pb-4 bg-zinc-950/50">
              <CardTitle className="text-white text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Missing Requirements
                </div>
                <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-medium">
                  {missingRequirements.length} Gaps
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Accordion type="single" collapsible className="w-full">
                {missingRequirements.map((m) => (
                  <AccordionItem key={m.id} value={m.id} className="border-zinc-800">
                    <AccordionTrigger className="text-white hover:text-red-500 hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <span className="font-semibold">{m.feature}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-zinc-400">
                      <p className="text-sm">{m.text}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Panel 2: Metrics & Overview (col-span-3) remains as is */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Project Complexity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">High</div>
              <p className="text-xs text-zinc-500">Based on security and real-time requirements.</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Estimated Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">4-6 Weeks</div>
              <p className="text-xs text-zinc-500">Assumes a team of 3 developers.</p>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}