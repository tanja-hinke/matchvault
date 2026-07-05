<script setup lang="ts">
import type { BattleLog } from '~/types/battle-log'
import { useBattleLogs } from "~/composables/useBattleLogs";


definePageMeta({
  middleware: ['auth'],
})

//const supabase = useSupabaseClient()

const {
  logs,
  isLoading,
  errorMessage,
  loadLogs,
} = useBattleLogs()

const availableFormats = computed(() => {
  const formats = logs.value
    .map((log) => log.format)
    .filter((format): format is string => Boolean(format))

  return Array.from(new Set(formats)).sort()
})

const resultFilter = ref<'all' | 'win' | 'loss' | 'draw' | 'unknown'>('all')
const startPositionFilter = ref<'all' | 'first' | 'second' | 'unknown'>('all')
const formatFilter = ref('all')
const searchFilter = ref('')
const dateFromFilter = ref('')
const dateToFilter = ref('')

const resetFilters = () => {
  resultFilter.value = 'all'
  startPositionFilter.value = 'all'
  formatFilter.value = 'all'
  searchFilter.value = ''
  dateFromFilter.value = ''
  dateToFilter.value = ''
}

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

const formatDate = (dateValue: string) => {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

const getDateGroupKey = (dateValue: string) => {
  const date = new Date(dateValue)

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

const formatDateGroupTitle = (dateValue: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateValue))
}

const filteredLogs = computed(() => {
  const normalizedSearch = searchFilter.value.trim().toLowerCase()

  return logs.value.filter((log) => {
    const matchesResult =
      resultFilter.value === 'all'
      || log.result === resultFilter.value

    const matchesStartPosition =
      startPositionFilter.value === 'all'
      || (startPositionFilter.value === 'first' && log.went_first === true)
      || (startPositionFilter.value === 'second' && log.went_first === false)
      || (startPositionFilter.value === 'unknown' && log.went_first === null)

    const matchesFormat =
      formatFilter.value === 'all'
      || log.format === formatFilter.value

    const logDate = new Date(log.played_at)

    const matchesDateFrom =
      !dateFromFilter.value
      || logDate >= new Date(`${dateFromFilter.value}T00:00:00`)

    const matchesDateTo =
      !dateToFilter.value
      || logDate <= new Date(`${dateToFilter.value}T23:59:59`)

    const searchableText = [
      log.player_name,
      log.opponent_name,
      log.own_deck_name,
      log.opponent_deck_name,
      log.own_pokemon_1_name,
      log.own_pokemon_2_name,
      log.opponent_pokemon_1_name,
      log.opponent_pokemon_2_name,
      log.format,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch =
      !normalizedSearch
      || searchableText.includes(normalizedSearch)

    return matchesResult
      && matchesStartPosition
      && matchesFormat
      && matchesDateFrom
      && matchesDateTo
      && matchesSearch
  })
})

const groupedLogs = computed(() => {
  const groups = new Map<string, BattleLog[]>()

  for (const log of filteredLogs.value) {
    const key = getDateGroupKey(log.played_at)

    if (!groups.has(key)) {
      groups.set(key, [])
    }

    groups.get(key)?.push(log)
  }

  return Array.from(groups.entries())
    .flatMap(([date, groupLogs]) => {
      const firstLog = groupLogs[0]

      if (!firstLog) {
        return []
      }

      const wins = groupLogs.filter((log) => log.result === 'win').length
      const losses = groupLogs.filter((log) => log.result === 'loss').length
      const draws = groupLogs.filter((log) => log.result === 'draw').length

      return [{
        date,
        title: formatDateGroupTitle(firstLog.played_at),
        logs: groupLogs,
        wins,
        losses,
        draws,
        total: groupLogs.length,
      }]
    })
    .sort((a, b) => b.date.localeCompare(a.date))
})

const openDateGroup = ref<string | null>(null)

const toggleDateGroup = (date: string) => {
  openDateGroup.value = openDateGroup.value === date
    ? null
    : date
}

watch(groupedLogs, (groups) => {
  if (groups.length === 0) {
    openDateGroup.value = null
    return
  }

  const openGroupStillExists = groups.some((group) => group.date === openDateGroup.value)

  if (!openGroupStillExists) {
    openDateGroup.value = groups[0]?.date ?? null
  }
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    loadLogs()
  ])
})
</script>

<template>
  <PageShell max-width="6xl">
    <PageHeader
      title="PTCG Logs"
      description="Füge deine Pokémon TCG Live Battle Logs ein und speichere sie in MatchVault."
    >
      <template #actions>
          <NuxtLink
            to="/matchups"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Matchups
          </NuxtLink>

          <NuxtLink
            to="/dashboard"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Dashboard
          </NuxtLink>
      </template>
    </PageHeader>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label for="raw-log" class="block text-sm font-bold text-slate-700">
          Kampflog einfügen
        </label>
        <BattleLogForm @saved="loadLogs" />
     </div>

      <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-2xl font-black">
              Filter
            </h2>

            <p class="mt-1 text-sm text-slate-500">
              {{ filteredLogs.length }} von {{ logs.length }} Logs sichtbar
            </p>
          </div>

          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            @click="resetFilters"
          >
            Filter zurücksetzen
          </button>
        </div>

        <div class="mt-5 grid gap-4 md:grid-cols-3">
          <div>
            <label for="search-filter" class="block text-sm font-bold text-slate-700">
              Suche
            </label>

            <input
              id="search-filter"
              v-model="searchFilter"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="Deck, Gegner, Pokémon..."
            >
          </div>

          <div>
            <label for="date-from-filter" class="block text-sm font-bold text-slate-700">
              Von
            </label>

            <input
              id="date-from-filter"
              v-model="dateFromFilter"
              type="date"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
            >
          </div>

          <div>
            <label for="date-to-filter" class="block text-sm font-bold text-slate-700">
              Bis
            </label>

            <input
              id="date-to-filter"
              v-model="dateToFilter"
              type="date"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
            >
          </div>

          <div>
            <label for="result-filter" class="block text-sm font-bold text-slate-700">
              Ergebnis
            </label>

            <select
              id="result-filter"
              v-model="resultFilter"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
            >
              <option value="all">
                Alle Ergebnisse
              </option>
              <option value="win">
                Wins
              </option>
              <option value="loss">
                Losses
              </option>
              <option value="draw">
                Draws
              </option>
            </select>
          </div>

          <div>
            <label for="start-position-filter" class="block text-sm font-bold text-slate-700">
              Startposition
            </label>

            <select
              id="start-position-filter"
              v-model="startPositionFilter"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
            >
              <option value="all">
                Alle
              </option>
              <option value="first">
                1st
              </option>
              <option value="second">
                2nd
              </option>
            </select>
          </div>

          <div>
            <label for="format-filter" class="block text-sm font-bold text-slate-700">
              Format
            </label>

            <select
              id="format-filter"
              v-model="formatFilter"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
            >
              <option value="all">
                Alle Formate
              </option>

              <option
                v-for="format in availableFormats"
                :key="format"
                :value="format"
              >
                {{ format }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-2xl font-black">
            Deine Logs
          </h2>

          <button
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            @click="loadLogs"
          >
            Aktualisieren
          </button>
        </div>

        <div v-if="isLoading" class="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Logs werden geladen...
        </div>

        <div v-else-if="logs.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Du hast noch keine Kampflogs gespeichert.
        </div>

        <div v-else-if="filteredLogs.length === 0" class="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          Keine Logs gefunden, die zu deinen Filtern passen.
        </div>

        <div v-else class="space-y-10">
          <div class="space-y-4">
            <section
              v-for="group in groupedLogs"
              :key="group.date"
              class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                type="button"
                class="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-slate-50"
                :aria-expanded="openDateGroup === group.date"
                @click="toggleDateGroup(group.date)"
              >
                <div>
                  <h3 class="text-2xl font-black">
                    {{ group.title }}
                  </h3>

                  <p class="mt-1 text-sm font-bold text-slate-500">
                    {{ group.total }} total
                  </p>
                </div>

                <div class="flex items-center gap-5">
                  <div class="text-right">
                    <p class="text-2xl font-black">
                      {{ group.wins }}-{{ group.losses }}
                      <span
                        v-if="group.draws > 0"
                        class="text-slate-500"
                      >
                      -{{ group.draws }}
                    </span>
                    </p>

                    <p class="text-sm font-bold text-slate-500">
                      Record
                    </p>
                  </div>

                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-black text-slate-700 transition"
                    :class="openDateGroup === group.date ? 'rotate-180' : ''"
                  >
                    ↓
                  </span>
                </div>
              </button>

              <div
                v-if="openDateGroup === group.date"
                class="space-y-4 border-t border-slate-100 p-5"
              >
                <BattleLogCard
                  v-for="log in group.logs"
                  :key="log.id"
                  :log="log"
                  show-own-deck
                />
              </div>
            </section>
          </div>
        </div>
      </div>
  </PageShell>
</template>
