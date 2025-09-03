import { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import { launchApi, type Launch } from '@/services/api';

export function MultiverseTimekeeper() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const upcomingLaunches = await launchApi.getUpcomingLaunches(1);
        setLaunches(upcomingLaunches);
      } catch (error) {
        console.error('Failed to fetch launches:', error);
      }
    };

    fetchLaunches();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateMarsSol = (earthTime: Date) => {
    const marsEpoch = new Date('2000-01-06T00:00:00.000Z');
    const earthDaysSinceEpoch = (earthTime.getTime() - marsEpoch.getTime()) / (1000 * 60 * 60 * 24);
    const marsSol = Math.floor(earthDaysSinceEpoch / 1.027);
    return marsSol;
  };

  const calculateWormholeTime = () => {
    const now = new Date();
    const fasterSpinMultiplier = 1.5;
    const adjustedHours = Math.floor((now.getHours() * fasterSpinMultiplier) % 24);
    const adjustedMinutes = Math.floor((now.getMinutes() * fasterSpinMultiplier) % 60);
    return `${adjustedHours.toString().padStart(2, '0')}:${adjustedMinutes.toString().padStart(2, '0')}`;
  };

  const getTimeUntilLaunch = (launchTime: string) => {
    const now = new Date();
    const launch = new Date(launchTime);
    const diff = launch.getTime() - now.getTime();
    
    if (diff < 0) return 'Launched';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `T-${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `T-${hours}h ${minutes}m`;
    return `T-${minutes}m`;
  };

  const getLocationName = () => {
    const parts = timezone.split('/');
    return parts[parts.length - 1].replace('_', ' ').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-orbitron font-black text-neon-orange mb-2 tracking-wider">
            MULTIVERSE
          </h1>
          <h2 className="text-4xl md:text-6xl font-orbitron font-black text-neon-orange tracking-wider">
            TIMEKEEPER
          </h2>
          <div className="h-1 bg-neon-orange mx-auto mt-4 w-full"></div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* NOW Section */}
          <div className="cosmic-panel p-6 text-center">
            <h3 className="text-neon-cyan font-orbitron font-bold text-lg mb-2 tracking-wider">
              NOW
            </h3>
            <div className="text-neon-orange text-4xl font-orbitron font-black mb-1">
              {formatTime(currentTime)}
            </div>
            <div className="text-neon-orange text-lg font-orbitron tracking-wider">
              {getLocationName()}
            </div>
          </div>

          {/* GALACTIC Section */}
          <div className="cosmic-panel p-6 text-center">
            <h3 className="text-neon-cyan font-orbitron font-bold text-lg mb-2 tracking-wider">
              GALACTIC
            </h3>
            <div className="text-neon-orange text-4xl font-orbitron font-black mb-1">
              SOL {calculateMarsSol(currentTime)}
            </div>
            <div className="text-neon-orange text-lg font-orbitron tracking-wider">
              MARS
            </div>
          </div>

          {/* EVENTS Section */}
          <div className="cosmic-panel p-6 text-center">
            <h3 className="text-neon-cyan font-orbitron font-bold text-lg mb-2 tracking-wider">
              EVENTS
            </h3>
            {launches.length > 0 ? (
              <>
                <div className="text-neon-orange text-2xl font-orbitron font-black mb-2">
                  {getTimeUntilLaunch(launches[0].net)}
                </div>
                <div className="text-neon-orange text-sm font-orbitron tracking-wider mb-2">
                  SPACEX LAUNCH
                </div>
                <Rocket className="w-8 h-8 text-neon-orange mx-auto" />
              </>
            ) : (
              <div className="text-neon-orange text-lg font-orbitron">
                NO SCHEDULED EVENTS
              </div>
            )}
          </div>

          {/* WORMHOLE Section */}
          <div className="cosmic-panel p-6 text-center relative">
            <h3 className="text-neon-cyan font-orbitron font-bold text-lg mb-2 tracking-wider">
              WORMHOLE
            </h3>
            <div className="relative">
              <div className="w-24 h-24 border-2 border-neon-cyan rounded-full mx-auto flex items-center justify-center mb-2">
                <div className="text-neon-cyan text-2xl font-orbitron font-black">
                  {calculateWormholeTime()}
                </div>
              </div>
              <div className="text-neon-cyan text-xs font-orbitron tracking-wider mb-1">
                IN A FASTER SPIN
              </div>
              <div className="text-neon-cyan text-sm font-orbitron tracking-wider">
                LOCAL
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border */}
        <div className="h-1 bg-neon-orange w-full"></div>
      </div>
    </div>
  );
}
