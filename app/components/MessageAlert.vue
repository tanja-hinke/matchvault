<script setup lang="ts">
const props = withDefaults(defineProps<{
  type?: 'error' | 'success' | 'warning' | 'info'
}>(), {
  type: 'info',
})

const alertClasses = computed(() => {
  if (props.type === 'error') {
    return 'bg-red-50 text-red-700'
  }

  if (props.type === 'success') {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (props.type === 'warning') {
    return 'bg-amber-50 text-amber-800'
  }

  return 'bg-slate-100 text-slate-600'
})
</script>

<template>
  <div
    class="rounded-xl p-4 text-sm font-semibold"
    :class="alertClasses"
  >
    <slot />
  </div>
</template>
