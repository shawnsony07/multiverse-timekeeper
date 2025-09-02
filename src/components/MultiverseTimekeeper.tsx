import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Rocket, Zap, Globe } from 'lucide-react';
import { EarthTime } from '@/components/time/EarthTime';
import { GalacticTime } from '@/components/time/GalacticTime';
import { CosmicEvents } from '@/components/events/CosmicEvents';
import { WormholeMode } from '@/components/wormhole/WormholeMode';
import cosmicHero from '@/assets/cosmic-hero.jpg';

export function MultiverseTimekeeper() {
  return (
    <div className="min-h-screen bg-retro-gradient relative overflow-hidden p-8">
      <div className="relative z-10 container mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-orbitron font-black retro-title mb-8">
            MULTIVERSE
          </h1>
          <h2 className="text-4xl md:text-6xl font-orbitron font-black retro-title -mt-4">
            TIMEKEEPER
          </h2>
        </header>

        {/* Grid Layout */}
        <div className="max-w-4xl mx-auto">
          <div className="retro-panel p-8">
            <div className="grid grid-cols-2 gap-6">
              {/* NOW Panel */}
              <div className="retro-card">
                <h3 className="text-xl font-orbitron font-bold text-retro-amber mb-4 text-center">NOW</h3>
                <EarthTime />
              </div>

              {/* GALACTIC Panel */}
              <div className="retro-card">
                <h3 className="text-xl font-orbitron font-bold text-retro-amber mb-4 text-center">GALACTIC</h3>
                <GalacticTime />
              </div>

              {/* EVENTS Panel */}
              <div className="retro-card">
                <h3 className="text-xl font-orbitron font-bold text-retro-amber mb-4 text-center">EVENTS</h3>
                <CosmicEvents />
              </div>

              {/* WORMHOLE Panel */}
              <div className="retro-card">
                <h3 className="text-xl font-orbitron font-bold text-retro-amber mb-4 text-center">WORMHOLE</h3>
                <WormholeMode />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
