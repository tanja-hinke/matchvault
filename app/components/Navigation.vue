<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout fehlgeschlagen:', error.message)
    return
  }

  await navigateTo('/login')
}

const linkClass = (path: string) => {
  return [
    'rounded-xl px-5 py-3 font-bold transition flex-grow text-center lg:text-left',
    isActiveRoute(path)
        ? 'bg-slate-950 text-white'
        : 'border border-slate-300 bg-white text-slate-950 hover:bg-slate-100',
  ]
}
</script>

<template>
  <nav class="flex lg:flex-col gap-3">
    <NuxtLink
        to="/dashboard"
        :class="linkClass('/dashboard')"
    >
      Dashboard
    </NuxtLink>

    <NuxtLink
        to="/profile"
        :class="linkClass('/profile')"
    >
      Profil
    </NuxtLink>

    <NuxtLink
        to="/decks"
        :class="linkClass('/decks')"
    >
      Decks
    </NuxtLink>

    <NuxtLink
        to="/logs"
        :class="linkClass('/logs')"
    >
      Logs
    </NuxtLink>

    <NuxtLink
        to="/matchups"
        :class="linkClass('/matchups')"
    >
      Matchups
    </NuxtLink>

    <button
        type="button"
        class="rounded-xl border border-red-700 bg-red-50 px-5 py-3 text-center font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleLogout"
    >
      Ausloggen
    </button>
  </nav>
</template>