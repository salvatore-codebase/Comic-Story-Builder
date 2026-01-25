import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertSpeechBubble } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCreateBubble() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ panelId, storyId, ...data }: InsertSpeechBubble & { panelId: number, storyId: number }) => {
      const url = buildUrl(api.bubbles.create.path, { panelId });
      const res = await fetch(url, {
        method: api.bubbles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add bubble");
      return api.bubbles.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.panels.list.path, variables.storyId] 
      });
    },
  });
}

export function useUpdateBubble() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storyId, ...updates }: { id: number, storyId: number } & Partial<InsertSpeechBubble>) => {
      const url = buildUrl(api.bubbles.update.path, { id });
      const res = await fetch(url, {
        method: api.bubbles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update bubble");
      return api.bubbles.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      // We invalidate panels list because bubbles are nested in the panel response
      queryClient.invalidateQueries({ 
        queryKey: [api.panels.list.path, variables.storyId] 
      });
    },
  });
}

export function useDeleteBubble() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, storyId }: { id: number, storyId: number }) => {
      const url = buildUrl(api.bubbles.delete.path, { id });
      const res = await fetch(url, { method: api.bubbles.delete.method });
      if (!res.ok) throw new Error("Failed to delete bubble");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.panels.list.path, variables.storyId] 
      });
    },
  });
}
