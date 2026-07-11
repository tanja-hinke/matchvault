<script setup lang="ts">
import pokemonData from '~/data/pokemon-de.json'

type PokemonDataItem = {
  apiName: string
  germanName: string
  displayName: string
  spriteUrl: string | null
  speciesName: string | null
  speciesUrl: string | null
}

export type SelectedPokemon = {
  name: string
  spriteUrl: string | null
}

const model = defineModel<SelectedPokemon | null>({
  default: null,
})

const search = ref('')
const isOpen = ref(false)
const containerRef = ref<HTMLElement | null>(null)

const pokemonList = computed(() => pokemonData as PokemonDataItem[])

const closeDropdown = () => {
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target

  if (!(target instanceof Node)) {
    return
  }

  if (!containerRef.value?.contains(target)) {
    closeDropdown()
  }
}

const normalizeSearch = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const filteredPokemon = computed(() => {
  const normalizedSearch = normalizeSearch(search.value)

  if (!normalizedSearch) {
    return pokemonList.value.slice(0, 20)
  }

  return pokemonList.value
    .filter((pokemon) => {
      const searchableText = [
        pokemon.apiName,
        pokemon.germanName,
        pokemon.displayName,
        pokemon.speciesName,
      ]
        .filter(Boolean)
        .join(' ')

      return normalizeSearch(searchableText).includes(normalizedSearch)
    })
    .slice(0, 20)
})

const selectPokemon = (pokemon: PokemonDataItem) => {
  model.value = {
    name: pokemon.displayName,
    spriteUrl: pokemon.spriteUrl,
  }

  search.value = pokemon.displayName
  isOpen.value = false
}

const clearSelection = () => {
  model.value = null
  search.value = ''
  isOpen.value = false
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative">
    <div
      v-if="model"
      class="flex items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <PokemonSpritePair
          :pokemon1-name="model.name"
          :pokemon1-sprite-url="model.spriteUrl"
          fallback-alt="Ausgewähltes Pokémon"
          size="sm"
        />

        <span class="font-bold">
          {{ model.name }}
        </span>
      </div>

      <button
        type="button"
        class="text-sm font-bold text-slate-500 hover:text-red-700"
        @click="clearSelection"
      >
        Entfernen
      </button>
    </div>

    <div v-else>
      <input
        v-model="search"
        type="text"
        class="w-full h-[58px] rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
        placeholder="Pokémon suchen..."
        @focus="isOpen = true"
        @keydown.esc="closeDropdown"
      >

      <div
        v-if="isOpen"
        class="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <button
          v-for="pokemon in filteredPokemon"
          :key="pokemon.apiName"
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left font-semibold hover:bg-slate-100"
          @click="selectPokemon(pokemon)"
        >
          <PokemonSpritePair
            :pokemon1-name="pokemon.displayName"
            :pokemon1-sprite-url="pokemon.spriteUrl"
            fallback-alt="Pokémon"
            size="sm"
          />

          <span>
            {{ pokemon.displayName }}
          </span>

          <span
            v-if="pokemon.apiName !== pokemon.displayName.toLowerCase()"
            class="text-xs font-semibold text-slate-400"
          >
            {{ pokemon.apiName }}
          </span>
        </button>

        <div
          v-if="filteredPokemon.length === 0"
          class="p-4 text-sm text-slate-600"
        >
          Kein Pokémon gefunden.
        </div>
      </div>
    </div>
  </div>
</template>
