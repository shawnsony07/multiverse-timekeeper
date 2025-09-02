import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Globe, MapPin } from 'lucide-react';

export function EarthTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Time zones for major space agencies
  const spaceAgencyTimes = [
    { name: 'NASA (Houston)', timezone: 'America/Chicago', agency: 'NASA' },
    { name: 'ESA (Paris)', timezone: 'Europe/Paris', agency: 'ESA' },
    { name: 'JAXA (Tokyo)', timezone: 'Asia/Tokyo', agency: 'JAXA' },
    { name: 'SpaceX (Hawthorne)', timezone: 'America/Los_Angeles', agency: 'SpaceX' }
  ];

  return (
    <div className="space-y-8">
      {/* Main Earth Time Display */}
      <Card className="hud-panel p-8 text-center cosmic-border">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-primary animate-float" />
          <h2 className="text-3xl font-orbitron font-bold text-primary">EARTH LOCAL TIME</h2>
        </div>
        
        <div className="space-y-4">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="text-xl text-foreground-secondary font-orbitron">{formatDate(currentTime)}</div>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-orbitron">{timezone}</span>
          </div>
        </div>
      </Card>

      {/* Space Agency Time Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {spaceAgencyTimes.map((location) => {
          const localTime = new Date().toLocaleTimeString('en-US', {
            timeZone: location.timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <Card key={location.name} className="hud-panel p-4">
              <div className="text-center space-y-2">
                <div className="text-sm font-orbitron font-bold text-neon-cyan">
                  {location.agency}
                </div>
                <div className="text-2xl font-orbitron font-black text-primary">
                  {localTime}
                </div>
                <div className="text-xs text-muted-foreground">
                  {location.name}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Earth Stats */}
      <Card className="hud-panel p-6">
        <h3 className="text-xl font-orbitron font-bold text-primary mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          PLANETARY STATUS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-orbitron">ROTATION PERIOD</div>
            <div className="text-lg font-bold text-neon-cyan">23h 56m 4s</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-orbitron">ORBITAL VELOCITY</div>
            <div className="text-lg font-bold text-neon-purple">29.78 km/s</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-orbitron">DISTANCE FROM SUN</div>
            <div className="text-lg font-bold text-neon-gold">149.6M km</div>
          </div>
        </div>
      </Card>
    </div>
  );
}