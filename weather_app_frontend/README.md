# Weather Now (Slidev)

This Slidev deck includes an interactive weather search UI embedded on the first slide.

Getting started:
- `pnpm install`
- `pnpm dev`
- Visit http://localhost:3030 (or the configured port)

Env vars:
- VITE_API_BASE or VITE_BACKEND_URL (optional): If set, they will be used as the base URL for API requests. Otherwise, the app falls back to the Open-Meteo public API for demo purposes.

Implementation notes:
- The app uses `utils/api.ts` to resolve base URLs and perform GET requests.
- The component `components/WeatherSearch.vue` provides a responsive, modern UI styled with the Ocean Professional palette (#2563EB primary, #F59E0B secondary).
- Minimal client-side validation, loading states, and error handling are included.

TODO:
- Replace the placeholder Open-Meteo calls with a dedicated backend endpoint when available and set `VITE_API_BASE` or `VITE_BACKEND_URL` accordingly.
