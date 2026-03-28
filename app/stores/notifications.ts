export interface Notification {
  id: string
  type: 'success' | 'error'
  message: string
  link?: string
}

// Internal store — do not import directly from feature code.
// Use useNotifications() composable instead; that is the swap boundary.
export const useNotificationsStore = defineStore('notifications', () => {
  const items = ref<Notification[]>([])

  function push(notification: Omit<Notification, 'id'>) {
    const id = crypto.randomUUID()
    items.value.push({ id, ...notification })
    setTimeout(() => dismiss(id), 3000)
  }

  function dismiss(id: string) {
    const index = items.value.findIndex((n) => n.id === id)
    if (index !== -1) items.value.splice(index, 1)
  }

  return { items: readonly(items), push, dismiss }
})
