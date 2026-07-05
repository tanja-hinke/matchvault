import type { BattleLog } from '~/types/battle-log'

const BATTLE_LOG_SELECT = `
  id,
  player_name,
  own_deck_name,
  own_pokemon_1_name,
  own_pokemon_1_sprite_url,
  own_pokemon_2_name,
  own_pokemon_2_sprite_url,
  opponent_name,
  opponent_deck_name,
  opponent_pokemon_1_name,
  opponent_pokemon_1_sprite_url,
  opponent_pokemon_2_name,
  opponent_pokemon_2_sprite_url,
  result,
  went_first,
  format,
  played_at,
  created_at
`

const BATTLE_LOG_DETAIL_SELECT = `
  id,
  player_name,
  own_deck_name,
  own_pokemon_1_name,
  own_pokemon_1_sprite_url,
  own_pokemon_2_name,
  own_pokemon_2_sprite_url,
  opponent_name,
  opponent_deck_name,
  opponent_pokemon_1_name,
  opponent_pokemon_1_sprite_url,
  opponent_pokemon_2_name,
  opponent_pokemon_2_sprite_url,
  result,
  went_first,
  format,
  raw_log,
  played_at,
  created_at
`

type LoadBattleLogsOptions = {
  ownDeckName?: string
  from?: string
  to?: string
}

type UpdateBattleLogPayload = {
  result: BattleLog['result']
  went_first: boolean | null
  own_deck_name: string
  own_pokemon_1_name: string
  own_pokemon_1_sprite_url: string | null
  own_pokemon_2_name: string | null
  own_pokemon_2_sprite_url: string | null
  opponent_deck_name: string
  opponent_pokemon_1_name: string
  opponent_pokemon_1_sprite_url: string | null
  opponent_pokemon_2_name: string | null
  opponent_pokemon_2_sprite_url: string | null
  format: string | null
}

export const useBattleLogs = () => {
  const supabase = useSupabaseClient()

  const logs = ref<BattleLog[]>([])
  const log = ref<BattleLog | null>(null)
  const isLoading = ref(true)
  const isLoadingLog = ref(true)
  const isSavingLog = ref(false)
  const errorMessage = ref('')
  const logErrorMessage = ref('')
  const saveLogErrorMessage = ref('')

  const loadLogs = async (options: LoadBattleLogsOptions = {}) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      let query = supabase
        .from('battle_logs')
        .select(BATTLE_LOG_SELECT)
        .order('played_at', { ascending: false })

      if (options.ownDeckName) {
        query = query.eq('own_deck_name', options.ownDeckName)
      }

      if (options.from) {
        query = query.gte('played_at', options.from)
      }

      if (options.to) {
        query = query.lt('played_at', options.to)
      }

      const { data, error } = await query

      if (error) {
        errorMessage.value = error.message
        return
      }

      logs.value = data ?? []
    } catch (error) {
      console.error(error)
      errorMessage.value = 'Die Kampflogs konnten nicht geladen werden.'
    } finally {
      isLoading.value = false
    }
  }

  const loadLogById = async (id: string) => {
    isLoadingLog.value = true
    logErrorMessage.value = ''
    log.value = null

    try {
      const { data, error } = await supabase
        .from('battle_logs')
        .select(BATTLE_LOG_DETAIL_SELECT)
        .eq('id', id)
        .maybeSingle()

      if (error) {
        logErrorMessage.value = error.message
        return
      }

      if (!data) {
        logErrorMessage.value = 'Das Kampflog wurde nicht gefunden.'
        return
      }

      log.value = data
    } catch (error) {
      console.error(error)
      logErrorMessage.value = 'Das Kampflog konnte nicht geladen werden.'
    } finally {
      isLoadingLog.value = false
    }
  }

  const updateLogById = async (id: string, payload: UpdateBattleLogPayload) => {
    isSavingLog.value = true
    saveLogErrorMessage.value = ''

    try {
      const { error } = await supabase
        .from('battle_logs')
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        saveLogErrorMessage.value = error.message
        return false
      }

      return true
    } catch (error) {
      console.error(error)
      saveLogErrorMessage.value = 'Das Kampflog konnte nicht gespeichert werden.'
      return false
    } finally {
      isSavingLog.value = false
    }
  }

  const loadTodayLogs = async () => {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

    await loadLogs({
      from: startOfToday.toISOString(),
      to: startOfTomorrow.toISOString(),
    })
  }

  return {
    logs,
    log,
    isLoading,
    isLoadingLog,
    isSavingLog,
    errorMessage,
    logErrorMessage,
    saveLogErrorMessage,
    loadLogs,
    loadLogById,
    updateLogById,
    loadTodayLogs,
  }
}
