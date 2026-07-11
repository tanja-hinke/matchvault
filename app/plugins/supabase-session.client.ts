export default defineNuxtPlugin(() => {
    const supabase = useSupabaseClient()

    let refreshPromise: Promise<void> | null = null

    const refreshSessionIfNeeded = async () => {
        if (refreshPromise) {
            return refreshPromise
        }

        refreshPromise = (async () => {
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.warn('Supabase session check failed:', error.message)
                return
            }

            const session = data.session

            if (!session) {
                const { error: refreshError } = await supabase.auth.refreshSession()

                if (refreshError) {
                    console.warn('Supabase session refresh failed:', refreshError.message)
                }

                return
            }

            const expiresAt = session.expires_at ?? 0
            const now = Math.floor(Date.now() / 1000)
            const expiresInSeconds = expiresAt - now

            if (expiresInSeconds <= 300) {
                const { error: refreshError } = await supabase.auth.refreshSession()

                if (refreshError) {
                    console.warn('Supabase session refresh failed:', refreshError.message)
                }
            }
        })()

        try {
            await refreshPromise
        } finally {
            refreshPromise = null
        }
    }

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            void refreshSessionIfNeeded()
        }
    })

    window.addEventListener('focus', () => {
        void refreshSessionIfNeeded()
    })

    window.addEventListener('pageshow', () => {
        void refreshSessionIfNeeded()
    })

    window.addEventListener('online', () => {
        void refreshSessionIfNeeded()
    })

    void refreshSessionIfNeeded()

    setInterval(() => {
        if (document.visibilityState === 'visible') {
            void refreshSessionIfNeeded()
        }
    }, 60_000)
})