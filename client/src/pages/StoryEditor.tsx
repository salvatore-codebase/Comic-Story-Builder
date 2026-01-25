import React, { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useStory } from "@/hooks/use-stories";
import { usePanels } from "@/hooks/use-panels";
import { PanelDisplay } from "@/components/PanelDisplay";
import { Loader2, LayoutGrid, ChevronLeft, ArrowRight, Save, Info } from "lucide-react";
import { Link } from "wouter";
import { ComicButton } from "@/components/ComicButton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function StoryEditor() {
  const [, params] = useRoute("/story/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: story, isLoading: storyLoading } = useStory(id);
  const { data: panels, isLoading: panelsLoading } = usePanels(id);
  
  const [activePanelIndex, setActivePanelIndex] = useState(0);

  // Auto-select first panel on load
  useEffect(() => {
    if (panels && panels.length > 0) {
      // Keep current index if valid, else 0
      setActivePanelIndex(prev => Math.min(prev, panels.length - 1));
    }
  }, [panels]);

  if (storyLoading || panelsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <h2 className="text-2xl font-comic animate-pulse">Loading Story...</h2>
      </div>
    );
  }

  if (!story || !panels) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-4xl font-comic text-destructive">404 - Story Not Found</h2>
        <Link href="/" className="underline font-hand text-xl">Go back home</Link>
      </div>
    );
  }

  const activePanel = panels[activePanelIndex];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b-2 border-black bg-white flex items-center px-4 justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:bg-gray-100 p-2 rounded-md transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-comic text-2xl leading-none">{story.title}</h1>
            <span className="text-xs font-hand text-muted-foreground">{panels.length} panels</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <ComicButton variant="outline" className="h-10 px-3 text-sm">
                <Info className="w-4 h-4 mr-2" /> Characters
              </ComicButton>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="w-64 p-4 border-2 border-black bg-white">
              <h4 className="font-comic text-lg mb-2">Cast</h4>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {story.characters?.map((c: any) => (
                  <li key={c.id} className="text-sm border-b pb-1 last:border-0">
                    <strong className="block font-bold">{c.name}</strong>
                    <span className="text-muted-foreground">{c.description}</span>
                  </li>
                ))}
                {(!story.characters || story.characters.length === 0) && (
                  <li className="text-sm text-muted-foreground italic">No characters defined</li>
                )}
              </ul>
            </TooltipContent>
          </Tooltip>

          <ComicButton className="h-10 px-4 text-sm">
            <Save className="w-4 h-4 mr-2" /> Export
          </ComicButton>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Filmstrip */}
        <div className="w-24 md:w-32 bg-gray-50 border-r-2 border-black flex flex-col overflow-y-auto p-2 gap-2 shrink-0">
          {panels.map((panel, idx) => (
            <button
              key={panel.id}
              onClick={() => setActivePanelIndex(idx)}
              className={`
                relative aspect-square w-full border-2 rounded-md overflow-hidden transition-all
                ${idx === activePanelIndex 
                  ? "border-primary ring-2 ring-primary ring-offset-2 scale-105 z-10 shadow-lg" 
                  : "border-gray-300 hover:border-gray-400 opacity-70 hover:opacity-100"}
              `}
            >
              {panel.imageUrl ? (
                <img src={panel.imageUrl} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                  <span className="font-comic text-2xl">{idx + 1}</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 bg-black/50 text-white text-[10px] px-1 w-full text-center font-bold">
                #{idx + 1}
              </div>
            </button>
          ))}
        </div>

        {/* Center Stage: Canvas */}
        <main className="flex-1 bg-slate-100 p-4 md:p-8 overflow-y-auto flex items-start justify-center">
          <div className="w-full max-w-4xl bg-white p-4 rounded-xl border-2 border-black shadow-2xl min-h-[600px]">
            {activePanel ? (
              <PanelDisplay panel={activePanel} storyId={id} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a panel to edit
              </div>
            )}
            
            {/* Navigation Buttons (Bottom of Panel) */}
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setActivePanelIndex(Math.max(0, activePanelIndex - 1))}
                disabled={activePanelIndex === 0}
                className="flex items-center font-comic text-lg disabled:opacity-30 hover:text-primary transition-colors"
              >
                <ChevronLeft className="mr-1" /> Prev
              </button>
              
              <div className="text-sm font-hand text-muted-foreground self-center">
                Panel {activePanelIndex + 1} of {panels.length}
              </div>

              <button 
                onClick={() => setActivePanelIndex(Math.min(panels.length - 1, activePanelIndex + 1))}
                disabled={activePanelIndex === panels.length - 1}
                className="flex items-center font-comic text-lg disabled:opacity-30 hover:text-primary transition-colors"
              >
                Next <ArrowRight className="ml-1" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
