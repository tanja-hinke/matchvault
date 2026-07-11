<script setup lang="ts">
withDefaults(defineProps<{
  pokemon1Name: string | null
  pokemon1SpriteUrl: string | null
  pokemon2Name?: string | null
  pokemon2SpriteUrl?: string | null
  fallbackAlt: string
  size?: 'sm' | 'md'
}>(), {
  pokemon2Name: null,
  pokemon2SpriteUrl: null,
  size: 'md',
})
</script>

<template>
  <div
    class="flex items-center gap-1"
    :class="size === 'sm' ? 'min-w-8' : 'min-w-16'"
  >
    <div
      v-if="pokemon1SpriteUrl"
      class="flex items-center justify-center"
      :class="size === 'sm' ? 'h-8 w-8' : 'h-16 w-16'"
    >
      <img
        :src="pokemon1SpriteUrl"
        :alt="pokemon1Name || fallbackAlt"
        class="object-contain"
        :class="size === 'sm' ? 'h-8 w-8' : 'h-18 w-18'"
      >
    </div>

    <div
      class="flex items-center justify-center"
      :class="size === 'sm' ? 'h-8 w-8' : 'h-16 w-16'"
    >
      <img
        v-if="pokemon2SpriteUrl"
        :src="pokemon2SpriteUrl"
        :alt="pokemon2Name || fallbackAlt"
        class="object-contain"
        :class="size === 'sm' ? 'h-8 w-8' : 'h-18 w-18'"
      >
    </div>
  </div>
</template>
