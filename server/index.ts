import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getPlanetaryData } from './lib/horizons';
import { getTimezoneList, getTimezoneInfo, getFlagForCountryCode, type TimezoneListItem, type TimezoneInfo } from './lib/timezonedb';
import { getCosmicEvents, getEventsByCategory, getCategories, type CosmicEvent } from './lib/eonet';

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

app.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Cosmic backend listening on http://localhost:${port}`);
});


