import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DiaryEntry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  entry_date: string;
  is_draft: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDiaryEntry {
  title: string;
  content: string;
  entry_date: string;
  is_draft?: boolean;
}

export interface UpdateDiaryEntry {
  id: string;
  title?: string;
  content?: string;
  entry_date?: string;
  is_draft?: boolean;
}

export const useDiaryEntries = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const entriesQuery = useQuery({
    queryKey: ['diary-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      return data as DiaryEntry[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (entry: CreateDiaryEntry) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          ...entry,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast({
        title: 'Entry saved',
        description: 'Your diary entry has been saved successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateDiaryEntry) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('diary_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data as DiaryEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast({
        title: 'Entry updated',
        description: 'Your diary entry has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
      toast({
        title: 'Entry deleted',
        description: 'Your diary entry has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    entries: entriesQuery.data || [],
    isLoading: entriesQuery.isLoading,
    error: entriesQuery.error,
    createEntry: createMutation.mutate,
    updateEntry: updateMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
