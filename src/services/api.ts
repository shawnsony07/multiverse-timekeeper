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

