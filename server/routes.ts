import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { analyzeStory, ai } from "./gemini";
import { generateImage } from "./replit_integrations/image/client";
import { Modality } from "@google/genai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Stories
  app.post(api.stories.create.path, async (req, res) => {
    try {
      const input = api.stories.create.input.parse(req.body);
      const { characters: chars, ...storyData } = input;
      
      const story = await storage.createStory(storyData);

      // Create characters if provided
      if (chars) {
        for (const char of chars) {
          await storage.createCharacter({ ...char, storyId: story.id });
        }
      }

      // Async: Break down story and generate panels
      // We don't await this so the UI returns immediately
      (async () => {
        try {
          const panelsData = await analyzeStory(story.script);
          const characters = await storage.getCharactersByStoryId(story.id);
          const charDescription = characters.map(c => `${c.name}: ${c.description}`).join(". ");

          for (let i = 0; i < panelsData.length; i++) {
            const panelDesc = panelsData[i].description;
            
            // Create panel record
            const panel = await storage.createPanel({
              storyId: story.id,
              panelOrder: i + 1,
              description: panelDesc,
              status: 'generating'
            });

            // Generate Image
            try {
              const stylePrompt = story.style === "Classic Marvel" ? "vibrant comic book art style, classic marvel aesthetic, dynamic lighting" :
                                 story.style === "Manga" ? "japanese manga style, black and white screentone, sharp lines" :
                                 "noir sketch style, high contrast, gritty pencil drawings, moody shadows";
              
              const prompt = `${stylePrompt}. ${panelDesc}. Characters: ${charDescription}. detailed, clean lines.`;
              // Use the integration's generateImage function (uses gemini-2.5-flash-image)
              const base64Image = await generateImage(prompt);
              
              // In a real app we'd upload this to S3/Blob storage. 
              // For this demo, since we use MemStorage or local DB, and the integration returns base64,
              // we might run into size limits if we store full base64 in DB text column (Postgres TEXT is fine ~1GB).
              // Let's store it.
              await storage.updatePanelImage(panel.id, base64Image);
            } catch (err) {
              console.error(`Failed to generate image for panel ${panel.id}`, err);
              await storage.updatePanelStatus(panel.id, 'failed');
            }
          }
        } catch (err) {
          console.error("Background processing failed", err);
        }
      })();

      res.status(201).json(story);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.get(api.stories.list.path, async (req, res) => {
    const stories = await storage.getAllStories();
    res.json(stories);
  });

  app.get(api.stories.get.path, async (req, res) => {
    const storyId = Number(req.params.id);
    const story = await storage.getStory(storyId);
    if (!story) return res.status(404).json({ message: "Story not found" });

    const panels = await storage.getPanelsByStoryId(storyId);
    const characters = await storage.getCharactersByStoryId(storyId);
    
    // Attach bubbles to panels? 
    // The route schema expects { story, panels, characters }
    // We can fetch panels and return them.
    
    res.json({ ...story, panels, characters });
  });

  // Panels
  app.get(api.panels.list.path, async (req, res) => {
    const storyId = Number(req.params.id);
    const panels = await storage.getPanelsByStoryId(storyId);
    
    const panelsWithBubbles = await Promise.all(panels.map(async (p) => {
      const bubbles = await storage.getSpeechBubblesByPanelId(p.id);
      return { ...p, speechBubbles: bubbles };
    }));

    res.json(panelsWithBubbles);
  });

  app.post(api.panels.generate.path, async (req, res) => {
    const panelId = Number(req.params.id);
    const panel = await storage.getPanel(panelId);
    if (!panel) return res.status(404).json({ message: "Panel not found" });

    const story = await storage.getStory(panel.storyId);
    const characters = await storage.getCharactersByStoryId(panel.storyId);
    const charDescription = characters.map(c => `${c.name}: ${c.description}`).join(". ");

    try {
      await storage.updatePanelStatus(panelId, 'generating');
      
      const stylePrompt = story.style === "Classic Marvel" ? "vibrant comic book art style, classic marvel aesthetic, dynamic lighting" :
                         story.style === "Manga" ? "japanese manga style, black and white screentone, sharp lines" :
                         "noir sketch style, high contrast, gritty pencil drawings, moody shadows";

      const prompt = `${stylePrompt}. ${panel.description}. Characters: ${charDescription}. detailed, clean lines.`;
      const base64Image = await generateImage(prompt);
      const updated = await storage.updatePanelImage(panelId, base64Image);
      res.json(updated);
    } catch (err) {
      await storage.updatePanelStatus(panelId, 'failed');
      res.status(500).json({ message: "Failed to generate image" });
    }
  });

  // Speech Bubbles
  app.post(api.bubbles.create.path, async (req, res) => {
    const panelId = Number(req.params.panelId);
    const input = api.bubbles.create.input.parse(req.body);
    const bubble = await storage.createSpeechBubble({ ...input, panelId });
    res.status(201).json(bubble);
  });

  app.put(api.bubbles.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const input = api.bubbles.update.input.parse(req.body);
    const bubble = await storage.updateSpeechBubble(id, input);
    res.json(bubble);
  });

  app.delete(api.bubbles.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteSpeechBubble(id);
    res.status(204).send();
  });

  return httpServer;
}
