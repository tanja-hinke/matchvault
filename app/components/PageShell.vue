<script setup lang="ts">
withDefaults(defineProps<{
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '5xl' | '6xl'
}>(), {
  maxWidth: '6xl',
})

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
    <section
      class="mx-auto"
      :class="maxWidthClasses[maxWidth]"
    >
      <slot />
    </section>
  </main>
</template>
