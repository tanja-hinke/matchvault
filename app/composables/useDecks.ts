import type { Deck } from '~/types/deck'

export const useDecks = () => {
  const supabase = useSupabaseClient()

  const decks = ref<Deck[]>([])
  const isLoading = ref(false)
  const errorMessage = ref('')

  const getCurrentUserId = async () => {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user?.id) {
      return null
    }

    return data.user.id
  }

  const loadDecks = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const userId = await getCurrentUserId()

      if (!userId) {
        decks.value = []
        errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
        return
      }

      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })

      if (error) {
        errorMessage.value = error.message
        return
      }

      decks.value = data ?? []
    } catch (error) {
      console.error(error)
      errorMessage.value = 'Die Decks konnten nicht geladen werden.'
    } finally {
      isLoading.value = false
    }
  }

  const createDeck = async (payload: Omit<Deck, 'id' | 'user_id' | 'created_at'>) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const userId = await getCurrentUserId()

      if (!userId) {
        errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
        return null
      }

      const { data, error } = await supabase
        .from('decks')
        .insert({
          ...payload,
          user_id: userId,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        errorMessage.value = error.message
        return null
      }

      await loadDecks()
      return data
    } catch (error) {
      console.error(error)
      errorMessage.value = 'Das Deck konnte nicht erstellt werden.'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const deleteDeck = async (id: string) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const userId = await getCurrentUserId()

      if (!userId) {
        errorMessage.value = 'Du bist nicht eingeloggt. Bitte melde dich erneut an.'
        return false
      }

      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        errorMessage.value = error.message
        return false
      }

      await loadDecks()
      return true
    } catch (error) {
      console.error(error)
      errorMessage.value = 'Das Deck konnte nicht gelöscht werden.'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    decks,
    isLoading,
    errorMessage,
    loadDecks,
    createDeck,
    deleteDeck,
  }
}
