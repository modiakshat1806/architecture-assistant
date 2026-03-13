import { useState, useMemo } from "react";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  ListTodo,
  ArrowRight,
  CircleDashed,
  Filter,
  BookOpen, Play, Loader2, AlertCircle,
  Search,
  X,
  Plus
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Tasks() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredStories = useMemo(() => {
    if (!searchQuery) return BACKLOG_STORIES;
    const query = searchQuery.toLowerCase();

    return BACKLOG_STORIES.map(story => {
      // Find tasks that match the search query (title, priority, id, or type)
      const filteredTasks = story.tasks.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.priority.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query) ||
        task.type.toLowerCase().includes(query)
      );

      // If story title matches query, include the whole story
      const isStoryMatch = story.title.toLowerCase().includes(query) ||
        story.description.toLowerCase().includes(query);

      if (isStoryMatch) {
        return story;
      }

      if (filteredTasks.length > 0) {
        return {
          ...story,
          tasks: filteredTasks,
          // Re-calculate points for the filtered view if we want to be precise, 
          // or keep original points. Let's keep original for context.
        };
      }
      return null;
    }).filter(Boolean) as typeof BACKLOG_STORIES;
  }, [searchQuery]);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ListTodo className="w-8 h-8 text-primary" />
            Tasks
          </h1>
          <p className="text-zinc-400 mt-1">Real-time tasks extracted from your PRD analysis.</p>
        </div>
        <div className="flex gap-3">
          {/* WIRED UP FILTER BUTTON */}
          <Button
            variant="outline"
            className="bg-zinc-950 border-zinc-700 text-white hover:bg-zinc-800 gap-2"
            onClick={() => toast({ title: "Filters", description: "Opening advanced backlog filters..." })}
          >
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button onClick={() => navigate('/dashboard/sprints')} className="bg-primary hover:brightness-110 text-white gap-2 glow-orange">
            Generate Sprint Plan <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filter Panel */}
      {isFilterOpen && (
        <Card className="bg-zinc-900 border-zinc-800 mb-8 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search tasks, stories, or priorities..."
                className="pl-10 bg-zinc-950 border-zinc-800 text-white focus:ring-primary h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-zinc-500 hover:text-white"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Priority Recommendations:</span>
              {['Critical', 'High', 'Medium', 'Low'].map((p) => (
                <Button
                  key={p}
                  variant="outline"
                  size="sm"
                  className={`
                    text-xs h-7 px-3 rounded-full border-zinc-800 transition-all
                    ${searchQuery.toLowerCase() === p.toLowerCase()
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800'}
                  `}
                  onClick={() => setSearchQuery(p)}
                >
                  {p}
                </Button>
              ))}
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-3 text-zinc-500 hover:text-red-400"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
            <Card key={story.id} className="bg-zinc-900 border-zinc-800 overflow-hidden shadow-lg border-l-4 border-l-primary/30">
              {/* Story Header */}
              <CardHeader className="border-b border-zinc-800 bg-zinc-950/80 py-4 flex flex-row items-start justify-between">
                <div className="flex gap-3 items-start">
                  <div className="mt-1 bg-blue-500/10 p-1.5 rounded-md border border-blue-500/20 text-blue-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white text-base">{story.title}</CardTitle>
                      <span className="text-xs font-mono text-zinc-500">{story.id}</span>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">{story.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-medium">Story Points:</span>
                  <span className="text-sm font-bold text-primary">{story.totalPoints}</span>
                </div>
              </CardHeader>

              {/* Tasks inside the Story */}
              <CardContent className="p-0">
                <div className="divide-y divide-zinc-800/50">
                  {story.tasks.map((task) => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group cursor-pointer pl-12">
                      <div className="flex items-center gap-3">
                        <CircleDashed className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-colors" />
                        <div>
                          <h4 className="text-sm font-medium text-zinc-200">{task.title}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5 font-mono">{task.id}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className="text-[10px] uppercase bg-zinc-950 border-zinc-700 text-zinc-400">
                          {task.type}
                        </Badge>
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <span className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                          <span className="text-xs text-zinc-400">{task.priority}</span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary" title="Story Points">
                          {task.points}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </DashboardLayout>
  );
}