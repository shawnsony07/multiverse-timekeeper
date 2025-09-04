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

  // Galactic realms and dimensions
  const galacticRealms = [
    {
      name: 'Asgard',
      timeMultiplier: 1.5,
      description: 'Realm of the Gods',
      color: 'text-yellow-400',
      icon: Stars,
      symbol: '⚡'
    },
    {
      name: 'Wakanda',
      timeMultiplier: 1.0,
      description: 'Advanced Civilization',
      color: 'text-purple-400',
      icon: Globe,
      symbol: '🐾'
    },
    {
      name: 'Quantum Realm',
      timeMultiplier: 0.1,
      description: 'Microscopic Dimension',
      color: 'text-blue-400',
      icon: Orbit,
      symbol: '🐜'
    },
    {
      name: 'Dark Dimension',
      timeMultiplier: 3.0,
      description: 'Mystical Realm',
      color: 'text-green-400',
      icon: Stars,
      symbol: '🔮'
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
      <Card className="hud-panel p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">🔴</span>
          </div>
          <h2 className="text-3xl font-orbitron font-bold text-red-400">MARS SOL TIME</h2>
        </div>
        
        <div className="space-y-4">
          <div className="text-5xl md:text-7xl font-orbitron font-black text-red-400 tracking-wider time-display">{marsSol.time}</div>
          <div className="text-xl text-foreground-secondary font-orbitron">
            Sol {marsSol.sol} • Martian Calendar
          </div>
          <div className="text-sm text-blue-400">
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
            <Card key={realm.name} className="hud-panel p-6 hover:border-cyan-400/50 transition-all">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{realm.symbol}</span>
                  <h3 className={`text-xl font-orbitron font-bold ${realm.color}`}>
                    {realm.name.toUpperCase()}
                  </h3>
                </div>
                
                <div className={`text-3xl font-orbitron font-black ${realm.color}`}>
                  {realmTime}
                </div>
                
                <div className="text-sm text-foreground-secondary">
                  {realm.description}
                </div>
                
                <div className="text-xs text-blue-400">
                  Time Flow: {realm.timeMultiplier}x Earth Rate
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Galactic Coordinates */}
      <Card className="hud-panel p-6">
        <h3 className="text-xl font-orbitron font-bold text-purple-400 mb-4 flex items-center justify-center gap-2">
          <span className="text-lg">🌌</span>
          GALACTIC COORDINATES
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">GALACTIC LONGITUDE</div>
            <div className="text-lg font-bold text-blue-400">0° 0' 0"</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">GALACTIC LATITUDE</div>
            <div className="text-lg font-bold text-red-400">-60° 11' 20"</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">DISTANCE TO CENTER</div>
            <div className="text-lg font-bold text-yellow-400">26,000 LY</div>
          </div>
        </div>
      </Card>
    </div>
  );
}