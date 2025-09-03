type BodyName = 'earth' | 'mars' | 'moon';

const BODY_TO_COMMAND: Record<BodyName, string> = {
  earth: '399', // Earth barycenter: 3xx family; Earth is 399
  mars: '499',
  moon: '301',
};

// Quantities reference (used for OBSERVER). For VECTORS, Horizons ignores QUANTITIES.
const DEFAULT_QUANTITIES = '1,20,23,4';

export interface PlanetaryResult {
  position: { x: number; y: number; z: number };
  distanceFromEarth: number | null;
  localSolarTime: string | null;
  julianDate: number | null;
  raw: unknown;
}

function extractCsvBlock(resultText: string): string[] {
  const lines = resultText.split(/\r?\n/);
  const start = lines.findIndex(l => l.trim().startsWith('$$SOE'));
  const end = lines.findIndex(l => l.trim().startsWith('$$EOE'));
  if (start === -1 || end === -1 || end <= start + 1) return [];
  return lines.slice(start + 1, end).filter(l => l.trim().length > 0);
}

function parseVectorsCsv(resultText: string): { x: number; y: number; z: number; jd: number | null } | null {
  const lines = extractCsvBlock(resultText);
  if (!lines.length) return null;
  // Header is the first non-empty line before $$SOE that contains commas; find it backwards
  const allLines = resultText.split(/\r?\n/);
  let header = '';
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].includes('JDTDB') && allLines[i].includes('X')) {
      header = allLines[i];
      break;
    }
  }
  const headerCols = header ? header.split(',').map(s => s.trim()) : [];
  const last = lines[lines.length - 1];
  const cols = last.split(',').map(s => s.trim());
  const idxX = headerCols.indexOf('X');
  const idxY = headerCols.indexOf('Y');
  const idxZ = headerCols.indexOf('Z');
  const idxJD = headerCols.indexOf('JDTDB');
  const x = idxX >= 0 ? Number(cols[idxX]) : NaN;
  const y = idxY >= 0 ? Number(cols[idxY]) : NaN;
  const z = idxZ >= 0 ? Number(cols[idxZ]) : NaN;
  const jd = idxJD >= 0 ? Number(cols[idxJD]) : null;
  return { x, y, z, jd };
}

function parseObserverCsv(resultText: string): { lst: string | null; jd: number | null } {
  const lines = extractCsvBlock(resultText);
  if (!lines.length) return { lst: null, jd: null };
  const allLines = resultText.split(/\r?\n/);
  let header = '';
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].includes('JD') && allLines[i].toUpperCase().includes('LST')) {
      header = allLines[i];
      break;
    }
  }
  const headerCols = header ? header.split(',').map(s => s.trim()) : [];
  const last = lines[lines.length - 1];
  const cols = last.split(',').map(s => s.trim());
  const idxJD = headerCols.findIndex(h => h === 'JD' || h === 'JDTDB');
  const idxLST = headerCols.findIndex(h => h.toUpperCase() === 'LST');
  const jd = idxJD >= 0 ? Number(cols[idxJD]) : null;
  const lst = idxLST >= 0 ? String(cols[idxLST]) : null;
  return { lst, jd };
}

export async function getPlanetaryData(body: string, startTime: string, stopTime: string, step: string): Promise<PlanetaryResult> {
  const normalized = body.toLowerCase() as BodyName;
  if (!(normalized in BODY_TO_COMMAND)) {
    throw new Error(`Unsupported body: ${body}. Use Earth, Mars, or Moon.`);
  }

  const command = BODY_TO_COMMAND[normalized];

  // First call: VECTORS, geocentric center, CSV output for easy parsing
  const vecParams = new URLSearchParams();
  vecParams.set('format', 'json');
  vecParams.set('COMMAND', command); // no quotes in params
  vecParams.set('MAKE_EPHEM', 'YES');
  vecParams.set('EPHEM_TYPE', 'VECTORS');
  vecParams.set('CENTER', '500@399');
  vecParams.set('START_TIME', startTime);
  vecParams.set('STOP_TIME', stopTime);
  vecParams.set('STEP_SIZE', step);
  vecParams.set('VEC_TABLE', '2');
  vecParams.set('OUT_UNITS', 'AU-D');
  vecParams.set('CSV_FORMAT', 'YES');

  const vecUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?${vecParams.toString()}`;
  const resp = await fetch(vecUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });

  if (!resp.ok) {
    throw new Error(`Horizons API error: ${resp.status}`);
  }

  const vecJson = await resp.json();
  const vecParsed = typeof vecJson?.result === 'string' ? parseVectorsCsv(vecJson.result) : null;

  let x = NaN, y = NaN, z = NaN, jd: number | null = null;
  if (vecParsed) {
    x = vecParsed.x; y = vecParsed.y; z = vecParsed.z; jd = vecParsed.jd;
  }

  // Optional second call for local solar time (Mars/Moon) using OBSERVER
  let lst: string | null = null;
  let jdObs: number | null = null;
  if (normalized === 'mars' || normalized === 'moon') {
    const obsParams = new URLSearchParams();
    obsParams.set('format', 'json');
    obsParams.set('COMMAND', command);
    obsParams.set('MAKE_EPHEM', 'YES');
    obsParams.set('EPHEM_TYPE', 'OBSERVER');
    obsParams.set('CENTER', '500@399');
    obsParams.set('START_TIME', startTime);
    obsParams.set('STOP_TIME', stopTime);
    obsParams.set('STEP_SIZE', step);
    obsParams.set('QUANTITIES', '4,20'); // LST and JD
    obsParams.set('CSV_FORMAT', 'YES');

    const obsUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?${obsParams.toString()}`;
    const obsResp = await fetch(obsUrl, { method: 'GET', headers: { 'Accept': 'application/json' } });
    if (obsResp.ok) {
      const obsJson = await obsResp.json();
      const obsParsed = typeof obsJson?.result === 'string' ? parseObserverCsv(obsJson.result) : { lst: null, jd: null };
      lst = obsParsed.lst;
      jdObs = obsParsed.jd;
    }
  }

  const distanceFromEarth = isFinite(x) && isFinite(y) && isFinite(z)
    ? Math.sqrt(x * x + y * y + z * z)
    : null;

  return {
    position: { x, y, z },
    distanceFromEarth,
    localSolarTime: lst,
    julianDate: jdObs ?? jd,
    raw: { vectors: vecJson },
  };
}


