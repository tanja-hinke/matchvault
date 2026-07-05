<script setup lang="ts">
import type { BattleLog } from '~/types/battle-log'
import {
  formatBattleLogTime,
  getResultCardClasses,
  getResultLabel,
} from '~/utils/battle-log-formatting'

defineProps<{
  log: BattleLog
  showOwnDeck?: boolean
  compact?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="`/logs/${log.id}`"
    class="block rounded-2xl border p-5 shadow-sm transition hover:scale-[1.01]"
    :class="getResultCardClasses(log.result)"
  >
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-wide opacity-70">
          {{ formatBattleLogTime(log.played_at) }}
        </p>

        <h3 class="mt-2 text-xl font-black">
          {{ getResultLabel(log.result) }}
          <span v-if="log.opponent_deck_name">
            vs {{ log.opponent_deck_name }}
          </span>
          <span v-else-if="log.opponent_name">
            vs {{ log.opponent_name }}
          </span>
        </h3>

        <p class="mt-1 text-sm font-semibold opacity-70">
          {{ log.went_first === true ? '1st' : log.went_first === false ? '2nd' : 'First/Second unbekannt' }}
          <span v-if="log.format">
            · {{ log.format }}
          </span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-6">
        <PokemonSpritePair
          :pokemon1-name="log.own_pokemon_1_name"
          :pokemon1-sprite-url="log.own_pokemon_1_sprite_url"
          :pokemon2-name="log.own_pokemon_2_name"
          :pokemon2-sprite-url="log.own_pokemon_2_sprite_url"
          fallback-alt="Eigenes Pokémon"
          :size="compact ? 'sm' : 'md'"
        />

        <div
          v-if="showOwnDeck"
          class="text-right"
        >
          <p class="text-sm font-bold opacity-70">
            Dein Deck
          </p>

          <p class="font-black">
            {{ log.own_deck_name || 'Unbekannt' }}
          </p>
        </div>

        <PokemonSpritePair
          :pokemon1-name="log.opponent_pokemon_1_name"
          :pokemon1-sprite-url="log.opponent_pokemon_1_sprite_url"
          :pokemon2-name="log.opponent_pokemon_2_name"
          :pokemon2-sprite-url="log.opponent_pokemon_2_sprite_url"
          fallback-alt="Gegnerisches Pokémon"
          :size="compact ? 'sm' : 'md'"
        />
      </div>
    </div>
  </NuxtLink>
</template>
