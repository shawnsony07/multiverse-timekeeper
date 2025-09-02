import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Globe, Orbit, Stars } from 'lucide-react';

export function GalacticTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate Mars Sol (Martian day)
  const calculateMarsSol = (earthTime: Date) => {
    // Mars Sol length is approximately 24 hours, 39 minutes, and 35.244 seconds
    const marsSecondsPerDay = 88775.244;
    const earthSecondsPerDay = 86400;
    const ratio = marsSecondsPerDay / earthSecondsPerDay;
    
    // Mars epoch (arbitrary starting point for demonstration)
    const marsEpoch = new Date('2000-01-01T00:00:00Z');
    const earthSecondsSinceEpoch = (earthTime.getTime() - marsEpoch.getTime()) / 1000;
    const marsSecondsSinceEpoch = earthSecondsSinceEpoch / ratio;
    
    const marsDays = Math.floor(marsSecondsSinceEpoch / marsSecondsPerDay);
    const marsSecondsToday = marsSecondsSinceEpoch % marsSecondsPerDay;
    
    const marsHours = Math.floor(marsSecondsToday / 3600);
    const marsMinutes = Math.floor((marsSecondsToday % 3600) / 60);
    const marsSeconds = Math.floor(marsSecondsToday % 60);
    
    return {
      sol: marsDays,
      time: `${marsHours.toString().padStart(2, '0')}:${marsMinutes.toString().padStart(2, '0')}:${marsSeconds.toString().padStart(2, '0')}`
    };
  };

  const marsSol = calculateMarsSol(currentTime);

  // Fictional galactic realms for Marvel-inspired multiverse
  const galacticRealms = [
    {
      name: 'Asgard',
      timeMultiplier: 1.5,
      description: 'Realm of the Gods',
      color: 'text-neon-gold',
      icon: Stars
    },
    {
      name: 'Xandar',
      timeMultiplier: 0.8,
      description: 'Nova Corps HQ',
      color: 'text-neon-cyan',
      icon: Globe
    },
    {
      name: 'Sakaar',
      timeMultiplier: 2.3,
      description: 'Contest Planet',
      color: 'text-neon-purple',
      icon: Orbit
    },
    {
      name: 'Knowhere',
      timeMultiplier: 0.6,
      description: 'Mining Station',
      color: 'text-neon-pink',
      icon: Stars
    }
  ];

  const calculateRealmTime = (multiplier: number) => {
    const realmSeconds = currentTime.getSeconds() * multiplier;
    const realmMinutes = currentTime.getMinutes() + Math.floor(realmSeconds / 60);
    const realmHours = (currentTime.getHours() + Math.floor(realmMinutes / 60)) % 24;
    
    const finalMinutes = realmMinutes % 60;
    const finalSeconds = Math.floor(realmSeconds % 60);
    
    return `${realmHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}:${finalSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Mars Time */}
      <Card className="hud-panel p-8 text-center cosmic-border">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Globe className="w-8 h-8 text-destructive animate-float" />
          <h2 className="text-3xl font-orbitron font-bold text-destructive">MARS LOCAL TIME</h2>
        </div>
        
        <div className="space-y-4">
          <div className="time-display mars-time">{marsSol.time}</div>
          <div className="text-xl text-foreground-secondary font-orbitron">
            Sol {marsSol.sol} • Martian Calendar
          </div>
          <div className="text-sm text-muted-foreground">
            1 Sol = 24h 39m 35s Earth time
          </div>
        </div>
      </Card>

      {/* Galactic Realms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {galacticRealms.map((realm) => {
          const IconComponent = realm.icon;
          const realmTime = calculateRealmTime(realm.timeMultiplier);
          
          return (
            <Card key={realm.name} className="hud-panel p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <IconComponent className={`w-6 h-6 ${realm.color} animate-glow`} />
                  <h3 className={`text-xl font-orbitron font-bold ${realm.color}`}>
                    {realm.name.toUpperCase()}
                  </h3>
                </div>
                
                <div className={`text-3xl font-orbitron font-black ${realm.color}`}>
                  {realmTime}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {realm.description}
                </div>
                
                <div className="text-xs text-foreground-secondary">
                  Time Flow: {realm.timeMultiplier}x Earth Rate
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Galactic Coordinates */}
      <Card className="hud-panel p-6">
        <h3 className="text-xl font-orbitron font-bold text-primary mb-4 flex items-center gap-2">
          <Orbit className="w-5 h-5" />
          GALACTIC COORDINATES
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-orbitron">GALACTIC LONGITUDE</div>
            <div className="text-lg font-bold text-neon-cyan">0° 0' 0"</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-orbitron">GALACTIC LATITUDE</div>
            <div className="text-lg font-bold text-neon-purple">-60° 11' 20"</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-orbitron">DISTANCE TO CENTER</div>
            <div className="text-lg font-bold text-neon-gold">26,000 LY</div>
          </div>
        </div>
      </Card>
    </div>
  );
}