<script setup lang="ts">
import { useDecks } from '~/composables/useDecks'
import type { SelectedPokemon } from '~/components/PokemonSelect.vue'

definePageMeta({
  middleware: ['auth'],
})

const supabase = useSupabaseClient()
const { decks, isLoading, errorMessage, loadDecks, createDeck, deleteDeck } = useDecks()

const newDeckName = ref('')
const pokemon1 = ref<SelectedPokemon | null>(null)
const pokemon2 = ref<SelectedPokemon | null>(null)
const isSaving = ref(false)

const defaultDeckId = ref('')
const isSavingDefaultDeck = ref(false)
const defaultDeckMessage = ref('')
const defaultDeckErrorMessage = ref('')

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user?.id) {
    return null
  }

  return data.user.id
}

const loadDefaultDeck = async () => {
  defaultDeckErrorMessage.value = ''

  const userId = await getCurrentUserId()

  if (!userId) {
    defaultDeckErrorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
    return
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('default_deck_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    defaultDeckErrorMessage.value = error.message
    return
  }

  defaultDeckId.value = data?.default_deck_id ?? ''
}

const setDefaultDeck = async (deckId: string) => {
  if (isSavingDefaultDeck.value) return

  const previousDefaultDeckId = defaultDeckId.value

  defaultDeckId.value = deckId
  defaultDeckMessage.value = ''
  defaultDeckErrorMessage.value = ''
  isSavingDefaultDeck.value = true

  const userId = await getCurrentUserId()

  if (!userId) {
    defaultDeckId.value = previousDefaultDeckId
    defaultDeckErrorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
    isSavingDefaultDeck.value = false
    return
  }

  const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        default_deck_id: deckId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

  isSavingDefaultDeck.value = false

  if (error) {
    defaultDeckId.value = previousDefaultDeckId
    defaultDeckErrorMessage.value = error.message
    return
  }

  defaultDeckMessage.value = 'Mein-Deck wurde gespeichert.'
}

const handleCreateDeck = async () => {
  if (!newDeckName.value.trim()) return
  if (!pokemon1.value) return

  isSaving.value = true
  const success = await createDeck({
    name: newDeckName.value.trim(),
    pokemon_1_name: pokemon1.value.name,
    pokemon_1_sprite_url: pokemon1.value.spriteUrl,
    pokemon_2_name: pokemon2.value?.name ?? null,
    pokemon_2_sprite_url: pokemon2.value?.spriteUrl ?? null,
  })

  if (success) {
    newDeckName.value = ''
    pokemon1.value = null
    pokemon2.value = null
  }
  isSaving.value = false
}

const handleDeleteDeck = async (id: string) => {
  if (confirm('Möchtest du dieses Deck wirklich löschen?')) {
    const success = await deleteDeck(id)

    if (success && defaultDeckId.value === id) {
      defaultDeckId.value = ''
      await loadDefaultDeck()
    }
  }
}

onMounted(async () => {
  await Promise.all([
    loadDecks(),
    loadDefaultDeck(),
  ])
})
</script>

<template>
  <PageShell>
    <PageHeader
        title="Meine Decks"
        description="Erstelle deine Decks und wähle dein Main-Deck aus."
    >
    </PageHeader>

    <div class="grid gap-8 lg:grid-cols-3">
      <div class="lg:col-span-1">
        <div class="sticky top-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-black">Neues Deck erstellen</h2>
          
          <form class="mt-6 space-y-6" @submit.prevent="handleCreateDeck">
            <div>
              <label for="deck-name" class="block text-sm font-bold text-slate-700">
                Deck Name
              </label>
              <input
                id="deck-name"
                v-model="newDeckName"
                type="text"
                required
                class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                placeholder="z. B. Tornupto"
              >
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700">
                Pokémon 1
              </label>
              <div class="mt-2">
                <PokemonSelect v-model="pokemon1" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700">
                Pokémon 2 (optional)
              </label>
              <div class="mt-2">
                <PokemonSelect v-model="pokemon2" />
              </div>
            </div>

            <p v-if="errorMessage" class="text-sm font-bold text-red-600">
              {{ errorMessage }}
            </p>

            <button
              type="submit"
              class="w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:opacity-50"
              :disabled="isSaving || !newDeckName || !pokemon1"
            >
              {{ isSaving ? 'Wird gespeichert...' : 'Deck speichern' }}
            </button>
          </form>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl font-black">Deine Decks</h2>

          <p
            v-if="defaultDeckMessage"
            class="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
          >
            {{ defaultDeckMessage }}
          </p>

          <p
            v-if="defaultDeckErrorMessage"
            class="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
          >
            {{ defaultDeckErrorMessage }}
          </p>
      
          <div v-if="isLoading && decks.length === 0" class="mt-6 text-slate-500">
            Decks werden geladen...
          </div>

          <div v-else-if="decks.length === 0" class="mt-6 text-slate-500">
            Du hast noch keine Decks erstellt.
          </div>

          <div v-else class="mt-6 grid gap-4">
            <div
              v-for="deck in decks"
              :key="deck.id"
              class="group relative flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <PokemonSpritePair
                  :pokemon1-name=null
                  :pokemon1-sprite-url="deck.pokemon_1_sprite_url"
                  :pokemon2-name=null
                  :pokemon2-sprite-url="deck.pokemon_2_sprite_url"
                  fallback-alt="Eigenes Pokémon"
                  size="md"
              />
          
              <div class="min-w-0 flex-1 pr-8">
                <h3 class="truncate font-black text-slate-950">{{ deck.name }}</h3>
                <p class="truncate text-xs font-bold text-slate-500">
                  {{ deck.pokemon_1_name }}
                  <span v-if="deck.pokemon_2_name">/ {{ deck.pokemon_2_name }}</span>
                </p>

                <p
                  v-if="defaultDeckId === deck.id"
                  class="mt-1 text-xs font-black uppercase tracking-wide text-amber-500"
                >
                  Main-Deck
                </p>
              </div>

              <div class="flex">
                <button
                  type="button"
                  class="rounded-lg p-1 text-2xl leading-none transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                  :class="defaultDeckId === deck.id ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'"
                  :title="defaultDeckId === deck.id ? 'Aktuelles Mein-Deck' : 'Als Mein-Deck festlegen'"
                  :disabled="isSavingDefaultDeck"
                  @click="setDefaultDeck(deck.id)"
                >
                  ★
                </button>
                <button
                  type="button"
                  class="rounded-lg p-2 text-2xl text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  title="Deck löschen"
                  @click="handleDeleteDeck(deck.id)"
                >
                  <span class="text-3xl">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PageShell>
</template>