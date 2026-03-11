// src/components/layout/DashboardLayout.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Layout, 
  FolderGit2, 
  FileText, 
  ListTodo, 
  CalendarDays, 
  Network, 
  GitMerge, // <-- Added GitMerge for Traceability
  Code2, 
  TestTube, 
  LogOut,
  Menu,
  Bell,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageTransition } from "../ui/PageTransition";
// Added for the Avatar dropdown (BUG 2)
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const navItems = [
  { name: "Projects", path: "/dashboard", icon: FolderGit2 },
  { name: "PRD Analysis", path: "/dashboard/analysis", icon: FileText },
  { name: "Tasks", path: "/dashboard/tasks", icon: ListTodo },
  { name: "Sprint Planner", path: "/dashboard/sprints", icon: CalendarDays },
  { name: "Architecture", path: "/dashboard/architecture", icon: Network },
  { name: "Traceability", path: "/dashboard/traceability", icon: GitMerge }, // <-- ADDED TRACEABILITY LINK
  { name: "Code Generator", path: "/dashboard/code", icon: Code2 },
  { name: "Testing", path: "/dashboard/testing", icon: TestTube },
  { name: "Chat & Clarify", path: "/dashboard/chat", icon: FileText },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // BUG 6 FIXED: Dynamically get the page name based on the URL
  const getPageName = () => {
    const currentItem = navItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.name : "Overview";
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="flex items-center gap-2">
          <Layout className="w-6 h-6 text-primary" />
          <span className="font-bold">Blueprint.dev</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <aside className={`
        ${isMobileMenuOpen ? "block" : "hidden"} 
        md:block w-full md:w-64 bg-zinc-900 border-r border-zinc-800 flex-shrink-0 transition-all duration-300 z-20
      `}>
        <div className="h-full flex flex-col">
          <div className="hidden md:flex items-center gap-2 p-6 border-b border-zinc-800 text-white">
            <Layout className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">Blueprint.dev</span>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.name} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                    ${isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}
                  `}>
                    <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-zinc-500"}`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* BUG 3 FIXED: Removed Settings link entirely, just kept a clean user profile card at the bottom */}
          <div className="p-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-zinc-950 border border-zinc-800">
               <Avatar className="w-8 h-8">
                 <AvatarImage src="https://github.com/shadcn.png" />
                 <AvatarFallback>U</AvatarFallback>
               </Avatar>
               <div className="flex flex-col">
                 <span className="text-sm font-medium text-white leading-none">Engineering</span>
                 <span className="text-xs text-zinc-500 mt-1">Free Plan</span>
               </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="hidden md:flex items-center justify-between px-8 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-4 text-zinc-400 text-sm">
            <span>Workspace</span>
            <span>/</span>
            {/* BUG 6 FIXED: Shows dynamic page name here */}
            <span className="text-white font-medium">{getPageName()}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>
            
            {/* BUG 2 FIXED: Interactive Dropdown for the Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="w-8 h-8 border border-zinc-700 cursor-pointer hover:border-zinc-500 transition-colors">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-200">
                <DropdownMenuItem className="cursor-pointer hover:bg-zinc-800 hover:text-white">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-400 focus:text-red-400 hover:bg-red-500/10"
                  onClick={() => navigate('/auth')}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-zinc-950 custom-scrollbar">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}