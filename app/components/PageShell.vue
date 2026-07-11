<template>
  <main class="lg:flex gap-6 min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
    <aside class="lg:w-56 lg:shrink-0 mb-8">
      <div class="sticky top-10">
        <Navigation />
      </div>
    </aside>
    <section
      class="w-full"
    >
      <slot />
    </section>
  </main>
</template>
