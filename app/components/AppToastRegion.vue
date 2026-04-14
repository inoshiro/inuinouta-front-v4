<template>
  <!-- Toast container: bottom-center on mobile (above PlayerBar + MobileBottomNav),
       top-right on desktop. To swap the rendering to a library, replace this component only. -->
  <Teleport to="body">
    <div
      v-if="store.items.length > 0"
      class="fixed bottom-[calc(env(safe-area-inset-bottom)+8rem)] left-1/2 z-200 flex w-[calc(100vw-2rem)] max-w-xs -translate-x-1/2 flex-col gap-2 lg:bottom-auto lg:left-auto lg:right-4 lg:top-4 lg:w-80 lg:translate-x-0"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="item in store.items"
          :key="item.id"
          class="flex items-start gap-3 border px-4 py-3 shadow-lg"
          :class="
            item.type === 'success'
              ? 'border-emerald-700 bg-surface-raised text-gray-50'
              : 'border-red-700 bg-surface-raised text-gray-50'
          "
        >
          <!-- Icon -->
          <FontAwesomeIcon
            v-if="item.type === 'success'"
            :icon="['fas', 'check']"
            class="mt-0.5 h-4 w-4 shrink-0 text-selected-text"
          />
          <FontAwesomeIcon
            v-else
            :icon="['fas', 'xmark']"
            class="mt-0.5 h-4 w-4 shrink-0 text-red-400"
          />

          <!-- Message -->
          <p class="min-w-0 flex-1 text-sm">
            {{ item.message }}
            <NuxtLink
              v-if="item.link"
              :to="item.link"
              class="ml-1 underline hover:text-white"
              @click="store.dismiss(item.id)"
            >
              開く
            </NuxtLink>
          </p>

          <!-- Dismiss -->
          <button
            class="ml-auto shrink-0 p-2 text-gray-400 hover:text-white"
            aria-label="閉じる"
            @click="store.dismiss(item.id)"
          >
            <FontAwesomeIcon :icon="['fas', 'xmark']" class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const store = useNotificationsStore()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    translate 0.2s ease;
}
.toast-move {
  transition: transform 0.2s ease;
}
/* Mobile default: slide up from below */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  translate: 0 1rem;
}
/* Desktop: slide in from the right */
@media (min-width: 1024px) {
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    translate: 1rem 0;
  }
}
</style>
