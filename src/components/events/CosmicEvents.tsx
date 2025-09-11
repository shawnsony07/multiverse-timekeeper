import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Calendar, Clock, Star, Sun, Moon, Zap } from 'lucide-react';
import { launchApi, type Launch, cosmicEventsApi, type CosmicEvent } from '@/services/api';

export function CosmicEvents() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [cosmicEvents, setCosmicEvents] = useState<CosmicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        setLoading(true);
        const upcomingLaunches = await launchApi.getUpcomingLaunches(6);
        setLaunches(upcomingLaunches);
      } catch (error) {
        console.error('Failed to fetch launches:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCosmicEvents = async () => {
      try {
        setEventsLoading(true);
        const events = await cosmicEventsApi.getCosmicEvents(8, 180); // 8 events, 180 days
        setCosmicEvents(events);
      } catch (error) {
        console.error('Failed to fetch cosmic events:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchLaunches();
    fetchCosmicEvents();
  }, []);

  const getTimeUntilLaunch = (launchTime: string) => {
    const now = new Date();
    const launch = new Date(launchTime);
    const diff = launch.getTime() - now.getTime();
    
    if (diff < 0) return 'Launched';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `T-${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `T-${hours}h ${minutes}m`;
    return `T-${minutes}m`;
  };

  const getTimeUntilEvent = (eventTime: string) => {
    const now = new Date();
    const event = new Date(eventTime);
    const diff = event.getTime() - now.getTime();
    
    if (diff < 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  };

  const getEventIcon = (type: CosmicEvent['type']) => {
    switch (type) {
      case 'eclipse': return Moon;
      case 'meteor_shower': return Star;
      case 'planetary_alignment': return Sun;
      case 'solar_activity': return Zap;
      case 'wildfire': return Zap;
      case 'volcano': return Sun;
      case 'storm': return Star;
      case 'earthquake': return Star;
      case 'flood': return Moon;
      case 'dust_haze': return Sun;
      case 'landslide': return Star;
      case 'drought': return Sun;
      case 'manmade': return Star;
      default: return Star;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'go': return 'text-green-400';
      case 'tbd': return 'text-yellow-400';
      case 'hold': return 'text-red-400';
      default: return 'text-foreground-secondary';
    }
  };

  return (
    <div className="space-y-8">
      {/* Rocket Launches */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-yellow-400 mb-6 flex items-center justify-center gap-2">
          <span className="text-xl">🚀</span>
          UPCOMING LAUNCHES
        </h2>
        
        {loading ? (
          <Card className="hud-panel p-6">
            <div className="text-center text-foreground-secondary">
              Loading launch data...
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {launches.slice(0, 4).map((launch) => (
              <Card key={launch.id} className="hud-panel p-4 hover:border-cyan-400/50 transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-orbitron font-bold text-yellow-400 text-sm leading-tight">
                        {launch.name}
                      </h3>
                      <p className="text-xs text-foreground-secondary mt-1">
                        {launch.rocket?.configuration?.manufacturer?.name || 'Unknown'} • {launch.rocket?.configuration?.name || 'Unknown Rocket'}
                      </p>
                    </div>
                    <Badge className={`ml-2 ${getStatusColor(launch.status?.name || 'Unknown')} bg-transparent border-current`}>
                      {launch.status?.name || 'TBD'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-orbitron font-bold text-red-400">
                        {getTimeUntilLaunch(launch.net)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-muted-foreground">
                        {new Date(launch.net).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-foreground-secondary line-clamp-2">
                    {launch.mission?.description || `Launch from ${launch.pad?.location?.name || 'Unknown Location'}`}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cosmic Events */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-purple-400 mb-6 flex items-center gap-2">
          <Star className="w-6 h-6" />
          COSMIC EVENTS
        </h2>
        
        {eventsLoading ? (
          <Card className="hud-panel p-6">
            <div className="text-center text-foreground-secondary">
              Loading cosmic events...
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cosmicEvents.map((event) => {
              const IconComponent = getEventIcon(event.type);
              const timeUntil = getTimeUntilEvent(event.date);
              
              return (
                <Card key={event.id} className="hud-panel p-4 hover:border-purple-400/50 transition-all duration-300">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-purple-400" />
                      <h3 className="font-orbitron font-bold text-purple-400 text-sm">
                        {event.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span className="font-orbitron font-bold text-purple-400">
                          {timeUntil}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span className="text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-foreground-secondary">
                      {event.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {event.visibility && (
                        <p className="text-xs text-yellow-400">
                          📍 {event.visibility}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Source: {event.source}
                      </p>
                    </div>
                    
                    {event.magnitude && (
                      <p className="text-xs text-orange-400">
                        Magnitude: {event.magnitude}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Next Major Event Countdown */}
      <Card className="hud-panel p-8 text-center cosmic-border">
        <h2 className="text-xl font-orbitron font-bold text-cyan-400 mb-4">
          NEXT MAJOR EVENT
        </h2>
        
        {launches.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-orbitron font-black text-cyan-400">
              {launches[0].name}
            </h3>
            <div className="time-display text-3xl">
              {getTimeUntilLaunch(launches[0].net)}
            </div>
            <p className="text-foreground-secondary">
              {launches[0]?.rocket?.configuration?.manufacturer?.name || 'Unknown'} • {new Date(launches[0].net).toLocaleString()}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}