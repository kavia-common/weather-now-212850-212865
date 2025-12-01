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
    console.log('[setup] Registered custom Slidev components (WeatherSearch).')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[setup] Failed to register components:', e)
  }
})
