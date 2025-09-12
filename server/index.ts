import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getPlanetaryData } from './lib/horizons';
import { getTimezoneList, getTimezoneInfo, getFlagForCountryCode, type TimezoneListItem, type TimezoneInfo } from './lib/timezonedb';
import { getCosmicEvents, getEventsByCategory, getCategories, type CosmicEvent } from './lib/eonet';
import { getConfirmedExoplanets, searchExoplanetsByName, getExoplanetStats, type ExoplanetData } from './lib/exoplanets';
import { getISSPosition, getISSSPassPredictions, getSatelliteInfo, getPopularSatellites, getISSRelativeToUser, type SatellitePosition, type SatellitePass, type SatelliteInfo } from './lib/satellites';
import { getCurrentSpaceWeatherAlerts, getCurrentSolarActivity, getAuroraForecast, type SpaceWeatherAlert, type SolarActivity, type AuroraForecast } from './lib/spaceweather';
import { getTodaysAsteroids, getAsteroidsByDateRange, getAsteroidById, getAsteroidStats, getPotentiallyHazardousAsteroids, type AsteroidData, type AsteroidStats } from './lib/asteroids';
import { updateExoplanetDatabase, runScheduledUpdate, getRecentNotifications, getBatchUpdateHistory, getBatchSystemHealth, checkDataFreshness, type BatchUpdateResult, type ExoplanetUpdateNotification } from './lib/batch-updates';
import { generateCosmicLore, generatePlanetLoreSet, getRecommendedLore, type CosmicLore, type LoreGenerationRequest } from './lib/cosmic-lore';

dotenv.config();

// Debug logging
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');


const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || (!SUPABASE_SERVICE_ROLE_KEY && !SUPABASE_ANON_KEY)) {
  // eslint-disable-next-line no-console
  console.warn('Supabase credentials are not set. Set SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY.');
}

const supabase: SupabaseClient | null = (SUPABASE_URL && (SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY))
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY as string)
  : null;

// GET /api/planetary/:body â†’ latest cached data
app.get('/api/planetary/:body', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const body = (req.params.body || '').toLowerCase();
    const { data, error } = await supabase
      .from('planetary_data')
      .select('*')
      .eq('body', body)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({ error: 'No cached data found' });
    }

    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unexpected error' });
  }
});

// POST /api/planetary/fetch â†’ refresh from Horizons and cache
app.post('/api/planetary/fetch', async (req: Request, res: Response) => {
  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const { body, startTime, stopTime, step } = req.body || {};
    if (!body || !startTime || !stopTime || !step) {
      return res.status(400).json({ error: 'body, startTime, stopTime, and step are required' });
    }

    const result = await getPlanetaryData(String(body), String(startTime), String(stopTime), String(step));

    const { data, error } = await supabase
      .from('planetary_data')
      .insert({
        body: String(body).toLowerCase(),
        start_time: new Date(startTime).toISOString(),
        stop_time: new Date(stopTime).toISOString(),
        step: String(step),
        position: { x: result.position.x, y: result.position.y, z: result.position.z },
        distance: result.distanceFromEarth,
        local_solar_time: result.localSolarTime,
        julian_date: result.julianDate,
        raw_result: result.raw,
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unexpected error' });
  }
});

// TimeZoneDB API endpoints
app.get('/api/timezones', async (req: Request, res: Response) => {
  try {
    const timezones = await getTimezoneList();
    
    // Add flag information to each timezone
    const timezonesWithFlags = timezones.map((tz: TimezoneListItem) => ({
      ...tz,
      flag: getFlagForCountryCode(tz.countryCode)
    }));
    
    return res.json(timezonesWithFlags);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch timezones' });
  }
});

app.get('/api/timezone/:zoneName', async (req: Request, res: Response) => {
  try {
    const { zoneName } = req.params;
    if (!zoneName) {
      return res.status(400).json({ error: 'Zone name is required' });
    }
    
    const timezoneInfo = await getTimezoneInfo(decodeURIComponent(zoneName));
    
    if (!timezoneInfo) {
      return res.status(404).json({ error: 'Timezone not found' });
    }
    
    return res.json({
      ...timezoneInfo,
      flag: getFlagForCountryCode(timezoneInfo.countryCode)
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch timezone info' });
  }
});

// NASA EONET API endpoints
app.get('/api/cosmic-events', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const days = req.query.days ? parseInt(req.query.days as string) : 365;
    
    const events = await getCosmicEvents(limit, days);
    return res.json(events);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch cosmic events' });
  }
});

app.get('/api/cosmic-events/category/:categoryId', async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const categoryIdNum = parseInt(categoryId);
    
    if (isNaN(categoryIdNum)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const events = await getEventsByCategory(categoryIdNum, limit);
    
    return res.json(events);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch category events' });
  }
});

app.get('/api/cosmic-events/categories', async (req: Request, res: Response) => {
  try {
    const categories = await getCategories();
    return res.json(categories);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch event categories' });
  }
});

// NASA Exoplanet Archive API endpoints
app.get('/api/exoplanets', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    
    const exoplanets = await getConfirmedExoplanets(limit);
    return res.json(exoplanets);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch exoplanets' });
  }
});

app.get('/api/exoplanets/search', async (req: Request, res: Response) => {
  try {
    const searchTerm = req.query.q as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term (q) is required' });
    }
    
    const results = await searchExoplanetsByName(searchTerm, limit);
    return res.json(results);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to search exoplanets' });
  }
});

app.get('/api/exoplanets/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getExoplanetStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch exoplanet statistics' });
  }
});

// Satellite tracking API endpoints
app.get('/api/satellites/iss', async (_req: Request, res: Response) => {
  try {
    const issPosition = await getISSPosition();
    return res.json(issPosition);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch ISS position' });
  }
});

app.get('/api/satellites/iss/passes', async (req: Request, res: Response) => {
  try {
    const latitude = req.query.lat ? parseFloat(req.query.lat as string) : null;
    const longitude = req.query.lng ? parseFloat(req.query.lng as string) : null;
    const altitude = req.query.alt ? parseFloat(req.query.alt as string) : 0;
    const days = req.query.days ? parseInt(req.query.days as string) : 10;
    
    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }
    
    const passes = await getISSSPassPredictions(latitude, longitude, altitude, days);
    return res.json(passes);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch ISS pass predictions' });
  }
});

app.get('/api/satellites/info/:noradId', async (req: Request, res: Response) => {
  try {
    const noradId = parseInt(req.params.noradId);
    
    if (isNaN(noradId)) {
      return res.status(400).json({ error: 'Valid NORAD ID is required' });
    }
    
    const satelliteInfo = await getSatelliteInfo(noradId);
    return res.json(satelliteInfo);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch satellite information' });
  }
});

app.get('/api/satellites/popular', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string || 'stations';
    const satellites = await getPopularSatellites(category);
    return res.json(satellites);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch popular satellites' });
  }
});

app.get('/api/satellites/iss/relative', async (req: Request, res: Response) => {
  try {
    const latitude = req.query.lat ? parseFloat(req.query.lat as string) : null;
    const longitude = req.query.lng ? parseFloat(req.query.lng as string) : null;
    
    if (latitude === null || longitude === null || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Valid latitude and longitude are required' });
    }
    
    const relativeInfo = await getISSRelativeToUser(latitude, longitude);
    return res.json(relativeInfo);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to calculate relative ISS position' });
  }
});

// Space weather API endpoints
app.get('/api/space-weather/alerts', async (_req: Request, res: Response) => {
  try {
    const alerts = await getCurrentSpaceWeatherAlerts();
    return res.json(alerts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch space weather alerts' });
  }
});

app.get('/api/space-weather/solar-activity', async (_req: Request, res: Response) => {
  try {
    const solarActivity = await getCurrentSolarActivity();
    return res.json(solarActivity);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch solar activity data' });
  }
});

app.get('/api/space-weather/aurora-forecast', async (_req: Request, res: Response) => {
  try {
    const auroraForecast = await getAuroraForecast();
    return res.json(auroraForecast);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch aurora forecast' });
  }
});

// Asteroid tracking API endpoints
app.get('/api/asteroids/today', async (_req: Request, res: Response) => {
  try {
    const asteroids = await getTodaysAsteroids();
    return res.json(asteroids);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch today\'s asteroids' });
  }
});

app.get('/api/asteroids/range', async (req: Request, res: Response) => {
  try {
    const startDate = req.query.start as string;
    const endDate = req.query.end as string;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    
    const asteroids = await getAsteroidsByDateRange(startDate, endDate);
    return res.json(asteroids);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch asteroids by date range' });
  }
});

app.get('/api/asteroids/:id', async (req: Request, res: Response) => {
  try {
    const asteroidId = req.params.id;
    if (!asteroidId) {
      return res.status(400).json({ error: 'Asteroid ID is required' });
    }
    
    const asteroid = await getAsteroidById(asteroidId);
    if (!asteroid) {
      return res.status(404).json({ error: 'Asteroid not found' });
    }
    
    return res.json(asteroid);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch asteroid details' });
  }
});

app.get('/api/asteroids/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await getAsteroidStats();
    return res.json(stats);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch asteroid statistics' });
  }
});

app.get('/api/asteroids/hazardous', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 0;
    const size = req.query.size ? parseInt(req.query.size as string) : 20;
    
    const result = await getPotentiallyHazardousAsteroids(page, size);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch potentially hazardous asteroids' });
  }
});

// Batch update and monitoring API endpoints
app.post('/api/batch/update-exoplanets', async (_req: Request, res: Response) => {
  try {
    const result = await updateExoplanetDatabase();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update exoplanet database' });
  }
});

app.post('/api/batch/run-scheduled', async (_req: Request, res: Response) => {
  try {
    await runScheduledUpdate();
    return res.json({ success: true, message: 'Scheduled update completed' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to run scheduled update' });
  }
});

app.get('/api/batch/notifications', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const notifications = await getRecentNotifications(limit);
    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch notifications' });
  }
});

app.get('/api/batch/history', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const history = await getBatchUpdateHistory(limit);
    return res.json(history);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch batch update history' });
  }
});

app.get('/api/batch/health', async (_req: Request, res: Response) => {
  try {
    const health = await getBatchSystemHealth();
    return res.json(health);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to check batch system health' });
  }
});

app.get('/api/batch/freshness', async (_req: Request, res: Response) => {
  try {
    const freshness = await checkDataFreshness();
    return res.json(freshness);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to check data freshness' });
  }
});

// Cosmic lore generator API endpoints
app.post('/api/lore/generate', async (req: Request, res: Response) => {
  try {
    const request: LoreGenerationRequest = req.body;
    
    if (!request.planetData?.name) {
      return res.status(400).json({ error: 'Planet data with name is required' });
    }
    
    const lore = generateCosmicLore(request);
    return res.json(lore);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate cosmic lore' });
  }
});

app.post('/api/lore/generate-set', async (req: Request, res: Response) => {
  try {
    const { planetData } = req.body;
    
    if (!planetData?.name) {
      return res.status(400).json({ error: 'Planet data with name is required' });
    }
    
    const loreSet = generatePlanetLoreSet(planetData);
    return res.json(loreSet);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate planet lore set' });
  }
});

app.post('/api/lore/recommendations', async (req: Request, res: Response) => {
  try {
    const { planetData } = req.body;
    
    if (!planetData?.name) {
      return res.status(400).json({ error: 'Planet data with name is required' });
    }
    
    const recommendations = getRecommendedLore(planetData);
    return res.json(recommendations);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get lore recommendations' });
  }
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Cosmic backend listening on http://localhost:${port}`);
});


