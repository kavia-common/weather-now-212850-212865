<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { fetchWeatherByCity, type CurrentWeatherData } from '../utils/weather';

const city = ref('');
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const result = ref<CurrentWeatherData | null>(null);

onMounted(() => {
  // eslint-disable-next-line no-console
  console.debug('[WeatherSearch] component mounted');
});

function validateCity(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return 'Please enter a city.';
  if (trimmed.length < 2) return 'City name must be at least 2 characters.';
  if (/[^a-zA-Z\u00C0-\u024F\s'.-]/.test(trimmed)) return 'Please use letters and spaces only.';
  return null;
}

async function onSearch() {
  errorMsg.value = null;
  result.value = null;
  const validation = validateCity(city.value);
  if (validation) {
    errorMsg.value = validation;
    return;
  }
  loading.value = true;
  const res = await fetchWeatherByCity(city.value);
  loading.value = false;
  if (!res.ok) {
    errorMsg.value = res.error;
    return;
  }
  result.value = res.data;
}

function onKeypress(e: KeyboardEvent) {
  if (e.key === 'Enter') onSearch();
}
</script>

<template>
  <div class="weather-app">
    <!-- Mount confirmation header (can be removed later) -->
    <div class="mounted-banner" role="status" aria-live="polite">
      WeatherSearch component mounted
    </div>
    <div class="search-card">
      <h2 class="title">Weather Now</h2>
      <p class="subtitle">Enter a city to view current conditions</p>

      <div class="search-row">
        <input
          v-model="city"
          type="text"
          :disabled="loading"
          class="search-input"
          placeholder="e.g., London, Paris, New York"
          @keypress="onKeypress"
          aria-label="City name"
        />
        <button class="search-btn" :disabled="loading" @click="onSearch">
          <span v-if="!loading">Search</span>
          <span v-else class="spinner" aria-hidden="true"></span>
        </button>
      </div>

      <p v-if="errorMsg" class="error-text" role="alert">{{ errorMsg }}</p>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-header">
        <div class="city">{{ result.city }}</div>
        <div class="temp">
          {{ Math.round(result.temperature) }}°C
        </div>
      </div>

      <div class="metrics">
        <div class="metric">
          <div class="label">Condition</div>
          <div class="value">{{ result.condition }}</div>
        </div>
        <div class="metric">
          <div class="label">Humidity</div>
          <div class="value">
            <span v-if="typeof result.humidity === 'number'">{{ Math.round(result.humidity) }}%</span>
            <span v-else>—</span>
          </div>
        </div>
        <div class="metric">
          <div class="label">Wind</div>
          <div class="value">{{ Math.round(result.wind) }} km/h</div>
        </div>
      </div>
    </div>

    <div v-else class="placeholder-hint">
      <div class="hint-badge">Tip</div>
      <div class="hint-text">Try searching for your nearest city.</div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --primary: #2563EB;   /* Blue 600 */
  --secondary: #F59E0B; /* Amber 500 */
  --surface: #111827;   /* Dark BG from style guide text color overridden for contrast */
  --text: #F4F4F5;
  --muted: #C9C9CF;
  --danger: #EF4444;
}

.weather-app {
  display: grid;
  justify-items: center;
  gap: 18px;
  width: 100%;
}

.search-card {
  width: min(860px, 100%);
  background: var(--theme-bg-elevated);
  border: 1px solid var(--line, var(--theme-border-subtle));
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 28px rgba(0,0,0,0.28);
}

.title {
  margin: 0;
  font-size: clamp(22px, 2.3vw, 28px);
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--primary), #60a5fa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subtitle {
  margin-top: 6px;
  color: var(--theme-text-secondary);
}

.search-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  margin-top: 14px;
}

.search-input {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--line, var(--theme-border-subtle));
  background: var(--theme-bg-elev-2);
  color: var(--text, var(--theme-text-primary));
  padding: 12px 14px;
  outline: none;
  transition: box-shadow 150ms ease, border-color 150ms ease, background 150ms ease;
}
.search-input:focus {
  border-color: color-mix(in oklab, var(--primary) 50%, var(--theme-border-subtle));
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 20%, #0000);
  background: color-mix(in oklab, var(--theme-bg-elev-2) 90%, #0000);
}

.search-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  padding: 12px 18px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background: var(--primary);
  color: white;
  font-weight: 700;
  transition: transform 120ms ease, filter 120ms ease;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.35);
}
.search-btn:hover { transform: translateY(-1px); filter: brightness(1.05); }
.search-btn:active { transform: translateY(0); filter: brightness(0.98); }
.search-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-text {
  color: var(--danger);
  margin-top: 10px;
}

.result-card {
  width: min(860px, 100%);
  background: linear-gradient(180deg, rgba(37,99,235,0.10), rgba(17,24,39,0.2));
  border: 1px solid color-mix(in oklab, var(--primary) 30%, var(--theme-border-subtle));
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(0,0,0,0.32);
}

.result-header {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 12px;
  border-bottom: 1px solid var(--line, var(--theme-border-subtle));
  padding-bottom: 10px;
}
.city {
  font-size: clamp(18px, 2vw, 22px);
  font-weight: 700;
}
.temp {
  font-size: clamp(28px, 4vw, 48px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}
.metric {
  background: var(--theme-bg-elevated);
  border: 1px solid var(--line, var(--theme-border-subtle));
  border-radius: 14px;
  padding: 12px 14px;
}
.label {
  font-size: 12px;
  text-transform: uppercase;
  color: var(--muted, var(--theme-text-secondary));
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}
.value {
  font-size: clamp(16px, 1.6vw, 18px);
  font-weight: 700;
}

.mounted-banner {
  font-size: 12px;
  color: var(--muted, var(--theme-text-secondary));
  background: color-mix(in oklab, var(--primary) 6%, #000);
  border: 1px solid color-mix(in oklab, var(--primary) 18%, #000);
  border-radius: 8px;
  padding: 6px 10px;
  margin-bottom: 6px;
  width: min(860px, 100%);
  text-align: left;
}

.placeholder-hint {
  display: grid;
  align-items: center;
  justify-items: center;
  gap: 8px;
  color: var(--muted, var(--theme-text-secondary));
}
.hint-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--secondary) 40%, var(--theme-border-subtle));
  background: color-mix(in oklab, var(--secondary) 12%, #000);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hint-text {
  color: var(--theme-text-secondary);
}

@media (max-width: 640px) {
  .search-row { grid-template-columns: 1fr; }
  .search-btn { width: 100%; }
  .metrics { grid-template-columns: 1fr; }
}
</style>
