<template>
  <button
    type="button"
    class="inline-flex items-center justify-center transition-transform duration-150 ease-out active:scale-90 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-selected-border"
    :class="[sizeClasses, colorClasses]"
    :aria-pressed="pressed === null ? undefined : pressed"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
// Presentational-only icon button: hit area, press/disabled/focus feedback, and
// toggle-state color. Business logic stays in the caller.
const props = withDefaults(
  defineProps<{
    /** Toggle state for state-holding actions (mute, repeat, queue open, favorite). Omit for stateless actions. */
    pressed?: boolean | null
    disabled?: boolean
    size?: 'sm' | 'md'
  }>(),
  { pressed: null, size: 'md' },
)

const sizeClasses = computed(() => (props.size === 'sm' ? 'p-1.5' : 'p-2'))
const colorClasses = computed(() =>
  props.pressed ? 'text-selected-text' : 'text-gray-400 hover:text-white',
)
</script>
