import { db } from "./db";
import {
  stories, panels, characters, speechBubbles,
  type Story, type InsertStory,
  type Panel, type InsertPanel,
  type Character, type InsertCharacter,
  type SpeechBubble, type InsertSpeechBubble
} from "@shared/schema";
import { eq, asc } from "drizzle-orm";

export interface IStorage {
  // Stories
  createStory(story: InsertStory): Promise<Story>;
  getStory(id: number): Promise<Story | undefined>;
  getAllStories(): Promise<Story[]>;

  // Panels
  createPanel(panel: InsertPanel): Promise<Panel>;
  getPanel(id: number): Promise<Panel | undefined>;
  getPanelsByStoryId(storyId: number): Promise<Panel[]>;
  updatePanelImage(id: number, imageUrl: string): Promise<Panel>;
  updatePanelStatus(id: number, status: string): Promise<Panel>;

  // Characters
  createCharacter(character: InsertCharacter): Promise<Character>;
  getCharactersByStoryId(storyId: number): Promise<Character[]>;

  // Speech Bubbles
  createSpeechBubble(bubble: InsertSpeechBubble): Promise<SpeechBubble>;
  updateSpeechBubble(id: number, updates: Partial<InsertSpeechBubble>): Promise<SpeechBubble>;
  deleteSpeechBubble(id: number): Promise<void>;
  getSpeechBubblesByPanelId(panelId: number): Promise<SpeechBubble[]>;
}

export class DatabaseStorage implements IStorage {
  // Stories
  async createStory(story: InsertStory): Promise<Story> {
    const [newStory] = await db.insert(stories).values(story).returning();
    return newStory;
  }

  async getStory(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }

  async getAllStories(): Promise<Story[]> {
    return await db.select().from(stories).orderBy(stories.createdAt);
  }

  // Panels
  async createPanel(panel: InsertPanel): Promise<Panel> {
    const [newPanel] = await db.insert(panels).values(panel).returning();
    return newPanel;
  }

  async getPanel(id: number): Promise<Panel | undefined> {
    const [panel] = await db.select().from(panels).where(eq(panels.id, id));
    return panel;
  }

  async getPanelsByStoryId(storyId: number): Promise<Panel[]> {
    return await db.select().from(panels).where(eq(panels.storyId, storyId)).orderBy(asc(panels.panelOrder));
  }

  async updatePanelImage(id: number, imageUrl: string): Promise<Panel> {
    const [updated] = await db.update(panels)
      .set({ imageUrl, status: 'completed' })
      .where(eq(panels.id, id))
      .returning();
    return updated;
  }

  async updatePanelStatus(id: number, status: string): Promise<Panel> {
    const [updated] = await db.update(panels)
      .set({ status })
      .where(eq(panels.id, id))
      .returning();
    return updated;
  }

  // Characters
  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [newCharacter] = await db.insert(characters).values(character).returning();
    return newCharacter;
  }

  async getCharactersByStoryId(storyId: number): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.storyId, storyId));
  }

  // Speech Bubbles
  async createSpeechBubble(bubble: InsertSpeechBubble): Promise<SpeechBubble> {
    const [newBubble] = await db.insert(speechBubbles).values(bubble).returning();
    return newBubble;
  }

  async updateSpeechBubble(id: number, updates: Partial<InsertSpeechBubble>): Promise<SpeechBubble> {
    const [updated] = await db.update(speechBubbles)
      .set(updates)
      .where(eq(speechBubbles.id, id))
      .returning();
    return updated;
  }

  async deleteSpeechBubble(id: number): Promise<void> {
    await db.delete(speechBubbles).where(eq(speechBubbles.id, id));
  }

  async getSpeechBubblesByPanelId(panelId: number): Promise<SpeechBubble[]> {
    return await db.select().from(speechBubbles).where(eq(speechBubbles.panelId, panelId));
  }
}

export const storage = new DatabaseStorage();
