import WeatherSearch from './WeatherSearch.vue';

// PUBLIC_INTERFACE
export function registerSlidevComponents(app: any) {
  /** Registers slide-specific components globally so they can be used in slides without relative imports. */
  app.component('WeatherSearch', WeatherSearch);

  /**
   * Also attach to globalThis (dev only) as a fallback in case Slidev/Vite HMR or
   * SSR timing prevents initial registration from being picked up on the first pass.
   * This allows direct access in advanced setups where app.component isn't yet effective.
   */
  try {
    (globalThis as any).__SlidevGlobalComponents__ = (globalThis as any).__SlidevGlobalComponents__ || {};
    (globalThis as any).__SlidevGlobalComponents__.WeatherSearch = WeatherSearch;
  } catch {
    // no-op
  }
}
