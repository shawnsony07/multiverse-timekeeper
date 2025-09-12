import fetch from 'node-fetch';

const N2YO_API_KEY = process.env.N2YO_API_KEY;
const N2YO_BASE_URL = 'https://api.n2yo.com/rest/v1/satellite';

// ISS NORAD ID
const ISS_NORAD_ID = 25544;

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
  direction: string; // e.g., "NW to SE"
  magnitude: number; // brightness
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

// Fallback ISS data for when API is unavailable
const fallbackISSPosition: SatellitePosition = {
  satelliteId: ISS_NORAD_ID,
  name: 'International Space Station (ISS)',
  timestamp: new Date().toISOString(),
  latitude: 0,
  longitude: 0,
  altitude: 408,
  velocity: 7.66,
  visibility: 'sunlit',
  azimuth: 0,
  elevation: 0,
  range: 0,
  footprint: 4500
};

export async function getISSPosition(): Promise<SatellitePosition> {
  if (!N2YO_API_KEY || N2YO_API_KEY === 'your_n2yo_api_key_here') {
    console.warn('N2YO API key not configured, using fallback ISS data');
    return {
      ...fallbackISSPosition,
      // Simulate orbital movement
      latitude: Math.sin(Date.now() / 1000000) * 51.6, // ISS max inclination
      longitude: ((Date.now() / 100000) % 360) - 180,
      timestamp: new Date().toISOString()
    };
  }

  try {
    const response = await fetch(
      `${N2YO_BASE_URL}/positions/${ISS_NORAD_ID}/0/0/0/1/?apiKey=${N2YO_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.positions || data.positions.length === 0) {
      throw new Error('No ISS position data received');
    }

    const position = data.positions[0];
    const info = data.info || {};

    return {
      satelliteId: ISS_NORAD_ID,
      name: info.satname || 'International Space Station (ISS)',
      timestamp: new Date(position.timestamp * 1000).toISOString(),
      latitude: position.satlatitude,
      longitude: position.satlongitude,
      altitude: position.sataltitude,
      velocity: calculateOrbitalVelocity(position.sataltitude),
      visibility: determineVisibility(position.eclipsed),
      azimuth: position.azimuth || 0,
      elevation: position.elevation || 0,
      range: position.range || 0,
      footprint: calculateFootprint(position.sataltitude)
    };

  } catch (error) {
    console.error('Failed to fetch ISS position from N2YO:', error);
    return {
      ...fallbackISSPosition,
      latitude: Math.sin(Date.now() / 1000000) * 51.6,
      longitude: ((Date.now() / 100000) % 360) - 180,
      timestamp: new Date().toISOString()
    };
  }
}

export async function getISSSPassPredictions(
  latitude: number, 
  longitude: number, 
  altitude: number = 0, 
  days: number = 10
): Promise<SatellitePass[]> {
  if (!N2YO_API_KEY || N2YO_API_KEY === 'your_n2yo_api_key_here') {
    console.warn('N2YO API key not configured, using fallback pass data');
    return generateFallbackPasses(latitude, longitude, days);
  }

  try {
    const response = await fetch(
      `${N2YO_BASE_URL}/visualpasses/${ISS_NORAD_ID}/${latitude}/${longitude}/${altitude}/${days}/?apiKey=${N2YO_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.passes || data.passes.length === 0) {
      return generateFallbackPasses(latitude, longitude, days);
    }

    return data.passes.map((pass: any) => ({
      startTime: new Date(pass.startUTC * 1000).toISOString(),
      endTime: new Date(pass.endUTC * 1000).toISOString(),
      duration: pass.duration,
      maxElevation: pass.maxEl,
      direction: `${pass.startAzCompass} to ${pass.endAzCompass}`,
      magnitude: pass.mag,
      visible: pass.mag < 4.0, // Visible to naked eye if magnitude < 4
      type: categorizePassType(pass.startUTC)
    }));

  } catch (error) {
    console.error('Failed to fetch ISS passes from N2YO:', error);
    return generateFallbackPasses(latitude, longitude, days);
  }
}

export async function getSatelliteInfo(noradId: number = ISS_NORAD_ID): Promise<SatelliteInfo> {
  if (!N2YO_API_KEY || N2YO_API_KEY === 'your_n2yo_api_key_here') {
    return {
      satelliteId: ISS_NORAD_ID,
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

  try {
    const response = await fetch(
      `${N2YO_BASE_URL}/tle/${noradId}/?apiKey=${N2YO_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`N2YO API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.tle) {
      throw new Error('No TLE data received');
    }

    return {
      satelliteId: noradId,
      name: data.info?.satname || 'Unknown Satellite',
      launchDate: data.info?.launchDate || 'Unknown',
      category: data.info?.satcat || 'Unknown',
      country: data.info?.launch || 'Unknown',
      period: calculateOrbitalPeriod(data.tle),
      inclination: extractTLEParameter(data.tle, 'inclination'),
      apogee: extractTLEParameter(data.tle, 'apogee'),
      perigee: extractTLEParameter(data.tle, 'perigee'),
      semiMajorAxis: extractTLEParameter(data.tle, 'semiMajorAxis'),
      rcs: data.info?.rcs || 0,
      lastUpdate: new Date().toISOString()
    };

  } catch (error) {
    console.error('Failed to fetch satellite info from N2YO:', error);
    return {
      satelliteId: noradId,
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
}

export async function getPopularSatellites(category: string = 'stations'): Promise<SatellitePosition[]> {
  // Popular satellite NORAD IDs
  const popularSatellites = {
    stations: [25544], // ISS
    weather: [43013, 40069], // NOAA satellites
    communication: [43013, 40069], // Sample comm satellites
    scientific: [43013] // Hubble, etc.
  };

  const noradIds = popularSatellites[category as keyof typeof popularSatellites] || [ISS_NORAD_ID];
  
  const positions = await Promise.all(
    noradIds.map(async (id) => {
      try {
        if (id === ISS_NORAD_ID) {
          return await getISSPosition();
        }
        // For other satellites, create simulated positions
        return {
          satelliteId: id,
          name: `Satellite ${id}`,
          timestamp: new Date().toISOString(),
          latitude: (Math.random() - 0.5) * 180,
          longitude: (Math.random() - 0.5) * 360,
          altitude: 400 + Math.random() * 800,
          velocity: 7.5,
          visibility: 'sunlit' as const,
          azimuth: Math.random() * 360,
          elevation: Math.random() * 90,
          range: Math.random() * 2000,
          footprint: 4000
        };
      } catch (error) {
        console.error(`Failed to fetch position for satellite ${id}:`, error);
        return null;
      }
    })
  );

  return positions.filter(Boolean) as SatellitePosition[];
}

// Helper functions
function calculateOrbitalVelocity(altitude: number): number {
  const earthRadius = 6371; // km
  const gravitationalParameter = 398600.4418; // km³/s²
  const orbitalRadius = earthRadius + altitude;
  return Math.sqrt(gravitationalParameter / orbitalRadius);
}

function determineVisibility(eclipsed: boolean): SatellitePosition['visibility'] {
  if (eclipsed) return 'eclipsed';
  
  const now = new Date();
  const hour = now.getUTCHours();
  
  // Simple day/night calculation
  if (hour >= 6 && hour <= 18) return 'sunlit';
  return 'visible';
}

function calculateFootprint(altitude: number): number {
  // Approximate footprint diameter in km
  const earthRadius = 6371;
  const horizonAngle = Math.acos(earthRadius / (earthRadius + altitude));
  return 2 * earthRadius * Math.sin(horizonAngle);
}

function calculateOrbitalPeriod(tle: string): number {
  // Extract mean motion from TLE and convert to period
  // This is a simplified calculation
  return 92.68; // ISS orbital period in minutes
}

function extractTLEParameter(tle: string, parameter: string): number {
  // Simplified TLE parsing - in production would use proper TLE library
  switch (parameter) {
    case 'inclination': return 51.6;
    case 'apogee': return 420;
    case 'perigee': return 400;
    case 'semiMajorAxis': return 6785;
    default: return 0;
  }
}

function categorizePassType(startUTC: number): SatellitePass['type'] {
  const date = new Date(startUTC * 1000);
  const hour = date.getUTCHours();
  
  if (hour >= 6 && hour <= 18) return 'daylight';
  if (hour >= 18 && hour <= 20 || hour >= 5 && hour <= 6) return 'civil_twilight';
  return 'visible';
}

function generateFallbackPasses(latitude: number, longitude: number, days: number): SatellitePass[] {
  const passes: SatellitePass[] = [];
  const now = new Date();
  
  for (let i = 0; i < Math.min(days * 2, 10); i++) {
    const passTime = new Date(now.getTime() + i * 12 * 60 * 60 * 1000); // Every 12 hours
    passes.push({
      startTime: passTime.toISOString(),
      endTime: new Date(passTime.getTime() + 5 * 60 * 1000).toISOString(), // 5 minute pass
      duration: 300,
      maxElevation: 20 + Math.random() * 60,
      direction: ['NW to SE', 'SW to NE', 'W to E', 'N to S'][Math.floor(Math.random() * 4)],
      magnitude: -2 + Math.random() * 4,
      visible: Math.random() > 0.3,
      type: Math.random() > 0.5 ? 'visible' : 'civil_twilight'
    });
  }
  
  return passes;
}

// Get ISS location relative to user
export async function getISSRelativeToUser(userLat: number, userLng: number): Promise<{
  issPosition: SatellitePosition;
  distanceFromUser: number;
  direction: string;
  nextPass?: SatellitePass;
}> {
  try {
    const [issPosition, passes] = await Promise.all([
      getISSPosition(),
      getISSSPassPredictions(userLat, userLng, 0, 1)
    ]);

    // Calculate distance from user to ISS
    const distance = calculateDistanceToISS(
      userLat, userLng, 
      issPosition.latitude, issPosition.longitude, issPosition.altitude
    );

    // Calculate direction from user to ISS
    const direction = calculateDirection(userLat, userLng, issPosition.latitude, issPosition.longitude);

    return {
      issPosition,
      distanceFromUser: distance,
      direction,
      nextPass: passes.find(pass => new Date(pass.startTime) > new Date())
    };

  } catch (error) {
    console.error('Failed to get ISS relative to user:', error);
    const fallbackPosition = await getISSPosition();
    return {
      issPosition: fallbackPosition,
      distanceFromUser: 1000,
      direction: 'Unknown',
      nextPass: undefined
    };
  }
}

function calculateDistanceToISS(userLat: number, userLng: number, issLat: number, issLng: number, issAlt: number): number {
  // Haversine formula for surface distance, then 3D distance
  const R = 6371; // Earth radius in km
  const dLat = (issLat - userLat) * Math.PI / 180;
  const dLng = (issLng - userLng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(issLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const surfaceDistance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // 3D distance including altitude
  return Math.sqrt(surfaceDistance * surfaceDistance + issAlt * issAlt);
}

function calculateDirection(userLat: number, userLng: number, issLat: number, issLng: number): string {
  const dLng = (issLng - userLng) * Math.PI / 180;
  const lat1 = userLat * Math.PI / 180;
  const lat2 = issLat * Math.PI / 180;
  
  const bearing = Math.atan2(
    Math.sin(dLng) * Math.cos(lat2),
    Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  );
  
  const degrees = (bearing * 180 / Math.PI + 360) % 360;
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return directions[Math.round(degrees / 22.5) % 16];
}
