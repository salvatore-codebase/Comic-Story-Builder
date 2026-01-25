import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Untitled Story"),
  script: text("script").notNull(), // The original text input
  createdAt: timestamp("created_at").defaultNow(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(), // "A tall man with a red hat"
  // referenceImage: text("reference_image"), // Optional URL for image-to-image
});

export const panels = pgTable("panels", {
  id: serial("id").primaryKey(),
  storyId: integer("story_id").notNull(),
  panelOrder: integer("panel_order").notNull(),
  description: text("description").notNull(), // "Hero stands on a cliff"
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // pending, generating, completed, failed
});

export const speechBubbles = pgTable("speech_bubbles", {
  id: serial("id").primaryKey(),
  panelId: integer("panel_id").notNull(),
  text: text("text").notNull(),
  type: text("type").notNull().default("speech"), // speech, thought, caption
  x: integer("x").notNull().default(10),
  y: integer("y").notNull().default(10),
  width: integer("width"),
  height: integer("height"),
});

// === RELATIONS ===

export const storiesRelations = relations(stories, ({ many }) => ({
  panels: many(panels),
  characters: many(characters),
}));

export const panelsRelations = relations(panels, ({ one, many }) => ({
  story: one(stories, {
    fields: [panels.storyId],
    references: [stories.id],
  }),
  speechBubbles: many(speechBubbles),
}));

export const speechBubblesRelations = relations(speechBubbles, ({ one }) => ({
  panel: one(panels, {
    fields: [speechBubbles.panelId],
    references: [panels.id],
  }),
}));

export const charactersRelations = relations(characters, ({ one }) => ({
  story: one(stories, {
    fields: [characters.storyId],
    references: [stories.id],
  }),
}));

// === ZOD SCHEMAS ===

export const insertStorySchema = createInsertSchema(stories).omit({ id: true, createdAt: true });
export const insertPanelSchema = createInsertSchema(panels).omit({ id: true, status: true });
export const insertCharacterSchema = createInsertSchema(characters).omit({ id: true });
export const insertSpeechBubbleSchema = createInsertSchema(speechBubbles).omit({ id: true });

// === TYPES ===

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Panel = typeof panels.$inferSelect;
export type InsertPanel = z.infer<typeof insertPanelSchema>;

export type Character = typeof characters.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;

export type SpeechBubble = typeof speechBubbles.$inferSelect;
export type InsertSpeechBubble = z.infer<typeof insertSpeechBubbleSchema>;
