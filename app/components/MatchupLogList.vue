<script setup lang="ts">
import type { BattleLog } from '~/types/battle-log'
import {
  formatBattleLogDate,
  formatBattleLogTime,
  getResultBadgeClasses,
  getResultCardClasses,
  getResultLabel,
} from '~/utils/battle-log-formatting'
import PokemonSpritePair from "~/components/PokemonSpritePair.vue";

defineProps<{
  logs: BattleLog[]
}>()
</script>

<template>
  <div class="space-y-3">
    <NuxtLink
      v-for="log in logs"
      :key="log.id"
      :to="`/logs/${log.id}`"
      class="block rounded-2xl border p-5 shadow-sm transition hover:scale-[1.01]"
      :class="getResultCardClasses(log.result)"
    >
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-wide opacity-70">
            {{ formatBattleLogDate(log.played_at) }} · {{ formatBattleLogTime(log.played_at) }}
          </p>

          <h3 class="mt-2 text-xl font-black">
            <span v-if="log.opponent_deck_name">
              {{ getResultLabel(log.result) }} vs {{ log.opponent_deck_name }}
            </span>
            <span v-else-if="log.opponent_name">
              {{ getResultLabel(log.result) }} vs {{ log.opponent_name }}
            </span>
            <span v-else>
              {{ getResultLabel(log.result) }} vs Unbekannt
            </span>
          </h3>

          <p class="mt-2 text-sm font-semibold opacity-70">
            {{ log.went_first === true ? '1st' : log.went_first === false ? '2nd' : 'First/Second unbekannt' }}
            <span v-if="log.format">
              · {{ log.format }}
            </span>
          </p>
        </div>

        <PokemonSpritePair
          :pokemon1-name="log.opponent_pokemon_1_name"
          :pokemon1-sprite-url="log.opponent_pokemon_1_sprite_url"
          :pokemon2-name="log.opponent_pokemon_2_name"
          :pokemon2-sprite-url="log.opponent_pokemon_2_sprite_url"
          fallback-alt="Gegnerisches Pokémon"
        />
      </div>
    </NuxtLink>
  </div>
</template>
