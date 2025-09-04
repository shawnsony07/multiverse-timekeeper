import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Rocket, Zap, Globe } from 'lucide-react';
import { EarthTime } from '@/components/time/EarthTime';
import { GalacticTime } from '@/components/time/GalacticTime';
import { CosmicEvents } from '@/components/events/CosmicEvents';
import { WormholeMode } from '@/components/wormhole/WormholeMode';

export function MultiverseTimekeeper() {
  const [activeTab, setActiveTab] = useState("now");
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [scrollVelocity, setScrollVelocity] = useState(0);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    let lastScrollY = 0;
    let lastScrollTime = Date.now();
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastScrollTime;
      const scrollDelta = currentScrollY - lastScrollY;
      
      // Calculate scroll velocity
      const velocity = Math.abs(scrollDelta) / timeDelta;
      setScrollVelocity(velocity);
      
      // Determine scroll direction
      if (scrollDelta > 0) {
        setScrollDirection('down');
      } else if (scrollDelta < 0) {
        setScrollDirection('up');
      }
      
      setScrollY(currentScrollY);
      setIsScrolling(true);
      
      lastScrollY = currentScrollY;
      lastScrollTime = currentTime;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
        setScrollVelocity(0);
      }, 150);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0">
        {/* Stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
        
        {/* Nebula effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Cosmic Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-orbitron font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            MULTIVERSE TIMEKEEPER
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mx-auto">
            Monitor time across dimensions. Track Earth, Mars, cosmic events, and interdimensional portals.
          </p>
        </header>

        {/* Main Timekeeper Interface */}
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Cosmic Tab Navigation */}
            <TabsList className="grid w-full grid-cols-4 hud-panel mb-8 p-2">
              <TabsTrigger 
                value="now" 
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-foreground-secondary hover:text-cyan-400 transition-all"
              >
                <Clock className="w-5 h-5" />
                NOW
              </TabsTrigger>
              <TabsTrigger 
                value="galactic"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-foreground-secondary hover:text-purple-400 transition-all"
              >
                <Globe className="w-5 h-5" />
                GALACTIC
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 text-foreground-secondary hover:text-yellow-400 transition-all"
              >
                <Rocket className="w-5 h-5" />
                EVENTS
              </TabsTrigger>
              <TabsTrigger 
                value="wormhole"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-foreground-secondary hover:text-pink-400 transition-all"
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
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-orbitron text-cyan-400 font-bold">
              MULTIVERSE MONITORING: ACTIVE
            </span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </footer>
      </div>

      {/* Bottom Status Bar with Sliding Cape */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-transparent z-50 pointer-events-none">        
        {/* Sliding Cape */}
        <div 
          className="absolute top-1/2 -translate-y-1/2"
          style={{ 
            transform: `translateX(${Math.min(scrollY * 1.5, typeof window !== 'undefined' ? window.innerWidth - 100 : 1200)}px)`,
            transition: 'none'
          }}
        >
          <img 
            src="/lovable-uploads/e9a3dd20-f657-481c-9496-0073edebb11a.png" 
            alt="Flowing Cape" 
            className="w-24 h-16 object-contain"
            style={{
              transform: `scaleX(${scrollDirection === 'down' ? 1 : -1}) rotate(${scrollDirection === 'down' ? Math.min(scrollVelocity * 2, 8) : -Math.min(scrollVelocity * 2, 8)}deg)`,
              transition: 'transform 0.3s ease-out',
              filter: `drop-shadow(0 2px 12px rgba(220, 38, 127, ${isScrolling ? '0.9' : '0.5'})) brightness(${isScrolling ? '1.3' : '1'})`,
              animation: 'floating 3s ease-in-out infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}
