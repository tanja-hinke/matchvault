import type { Ref } from 'vue'
import type { BattleLog } from '~/types/battle-log'

type UseBattleLogFiltersOptions = {
  logs: Ref<BattleLog[]>
  searchableFields: Array<keyof BattleLog>
}

export const useBattleLogFilters = ({
                                      logs,
                                      searchableFields,
                                    }: UseBattleLogFiltersOptions) => {
  const deckFilter = ref<'all' | 'my' | 'opponent'>('all')
  const startPositionFilter = ref<'all' | 'first' | 'second' | 'unknown'>('all')
  const formatFilter = ref('all')
  const searchFilter = ref('')
  const dateFromFilter = ref('')
  const dateToFilter = ref('')

  const availableFormats = computed(() => {
    const formats = logs.value
      .map((log) => log.format)
      .filter((format): format is string => Boolean(format))

    return Array.from(new Set(formats)).sort()
  })

  const filteredLogs = computed(() => {
    const normalizedSearch = searchFilter.value.trim().toLowerCase()

    return logs.value.filter((log) => {
      const matchesStartPosition =
          startPositionFilter.value === 'all'
          || (startPositionFilter.value === 'first' && log.went_first === true)
          || (startPositionFilter.value === 'second' && log.went_first === false)
          || (startPositionFilter.value === 'unknown' && log.went_first === null)

      const matchesFormat =
          formatFilter.value === 'all'
          || log.format === formatFilter.value

      const logDate = new Date(log.played_at)

      const matchesDateFrom =
          !dateFromFilter.value
          || logDate >= new Date(`${dateFromFilter.value}T00:00:00`)

      const matchesDateTo =
          !dateToFilter.value
          || logDate <= new Date(`${dateToFilter.value}T23:59:59`)

      const deckSearchableFields = searchableFields.filter((field) => {
        if (deckFilter.value === 'my') {
          return field.startsWith('own_') || field === 'format'
        }

        if (deckFilter.value === 'opponent') {
          return field.startsWith('opponent_') || field === 'format'
        }

        return true
      })

      const searchableText = deckSearchableFields
          .map((field) => log[field])
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

      const matchesSearch =
          !normalizedSearch
          || searchableText.includes(normalizedSearch)

      return matchesStartPosition
          && matchesFormat
          && matchesDateFrom
          && matchesDateTo
          && matchesSearch
    })
  })

  const resetFilters = () => {
    deckFilter.value = 'all'
    startPositionFilter.value = 'all'
    formatFilter.value = 'all'
    searchFilter.value = ''
    dateFromFilter.value = ''
    dateToFilter.value = ''
  }

  return {
    deckFilter,
    startPositionFilter,
    formatFilter,
    searchFilter,
    dateFromFilter,
    dateToFilter,
    availableFormats,
    filteredLogs,
    resetFilters,
  }
}
