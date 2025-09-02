import axios from 'axios';

// Launch Library API for rocket launches
const LAUNCH_API_BASE = 'https://ll.thespacedevs.com/2.2.0';

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

// Cosmic events (hardcoded for MVP)
export interface CosmicEvent {
  id: string;
  name: string;
  date: string;
  type: 'eclipse' | 'meteor_shower' | 'planetary_alignment' | 'solar_activity';
  description: string;
  visibility?: string;
}

export const cosmicEvents: CosmicEvent[] = [
  {
    id: 'geminids-2024',
    name: 'Geminids Meteor Shower',
    date: '2024-12-14T00:00:00Z',
    type: 'meteor_shower',
    description: 'One of the best meteor showers of the year, producing up to 120 meteors per hour.',
    visibility: 'Best viewed after midnight'
  },
  {
    id: 'lunar-eclipse-2025',
    name: 'Total Lunar Eclipse',
    date: '2025-03-14T07:00:00Z',
    type: 'eclipse',
    description: 'A total lunar eclipse visible from North and South America.',
    visibility: 'Visible from Americas, Europe, Africa'
  },
  {
    id: 'venus-jupiter-conjunction',
    name: 'Venus-Jupiter Conjunction',
    date: '2025-08-12T18:00:00Z',
    type: 'planetary_alignment',
    description: 'Venus and Jupiter will appear very close together in the evening sky.',
    visibility: 'Visible worldwide in evening sky'
  },
  {
    id: 'solar-maximum',
    name: 'Solar Maximum Period',
    date: '2025-01-01T00:00:00Z',
    type: 'solar_activity',
    description: 'Peak solar activity with increased auroral activity expected.',
    visibility: 'Aurora visible at lower latitudes'
  }
];