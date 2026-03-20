<template>
  <div class="min-h-screen bg-gray-950 text-white font-sans">
    <header class="border-b border-gray-800">
      <nav class="mx-auto max-w-7xl px-4 py-4">
        <NuxtLink to="/" class="text-xl font-bold tracking-tight"> inuinouta </NuxtLink>
      </nav>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
      &copy; {{ new Date().getFullYear() }} inuinouta
    </footer>
  </div>
</template>
