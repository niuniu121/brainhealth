<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Header from "@/components/Header.vue";
import api from "@/api";

const props = defineProps({
  theme: { type: String, default: "dark" },
});

const isDark = computed(() => props.theme === "dark");
const pageWrapClass = computed(
  () =>
    `min-h-screen ${
      isDark.value ? "bg-emerald-900 text-white" : "bg-white text-slate-900"
    }`
);
const subTextClass = computed(() =>
  isDark.value ? "text-white/70" : "text-slate-500"
);
const cardBorder = computed(() =>
  isDark.value ? "border-white/15 bg-white/5" : "border-slate-200 bg-white"
);
const chipClass = computed(() =>
  isDark.value
    ? "bg-white/10 text-white/80 border-white/15"
    : "bg-emerald-50 text-emerald-700 border-emerald-100"
);

const queue = ref([]);
const idx = ref(0);
const loading = ref(true);
const error = ref("");
const flipped = ref(false);
const current = computed(() => queue.value[idx.value] || null);

async function loadMore(limit = 12) {
  try {
    loading.value = true;
    const list = await api.flipCards(limit);
    const existing = new Set(queue.value.map((x) => x.id));
    const merged = list.filter((x) => !existing.has(x.id));
    queue.value = queue.value.concat(merged);
    if (!current.value) idx.value = 0;
  } catch (e) {
    error.value = "Failed to load flip cards.";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function flip() {
  if (!current.value) return;
  flipped.value = !flipped.value;
}

async function nextCard() {
  flipped.value = false;
  if (idx.value < queue.value.length - 1) {
    idx.value++;
  } else {
    await loadMore(12);
    if (queue.value.length > 0)
      idx.value = Math.min(idx.value + 1, queue.value.length - 1);
  }
}

function onKey(e) {
  const k = e.key.toLowerCase();
  if (k === " " || e.code === "Space") {
    e.preventDefault();
    flip();
  } else if (k === "n" || e.key === "ArrowRight") {
    nextCard();
  }
}

onMounted(async () => {
  window.addEventListener("keydown", onKey);
  await loadMore(12);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div :class="pageWrapClass">
    <Header />
    <section class="mx-auto max-w-3xl px-6 py-10">
      <h1
        :class="[
          'text-center text-3xl md:text-4xl font-bold',
          isDark ? 'text-white/95' : 'text-slate-900',
        ]"
      >
        Positive Flip Cards
      </h1>
      <p class="text-center mt-2" :class="subTextClass">
        Turn a negative thought into a kinder one
      </p>

      <div class="mt-8 flex flex-col items-center">
        <div
          v-if="loading"
          class="w-full max-w-xl h-56 md:h-64 rounded-2xl border animate-pulse"
          :class="cardBorder"
        ></div>
        <div
          v-else-if="error"
          class="w-full max-w-xl rounded-2xl border p-4 text-center"
          :class="cardBorder"
        >
          {{ error }}
        </div>

        <div v-else-if="current" class="w-full max-w-xl">
          <div class="flex justify-between items-center mb-3">
            <span
              v-if="current.tag"
              class="px-3 py-1 rounded-full text-xs border"
              :class="chipClass"
              >#{{ current.tag }}</span
            >
            <span class="text-xs opacity-70 ml-auto"
              >{{ idx + 1 }} / {{ queue.length }}</span
            >
          </div>

          <div class="flip-scene">
            <div
              class="flip-card"
              :class="{ 'is-flipped': flipped }"
              aria-live="polite"
            >
              <div
                class="flip-face flip-front rounded-2xl border p-6 md:p-8 shadow"
                :class="cardBorder"
              >
                <div class="text-sm opacity-70 mb-2">Negative thought</div>
                <div class="text-xl md:text-2xl font-semibold leading-relaxed">
                  “{{ current.negative_text }}”
                </div>
                <div class="mt-4 text-xs opacity-70">
                  Press <kbd>Space</kbd> to flip
                </div>
              </div>

              <div
                class="flip-face flip-back rounded-2xl border p-6 md:p-8 shadow"
                :class="cardBorder"
              >
                <div class="text-sm opacity-70 mb-2">Kinder reframe</div>
                <div class="text-xl md:text-2xl font-semibold leading-relaxed">
                  “{{ current.positive_text }}”
                </div>
                <div class="mt-4 text-xs opacity-70">
                  Try reading it out loud.
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-center gap-3">
            <button
              @click="flip"
              :class="[
                'rounded-xl px-5 py-2.5 font-medium shadow',
                isDark
                  ? 'bg-white text-emerald-900 hover:bg-white/90'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
              ]"
            >
              {{ flipped ? "Back" : "Flip (Space)" }}
            </button>
            <button
              @click="nextCard"
              :class="[
                'rounded-xl px-5 py-2.5 font-medium shadow border',
                isDark
                  ? 'border-white/20 text-white hover:bg-white/10'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
              ]"
            >
              Next (N / →)
            </button>
          </div>
        </div>
      </div>

      <p class="mt-8 text-center text-xs" :class="subTextClass">
        No login. No personal data stored. Cards are fetched anonymously from
        the server.
      </p>
    </section>
  </div>
</template>

<style scoped>
.flip-scene {
  perspective: 1200px;
}
.flip-card {
  position: relative;
  height: 14rem;
  transform-style: preserve-3d;
  transition: transform 520ms ease;
}
@media (min-width: 768px) {
  .flip-card {
    height: 16rem;
  }
}
.flip-card.is-flipped {
  transform: rotateY(180deg);
}
.flip-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
}
.flip-back {
  transform: rotateY(180deg);
}
</style>
