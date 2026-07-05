<script setup lang="ts">

const isEditing = ref(false)
const isSavingDetails = ref(false)
const isDeleting = ref(false)

const editResult = ref<'win' | 'loss' | 'draw' | 'unknown'>('unknown')
const editWentFirst = ref<'first' | 'second' | 'unknown'>('unknown')
const editFormat = ref('')
const editOwnDeckName = ref('')
const editOpponentDeckName = ref('')

const editOwnPokemon1 = ref<SelectedPokemon | null>(null)
const editOwnPokemon2 = ref<SelectedPokemon | null>(null)
const editOpponentPokemon1 = ref<SelectedPokemon | null>(null)
const editOpponentPokemon2 = ref<SelectedPokemon | null>(null)

const syncEditForm = () => {
  if (!log.value) {
    return
  }

  editResult.value = log.value.result

  if (log.value.went_first === true) {
    editWentFirst.value = 'first'
  } else if (log.value.went_first === false) {
    editWentFirst.value = 'second'
  } else {
    editWentFirst.value = 'unknown'
  }

  editFormat.value = log.value.format ?? ''
  editOwnDeckName.value = log.value.own_deck_name ?? ''
  editOpponentDeckName.value = log.value.opponent_deck_name ?? ''

  editOwnPokemon1.value = log.value.own_pokemon_1_name
    ? {
      name: log.value.own_pokemon_1_name,
      spriteUrl: log.value.own_pokemon_1_sprite_url,
    }
    : null

  editOwnPokemon2.value = log.value.own_pokemon_2_name
    ? {
      name: log.value.own_pokemon_2_name,
      spriteUrl: log.value.own_pokemon_2_sprite_url,
    }
    : null

  editOpponentPokemon1.value = log.value.opponent_pokemon_1_name
    ? {
      name: log.value.opponent_pokemon_1_name,
      spriteUrl: log.value.opponent_pokemon_1_sprite_url,
    }
    : null

  editOpponentPokemon2.value = log.value.opponent_pokemon_2_name
    ? {
      name: log.value.opponent_pokemon_2_name,
      spriteUrl: log.value.opponent_pokemon_2_sprite_url,
    }
    : null
}

const startEditing = () => {
  syncEditForm()
  successMessage.value = ''
  errorMessage.value = ''
  isEditing.value = true
}

const saveDetails = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!log.value) {
    errorMessage.value = 'Kampflog wurde nicht geladen.'
    return
  }

  if (!editOwnDeckName.value.trim()) {
    errorMessage.value = 'Bitte gib deinen Decknamen ein.'
    return
  }

  if (!editOpponentDeckName.value.trim()) {
    errorMessage.value = 'Bitte gib den gegnerischen Decknamen ein.'
    return
  }

  if (!editOwnPokemon1.value) {
    errorMessage.value = 'Bitte wähle dein erstes Pokémon aus.'
    return
  }

  if (!editOpponentPokemon1.value) {
    errorMessage.value = 'Bitte wähle das erste Pokémon des Gegners aus.'
    return
  }

  isSavingDetails.value = true

  const wentFirstValue =
    editWentFirst.value === 'first'
      ? true
      : editWentFirst.value === 'second'
        ? false
        : null

  const { error } = await supabase
    .from('battle_logs')
    .update({
      result: editResult.value,
      went_first: wentFirstValue,
      format: editFormat.value.trim() || null,

      own_deck_name: editOwnDeckName.value.trim(),
      own_pokemon_1_name: editOwnPokemon1.value.name,
      own_pokemon_1_sprite_url: editOwnPokemon1.value.spriteUrl,
      own_pokemon_2_name: editOwnPokemon2.value?.name ?? null,
      own_pokemon_2_sprite_url: editOwnPokemon2.value?.spriteUrl ?? null,

      opponent_deck_name: editOpponentDeckName.value.trim(),
      opponent_pokemon_1_name: editOpponentPokemon1.value.name,
      opponent_pokemon_1_sprite_url: editOpponentPokemon1.value.spriteUrl,
      opponent_pokemon_2_name: editOpponentPokemon2.value?.name ?? null,
      opponent_pokemon_2_sprite_url: editOpponentPokemon2.value?.spriteUrl ?? null,

      updated_at: new Date().toISOString(),
    })
    .eq('id', log.value.id)

  isSavingDetails.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  successMessage.value = 'Kampflog wurde aktualisiert.'
  isEditing.value = false
  await loadLog()
}

const cancelEditing = () => {
  isEditing.value = false
  successMessage.value = ''
  errorMessage.value = ''
}

import type { SelectedPokemon } from '~/components/PokemonSelect.vue'

definePageMeta({
  middleware: ['auth'],
})

type BattleLog = {
  id: string
  player_name: string
  opponent_name: string | null
  result: 'win' | 'loss' | 'draw' | 'unknown'
  went_first: boolean | null
  format: string | null

  own_deck_name: string | null
  own_pokemon_1_name: string | null
  own_pokemon_1_sprite_url: string | null
  own_pokemon_2_name: string | null
  own_pokemon_2_sprite_url: string | null

  opponent_deck_name: string | null
  opponent_pokemon_1_name: string | null
  opponent_pokemon_1_sprite_url: string | null
  opponent_pokemon_2_name: string | null
  opponent_pokemon_2_sprite_url: string | null

  raw_log: string
  notes: string | null
  played_at: string
  created_at: string
}

const route = useRoute()
const supabase = useSupabaseClient()

const log = ref<BattleLog | null>(null)
const notes = ref('')
const isLoading = ref(true)
const isSavingNotes = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const logId = computed(() => String(route.params.id))

const formatDate = (dateValue: string) => {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue))
}

const getResultLabel = (result: BattleLog['result']) => {
  if (result === 'win') {
    return 'Win'
  }

  if (result === 'loss') {
    return 'Loss'
  }

  if (result === 'draw') {
    return 'Draw'
  }

  return 'Unknown'
}

const getResultClasses = (result: BattleLog['result']) => {
  if (result === 'win') {
    return 'bg-emerald-50 text-emerald-800 border-emerald-100'
  }

  if (result === 'loss') {
    return 'bg-red-50 text-red-800 border-red-100'
  }

  if (result === 'draw') {
    return 'bg-amber-50 text-amber-800 border-amber-100'
  }

  return 'bg-slate-100 text-slate-700 border-slate-200'
}

const normalizeLogLine = (line: string) => {
  return line
    .trim()
    .replace(/^[-•]\s*/, '')
}

const getTakenPrizeCount = (line: string) => {
  const normalizedLine = normalizeLogLine(line)

  const match = normalizedLine.match(
    /hat\s+(eine|einen|ein|\d+)\s+(?:Preis|Preise|Preiskarte|Preiskarten)\s+(?:aufgenommen|genommen)/i,
  )

  if (!match) {
    return 0
  }

  if (['eine', 'einen', 'ein'].includes(match[1].toLowerCase())) {
    return 1
  }

  return Number(match[1])
}

const getPrizeTakingPlayerName = (line: string) => {
  const normalizedLine = normalizeLogLine(line)

  const match = normalizedLine.match(
    /^(.+?)\s+hat\s+(?:eine|einen|ein|\d+)\s+(?:Preis|Preise|Preiskarte|Preiskarten)\s+(?:aufgenommen|genommen)/i,
  )

  return match?.[1]?.trim() ?? null
}

const parseRawPrizeLine = (line: string) => {
  const match = line.match(/^(.+?):\s*(\d+)(?:\s*→\s*(\d+))?\s*(?:prizes?|Preise?)$/i)

  if (!match) {
    return null
  }

  const beforeCount = Number(match[2])
  const afterCount = match[3] ? Number(match[3]) : beforeCount

  return {
    playerName: match[1].trim(),
    beforeCount,
    afterCount,
    hasChanged: beforeCount !== afterCount,
  }
}

const formatPrizeLine = (
  playerName: string,
  beforeCount: number,
  afterCount: number,
  hasChanged: boolean,
) => {
  return hasChanged
    ? `${playerName}: ${beforeCount} → ${afterCount} Preise`
    : `${playerName}: ${afterCount} Preise`
}

const rawLogSections = computed(() => {
  if (!log.value?.raw_log) {
    return []
  }

  const lines = log.value.raw_log
    .split('\n')
    .map((line) => line.trimEnd())

  const parsedSections: {
    title: string
    rawPrizeLines: string[]
    steps: {
      text: string
      detailLines: string[]
      isHighlighted: boolean
    }[]
  }[] = []

  let currentSection: {
    title: string
    rawPrizeLines: string[]
    steps: {
      text: string
      detailLines: string[]
      isHighlighted: boolean
    }[]
  } | null = null

  let currentStep: {
    text: string
    detailLines: string[]
    isHighlighted: boolean
  } | null = null

  const pushCurrentStep = () => {
    if (!currentSection || !currentStep) {
      return
    }

    currentStep.isHighlighted = currentStep.detailLines.length > 0
    currentSection.steps.push(currentStep)
    currentStep = null
  }

  const pushCurrentSection = () => {
    if (!currentSection) {
      return
    }

    pushCurrentStep()
    parsedSections.push(currentSection)
    currentSection = null
  }

  const isSectionTitle = (line: string) =>
    line === 'Vorbereitung' || /^Zug von .+/i.test(line)

  const isDetailLine = (line: string) =>
    line.startsWith('- ') || line.startsWith('• ')

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine) {
      continue
    }

    if (isSectionTitle(trimmedLine)) {
      pushCurrentSection()

      currentSection = {
        title: trimmedLine,
        rawPrizeLines: [],
        steps: [],
      }

      continue
    }

    if (!currentSection) {
      currentSection = {
        title: 'Kampflog',
        rawPrizeLines: [],
        steps: [],
      }
    }

    if (/^Zug von .+/i.test(currentSection.title) && parseRawPrizeLine(trimmedLine)) {
      currentSection.rawPrizeLines.push(trimmedLine)
      continue
    }

    if (isDetailLine(trimmedLine) && currentStep) {
      currentStep.detailLines.push(trimmedLine)
      continue
    }

    pushCurrentStep()

    currentStep = {
      text: trimmedLine,
      detailLines: [],
      isHighlighted: false,
    }
  }

  pushCurrentSection()

  const playerNames = [
    log.value.player_name,
    log.value.opponent_name,
    ...parsedSections
      .map((section) => section.title.match(/^Zug von\s+(.+)$/i)?.[1]?.trim())
      .filter(Boolean),
    ...parsedSections
      .flatMap((section) => section.rawPrizeLines)
      .map((line) => parseRawPrizeLine(line)?.playerName)
      .filter(Boolean),
  ].filter((name): name is string => Boolean(name))

  const uniquePlayerNames = Array.from(new Set(playerNames))
  const prizesByPlayer = new Map(uniquePlayerNames.map((name) => [name, 6]))

  return parsedSections.map((section) => {
    const rawPrizeMappings = section.rawPrizeLines
      .map((line) => parseRawPrizeLine(line))
      .filter((prizeLine): prizeLine is NonNullable<ReturnType<typeof parseRawPrizeLine>> => Boolean(prizeLine))

    if (rawPrizeMappings.length) {
      for (const prizeMapping of rawPrizeMappings) {
        prizesByPlayer.set(prizeMapping.playerName, prizeMapping.afterCount)
      }

      return {
        ...section,
        prizeLines: rawPrizeMappings.map((prizeMapping) => ({
          text: formatPrizeLine(
            prizeMapping.playerName,
            prizeMapping.beforeCount,
            prizeMapping.afterCount,
            prizeMapping.hasChanged,
          ),
          isHighlighted: prizeMapping.hasChanged,
        })),
      }
    }

    const prizeCountsBeforeTurn = new Map(prizesByPlayer)
    const changedPlayers = new Set<string>()

    for (const step of section.steps) {
      const linesToCheck = [step.text, ...step.detailLines]

      for (const lineToCheck of linesToCheck) {
        const playerName = getPrizeTakingPlayerName(lineToCheck)
        const takenPrizeCount = getTakenPrizeCount(lineToCheck)

        if (!playerName || takenPrizeCount === 0) {
          continue
        }

        const currentPrizeCount = prizesByPlayer.get(playerName) ?? 6
        prizesByPlayer.set(playerName, Math.max(currentPrizeCount - takenPrizeCount, 0))
        changedPlayers.add(playerName)
      }
    }

    const prizeLines = /^Zug von .+/i.test(section.title)
      ? uniquePlayerNames.map((playerName) => {
        const beforeCount = prizeCountsBeforeTurn.get(playerName) ?? 6
        const afterCount = prizesByPlayer.get(playerName) ?? beforeCount
        const hasChanged = changedPlayers.has(playerName)

        return {
          text: formatPrizeLine(playerName, beforeCount, afterCount, hasChanged),
          isHighlighted: hasChanged,
        }
      })
      : []

    return {
      ...section,
      prizeLines,
    }
  })
})

const getRawLogSectionClasses = (sectionTitle: string) => {
  const normalizedTitle = sectionTitle.trim().toLowerCase()
  const ownTurnTitle = log.value
    ? `zug von ${log.value.player_name}`.toLowerCase()
    : ''

  if (normalizedTitle === 'vorbereitung') {
    return 'border-slate-300 bg-slate-100 text-slate-950'
  }

  if (normalizedTitle === ownTurnTitle) {
    return 'border-sky-200 bg-sky-100 text-slate-950'
  }

  if (normalizedTitle.startsWith('zug von ')) {
    return 'border-red-200 bg-red-100 text-slate-950'
  }

  return 'border-slate-200 bg-white text-slate-950'
}

const loadLog = async () => {
  isLoading.value = true
  errorMessage.value = ''

  const { data, error } = await supabase
    .from('battle_logs')
    .select(`
      id,
      player_name,
      opponent_name,
      result,
      went_first,
      format,
      own_deck_name,
      own_pokemon_1_name,
      own_pokemon_1_sprite_url,
      own_pokemon_2_name,
      own_pokemon_2_sprite_url,
      opponent_deck_name,
      opponent_pokemon_1_name,
      opponent_pokemon_1_sprite_url,
      opponent_pokemon_2_name,
      opponent_pokemon_2_sprite_url,
      raw_log,
      notes,
      played_at,
      created_at
    `)
    .eq('id', logId.value)
    .maybeSingle()

  isLoading.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  if (!data) {
    errorMessage.value = 'Kampflog wurde nicht gefunden.'
    return
  }

  log.value = data as BattleLog
  notes.value = data.notes ?? ''
  syncEditForm()
}

const deleteLog = async () => {
  if (!log.value) {
    return
  }

  const shouldDelete = confirm('Möchtest du diesen Kampflog wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')

  if (!shouldDelete) {
    return
  }

  isDeleting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const { error } = await supabase
    .from('battle_logs')
    .delete()
    .eq('id', log.value.id)

  isDeleting.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  await navigateTo('/logs')
}

const saveNotes = async () => {
  errorMessage.value = ''
  successMessage.value = ''
  isSavingNotes.value = true

  const { error } = await supabase
    .from('battle_logs')
    .update({
      notes: notes.value.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', logId.value)

  isSavingNotes.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  successMessage.value = 'Notizen wurden gespeichert.'

  if (log.value) {
    log.value.notes = notes.value.trim() || null
  }
}

onMounted(() => {
  loadLog()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
    <section class="mx-auto max-w-5xl">
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
            MatchVault
          </p>

          <h1 class="mt-2 text-4xl font-black">
            Kampflog
          </h1>
        </div>
        <div class="flex flex-wrap gap-3">
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

          <button
            v-if="log && !isEditing"
            type="button"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
            @click="startEditing"
          >
            Bearbeiten
          </button>

          <button
            v-if="log"
            type="button"
            class="rounded-xl bg-red-50 px-5 py-3 text-center font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDeleting"
            @click="deleteLog"
          >
            {{ isDeleting ? 'Löscht...' : 'Löschen' }}
          </button>

          <NuxtLink
            to="/logs"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Zurück zu Logs
          </NuxtLink>
        </div>
      </div>

      <section
        v-if="isEditing"
        class="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-black">
              Kampflog bearbeiten
            </h2>

            <p class="mt-2 text-slate-600">
              Korrigiere Deckdaten, Ergebnis, Format oder Startposition.
            </p>
          </div>

          <button
            type="button"
            class="text-sm font-bold text-slate-500 hover:text-slate-950"
            @click="cancelEditing"
          >
            Abbrechen
          </button>
        </div>

        <div class="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label for="edit-result" class="block text-sm font-bold text-slate-700">
              Ergebnis
            </label>

            <select
              id="edit-result"
              v-model="editResult"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
            >
              <option value="win">
                Win
              </option>
              <option value="loss">
                Loss
              </option>
              <option value="draw">
                Draw
              </option>
              <option value="unknown">
                Unknown
              </option>
            </select>
          </div>

          <div>
            <label for="edit-went-first" class="block text-sm font-bold text-slate-700">
              Startposition
            </label>

            <select
              id="edit-went-first"
              v-model="editWentFirst"
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-slate-950"
            >
              <option value="first">
                1st
              </option>
              <option value="second">
                2nd
              </option>
              <option value="unknown">
                Unbekannt
              </option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label for="edit-format" class="block text-sm font-bold text-slate-700">
              Format
            </label>

            <input
              id="edit-format"
              v-model="editFormat"
              type="text"
              class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
              placeholder="z. B. TEF-POR"
            >
          </div>
        </div>

        <div class="mt-8 grid gap-8 md:grid-cols-2">
          <section>
            <h3 class="text-xl font-black">
              Dein Deck
            </h3>

            <div class="mt-4 space-y-4">
              <div>
                <label for="edit-own-deck-name" class="block text-sm font-bold text-slate-700">
                  Deckname
                </label>

                <input
                  id="edit-own-deck-name"
                  v-model="editOwnDeckName"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                >
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 1
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="editOwnPokemon1" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 2 optional
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="editOwnPokemon2" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 class="text-xl font-black">
              Gegnerisches Deck
            </h3>

            <div class="mt-4 space-y-4">
              <div>
                <label for="edit-opponent-deck-name" class="block text-sm font-bold text-slate-700">
                  Deckname
                </label>

                <input
                  id="edit-opponent-deck-name"
                  v-model="editOpponentDeckName"
                  type="text"
                  class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
                >
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 1
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="editOpponentPokemon1" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-bold text-slate-700">
                  Pokémon 2 optional
                </label>

                <div class="mt-2">
                  <PokemonSelect v-model="editOpponentPokemon2" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <p v-if="errorMessage" class="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {{ errorMessage }}
        </p>

        <p v-if="successMessage" class="mt-6 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
          {{ successMessage }}
        </p>

        <div class="mt-8 flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-950 transition hover:bg-slate-200"
            @click="cancelEditing"
          >
            Abbrechen
          </button>

          <button
            type="button"
            class="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isSavingDetails"
            @click="saveDetails"
          >
            {{ isSavingDetails ? 'Speichert...' : 'Änderungen speichern' }}
          </button>
        </div>
      </section>

      <div v-if="isLoading" class="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
        Kampflog wird geladen...
      </div>

      <div v-else-if="errorMessage && !log" class="rounded-2xl border border-red-100 bg-red-50 p-8 font-semibold text-red-700 shadow-sm">
        {{ errorMessage }}
      </div>

      <div v-else-if="log" class="space-y-8">
        <section
          class="rounded-2xl border p-8 shadow-sm"
          :class="getResultClasses(log.result)"
        >
          <div class="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm font-bold uppercase tracking-wide opacity-70">
                {{ formatDate(log.played_at) }}
              </p>

              <h2 class="mt-3 text-3xl font-black">
                {{ getResultLabel(log.result) }}
                <span v-if="log.opponent_deck_name">
                  vs {{ log.opponent_deck_name }}
                </span>
              </h2>

              <p class="mt-2 font-semibold opacity-80">
                {{ log.player_name }}
                <span v-if="log.opponent_name">
                  gegen {{ log.opponent_name }}
                </span>
              </p>

              <p class="mt-2 text-sm font-bold opacity-70">
                {{ log.went_first === true ? '1st' : log.went_first === false ? '2nd' : 'First/Second unbekannt' }}
                <span v-if="log.format">
                  · {{ log.format }}
                </span>
              </p>
            </div>

            <div class="grid gap-6 md:grid-cols-2">
              <div>
                <p class="text-sm font-bold opacity-70">
                  Dein Deck
                </p>

                <p class="mt-1 text-xl font-black">
                  {{ log.own_deck_name || 'Unbekannt' }}
                </p>

                <div class="mt-3 flex items-center gap-2">
                  <img
                    v-if="log.own_pokemon_1_sprite_url"
                    :src="log.own_pokemon_1_sprite_url"
                    :alt="log.own_pokemon_1_name || 'Eigenes Pokémon 1'"
                    class="h-16 w-16 object-contain"
                  >

                  <img
                    v-if="log.own_pokemon_2_sprite_url"
                    :src="log.own_pokemon_2_sprite_url"
                    :alt="log.own_pokemon_2_name || 'Eigenes Pokémon 2'"
                    class="h-16 w-16 object-contain"
                  >
                </div>
              </div>

              <div>
                <p class="text-sm font-bold opacity-70">
                  Gegnerisches Deck
                </p>

                <p class="mt-1 text-xl font-black">
                  {{ log.opponent_deck_name || 'Unbekannt' }}
                </p>

                <div class="mt-3 flex items-center gap-2">
                  <img
                    v-if="log.opponent_pokemon_1_sprite_url"
                    :src="log.opponent_pokemon_1_sprite_url"
                    :alt="log.opponent_pokemon_1_name || 'Gegnerisches Pokémon 1'"
                    class="h-16 w-16 object-contain"
                  >

                  <img
                    v-if="log.opponent_pokemon_2_sprite_url"
                    :src="log.opponent_pokemon_2_sprite_url"
                    :alt="log.opponent_pokemon_2_name || 'Gegnerisches Pokémon 2'"
                    class="h-16 w-16 object-contain"
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-2xl font-black">
              Notes
            </h2>

            <button
              type="button"
              class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isSavingNotes"
              @click="saveNotes"
            >
              {{ isSavingNotes ? 'Speichert...' : 'Notizen speichern' }}
            </button>
          </div>

          <textarea
            v-model="notes"
            rows="4"
            class="mt-4 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
            placeholder="Notizen zu diesem Match..."
          />

          <p v-if="successMessage" class="mt-4 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
            {{ successMessage }}
          </p>

          <p v-if="errorMessage" class="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {{ errorMessage }}
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-2xl font-black">
            Matchverlauf
          </h2>

          <article
            v-for="section in rawLogSections"
            :key="section.title"
            class="rounded-2xl border p-6 shadow-sm"
            :class="getRawLogSectionClasses(section.title)"
          >
            <h3 class="text-xl font-black">
              {{ section.title }}
            </h3>

            <div
              v-if="section.prizeLines.length"
              class="mt-5 space-y-1 text-lg leading-8 text-slate-500"
            >
              <p
                v-for="prizeLine in section.prizeLines"
                :key="prizeLine.text"
                :class="prizeLine.isHighlighted ? 'text-sm font-bold' : 'text-sm'"
              >
                {{ prizeLine.text }}
              </p>
            </div>

            <div class="mt-8 space-y-5">
              <div
                v-for="(step, stepIndex) in section.steps"
                :key="`${section.title}-${stepIndex}-${step.text}`"
                :class="stepIndex > 0 ? '' : ''"
              >
                <p
                  class="whitespace-pre-wrap break-words text-lg leading-8 text-slate-950"
                  :class="step.isHighlighted ? 'font-semibold' : 'font-normal'"
                >
                  {{ step.text }}
                </p>

                <div
                  v-if="step.detailLines.length"
                  class="mt-2 space-y-1 text-base font-normal leading-7 text-slate-950"
                >
                  <p
                    v-for="detailLine in step.detailLines"
                    :key="detailLine"
                    class="whitespace-pre-wrap break-words"
                  >
                    {{ detailLine }}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </section>
  </main>
</template>
