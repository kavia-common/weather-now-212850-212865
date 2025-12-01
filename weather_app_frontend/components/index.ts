import WeatherSearch from './WeatherSearch.vue';

// PUBLIC_INTERFACE
export function registerSlidevComponents(app: any) {
  /** Registers slide-specific components globally so they can be used in slides without relative imports. */
  app.component('WeatherSearch', WeatherSearch);
}
