import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, RotateCcw, Clock, Atom, Sparkles } from 'lucide-react';

interface AlternateTimeline {
  id: string;
  name: string;
  description: string;
  timeMultiplier: number;
  scenario: string;
  color: string;
  icon: any;
}

export function WormholeMode() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTimeline, setActiveTimeline] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const alternateTimelines: AlternateTimeline[] = [
    {
      id: 'fast-earth',
      name: 'Accelerated Earth',
      description: 'Earth rotates 2x faster',
      timeMultiplier: 2,
      scenario: 'In this timeline, Earth completes a rotation in 12 hours instead of 24.',
      color: 'text-neon-cyan',
      icon: RotateCcw
    },
    {
      id: 'slow-earth',
      name: 'Decelerated Earth',
      description: 'Earth rotates 50% slower',
      timeMultiplier: 0.5,
      scenario: 'Days last 48 hours, creating extreme temperature variations.',
      color: 'text-neon-purple',
      icon: Clock
    },
    {
      id: 'quantum-time',
      name: 'Quantum Flux',
      description: 'Time flows in quantum bursts',
      timeMultiplier: 1.618, // Golden ratio for "quantum" effect
      scenario: 'Time advances in discrete quantum packets, not continuously.',
      color: 'text-neon-pink',
      icon: Atom
    },
    {
      id: 'stellar-sync',
      name: 'Stellar Synchronization',
      description: 'Synchronized with Proxima Centauri',
      timeMultiplier: 0.9,
      scenario: 'Time adjusted to match the nearest star system.',
      color: 'text-neon-gold',
      icon: Sparkles
    }
  ];

  const calculateAlternateTime = (multiplier: number) => {
    const now = new Date();
    const secondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const alternateSeconds = (secondsToday * multiplier) % 86400; // Keep within 24 hours
    
    const hours = Math.floor(alternateSeconds / 3600);
    const minutes = Math.floor((alternateSeconds % 3600) / 60);
    const seconds = Math.floor(alternateSeconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (multiplier: number) => {
    // Adjust date based on time multiplier for dramatic effect
    const now = new Date();
    const dayOffset = Math.floor((multiplier - 1) * 10); // Exaggerate the effect
    const alternateDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    return alternateDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Wormhole Header */}
      <Card className="hud-panel p-8 text-center cosmic-border wormhole-bg">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Zap className="w-8 h-8 text-neon-purple animate-glow" />
          <h2 className="text-3xl font-orbitron font-bold text-neon-purple">
            QUANTUM WORMHOLE ACTIVATED
          </h2>
        </div>
        
        <p className="text-lg text-foreground-secondary max-w-2xl mx-auto mb-6">
          Peer into alternate timelines where the laws of physics bend to create different temporal realities. 
          Each timeline shows how time would flow under different cosmic conditions.
        </p>
        
        <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple animate-pulse-cosmic">
          MULTIVERSE SCANNER: ONLINE
        </Badge>
      </Card>

      {/* Alternate Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {alternateTimelines.map((timeline) => {
          const IconComponent = timeline.icon;
          const alternateTime = calculateAlternateTime(timeline.timeMultiplier);
          const alternateDate = formatDate(timeline.timeMultiplier);
          const isActive = activeTimeline === timeline.id;
          
          return (
            <Card 
              key={timeline.id} 
              className={`hud-panel p-6 cursor-pointer transition-all duration-300 ${
                isActive ? 'cosmic-border animate-cosmic-pulse' : 'hover:cosmic-pulse'
              }`}
              onClick={() => setActiveTimeline(isActive ? null : timeline.id)}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-6 h-6 ${timeline.color} animate-glow`} />
                    <h3 className={`text-xl font-orbitron font-bold ${timeline.color}`}>
                      {timeline.name}
                    </h3>
                  </div>
                  <Badge className={`${timeline.color} bg-transparent border-current`}>
                    {timeline.timeMultiplier}x
                  </Badge>
                </div>
                
                <div className="text-center space-y-2">
                  <div className={`text-3xl font-orbitron font-black ${timeline.color}`}>
                    {alternateTime}
                  </div>
                  <div className="text-sm text-foreground-secondary font-orbitron">
                    {alternateDate}
                  </div>
                </div>
                
                <p className="text-sm text-foreground-secondary">
                  {timeline.description}
                </p>
                
                {isActive && (
                  <div className="mt-4 p-4 bg-surface/50 rounded border border-primary/30">
                    <h4 className="text-sm font-orbitron font-bold text-primary mb-2">
                      TIMELINE ANALYSIS:
                    </h4>
                    <p className="text-xs text-foreground-secondary">
                      {timeline.scenario}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Timeline Comparator */}
      {activeTimeline && (
        <Card className="hud-panel p-6 cosmic-border">
          <h3 className="text-xl font-orbitron font-bold text-primary mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            TEMPORAL COMPARISON
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground font-orbitron">BASELINE EARTH</div>
              <div className="text-2xl font-orbitron font-bold text-primary">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </div>
              <div className="text-xs text-foreground-secondary">
                Standard Timeline • 1.0x Rate
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground font-orbitron">ALTERNATE REALITY</div>
              <div className={`text-2xl font-orbitron font-bold ${alternateTimelines.find(t => t.id === activeTimeline)?.color}`}>
                {calculateAlternateTime(alternateTimelines.find(t => t.id === activeTimeline)?.timeMultiplier || 1)}
              </div>
              <div className="text-xs text-foreground-secondary">
                {alternateTimelines.find(t => t.id === activeTimeline)?.name} • {alternateTimelines.find(t => t.id === activeTimeline)?.timeMultiplier}x Rate
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quantum Notes */}
      <Card className="hud-panel p-6">
        <h3 className="text-lg font-orbitron font-bold text-neon-purple mb-3">
          QUANTUM TEMPORAL THEORY
        </h3>
        <div className="text-sm text-foreground-secondary space-y-2">
          <p>
            • <strong>Accelerated Earth:</strong> Increased rotational velocity would affect gravity and atmospheric dynamics.
          </p>
          <p>
            • <strong>Decelerated Earth:</strong> Slower rotation creates extreme day/night cycles and weather patterns.
          </p>
          <p>
            • <strong>Quantum Flux:</strong> Time advances in discrete packets, similar to quantum mechanics principles.
          </p>
          <p>
            • <strong>Stellar Sync:</strong> Temporal alignment with nearby star systems for galactic coordination.
          </p>
        </div>
      </Card>
    </div>
  );
}