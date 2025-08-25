<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import Header from "@/components/Header.vue";
import api from "@/api";

const props = defineProps({
  theme: { type: String, default: "dark" },
});

const PHASES = [
  { key: "inhale", label: "Inhale", secs: 4 },
  { key: "hold", label: "Hold", secs: 4 },
  { key: "exhale", label: "Exhale", secs: 6 },
];
const GENTLE_QUOTES = [
  "Nice job. You showed up for yourself. ",
  "A small pause can change the whole day.",
  "You are allowed to rest.",
  "Softly does it. One breath at a time.",
  "Peace begins with your next breath.",
];
const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
];

const lastPresetSec =
  Number(localStorage.getItem("breathing_preset")) || PRESETS[0].seconds;

const totalSeconds = ref(lastPresetSec);
const remainingTotal = ref(totalSeconds.value);
const phaseIndex = ref(0);
const phaseRemaining = ref(PHASES[0].secs);
const running = ref(false);
const finished = ref(false);
const quote = ref("");
let rafId = null;
let lastTick = 0;

const ringRadius = 120;
const CIRC = 2 * Math.PI * ringRadius;

const progress = computed(() => {
  const done = totalSeconds.value - remainingTotal.value;
  return Math.min(1, Math.max(0, done / totalSeconds.value));
});
const currentPhase = computed(() => PHASES[phaseIndex.value]?.label || "Done");
const dashoffset = computed(() => CIRC * (1 - progress.value));
const phaseRemainInt = computed(() => Math.ceil(phaseRemaining.value));
const scale = computed(() => {
  const key = PHASES[phaseIndex.value].key;
  if (key === "inhale") return 1.08;
  if (key === "exhale") return 0.92;
  return 1.0;
});

function setPreset(sec) {
  totalSeconds.value = sec;
  localStorage.setItem("breathing_preset", String(sec));
  reset(false);
}
function start() {
  if (finished.value) reset(false);
  if (running.value) return;
  running.value = true;
  lastTick = performance.now();
  loop();
}
function pause() {
  running.value = false;
  cancelAnimationFrame(rafId);
}
function reset(stopRunning = true) {
  if (stopRunning) pause();
  finished.value = false;
  quote.value = "";
  remainingTotal.value = totalSeconds.value;
  phaseIndex.value = 0;
  phaseRemaining.value = PHASES[0].secs;
}
function loop() {
  if (!running.value) return;
  rafId = requestAnimationFrame(loop);
  const now = performance.now();
  const delta = (now - lastTick) / 1000;
  if (delta < 0.016) return;
  lastTick = now;

  if (remainingTotal.value <= 0) {
    finish();
    return;
  }

  remainingTotal.value = Math.max(0, remainingTotal.value - delta);
  phaseRemaining.value = Math.max(0, phaseRemaining.value - delta);

  if (phaseRemaining.value <= 0) {
    phaseIndex.value = (phaseIndex.value + 1) % PHASES.length;
    phaseRemaining.value = PHASES[phaseIndex.value].secs;
  }
}

async function finish() {
  running.value = false;
  cancelAnimationFrame(rafId);
  finished.value = true;
  try {
    const tip = await api.randomTip();
    quote.value = tip.text;
  } catch (e) {
    quote.value =
      GENTLE_QUOTES[Math.floor(Math.random() * GENTLE_QUOTES.length)];
  }
}

function onKey(e) {
  if (e.code === "Space") {
    e.preventDefault();
    running.value ? pause() : start();
  } else if (e.key?.toLowerCase() === "r") {
    reset();
  }
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  cancelAnimationFrame(rafId);
});
watch(totalSeconds, () => {
  const wasRunning = running.value;
  reset(false);
  if (wasRunning) start();
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
const subtleTextClass = computed(() =>
  isDark.value ? "text-white/60" : "text-slate-500"
);
const cardWrapClass = computed(() =>
  isDark.value
    ? "bg-white/10 text-white border border-white/15"
    : "bg-emerald-50 text-emerald-900 border border-emerald-100"
);
const presetBtnClass = computed(() =>
  isDark.value
    ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
    : "border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
);
const presetActiveRing = computed(() =>
  isDark.value ? "ring-white/60" : "ring-emerald-400"
);
</script>

<template>
  <div :class="pageWrapClass">
    <Header />
    <section class="mx-auto max-w-3xl px-6 py-10 text-center select-none">
      <h1
        :class="[
          'text-3xl md:text-4xl font-bold',
          isDark ? 'text-white/95' : 'text-slate-900',
        ]"
      >
        Breathing Space
      </h1>
      <p class="mt-2" :class="subTextClass">
        Follow the rhythm: Inhale • Hold • Exhale
      </p>

      <div class="mt-6 flex justify-center gap-3">
        <button
          v-for="p in PRESETS"
          :key="p.seconds"
          @click="setPreset(p.seconds)"
          class="rounded-xl px-4 py-2 text-sm font-medium shadow transition border"
          :class="[
            presetBtnClass,
            { ['ring-2 ' + presetActiveRing]: totalSeconds === p.seconds },
          ]"
        >
          {{ p.label }}
        </button>
      </div>

      <div class="mt-10 flex items-center justify-center">
        <div
          class="relative"
          :style="{
            transform: `scale(${scale})`,
            transition: 'transform 600ms ease',
          }"
          aria-live="polite"
        >
          <svg
            :width="(ringRadius + 20) * 2"
            :height="(ringRadius + 20) * 2"
            class="block"
          >
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  :offset="'0%'"
                  :stop-color="isDark ? '#FFFFFF' : '#34d399'"
                  :stop-opacity="isDark ? 0.85 : 1"
                />
                <stop
                  :offset="'100%'"
                  :stop-color="isDark ? '#FFFFFF' : '#10b981'"
                  :stop-opacity="isDark ? 0.55 : 1"
                />
              </linearGradient>
            </defs>

            <circle
              :cx="ringRadius + 20"
              :cy="ringRadius + 20"
              :r="ringRadius"
              :class="isDark ? 'stroke-white/10' : 'stroke-emerald-100'"
              stroke-width="16"
              fill="none"
            />

            <circle
              :cx="ringRadius + 20"
              :cy="ringRadius + 20"
              :r="ringRadius"
              :stroke-dasharray="CIRC"
              :stroke-dashoffset="dashoffset"
              stroke="url(#grad)"
              stroke-linecap="round"
              stroke-width="16"
              fill="none"
              style="transition: stroke-dashoffset 120ms linear"
            />
          </svg>

          <div class="absolute inset-0 grid place-items-center">
            <div :class="isDark ? 'text-white' : 'text-slate-800'">
              <div class="text-2xl md:text-3xl font-semibold">
                {{ currentPhase }}
              </div>
              <div
                class="mt-1 text-lg tabular-nums"
                :class="isDark ? 'text-white/80' : 'text-slate-600'"
              >
                {{ phaseRemainInt }}s
              </div>
              <div
                class="mt-3 text-sm"
                :class="isDark ? 'text-white/60' : 'text-slate-500'"
              >
                Remaining: {{ Math.ceil(remainingTotal) }}s
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-center gap-3">
        <button
          @click="running ? pause() : start()"
          :class="[
            'rounded-xl px-5 py-2.5 font-medium shadow',
            isDark
              ? 'bg-white text-emerald-900 hover:bg-white/90'
              : 'bg-emerald-600 text-white hover:bg-emerald-700',
          ]"
        >
          {{ running ? "Pause (Space)" : "Start (Space)" }}
        </button>
        <button
          @click="reset()"
          :class="[
            'rounded-xl px-5 py-2.5 font-medium shadow border',
            isDark
              ? 'border-white/20 text-white hover:bg-white/10'
              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50',
          ]"
        >
          Reset (R)
        </button>
      </div>

      <div
        v-if="finished"
        class="mt-8 mx-auto max-w-xl rounded-2xl p-5"
        :class="cardWrapClass"
      >
        <div class="text-left">
          <div class="text-base opacity-80">Session complete</div>
          <div class="mt-1 text-lg font-medium">{{ quote }}</div>
        </div>
      </div>

      <p class="mt-6 text-xs" :class="subtleTextClass">
        Tip: Press Space to start/pause, R to reset.
      </p>
    </section>
  </div>
</template>

<style scoped>
section {
  user-select: none;
}
</style>
