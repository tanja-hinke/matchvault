<script setup lang="ts">
import type { BattleLog } from '~/types/battle-log'
import { createOpponentMatchupRows } from '~/utils/matchup-rows'
import MatchupAccordionTable from "~/components/MatchupAccordionTable.vue";
import {useBattleLogFilters} from "~/composables/useBattleLogFilters";
import {useBattleLogs} from "~/composables/useBattleLogs";


definePageMeta({
  middleware: ['auth'],
})

const route = useRoute()

const deckName = computed(() => decodeURIComponent(String(route.params.deck)))

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
    'opponent_deck_name',
    'opponent_pokemon_1_name',
    'opponent_pokemon_2_name',
    'format',
  ],
})

const deckPreview = computed(() => {
  return logs.value[0] ?? null
})

const matchupRows = computed(() => createOpponentMatchupRows(filteredLogs.value))

const openOpponentDeckName = ref<string | null>(null)

const toggleOpponentDeckAccordion = (opponentDeckName: string) => {
  openOpponentDeckName.value = openOpponentDeckName.value === opponentDeckName
    ? null
    : opponentDeckName
}

watch(matchupRows, (rows) => {
  if (rows.length === 0) {
    openOpponentDeckName.value = null
    return
  }

  const openDeckStillExists = rows.some((row) => row.opponentDeckName === openOpponentDeckName.value)

  if (!openDeckStillExists) {
    openOpponentDeckName.value = null
  }
})

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

const formatDate = (dateValue: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

onMounted(() => {
  loadLogs({
    ownDeckName: deckName.value,
  })
})
</script>

<template>
  <PageShell max-width="6xl">
    <PageHeader
      title="Matchups"
      description="Detaillierte Matchup-Statistik für dieses Deck."
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

        <NuxtLink
          to="/matchups"
          class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
        >
          Zurück zu deinen Decks
        </NuxtLink>
      </template>
    </PageHeader>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-center gap-1">
          <PokemonSpritePair
            :pokemon1-name="deckPreview?.own_pokemon_1_name ?? null"
            :pokemon1-sprite-url="deckPreview?.own_pokemon_1_sprite_url ?? null"
            :pokemon2-name="deckPreview?.own_pokemon_2_name ?? null"
            :pokemon2-sprite-url="deckPreview?.own_pokemon_2_sprite_url ?? null"
            :fallback-alt="deckName"
          />

          <p class="text-xl font-black text-slate-950">
            {{ deckName }}
          </p>
        </div>
      </div>

      <MatchupFilterPanel
        class="mt-8"
        v-model:search-filter="searchFilter"
        v-model:date-from-filter="dateFromFilter"
        v-model:date-to-filter="dateToFilter"
        v-model:start-position-filter="startPositionFilter"
        v-model:format-filter="formatFilter"
        :visible-log-count="filteredLogs.length"
        :total-log-count="logs.length"
        :available-formats="availableFormats"
        search-placeholder="Gegnerisches Deck, Pokémon, Format..."
        @reset="resetFilters"
      />

      <MatchupStatsCards
        class="mt-8"
        :wins="totalStats.wins"
        :losses="totalStats.losses"
        :draws="totalStats.draws"
        :total="totalStats.total"
        :win-rate="totalStats.winRate"
        fourth-label="Matchups"
        :fourth-value="matchupRows.length"
      />

      <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="mb-6 flex items-center justify-between gap-4">
          <h2 class="text-2xl font-black">
            Gegnerische Decks
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

        <div v-else-if="matchupRows.length === 0" class="rounded-xl bg-slate-100 p-6 text-slate-600">
          Keine Matchups für dieses Deck gefunden.
        </div>

        <MatchupAccordionTable
          v-else
          type="opponent"
          :rows="matchupRows"
          :open-row-name="openOpponentDeckName"
          @toggle="toggleOpponentDeckAccordion"
        />
      </div>
  </PageShell>
</template>
