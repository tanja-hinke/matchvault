<template>
  <main class="min-h-screen bg-slate-50 text-slate-950">
    <section class="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
      <p class="mb-4 rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
        Pokémon TCG Live Kampflog Tracker
      </p>

      <h1 class="text-5xl font-black tracking-tight md:text-7xl">
        MatchVault
      </h1>

      <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        Speichere, analysiere und filtere deine Pokémon TCG Live Kampflogs.
      </p>

      <div class="mt-10 flex flex-wrap justify-center gap-4">
        <NuxtLink
          to="/login"
          class="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
        >
          Einloggen
        </NuxtLink>

        <NuxtLink
          to="/register"
          class="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-slate-950 transition hover:bg-slate-100"
        >
          Registrieren
        </NuxtLink>
      </div>
    </section>
  </main>
</template>
