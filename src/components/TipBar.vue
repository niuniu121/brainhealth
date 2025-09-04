<script setup>
import { ref, onMounted, computed } from "vue";
import { api } from "@/api";

const text = ref("Loading…");
const loading = ref(true);
const phase = ref("Morning");

const pm25 = ref(null);
const uvIndex = ref(null);

const PM25 = { good: 12, moderate: 35 };
const UV = { low: 2, moderate: 5, high: 7, veryhigh: 10 };

function pickAvgLast(series, n = 3) {
  if (!Array.isArray(series) || !series.length) return null;
  const arr = series.slice(-n).map(Number).filter(Number.isFinite);
  if (!arr.length) return null;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

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
      return { t: ts, uv: Number(uv?.[i]), clear: Number(clear?.[i]), isDay };
    });

    const windowRows = rows.filter((r) => r.t >= from && r.t <= now);
    const dayRows = windowRows.filter((r) => r.isDay);
    if (!dayRows.length) return 0;

    let vals = dayRows
      .map((r) => r.uv)
      .filter((v) => Number.isFinite(v) && v > 0);
    if (!vals.length)
      vals = dayRows
        .map((r) => r.clear)
        .filter((v) => Number.isFinite(v) && v > 0);
    if (!vals.length) return 0;

    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    return Math.max(0, Number(avg.toFixed(1)));
  } catch {
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

function getBreathingMinutes(pm25Value, uvValue) {
  const p = Number(pm25Value);
  const u = Number(uvValue);
  if ((isFinite(p) && p > 15) || (isFinite(u) && u >= 7)) return 3;
  if ((isFinite(p) && p > 7) || (isFinite(u) && u > 2 && u < 7)) return 2;
  return 1;
}

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

const phaseType = computed(() => {
  if (/morning/i.test(phase.value)) return "morning";
  if (/afternoon/i.test(phase.value)) return "day";
  return "night";
});

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
      api.daylight(lat, lon),
      api.openMeteo(lat, lon),
    ]);

    const aqHourly = aq?.data?.hourly ?? aq?.hourly ?? {};
    pm25.value = pickAvgLast(aqHourly.pm2_5, 3);

    const daily = dl?.data?.daily ?? dl?.daily ?? {};
    const hourly = wx?.hourly ?? {};
    uvIndex.value = computeUVFromWx(hourly, daily);

    phase.value = daylightPhase(daily);
    const minutes = getBreathingMinutes(pm25.value, uvIndex.value);
    text.value = buildMessage({ phase: phase.value, minutes });
  } catch {
    text.value = "Take a minute to breathe — a short reset helps focus.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadTip);
</script>

<template>
  <div class="tipbar-wrap">
    <div class="tipbar" :data-phase="phaseType" :aria-busy="loading">
      <div class="icon">
        <svg v-if="phaseType === 'morning'" viewBox="0 0 48 48" class="sun">
          <circle cx="24" cy="24" r="8" fill="#FFD782" />
          <g
            class="rays"
            stroke="#FFD782"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line x1="24" y1="4" x2="24" y2="10" />
            <line x1="24" y1="44" x2="24" y2="38" />
            <line x1="4" y1="24" x2="10" y2="24" />
            <line x1="44" y1="24" x2="38" y2="24" />
            <line x1="9" y1="9" x2="13" y2="13" />
            <line x1="39" y1="39" x2="35" y2="35" />
            <line x1="9" y1="39" x2="13" y2="35" />
            <line x1="39" y1="9" x2="35" y2="13" />
          </g>
        </svg>

        <svg v-else-if="phaseType === 'day'" viewBox="0 0 64 48" class="day">
          <g class="sun-small">
            <circle cx="18" cy="16" r="6" fill="#FFD782" />
            <g
              class="rays"
              stroke="#FFD782"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="18" y1="3" x2="18" y2="8" />
              <line x1="18" y1="29" x2="18" y2="24" />
              <line x1="5" y1="16" x2="10" y2="16" />
              <line x1="31" y1="16" x2="26" y2="16" />
            </g>
          </g>
          <g class="cloud">
            <ellipse
              cx="40"
              cy="26"
              rx="12"
              ry="7"
              fill="rgba(255,255,255,0.9)"
            />
            <circle cx="30" cy="27" r="6" fill="rgba(255,255,255,0.9)" />
          </g>
        </svg>

        <svg v-else viewBox="0 0 48 48" class="moon">
          <path
            d="M30 6c-8 0-14 6-14 14 0 8 6 14 14 14 4.2 0 8-1.9 10.6-4.9C37.3 29.8 32 24.9 32 19 32 13.1 37.3 8.2 40.6 6.9 38 3.9 34.2 6 30 6Z"
            fill="#E7F6FF"
          />
          <circle class="star s1" cx="12" cy="14" r="1.2" fill="#E7F6FF" />
          <circle class="star s2" cx="16" cy="22" r="1" fill="#E7F6FF" />
          <circle class="star s3" cx="22" cy="10" r="1.4" fill="#E7F6FF" />
        </svg>
      </div>

      <div class="content">
        <span v-if="loading">Loading…</span>
        <span v-else>{{ text }}</span>
      </div>

      <div class="chips" v-if="!loading">
        <span class="chip" :class="`pm25-${pm25Level}`" v-if="pm25 !== null"
          >PM2.5: {{ Number(pm25).toFixed(0) }} µg/m³</span
        >
        <span class="chip" :class="`uv-${uvLevel}`" v-if="uvIndex !== null"
          >UV: {{ Number(uvIndex).toFixed(1) }}</span
        >
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
  color: #fff;
  border-radius: 999px;
  padding: 12px 18px;
  max-width: 980px;
  width: calc(100% - 32px);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  text-align: left;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: radial-gradient(
      120% 120% at 10% 0%,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.06) 40%,
      rgba(255, 255, 255, 0.04) 60%,
      transparent 70%
    ),
    rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  overflow: hidden;
}
.tipbar::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: conic-gradient(
    from 0deg,
    rgba(167, 225, 192, 0.5),
    rgba(255, 127, 154, 0.5),
    rgba(167, 225, 192, 0.5)
  );
  filter: blur(24px);
  opacity: 0.18;
  animation: aurora 14s linear infinite;
  pointer-events: none;
}
.tipbar[data-phase="night"]::before {
  opacity: 0.24;
}
@keyframes aurora {
  to {
    transform: rotate(1turn);
  }
}

.icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
}
.icon .sun .rays {
  transform-origin: 24px 24px;
  animation: spin 18s linear infinite;
}
.icon .day .rays {
  transform-origin: 18px 16px;
  animation: spin 18s linear infinite;
}
.icon .cloud {
  animation: drift 6s ease-in-out infinite alternate;
  transform-origin: 40px 26px;
}
.icon .moon .star {
  animation: twinkle 2.8s ease-in-out infinite;
}
.icon .moon .s2 {
  animation-delay: 0.6s;
}
.icon .moon .s3 {
  animation-delay: 1.2s;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes drift {
  from {
    transform: translateX(0px);
  }
  to {
    transform: translateX(4px);
  }
}
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

.content {
  text-align: center;
  line-height: 1.35;
}
.chips {
  display: inline-flex;
  gap: 8px;
}
.chip {
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
  line-height: 1.2;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.pm25-good {
  background: rgba(46, 204, 113, 0.22);
  border-color: rgba(46, 204, 113, 0.35);
}
.pm25-moderate {
  background: rgba(241, 196, 15, 0.22);
  border-color: rgba(241, 196, 15, 0.35);
}
.pm25-high {
  background: rgba(231, 76, 60, 0.22);
  border-color: rgba(231, 76, 60, 0.35);
}
.uv-low {
  background: rgba(46, 204, 113, 0.22);
  border-color: rgba(46, 204, 113, 0.35);
}
.uv-moderate {
  background: rgba(241, 196, 15, 0.22);
  border-color: rgba(241, 196, 15, 0.35);
}
.uv-high {
  background: rgba(230, 126, 34, 0.22);
  border-color: rgba(230, 126, 34, 0.35);
}
.uv-veryhigh {
  background: rgba(231, 76, 60, 0.22);
  border-color: rgba(231, 76, 60, 0.35);
}
.uv-extreme {
  background: rgba(155, 89, 182, 0.22);
  border-color: rgba(155, 89, 182, 0.35);
}

@media (max-width: 640px) {
  .tipbar {
    grid-template-columns: auto 1fr;
    row-gap: 8px;
    text-align: left;
  }
  .chips {
    grid-column: 1 / -1;
    justify-content: center;
  }
}
</style>
