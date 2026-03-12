import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, MessageCircle, Mail, ExternalLink, Zap, FileText, Code2, TestTube, Search, LifeBuoy, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const quickLinks = [
  { title: "Getting Started Guide", description: "Learn the basics of Blueprint.dev", icon: BookOpen, badge: "Popular" },
  { title: "PRD Upload & Analysis", description: "How to upload and process requirements", icon: FileText, badge: null },
  { title: "Code Generation", description: "Generate production-ready code from tasks", icon: Code2, badge: "New" },
  { title: "Testing Framework", description: "Run and manage automated test suites", icon: TestTube, badge: null },
];

const faqs = [
  {
    question: "How do I upload a PRD document?",
    answer: "Navigate to the PRD Analysis section from the sidebar, click 'Upload PRD', and drag & drop your document (PDF, DOCX, or Markdown). Our AI will parse and extract requirements automatically within seconds.",
  },
  {
    question: "What formats does the code generator support?",
    answer: "The code generator supports TypeScript, JavaScript, Python, and Go. It produces clean, production-ready code with proper error handling, types, and documentation based on your task specifications.",
  },
  {
    question: "How does sprint planning work?",
    answer: "Once tasks are generated from your PRD analysis, navigate to Sprint Planner. Tasks are automatically estimated and can be dragged into sprint cycles. The AI suggests optimal sprint compositions based on dependencies and team velocity.",
  },
  {
    question: "Can I integrate with existing project management tools?",
    answer: "Yes! Blueprint.dev supports integrations with GitHub, Jira, Linear, and Slack. Go to Settings → Integrations to connect your tools. We sync tasks, sprints, and code changes bidirectionally.",
  },
  {
    question: "How does the traceability matrix work?",
    answer: "The traceability matrix maps every requirement from your PRD to its corresponding tasks, architecture components, code modules, and test cases. This ensures complete coverage and helps identify gaps in implementation.",
  },
  {
    question: "What AI models power the analysis?",
    answer: "Blueprint.dev uses a combination of fine-tuned LLMs for PRD parsing, requirement extraction, and code generation. The models are optimized for software engineering workflows and continuously improved based on user feedback.",
  },
];

const supportChannels = [
  {
    title: "Community Discord",
    description: "Join 2,000+ developers building with Blueprint.dev",
    icon: MessageCircle,
    action: "Join Discord",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Email Support",
    description: "Get help from our engineering team within 24 hours",
    icon: Mail,
    action: "Send Email",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    title: "Documentation",
    description: "Comprehensive guides, API references, and tutorials",
    icon: BookOpen,
    action: "Browse Docs",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
];

export default function HelpSupport() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (channel: string) => {
    toast({ title: channel, description: `Opening ${channel.toLowerCase()}...` });
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
            <LifeBuoy className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-satoshi text-foreground">Help & Support</h1>
          <p className="text-text-secondary max-w-lg mx-auto">
            Find answers, browse documentation, or reach out to our team.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search help articles and FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded-xl py-3 pl-11 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-text-muted"
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((link) => (
            <Card
              key={link.title}
              className="bg-surface border-border-subtle hover:border-primary/30 transition-colors cursor-pointer group"
              onClick={() => toast({ title: link.title, description: "Opening article..." })}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-elevated flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <link.icon className="w-4.5 h-4.5 text-text-secondary group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{link.title}</h3>
                    {link.badge && (
                      <Badge className="bg-primary/15 text-primary border-0 text-[10px] px-1.5">{link.badge}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{link.description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors shrink-0 mt-0.5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <Card className="bg-surface border-border-subtle">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Frequently Asked Questions</CardTitle>
            <CardDescription className="text-text-muted">
              {searchQuery ? `${filteredFaqs.length} results for "${searchQuery}"` : "Common questions about Blueprint.dev"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border-subtle">
                  <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-text-secondary leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">No results found. Try a different search term.</p>
            )}
          </CardContent>
        </Card>

        {/* Support Channels */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 font-satoshi">Contact Support</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {supportChannels.map((channel) => (
              <Card
                key={channel.title}
                className="bg-surface border-border-subtle hover:border-primary/30 transition-colors"
              >
                <CardContent className="p-5 text-center space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${channel.bgColor} flex items-center justify-center mx-auto`}>
                    <channel.icon className={`w-5 h-5 ${channel.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{channel.title}</h3>
                    <p className="text-xs text-text-muted mt-1">{channel.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border-emphasis text-foreground hover:bg-overlay w-full"
                    onClick={() => handleAction(channel.title)}
                  >
                    {channel.action}
                    <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Status */}
        <Card className="bg-surface border-border-subtle">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <div>
                <p className="text-sm font-medium text-foreground">All Systems Operational</p>
                <p className="text-xs text-text-muted">Last checked 2 minutes ago</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-text-secondary hover:text-foreground"
              onClick={() => toast({ title: "Status Page", description: "Opening system status page..." })}
            >
              View Status Page
              <ExternalLink className="w-3 h-3 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
