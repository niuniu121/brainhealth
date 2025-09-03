<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "@/api";

const text = ref("Loading…");
const loading = ref(true);

// data values
const pm25 = ref(null);
const uvIndex = ref(null);

// thresholds
const PM25 = { good: 12, moderate: 35 };
const UV = { low: 2, moderate: 5, high: 7, veryhigh: 10 };

function pickAvgLast(series, n = 3) {
  if (!Array.isArray(series) || !series.length) return null;
  const arr = series.slice(-n).map(Number).filter(Number.isFinite);
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// sunset/rise Morning / Afternoon / Evening
function daylightPhase(daily) {
  try {
    const sunrise = new Date(daily?.sunrise?.[0]);
    const sunset = new Date(daily?.sunset?.[0]);
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

// average 3
function computeUVFromWx(hourly, daily) {
  try {
    const time = hourly?.time ?? [];
    const uv = hourly?.uv_index ?? [];
    const clear = hourly?.uv_index_clear_sky ?? [];
    const isDayArr = hourly?.is_day ?? [];

    if (!time.length) return 0;

    const now = new Date();
    const from = new Date(now.getTime() - 2 * 3600_000);

    let sunrise = null,
      sunset = null;
    try {
      sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
      sunset = daily?.sunset?.[0] ? new Date(daily.sunset[0]) : null;
    } catch {}

    const rows = time.map((t, i) => {
      const ts = new Date(t);
      let isDay = Number(isDayArr?.[i]) === 1;
      if (!isDayArr?.length && sunrise && sunset) {
        isDay = ts >= sunrise && ts <= sunset;
      }
      return {
        t: ts,
        uv: Number(uv?.[i]),
        clear: Number(clear?.[i]),
        isDay,
      };
    });

    const window = rows.filter((r) => r.t >= from && r.t <= now);
    const dayRows = window.filter((r) => r.isDay);

    console.debug(
      "[UV] window:",
      window.length,
      "day:",
      dayRows.length,
      "sample:",
      dayRows.slice(-3)
    );

    if (!dayRows.length) return 0;

    let vals = dayRows
      .map((r) => r.uv)
      .filter((v) => Number.isFinite(v) && v > 0);
    if (!vals.length) {
      vals = dayRows
        .map((r) => r.clear)
        .filter((v) => Number.isFinite(v) && v > 0);
    }
    if (!vals.length) return 0;

    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.max(0, Number(avg.toFixed(1)));
  } catch (e) {
    console.warn("[UV] compute error:", e);
    return 0;
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

// rule:3 / 2 / 1  PM2.5 > 15 || UV ≥ 7 3min  // PM2.5 > 7 2 < UV < 7 2min //other 1min
function getBreathingMinutes(pm25Value, uvValue) {
  const p = Number(pm25Value);
  const u = Number(uvValue);
  if ((isFinite(p) && p > 15) || (isFinite(u) && u >= 7)) return 3;
  if ((isFinite(p) && p > 7) || (isFinite(u) && u > 2 && u < 7)) return 2;
  return 1;
}

//UV is very high; do it indoors || uvLevel === high , pm25Level === high ->conditions aren’t ideal (UV/air); gentle breath inside. ||moderate|| Low
function buildMessage({ phase, minutes }) {
  if (["veryhigh", "extreme"].includes(uvLevel.value)) {
    return `${phase} — UV is very high; do your ${minutes}-minute reset indoors.`;
  }
  if (uvLevel.value === "high" || pm25Level.value === "high") {
    return `${phase} — conditions aren’t ideal (UV/air); take a ${minutes}-minute gentle breath inside.`;
  }
  if (uvLevel.value === "moderate" || pm25Level.value === "moderate") {
    const bits = [];
    if (uvLevel.value === "moderate") bits.push("UV is moderate");
    if (pm25Level.value === "moderate") bits.push("air is fair");
    const why = bits.join(" & ");
    return `${phase} — ${why}; try a slow ${minutes}-minute breathing reset.`;
  }
  if (uvLevel.value === "low" && pm25Level.value === "good") {
    return `${phase} — conditions are good; enjoy a calm ${minutes}-minute breathing reset.`;
  }
  return `${phase} — give yourself a ${minutes}-minute breathing reset.`;
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
      api.airQuality(lat, lon),
      api.daylight(lat, lon), // rise/set
      api.openMeteo(lat, lon), // UV（ uv_index, uv_index_clear_sky, is_day, time）
    ]);

    // PM2.5/average 3 hours
    const aqHourly = aq?.data?.hourly ?? aq?.hourly ?? {};
    pm25.value = pickAvgLast(aqHourly.pm2_5, 3);

    const daily = dl?.data?.daily ?? dl?.daily ?? {};

    // caculate UV
    const hourly = wx?.hourly ?? {};
    uvIndex.value = computeUVFromWx(hourly, daily);

    // documents
    const phase = daylightPhase(daily);
    const minutes = getBreathingMinutes(pm25.value, uvIndex.value);
    text.value = buildMessage({ phase, minutes });
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
          UV: {{ Number(uvIndex).toFixed(1) }}
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
