import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface SavedClock {
  id: string;
  user_id: string;
  planet: string;
  time_format: string;
  name: string;
  created_at: string;
}

export function useUserClocks() {
  const { session } = useAuth();
  const [clocks, setClocks] = useState<SavedClock[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClocks = async () => {
    if (!session) return;

    try {
      setLoading(true);
      const response = await supabase.functions.invoke('user-clocks', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) {
        throw response.error;
      }

      setClocks(response.data.clocks || []);
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
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save clocks",
        variant: "destructive",
      });
      return false;
    }

    try {
      const response = await supabase.functions.invoke('user-clocks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          planet,
          time_format: timeFormat,
          name: name || `${planet} Clock`
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Clock saved",
        description: `Your ${planet} clock has been saved`,
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
    if (!session) return false;

    try {
      const response = await supabase.functions.invoke('user-clocks', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { id: clockId }
      });

      if (response.error) {
        throw response.error;
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
    if (session) {
      fetchClocks();
    } else {
      setClocks([]);
    }
  }, [session]);

  return {
    clocks,
    loading,
    saveClock,
    deleteClock,
    refetch: fetchClocks
  };
}