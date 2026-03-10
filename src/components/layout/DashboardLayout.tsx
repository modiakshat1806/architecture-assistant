import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Layout, 
  FolderGit2, 
  FileText, 
  ListTodo, 
  CalendarDays, 
  Network, 
  Code2, 
  TestTube, 
  Settings, 
  LogOut,
  Menu,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { name: "Projects", path: "/dashboard", icon: FolderGit2 },
  { name: "PRD Analysis", path: "/dashboard/analysis", icon: FileText },
  { name: "Tasks", path: "/dashboard/tasks", icon: ListTodo },
  { name: "Sprint Planner", path: "/dashboard/sprints", icon: CalendarDays },
  { name: "Architecture", path: "/dashboard/architecture", icon: Network },
  { name: "Code Generator", path: "/dashboard/code", icon: Code2 },
  { name: "Testing", path: "/dashboard/testing", icon: TestTube },
  { name: "Chat & Clarify", path: "/dashboard/chat", icon: FileText }, // Added Chat
  { name: "Automations", path: "/dashboard/automation", icon: Settings }, // Added Automations
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 text-primary-500" />
          <span className="font-bold">Blueprint.dev</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        md:block w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 transition-all duration-300 z-20
      `}>
        <div className="h-full flex flex-col">
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center gap-2 p-6 border-b border-zinc-800 text-white">
            <Layout className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold tracking-tight">Blueprint.dev</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                    ${isActive 
                      ? "bg-primary/10 text-primary-500" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}
                  `}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary-500" : "text-zinc-500"}`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Settings/Logout */}
          <div className="p-4 border-t border-zinc-800 space-y-1">
            <Link to="/settings">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm font-medium">
                <Settings className="w-5 h-5 text-zinc-500" />
                Settings
              </div>
            </Link>
            <Link to="/auth">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-md text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium">
                <LogOut className="w-5 h-5" />
                Logout
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4 text-zinc-400 text-sm">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-medium">Current Project</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8 border border-zinc-700">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950">
          {children}
        </div>
      </main>
    </div>
  );
}