<script setup lang="ts">
import { useDecks } from '~/composables/useDecks'
import { validateBattleLog } from '~/utils/battle-log-validator'
import { parseBattleLog, type ParsedBattleLog } from '~/utils/battle-log-parser'
import type { SelectedPokemon } from '~/components/PokemonSelect.vue'
import type { Deck } from '~/types/deck'

const NEW_DECK_VALUE = '__new_deck__'

const { compact = false } = defineProps<{
  compact?: boolean
}>()

const emit = defineEmits<{
  saved: []
}>()

const supabase = useSupabaseClient()
const { decks, loadDecks, createDeck } = useDecks()
const { defaultFormat } = useFormats()

const rawLog = ref('')
const parsedBattleLog = ref<ParsedBattleLog | null>(null)
const profilePlayerName = ref('')
const defaultDeckId = ref('')
const selectedDeckId = ref('')

const isReviewModalOpen = ref(false)
const isSavingLog = ref(false)

const ownDeckName = ref('')
const opponentDeckName = ref('')
const selectedFormat = ref(defaultFormat.value)

const ownPokemon1 = ref<SelectedPokemon | null>(null)
const ownPokemon2 = ref<SelectedPokemon | null>(null)
const opponentPokemon1 = ref<SelectedPokemon | null>(null)
const opponentPokemon2 = ref<SelectedPokemon | null>(null)

const errorMessage = ref('')
const successMessage = ref('')
const warningMessages = ref<string[]>([])

const normalizeDeckId = (deckId: string | null | undefined) => {
  if (!deckId || deckId === 'undefined') {
    return ''
  }

  return deckId
}

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data.user) {
    return null
  }

  return data.user.id
}

const loadProfile = async () => {
  const userId = await getCurrentUserId()

  if (!userId) {
    errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
    return
  }

  const { data, error } = await supabase
      .from('profiles')
      .select('player_name, default_deck_id')
      .eq('user_id', userId)
      .maybeSingle()

  if (error) {
    errorMessage.value = error.message
    return
  }

  profilePlayerName.value = data?.player_name ?? ''
  defaultDeckId.value = normalizeDeckId(data?.default_deck_id)

  if (defaultDeckId.value) {
    selectedDeckId.value = defaultDeckId.value
  }
}

const clearOwnDeckFields = () => {
  ownDeckName.value = ''
  ownPokemon1.value = null
  ownPokemon2.value = null
}

const resetReviewForm = () => {
  selectedDeckId.value = normalizeDeckId(defaultDeckId.value)
  clearOwnDeckFields()
  opponentDeckName.value = ''
  selectedFormat.value = defaultFormat.value
  opponentPokemon1.value = null
  opponentPokemon2.value = null
}

const applyDeck = (deck: Deck) => {
  ownDeckName.value = deck.name

  ownPokemon1.value = {
    name: deck.pokemon_1_name,
    spriteUrl: deck.pokemon_1_sprite_url,
  }

  ownPokemon2.value = deck.pokemon_2_name
    ? {
        name: deck.pokemon_2_name,
        spriteUrl: deck.pokemon_2_sprite_url,
      }
    : null
}

const applySelectedDeck = () => {
  if (selectedDeckId.value === NEW_DECK_VALUE) {
    clearOwnDeckFields()
    return
  }

  const normalizedDeckId = normalizeDeckId(selectedDeckId.value)

  if (!normalizedDeckId) {
    return
  }

  const deck = decks.value.find((deck) => deck.id === normalizedDeckId)

  if (!deck) {
    return
  }

  applyDeck(deck)
}

const prepareDefaultDeckForReview = async () => {
  await loadDecks()

  selectedDeckId.value = normalizeDeckId(defaultDeckId.value)
  applySelectedDeck()
}

const createSelectedNewDeck = async () => {
  if (selectedDeckId.value !== NEW_DECK_VALUE) {
    return
  }

  if (!ownDeckName.value.trim() || !ownPokemon1.value) {
    return
  }

  await createDeck({
    name: ownDeckName.value.trim(),
    pokemon_1_name: ownPokemon1.value.name,
    pokemon_1_sprite_url: ownPokemon1.value.spriteUrl,
    pokemon_2_name: ownPokemon2.value?.name ?? null,
    pokemon_2_sprite_url: ownPokemon2.value?.spriteUrl ?? null,
  })
}

const pasteClipboardIntoRawLog = async () => {
  if (rawLog.value.trim()) {
    return
  }

  if (!navigator.clipboard?.readText) {
    return
  }

  try {
    const clipboardText = await navigator.clipboard.readText()

    if (!clipboardText.trim()) {
      return
    }

    rawLog.value = clipboardText
  } catch (error) {
    console.error('Zwischenspeicher konnte nicht gelesen werden:', error)
  }
  parsedBattleLog.value = parseBattleLog(rawLog.value, profilePlayerName.value)
  warningMessages.value = validation.warnings
  resetReviewForm()
  applySelectedDeck()

  isReviewModalOpen.value = true
}

const handleAddLog = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  warningMessages.value = []
  parsedBattleLog.value = null

  if (!profilePlayerName.value) {
    errorMessage.value = 'Bitte hinterlege zuerst deinen PTCG Live Spielernamen im Profil.'
    return
  }

  const validation = validateBattleLog(rawLog.value)

  if (!validation.isValid) {
    errorMessage.value = validation.errors.join(' ')
    warningMessages.value = validation.warnings
    return
  }

  parsedBattleLog.value = parseBattleLog(rawLog.value, profilePlayerName.value)
  warningMessages.value = validation.warnings
  resetReviewForm()
  await prepareDefaultDeckForReview()

  isReviewModalOpen.value = true
}

const confirmBattleLog = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!parsedBattleLog.value) {
    errorMessage.value = 'Es wurden keine Kampflog-Daten erkannt.'
    return
  }

  if (!ownDeckName.value.trim()) {
    errorMessage.value = 'Bitte gib deinen Decknamen ein.'
    return
  }

  if (!opponentDeckName.value.trim()) {
    errorMessage.value = 'Bitte gib den gegnerischen Decknamen ein.'
    return
  }

  if (!ownPokemon1.value) {
    errorMessage.value = 'Bitte wähle dein erstes Pokémon aus.'
    return
  }

  if (!opponentPokemon1.value) {
    errorMessage.value = 'Bitte wähle das erste Pokémon des Gegners aus.'
    return
  }

  const userId = await getCurrentUserId()

  if (!userId) {
    errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
    return
  }

  const parsedLog = parsedBattleLog.value
  const selectedOwnPokemon1 = ownPokemon1.value
  const selectedOwnPokemon2 = ownPokemon2.value
  const selectedOpponentPokemon1 = opponentPokemon1.value
  const selectedOpponentPokemon2 = opponentPokemon2.value

  isSavingLog.value = true

  const { error } = await supabase
    .from('battle_logs')
    .insert({
      user_id: userId,
      player_name: parsedLog.playerName,
      opponent_name: parsedLog.opponentName,
      result: parsedLog.result,
      went_first: parsedLog.wentFirst,
      format: selectedFormat.value.trim() || null,

      own_deck_name: ownDeckName.value.trim(),
      own_pokemon_1_name: selectedOwnPokemon1.name,
      own_pokemon_1_sprite_url: selectedOwnPokemon1.spriteUrl,
      own_pokemon_2_name: selectedOwnPokemon2?.name ?? null,
      own_pokemon_2_sprite_url: selectedOwnPokemon2?.spriteUrl ?? null,

      opponent_deck_name: opponentDeckName.value.trim(),
      opponent_pokemon_1_name: selectedOpponentPokemon1.name,
      opponent_pokemon_1_sprite_url: selectedOpponentPokemon1.spriteUrl,
      opponent_pokemon_2_name: selectedOpponentPokemon2?.name ?? null,
      opponent_pokemon_2_sprite_url: selectedOpponentPokemon2?.spriteUrl ?? null,

      raw_log: rawLog.value.trim(),
      played_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    isSavingLog.value = false
    errorMessage.value = error.message
    return
  }

  await createSelectedNewDeck()

  isSavingLog.value = false
  successMessage.value = 'Kampflog wurde gespeichert.'
  rawLog.value = ''
  parsedBattleLog.value = null
  isReviewModalOpen.value = false
  resetReviewForm()

  emit('saved')
}

watch(selectedDeckId, () => {
  applySelectedDeck()
})

onMounted(async () => {
  await Promise.all([
    loadProfile(),
    loadDecks(),
  ])
})
</script>

<template>
  <div>
    <div class="mt-3 relative">
      <textarea
        id="battle-log-input"
        v-model="rawLog"
        :rows="compact ? 4 : 7"
        class="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 pe-[120px] outline-none focus:border-slate-950"
        placeholder="Pokémon TCG Live Kampflog hier einfügen"
        @focus="pasteClipboardIntoRawLog"
        @click="pasteClipboardIntoRawLog"
      />

      <button
        type="button"
        class="absolute bottom-[16px] right-[10px] rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
        @click="handleAddLog"
      >
        Hinzufügen
      </button>
    </div>

    <p
      v-if="errorMessage"
      class="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
    >
      {{ errorMessage }}
    </p>

    <div
      v-if="warningMessages.length > 0"
      class="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800"
    >
      <p class="font-black">
        Hinweise:
      </p>

      <ul class="mt-2 list-disc space-y-1 pl-5">
        <li
          v-for="warning in warningMessages"
          :key="warning"
        >
          {{ warning }}
        </li>
      </ul>
    </div>

    <p
      v-if="successMessage"
      class="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700"
    >
      {{ successMessage }}
    </p>

    <div
      v-if="parsedBattleLog"
      class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5"
    >
      <h2 class="text-lg font-black">
        Erkannte Kampflog-Daten
      </h2>

      <dl class="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <dt class="text-sm font-bold text-slate-500">
            Spieler
          </dt>
          <dd class="mt-1 font-black">
            {{ parsedBattleLog.playerName }}
          </dd>
        </div>

        <div>
          <dt class="text-sm font-bold text-slate-500">
            Gegner
          </dt>
          <dd class="mt-1 font-black">
            {{ parsedBattleLog.opponentName ?? 'Unbekannt' }}
          </dd>
        </div>

        <div>
          <dt class="text-sm font-bold text-slate-500">
            Ergebnis
          </dt>
          <dd class="mt-1 font-black">
            {{ parsedBattleLog.result }}
          </dd>
        </div>

        <div>
          <dt class="text-sm font-bold text-slate-500">
            Startposition
          </dt>
          <dd class="mt-1 font-black">
            {{ parsedBattleLog.wentFirst === true ? '1st' : parsedBattleLog.wentFirst === false ? '2nd' : 'Unbekannt' }}
          </dd>
        </div>
      </dl>
    </div>

    <div
      v-if="isReviewModalOpen && parsedBattleLog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
    >
      <section class="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-8 shadow-2xl">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h2 class="text-3xl font-black">
              Kampflog überprüfen
            </h2>

            <p class="mt-2 text-slate-600">
              Prüfe die erkannten Informationen und ergänze die Deckdaten.
            </p>
          </div>

          <button
            type="button"
            class="text-3xl leading-none text-slate-500 hover:text-slate-950"
            @click="isReviewModalOpen = false"
          >
            ×
          </button>
        </div>

        <div class="mt-6 rounded-xl bg-slate-50 p-4">
          <dl class="grid gap-4 md:grid-cols-2">
            <div>
              <dt class="text-sm font-bold text-slate-500">
                Spieler
              </dt>
              <dd class="mt-1 font-black">
                {{ parsedBattleLog.playerName }}
              </dd>
            </div>

            <div>
              <dt class="text-sm font-bold text-slate-500">
                Gegner
              </dt>
              <dd class="mt-1 font-black">
                {{ parsedBattleLog.opponentName ?? 'Unbekannt' }}
              </dd>
            </div>

            <div>
              <dt class="text-sm font-bold text-slate-500">
                Ergebnis
              </dt>
              <dd class="mt-1 font-black">
                {{ parsedBattleLog.result }}
              </dd>
            </div>

            <div>
              <dt class="text-sm font-bold text-slate-500">
                Startposition
              </dt>
              <dd class="mt-1 font-black">
                {{ parsedBattleLog.wentFirst === true ? '1st' : parsedBattleLog.wentFirst === false ? '2nd' : 'Unbekannt' }}
              </dd>
            </div>
          </dl>
        </div>

        <div class="mt-8 space-y-8">
          <section>
            <h3 class="text-xl font-black">
              Dein Deck
            </h3>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label for="select-deck" class="block text-sm font-bold text-slate-700">
                  Deck auswählen
                </label>
                <select
                  id="select-deck"
                  v-model="selectedDeckId"
                  class="h-[58px] mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
                >
                  <option value="">-- Eigenes Deck wählen --</option>
                  <option :value="NEW_DECK_VALUE">+ Neues Deck</option>
                  <option
                    v-for="deck in decks"
                    :key="deck.id"
                    :value="deck.id"
                  >
                    {{ deck.name }}
                  </option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label for="own-deck-name" class="block text-sm font-bold text-slate-700">
                  Deckname
                </label>

                <input
                  id="own-deck-name"
                  v-model="ownDeckName"
                  type="text"
                  class="h-[58px] mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  placeholder="z. B. Katapuldra / Dummimisel"
                >
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 1
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="ownPokemon1" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 2 (optional)
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="ownPokemon2" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-xl font-black">
              Gegnerisches Deck
            </h3>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label for="opponent-deck-name" class="block text-sm font-bold text-slate-700">
                  Deckname
                </label>

                <input
                  id="opponent-deck-name"
                  v-model="opponentDeckName"
                  type="text"
                  class="h-[58px] mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  placeholder="z. B. Lunastein / Sonnfel"
                >
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 1
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="opponentPokemon1" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 2 (optional)
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="opponentPokemon2" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <FormatSelect
                id="battle-log-format"
                v-model="selectedFormat"
                label="Format"
                include-empty-option
            />
          </section>
        </div>

        <p
          v-if="errorMessage"
          class="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {{ errorMessage }}
        </p>

        <div class="mt-8 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-950 transition hover:bg-slate-200"
            @click="isReviewModalOpen = false"
          >
            Schließen
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSavingLog"
            @click="confirmBattleLog"
          >
            {{ isSavingLog ? 'Speichert...' : 'Speichern' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
