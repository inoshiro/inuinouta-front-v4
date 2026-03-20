<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-surface-base text-white">
    <h1 class="text-4xl font-bold">{{ error?.statusCode ?? 'エラー' }}</h1>
    <p class="mt-4 text-gray-400">{{ error?.statusMessage ?? '予期しないエラーが発生しました' }}</p>
    <button
      class="mt-8 bg-emerald-500 px-6 py-2 font-medium hover:bg-emerald-400"
      @click="handleError"
    >
      トップページへ戻る
    </button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>
