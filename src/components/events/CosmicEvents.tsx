import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Calendar, Clock, Star, Sun, Moon, Zap } from 'lucide-react';
import { launchApi, type Launch, cosmicEvents, type CosmicEvent } from '@/services/api';

export function CosmicEvents() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchLaunches();
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
      default: return Star;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'go': return 'text-primary';
      case 'tbd': return 'text-neon-gold';
      case 'hold': return 'text-destructive';
      default: return 'text-foreground-secondary';
    }
  };

  return (
    <div className="space-y-8">
      {/* Rocket Launches */}
      <div>
        <h2 className="text-2xl font-orbitron font-bold text-primary mb-6 flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          UPCOMING LAUNCHES
        </h2>
        
        {loading ? (
          <Card className="hud-panel p-6">
            <div className="text-center text-muted-foreground">
              Synchronizing with mission control...
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {launches.slice(0, 4).map((launch) => (
              <Card key={launch.id} className="hud-panel p-4 hover:cosmic-pulse transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-orbitron font-bold text-primary text-sm leading-tight">
                        {launch.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
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
                      <span className="font-orbitron font-bold text-neon-cyan">
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
        <h2 className="text-2xl font-orbitron font-bold text-primary mb-6 flex items-center gap-2">
          <Star className="w-6 h-6" />
          COSMIC EVENTS
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cosmicEvents.map((event) => {
            const IconComponent = getEventIcon(event.type);
            const timeUntil = getTimeUntilEvent(event.date);
            
            return (
              <Card key={event.id} className="hud-panel p-4 hover:animate-glow transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-neon-purple" />
                    <h3 className="font-orbitron font-bold text-primary text-sm">
                      {event.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-orbitron font-bold text-neon-purple">
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
                  
                  {event.visibility && (
                    <p className="text-xs text-neon-gold">
                      📍 {event.visibility}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Next Major Event Countdown */}
      <Card className="hud-panel p-8 text-center cosmic-border">
        <h2 className="text-xl font-orbitron font-bold text-primary mb-4">
          NEXT MAJOR EVENT
        </h2>
        
        {launches.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-orbitron font-black text-neon-cyan">
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