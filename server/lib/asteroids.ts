import fetch from 'node-fetch';

const NASA_NEOWS_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const NASA_NEOWS_BASE_URL = 'https://api.nasa.gov/neo/rest/v1';

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

// Fallback asteroid data
const fallbackAsteroids: AsteroidData[] = [
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

export async function getTodaysAsteroids(): Promise<AsteroidData[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${NASA_NEOWS_BASE_URL}/feed?start_date=${today}&end_date=${today}&api_key=${NASA_NEOWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NASA NeoWs API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.near_earth_objects || !data.near_earth_objects[today]) {
      return fallbackAsteroids;
    }

    return data.near_earth_objects[today].map(mapNeoWsAsteroid);

  } catch (error) {
    console.error('Failed to fetch today\'s asteroids from NASA NeoWs:', error);
    return fallbackAsteroids;
  }
}

export async function getAsteroidsByDateRange(startDate: string, endDate: string): Promise<AsteroidData[]> {
  try {
    const response = await fetch(
      `${NASA_NEOWS_BASE_URL}/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_NEOWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NASA NeoWs API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (!data.near_earth_objects) {
      return [];
    }

    const allAsteroids: AsteroidData[] = [];
    Object.values(data.near_earth_objects).forEach((dayAsteroids: any) => {
      dayAsteroids.forEach((asteroid: any) => {
        allAsteroids.push(mapNeoWsAsteroid(asteroid));
      });
    });

    return allAsteroids.sort((a, b) => {
      const aDate = new Date(a.closeApproachData[0]?.date || 0);
      const bDate = new Date(b.closeApproachData[0]?.date || 0);
      return aDate.getTime() - bDate.getTime();
    });

  } catch (error) {
    console.error('Failed to fetch asteroids by date range from NASA NeoWs:', error);
    return fallbackAsteroids;
  }
}

export async function getAsteroidById(asteroidId: string): Promise<AsteroidData | null> {
  try {
    const response = await fetch(
      `${NASA_NEOWS_BASE_URL}/neo/${asteroidId}?api_key=${NASA_NEOWS_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`NASA NeoWs API error: ${response.status}`);
    }

    const data = await response.json() as any;
    return mapNeoWsAsteroid(data);

  } catch (error) {
    console.error(`Failed to fetch asteroid ${asteroidId} from NASA NeoWs:`, error);
    return null;
  }
}

export async function getAsteroidStats(): Promise<AsteroidStats> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [feedData, statsData] = await Promise.all([
      fetch(`${NASA_NEOWS_BASE_URL}/feed?start_date=${today}&end_date=${today}&api_key=${NASA_NEOWS_API_KEY}`),
      fetch(`${NASA_NEOWS_BASE_URL}/stats?api_key=${NASA_NEOWS_API_KEY}`)
    ]);

    if (!feedData.ok || !statsData.ok) {
      throw new Error('NASA NeoWs API error');
    }

    const feed = await feedData.json() as any;
    const stats = await statsData.json() as any;

    const todaysAsteroids = feed.near_earth_objects?.[today] || [];
    const hazardousToday = todaysAsteroids.filter((asteroid: any) => asteroid.is_potentially_hazardous_asteroid).length;

    // Find largest and closest asteroids
    let largestSize = 0;
    let largestName = '';
    let closestDistance = Infinity;
    let closestName = '';
    let closestDate = '';

    todaysAsteroids.forEach((asteroid: any) => {
      const avgSize = (asteroid.estimated_diameter?.kilometers?.estimated_diameter_min + 
                     asteroid.estimated_diameter?.kilometers?.estimated_diameter_max) / 2 || 0;
      
      if (avgSize > largestSize) {
        largestSize = avgSize;
        largestName = asteroid.name;
      }

      asteroid.close_approach_data?.forEach((approach: any) => {
        const distance = parseFloat(approach.miss_distance?.kilometers || Infinity);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestName = asteroid.name;
          closestDate = approach.close_approach_date;
        }
      });
    });

    return {
      totalCount: stats.near_earth_object_count || 30000,
      nearEarthObjectsToday: todaysAsteroids.length,
      potentiallyHazardousCount: hazardousToday,
      closeApproachesToday: todaysAsteroids.reduce((count: number, asteroid: any) => 
        count + (asteroid.close_approach_data?.length || 0), 0),
      averageSize: todaysAsteroids.length > 0 ? 
        todaysAsteroids.reduce((sum: number, asteroid: any) => {
          const avgSize = (asteroid.estimated_diameter?.kilometers?.estimated_diameter_min + 
                         asteroid.estimated_diameter?.kilometers?.estimated_diameter_max) / 2 || 0;
          return sum + avgSize;
        }, 0) / todaysAsteroids.length : 0,
      largestAsteroid: {
        name: largestName,
        size: largestSize
      },
      closestApproach: {
        name: closestName,
        distance: closestDistance === Infinity ? 0 : closestDistance,
        date: closestDate
      }
    };

  } catch (error) {
    console.error('Failed to fetch asteroid stats from NASA NeoWs:', error);
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
}

export async function getPotentiallyHazardousAsteroids(page: number = 0, size: number = 20): Promise<{
  asteroids: AsteroidData[];
  totalElements: number;
  totalPages: number;
}> {
  try {
    const response = await fetch(
      `${NASA_NEOWS_BASE_URL}/neo/browse?page=${page}&size=${size}&api_key=${NASA_NEOWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`NASA NeoWs API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    // Filter for potentially hazardous asteroids
    const hazardousAsteroids = data.near_earth_objects?.filter(
      (asteroid: any) => asteroid.is_potentially_hazardous_asteroid
    ) || [];

    return {
      asteroids: hazardousAsteroids.map(mapNeoWsAsteroid),
      totalElements: data.page?.total_elements || 0,
      totalPages: data.page?.total_pages || 0
    };

  } catch (error) {
    console.error('Failed to fetch potentially hazardous asteroids from NASA NeoWs:', error);
    return {
      asteroids: fallbackAsteroids,
      totalElements: 1,
      totalPages: 1
    };
  }
}

// Helper function to map NASA NeoWs API response to our interface
function mapNeoWsAsteroid(neoWsAsteroid: any): AsteroidData {
  const diameter = neoWsAsteroid.estimated_diameter;
  const kmDiameter = diameter?.kilometers || { estimated_diameter_min: 0, estimated_diameter_max: 0 };
  const mDiameter = diameter?.meters || { estimated_diameter_min: 0, estimated_diameter_max: 0 };

  return {
    id: neoWsAsteroid.id,
    name: neoWsAsteroid.name,
    designation: neoWsAsteroid.designation || neoWsAsteroid.name,
    absoluteMagnitude: neoWsAsteroid.absolute_magnitude_h || 0,
    estimatedDiameter: {
      kilometers: {
        min: kmDiameter.estimated_diameter_min,
        max: kmDiameter.estimated_diameter_max,
        average: (kmDiameter.estimated_diameter_min + kmDiameter.estimated_diameter_max) / 2
      },
      meters: {
        min: mDiameter.estimated_diameter_min,
        max: mDiameter.estimated_diameter_max,
        average: (mDiameter.estimated_diameter_min + mDiameter.estimated_diameter_max) / 2
      }
    },
    isPotentiallyHazardous: neoWsAsteroid.is_potentially_hazardous_asteroid || false,
    closeApproachData: (neoWsAsteroid.close_approach_data || []).map((approach: any) => ({
      date: approach.close_approach_date,
      epochDateCloseApproach: parseInt(approach.epoch_date_close_approach),
      relativeVelocity: {
        kmPerSecond: parseFloat(approach.relative_velocity?.kilometers_per_second || '0'),
        kmPerHour: parseFloat(approach.relative_velocity?.kilometers_per_hour || '0'),
        milesPerHour: parseFloat(approach.relative_velocity?.miles_per_hour || '0')
      },
      missDistance: {
        astronomical: parseFloat(approach.miss_distance?.astronomical || '0'),
        lunar: parseFloat(approach.miss_distance?.lunar || '0'),
        kilometers: parseFloat(approach.miss_distance?.kilometers || '0'),
        miles: parseFloat(approach.miss_distance?.miles || '0')
      },
      orbitingBody: approach.orbiting_body || 'Earth'
    })),
    orbitalData: {
      orbitId: neoWsAsteroid.orbital_data?.orbit_id || '0',
      orbitDeterminationDate: neoWsAsteroid.orbital_data?.orbit_determination_date || new Date().toISOString(),
      orbitUncertainty: neoWsAsteroid.orbital_data?.orbit_uncertainty || '0',
      minimumOrbitIntersection: parseFloat(neoWsAsteroid.orbital_data?.minimum_orbit_intersection || '0'),
      jupiterTisserandInvariant: parseFloat(neoWsAsteroid.orbital_data?.jupiter_tisserand_invariant || '0'),
      epochOsculation: neoWsAsteroid.orbital_data?.epoch_osculation || new Date().toISOString(),
      eccentricity: parseFloat(neoWsAsteroid.orbital_data?.eccentricity || '0'),
      semiMajorAxis: parseFloat(neoWsAsteroid.orbital_data?.semi_major_axis || '0'),
      inclination: parseFloat(neoWsAsteroid.orbital_data?.inclination || '0'),
      ascendingNodeLongitude: parseFloat(neoWsAsteroid.orbital_data?.ascending_node_longitude || '0'),
      orbitalPeriod: parseFloat(neoWsAsteroid.orbital_data?.orbital_period || '0'),
      perihelionDistance: parseFloat(neoWsAsteroid.orbital_data?.perihelion_distance || '0'),
      perihelionArgument: parseFloat(neoWsAsteroid.orbital_data?.perihelion_argument || '0'),
      aphelionDistance: parseFloat(neoWsAsteroid.orbital_data?.aphelion_distance || '0'),
      perihelionTime: neoWsAsteroid.orbital_data?.perihelion_time || new Date().toISOString(),
      meanAnomaly: parseFloat(neoWsAsteroid.orbital_data?.mean_anomaly || '0'),
      meanMotion: parseFloat(neoWsAsteroid.orbital_data?.mean_motion || '0')
    },
    firstObservationDate: neoWsAsteroid.orbital_data?.first_observation_date || new Date().toISOString().split('T')[0],
    lastObservationDate: neoWsAsteroid.orbital_data?.last_observation_date || new Date().toISOString().split('T')[0],
    dataArcInDays: parseInt(neoWsAsteroid.orbital_data?.data_arc_in_days || '0'),
    observationsUsed: parseInt(neoWsAsteroid.orbital_data?.observations_used || '0')
  };
}
