<script setup lang="ts">
const searchFilter = defineModel<string>('searchFilter', {
  required: true,
})

const dateFromFilter = defineModel<string>('dateFromFilter', {
  required: true,
})

const dateToFilter = defineModel<string>('dateToFilter', {
  required: true,
})

const deckFilter = defineModel<'all' | 'my' | 'opponent'>('deckFilter', {
  required: true,
})

const startPositionFilter = defineModel<'all' | 'first' | 'second'>('startPositionFilter', {
  required: true,
})

const formatFilter = defineModel<string>('formatFilter', {
  required: true,
})

defineProps<{
  visibleLogCount: number
  totalLogCount: number
  availableFormats?: string[]
  searchPlaceholder?: string
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 class="text-2xl font-black">
          Filter
        </h2>

        <p class="mt-1 text-sm text-slate-500">
          {{ visibleLogCount }} von {{ totalLogCount }} Logs werden ausgewertet
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
        @click="emit('reset')"
      >
        Filter zurücksetzen
      </button>
    </div>

    <div class="mt-5 grid gap-4 md:grid-cols-3">
      <div>
        <label for="matchup-search-filter" class="block text-sm font-bold text-slate-700">
          Suche
        </label>

        <input
          id="matchup-search-filter"
          v-model="searchFilter"
          type="text"
          class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
          :placeholder="searchPlaceholder ?? 'Deck, Pokémon, Format...'"
        >
      </div>

      <div>
        <label for="matchup-date-from-filter" class="block text-sm font-bold text-slate-700">
          Von
        </label>

        <input
          id="matchup-date-from-filter"
          v-model="dateFromFilter"
          type="date"
          class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
        >
      </div>

      <div>
        <label for="matchup-date-to-filter" class="block text-sm font-bold text-slate-700">
          Bis
        </label>

        <input
          id="matchup-date-to-filter"
          v-model="dateToFilter"
          type="date"
          class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
        >
      </div>

      <div>
        <label for="matchup-deck-filter" class="block text-sm font-bold text-slate-700">
          Deck
        </label>

        <select
            id="matchup-deck-filter"
            v-model="deckFilter"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
        >
          <option value="all">
            Alle
          </option>
          <option value="my">
            Mein Deck
          </option>
          <option value="opponent">
            Gegnerisches Deck
          </option>
        </select>
      </div>

      <div>
        <label for="matchup-start-position-filter" class="block text-sm font-bold text-slate-700">
          Startposition
        </label>

        <select
          id="matchup-start-position-filter"
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
        <FormatSelect
            id="matchup-format-filter"
            v-model="formatFilter"
            label="Format"
            include-all-option
        />
      </div>
    </div>
  </div>
</template>
