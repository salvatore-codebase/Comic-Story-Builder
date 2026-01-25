import React, { useState } from "react";
import { useCreateStory } from "@/hooks/use-stories";
import { ComicButton } from "@/components/ComicButton";
import { ComicInput, ComicTextarea } from "@/components/ComicInput";
import { BookOpen, Sparkles, User, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
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

    // Filter out empty characters
    const validCharacters = characters.filter(c => c.name.trim() && c.description.trim());

    createStory.mutate({
      title: title || "My Awesome Comic",
      script,
      characters: validCharacters.length > 0 ? validCharacters : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-6xl md:text-8xl text-primary font-comic drop-shadow-[4px_4px_0_rgba(0,0,0,1)] [-webkit-text-stroke:2px_black]">
            Comic Gen
          </h1>
          <p className="text-2xl font-hand text-muted-foreground rotate-[-2deg]">
            Turn your stories into visual masterpieces!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Story Script */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border-2 border-black comic-shadow">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-secondary" />
                <h2 className="text-2xl font-comic">The Story</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block font-comic text-lg mb-1">Title</label>
                  <ComicInput 
                    placeholder="The Adventures of..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block font-comic text-lg mb-1">Script / Plot</label>
                  <ComicTextarea 
                    placeholder="Once upon a time in a galaxy far away..." 
                    className="min-h-[300px]"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-2 font-hand">
                    Tip: Describe scenes clearly. Each sentence or paragraph can become a panel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Characters */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border-2 border-black comic-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-comic">Cast of Characters</h2>
                </div>
                <ComicButton 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddCharacter}
                  className="px-3 py-1 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add
                </ComicButton>
              </div>

              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {characters.map((char, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-gray-50 border-2 border-black rounded-lg relative group"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveCharacter(idx)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid gap-3">
                      <ComicInput 
                        placeholder="Character Name (e.g. Captain Zap)" 
                        value={char.name}
                        onChange={(e) => handleCharacterChange(idx, "name", e.target.value)}
                        className="h-10 text-base"
                      />
                      <ComicTextarea 
                        placeholder="Appearance (e.g. Tall, blue cape, glowing eyes)" 
                        value={char.description}
                        onChange={(e) => handleCharacterChange(idx, "description", e.target.value)}
                        className="min-h-[60px] text-base"
                      />
                    </div>
                  </motion.div>
                ))}
                
                {characters.length === 0 && (
                  <div className="text-center p-8 text-muted-foreground font-hand border-2 border-dashed border-gray-300 rounded-lg">
                    No characters defined yet. Add some to ensure consistency!
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <ComicButton 
                type="submit" 
                className="w-full md:w-auto text-2xl py-6 px-12"
                disabled={createStory.isPending || !script.trim()}
                isLoading={createStory.isPending}
              >
                <Sparkles className="w-6 h-6 mr-2" />
                Visualize Story
              </ComicButton>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
