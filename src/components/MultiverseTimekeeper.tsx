import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Rocket, Zap, Globe } from 'lucide-react';
import { EarthTime } from '@/components/time/EarthTime';
import { GalacticTime } from '@/components/time/GalacticTime';
import { CosmicEvents } from '@/components/events/CosmicEvents';
import { WormholeMode } from '@/components/wormhole/WormholeMode';

export function MultiverseTimekeeper() {
  const [activeTab, setActiveTab] = useState("now");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Mars Sol time
  const calculateMarsSol = (earthTime: Date) => {
    const marsSecondsPerDay = 88775.244;
    const earthSecondsPerDay = 86400;
    const ratio = marsSecondsPerDay / earthSecondsPerDay;
    
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
      time: `${marsHours.toString().padStart(2, '0')}:${marsMinutes.toString().padStart(2, '0')}`
    };
  };

  // Calculate Asgard time (1.5x Earth time flow)
  const calculateAsgardTime = (earthTime: Date) => {
    const asgardSeconds = earthTime.getSeconds() * 1.5;
    const asgardMinutes = earthTime.getMinutes() + Math.floor(asgardSeconds / 60);
    const asgardHours = (earthTime.getHours() + Math.floor(asgardMinutes / 60)) % 24;
    
    const finalMinutes = asgardMinutes % 60;
    const finalSeconds = Math.floor(asgardSeconds % 60);
    
    return `${asgardHours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
  };

  const formatEarthTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const marsSol = calculateMarsSol(currentTime);
  const asgardTime = calculateAsgardTime(currentTime);
  const earthTime = formatEarthTime(currentTime);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0">
        {/* Stars */}
        <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full animate-pulse opacity-80"></div>
        <div className="absolute top-32 right-40 w-0.5 h-0.5 bg-cyan-300 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-64 left-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute bottom-40 right-20 w-0.5 h-0.5 bg-pink-300 rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
        
        {/* Nebula effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-orbitron font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 tracking-wider">
            MULTIVERSE TIMEKEEPER
          </h1>
        </header>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-cyan-500/30">
            <button 
              onClick={() => setActiveTab("now")}
              className={`px-6 py-2 rounded-full font-orbitron font-bold text-sm transition-all ${
                activeTab === "now" 
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50" 
                  : "text-gray-400 hover:text-cyan-300"
              }`}
            >
              NOW
            </button>
            <button 
              onClick={() => setActiveTab("anton")}
              className={`px-6 py-2 rounded-full font-orbitron font-bold text-sm transition-all ${
                activeTab === "anton" 
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/50" 
                  : "text-gray-400 hover:text-purple-300"
              }`}
            >
              ANTON
            </button>
            <button 
              onClick={() => setActiveTab("galactic")}
              className={`px-6 py-2 rounded-full font-orbitron font-bold text-sm transition-all ${
                activeTab === "galactic" 
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/50" 
                  : "text-gray-400 hover:text-pink-300"
              }`}
            >
              GALACTIC
            </button>
            <button 
              onClick={() => setActiveTab("events")}
              className={`px-6 py-2 rounded-full font-orbitron font-bold text-sm transition-all ${
                activeTab === "events" 
                  ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50" 
                  : "text-gray-400 hover:text-yellow-300"
              }`}
            >
              EVENTS
            </button>
            <button 
              onClick={() => setActiveTab("wormhole")}
              className={`px-6 py-2 rounded-full font-orbitron font-bold text-sm transition-all ${
                activeTab === "wormhole" 
                  ? "bg-orange-500/20 text-orange-300 border border-orange-500/50" 
                  : "text-gray-400 hover:text-orange-300"
              }`}
            >
              WORMHOLE
            </button>
          </div>
        </div>

        {/* Main Time Display Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Earth Time Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 backdrop-blur-md border-2 border-cyan-500/50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-orbitron font-bold text-cyan-300 mb-4">EARTH</h3>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30"></div>
                <div className="absolute inset-2 rounded-full border-2 border-cyan-400/50"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-cyan-600/30 backdrop-blur-sm flex items-center justify-center time-circle">
                  <div className="text-4xl font-orbitron font-black text-cyan-300 tracking-wider enhanced-glow-cyan">
                    {earthTime}
                  </div>
                </div>
                {/* Orbital rings */}
                <div className="absolute -inset-4 rounded-full border border-cyan-500/20 animate-spin" style={{animationDuration: '20s'}}></div>
                <div className="absolute -inset-8 rounded-full border border-cyan-400/10 animate-spin" style={{animationDuration: '30s', animationDirection: 'reverse'}}></div>
              </div>
              <div className="text-cyan-300 font-orbitron text-sm">Asia/Calcutta</div>
            </div>
          </div>

          {/* Mars Time Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-500/20 to-orange-600/30 backdrop-blur-md border-2 border-red-500/50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-orbitron font-bold text-red-300 mb-4">MARS</h3>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-red-500/30"></div>
                <div className="absolute inset-2 rounded-full border-2 border-red-400/50"></div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500/20 to-orange-600/30 backdrop-blur-sm flex items-center justify-center mars-circle">
                  <div className="text-4xl font-orbitron font-black text-red-300 tracking-wider enhanced-glow-red">
                    {marsSol.time}
                  </div>
                </div>
                {/* Orbital rings */}
                <div className="absolute -inset-4 rounded-full border border-red-500/20 animate-spin" style={{animationDuration: '25s'}}></div>
                <div className="absolute -inset-8 rounded-full border border-orange-400/10 animate-spin" style={{animationDuration: '35s', animationDirection: 'reverse'}}></div>
              </div>
              <div className="text-red-300 font-orbitron text-sm">Sol {marsSol.sol} • Martian Calendar</div>
            </div>
          </div>

          {/* Asgard Time Card */}
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500/20 to-amber-600/30 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-orbitron font-bold text-yellow-300 mb-4">ASGARD</h3>
              <div className="relative w-48 h-48 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-yellow-500/30"></div>
                <div className="absolute inset-2 rounded-full border-2 border-yellow-400/50"></div>
                {/* Runic symbols around the circle */}
                <div className="absolute inset-0 text-yellow-400/60 text-xs font-orbitron tracking-widest">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">ᚠ</div>
                  <div className="absolute top-8 right-4">ᚢ</div>
                  <div className="absolute top-1/2 right-2 transform -translate-y-1/2">ᚦ</div>
                  <div className="absolute bottom-8 right-4">ᚨ</div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">ᚱ</div>
                  <div className="absolute bottom-8 left-4">ᚲ</div>
                  <div className="absolute top-1/2 left-2 transform -translate-y-1/2">ᚷ</div>
                  <div className="absolute top-8 left-4">ᚹ</div>
                </div>
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/30 backdrop-blur-sm flex items-center justify-center asgard-circle">
                  <div className="text-4xl font-orbitron font-black text-yellow-300 tracking-wider enhanced-glow-gold">
                    {asgardTime}
                  </div>
                </div>
                {/* Orbital rings */}
                <div className="absolute -inset-4 rounded-full border border-yellow-500/20 animate-spin" style={{animationDuration: '15s'}}></div>
                <div className="absolute -inset-8 rounded-full border border-amber-400/10 animate-spin" style={{animationDuration: '40s', animationDirection: 'reverse'}}></div>
              </div>
              <div className="text-yellow-300 font-orbitron text-sm">Realm of the Gods</div>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="mb-8">
          <h2 className="text-2xl font-orbitron font-bold text-center text-gray-300 mb-6 tracking-wider">DASHBOARD PANELS</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* PALMS */}
            <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 text-center hover:border-cyan-400/50 transition-all">
              <div className="text-cyan-300 font-orbitron text-sm font-bold mb-2">PALMS</div>
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-blue-600 text-xs font-black">N</div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs font-bold">esa</div>
                </div>
              </div>
            </div>

            {/* GONTRIDS */}
            <div className="bg-black/40 backdrop-blur-md border border-blue-500/30 rounded-lg p-4 text-center hover:border-blue-400/50 transition-all">
              <div className="text-blue-300 font-orbitron text-sm font-bold mb-2">GONTRIDS</div>
              <div className="flex justify-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-xs font-bold">N</div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">esa</div>
              </div>
            </div>

            {/* ORBITRON */}
            <div className="bg-black/40 backdrop-blur-md border border-gray-500/30 rounded-lg p-4 text-center hover:border-gray-400/50 transition-all">
              <div className="text-gray-300 font-orbitron text-sm font-bold mb-2">ORBITRON</div>
              <div className="text-2xl font-orbitron font-black text-white mb-1">JAXS</div>
              <div className="text-gray-400 text-xs">45TA3</div>
            </div>

            {/* MARUNS */}
            <div className="bg-black/40 backdrop-blur-md border border-gray-500/30 rounded-lg p-4 text-center hover:border-gray-400/50 transition-all">
              <div className="text-gray-300 font-orbitron text-sm font-bold mb-2">MARUNS</div>
              <div className="text-2xl font-orbitron font-black text-white mb-1">49.93</div>
              <div className="text-gray-400 text-xs">7EM</div>
            </div>

            {/* Circular Panel */}
            <div className="bg-black/40 backdrop-blur-md border border-yellow-500/30 rounded-lg p-4 text-center hover:border-yellow-400/50 transition-all">
              <div className="w-16 h-16 mx-auto border-2 border-yellow-500/50 rounded-full flex items-center justify-center relative">
                <div className="w-8 h-8 border border-yellow-400/70 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20"></div>
                <div className="absolute inset-0 rounded-full animate-spin" style={{animationDuration: '10s'}}>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
            </div>

            {/* REALMS */}
            <div className="bg-black/40 backdrop-blur-md border border-gray-500/30 rounded-lg p-4 text-center hover:border-gray-400/50 transition-all">
              <div className="text-gray-300 font-orbitron text-sm font-bold mb-2">REALMS</div>
              <div className="text-xl font-orbitron font-black text-white mb-1">SPACEX</div>
            </div>

            {/* ORBITON */}
            <div className="bg-black/40 backdrop-blur-md border border-gray-500/30 rounded-lg p-4 text-center hover:border-gray-400/50 transition-all">
              <div className="text-gray-300 font-orbitron text-sm font-bold mb-2">ORBITON</div>
              <div className="text-xl font-orbitron font-black text-white mb-1">JAXA</div>
              <div className="text-gray-400 text-xs">50M</div>
            </div>

            {/* RAJDHANI */}
            <div className="bg-black/40 backdrop-blur-md border border-gray-500/30 rounded-lg p-4 text-center hover:border-gray-400/50 transition-all">
              <div className="text-gray-300 font-orbitron text-sm font-bold mb-2">RAJDHANI</div>
              <div className="text-xl font-orbitron font-black text-white mb-1">SPACEX</div>
              <div className="text-gray-400 text-xs">40TA3</div>
            </div>

            {/* REALAND */}
            <div className="bg-black/40 backdrop-blur-md border border-gray-500/30 rounded-lg p-4 text-center hover:border-gray-400/50 transition-all">
              <div className="text-gray-300 font-orbitron text-sm font-bold mb-2">REALAND</div>
              <div className="text-xl font-orbitron font-black text-white mb-1">44598</div>
              <div className="text-gray-400 text-xs">7EM</div>
            </div>

            {/* MARVEL Panel */}
            <div className="bg-black/40 backdrop-blur-md border border-red-500/30 rounded-lg p-4 text-center hover:border-red-400/50 transition-all">
              <div className="text-red-400 font-orbitron text-xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">MARVEL</div>
            </div>
          </div>
        </div>

        {/* Tab Contents */}
        {activeTab === "now" && (
          <div className="space-y-6">
            <EarthTime />
          </div>
        )}

        {activeTab === "anton" && (
          <div className="space-y-6">
            <div className="text-center text-purple-300 font-orbitron">ANTON MODE - Advanced Navigation</div>
          </div>
        )}

        {activeTab === "galactic" && (
          <div className="space-y-6">
            <GalacticTime />
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-6">
            <CosmicEvents />
          </div>
        )}

        {activeTab === "wormhole" && (
          <div className="space-y-6 wormhole-bg p-6 rounded-lg">
            <WormholeMode />
          </div>
        )}
      </div>
    </div>
  );
}
