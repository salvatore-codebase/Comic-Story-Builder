import React, { useState } from "react";
import { useCreateStory } from "@/hooks/use-stories";
import { ComicButton } from "@/components/ComicButton";
import { ComicInput, ComicTextarea } from "@/components/ComicInput";
import { BookOpen, Sparkles, User, Plus, Trash2, Layout, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import comicPattern from "@/assets/images/comic-pattern.png";
import previewMarvel from "@/assets/images/preview-marvel.png";
import previewManga from "@/assets/images/preview-manga.png";
import previewNoir from "@/assets/images/preview-noir.png";

const ART_STYLES = [
  { id: "Classic Marvel", name: "Classic Marvel", preview: previewMarvel, description: "Vibrant colors & bold lines" },
  { id: "Manga", name: "Manga", preview: previewManga, description: "Ink & screentone aesthetic" },
  { id: "Noir Sketch", name: "Noir Sketch", preview: previewNoir, description: "Gritty, moody charcoal" },
];

const LAYOUT_TEMPLATES = [
  { id: "3-panel", name: "3-Panel Strip", description: "Perfect for quick stories" },
  { id: "6-panel", name: "6-Panel Grid", description: "Classic comic book page" },
];

export default function Home() {
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Classic Marvel");
  const [selectedLayout, setSelectedLayout] = useState("3-panel");
  const [characters, setCharacters] = useState<{ name: string; description: string }[]>([
    { name: "", description: "" }
  ]);

  const createStory = useCreateStory();

  const handleAddCharacter = () => {
    setCharacters([...characters, { name: "", description: "" }]);
  };

  const handleRemoveCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const handleCharacterChange = (index: number, field: "name" | "description", value: string) => {
    const newChars = [...characters];
    newChars[index][field] = value;
    setCharacters(newChars);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!script.trim()) return;

    const validCharacters = characters.filter(c => c.name.trim() && c.description.trim());

    createStory.mutate({
      title: title || "My Awesome Comic",
      script,
      style: selectedStyle,
      layoutTemplate: selectedLayout,
      characters: validCharacters.length > 0 ? validCharacters : undefined,
    });
  };

  const currentStylePreview = ART_STYLES.find(s => s.id === selectedStyle)?.preview;

  return (
    <div 
      className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${comicPattern})`,
        backgroundSize: '400px',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-7xl md:text-9xl text-primary font-comic drop-shadow-[6px_6px_0_rgba(0,0,0,1)] [-webkit-text-stroke:3px_black] inline-block rotate-[-2deg]"
          >
            Comic Gen
          </motion.h1>
          <p className="text-3xl font-hand text-secondary font-bold drop-shadow-sm rotate-[1deg]">
            Visual Masterpieces from Your Words!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Script & Settings */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-xl border-4 border-black comic-shadow">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-secondary" />
                <h2 className="text-3xl font-comic">The Script</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-comic text-xl mb-2">Comic Title</label>
                  <ComicInput 
                    placeholder="Enter an epic title..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg"
                  />
                </div>
                
                <div>
                  <label className="block font-comic text-xl mb-2">Tell Your Story</label>
                  <ComicTextarea 
                    placeholder="Describe your comic's plot here. Use clear sentences for better panel generation!" 
                    className="min-h-[250px] text-lg leading-relaxed"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-5 h-5 text-accent" />
                      <label className="font-comic text-lg">Art Style</label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {ART_STYLES.map(style => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-1 rounded-lg border-2 transition-all ${
                            selectedStyle === style.id 
                            ? 'border-primary bg-primary/10 comic-shadow-sm scale-105' 
                            : 'border-black/20 grayscale hover:grayscale-0'
                          }`}
                        >
                          <img src={style.preview} alt={style.name} className="w-full aspect-square object-cover rounded" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Layout className="w-5 h-5 text-secondary" />
                      <label className="font-comic text-lg">Panel Layout</label>
                    </div>
                    <div className="space-y-2">
                      {LAYOUT_TEMPLATES.map(layout => (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => setSelectedLayout(layout.id)}
                          className={`w-full p-2 text-left rounded-lg border-2 font-hand transition-all ${
                            selectedLayout === layout.id
                            ? 'border-secondary bg-secondary/10 comic-shadow-sm'
                            : 'border-black/20 hover:border-black'
                          }`}
                        >
                          <div className="font-bold">{layout.name}</div>
                          <div className="text-xs text-muted-foreground">{layout.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Characters */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl border-4 border-black comic-shadow flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-accent" />
                  <h2 className="text-3xl font-comic">The Cast</h2>
                </div>
                <ComicButton 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddCharacter}
                  className="px-4 py-2"
                >
                  <Plus className="w-5 h-5 mr-1" /> Add Hero
                </ComicButton>
              </div>

              <div className="space-y-6 overflow-y-auto pr-2 mb-6 flex-grow max-h-[500px]">
                <AnimatePresence mode="popLayout">
                  {characters.map((char, idx) => (
                    <motion.div 
                      key={idx}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-4 bg-gray-50 border-4 border-black rounded-xl relative group"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveCharacter(idx)}
                        className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-20 comic-shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="flex gap-4">
                        <div className="w-20 h-20 border-2 border-black rounded-lg overflow-hidden flex-shrink-0 bg-white relative">
                          {char.description.trim() ? (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0"
                            >
                              <img src={currentStylePreview} alt="Style" className="w-full h-full object-cover opacity-30" />
                              <div className="absolute inset-0 flex items-center justify-center text-[10px] text-center p-1 font-hand leading-tight">
                                {char.name || "Previewing..."}
                              </div>
                            </motion.div>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <User className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow space-y-2">
                          <ComicInput 
                            placeholder="Character Name" 
                            value={char.name}
                            onChange={(e) => handleCharacterChange(idx, "name", e.target.value)}
                            className="h-10 text-lg border-2"
                          />
                          <ComicTextarea 
                            placeholder="Appearance details..." 
                            value={char.description}
                            onChange={(e) => handleCharacterChange(idx, "description", e.target.value)}
                            className="min-h-[80px] text-sm border-2 font-hand"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {characters.length === 0 && (
                  <div className="text-center py-12 px-6 text-muted-foreground font-hand border-4 border-dashed border-black/20 rounded-2xl">
                    <p className="text-lg">No characters yet!</p>
                    <p className="text-sm">Add your heroes to keep their look consistent across all panels.</p>
                  </div>
                )}
              </div>

              <ComicButton 
                type="submit" 
                className="w-full text-3xl py-8 comic-shadow-active"
                disabled={createStory.isPending || !script.trim()}
                isLoading={createStory.isPending}
              >
                <Sparkles className="w-8 h-8 mr-3" />
                CREATE COMIC!
              </ComicButton>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
