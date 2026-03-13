// src/pages/Processing.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileSearch, Network, ListTodo, Code2, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const steps = [
  { id: 1, name: "Extracting Requirements", icon: FileSearch, description: "Parsing PRD and identifying core features." },
  { id: 2, name: "Designing Architecture", icon: Network, description: "Mapping out microservices and database schema." },
  { id: 3, name: "Generating Tasks", icon: ListTodo, description: "Breaking down architecture into sprint-ready tickets." },
  { id: 4, name: "Scaffolding Codebase", icon: Code2, description: "Preparing initial boilerplate and file structure." },
];

export default function Processing() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  // Mock the polling/processing delay
  useEffect(() => {
    if (currentStep <= steps.length) {
      const timer = setTimeout(() => {
        if (currentStep === steps.length) {
          setIsComplete(true);
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }, 2500); // 2.5 seconds per step for demo purposes

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto mt-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
              {isComplete ? "Architecture Generated" : "Processing PRD..."}
            </h1>
            <p className="text-zinc-400 max-w-lg mx-auto text-lg">
              {isComplete
                ? "Your blueprint is ready. Review the analysis, architecture, and generated tasks."
                : "Our AI is analyzing your document and building out your project's technical foundation."}
            </p>
          </motion.div>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id && !isComplete;
            const isDone = currentStep > step.id || isComplete;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={`
                  p-6 border-2 transition-all duration-500 flex items-start gap-4
                  ${isActive ? "bg-zinc-900 border-primary-500/50 shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]" :
                    isDone ? "bg-zinc-900 border-green-500/20" :
                      "bg-zinc-950 border-zinc-800 opacity-50"}
                `}>
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${isActive ? "bg-primary-500/20 text-primary-400" :
                      isDone ? "bg-green-500/20 text-green-400" :
                        "bg-zinc-800 text-zinc-500"}
                  `}>
                    {isDone ? <CheckCircle2 className="w-6 h-6" /> :
                      isActive ? <Loader2 className="w-6 h-6 animate-spin" /> :
                        <Icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${isActive || isDone ? "text-white" : "text-zinc-500"}`}>
                      {step.name}
                    </h3>
                    <p className="text-sm text-zinc-400">{step.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isComplete ? 1 : 0, scale: isComplete ? 1 : 0.9 }}
          transition={{ duration: 0.4 }}
          className="h-16" // Fixed height to prevent layout shift
        >
          {isComplete && (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard/analysis")}
              className="bg-primary hover:brightness-110 text-white text-lg px-8 gap-2 glow-primary"
            >
              View Analysis & Architecture <ArrowRight className="w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}