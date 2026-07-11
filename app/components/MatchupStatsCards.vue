<script setup lang="ts">
import { formatWinRate } from '~/utils/battle-log-formatting'

defineProps<{
  wins: number
  losses: number
  draws: number
  total: number
  winRate: number
  fourthLabel: string
  fourthValue: number
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-4">
    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
        Kampfbilanz
      </p>

      <p class="mt-2 text-3xl font-black">
        {{ wins }}-{{ losses }}
      </p>

      <p v-if="draws > 0" class="mt-1 text-sm font-semibold text-slate-500">
        {{ draws }} Draws
      </p>
    </article>

    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
        Siegesquote
      </p>

      <p class="mt-2 text-3xl font-black">
        {{ formatWinRate(winRate) }}
      </p>
    </article>

    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
        Spiele
      </p>

      <p class="mt-2 text-3xl font-black">
        {{ total }}
      </p>
    </article>

    <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
        {{ fourthLabel }}
      </p>

      <p class="mt-2 text-3xl font-black">
        {{ fourthValue }}
      </p>
    </article>
  </div>
</template>
