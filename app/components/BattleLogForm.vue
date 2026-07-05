<script setup lang="ts">
import { validateBattleLog } from '~/utils/battle-log-validator'
import { parseBattleLog, type ParsedBattleLog } from '~/utils/battle-log-parser'
import type { SelectedPokemon } from '~/components/PokemonSelect.vue'

const { compact = false } = defineProps<{
  compact?: boolean
}>()

const emit = defineEmits<{
  saved: []
}>()

const supabase = useSupabaseClient()

const rawLog = ref('')
const parsedBattleLog = ref<ParsedBattleLog | null>(null)
const profilePlayerName = ref('')

const isReviewModalOpen = ref(false)
const isSavingLog = ref(false)

const ownDeckName = ref('')
const opponentDeckName = ref('')
const selectedFormat = ref('TEF-POR')

const ownPokemon1 = ref<SelectedPokemon | null>(null)
const ownPokemon2 = ref<SelectedPokemon | null>(null)
const opponentPokemon1 = ref<SelectedPokemon | null>(null)
const opponentPokemon2 = ref<SelectedPokemon | null>(null)

const errorMessage = ref('')
const successMessage = ref('')
const warningMessages = ref<string[]>([])

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
    .select('player_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    errorMessage.value = error.message
    return
  }

  profilePlayerName.value = data?.player_name ?? ''
}

const resetReviewForm = () => {
  ownDeckName.value = ''
  opponentDeckName.value = ''
  selectedFormat.value = 'TEF-POR'
  ownPokemon1.value = null
  ownPokemon2.value = null
  opponentPokemon1.value = null
  opponentPokemon2.value = null
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

  isSavingLog.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  successMessage.value = 'Kampflog wurde gespeichert.'
  rawLog.value = ''
  parsedBattleLog.value = null
  isReviewModalOpen.value = false
  resetReviewForm()

  emit('saved')
}

onMounted(() => {
  loadProfile()
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
        placeholder="Paste PTCGL log here"
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
              Review Battle Log
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
                <label for="own-deck-name" class="block text-sm font-bold text-slate-700">
                  Deckname
                </label>

                <input
                  id="own-deck-name"
                  v-model="ownDeckName"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                  placeholder="z. B. Dragapult / Dummimisel"
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
                  Pokémon 2 optional
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
                  class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
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
                  Pokémon 2 optional
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="opponentPokemon2" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <label for="format" class="block text-sm font-bold text-slate-700">
              Format
            </label>

            <input
              id="format"
              v-model="selectedFormat"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="z. B. TEF-POR"
            >
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
            Close
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSavingLog"
            @click="confirmBattleLog"
          >
            {{ isSavingLog ? 'Speichert...' : 'Confirm' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
