<template>
  <section
    class="relative min-h-[70vh] cursor-none rounded-3xl bg-emerald-950/60 p-8 ring-1 ring-white/10"
  >
    <!-- Custom buddy cursor -->
    <CursorBuddy />

    <div class="relative z-10 mx-auto max-w-4xl text-center">
      <h1 class="text-3xl font-bold text-white">Sprout Buddy Cursor</h1>
      <p class="mt-2 text-white/70">
        Move your mouse. Hover buttons/links to see the waving pose. Click to
        see a small ripple.
      </p>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#"
          class="rounded-xl bg-emerald-600/80 px-5 py-3 text-white hover:bg-emerald-500/90"
        >
          Link Button
        </a>
        <button
          class="rounded-xl bg-white/10 px-5 py-3 text-white ring-1 ring-white/20 hover:bg-white/15"
        >
          Normal Button
        </button>
        <input
          class="w-56 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder-white/40 outline-none backdrop-blur cursor-text"
          placeholder="Type here..."
        />
      </div>

      <p class="mt-8 text-sm text-white/50">
        Tip: This page hides the system cursor only within this section. Other
        pages remain unchanged.
      </p>
    </div>
  </section>
</template>

<script setup>
import CursorBuddy from "@/components/CursorBuddy.vue";
</script>
