<script setup>
import { ref, onMounted, computed } from "vue";

const text = ref("Loading…");
const loading = ref(true);

// data values
const pm25 = ref(null);
const uvIndex = ref(null);

const PM25 = { good: 12, moderate: 35 };
const UV = { low: 2, moderate: 5, high: 7, veryhigh: 10 };

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function pickAvgLast(series, n = 3) {
  if (!Array.isArray(series) || !series.length) return null;
  const arr = series.slice(-n).map(Number).filter(Number.isFinite);
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function daylightPhase(daily) {
  try {
    const sunrise = new Date(daily.sunrise?.[0]);
    const sunset = new Date(daily.sunset?.[0]);
    const now = new Date();
    if (sunrise && now < new Date(sunrise.getTime() + 2 * 60 * 60 * 1000))
      return "Morning";
    if (sunset && now < sunset) return "Afternoon";
    return "Evening";
  } catch {
    const h = new Date().getHours();
    return h < 11 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
  }
}

const pm25Level = computed(() => {
  const v = Number(pm25.value);
  if (!isFinite(v)) return "na";
  if (v < PM25.good) return "good";
  if (v < PM25.moderate) return "moderate";
  return "high";
});

const uvLevel = computed(() => {
  const v = Number(uvIndex.value);
  if (!isFinite(v)) return "na";
  if (v <= UV.low) return "low";
  if (v <= UV.moderate) return "moderate";
  if (v <= UV.high) return "high";
  if (v <= UV.veryhigh) return "veryhigh";
  return "extreme";
});

function buildMessage({ phase }) {
  if (["veryhigh", "extreme"].includes(uvLevel.value)) {
    return `${phase} — UV is very high; do your 1-minute reset indoors.`;
  }
  if (uvLevel.value === "high" || pm25Level.value === "high") {
    return `${phase} — conditions aren’t ideal (UV/air); take a 1-minute gentle breath inside.`;
  }

  if (uvLevel.value === "moderate" || pm25Level.value === "moderate") {
    const bits = [];
    if (uvLevel.value === "moderate") bits.push("UV is moderate");
    if (pm25Level.value === "moderate") bits.push("air is fair");
    const why = bits.join(" & ");
    return `${phase} — ${why}; try a slow 1-minute breathing reset.`;
  }

  if (uvLevel.value === "low" && pm25Level.value === "good") {
    return `${phase} — conditions are good; enjoy a calm 1-minute breathing reset.`;
  }

  return `${phase} — give yourself a 1-minute breathing reset.`;
}

async function loadTip() {
  loading.value = true;
  text.value = "Loading…";
  pm25.value = null;
  uvIndex.value = null;

  const coords = await new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: 8000 }
    );
  });

  try {
    const lat = coords?.latitude ?? -37.8136;
    const lon = coords?.longitude ?? 144.9631;

    const [aq, dl, wx] = await Promise.all([
      getJSON(`/api/air-quality?lat=${lat}&lon=${lon}`),
      getJSON(`/api/daylight?lat=${lat}&lon=${lon}`),
      getJSON(`/api/open-meteo?lat=${lat}&lon=${lon}`),
    ]);

    const aqHourly = aq?.data?.hourly ?? aq?.hourly ?? {};
    pm25.value = pickAvgLast(aqHourly.pm2_5, 3);

    const wxHourly = wx?.data?.hourly ?? wx?.hourly ?? {};
    uvIndex.value =
      pickAvgLast(wxHourly.uv_index, 3) ??
      pickAvgLast(wxHourly.uv_index_clear_sky, 3);

    const daily = dl?.data?.daily ?? dl?.daily ?? {};
    const phase = daylightPhase(daily);

    text.value = buildMessage({ phase });
  } catch (e) {
    console.warn("[TipBar] fallback:", e?.message || e);
    text.value = "Take a minute to breathe — a short reset helps focus.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadTip);
</script>

<template>
  <div class="tipbar-wrap">
    <div class="tipbar" :aria-busy="loading">
      <span v-if="loading">Loading…</span>
      <span v-else>{{ text }}</span>

      <div class="chips" v-if="!loading">
        <span class="chip" :class="`pm25-${pm25Level}`" v-if="pm25 !== null">
          PM2.5: {{ Number(pm25).toFixed(0) }} µg/m³
        </span>
        <span class="chip" :class="`uv-${uvLevel}`" v-if="uvIndex !== null">
          UV: {{ Number(uvIndex).toFixed(0) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tipbar-wrap {
  margin-top: 64px;
  display: flex;
  justify-content: center;
}
.tipbar {
  position: relative;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  line-height: 1.3;
  max-width: 980px;
  width: calc(100% - 32px);
  text-align: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.chips {
  display: inline-flex;
  gap: 8px;
  margin-left: 12px;
}
.chip {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.2;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.pm25-good {
  background: rgba(46, 204, 113, 0.25);
  border-color: rgba(46, 204, 113, 0.35);
}
.pm25-moderate {
  background: rgba(241, 196, 15, 0.25);
  border-color: rgba(241, 196, 15, 0.35);
}
.pm25-high {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.35);
}

.uv-low {
  background: rgba(46, 204, 113, 0.25);
  border-color: rgba(46, 204, 113, 0.35);
}
.uv-moderate {
  background: rgba(241, 196, 15, 0.25);
  border-color: rgba(241, 196, 15, 0.35);
}
.uv-high {
  background: rgba(230, 126, 34, 0.25);
  border-color: rgba(230, 126, 34, 0.35);
}
.uv-veryhigh {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.35);
}
.uv-extreme {
  background: rgba(155, 89, 182, 0.25);
  border-color: rgba(155, 89, 182, 0.35);
}
</style>
