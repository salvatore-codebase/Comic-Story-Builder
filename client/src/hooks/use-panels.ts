import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePanels(storyId: number) {
  return useQuery({
    queryKey: [api.panels.list.path, storyId],
    queryFn: async () => {
      const url = buildUrl(api.panels.list.path, { id: storyId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch panels");
      return api.panels.list.responses[200].parse(await res.json());
    },
    enabled: !!storyId,
    // Poll every 3 seconds if we detect any panel is not completed/failed
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some(
        (p) => p.status === 'pending' || p.status === 'generating'
      );
      return hasPending ? 3000 : false;
    },
  });
}

export function useGeneratePanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id }: { id: number; storyId: number }) => {
      const url = buildUrl(api.panels.generate.path, { id });
      const res = await fetch(url, { method: api.panels.generate.method });
      if (!res.ok) throw new Error("Failed to start generation");
      return api.panels.generate.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      // Invalidate the list so we see the status change
      queryClient.invalidateQueries({ 
        queryKey: [api.panels.list.path, variables.storyId] 
      });
      toast({
        title: "Drawing in progress!",
        description: "Our AI artists are sketching panel " + data.panelOrder,
      });
    },
    onError: (error) => {
      toast({
        title: "Ink Spilled!",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
