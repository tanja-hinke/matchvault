export default defineNuxtRouteMiddleware(async (to) => {
  const supabase = useSupabaseClient()

  const getValidSession = async () => {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      const expiresAt = data.session.expires_at ?? 0
      const now = Math.floor(Date.now() / 1000)
      const expiresInSeconds = expiresAt - now

      if (expiresInSeconds > 60) {
        return data.session
      }

      const { data: refreshedData } = await supabase.auth.refreshSession()

      return refreshedData.session
    }

    const { data: refreshedData } = await supabase.auth.refreshSession()

    return refreshedData.session
  }

  let session = await getValidSession()

  if (!session) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    session = await getValidSession()
  }

  if (!session) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})