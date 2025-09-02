import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Rocket, Zap, Globe } from 'lucide-react';
import { EarthTime } from '@/components/time/EarthTime';
import { GalacticTime } from '@/components/time/GalacticTime';
import { CosmicEvents } from '@/components/events/CosmicEvents';
import { WormholeMode } from '@/components/wormhole/WormholeMode';
import cosmicHero from '@/assets/cosmic-hero.jpg';

export function MultiverseTimekeeper() {
  const [activeTab, setActiveTab] = useState("now");

  return (
    <div className="min-h-screen bg-space-gradient relative overflow-hidden">
      {/* Cosmic Background */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url(${cosmicHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-neon-cyan rounded-full animate-pulse-cosmic"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-neon-purple rounded-full animate-float"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-neon-pink rounded-full animate-glow"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 animate-float">
          <h1 className="text-6xl md:text-8xl font-orbitron font-black neon-text mb-4">
            MULTIVERSE
          </h1>
          <h2 className="text-3xl md:text-5xl font-orbitron font-bold text-neon-purple mb-6">
            TIMEKEEPER
          </h2>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Navigate through time and space. Monitor Earth, galactic realms, cosmic events, 
            and explore alternate timelines through quantum wormholes.
          </p>
        </header>

        {/* Main Timekeeper Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Futuristic Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 hud-panel mb-8 p-2">
              <TabsTrigger 
                value="now" 
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-neon-gradient data-[state=active]:text-primary-foreground"
              >
                <Clock className="w-5 h-5" />
                NOW
              </TabsTrigger>
              <TabsTrigger 
                value="galactic"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-neon-gradient data-[state=active]:text-primary-foreground"
              >
                <Globe className="w-5 h-5" />
                GALACTIC
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-neon-gradient data-[state=active]:text-primary-foreground"
              >
                <Rocket className="w-5 h-5" />
                EVENTS
              </TabsTrigger>
              <TabsTrigger 
                value="wormhole"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-neon-gradient data-[state=active]:text-primary-foreground"
              >
                <Zap className="w-5 h-5" />
                WORMHOLE
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="now" className="space-y-6">
              <EarthTime />
            </TabsContent>

            <TabsContent value="galactic" className="space-y-6">
              <GalacticTime />
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <CosmicEvents />
            </TabsContent>

            <TabsContent value="wormhole" className="space-y-6 wormhole-bg p-6 rounded-lg">
              <WormholeMode />
            </TabsContent>
          </Tabs>
        </div>

        {/* Status Bar */}
        <footer className="mt-12 text-center">
          <div className="hud-panel inline-flex items-center gap-4 px-6 py-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse-cosmic"></div>
            <span className="text-sm font-orbitron text-foreground-secondary">
              QUANTUM SYNCHRONIZATION: ACTIVE
            </span>
            <div className="w-2 h-2 bg-neon-purple rounded-full animate-glow"></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
