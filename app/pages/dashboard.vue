<script setup lang="ts">
import { useBattleLogs } from "~/composables/useBattleLogs";
import Navigation from "~/components/Navigation.vue";

definePageMeta({
  middleware: ['auth'],
})

const supabase = useSupabaseClient()

const {
  logs: todayLogs,
  isLoading: isLoadingTodayLogs,
  errorMessage: todayLogsErrorMessage,
  loadTodayLogs,
} = useBattleLogs()

const playerName = ref('')
const displayName = ref('')
const isLoadingProfile = ref(true)
const errorMessage = ref('')

const todayLogsCountLabel = computed(() => {
  return todayLogs.value.length === 1
      ? 'Kampflog heute'
      : 'Kampflogs heute'
})

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    errorMessage.value = error.message
    return
  }

  await navigateTo('/login')
}

const getCurrentUserId = async () => {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Fehler beim Laden des Users:', error.message)
    return null
  }

  if (!data.user) {
    return null
  }

  return data.user.id
}

const loadProfile = async () => {
  isLoadingProfile.value = true
  errorMessage.value = ''

  try {
    const userId = await getCurrentUserId()

    if (!userId) {
      errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
      return
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('player_name, display_name')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      errorMessage.value = error.message
      return
    }

    playerName.value = data?.player_name ?? ''
    displayName.value = data?.display_name ?? ''
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Das Profil konnte nicht geladen werden.'
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadProfile(),
    loadTodayLogs(),
  ])
})
</script>

<template>
  <PageShell>
    <PageHeader
      title="Dashboard"
      description="Du bist erfolgreich eingeloggt."
    >
    </PageHeader>

      <div class="mt-8 grid gap-6 md:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 class="text-2xl font-black">
            Dein Pokémon TCG Profil
          </h2>

          <div v-if="isLoadingProfile" class="mt-4 text-slate-600">
            Profil wird geladen...
          </div>

          <div v-else-if="errorMessage" class="mt-4 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {{ errorMessage }}
          </div>

          <div v-else-if="playerName" class="mt-4">
            <p class="text-sm font-bold uppercase tracking-wide text-slate-500">
              Spielername
            </p>

            <p class="mt-2 text-3xl font-black">
              {{ playerName }}
            </p>

            <p v-if="displayName" class="mt-2 text-slate-600">
              Anzeigename: {{ displayName }}
            </p>
          </div>

          <div v-else class="mt-4 rounded-xl bg-amber-50 p-4 text-amber-800">
            <p class="font-bold">
              Du hast noch keinen Pokémon TCG Live Spielernamen hinterlegt.
            </p>

            <NuxtLink
              to="/profile"
              class="mt-3 inline-block font-bold underline"
            >
              Jetzt Profil ausfüllen
            </NuxtLink>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 class="text-2xl font-black">
            Kampflog einfügen
          </h2>

          <div class="mt-5 relative">
            <BattleLogForm
              compact
              @saved="loadTodayLogs"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-2xl font-black">
              Heutige Logs
            </h2>

            <p class="mt-1 text-sm font-semibold text-slate-500">
              {{ todayLogs.length }} {{ todayLogsCountLabel }}
            </p>
          </div>

          <NuxtLink
            to="/logs"
            class="rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Alle Logs anzeigen
          </NuxtLink>
        </div>

        <div v-if="isLoadingTodayLogs" class="mt-6 text-slate-600">
          Heutige Logs werden geladen...
        </div>

        <div v-else-if="todayLogsErrorMessage" class="mt-6 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {{ todayLogsErrorMessage }}
        </div>

        <div v-else-if="todayLogs.length === 0" class="mt-6 rounded-xl bg-slate-100 p-6 text-slate-600">
          Heute wurden noch keine Kampflogs gespeichert.
        </div>

        <div v-else class="mt-6 space-y-4">
          <BattleLogCard
            v-for="log in todayLogs"
            :key="log.id"
            :log="log"
            show-own-deck
          />
        </div>
      </div>
  </PageShell>
</template>
