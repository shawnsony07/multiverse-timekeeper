import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Orbit, Stars, Plus, Save, Trash2, Rocket, Moon, Sun, Telescope } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { exoplanetApi, type ExoplanetData } from '@/services/api';

export function GalacticTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [savedClocks, setSavedClocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exoplanets, setExoplanets] = useState<ExoplanetData[]>([]);
  const [exoplanetsLoading, setExoplanetsLoading] = useState(true);
  const [exoplanetStats, setExoplanetStats] = useState<any>(null);
  const { user } = useAuth();
  
  // Simple save/delete functions that use local storage as fallback
  const saveClock = async (planet: string, timeFormat: string = '24h', name?: string) => {
    if (!user) return false;
    
    try {
      const newClock = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        planet,
        time_format: timeFormat,
        name: name || `${planet} Clock`,
        created_at: new Date().toISOString(),
        user_id: user.id
      };
      
      const storageKey = 'multiverse-galactic-clocks';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Check if this clock already exists for this user
      const existingClock = existing.find((clock: any) => 
        clock.user_id === user.id && 
        clock.planet === planet && 
        clock.name === newClock.name
      );
      
      if (existingClock) {
        console.log('Clock already exists for this user and location');
        return false;
      }
      
      const updated = [...existing, newClock];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // Update local state with user's clocks only
      const userClocks = updated.filter((clock: any) => clock.user_id === user.id);
      setSavedClocks(userClocks);
      
      console.log(`Saved galactic clock for user ${user.id}:`, newClock);
      return true;
    } catch (error) {
      console.error('Error saving clock:', error);
      return false;
    }
  };
  
  const deleteClock = async (clockId: string) => {
    if (!user) return false;
    
    try {
      const storageKey = 'multiverse-galactic-clocks';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
      
      // Only allow deleting clocks owned by current user
      const clockToDelete = existing.find((clock: any) => 
        clock.id === clockId && clock.user_id === user.id
      );
      
      if (!clockToDelete) {
        console.log('Clock not found or not owned by current user');
        return false;
      }
      
      const updated = existing.filter((clock: any) => clock.id !== clockId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // Update local state with user's clocks only
      const userClocks = updated.filter((clock: any) => clock.user_id === user.id);
      setSavedClocks(userClocks);
      
      console.log(`Deleted galactic clock ${clockId} for user ${user.id}`);
      return true;
    } catch (error) {
      console.error('Error deleting clock:', error);
      return false;
    }
  };
  
  // Load exoplanet data from NASA Exoplanet Archive API
  useEffect(() => {
    const fetchExoplanets = async () => {
      try {
        setExoplanetsLoading(true);
        const [exoplanetData, stats] = await Promise.all([
          exoplanetApi.getExoplanets(15), // Get top 15 exoplanets
          exoplanetApi.getStats()
        ]);
        setExoplanets(exoplanetData);
        setExoplanetStats(stats);
      } catch (error) {
        console.error('Failed to load exoplanet data:', error);
      } finally {
        setExoplanetsLoading(false);
      }
    };
    
    fetchExoplanets();
  }, []);

  // Load saved clocks on component mount and when user changes
  useEffect(() => {
    const loadUserClocks = () => {
      if (user) {
        try {
          const storageKey = 'multiverse-galactic-clocks';
          const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
          const userClocks = existing.filter((clock: any) => clock.user_id === user.id);
          setSavedClocks(userClocks);
          console.log(`Loaded ${userClocks.length} galactic clocks for user ${user.id}:`, userClocks);
        } catch (error) {
          console.error('Error loading galactic clocks:', error);
          setSavedClocks([]);
        }
      } else {
        setSavedClocks([]);
        console.log('No user logged in, cleared saved galactic clocks');
      }
    };
    
    loadUserClocks();
  }, [user]);
  
  const clocks = savedClocks;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Convert real exoplanet data to galactic location format
  const exoplanetsAsGalacticLocations = exoplanets.map(exoplanet => ({
    id: exoplanet.id,
    name: exoplanet.name,
    category: 'Exoplanet',
    dayLength: exoplanet.estimatedDayLength || 24, // hours
    yearLength: exoplanet.orbitalPeriod, // Earth days
    description: exoplanet.description,
    icon: exoplanet.icon,
    color: exoplanet.color,
    type: 'real' as const,
    hostStar: exoplanet.hostStar,
    distanceFromEarth: exoplanet.distanceFromEarth,
    habitableZone: exoplanet.habitableZone,
    discoveryYear: exoplanet.discoveryYear,
    temperature: exoplanet.temperature
  }));

  // Comprehensive galactic locations database (hardcoded + real exoplanets)
  const galacticLocations = [
    // Solar System Planets
    {
      id: 'mercury',
      name: 'Mercury',
      category: 'Planet',
      dayLength: 1407.6, // hours
      yearLength: 88, // Earth days
      description: 'Closest planet to the Sun',
      icon: '🌡️',
      color: 'text-orange-400',
      type: 'real'
    },
    {
      id: 'venus',
      name: 'Venus',
      category: 'Planet',
      dayLength: 5832.5, // hours (retrograde rotation)
      yearLength: 225, // Earth days
      description: 'Hottest planet in our solar system',
      icon: '🌋',
      color: 'text-yellow-400',
      type: 'real'
    },
    {
      id: 'mars',
      name: 'Mars',
      category: 'Planet',
      dayLength: 24.6597, // hours (1 Sol)
      yearLength: 687, // Earth days
      description: 'The Red Planet',
      icon: '🔴',
      color: 'text-red-400',
      type: 'real'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      category: 'Planet',
      dayLength: 9.9, // hours
      yearLength: 4333, // Earth days
      description: 'Largest planet in our solar system',
      icon: '🧡',
      color: 'text-orange-500',
      type: 'real'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      category: 'Planet',
      dayLength: 10.7, // hours
      yearLength: 10759, // Earth days
      description: 'The ringed planet',
      icon: '🧨',
      color: 'text-amber-400',
      type: 'real'
    },
    {
      id: 'uranus',
      name: 'Uranus',
      category: 'Planet',
      dayLength: 17.2, // hours
      yearLength: 30687, // Earth days
      description: 'Ice giant with extreme tilt',
      icon: '💵',
      color: 'text-cyan-400',
      type: 'real'
    },
    {
      id: 'neptune',
      name: 'Neptune',
      category: 'Planet',
      dayLength: 16.1, // hours
      yearLength: 60190, // Earth days
      description: 'Windiest planet',
      icon: '💵',
      color: 'text-blue-500',
      type: 'real'
    },
    // Major Moons
    {
      id: 'luna',
      name: 'Luna (Earth\'s Moon)',
      category: 'Moon',
      dayLength: 708.7, // hours (tidally locked)
      yearLength: 27.3, // Earth days (orbital period)
      description: 'Earth\'s natural satellite',
      icon: '🌙',
      color: 'text-gray-300',
      type: 'real'
    },
    {
      id: 'io',
      name: 'Io',
      category: 'Moon',
      dayLength: 42.5, // hours (tidally locked)
      yearLength: 1.77, // Earth days
      description: 'Most volcanically active body',
      icon: '🌋',
      color: 'text-yellow-500',
      type: 'real'
    },
    {
      id: 'europa',
      name: 'Europa',
      category: 'Moon',
      dayLength: 85.2, // hours (tidally locked)
      yearLength: 3.55, // Earth days
      description: 'Icy moon with subsurface ocean',
      icon: '❄️',
      color: 'text-blue-300',
      type: 'real'
    },
    {
      id: 'titan',
      name: 'Titan',
      category: 'Moon',
      dayLength: 382.7, // hours (tidally locked)
      yearLength: 15.95, // Earth days
      description: 'Saturn\'s largest moon with atmosphere',
      icon: '🌋',
      color: 'text-orange-300',
      type: 'real'
    },
    // Exoplanets
    {
      id: 'proxima-b',
      name: 'Proxima Centauri b',
      category: 'Exoplanet',
      dayLength: 264, // hours (estimated, tidally locked)
      yearLength: 11.2, // Earth days
      description: 'Nearest potentially habitable exoplanet',
      icon: '🌍',
      color: 'text-green-400',
      type: 'real'
    },
    {
      id: 'kepler-442b',
      name: 'Kepler-442b',
      category: 'Exoplanet',
      dayLength: 28.8, // hours (estimated)
      yearLength: 112.3, // Earth days
      description: 'Super-Earth in habitable zone',
      icon: '🌍',
      color: 'text-emerald-400',
      type: 'real'
    },
    {
      id: 'trappist-1e',
      name: 'TRAPPIST-1e',
      category: 'Exoplanet',
      dayLength: 148.8, // hours (estimated, tidally locked)
      yearLength: 6.1, // Earth days
      description: 'Most Earth-like of TRAPPIST system',
      icon: '🌍',
      color: 'text-blue-400',
      type: 'real'
    },
    // Fictional Locations - Star Wars
    {
      id: 'tatooine',
      name: 'Tatooine',
      category: 'Fictional',
      dayLength: 23, // hours
      yearLength: 304, // local days
      description: 'Desert planet with twin suns',
      icon: '🏜️',
      color: 'text-yellow-500',
      type: 'fictional',
      universe: 'Star Wars'
    },
    {
      id: 'coruscant',
      name: 'Coruscant',
      category: 'Fictional',
      dayLength: 24, // hours
      yearLength: 368, // local days
      description: 'Galactic capital city-planet',
      icon: '🌆',
      color: 'text-blue-300',
      type: 'fictional',
      universe: 'Star Wars'
    },
    {
      id: 'hoth',
      name: 'Hoth',
      category: 'Fictional',
      dayLength: 23, // hours
      yearLength: 549, // local days
      description: 'Frozen ice planet',
      icon: '❄️',
      color: 'text-cyan-300',
      type: 'fictional',
      universe: 'Star Wars'
    },
    // Fictional Locations - Star Trek
    {
      id: 'vulcan',
      name: 'Vulcan',
      category: 'Fictional',
      dayLength: 25.39, // hours
      yearLength: 1.5, // Earth years equivalent
      description: 'Spock\'s desert homeworld',
      icon: '🖖',
      color: 'text-red-300',
      type: 'fictional',
      universe: 'Star Trek'
    },
    {
      id: 'risa',
      name: 'Risa',
      category: 'Fictional',
      dayLength: 25, // hours
      yearLength: 1.2, // Earth years equivalent
      description: 'Pleasure planet resort world',
      icon: '🌴',
      color: 'text-green-300',
      type: 'fictional',
      universe: 'Star Trek'
    },
    // Other Fictional Universes
    {
      id: 'arrakis',
      name: 'Arrakis (Dune)',
      category: 'Fictional',
      dayLength: 31.27, // hours
      yearLength: 2.15, // Earth years
      description: 'Desert planet, source of spice',
      icon: '🏜️',
      color: 'text-orange-400',
      type: 'fictional',
      universe: 'Dune'
    },
    {
      id: 'gallifrey',
      name: 'Gallifrey',
      category: 'Fictional',
      dayLength: 28, // hours
      yearLength: 1.8, // Earth years equivalent
      description: 'Homeworld of the Time Lords',
      icon: '⏰',
      color: 'text-yellow-400',
      type: 'fictional',
      universe: 'Doctor Who'
    },
    {
      id: 'pandora',
      name: 'Pandora',
      category: 'Fictional',
      dayLength: 26, // hours
      yearLength: 1.4, // Earth years equivalent
      description: 'Lush moon with floating mountains',
      icon: '🌿',
      color: 'text-blue-400',
      type: 'fictional',
      universe: 'Avatar'
    }
  ].concat(exoplanetsAsGalacticLocations); // Merge with real exoplanet data

  // Universal galactic time calculator
  const calculateGalacticTime = (location: any, earthTime: Date) => {
    const earthSecondsPerDay = 86400;
    const locationSecondsPerDay = location.dayLength * 3600; // Convert hours to seconds
    const ratio = locationSecondsPerDay / earthSecondsPerDay;
    
    // Use a common epoch for all calculations
    const epoch = new Date('2000-01-01T00:00:00Z');
    const earthSecondsSinceEpoch = (earthTime.getTime() - epoch.getTime()) / 1000;
    const locationSecondsSinceEpoch = earthSecondsSinceEpoch / ratio;
    
    const locationDays = Math.floor(locationSecondsSinceEpoch / locationSecondsPerDay);
    const locationSecondsToday = locationSecondsSinceEpoch % locationSecondsPerDay;
    
    const hours = Math.floor(locationSecondsToday / 3600);
    const minutes = Math.floor((locationSecondsToday % 3600) / 60);
    const seconds = Math.floor(locationSecondsToday % 60);
    
    // Calculate local year/day within year for orbital period
    const earthDaysSinceEpoch = earthSecondsSinceEpoch / earthSecondsPerDay;
    const orbitalPeriod = location.yearLength; // in Earth days
    const localYear = Math.floor(earthDaysSinceEpoch / orbitalPeriod);
    const dayInYear = Math.floor(earthDaysSinceEpoch % orbitalPeriod);
    
    return {
      localDay: locationDays,
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      localYear,
      dayInYear,
      location
    };
  };

  // Helper functions for galactic clock management
  const getDefaultGalacticClocks = () => {
    return [
      galacticLocations.find(loc => loc.id === 'mars')!, // Mars (The Red Planet)
      galacticLocations.find(loc => loc.id === 'luna')!, // Earth's Moon
      galacticLocations.find(loc => loc.id === 'europa')!, // Europa
      galacticLocations.find(loc => loc.id === 'proxima-b')! // Proxima Centauri b
    ];
  };

  const getSavedGalacticClockId = (location: any) => {
    return clocks.find(clock => 
      clock.planet === location.id || 
      clock.name === location.name
    )?.id;
  };

  const handleSaveGalacticClock = async () => {
    if (!selectedLocation || !user) return;
    
    const location = galacticLocations.find(loc => loc.id === selectedLocation);
    if (location) {
      const success = await saveClock(location.id, 'galactic', location.name);
      if (success) {
        setIsDialogOpen(false);
        setSelectedLocation('');
      }
    }
  };

  const handleSaveDefaultClock = async (location: any) => {
    if (!user) return;
    await saveClock(location.id, 'galactic', location.name);
  };

  const handleDeleteGalacticClock = async (clockId: string) => {
    await deleteClock(clockId);
  };

  // Combine default and saved galactic clocks
  const displayGalacticClocks = (() => {
    if (!user) {
      return getDefaultGalacticClocks();
    }

    // Convert saved galactic clocks to location objects
    const savedGalacticClocks = clocks
      .filter(clock => clock.time_format === 'galactic')
      .map(clock => {
        const location = galacticLocations.find(loc => 
          loc.id === clock.planet || loc.name === clock.name
        );
        return location ? { ...location, savedClockId: clock.id } : null;
      })
      .filter(Boolean);

    // Filter out defaults that are already saved
    const filteredDefaults = getDefaultGalacticClocks().filter(defaultClock => {
      return !savedGalacticClocks.some(savedClock => 
        savedClock?.id === defaultClock.id
      );
    });

    return [...savedGalacticClocks, ...filteredDefaults];
  })();


  return (
    <div className="space-y-8">
      {/* Main Galactic Time Display - Mars as Primary */}
      <Card className="hud-panel p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
            <Stars className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-3xl font-orbitron font-bold text-purple-400">GALACTIC TIME DISPLAY</h2>
        </div>
        
        {(() => {
          const marsTime = calculateGalacticTime(galacticLocations.find(loc => loc.id === 'mars')!, currentTime);
          return (
            <div className="space-y-4">
              <div className="text-5xl md:text-7xl font-orbitron font-black text-red-400 tracking-wider time-display">{marsTime.time}</div>
              <div className="text-xl text-foreground-secondary font-orbitron">
                Sol {marsTime.localDay} • Year {marsTime.localYear}
              </div>
              <div className="text-sm text-blue-400">
                Mars Standard Time - 1 Sol = 24h 39m 35s Earth time
              </div>
            </div>
          );
        })()}
      </Card>

      {/* User Controls */}
      {user && (
        <Card className="hud-panel p-4 text-center space-y-3">
          <p className="text-sm text-foreground-secondary font-orbitron">
            {clocks.filter(c => c.time_format === 'galactic').length > 0 ? 
              'Your saved galactic locations are displayed below' : 
              'Save your preferred galactic locations using the buttons below'}
          </p>
          
          {/* Add More Locations Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="font-orbitron text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Galactic Locations
              </Button>
            </DialogTrigger>
            <DialogContent className="hud-panel border-purple-400/20 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-purple-400 font-orbitron">Add Galactic Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a planet, moon, exoplanet, or fictional world" />
                  </SelectTrigger>
                  <SelectContent className="hud-panel border-purple-400/20 max-h-80">
                    {/* Group by category */}
                    <div className="p-2">
                      <div className="text-xs font-semibold text-blue-400 mb-2">🌍 PLANETS</div>
                      {galacticLocations.filter(loc => loc.category === 'Planet').map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <span>{location.icon}</span>
                            <span>{location.name}</span>
                            <span className="text-xs text-gray-400">({location.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <div className="text-xs font-semibold text-gray-300 mt-4 mb-2">🌙 MOONS</div>
                      {galacticLocations.filter(loc => loc.category === 'Moon').map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <span>{location.icon}</span>
                            <span>{location.name}</span>
                            <span className="text-xs text-gray-400">({location.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <div className="text-xs font-semibold text-green-400 mt-4 mb-2">🌍 EXOPLANETS</div>
                      {galacticLocations.filter(loc => loc.category === 'Exoplanet').map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <span>{location.icon}</span>
                            <span>{location.name}</span>
                            <span className="text-xs text-gray-400">({location.description})</span>
                          </div>
                        </SelectItem>
                      ))}
                      
                      <div className="text-xs font-semibold text-yellow-400 mt-4 mb-2">🎆 FICTIONAL WORLDS</div>
                      {galacticLocations.filter(loc => loc.category === 'Fictional').map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <span>{location.icon}</span>
                            <span>{location.name}</span>
                            {location.universe && (
                              <span className="text-xs text-yellow-300">({location.universe})</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
                
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setSelectedLocation('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleSaveGalacticClock}
                    disabled={!selectedLocation || loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save Location
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Card>
      )}

      {/* Galactic Clocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayGalacticClocks.map((location) => {
          if (!location) return null;
          
          const galacticTime = calculateGalacticTime(location, currentTime);
          const savedClockId = getSavedGalacticClockId(location);
          const isFromDefaults = !location.savedClockId;
          
          return (
            <Card key={location.savedClockId ? `saved-${location.savedClockId}` : `default-${location.id}`} 
                  className="hud-panel p-4 hover:border-purple-400/50 transition-all">
              <div className="text-center space-y-3">
                {/* Header */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{location.icon}</span>
                  <div className={`text-sm font-orbitron font-bold ${location.color}`}>
                    {location.category.toUpperCase()}
                  </div>
                </div>
                
                {/* Time Display */}
                <div className={`text-2xl font-orbitron font-black ${location.color}`}>
                  {galacticTime.time}
                </div>
                
                {/* Location Name */}
                <div className="text-xs font-bold text-white">
                  {location.name}
                </div>
                
                {/* Description & Universe */}
                <div className="text-xs text-foreground-secondary">
                  {location.description}
                  {location.universe && (
                    <div className="text-yellow-400 mt-1">{location.universe}</div>
                  )}
                  {/* Additional exoplanet data */}
                  {location.category === 'Exoplanet' && (
                    <div className="mt-2 space-y-1">
                      {location.hostStar && (
                        <div className="text-orange-400">⭐ {location.hostStar}</div>
                      )}
                      {location.distanceFromEarth && (
                        <div className="text-cyan-400">📏 {location.distanceFromEarth.toFixed(1)} ly away</div>
                      )}
                      {location.habitableZone && (
                        <div className="text-green-400">🌱 Potentially Habitable</div>
                      )}
                      {location.discoveryYear && (
                        <div className="text-blue-400">🔭 Discovered {location.discoveryYear}</div>
                      )}
                      {location.temperature && (
                        <div className="text-red-400">🌡️ {location.temperature}K</div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Time Info */}
                <div className="text-xs text-blue-400">
                  {location.type === 'real' ? (
                    <div>
                      Local Day: {galacticTime.localDay} • Year: {galacticTime.localYear}
                      <br />
                      Day Length: {location.dayLength}h
                    </div>
                  ) : (
                    <div>
                      {location.universe} Time System
                      <br />
                      Day Length: {location.dayLength}h
                    </div>
                  )}
                </div>
                
                {/* Save/Delete Buttons */}
                {user && (
                  <div className="flex justify-center gap-1 mt-2">
                    {isFromDefaults && !savedClockId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveDefaultClock(location)}
                        disabled={loading}
                        className="text-xs px-2 py-1 h-6"
                      >
                        <Save className="w-3 h-3" />
                      </Button>
                    )}
                    {(savedClockId || location.savedClockId) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteGalacticClock(location.savedClockId || savedClockId)}
                        disabled={loading}
                        className="text-xs px-2 py-1 h-6 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* NASA Exoplanet Discovery Statistics */}
      {exoplanetStats && (
        <Card className="hud-panel p-6">
          <h3 className="text-xl font-orbitron font-bold text-green-400 mb-4 flex items-center justify-center gap-2">
            <Telescope className="w-6 h-6" />
            NASA EXOPLANET DISCOVERIES
            {exoplanetsLoading && <span className="text-xs">(Loading...)</span>}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-2">
              <div className="text-sm text-foreground-secondary font-orbitron">CONFIRMED PLANETS</div>
              <div className="text-lg font-bold text-green-400">
                {exoplanetStats.totalConfirmed?.toLocaleString() || '5,000+'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-foreground-secondary font-orbitron">RECENT DISCOVERIES</div>
              <div className="text-lg font-bold text-blue-400">
                {exoplanetStats.recentDiscoveries?.toLocaleString() || '100+'}
              </div>
              <div className="text-xs text-muted-foreground">Since 2023</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-foreground-secondary font-orbitron">HABITABLE ZONE</div>
              <div className="text-lg font-bold text-yellow-400">
                {exoplanetStats.habitableZonePlanets?.toLocaleString() || '50+'}
              </div>
              <div className="text-xs text-muted-foreground">Potentially habitable</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-foreground-secondary font-orbitron">LIVE EXOPLANETS</div>
              <div className="text-lg font-bold text-purple-400">{exoplanets.length}</div>
              <div className="text-xs text-muted-foreground">In time system</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Badge variant="secondary" className="text-xs">
              Updated: {new Date(exoplanetStats.lastUpdated).toLocaleDateString()}
            </Badge>
          </div>
        </Card>
      )}

      {/* Galactic Coordinates & Stats */}
      <Card className="hud-panel p-6">
        <h3 className="text-xl font-orbitron font-bold text-purple-400 mb-4 flex items-center justify-center gap-2">
          <span className="text-lg">🌌</span>
          GALACTIC STATUS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">ACTIVE LOCATIONS</div>
            <div className="text-lg font-bold text-green-400">{displayGalacticClocks.length}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">REAL WORLDS</div>
            <div className="text-lg font-bold text-blue-400">
              {displayGalacticClocks.filter(loc => loc?.type === 'real').length}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">FICTIONAL WORLDS</div>
            <div className="text-lg font-bold text-yellow-400">
              {displayGalacticClocks.filter(loc => loc?.type === 'fictional').length}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm text-foreground-secondary font-orbitron">GALACTIC RANGE</div>
            <div className="text-lg font-bold text-purple-400">26,000 LY</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
