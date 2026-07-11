<script setup lang="ts">
import type { MatchupDeckRow, OpponentMatchupRow } from '~/types/battle-log'
import {
  formatBattleLogDate,
  formatWinRate,
} from '~/utils/battle-log-formatting'

type Props = {
  type: 'own' | 'opponent'
  rows: MatchupDeckRow[] | OpponentMatchupRow[]
  openRowName: string | null
  getDetailsUrl?: (deckName: string) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [rowName: string]
}>()

const getRowName = (row: MatchupDeckRow | OpponentMatchupRow) => {
  return props.type === 'own'
    ? (row as MatchupDeckRow).deckName
    : (row as OpponentMatchupRow).opponentDeckName
}

const getPokemon1Name = (row: MatchupDeckRow | OpponentMatchupRow) => {
  return props.type === 'own'
    ? (row as MatchupDeckRow).pokemon1Name
    : (row as OpponentMatchupRow).opponentPokemon1Name
}

const getPokemon1SpriteUrl = (row: MatchupDeckRow | OpponentMatchupRow) => {
  return props.type === 'own'
    ? (row as MatchupDeckRow).pokemon1SpriteUrl
    : (row as OpponentMatchupRow).opponentPokemon1SpriteUrl
}

const getPokemon2Name = (row: MatchupDeckRow | OpponentMatchupRow) => {
  return props.type === 'own'
    ? (row as MatchupDeckRow).pokemon2Name
    : (row as OpponentMatchupRow).opponentPokemon2Name
}

const getPokemon2SpriteUrl = (row: MatchupDeckRow | OpponentMatchupRow) => {
  return props.type === 'own'
    ? (row as MatchupDeckRow).pokemon2SpriteUrl
    : (row as OpponentMatchupRow).opponentPokemon2SpriteUrl
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[760px] border-collapse">
      <thead>
      <tr class="border-b border-slate-200 text-left text-sm font-bold uppercase tracking-wide text-slate-500">
        <th class="py-4 pr-4">
          Deck
        </th>
        <th class="py-4 pr-4">
         Zuletzt gespielt
        </th>
        <th class="py-4 pr-4">
          Kampfbilanz
        </th>
        <th class="py-4 text-right">
          Siegesquote
        </th>
      </tr>
      </thead>

      <tbody>
      <template
        v-for="row in rows"
        :key="getRowName(row)"
      >
        <tr
          class="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
          @click="emit('toggle', getRowName(row))"
        >
          <td class="py-4 pr-4">
            <div class="flex items-center gap-3">
              <PokemonSpritePair
                :pokemon1-name="getPokemon1Name(row)"
                :pokemon1-sprite-url="getPokemon1SpriteUrl(row)"
                :pokemon2-name="getPokemon2Name(row)"
                :pokemon2-sprite-url="getPokemon2SpriteUrl(row)"
                :fallback-alt="getRowName(row)"
              />

              <div>
                <p class="font-black text-slate-950">
                  {{ getRowName(row) }}
                </p>

                <NuxtLink
                  v-if="type === 'own' && getDetailsUrl"
                  :to="getDetailsUrl(getRowName(row))"
                  class="mt-1 inline-block text-sm font-bold text-slate-500 underline hover:text-slate-950"
                  @click.stop
                >
                  Matchup-Details öffnen
                </NuxtLink>
              </div>
            </div>
          </td>

          <td class="py-4 pr-4 font-semibold text-slate-700">
            {{ formatBattleLogDate(row.lastPlayed) }}
          </td>

          <td class="py-4 pr-4 font-mono text-lg font-black">
            {{ row.wins }}-{{ row.losses }}
            <span
              v-if="row.draws > 0"
              class="text-slate-500"
            >
              -{{ row.draws }}
            </span>
          </td>

          <td class="py-4 text-right">
            <div class="flex items-center justify-end gap-4">
              <span class="font-mono text-lg font-black">
                {{ formatWinRate(row.winRate) }}
              </span>

              <span
                class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg font-black text-slate-700 transition"
                :class="openRowName === getRowName(row) ? 'rotate-180' : ''"
              >
                ↓
              </span>
            </div>
          </td>
        </tr>

        <tr v-if="openRowName === getRowName(row)">
          <td colspan="4" class="border-b border-slate-100 bg-slate-50 px-4 py-4">
            <MatchupLogList :logs="row.logs" />
          </td>
        </tr>
      </template>
      </tbody>
    </table>
  </div>
</template>
