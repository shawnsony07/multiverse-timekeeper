import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface CosmicEvent {
  id: string;
  name: string;
  event_type: string;
  date: string;
  description: string;
  source: string;
  external_id: string;
  created_at: string;
  updated_at: string;
}

interface EventsResponse {
  events: CosmicEvent[];
  stats: {
    total: number;
    byType: Record<string, number>;
    bySource: Record<string, number>;
  };
}

export function useCosmicEvents() {
  const [events, setEvents] = useState<CosmicEvent[]>([]);
  const [stats, setStats] = useState<EventsResponse['stats']>({
    total: 0,
    byType: {},
    bySource: {}
  });
  const [loading, setLoading] = useState(false);

  const fetchEvents = async (options?: {
    limit?: number;
    eventType?: string;
    source?: string;
    showPast?: boolean;
  }) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.eventType) params.append('type', options.eventType);
      if (options?.source) params.append('source', options.source);
      if (options?.showPast) params.append('show_past', 'true');

      const response = await supabase.functions.invoke('get-events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.error) {
        throw response.error;
      }

      const data: EventsResponse = response.data;
      setEvents(data.events || []);
      setStats(data.stats || { total: 0, byType: {}, bySource: {} });
    } catch (error: any) {
      console.error('Error fetching cosmic events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cosmic events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const syncEvents = async () => {
    try {
      setLoading(true);
      
      const response = await supabase.functions.invoke('sync-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          manual: true,
          timestamp: new Date().toISOString()
        }
      });

      if (response.error) {
        throw response.error;
      }

      toast({
        title: "Events synced",
        description: "Cosmic events have been updated from external APIs",
      });

      // Refresh the events after sync
      await fetchEvents();
    } catch (error: any) {
      console.error('Error syncing events:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync cosmic events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    stats,
    loading,
    fetchEvents,
    syncEvents,
    refetch: fetchEvents
  };
}