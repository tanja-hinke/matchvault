<script setup lang="ts">
import { useDecks } from '~/composables/useDecks'

definePageMeta({
  middleware: ['auth'],
})

const supabase = useSupabaseClient()
const { decks, loadDecks } = useDecks()

const playerName = ref('')
const displayName = ref('')
const defaultDeckId = ref('')
const getValidDefaultDeckId = () => {
  if (!defaultDeckId.value || defaultDeckId.value === 'undefined') {
    return null
  }

  return defaultDeckId.value
}
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

const loadProfile = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const userId = await getCurrentUserId()

  if (!userId) {
    errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
    isLoading.value = false
    return
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('player_name, display_name, default_deck_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    errorMessage.value = error.message
    isLoading.value = false
    return
  }

  if (data) {
    playerName.value = data.player_name ?? ''
    displayName.value = data.display_name ?? ''
    defaultDeckId.value = data.default_deck_id && data.default_deck_id !== 'undefined'
      ? data.default_deck_id
      : ''
  }

  isLoading.value = false
}

const saveProfile = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!playerName.value.trim()) {
    errorMessage.value = 'Bitte gib deinen Pokémon TCG Live Spielernamen ein.'
    return
  }

  isSaving.value = true

  const userId = await getCurrentUserId()

  if (!userId) {
    errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
    isSaving.value = false
    return
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      player_name: playerName.value.trim(),
      display_name: displayName.value.trim() || null,
      default_deck_id: getValidDefaultDeckId(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

  isSaving.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  successMessage.value = 'Profil wurde gespeichert.'
}

onMounted(() => {
  loadProfile()
  loadDecks()
})
</script>

<template>
  <PageShell>
    <PageHeader
        title="Profil"
        description="Mache Angaben zu deinem Profil."
    >
    </PageHeader>

      <form
        class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        @submit.prevent="saveProfile"
      >
        <div v-if="isLoading" class="text-slate-600">
          Profil wird geladen...
        </div>

        <div v-else class="space-y-6">
          <div>
            <label for="player-name" class="block text-sm font-bold text-slate-700">
              Pokémon TCG Live Spielername
            </label>

            <input
              id="player-name"
              v-model="playerName"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="z. B. Eldarea"
            >

            <p class="mt-2 text-sm text-slate-500">
              Dieser Name muss exakt so geschrieben sein wie in deinen Kampflogs bzw. wie dein Name in deinen Pokémon TCG Live Profil.
            </p>
          </div>

          <div>
            <label for="display-name" class="block text-sm font-bold text-slate-700">
              Anzeigename optional
            </label>

            <input
              id="display-name"
              v-model="displayName"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="z. B. Tanja"
            >
          </div>

          <div>
            <label for="default-deck" class="block text-sm font-bold text-slate-700">
              Standard-Deck
            </label>

            <select
              id="default-deck"
              v-model="defaultDeckId"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
            >
              <option value="">Kein Standard-Deck</option>
              <option
                v-for="deck in decks"
                :key="deck.id"
                :value="deck.id"
              >
                {{ deck.name }}
              </option>
            </select>
            <p class="mt-2 text-sm text-slate-500">
              Dieses Deck wird automatisch vorausgewählt, wenn du einen neuen Kampflog anlegst.
            </p>
          </div>

          <p v-if="errorMessage" class="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {{ errorMessage }}
          </p>

          <p v-if="successMessage" class="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {{ successMessage }}
          </p>

          <button
            type="submit"
            class="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSaving"
          >
            {{ isSaving ? 'Wird gespeichert...' : 'Profil speichern' }}
          </button>
        </div>
      </form>
  </PageShell>
</template>
