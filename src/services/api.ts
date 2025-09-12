import axios from 'axios';

// Launch Library API for rocket launches
const LAUNCH_API_BASE = 'https://ll.thespacedevs.com/2.2.0';

// Local server API base URL
const SERVER_API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export interface Launch {
  id: string;
  name: string;
  net: string; // launch time
  status: {
    name: string;
    description: string;
  };
  rocket: {
    configuration: {
      name: string;
      manufacturer: {
        name: string;
      };
    };
  };
  pad: {
    location: {
      name: string;
    };
  };
  mission?: {
    description: string;
  };
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  next?: string;
}

export const launchApi = {
  // Get upcoming launches
  async getUpcomingLaunches(limit: number = 10): Promise<Launch[]> {
    try {
      const response = await axios.get<ApiResponse<Launch>>(
        `${LAUNCH_API_BASE}/launch/upcoming/?limit=${limit}&format=json`
      );
      return response.data.results;
    } catch (error) {
      console.error('Failed to fetch upcoming launches:', error);
      // Return fallback data if API fails
      return getFallbackLaunches();
    }
  },

  // Get recent launches
  async getRecentLaunches(limit: number = 5): Promise<Launch[]> {
    try {
      const response = await axios.get<ApiResponse<Launch>>(
        `${LAUNCH_API_BASE}/launch/previous/?limit=${limit}&format=json`
      );
      return response.data.results;
    } catch (error) {
      console.error('Failed to fetch recent launches:', error);
      return [];
    }
  }
};

// TimeZone API service
export const timezoneApi = {
  // Get list of available timezones
  async getTimezones(): Promise<TimezoneListItem[]> {
    try {
      const response = await axios.get<TimezoneListItem[]>(
        `${SERVER_API_BASE}/api/timezones`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch timezones:', error);
      // Return fallback data if API fails
      return getFallbackTimezones();
    }
  },

  // Get detailed timezone information
  async getTimezoneInfo(zoneName: string): Promise<TimezoneInfo | null> {
    try {
      const response = await axios.get<TimezoneInfo>(
        `${SERVER_API_BASE}/api/timezone/${encodeURIComponent(zoneName)}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch timezone info for ${zoneName}:`, error);
      return null;
    }
  }
};

// Cosmic Events API service
export const cosmicEventsApi = {
  // Get cosmic events from NASA EONET
  async getCosmicEvents(limit: number = 20, days: number = 365): Promise<CosmicEvent[]> {
    try {
      const response = await axios.get<CosmicEvent[]>(
        `${SERVER_API_BASE}/api/cosmic-events?limit=${limit}&days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cosmic events:', error);
      // Return fallback data if API fails
      return getFallbackCosmicEvents();
    }
  },

  // Get events by category
  async getEventsByCategory(categoryId: number, limit: number = 20): Promise<CosmicEvent[]> {
    try {
      const response = await axios.get<CosmicEvent[]>(
        `${SERVER_API_BASE}/api/cosmic-events/category/${categoryId}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch events for category ${categoryId}:`, error);
      return [];
    }
  },

  // Get available event categories
  async getCategories() {
    try {
      const response = await axios.get(
        `${SERVER_API_BASE}/api/cosmic-events/categories`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event categories:', error);
      return [];
    }
  }
};

// Satellite tracking API service
export const satelliteApi = {
  // Get current ISS position
  async getISSPosition(): Promise<SatellitePosition> {
    try {
      const response = await axios.get<SatellitePosition>(
        `${SERVER_API_BASE}/api/satellites/iss`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ISS position:', error);
      return getFallbackISSPosition();
    }
  },

  // Get ISS pass predictions for user location
  async getISSPassPredictions(latitude: number, longitude: number, days: number = 10): Promise<SatellitePass[]> {
    try {
      const response = await axios.get<SatellitePass[]>(
        `${SERVER_API_BASE}/api/satellites/iss/passes?lat=${latitude}&lng=${longitude}&days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch ISS pass predictions:', error);
      return getFallbackPasses();
    }
  },

  // Get satellite information by NORAD ID
  async getSatelliteInfo(noradId: number): Promise<SatelliteInfo> {
    try {
      const response = await axios.get<SatelliteInfo>(
        `${SERVER_API_BASE}/api/satellites/info/${noradId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch satellite info for ${noradId}:`, error);
      return getFallbackSatelliteInfo();
    }
  },

  // Get popular satellites by category
  async getPopularSatellites(category: string = 'stations'): Promise<SatellitePosition[]> {
    try {
      const response = await axios.get<SatellitePosition[]>(
        `${SERVER_API_BASE}/api/satellites/popular?category=${category}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch popular satellites for category ${category}:`, error);
      return [getFallbackISSPosition()];
    }
  },

  // Get ISS position relative to user
  async getISSRelativeToUser(latitude: number, longitude: number): Promise<ISSRelativeInfo> {
    try {
      const response = await axios.get<ISSRelativeInfo>(
        `${SERVER_API_BASE}/api/satellites/iss/relative?lat=${latitude}&lng=${longitude}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get ISS relative to user:', error);
      return {
        issPosition: getFallbackISSPosition(),
        distanceFromUser: 1000,
        direction: 'Unknown'
      };
    }
  }
};

// Asteroid tracking API service
export const asteroidApi = {
  // Get asteroids approaching Earth today
  async getTodaysAsteroids(): Promise<AsteroidData[]> {
    try {
      const response = await axios.get<AsteroidData[]>(
        `${SERVER_API_BASE}/api/asteroids/today`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch today\'s asteroids:', error);
      return getFallbackAsteroids();
    }
  },

  // Get asteroids by date range
  async getAsteroidsByDateRange(startDate: string, endDate: string): Promise<AsteroidData[]> {
    try {
      const response = await axios.get<AsteroidData[]>(
        `${SERVER_API_BASE}/api/asteroids/range?start=${startDate}&end=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch asteroids by date range:', error);
      return getFallbackAsteroids();
    }
  },

  // Get specific asteroid by ID
  async getAsteroidById(asteroidId: string): Promise<AsteroidData | null> {
    try {
      const response = await axios.get<AsteroidData>(
        `${SERVER_API_BASE}/api/asteroids/${asteroidId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch asteroid ${asteroidId}:`, error);
      return null;
    }
  },

  // Get asteroid statistics
  async getAsteroidStats(): Promise<AsteroidStats> {
    try {
      const response = await axios.get<AsteroidStats>(
        `${SERVER_API_BASE}/api/asteroids/stats`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch asteroid statistics:', error);
      return getFallbackAsteroidStats();
    }
  },

  // Get potentially hazardous asteroids
  async getPotentiallyHazardousAsteroids(page: number = 0, size: number = 20): Promise<{
    asteroids: AsteroidData[];
    totalElements: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get(
        `${SERVER_API_BASE}/api/asteroids/hazardous?page=${page}&size=${size}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch potentially hazardous asteroids:', error);
      return {
        asteroids: getFallbackAsteroids(),
        totalElements: 1,
        totalPages: 1
      };
    }
  }
};

// Cosmic lore generator API service
export const cosmicLoreApi = {
  // Generate cosmic lore for a specific planet
  async generateLore(request: LoreGenerationRequest): Promise<CosmicLore> {
    try {
      const response = await axios.post<CosmicLore>(
        `${SERVER_API_BASE}/api/lore/generate`,
        request
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate cosmic lore:', error);
      return getFallbackLore(request.planetData.name, request.category);
    }
  },

  // Generate a complete lore set for a planet
  async generatePlanetLoreSet(planetData: any): Promise<CosmicLore[]> {
    try {
      const response = await axios.post<CosmicLore[]>(
        `${SERVER_API_BASE}/api/lore/generate-set`,
        { planetData }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate planet lore set:', error);
      return [
        getFallbackLore(planetData.name, 'description'),
        getFallbackLore(planetData.name, 'history'),
        getFallbackLore(planetData.name, 'environment')
      ];
    }
  },

  // Get lore recommendations for a planet
  async getRecommendations(planetData: any): Promise<LoreRecommendation[]> {
    try {
      const response = await axios.post<LoreRecommendation[]>(
        `${SERVER_API_BASE}/api/lore/recommendations`,
        { planetData }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get lore recommendations:', error);
      return [
        { category: 'description', reason: 'Essential overview of the planet' },
        { category: 'history', reason: 'Cosmic context and formation story' }
      ];
    }
  }
};

// Space weather API service
export const spaceWeatherApi = {
  // Get current space weather alerts
  async getAlerts(): Promise<SpaceWeatherAlert[]> {
    try {
      const response = await axios.get<SpaceWeatherAlert[]>(
        `${SERVER_API_BASE}/api/space-weather/alerts`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch space weather alerts:', error);
      return getFallbackSpaceWeatherAlerts();
    }
  },

  // Get current solar activity data
  async getSolarActivity(): Promise<SolarActivity> {
    try {
      const response = await axios.get<SolarActivity>(
        `${SERVER_API_BASE}/api/space-weather/solar-activity`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch solar activity:', error);
      return getFallbackSolarActivity();
    }
  },

  // Get aurora forecast
  async getAuroraForecast(): Promise<AuroraForecast[]> {
    try {
      const response = await axios.get<AuroraForecast[]>(
        `${SERVER_API_BASE}/api/space-weather/aurora-forecast`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch aurora forecast:', error);
      return getFallbackAuroraForecast();
    }
  }
};

// Exoplanet API service
export const exoplanetApi = {
  // Get confirmed exoplanets from NASA Exoplanet Archive
  async getExoplanets(limit: number = 20): Promise<ExoplanetData[]> {
    try {
      const response = await axios.get<ExoplanetData[]>(
        `${SERVER_API_BASE}/api/exoplanets?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exoplanets:', error);
      // Return fallback data if API fails
      return getFallbackExoplanets();
    }
  },

  // Search exoplanets by name or host star
  async searchExoplanets(searchTerm: string, limit: number = 10): Promise<ExoplanetData[]> {
    try {
      const response = await axios.get<ExoplanetData[]>(
        `${SERVER_API_BASE}/api/exoplanets/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to search exoplanets for "${searchTerm}":`, error);
      return [];
    }
  },

  // Get exoplanet discovery statistics
  async getStats() {
    try {
      const response = await axios.get(
        `${SERVER_API_BASE}/api/exoplanets/stats`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exoplanet statistics:', error);
      return {
        totalConfirmed: 5000,
        recentDiscoveries: 100,
        habitableZonePlanets: 50,
        lastUpdated: new Date().toISOString()
      };
    }
  }
};

// Fallback timezone data
function getFallbackTimezones(): TimezoneListItem[] {
  return [
    { zoneName: 'America/New_York', countryCode: 'US', countryName: 'United States', gmtOffset: -18000, abbreviation: 'EST', flag: '🇺🇸' },
    { zoneName: 'America/Los_Angeles', countryCode: 'US', countryName: 'United States', gmtOffset: -28800, abbreviation: 'PST', flag: '🇺🇸' },
    { zoneName: 'Europe/London', countryCode: 'GB', countryName: 'United Kingdom', gmtOffset: 0, abbreviation: 'GMT', flag: '🇬🇧' },
    { zoneName: 'Europe/Berlin', countryCode: 'DE', countryName: 'Germany', gmtOffset: 3600, abbreviation: 'CET', flag: '🇩🇪' },
    { zoneName: 'Europe/Paris', countryCode: 'FR', countryName: 'France', gmtOffset: 3600, abbreviation: 'CET', flag: '🇫🇷' },
    { zoneName: 'Asia/Tokyo', countryCode: 'JP', countryName: 'Japan', gmtOffset: 32400, abbreviation: 'JST', flag: '🇯🇵' },
    { zoneName: 'Australia/Sydney', countryCode: 'AU', countryName: 'Australia', gmtOffset: 36000, abbreviation: 'AEST', flag: '🇦🇺' },
    { zoneName: 'Asia/Kolkata', countryCode: 'IN', countryName: 'India', gmtOffset: 19800, abbreviation: 'IST', flag: '🇮🇳' },
    { zoneName: 'Asia/Shanghai', countryCode: 'CN', countryName: 'China', gmtOffset: 28800, abbreviation: 'CST', flag: '🇨🇳' },
    { zoneName: 'America/Sao_Paulo', countryCode: 'BR', countryName: 'Brazil', gmtOffset: -10800, abbreviation: 'BRT', flag: '🇧🇷' },
    { zoneName: 'Europe/Moscow', countryCode: 'RU', countryName: 'Russia', gmtOffset: 10800, abbreviation: 'MSK', flag: '🇷🇺' },
    { zoneName: 'America/Toronto', countryCode: 'CA', countryName: 'Canada', gmtOffset: -18000, abbreviation: 'EST', flag: '🇨🇦' },
    { zoneName: 'Asia/Seoul', countryCode: 'KR', countryName: 'South Korea', gmtOffset: 32400, abbreviation: 'KST', flag: '🇰🇷' },
    { zoneName: 'America/Mexico_City', countryCode: 'MX', countryName: 'Mexico', gmtOffset: -21600, abbreviation: 'CST', flag: '🇲🇽' },
    { zoneName: 'Europe/Rome', countryCode: 'IT', countryName: 'Italy', gmtOffset: 3600, abbreviation: 'CET', flag: '🇮🇹' },
    { zoneName: 'Europe/Madrid', countryCode: 'ES', countryName: 'Spain', gmtOffset: 3600, abbreviation: 'CET', flag: '🇪🇸' },
    { zoneName: 'Europe/Amsterdam', countryCode: 'NL', countryName: 'Netherlands', gmtOffset: 3600, abbreviation: 'CET', flag: '🇳🇱' },
    { zoneName: 'Asia/Singapore', countryCode: 'SG', countryName: 'Singapore', gmtOffset: 28800, abbreviation: 'SGT', flag: '🇸🇬' },
    { zoneName: 'Asia/Dubai', countryCode: 'AE', countryName: 'United Arab Emirates', gmtOffset: 14400, abbreviation: 'GST', flag: '🇦🇪' },
    { zoneName: 'Africa/Johannesburg', countryCode: 'ZA', countryName: 'South Africa', gmtOffset: 7200, abbreviation: 'SAST', flag: '🇿🇦' },
    { zoneName: 'Africa/Cairo', countryCode: 'EG', countryName: 'Egypt', gmtOffset: 7200, abbreviation: 'EET', flag: '🇪🇬' },
    { zoneName: 'Europe/Istanbul', countryCode: 'TR', countryName: 'Turkey', gmtOffset: 10800, abbreviation: 'TRT', flag: '🇹🇷' },
    { zoneName: 'Asia/Bangkok', countryCode: 'TH', countryName: 'Thailand', gmtOffset: 25200, abbreviation: 'ICT', flag: '🇹🇭' },
    { zoneName: 'America/Argentina/Buenos_Aires', countryCode: 'AR', countryName: 'Argentina', gmtOffset: -10800, abbreviation: 'ART', flag: '🇦🇷' },
    { zoneName: 'America/Santiago', countryCode: 'CL', countryName: 'Chile', gmtOffset: -10800, abbreviation: 'CLT', flag: '🇨🇱' }
  ];
}

// Fallback exoplanet data
function getFallbackExoplanets(): ExoplanetData[] {
  return [
    {
      id: 'proxima-b',
      name: 'Proxima Centauri b',
      hostStar: 'Proxima Centauri',
      discoveryYear: 2016,
      discoveryMethod: 'Radial Velocity',
      orbitalPeriod: 11.186,
      planetRadius: 1.1,
      planetMass: 1.27,
      distanceFromEarth: 4.24,
      habitableZone: true,
      estimatedDayLength: 264,
      temperature: 234,
      description: 'Closest potentially habitable exoplanet to Earth',
      icon: '🌍',
      color: 'text-green-400',
      type: 'exoplanet',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'kepler-442b',
      name: 'Kepler-442b',
      hostStar: 'Kepler-442',
      discoveryYear: 2015,
      discoveryMethod: 'Transit',
      orbitalPeriod: 112.3,
      planetRadius: 1.34,
      planetMass: 2.3,
      distanceFromEarth: 1206,
      habitableZone: true,
      estimatedDayLength: 28.8,
      temperature: 233,
      description: 'Super-Earth in the habitable zone',
      icon: '🌎',
      color: 'text-blue-400',
      type: 'exoplanet',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'trappist-1e',
      name: 'TRAPPIST-1e',
      hostStar: 'TRAPPIST-1',
      discoveryYear: 2017,
      discoveryMethod: 'Transit',
      orbitalPeriod: 6.1,
      planetRadius: 0.92,
      planetMass: 0.77,
      distanceFromEarth: 40.7,
      habitableZone: true,
      estimatedDayLength: 148.8,
      temperature: 251,
      description: 'One of seven Earth-sized planets in TRAPPIST-1 system',
      icon: '🌏',
      color: 'text-purple-400',
      type: 'exoplanet',
      lastUpdated: new Date().toISOString()
    }
  ];
}

// Fallback cosmic events data
function getFallbackCosmicEvents(): CosmicEvent[] {
  return [
    {
      id: 'geminids-2024',
      name: 'Geminids Meteor Shower',
      date: '2024-12-14T00:00:00Z',
      type: 'meteor_shower',
      description: 'One of the best meteor showers of the year, producing up to 120 meteors per hour.',
      visibility: 'Best viewed after midnight',
      source: 'NASA'
    },
    {
      id: 'lunar-eclipse-2025',
      name: 'Total Lunar Eclipse',
      date: '2025-03-14T07:00:00Z',
      type: 'eclipse',
      description: 'A total lunar eclipse visible from North and South America.',
      visibility: 'Visible from Americas, Europe, Africa',
      source: 'NASA'
    },
    {
      id: 'venus-jupiter-conjunction',
      name: 'Venus-Jupiter Conjunction',
      date: '2025-08-12T18:00:00Z',
      type: 'planetary_alignment',
      description: 'Venus and Jupiter will appear very close together in the evening sky.',
      visibility: 'Visible worldwide in evening sky',
      source: 'NASA'
    },
    {
      id: 'solar-maximum',
      name: 'Solar Maximum Period',
      date: '2025-01-01T00:00:00Z',
      type: 'solar_activity',
      description: 'Peak solar activity with increased auroral activity expected.',
      visibility: 'Aurora visible at lower latitudes',
      source: 'NASA'
    }
  ];
}

// Fallback data for when API is unavailable
function getFallbackLaunches(): Launch[] {
  return [
    {
      id: 'fallback-1',
      name: 'Artemis II',
      net: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
      status: {
        name: 'Go',
        description: 'Current T-0 confirmed by official or reliable sources.'
      },
      rocket: {
        configuration: {
          name: 'Space Launch System (SLS)',
          manufacturer: {
            name: 'NASA'
          }
        }
      },
      pad: {
        location: {
          name: 'Kennedy Space Center, FL, USA'
        }
      },
      mission: {
        description: 'Artemis II will be the first crewed mission of the Artemis program.'
      }
    },
    {
      id: 'fallback-2',
      name: 'Starship IFT-7',
      net: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
      status: {
        name: 'TBD',
        description: 'Launch date is to be determined.'
      },
      rocket: {
        configuration: {
          name: 'Starship',
          manufacturer: {
            name: 'SpaceX'
          }
        }
      },
      pad: {
        location: {
          name: 'Starbase, TX, USA'
        }
      },
      mission: {
        description: 'Integrated Flight Test of Starship and Super Heavy booster.'
      }
    },
    {
      id: 'fallback-3',
      name: 'Europa Clipper',
      net: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: {
        name: 'Go',
        description: 'Current T-0 confirmed by official or reliable sources.'
      },
      rocket: {
        configuration: {
          name: 'Falcon Heavy',
          manufacturer: {
            name: 'SpaceX'
          }
        }
      },
      pad: {
        location: {
          name: 'Kennedy Space Center, FL, USA'
        }
      },
      mission: {
        description: 'Mission to study Jupiter\'s moon Europa and its subsurface ocean.'
      }
    }
  ];
}

// Satellite tracking fallback functions
function getFallbackISSPosition(): SatellitePosition {
  const now = Date.now();
  return {
    satelliteId: 25544,
    name: 'International Space Station (ISS)',
    timestamp: new Date().toISOString(),
    latitude: Math.sin(now / 1000000) * 51.6, // Simulate orbital movement
    longitude: ((now / 100000) % 360) - 180,
    altitude: 408,
    velocity: 7.66,
    visibility: 'sunlit',
    azimuth: 0,
    elevation: 0,
    range: 0,
    footprint: 4500
  };
}

function getFallbackPasses(): SatellitePass[] {
  const now = new Date();
  return [
    {
      startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 6.1 * 60 * 60 * 1000).toISOString(),
      duration: 360,
      maxElevation: 45,
      direction: 'NW to SE',
      magnitude: -3.2,
      visible: true,
      type: 'visible'
    },
    {
      startTime: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() + 18.1 * 60 * 60 * 1000).toISOString(),
      duration: 420,
      maxElevation: 62,
      direction: 'SW to NE',
      magnitude: -2.8,
      visible: true,
      type: 'visible'
    }
  ];
}

function getFallbackSatelliteInfo(): SatelliteInfo {
  return {
    satelliteId: 25544,
    name: 'International Space Station (ISS)',
    launchDate: '1998-11-20',
    category: 'Space Station',
    country: 'International',
    period: 92.68,
    inclination: 51.6,
    apogee: 420,
    perigee: 400,
    semiMajorAxis: 6785,
    rcs: 1000,
    lastUpdate: new Date().toISOString()
  };
}

// Space weather fallback functions
function getFallbackSpaceWeatherAlerts(): SpaceWeatherAlert[] {
  return [
    {
      id: 'fallback-aurora-1',
      type: 'geomagnetic_storm',
      severity: 'moderate',
      title: 'Geomagnetic Storm Watch',
      description: 'Minor to moderate geomagnetic storms are possible due to solar wind enhancements',
      issuedTime: new Date().toISOString(),
      region: 'Global',
      source: 'NOAA SWPC',
      impact: 'Aurora may be visible at higher latitudes',
      icon: '🌌',
      color: 'text-purple-400'
    },
    {
      id: 'fallback-solar-1',
      type: 'solar_flare',
      severity: 'minor',
      title: 'Solar Activity Monitor',
      description: 'Normal solar activity levels with occasional minor flares',
      issuedTime: new Date().toISOString(),
      region: 'Sun-Earth environment',
      source: 'NOAA SWPC',
      impact: 'No significant impacts expected',
      icon: '☀️',
      color: 'text-yellow-400'
    }
  ];
}

function getFallbackSolarActivity(): SolarActivity {
  return {
    timestamp: new Date().toISOString(),
    kIndex: 2.0,
    aIndex: 30,
    solarWindSpeed: 400,
    magneticFieldStrength: 5.0,
    protonFlux: 5.0,
    electronFlux: 1000,
    xrayFlux: 'B1.0',
    status: 'quiet'
  };
}

function getFallbackAuroraForecast(): AuroraForecast[] {
  return [
    {
      timestamp: new Date().toISOString(),
      kpIndex: 2.0,
      viewLineLatitude: 60.0,
      intensity: 'low',
      visibility: 'Northern regions (Canada, Alaska, northern Scandinavia)',
      color: 'text-green-400'
    }
  ];
}

// Asteroid tracking fallback functions
function getFallbackAsteroids(): AsteroidData[] {
  return [
    {
      id: '54016',
      name: '54016 (2020 SO)',
      designation: '2020 SO',
      absoluteMagnitude: 28.2,
      estimatedDiameter: {
        kilometers: { min: 0.004, max: 0.009, average: 0.0065 },
        meters: { min: 4, max: 9, average: 6.5 }
      },
      isPotentiallyHazardous: false,
      closeApproachData: [{
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        epochDateCloseApproach: Date.now() + 30 * 24 * 60 * 60 * 1000,
        relativeVelocity: {
          kmPerSecond: 0.6,
          kmPerHour: 2160,
          milesPerHour: 1342
        },
        missDistance: {
          astronomical: 0.1,
          lunar: 39,
          kilometers: 15000000,
          miles: 9320567
        },
        orbitingBody: 'Earth'
      }],
      orbitalData: {
        orbitId: '1',
        orbitDeterminationDate: new Date().toISOString(),
        orbitUncertainty: '0',
        minimumOrbitIntersection: 0.0956,
        jupiterTisserandInvariant: 2.96,
        epochOsculation: new Date().toISOString(),
        eccentricity: 0.695,
        semiMajorAxis: 1.06,
        inclination: 0.15,
        ascendingNodeLongitude: 32.42,
        orbitalPeriod: 399.1,
        perihelionDistance: 0.324,
        perihelionArgument: 18.65,
        aphelionDistance: 1.801,
        perihelionTime: new Date().toISOString(),
        meanAnomaly: 317.4,
        meanMotion: 0.902
      },
      firstObservationDate: '2020-09-17',
      lastObservationDate: '2020-12-01',
      dataArcInDays: 75,
      observationsUsed: 156
    }
  ];
}

function getFallbackAsteroidStats(): AsteroidStats {
  return {
    totalCount: 30000,
    nearEarthObjectsToday: 1,
    potentiallyHazardousCount: 0,
    closeApproachesToday: 1,
    averageSize: 0.1,
    largestAsteroid: {
      name: '54016 (2020 SO)',
      size: 0.0065
    },
    closestApproach: {
      name: '54016 (2020 SO)',
      distance: 15000000,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };
}

// Cosmic lore fallback functions
function getFallbackLore(planetName: string, category: CosmicLore['category']): CosmicLore {
  const fallbackContent = {
    description: `${planetName} is a fascinating exoplanet that represents the incredible diversity of worlds beyond our solar system. This distant world orbits its parent star in conditions unlike anything we experience on Earth.`,
    history: `The cosmic story of ${planetName} began billions of years ago when it formed from the stellar nursery surrounding its host star. Since its discovery, this world has expanded our understanding of planetary formation.`,
    civilization: `If life exists on ${planetName}, it would have evolved under entirely alien conditions. Any potential inhabitants would experience a reality fundamentally different from life on Earth.`,
    environment: `The surface and atmospheric conditions of ${planetName} create an environment shaped by unique physical processes. Weather patterns and geological features would be unlike anything on our home planet.`,
    mystery: `${planetName} holds many secrets that current observational technology cannot yet reveal. Future missions and improved instruments may unlock the mysteries hidden within this distant world.`,
    discovery_story: `The discovery of ${planetName} represents humanity's growing ability to detect and study worlds beyond our solar system. Advanced astronomical techniques revealed this planet's existence through careful observation.`
  };

  const fallbackTitles = {
    description: `${planetName}: A Cosmic Portrait`,
    history: `The Chronicles of ${planetName}`,
    civilization: `Life Potential of ${planetName}`,
    environment: `The Alien Environment of ${planetName}`,
    mystery: `The Enigma of ${planetName}`,
    discovery_story: `Finding ${planetName}`
  };

  return {
    id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    planetName,
    category,
    title: fallbackTitles[category],
    content: fallbackContent[category],
    tone: 'scientific',
    length: 'medium',
    tags: [category, 'fallback'],
    generated: false,
    timestamp: new Date().toISOString()
  };
}

// TimeZone API interfaces
export interface TimezoneInfo {
  zoneName: string;
  countryCode: string;
  countryName: string;
  regionName: string;
  cityName: string;
  gmtOffset: number;
  timestamp: number;
  formatted: string;
  abbreviation: string;
  isDst: boolean;
  flag?: string;
}

export interface TimezoneListItem {
  zoneName: string;
  countryCode: string;
  countryName: string;
  gmtOffset: number;
  abbreviation: string;
  flag?: string;
}

// Enhanced cosmic events from NASA EONET
export interface CosmicEvent {
  id: string;
  name: string;
  date: string;
  type: 'eclipse' | 'meteor_shower' | 'planetary_alignment' | 'solar_activity' | 'wildfire' | 'volcano' | 'storm' | 'earthquake' | 'flood' | 'dust_haze' | 'landslide' | 'manmade' | 'drought' | 'other';
  description: string;
  visibility?: string;
  magnitude?: number;
  coordinates?: number[];
  source: string;
  sourceUrl?: string;
}

// Satellite tracking interfaces
export interface SatellitePosition {
  satelliteId: number;
  name: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number; // km above Earth
  velocity: number; // km/s
  visibility: 'sunlit' | 'eclipsed' | 'visible';
  azimuth: number;
  elevation: number;
  range: number; // km from observer
  footprint: number; // km diameter on Earth
}

export interface SatellitePass {
  startTime: string;
  endTime: string;
  duration: number; // seconds
  maxElevation: number;
  direction: string;
  magnitude: number;
  visible: boolean;
  type: 'visible' | 'daylight' | 'civil_twilight';
}

export interface SatelliteInfo {
  satelliteId: number;
  name: string;
  launchDate: string;
  category: string;
  country: string;
  period: number; // orbital period in minutes
  inclination: number;
  apogee: number; // km
  perigee: number; // km
  semiMajorAxis: number;
  rcs: number; // radar cross section
  lastUpdate: string;
}

export interface ISSRelativeInfo {
  issPosition: SatellitePosition;
  distanceFromUser: number;
  direction: string;
  nextPass?: SatellitePass;
}

// Space weather interfaces
export interface SpaceWeatherAlert {
  id: string;
  type: 'solar_flare' | 'geomagnetic_storm' | 'solar_wind' | 'radiation_storm' | 'radio_blackout';
  severity: 'minor' | 'moderate' | 'strong' | 'severe' | 'extreme';
  title: string;
  description: string;
  issuedTime: string;
  validTime?: string;
  region?: string;
  magnitude?: string;
  source: string;
  impact: string;
  icon: string;
  color: string;
}

export interface SolarActivity {
  timestamp: string;
  kIndex: number;
  aIndex: number;
  solarWindSpeed: number;
  magneticFieldStrength: number;
  protonFlux: number;
  electronFlux: number;
  xrayFlux: string;
  status: 'quiet' | 'active' | 'storm';
}

export interface AuroraForecast {
  timestamp: string;
  kpIndex: number;
  viewLineLatitude: number;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  visibility: string;
  color: string;
}

// Asteroid tracking interfaces
export interface AsteroidData {
  id: string;
  name: string;
  designation: string;
  absoluteMagnitude: number;
  estimatedDiameter: {
    kilometers: {
      min: number;
      max: number;
      average: number;
    };
    meters: {
      min: number;
      max: number;
      average: number;
    };
  };
  isPotentiallyHazardous: boolean;
  closeApproachData: CloseApproachData[];
  orbitalData: OrbitalData;
  firstObservationDate: string;
  lastObservationDate: string;
  dataArcInDays: number;
  observationsUsed: number;
}

export interface CloseApproachData {
  date: string;
  epochDateCloseApproach: number;
  relativeVelocity: {
    kmPerSecond: number;
    kmPerHour: number;
    milesPerHour: number;
  };
  missDistance: {
    astronomical: number;
    lunar: number;
    kilometers: number;
    miles: number;
  };
  orbitingBody: string;
}

export interface OrbitalData {
  orbitId: string;
  orbitDeterminationDate: string;
  orbitUncertainty: string;
  minimumOrbitIntersection: number;
  jupiterTisserandInvariant: number;
  epochOsculation: string;
  eccentricity: number;
  semiMajorAxis: number;
  inclination: number;
  ascendingNodeLongitude: number;
  orbitalPeriod: number;
  perihelionDistance: number;
  perihelionArgument: number;
  aphelionDistance: number;
  perihelionTime: string;
  meanAnomaly: number;
  meanMotion: number;
}

export interface AsteroidStats {
  totalCount: number;
  nearEarthObjectsToday: number;
  potentiallyHazardousCount: number;
  closeApproachesToday: number;
  averageSize: number;
  largestAsteroid: {
    name: string;
    size: number;
  };
  closestApproach: {
    name: string;
    distance: number;
    date: string;
  };
}

// Cosmic lore interfaces
export interface CosmicLore {
  id: string;
  planetName: string;
  category: 'description' | 'history' | 'civilization' | 'environment' | 'mystery' | 'discovery_story';
  title: string;
  content: string;
  tone: 'scientific' | 'poetic' | 'mysterious' | 'adventure' | 'documentary';
  length: 'short' | 'medium' | 'long';
  tags: string[];
  generated: boolean;
  timestamp: string;
}

export interface LoreGenerationRequest {
  planetData: {
    name: string;
    hostStar?: string;
    discoveryYear?: number;
    discoveryMethod?: string;
    planetRadius?: number;
    planetMass?: number;
    temperature?: number;
    distanceFromEarth?: number;
    habitableZone?: boolean;
    orbitalPeriod?: number;
  };
  category: CosmicLore['category'];
  tone: CosmicLore['tone'];
  length: CosmicLore['length'];
}

export interface LoreRecommendation {
  category: CosmicLore['category'];
  reason: string;
}

// Exoplanet data interface
export interface ExoplanetData {
  id: string;
  name: string;
  hostStar: string;
  discoveryYear: number;
  discoveryMethod: string;
  orbitalPeriod: number; // in Earth days
  planetRadius?: number; // in Earth radii
  planetMass?: number; // in Earth masses
  distanceFromEarth: number; // in light years
  habitableZone: boolean;
  estimatedDayLength?: number; // in hours
  temperature?: number; // in Kelvin
  description: string;
  icon: string;
  color: string;
  type: 'exoplanet';
  lastUpdated: string;
}

