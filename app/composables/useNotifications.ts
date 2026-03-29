// Public notification API — this is the library swap boundary.
// All feature code calls only success() / error() from this composable.
// To replace with a library (e.g. vue-sonner): update only this file and
// AppToastRegion.vue. Callers remain unchanged.
export function useNotifications() {
  const store = useNotificationsStore()

  return {
    success: (message: string, link?: string) => store.push({ type: 'success', message, link }),
    error: (message: string) => store.push({ type: 'error', message }),
  }
}
