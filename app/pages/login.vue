<script setup lang="ts">
const supabase = useSupabaseClient()
const route = useRoute()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Bitte gib deine E-Mail und dein Passwort ein.'
    return
  }

  isLoading.value = true

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })

  isLoading.value = false

  if (error) {
    errorMessage.value = error.message
    return
  }

  const redirectTo = typeof route.query.redirect === 'string'
    ? route.query.redirect
    : '/dashboard'

  await navigateTo(redirectTo)
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  if (data.session) {
    const redirectTo = typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/dashboard'

    await navigateTo(redirectTo)
  }
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
    <section class="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <NuxtLink to="/" class="text-sm font-bold text-slate-500 hover:text-slate-950">
        ← Zurück
      </NuxtLink>

      <h1 class="mt-6 text-3xl font-black">
        Einloggen
      </h1>

      <p class="mt-2 text-slate-600">
        Melde dich mit deinem MatchVault Account an.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label for="email" class="block text-sm font-bold text-slate-700">
            E-Mail
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
            placeholder="name@example.com"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-bold text-slate-700">
            Passwort
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-950"
            placeholder="••••••••"
          >
        </div>

        <p v-if="errorMessage" class="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Login läuft...' : 'Einloggen' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-600">
        Noch keinen Account?
        <NuxtLink to="/register" class="font-bold text-slate-950 underline">
          Registrieren
        </NuxtLink>
      </p>
    </section>
  </main>
</template>
