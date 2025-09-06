import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserClocks } from '@/hooks/useUserClocks';

export function EarthTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const { user } = useAuth();
  const { clocks, loading, saveClock, deleteClock } = useUserClocks();

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

  // Default time zones for space agencies
  const defaultSpaceAgencyTimes = [
    { name: 'NASA (Houston)', timezone: 'America/Chicago', agency: 'NASA' },
    { name: 'ESA (Paris)', timezone: 'Europe/Paris', agency: 'ESA' },
    { name: 'JAXA (Tokyo)', timezone: 'Asia/Tokyo', agency: 'JAXA' },
    { name: 'ISRO (Bangalore)', timezone: 'Asia/Kolkata', agency: 'ISRO' }
  ];

  // Use saved clocks if user is logged in and has clocks, otherwise use defaults
  const displayClocks = user && clocks.length > 0 ? clocks.map(clock => ({
    name: clock.name,
    timezone: clock.planet, // Using planet field as timezone for now
    agency: clock.name.split(' ')[0] || 'CUSTOM'
  })) : defaultSpaceAgencyTimes;

  const handleSaveClock = async (location: any) => {
    if (!user) return;
    await saveClock(location.timezone, '24h', location.name);
  };

  const handleDeleteClock = async (clockId: string) => {
    await deleteClock(clockId);
  };

  const getSavedClockId = (locationName: string) => {
    return clocks.find(clock => clock.name === locationName)?.id;
  };

  return (
    <div className="space-y-8">
      {/* Main Earth Time Display */}
      <Card className="hud-panel p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-3xl font-orbitron font-bold text-cyan-400">EARTH LOCAL TIME</h2>
        </div>
        
        <div className="space-y-4">
          <div className="text-5xl md:text-7xl font-orbitron font-black text-cyan-400 tracking-wider time-display">{formatTime(currentTime)}</div>
          <div className="text-xl text-foreground-secondary font-orbitron">{formatDate(currentTime)}</div>
          
          <div className="flex items-center justify-center gap-2 text-blue-400">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-orbitron">{timezone}</span>
          </div>
        </div>
      </Card>

      {/* Show message when user is signed in */}
      {user && (
        <Card className="hud-panel p-4 text-center">
          <p className="text-sm text-foreground-secondary font-orbitron">
            {clocks.length > 0 ? 'Your saved clocks are displayed below' : 'Save your preferred clocks using the save buttons below'}
          </p>
        </Card>
      )}

      {/* Space Agency Time Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayClocks.map((location, index) => {
          const localTime = new Date().toLocaleTimeString('en-US', {
            timeZone: location.timezone,
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
          });

          const agencyThemes = [
            { name: 'NASA', icon: '🚀', color: 'text-blue-400', bg: 'bg-blue-500/20' },
            { name: 'ESA', icon: '🛰️', color: 'text-white', bg: 'bg-white/20' },
            { name: 'JAXA', icon: '🛸', color: 'text-red-400', bg: 'bg-red-500/20' },
            { name: 'ISRO', icon: '🇮🇳', color: 'text-orange-400', bg: 'bg-orange-500/20' }
          ];

          const theme = agencyThemes.find(t => location.agency.includes(t.name)) || 
                       { name: 'CUSTOM', icon: '🌍', color: 'text-green-400', bg: 'bg-green-500/20' };

          const savedClockId = getSavedClockId(location.name);
          const isFromDefaults = defaultSpaceAgencyTimes.some(def => def.name === location.name);

          return (
            <Card key={location.name} className="hud-panel p-4 hover:border-cyan-400/50 transition-all">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{theme.icon}</span>
                  <div className={`text-sm font-orbitron font-bold ${theme.color}`}>
                    {theme.name}
                  </div>
                </div>
                <div className="text-2xl font-orbitron font-black text-cyan-400">
                  {localTime}
                </div>
                <div className="text-xs text-foreground-secondary">
                  {location.name}
                </div>
                
                {/* Save/Delete buttons for authenticated users */}
                {user && (
                  <div className="flex justify-center gap-1 mt-2">
                    {isFromDefaults && !savedClockId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveClock(location)}
                        disabled={loading}
                        className="text-xs px-2 py-1 h-6"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                    )}
                    {savedClockId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClock(savedClockId)}
                        disabled={loading}
                        className="text-xs px-2 py-1 h-6 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Earth Stats */}
      <Card className="hud-panel p-6">
        <h3 className="text-xl font-orbitron font-bold text-blue-400 mb-4 flex items-center justify-center gap-2">
          <Globe className="w-6 h-6" />
          EARTH PLANETARY STATUS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">ROTATION PERIOD</div>
            <div className="text-lg font-bold text-red-400">23h 56m 4s</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">ORBITAL VELOCITY</div>
            <div className="text-lg font-bold text-blue-400">29.78 km/s</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">DISTANCE FROM SUN</div>
            <div className="text-lg font-bold text-yellow-400">149.6M km</div>
          </div>
        </div>
      </Card>
    </div>
  );
}