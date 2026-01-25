import React, { useRef, useState } from "react";
import type { Panel, SpeechBubble } from "@shared/schema";
import { DraggableBubble } from "./DraggableBubble";
import { ComicButton } from "./ComicButton";
import { Loader2, RefreshCw, Plus, Image as ImageIcon } from "lucide-react";
import { useCreateBubble, useUpdateBubble, useDeleteBubble } from "@/hooks/use-bubbles";
import { useGeneratePanel } from "@/hooks/use-panels";
import { cn } from "@/lib/utils";

interface PanelDisplayProps {
  panel: Panel & { speechBubbles: SpeechBubble[] };
  storyId: number;
}

export function PanelDisplay({ panel, storyId }: PanelDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBubbleId, setSelectedBubbleId] = useState<number | null>(null);

  const createBubble = useCreateBubble();
  const updateBubble = useUpdateBubble();
  const deleteBubble = useDeleteBubble();
  const generatePanel = useGeneratePanel();

  const handleAddBubble = (type: string) => {
    createBubble.mutate({
      storyId,
      panelId: panel.id,
      text: "New dialogue...",
      type,
      x: 50, // Default center-ish
      y: 50,
      width: 200,
      height: 100
    });
  };

  const isGenerating = panel.status === "generating" || generatePanel.isPending;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-white border-2 border-black rounded-lg shadow-sm">
        <div className="flex gap-2">
          <span className="font-comic text-lg self-center px-2 mr-2 border-r-2 border-gray-200">
            Panel {panel.panelOrder}
          </span>
          <ComicButton 
            variant="outline" 
            className="py-1 px-3 text-sm h-9"
            onClick={() => handleAddBubble('speech')}
            disabled={!panel.imageUrl}
          >
            <Plus className="w-4 h-4 mr-1" /> Speech
          </ComicButton>
          <ComicButton 
            variant="outline" 
            className="py-1 px-3 text-sm h-9"
            onClick={() => handleAddBubble('thought')}
            disabled={!panel.imageUrl}
          >
            <Plus className="w-4 h-4 mr-1" /> Thought
          </ComicButton>
          <ComicButton 
            variant="outline" 
            className="py-1 px-3 text-sm h-9"
            onClick={() => handleAddBubble('caption')}
            disabled={!panel.imageUrl}
          >
            <Plus className="w-4 h-4 mr-1" /> Caption
          </ComicButton>
        </div>

        <ComicButton
          variant="secondary"
          className="py-1 px-3 text-sm h-9"
          onClick={() => generatePanel.mutate({ id: panel.id, storyId })}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <><RefreshCw className="w-4 h-4 mr-2" /> Redraw</>
          )}
        </ComicButton>
      </div>

      {/* Canvas Area */}
      <div 
        ref={containerRef}
        className={cn(
          "relative flex-1 bg-gray-100 border-4 border-black rounded-lg overflow-hidden shadow-inner flex items-center justify-center",
          "min-h-[400px]"
        )}
        onClick={() => setSelectedBubbleId(null)}
      >
        {/* Background Image / Status */}
        {panel.imageUrl ? (
          <img 
            src={panel.imageUrl} 
            alt={panel.description}
            className="absolute inset-0 w-full h-full object-contain bg-white" 
          />
        ) : (
          <div className="text-center p-8 max-w-md">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-4 text-primary animate-pulse">
                <Loader2 className="w-16 h-16 animate-spin" />
                <h3 className="text-2xl font-comic">Art in progress...</h3>
                <p className="font-hand text-muted-foreground">The AI artist is sketching your scene.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <ImageIcon className="w-16 h-16 opacity-20" />
                <h3 className="text-xl font-comic text-gray-400">Empty Canvas</h3>
                <p className="font-hand">Click "Redraw" to generate this panel.</p>
              </div>
            )}
          </div>
        )}

        {/* Bubbles Overlay */}
        {panel.speechBubbles.map((bubble) => (
          <DraggableBubble
            key={bubble.id}
            bubble={bubble}
            containerRef={containerRef}
            onUpdate={(id, updates) => updateBubble.mutate({ id, storyId, ...updates })}
            onDelete={(id) => deleteBubble.mutate({ id, storyId })}
            isSelected={selectedBubbleId === bubble.id}
            onSelect={() => setSelectedBubbleId(bubble.id)}
          />
        ))}
      </div>
      
      {/* Panel Prompt/Description */}
      <div className="bg-yellow-50 p-4 border-2 border-black rounded-lg font-hand text-sm">
        <strong className="font-comic text-primary block mb-1">Scene Description:</strong>
        {panel.description}
      </div>
    </div>
  );
}
