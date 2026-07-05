<script setup lang="ts">
import type { BattleLog } from '~/types/battle-log'
import { createDeckRows } from '~/utils/matchup-rows'
import MatchupStatsCards from '~/components/MatchupStatsCards.vue'
import MatchupAccordionTable from "~/components/MatchupAccordionTable.vue";
import PageShell from "~/components/PageShell.vue";
import PageHeader from "~/components/PageHeader.vue";
import { useBattleLogFilters } from "~/composables/useBattleLogFilters";
import { useBattleLogs } from "~/composables/useBattleLogs";

definePageMeta({
  middleware: ['auth'],
})

const {
  logs,
  isLoading,
  errorMessage,
  loadLogs,
} = useBattleLogs()

const {
  startPositionFilter,
  formatFilter,
  searchFilter,
  dateFromFilter,
  dateToFilter,
  availableFormats,
  filteredLogs,
  resetFilters,
} = useBattleLogFilters({
  logs,
  searchableFields: [
    'own_deck_name',
    'own_pokemon_1_name',
    'own_pokemon_2_name',
    'opponent_deck_name',
    'opponent_pokemon_1_name',
    'opponent_pokemon_2_name',
    'format',
  ],
})

const deckRows = computed(() => createDeckRows(filteredLogs.value))

const totalStats = computed(() => {
  const wins = filteredLogs.value.filter((log) => log.result === 'win').length
  const losses = filteredLogs.value.filter((log) => log.result === 'loss').length
  const draws = filteredLogs.value.filter((log) => log.result === 'draw').length
  const unknown = filteredLogs.value.filter((log) => log.result === 'unknown').length
  const total = filteredLogs.value.length
  const decidedGames = wins + losses

  return {
    wins,
    losses,
    draws,
    unknown,
    total,
    winRate: decidedGames > 0
      ? (wins / decidedGames) * 100
      : 0,
  }
})

const openDeckName = ref<string | null>(null)

const toggleDeckAccordion = (deckName: string) => {
  openDeckName.value = openDeckName.value === deckName
    ? null
    : deckName
}

watch(deckRows, (rows) => {
  if (rows.length === 0) {
    openDeckName.value = null
    return
  }

  const openDeckStillExists = rows.some((row) => row.deckName === openDeckName.value)

  if (!openDeckStillExists) {
    openDeckName.value = null
  }
})

const getDeckUrl = (deckName: string) => {
  return `/matchups/${encodeURIComponent(deckName)}`
}

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <PageShell max-width="6xl">
    <PageHeader
      title="Matchups"
      description="Analysiere deine Matchups basierend auf gespeicherten Kampflogs."
    >
      <template #actions>
        <NuxtLink
          to="/logs"
          class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
        >
          Logs
        </NuxtLink>

        <NuxtLink
          to="/dashboard"
          class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
        >
          Dashboard
        </NuxtLink>
      </template>
    </PageHeader>

      <MatchupFilterPanel
        v-model:search-filter="searchFilter"
        v-model:date-from-filter="dateFromFilter"
        v-model:date-to-filter="dateToFilter"
        v-model:start-position-filter="startPositionFilter"
        v-model:format-filter="formatFilter"
        :visible-log-count="filteredLogs.length"
        :total-log-count="logs.length"
        :available-formats="availableFormats"
        search-placeholder="Deck, Pokémon, Format..."
        @reset="resetFilters"
      />

      <MatchupStatsCards
        class="mt-8"
        :wins="totalStats.wins"
        :losses="totalStats.losses"
        :draws="totalStats.draws"
        :total="totalStats.total"
        :win-rate="totalStats.winRate"
        fourth-label="Decks"
        :fourth-value="deckRows.length"
      />

      <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-2xl font-black">
            Deine Decks
          </h2>

          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            @click="loadLogs"
          >
            Aktualisieren
          </button>
        </div>

        <div v-if="isLoading" class="text-slate-600">
          Matchups werden geladen...
        </div>

        <div v-else-if="errorMessage" class="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {{ errorMessage }}
        </div>

        <div v-else-if="deckRows.length === 0" class="rounded-xl bg-slate-100 p-6 text-slate-600">
          Keine eigenen Decks gefunden.
        </div>

        <MatchupAccordionTable
          v-else
          type="own"
          :rows="deckRows"
          :open-row-name="openDeckName"
          :get-details-url="getDeckUrl"
          @toggle="toggleDeckAccordion"
        />
      </div>
  </PageShell>
</template>
