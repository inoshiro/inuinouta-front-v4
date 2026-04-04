<template>
  <!-- Toast container: fixed top-right, above all panels.
       To swap the rendering to a library, replace this component only. -->
  <Teleport to="body">
    <div
      v-if="store.items.length > 0"
      class="fixed right-4 top-16 z-200 flex w-80 flex-col gap-2 lg:top-4"
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
            class="ml-auto shrink-0 p-1 text-gray-400 hover:text-white"
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
    transform 0.2s ease;
}
.toast-move {
  transition: transform 0.2s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(1rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>
