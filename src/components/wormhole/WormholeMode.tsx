import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, RotateCcw, Clock, Atom, Sparkles, Plus, Cog, Trash2, type LucideIcon } from 'lucide-react';

interface AlternateTimeline {
  id: string;
  name: string;
  description: string;
  timeMultiplier: number;
  scenario: string;
  color: string;
  icon: LucideIcon;
  created?: Date;
  isCustom?: boolean;
  physics?: {
    gravity: number;
    magneticField: number;
    quantumFlux: number;
  };
}

interface CustomTimelineForm {
  name: string;
  description: string;
  timeMultiplier: number;
  scenario: string;
  gravity: number;
  magneticField: number;
  quantumFlux: number;
}

export function WormholeMode() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTimeline, setActiveTimeline] = useState<string | null>(null);
  const [isWormholeActive, setIsWormholeActive] = useState(false);
  const [wormholeIntensity, setWormholeIntensity] = useState(50);
  const [temporalPhase, setTemporalPhase] = useState(0);

  // Time update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setTemporalPhase(prev => (prev + 1) % 360);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Simplified component without localStorage

  const baseTimelines: AlternateTimeline[] = [
    {
      id: 'fast-earth',
      name: 'Accelerated Earth',
      description: 'Earth rotates 2x faster',
      timeMultiplier: 2,
      scenario: 'In this timeline, Earth completes a rotation in 12 hours instead of 24. Gravitational effects are amplified due to increased rotational velocity.',
      color: 'text-cyan-400',
      icon: RotateCcw,
      physics: { gravity: 1.2, magneticField: 1.5, quantumFlux: 1.1 }
    },
    {
      id: 'slow-earth',
      name: 'Decelerated Earth',
      description: 'Earth rotates 50% slower',
      timeMultiplier: 0.5,
      scenario: 'Days last 48 hours, creating extreme temperature variations. Tidal forces are reduced, affecting ocean currents.',
      color: 'text-purple-400',
      icon: Clock,
      physics: { gravity: 0.9, magneticField: 0.7, quantumFlux: 0.8 }
    },
    {
      id: 'quantum-time',
      name: 'Quantum Flux',
      description: 'Time flows in quantum bursts',
      timeMultiplier: 1.618, // Golden ratio for "quantum" effect
      scenario: 'Time advances in discrete quantum packets, creating temporal uncertainty. Causality operates on probability curves.',
      color: 'text-pink-400',
      icon: Atom,
      physics: { gravity: 1.0, magneticField: 2.0, quantumFlux: 3.14 }
    },
    {
      id: 'stellar-sync',
      name: 'Stellar Synchronization',
      description: 'Synchronized with Proxima Centauri',
      timeMultiplier: 0.9,
      scenario: 'Time adjusted to match the nearest star system. Allows for coordinated interstellar communication.',
      color: 'text-yellow-400',
      icon: Sparkles,
      physics: { gravity: 1.0, magneticField: 0.95, quantumFlux: 1.2 }
    },
    {
      id: 'backwards-time',
      name: 'Temporal Reversal',
      description: 'Time flows backwards',
      timeMultiplier: -0.5,
      scenario: 'In this impossible timeline, causality is reversed. Effects precede causes in a paradoxical dance.',
      color: 'text-red-400',
      icon: RotateCcw,
      physics: { gravity: -0.8, magneticField: -1.2, quantumFlux: -2.0 }
    },
    {
      id: 'frozen-time',
      name: 'Temporal Stasis',
      description: 'Time nearly stops',
      timeMultiplier: 0.001,
      scenario: 'Time crawls at 1/1000th normal speed. A second stretches into an eternity of perception.',
      color: 'text-blue-300',
      icon: Clock,
      physics: { gravity: 0.1, magneticField: 0.01, quantumFlux: 0.001 }
    }
  ];

  // Use only base timelines for simplicity
  const allTimelines = baseTimelines;

  // Simplified component - custom timeline features removed

  // Enhanced time calculation with quantum effects
  const calculateAlternateTime = (multiplier: number, physics?: AlternateTimeline['physics']) => {
    try {
      const now = new Date();
      let secondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      // Apply quantum flux effects with safety checks
      if (physics?.quantumFlux && physics.quantumFlux !== 1 && !isNaN(temporalPhase)) {
        const quantumNoise = Math.sin(temporalPhase * Math.PI / 180) * physics.quantumFlux * 0.1;
        if (!isNaN(quantumNoise)) {
          multiplier += quantumNoise;
        }
      }
      
      let alternateSeconds;
      if (multiplier < 0) {
        // Backwards time calculation
        alternateSeconds = (86400 - (secondsToday * Math.abs(multiplier))) % 86400;
      } else {
        alternateSeconds = (secondsToday * multiplier) % 86400;
      }
      
      if (alternateSeconds < 0) alternateSeconds += 86400;
      
      const hours = Math.floor(alternateSeconds / 3600);
      const minutes = Math.floor((alternateSeconds % 3600) / 60);
      const seconds = Math.floor(alternateSeconds % 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error calculating alternate time:', error);
      return new Date().toLocaleTimeString('en-US', { hour12: false });
    }
  };
  
  // Animated wormhole travel function
  const travelThroughWormhole = (timelineId: string) => {
    setIsWormholeActive(true);
    
    // Simulate wormhole travel sequence
    setTimeout(() => {
      setActiveTimeline(timelineId);
    }, 1500);
    
    setTimeout(() => {
      setIsWormholeActive(false);
    }, 3000);
  };
  
  // Get physics-affected display properties
  const getTimelineEffects = (timeline: AlternateTimeline) => {
    const physics = timeline.physics;
    if (!physics) return {};
    
    const effects: any = {};
    
    // Gravity affects text weight
    if (physics.gravity > 1.1) effects.fontWeight = 'black';
    else if (physics.gravity < 0.9) effects.fontWeight = 'light';
    
    // Magnetic field affects glow intensity
    if (physics.magneticField > 1.5) {
      effects.filter = 'drop-shadow(0 0 20px currentColor)';
    } else if (physics.magneticField < 0.5) {
      effects.opacity = 0.7;
    }
    
    // Quantum flux affects animation
    if (physics.quantumFlux > 2) {
      effects.animation = 'pulse 0.5s infinite';
    }
    
    return effects;
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
      <Card className={`hud-panel p-8 text-center cosmic-border wormhole-bg ${
        isWormholeActive ? 'animate-cosmic-pulse' : ''
      }`}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Zap className={`w-8 h-8 text-neon-purple ${
            isWormholeActive ? 'animate-spin' : 'animate-glow'
          }`} />
          <h2 className="text-3xl font-orbitron font-bold text-neon-purple">
            {isWormholeActive ? 'WORMHOLE TRAVELING...' : 'QUANTUM WORMHOLE ACTIVATED'}
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
        {allTimelines.map((timeline) => {
          const IconComponent = timeline.icon;
          const alternateTime = calculateAlternateTime(timeline.timeMultiplier, timeline.physics);
          const isActive = activeTimeline === timeline.id;
          
          return (
            <Card 
              key={timeline.id} 
              className={`hud-panel p-6 cursor-pointer transition-all duration-300 ${
                isActive ? 'cosmic-border animate-cosmic-pulse' : 'hover:cosmic-pulse'
              } ${isWormholeActive ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => travelThroughWormhole(timeline.id)}
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
                </div>
                
                <p className="text-sm text-foreground-secondary">
                  {timeline.description}
                </p>
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
              <div className={`text-2xl font-orbitron font-bold ${allTimelines.find(t => t.id === activeTimeline)?.color}`}>
                {calculateAlternateTime(
                  allTimelines.find(t => t.id === activeTimeline)?.timeMultiplier || 1,
                  allTimelines.find(t => t.id === activeTimeline)?.physics
                )}
              </div>
              <div className="text-xs text-foreground-secondary">
                {allTimelines.find(t => t.id === activeTimeline)?.name} • {allTimelines.find(t => t.id === activeTimeline)?.timeMultiplier}x Rate
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Wormhole Control Panel */}
      <Card className="hud-panel p-6">
        <h3 className="text-lg font-orbitron font-bold text-neon-purple mb-4">
          WORMHOLE INTENSITY CONTROL
        </h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="wormhole-intensity">Quantum Flux Intensity: {wormholeIntensity}%</Label>
            <Slider
              id="wormhole-intensity"
              min={1}
              max={100}
              step={1}
              value={[wormholeIntensity]}
              onValueChange={(value) => setWormholeIntensity(value[0])}
              className="mt-2"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isWormholeActive ? 'bg-neon-purple animate-pulse' : 'bg-gray-600'}`}></div>
              <span className="text-sm font-orbitron">
                {isWormholeActive ? 'WORMHOLE ACTIVE' : 'STANDBY MODE'}
              </span>
            </div>
            <Badge className={`${isWormholeActive ? 'bg-neon-purple/20 text-neon-purple' : 'bg-gray-600/20'}`}>
              PHASE: {temporalPhase}°
            </Badge>
          </div>
        </div>
      </Card>

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