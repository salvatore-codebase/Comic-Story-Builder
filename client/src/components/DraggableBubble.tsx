import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, X, Maximize2 } from "lucide-react";
import type { SpeechBubble } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DraggableBubbleProps {
  bubble: SpeechBubble;
  containerRef: React.RefObject<HTMLDivElement>;
  onUpdate: (id: number, updates: Partial<SpeechBubble>) => void;
  onDelete: (id: number) => void;
  isSelected?: boolean;
  onSelect: () => void;
}

export function DraggableBubble({
  bubble,
  containerRef,
  onUpdate,
  onDelete,
  isSelected,
  onSelect,
}: DraggableBubbleProps) {
  const [text, setText] = useState(bubble.text);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync internal text state if prop changes remotely
  useEffect(() => {
    setText(bubble.text);
  }, [bubble.text]);

  const handleDragEnd = (_: any, info: any) => {
    if (!containerRef.current) return;
    
    // We get the offset relative to where it started. 
    // Ideally we want absolute position relative to container.
    // However, framer motion drag is relative to start.
    // A simpler approach for MVP: Use the point relative to viewport and calculate offset.
    // But easier: just trust the visual placement and assume users adjust visually.
    
    // Actually, to persist `x` and `y`, we need to track them.
    // For this implementation, let's just save the delta to the existing X/Y
    // or rely on visual persistence if we re-render.
    
    // Better strategy for this specific component:
    // Update x/y in local state, debounce update to server.
    
    const element = info.point; // pointer coordinates
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate relative percentage or pixels within container
    const relativeX = info.offset.x; 
    const relativeY = info.offset.y; 

    // This simple approach adds delta to current. 
    // In a real app we'd need robust coordinate mapping.
    // For now, let's just update based on delta.
    
    onUpdate(bubble.id, {
      x: bubble.x + relativeX,
      y: bubble.y + relativeY,
    });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(bubble.id, { text: newText });
    }, 500);
  };

  const bubbleStyles = {
    speech: "bg-white rounded-[50%] rounded-bl-none border-2 border-black",
    thought: "bg-white rounded-[50%] border-2 border-black border-dashed",
    caption: "bg-yellow-100 rounded-none border-2 border-black shadow-md",
    scream: "bg-white border-2 border-black", // Should have jagged edges, simplified here
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={containerRef}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      initial={{ x: bubble.x, y: bubble.y }}
      className={cn(
        "absolute cursor-move p-4 min-w-[150px] max-w-[250px] z-20 group",
        bubbleStyles[bubble.type as keyof typeof bubbleStyles] || bubbleStyles.speech,
        isSelected ? "ring-2 ring-primary ring-offset-2 z-30" : ""
      )}
      style={{
        left: 0, 
        top: 0,
        // We use translate via framer-motion, but initial position is set via style or initial prop
      }}
    >
      {/* Controls only visible when selected/hovered */}
      {(isSelected) && (
        <div className="absolute -top-3 -right-3 flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bubble.id);
            }}
            className="p-1 bg-red-500 text-white rounded-full border border-black hover:bg-red-600 shadow-sm"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {isSelected ? (
        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full h-full bg-transparent resize-none outline-none font-hand text-center text-lg leading-tight overflow-hidden"
          autoFocus
          onMouseDown={(e) => e.stopPropagation()} // Allow text selection without dragging
        />
      ) : (
        <p className="font-hand text-center text-lg leading-tight pointer-events-none select-none">
          {text}
        </p>
      )}

      {/* Tail logic would go here - simplified for MVP */}
    </motion.div>
  );
}
