<template>
  <!-- Desktop: inline right panel, always in DOM, width-based open/close (lg+) -->
  <div
    class="hidden lg:flex flex-col overflow-hidden bg-surface-base transition-[width] duration-200"
    :class="queue.isOpen ? 'w-72 border-l border-border-default' : 'w-0'"
  >
    <!-- Fixed-width inner container, clipped by outer during transition -->
    <div class="flex w-72 min-h-0 flex-1 flex-col">
      <QueuePanelContent />
    </div>
  </div>

  <!-- Mobile: Teleport overlay (hidden on lg+ via lg:hidden) -->
  <Teleport to="body">
    <Transition name="slide">
      <div
        v-if="queue.isOpen"
        class="fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-border-default bg-surface-base shadow-xl lg:hidden"
      >
        <QueuePanelContent />
      </div>
    </Transition>

    <!-- Backdrop (mobile only) -->
    <Transition name="fade">
      <div
        v-if="queue.isOpen"
        class="fixed inset-0 z-40 bg-black/40 lg:hidden"
        @click="queue.toggleOpen()"
      />
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const queue = useQueueStore()
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
