<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const connectionMessage = ref('Verbindung wird geprüft...')

onMounted(async () => {
  const { error } = await supabase.auth.getSession()

  if (error) {
    connectionMessage.value = `Fehler: ${error.message}`
    return
  }

  connectionMessage.value = 'Supabase ist verbunden.'
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
    <section class="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-black">
        Supabase Test
      </h1>

      <p class="mt-4 text-slate-600">
        {{ connectionMessage }}
      </p>

      <div class="mt-6 rounded-xl bg-slate-100 p-4">
        <p class="text-sm font-bold text-slate-700">
          Aktueller User:
        </p>

        <pre class="mt-2 overflow-auto text-xs text-slate-600">{{ user }}</pre>
      </div>

      <NuxtLink
        to="/"
        class="mt-6 inline-block rounded-xl bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800"
      >
        Zurück zur Startseite
      </NuxtLink>
    </section>
  </main>
</template>

<style scoped lang="scss">

</style>
