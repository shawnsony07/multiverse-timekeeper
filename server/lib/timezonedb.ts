import fetch from 'node-fetch';

const TIMEZONEDB_API_KEY = process.env.TIMEZONEDB_API_KEY;
const TIMEZONEDB_BASE_URL = 'http://api.timezonedb.com/v2.1';

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
}

export interface TimezoneListItem {
  zoneName: string;
  countryCode: string;
  countryName: string;
  gmtOffset: number;
  abbreviation: string;
}

// Fallback timezone data (same as currently hardcoded)
const fallbackTimezones: TimezoneListItem[] = [
  { zoneName: 'America/New_York', countryCode: 'US', countryName: 'United States', gmtOffset: -18000, abbreviation: 'EST' },
  { zoneName: 'America/Los_Angeles', countryCode: 'US', countryName: 'United States', gmtOffset: -28800, abbreviation: 'PST' },
  { zoneName: 'Europe/London', countryCode: 'GB', countryName: 'United Kingdom', gmtOffset: 0, abbreviation: 'GMT' },
  { zoneName: 'Europe/Berlin', countryCode: 'DE', countryName: 'Germany', gmtOffset: 3600, abbreviation: 'CET' },
  { zoneName: 'Europe/Paris', countryCode: 'FR', countryName: 'France', gmtOffset: 3600, abbreviation: 'CET' },
  { zoneName: 'Asia/Tokyo', countryCode: 'JP', countryName: 'Japan', gmtOffset: 32400, abbreviation: 'JST' },
  { zoneName: 'Australia/Sydney', countryCode: 'AU', countryName: 'Australia', gmtOffset: 36000, abbreviation: 'AEST' },
  { zoneName: 'Asia/Kolkata', countryCode: 'IN', countryName: 'India', gmtOffset: 19800, abbreviation: 'IST' },
  { zoneName: 'Asia/Shanghai', countryCode: 'CN', countryName: 'China', gmtOffset: 28800, abbreviation: 'CST' },
  { zoneName: 'America/Sao_Paulo', countryCode: 'BR', countryName: 'Brazil', gmtOffset: -10800, abbreviation: 'BRT' },
  { zoneName: 'Europe/Moscow', countryCode: 'RU', countryName: 'Russia', gmtOffset: 10800, abbreviation: 'MSK' },
  { zoneName: 'America/Toronto', countryCode: 'CA', countryName: 'Canada', gmtOffset: -18000, abbreviation: 'EST' },
  { zoneName: 'Asia/Seoul', countryCode: 'KR', countryName: 'South Korea', gmtOffset: 32400, abbreviation: 'KST' },
  { zoneName: 'America/Mexico_City', countryCode: 'MX', countryName: 'Mexico', gmtOffset: -21600, abbreviation: 'CST' },
  { zoneName: 'Europe/Rome', countryCode: 'IT', countryName: 'Italy', gmtOffset: 3600, abbreviation: 'CET' },
  { zoneName: 'Europe/Madrid', countryCode: 'ES', countryName: 'Spain', gmtOffset: 3600, abbreviation: 'CET' },
  { zoneName: 'Europe/Amsterdam', countryCode: 'NL', countryName: 'Netherlands', gmtOffset: 3600, abbreviation: 'CET' },
  { zoneName: 'Asia/Singapore', countryCode: 'SG', countryName: 'Singapore', gmtOffset: 28800, abbreviation: 'SGT' },
  { zoneName: 'Asia/Dubai', countryCode: 'AE', countryName: 'United Arab Emirates', gmtOffset: 14400, abbreviation: 'GST' },
  { zoneName: 'Africa/Johannesburg', countryCode: 'ZA', countryName: 'South Africa', gmtOffset: 7200, abbreviation: 'SAST' },
  { zoneName: 'Africa/Cairo', countryCode: 'EG', countryName: 'Egypt', gmtOffset: 7200, abbreviation: 'EET' },
  { zoneName: 'Europe/Istanbul', countryCode: 'TR', countryName: 'Turkey', gmtOffset: 10800, abbreviation: 'TRT' },
  { zoneName: 'Asia/Bangkok', countryCode: 'TH', countryName: 'Thailand', gmtOffset: 25200, abbreviation: 'ICT' },
  { zoneName: 'America/Argentina/Buenos_Aires', countryCode: 'AR', countryName: 'Argentina', gmtOffset: -10800, abbreviation: 'ART' },
  { zoneName: 'America/Santiago', countryCode: 'CL', countryName: 'Chile', gmtOffset: -10800, abbreviation: 'CLT' }
];

export async function getTimezoneList(): Promise<TimezoneListItem[]> {
  if (!TIMEZONEDB_API_KEY || TIMEZONEDB_API_KEY === 'your_timezonedb_api_key_here') {
    console.warn('TimeZoneDB API key not configured, using fallback data');
    return fallbackTimezones;
  }

  try {
    const response = await fetch(
      `${TIMEZONEDB_BASE_URL}/list-time-zone?key=${TIMEZONEDB_API_KEY}&format=json`
    );

    if (!response.ok) {
      throw new Error(`TimeZoneDB API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (data.status !== 'OK') {
      throw new Error(`TimeZoneDB API error: ${data.message}`);
    }

    // Filter to major cities and countries we want to display
    const majorTimezones = data.zones.filter((zone: any) => {
      const majorZoneNames = fallbackTimezones.map(tz => tz.zoneName);
      return majorZoneNames.includes(zone.zoneName);
    });

    return majorTimezones.map((zone: any) => ({
      zoneName: zone.zoneName,
      countryCode: zone.countryCode,
      countryName: zone.countryName,
      gmtOffset: zone.gmtOffset,
      abbreviation: zone.abbreviation
    }));

  } catch (error) {
    console.error('Failed to fetch timezone list from TimeZoneDB:', error);
    return fallbackTimezones;
  }
}

export async function getTimezoneInfo(zoneName: string): Promise<TimezoneInfo | null> {
  if (!TIMEZONEDB_API_KEY || TIMEZONEDB_API_KEY === 'your_timezonedb_api_key_here') {
    console.warn('TimeZoneDB API key not configured, using fallback calculation');
    return getFallbackTimezoneInfo(zoneName);
  }

  try {
    const response = await fetch(
      `${TIMEZONEDB_BASE_URL}/get-time-zone?key=${TIMEZONEDB_API_KEY}&format=json&by=zone&zone=${encodeURIComponent(zoneName)}`
    );

    if (!response.ok) {
      throw new Error(`TimeZoneDB API error: ${response.status}`);
    }

    const data = await response.json() as any;
    
    if (data.status !== 'OK') {
      throw new Error(`TimeZoneDB API error: ${data.message}`);
    }

    return {
      zoneName: data.zoneName,
      countryCode: data.countryCode,
      countryName: data.countryName,
      regionName: data.regionName || '',
      cityName: data.cityName || '',
      gmtOffset: data.gmtOffset,
      timestamp: data.timestamp,
      formatted: data.formatted,
      abbreviation: data.abbreviation,
      isDst: data.dst === 1
    };

  } catch (error) {
    console.error(`Failed to fetch timezone info for ${zoneName}:`, error);
    return getFallbackTimezoneInfo(zoneName);
  }
}

// Fallback timezone info calculation using JavaScript Date
function getFallbackTimezoneInfo(zoneName: string): TimezoneInfo | null {
  try {
    const now = new Date();
    const fallbackZone = fallbackTimezones.find(tz => tz.zoneName === zoneName);
    
    if (!fallbackZone) {
      return null;
    }

    // Use Intl.DateTimeFormat to get formatted time
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zoneName,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    const formatted = `${parts.find(p => p.type === 'year')?.value}-${parts.find(p => p.type === 'month')?.value}-${parts.find(p => p.type === 'day')?.value} ${parts.find(p => p.type === 'hour')?.value}:${parts.find(p => p.type === 'minute')?.value}:${parts.find(p => p.type === 'second')?.value}`;

    return {
      zoneName: fallbackZone.zoneName,
      countryCode: fallbackZone.countryCode,
      countryName: fallbackZone.countryName,
      regionName: '',
      cityName: '',
      gmtOffset: fallbackZone.gmtOffset,
      timestamp: Math.floor(now.getTime() / 1000),
      formatted: formatted,
      abbreviation: fallbackZone.abbreviation,
      isDst: false // Can't easily determine DST in fallback
    };
  } catch (error) {
    console.error(`Failed to generate fallback timezone info for ${zoneName}:`, error);
    return null;
  }
}

// Get flag emoji for country code
export function getFlagForCountryCode(countryCode: string): string {
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'JP': '🇯🇵',
    'AU': '🇦🇺',
    'IN': '🇮🇳',
    'CN': '🇨🇳',
    'BR': '🇧🇷',
    'RU': '🇷🇺',
    'CA': '🇨🇦',
    'KR': '🇰🇷',
    'MX': '🇲🇽',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'NL': '🇳🇱',
    'SG': '🇸🇬',
    'AE': '🇦🇪',
    'ZA': '🇿🇦',
    'EG': '🇪🇬',
    'TR': '🇹🇷',
    'TH': '🇹🇭',
    'AR': '🇦🇷',
    'CL': '🇨🇱'
  };
  return flags[countryCode] || '🌍';
}
