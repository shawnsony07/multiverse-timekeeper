import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type SavedClock = Tables<'saved_clocks'>;

export function useUserClocks() {
  const { user, session } = useAuth();
  const [clocks, setClocks] = useState<SavedClock[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClocks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_clocks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setClocks(data || []);
    } catch (error: any) {
      console.error('Error fetching clocks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your saved clocks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveClock = async (planet: string, timeFormat: string = '24h', name?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save clocks",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('saved_clocks')
        .insert({
          user_id: user.id,
          planet,
          time_format: timeFormat,
          name: name || `${planet} Clock`
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Clock saved",
        description: `Your ${name || planet} clock has been saved`,
      });

      await fetchClocks(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error saving clock:', error);
      toast({
        title: "Error",
        description: "Failed to save clock",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteClock = async (clockId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_clocks')
        .delete()
        .eq('id', clockId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Clock deleted",
        description: "Clock has been removed from your collection",
      });

      await fetchClocks(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error('Error deleting clock:', error);
      toast({
        title: "Error",
        description: "Failed to delete clock",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchClocks();
    } else {
      setClocks([]);
    }
  }, [user]);

  return {
    clocks,
    loading,
    saveClock,
    deleteClock,
    refetch: fetchClocks
  };
}