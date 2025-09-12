import { useState, useEffect, useMemo, Component, ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Rocket, Zap, Globe, AlertTriangle, Satellite, BookOpen } from 'lucide-react';
import { EarthTime } from '@/components/time/EarthTime';
import { GalacticTime } from '@/components/time/GalacticTime';
import { CosmicEvents } from '@/components/events/CosmicEvents';
import { WormholeMode } from '@/components/wormhole/WormholeMode';
import { CosmicLoreGenerator } from '@/components/lore/CosmicLoreGenerator';
import { ISSTracker } from '@/components/tracking/ISSTracker';
import { CosmicAudioSystem } from '@/components/audio/CosmicAudioSystem';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Component error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Component Error Fallback
interface ComponentErrorProps {
  name: string;
}

const ComponentError = ({ name }: ComponentErrorProps) => (
  <div className="flex flex-col items-center justify-center p-8 hud-panel">
    <AlertTriangle className="w-8 h-8 text-destructive mb-2" />
    <p className="font-orbitron text-destructive font-bold">{name} Component Error</p>
    <p className="text-sm text-foreground-secondary text-center mt-2">
      This component failed to load. The cosmic systems are still functional.
    </p>
  </div>
);

export function MultiverseTimekeeper() {
  const [activeTab, setActiveTab] = useState("now");
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [scrollVelocity, setScrollVelocity] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const CAPE_WIDTH_PX = 192; // aligns with w-48 (12rem * 16)

  // Choose background per tab
  const backgroundUrl = useMemo(() => {
    if (activeTab === 'now') {
      return "/lovable-uploads/india1.gif";
    }
    if (activeTab === 'galactic') {
      return "/lovable-uploads/galatic.gif"; // file provided by user
    }
    if (activeTab === 'wormhole') {
      return "/lovable-uploads/wormhole.gif";
    }
    if (activeTab === 'tracking') {
      return "/lovable-uploads/iss.gif"; // ISS tracking background
    }
    if (activeTab === 'lore') {
      return "/lovable-uploads/infinity.gif"; // AI lore uses infinity background
    }
    // events (default) 
    return "/lovable-uploads/infinity.gif";
  }, [activeTab]);

  useEffect(() => {
    try {
      let scrollTimeout: NodeJS.Timeout;
      let lastScrollY = 0;
      let lastScrollTime = Date.now();
      
      const handleScroll = () => {
        try {
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
        } catch (err) {
          console.error('Error in scroll handler:', err);
        }
      };
      
      const recalc = () => {
        try {
          const doc = document.documentElement;
          const body = document.body;
          const scrollHeight = Math.max(
            body.scrollHeight || 0,
            doc.scrollHeight || 0,
            body.offsetHeight || 0,
            doc.offsetHeight || 0,
            body.clientHeight || 0,
            doc.clientHeight || 0
          );
          const max = Math.max(1, scrollHeight - window.innerHeight);
          setMaxScroll(max);
          setViewportWidth(window.innerWidth);
        } catch (err) {
          console.error('Error in recalc:', err);
        }
      };
      
      recalc();
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', recalc);
      window.addEventListener('load', recalc);
      
      // Set loading to false after a brief delay to ensure everything is ready
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', recalc);
        window.removeEventListener('load', recalc);
        clearTimeout(scrollTimeout);
      };
    } catch (err) {
      console.error('Error in MultiverseTimekeeper initialization:', err);
      setError('Failed to initialize Multiverse Timekeeper');
      setIsLoading(false);
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-orbitron cosmic-text">Loading Multiverse...</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-foreground-secondary">Initializing cosmic systems</span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive" />
          <p className="text-xl font-orbitron text-destructive">System Error</p>
          <p className="text-foreground-secondary">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-orbitron"
          >
            Restart System
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cosmic Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${backgroundUrl}?v=1), url('/lovable-uploads/39c9e878-3cf2-4ba3-85b9-521e304dea25.png'), linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--surface)) 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      {/* Additional Cosmic Effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Stars */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
      </div>

      <div className="relative z-20 container mx-auto px-4 py-8">
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
            <TabsList className="grid w-full grid-cols-6 hud-panel mb-8 p-2">
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
                value="tracking"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 text-foreground-secondary hover:text-cyan-400 transition-all"
              >
                <Satellite className="w-5 h-5" />
                TRACKING
              </TabsTrigger>
              <TabsTrigger 
                value="wormhole"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 text-foreground-secondary hover:text-pink-400 transition-all"
              >
                <Zap className="w-5 h-5" />
                WORMHOLE
              </TabsTrigger>
              <TabsTrigger 
                value="lore"
                className="flex items-center gap-2 font-orbitron font-bold data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-foreground-secondary hover:text-purple-400 transition-all"
              >
                <BookOpen className="w-5 h-5" />
                AI LORE
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="now" className="space-y-6">
              <ErrorBoundary fallback={<ComponentError name="EarthTime" />}>
                <EarthTime />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="galactic" className="space-y-6">
              <ErrorBoundary fallback={<ComponentError name="GalacticTime" />}>
                <GalacticTime />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <ErrorBoundary fallback={<ComponentError name="CosmicEvents" />}>
                <CosmicEvents />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="tracking" className="space-y-6">
              <ErrorBoundary fallback={<ComponentError name="ISSTracker" />}>
                <ISSTracker />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="wormhole" className="space-y-6 wormhole-bg p-6 rounded-lg">
              <ErrorBoundary fallback={<ComponentError name="WormholeMode" />}>
                <WormholeMode />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="lore" className="space-y-6">
              <ErrorBoundary fallback={<ComponentError name="CosmicLoreGenerator" />}>
                <CosmicLoreGenerator />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        </div>

        {/* Audio System */}
        <div className="mt-8">
          <CosmicAudioSystem activeTab={activeTab} className="max-w-2xl mx-auto" />
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
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-transparent z-50 pointer-events-none">        
        {/* Sliding Cape */}
        <div 
          className="absolute bottom-6 left-0"
          style={{ 
            transform: `translateX(${(() => {
              // Make cape traverse full viewport width in ~3 viewport-height scrolls
              //const threeScreens = Math.max(1, window.innerHeight * 3);
              const progress = Math.min(1, Math.max(0, scrollY / maxScroll));
              const easedProgress = progress * progress * (3 - 2 * progress);
              const safetyMargin = 12; // avoid clipping on the far right
              const travel = Math.max(0, viewportWidth - CAPE_WIDTH_PX - safetyMargin);
              return easedProgress * travel;
            })()}px)`,
            transition: 'none',
            willChange: 'transform'
          }}
        >
          <img 
            src="/lovable-uploads/94242e31-6ecc-4921-b879-54311700febf.png" 
            alt="Flowing Cape" 
            className="w-48 h-36 object-contain"
            style={{
              transform: `scaleX(${scrollDirection === 'down' ? 1 : -1}) rotate(${scrollDirection === 'down' ? Math.min(scrollVelocity * 2, 8) : -Math.min(scrollVelocity * 2, 8)}deg)`,
              transition: 'transform 0.3s ease-out',
              filter: `drop-shadow(0 4px 16px rgba(220, 38, 127, ${isScrolling ? '0.9' : '0.5'})) brightness(${isScrolling ? '1.3' : '1'})`,
              animation: 'floating 3s ease-in-out infinite'
            }}
          />
        </div>
      </div>
    </div>
  );
}
