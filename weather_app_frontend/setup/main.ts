import { defineAppSetup } from '@slidev/types'
import { registerSlidevComponents } from '../components'

// PUBLIC_INTERFACE
export default defineAppSetup(({ app }) => {
  /**
   * Slidev setup hook that receives the Vue app instance.
   * We register our custom components here so they are globally available
   * inside markdown slides without explicit imports.
   */
  try {
    registerSlidevComponents(app)
    // Optional console for verification during dev
    // eslint-disable-next-line no-console
    const has = !!(app as any)._context.components?.WeatherSearch
    console.log('[setup] Registered custom Slidev components: WeatherSearch', { registered: has })

    if (!has) {
      // eslint-disable-next-line no-console
      console.warn('[setup] WeatherSearch was not found in app context components. Slides have a local-import fallback, but please verify global registration paths.')
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[setup] Failed to register components:', e)
  }
})
