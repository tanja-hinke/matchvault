<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 mb-8 shadow-sm md:flex-row md:items-center md:justify-between">
    <div>
      <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
        MatchVault
      </p>

      <h1 class="mt-2 text-4xl font-black">
        {{ title }}
      </h1>

      <p
        v-if="description"
        class="mt-3 text-slate-600"
      >
        {{ description }}
      </p>
    </div>

    <div
      v-if="$slots.actions"
      class="flex flex-wrap gap-3"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
