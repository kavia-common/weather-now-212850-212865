import { apiGet } from './api';

export interface CurrentWeatherData {
  city: string;
  temperature: number; // Celsius
  condition: string;
  wind: number; // km/h
  humidity?: number; // optional when unavailable from source
}

interface OpenMeteoForecastResp {
  current_weather?: {
    temperature?: number; // °C
    windspeed?: number; // km/h
    weathercode?: number;
  };
  hourly?: {
    time?: string[];
    relative_humidity_2m?: number[];
  };
}

interface GeocodeItem {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

// PUBLIC_INTERFACE
export async function fetchWeatherByCity(
  city: string
): Promise<{ ok: true; data: CurrentWeatherData } | { ok: false; error: string }> {
  /**
   * Fetches geocoding results then current weather for the first match.
   * Uses Open-Meteo public APIs as placeholder when no backend is provided.
   * Uses widely-supported params: current_weather=true with hourly humidity fallback.
   */
  const cleaned = (city || '').trim();
  if (!cleaned) return { ok: false, error: 'Please enter a city name.' };
  if (cleaned.length < 2) return { ok: false, error: 'City name must be at least 2 characters.' };

  // Geocode to coordinates
  const geoRes = await apiGet<{ results?: GeocodeItem[] }>(
    'https://geocoding-api.open-meteo.com/v1/search',
    { name: cleaned, count: 1 }
  );
  if (!geoRes.ok) return { ok: false, error: geoRes.error || 'Failed to search city.' };

  const loc = geoRes.data?.results?.[0];
  if (!loc) return { ok: false, error: 'City not found. Try another search.' };

  // Fetch current weather (broadly supported)
  const weatherRes = await apiGet<OpenMeteoForecastResp>('forecast', {
    latitude: loc.latitude,
    longitude: loc.longitude,
    current_weather: true,
    hourly: 'relative_humidity_2m',
    timezone: 'auto',
  });
  if (!weatherRes.ok) return { ok: false, error: weatherRes.error || 'Failed to fetch weather.' };

  const cw = weatherRes.data?.current_weather;
  if (!cw) return { ok: false, error: 'No weather data available.' };

  // Attempt to match current hour humidity
  let humidity: number | undefined = undefined;
  const hourly = weatherRes.data?.hourly;
  if (
    hourly?.time &&
    hourly?.relative_humidity_2m &&
    hourly.time.length === hourly.relative_humidity_2m.length
  ) {
    try {
      // Compare by hour prefix for a simple, locale-agnostic match
      const nowIsoHour = new Date().toISOString().slice(0, 13); // e.g. "2025-12-01T13"
      const idx = hourly.time.findIndex((t) => (t || '').slice(0, 13) === nowIsoHour);
      if (idx >= 0) {
        const h = hourly.relative_humidity_2m[idx];
        if (typeof h === 'number') humidity = h;
      }
    } catch {
      // ignore matching errors and keep humidity undefined
    }
  }

  return {
    ok: true,
    data: {
      city: [loc.name, loc.admin1, loc.country].filter(Boolean).join(', '),
      temperature: typeof cw.temperature === 'number' ? cw.temperature : NaN,
      wind: typeof cw.windspeed === 'number' ? cw.windspeed : NaN,
      humidity,
      condition: mapWeatherCodeToLabel(cw.weathercode),
    },
  };
}

// PUBLIC_INTERFACE
export function mapWeatherCodeToLabel(code?: number): string {
  /** Maps Open-Meteo WMO weather codes to human-readable strings. */
  const table: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle (light)',
    57: 'Freezing drizzle (dense)',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Freezing rain (light)',
    67: 'Freezing rain (heavy)',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  if (code === undefined || code === null) return 'Unknown';
  return table[code] || 'Unknown';
}
