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
const CENTER = ringRadius + 20;
const CIRC = 2 * Math.PI * ringRadius;

const progress = computed(() => {
  const done = totalSeconds.value - remainingTotal.value;
  return Math.min(1, Math.max(0, done / totalSeconds.value));
});
const currentPhase = computed(() => PHASES[phaseIndex.value]?.label || "Done");
const currentKey = computed(() => PHASES[phaseIndex.value]?.key || "done");
const phaseSecs = computed(() => PHASES[phaseIndex.value]?.secs || 0);
const phaseRemainInt = computed(() => Math.ceil(phaseRemaining.value));
const dashoffset = computed(() => CIRC * (1 - progress.value));

const targetScale = computed(() => {
  if (currentKey.value === "inhale") return 1.18;
  if (currentKey.value === "exhale") return 0.88;
  return 1.0;
});
const ringStroke = computed(() => {
  if (currentKey.value === "inhale") return 20;
  if (currentKey.value === "exhale") return 12;
  return 16;
});
const auraOpacity = computed(() => {
  if (currentKey.value === "inhale") return 0.38;
  if (currentKey.value === "exhale") return 0.18;
  return 0.26;
});
const labelScale = computed(() => {
  if (currentKey.value === "inhale") return 1.08;
  if (currentKey.value === "exhale") return 0.96;
  return 1.0;
});

const phaseProgress = computed(() => {
  const secs = PHASES[phaseIndex.value]?.secs || 1;
  return Math.min(1, Math.max(0, 1 - phaseRemaining.value / secs));
});
const theta = computed(() => -Math.PI / 2 + phaseProgress.value * Math.PI * 2);
const dotX = computed(() => CENTER + ringRadius * Math.cos(theta.value));
const dotY = computed(() => CENTER + ringRadius * Math.sin(theta.value));

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
  } catch {
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
  <div :class="pageWrapClass" class="breath-page premium-bg premium-emerald">
    <Header />
    <section class="mx-auto max-w-3xl px-6 py-10 text-center select-none">
      <h1
        class="breath-title"
        :class="[
          'text-3xl md:text-4xl font-bold',
          isDark ? 'text-white/95' : 'text-slate-900',
        ]"
      >
        Breathing Space
      </h1>
      <p class="breath-sub mt-2" :class="subTextClass">
        Follow the rhythm: Inhale • Hold • Exhale
      </p>

      <div class="preset-row mt-6 flex justify-center gap-3">
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
          class="ring-wrap relative"
          :style="{
            transform: `scale(${targetScale})`,
            transition: `transform ${
              phaseSecs * 1000
            }ms cubic-bezier(.4,0,.2,1)`,
          }"
          aria-live="polite"
        >
          <div
            class="ring-aura"
            :style="{
              opacity: auraOpacity,
              transform: `scale(${targetScale})`,
              transition: `transform ${
                phaseSecs * 1000
              }ms cubic-bezier(.4,0,.2,1), opacity 320ms ease`,
            }"
            aria-hidden="true"
          ></div>

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
                  :stop-opacity="isDark ? 0.9 : 1"
                />
                <stop
                  :offset="'100%'"
                  :stop-color="isDark ? '#FFFFFF' : '#10b981'"
                  :stop-opacity="isDark ? 0.6 : 1"
                />
              </linearGradient>
            </defs>

            <circle
              :cx="CENTER"
              :cy="CENTER"
              :r="ringRadius"
              :class="isDark ? 'stroke-white/10' : 'stroke-emerald-100'"
              :stroke-width="ringStroke"
              fill="none"
              :style="{
                transition: `stroke-width ${
                  phaseSecs * 1000
                }ms cubic-bezier(.4,0,.2,1)`,
              }"
            />

            <circle
              :cx="CENTER"
              :cy="CENTER"
              :r="ringRadius"
              :stroke-dasharray="CIRC"
              :stroke-dashoffset="dashoffset"
              stroke="url(#grad)"
              stroke-linecap="round"
              :stroke-width="ringStroke"
              fill="none"
              :style="{
                transition: `stroke-dashoffset 120ms linear, stroke-width ${
                  phaseSecs * 1000
                }ms cubic-bezier(.4,0,.2,1)`,
              }"
            />

            <circle
              :cx="dotX"
              :cy="dotY"
              r="5"
              :fill="isDark ? 'rgba(255,255,255,0.9)' : '#059669'"
              :style="{
                filter: isDark
                  ? 'drop-shadow(0 0 8px rgba(255,255,255,.6))'
                  : 'drop-shadow(0 0 8px rgba(16,185,129,.6))',
              }"
            />
          </svg>

          <div class="absolute inset-0 grid place-items-center">
            <div
              class="phase-box"
              :class="isDark ? 'text-white' : 'text-slate-800'"
              :style="{
                transform: `scale(${labelScale})`,
                transition: `transform ${
                  phaseSecs * 1000
                }ms cubic-bezier(.4,0,.2,1)`,
              }"
            >
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

      <div class="action-row mt-8 flex justify-center gap-3">
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
        class="finish-card mt-8 mx-auto max-w-xl rounded-2xl p-5"
        :class="cardWrapClass"
      >
        <div class="text-left">
          <div class="text-base opacity-80">Session complete</div>
          <div class="mt-1 text-lg font-medium">{{ quote }}</div>
        </div>
      </div>

      <p class="page-tip mt-6 text-xs" :class="subtleTextClass">
        Tip: Press Space to start/pause, R to reset.
      </p>
    </section>
  </div>
</template>

<style scoped>
section {
  user-select: none;
}

.breath-page {
  position: relative;
  isolation: isolate;
  overflow-x: hidden;
  opacity: 0;
  animation: pageIn 500ms ease-out forwards;
}
@keyframes pageIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.breath-title,
.breath-sub,
.preset-row,
.ring-wrap,
.action-row,
.finish-card,
.page-tip {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
  filter: blur(2px);
  will-change: transform, opacity, filter;
  animation: riseIn 720ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
.breath-title {
  animation-delay: 0.1s;
}
.breath-sub {
  animation-delay: 0.2s;
}
.preset-row {
  animation-delay: 0.3s;
}
.ring-wrap {
  animation-delay: 0.4s;
}
.action-row {
  animation-delay: 0.52s;
}
.finish-card {
  animation-delay: 0.64s;
}
.page-tip {
  animation-delay: 0.74s;
}
@keyframes riseIn {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.98);
    filter: blur(2px);
  }
  60% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: none;
    filter: none;
  }
}

.ring-wrap {
  filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.25));
}
.ring-aura {
  position: absolute;
  inset: -18px;
  border-radius: 999px;
  background: radial-gradient(
    closest-side,
    rgba(255, 255, 255, 0.14),
    rgba(255, 255, 255, 0)
  );
  filter: blur(10px);
  pointer-events: none;
}

.preset-row button,
.action-row button {
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08), 0 8px 18px rgba(0, 0, 0, 0.16);
}
.preset-row button:hover,
.action-row button:hover {
  transform: translateY(-2px);
}
.preset-row button:active,
.action-row button:active {
  transform: translateY(0) scale(0.98);
}

.finish-card {
  backdrop-filter: blur(6px);
}

@media (prefers-reduced-motion: reduce) {
  .breath-page,
  .breath-title,
  .breath-sub,
  .preset-row,
  .ring-wrap,
  .action-row,
  .finish-card,
  .page-tip {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}

.premium-bg {
  background: radial-gradient(
      1200px 800px at 50% -10%,
      rgba(180, 255, 220, 0.06),
      transparent 60%
    ),
    linear-gradient(180deg, var(--bg1) 0%, var(--bg2) 48%, var(--bg3) 100%);
  position: relative;
  box-shadow: inset 0 -60px 120px rgba(0, 0, 0, 0.25);
}
.premium-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.06;
  background-image: url("data:image/svg+xml;utf8,\
<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'>\
<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='table' tableValues='0 0.8 0'/></feComponentTransfer></filter>\
<rect width='100%' height='100%' filter='url(#n)'/>\
</svg>");
  background-size: 300px 300px;
  mix-blend-mode: soft-light;
}

.premium-emerald {
  --bg1: #0b2f2b;
  --bg2: #0a3a33;
  --bg3: #0a4639;
}
.premium-teal {
  --bg1: #0a1f29;
  --bg2: #0a2f33;
  --bg3: #0a3b36;
}
.premium-spruce {
  --bg1: #091e1b;
  --bg2: #0a2a23;
  --bg3: #0b352c;
}
:root:has(body.light) .premium-bg::after {
  opacity: 0.04;
}
</style>
