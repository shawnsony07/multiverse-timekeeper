import fetch from 'node-fetch';

const NASA_EONET_API_URL = process.env.NASA_EONET_API_URL || 'https://eonet.gsfc.nasa.gov/api/v3';

export interface EONETEvent {
  id: string;
  title: string;
  description: string | null;
  link: string;
  categories: Array<{
    id: number;
    title: string;
  }>;
  sources: Array<{
    id: string;
    url: string;
  }>;
  geometry: Array<{
    magnitudeValue: number | null;
    magnitudeUnit: string | null;
    date: string;
    type: string;
    coordinates: number[];
  }>;
}

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

// Fallback cosmic events (same as currently hardcoded)
const fallbackEvents: CosmicEvent[] = [
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

export async function getCosmicEvents(limit: number = 50, days: number = 365): Promise<CosmicEvent[]> {
  try {
    const response = await fetch(
      `${NASA_EONET_API_URL}/events?limit=${limit}&days=${days}&status=open`
    );

    if (!response.ok) {
      throw new Error(`NASA EONET API error: ${response.status}`);
    }

    const data = await response.json() as { events: EONETEvent[] };
    
    if (!data.events || !Array.isArray(data.events)) {
      throw new Error('Invalid EONET API response format');
    }

    const cosmicEvents: CosmicEvent[] = data.events.map(event => {
      // Get the most recent geometry entry for the event date
      const latestGeometry = event.geometry[event.geometry.length - 1];
      const eventDate = latestGeometry?.date || new Date().toISOString();
      
      // Map EONET categories to our cosmic event types
      const eventType = mapEONETCategoryToType(event.categories[0]?.id);
      
      // Generate description from title and category
      const description = event.description || 
        `${event.categories[0]?.title || 'Natural event'} - ${event.title}`;
      
      // Get coordinates if available
      const coordinates = latestGeometry?.coordinates || undefined;
      
      // Generate visibility info based on event type and coordinates
      const visibility = generateVisibilityInfo(eventType, coordinates);

      return {
        id: event.id,
        name: event.title,
        date: eventDate,
        type: eventType,
        description: description,
        visibility: visibility,
        magnitude: latestGeometry?.magnitudeValue || undefined,
        coordinates: coordinates,
        source: 'NASA EONET',
        sourceUrl: event.sources[0]?.url || event.link
      };
    });

    // Sort by date (most recent/upcoming first)
    const sortedEvents = cosmicEvents.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Filter to get upcoming events and some recent ones
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const relevantEvents = sortedEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= oneMonthAgo; // Include events from past month and future
    });

    // Combine with fallback astronomical events (eclipses, meteor showers, etc.)
    // that EONET doesn't typically track
    const combinedEvents = [...relevantEvents, ...fallbackEvents];
    
    // Remove duplicates and sort
    const uniqueEvents = combinedEvents
      .filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return uniqueEvents.slice(0, limit);

  } catch (error) {
    console.error('Failed to fetch events from NASA EONET:', error);
    return fallbackEvents;
  }
}

export async function getEventsByCategory(categoryId: number, limit: number = 20): Promise<CosmicEvent[]> {
  try {
    const response = await fetch(
      `${NASA_EONET_API_URL}/categories/${categoryId}?limit=${limit}&days=365&status=open`
    );

    if (!response.ok) {
      throw new Error(`NASA EONET API error: ${response.status}`);
    }

    const data = await response.json() as { events: EONETEvent[] };
    
    if (!data.events || !Array.isArray(data.events)) {
      return [];
    }

    return data.events.map(event => {
      const latestGeometry = event.geometry[event.geometry.length - 1];
      const eventDate = latestGeometry?.date || new Date().toISOString();
      const eventType = mapEONETCategoryToType(categoryId);
      
      return {
        id: event.id,
        name: event.title,
        date: eventDate,
        type: eventType,
        description: event.description || event.title,
        magnitude: latestGeometry?.magnitudeValue || undefined,
        coordinates: latestGeometry?.coordinates || undefined,
        source: 'NASA EONET',
        sourceUrl: event.sources[0]?.url || event.link
      };
    });

  } catch (error) {
    console.error(`Failed to fetch category ${categoryId} events:`, error);
    return [];
  }
}

// Map EONET category IDs to our event types
function mapEONETCategoryToType(categoryId: number): CosmicEvent['type'] {
  const categoryMap: Record<number, CosmicEvent['type']> = {
    6: 'drought',       // Drought
    7: 'dust_haze',     // Dust and Haze
    8: 'earthquake',    // Earthquakes
    9: 'flood',         // Floods
    10: 'landslide',    // Landslides
    11: 'manmade',      // Manmade
    12: 'volcano',      // Sea and Lake Ice
    13: 'volcano',      // Snow
    14: 'storm',        // Severe Storms
    15: 'volcano',      // Volcanoes
    16: 'wildfire',     // Water Color
    17: 'wildfire',     // Wildfires
    18: 'other',        // Other
    19: 'solar_activity' // Space Weather (closest match for solar activity)
  };
  
  return categoryMap[categoryId] || 'other';
}

// Generate visibility information based on event type and location
function generateVisibilityInfo(type: CosmicEvent['type'], coordinates?: number[]): string | undefined {
  if (!coordinates || coordinates.length < 2) {
    // Default visibility based on event type
    switch (type) {
      case 'eclipse':
        return 'Visibility depends on location and weather';
      case 'meteor_shower':
        return 'Best viewed in dark skies away from city lights';
      case 'planetary_alignment':
        return 'Visible worldwide with clear skies';
      case 'solar_activity':
        return 'Aurora may be visible at higher latitudes';
      default:
        return undefined;
    }
  }

  // Generate location-based visibility
  const [longitude, latitude] = coordinates;
  
  // Rough continental regions based on coordinates
  if (latitude > 60) {
    return 'Arctic region';
  } else if (latitude > 30) {
    if (longitude > -30 && longitude < 70) {
      return 'Europe/Western Asia region';
    } else if (longitude >= 70 && longitude < 150) {
      return 'Central/Eastern Asia region';
    } else if (longitude >= -170 && longitude < -30) {
      return 'North America region';
    }
  } else if (latitude > -30) {
    if (longitude > -30 && longitude < 50) {
      return 'Africa/Middle East region';
    } else if (longitude >= 50 && longitude < 150) {
      return 'Asia/Australia region';
    } else if (longitude >= -170 && longitude < -30) {
      return 'Americas region';
    }
  } else {
    return 'Southern hemisphere region';
  }
  
  return `Region: ${latitude.toFixed(1)}°, ${longitude.toFixed(1)}°`;
}

// Get list of EONET categories
export async function getCategories() {
  try {
    const response = await fetch(`${NASA_EONET_API_URL}/categories`);
    
    if (!response.ok) {
      throw new Error(`NASA EONET API error: ${response.status}`);
    }

    const data = await response.json();
    return data.categories || [];
    
  } catch (error) {
    console.error('Failed to fetch EONET categories:', error);
    return [];
  }
}
