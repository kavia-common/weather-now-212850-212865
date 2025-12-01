import { apiGet } from './api';

export interface CurrentWeatherData {
  city: string;
  temperature: number; // Celsius
  condition: string;
  wind: number; // km/h
  humidity?: number; // optional when unavailable from source
}

interface OpenMeteoWeatherResp {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
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
export async function fetchWeatherByCity(city: string): Promise<{ ok: true; data: CurrentWeatherData } | { ok: false; error: string }> {
  /**
   * Fetches geocoding results then current weather for the first match.
   * Uses Open-Meteo public APIs as placeholder when no backend is provided.
   * TODO: Replace with backend aggregation endpoint when available.
   */
  const cleaned = (city || '').trim();
  if (!cleaned) return { ok: false, error: 'Please enter a city name.' };
  if (cleaned.length < 2) return { ok: false, error: 'City name must be at least 2 characters.' };

  // Use Open-Meteo geocoding to resolve coordinates
  const geoRes = await apiGet<{ results?: GeocodeItem[] }>('https://geocoding-api.open-meteo.com/v1/search', {
    name: cleaned,
    count: 1,
  });

  if (!geoRes.ok) return { ok: false, error: geoRes.error || 'Failed to search city.' };
  const loc = geoRes.data?.results?.[0];
  if (!loc) return { ok: false, error: 'City not found. Try another search.' };

  // Fetch current weather
  const weatherRes = await apiGet<OpenMeteoWeatherResp>('forecast', {
    latitude: loc.latitude,
    longitude: loc.longitude,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
  });

  if (!weatherRes.ok) return { ok: false, error: weatherRes.error || 'Failed to fetch weather.' };

  const current = weatherRes.data?.current;
  if (!current) return { ok: false, error: 'No weather data available.' };

  return {
    ok: true,
    data: {
      city: [loc.name, loc.admin1, loc.country].filter(Boolean).join(', '),
      temperature: typeof current.temperature_2m === 'number' ? current.temperature_2m : NaN,
      wind: typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : NaN,
      humidity: typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : undefined,
      condition: mapWeatherCodeToLabel(current.weather_code),
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
