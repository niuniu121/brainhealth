<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/api";
import ApexChart from "vue3-apexcharts";
import Header from "@/components/Header.vue";

const loading = ref(true);
const error = ref("");
const refreshing = ref(false);

const sleepRows = ref([]); // [{sleep_bucket, count}]
const stressRows = ref([]); // [{stress_level, count}]
const dietRows = ref([]); // [{diet_type, avg_happiness, n}]
const screenRows = ref([]); // [{screen_bucket, avg_stress, n}]

const ACCENT = "#2fb083";
const FORE = "#1b332b";

async function loadAll() {
  loading.value = true;
  error.value = "";
  try {
    const [a, b, c, d] = await Promise.all([
      api.sleepDistribution(),
      api.stressDistribution(),
      api.dietVsHappiness(),
      api.screenVsStress(),
    ]);
    sleepRows.value = Array.isArray(a) ? a : [];
    stressRows.value = Array.isArray(b) ? b : [];
    dietRows.value = Array.isArray(c) ? c : [];
    screenRows.value = Array.isArray(d) ? d : [];
  } catch (e) {
    error.value = e?.message || "Load failed";
  } finally {
    loading.value = false;
  }
}

async function reload() {
  if (refreshing.value) return;
  refreshing.value = true;
  await loadAll();
  refreshing.value = false;
}

onMounted(loadAll);

const baseChart = {
  chart: { background: "transparent", toolbar: { show: false } },
  colors: [ACCENT],
  theme: { mode: "light" },
  grid: { borderColor: "rgba(27,51,43,0.12)" },
  foreColor: FORE,
};

const sleepChart = computed(() => {
  const cats = sleepRows.value.map((r) => String(r.sleep_bucket ?? "NA"));
  const data = sleepRows.value.map((r) => Number(r.count ?? 0));
  return {
    options: {
      ...baseChart,
      xaxis: {
        categories: cats,
        title: { text: "Sleep Duration (rounded hours)" },
      },
      yaxis: {
        title: { text: "People" },
        labels: { formatter: (val) => String(Math.round(Number(val))) },
      },
      tooltip: { y: { formatter: (v) => `${Math.round(Number(v))} people` } },
      dataLabels: { enabled: false },
    },
    series: [{ name: "People", data }],
  };
});

const stressChart = computed(() => {
  const cats = stressRows.value.map((r) => String(r.stress_level ?? "NA"));
  const data = stressRows.value.map((r) => Number(r.count ?? 0));
  return {
    options: {
      ...baseChart,
      xaxis: { categories: cats, title: { text: "Stress Level" } },
      yaxis: {
        title: { text: "People" },
        labels: { formatter: (val) => String(Math.round(Number(val))) },
      },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v) => `${Math.round(Number(v))} people` } },
    },
    series: [{ name: "People", data }],
  };
});

const dietChart = computed(() => {
  const cats = dietRows.value.map((r) => r.diet_type ?? "NA");
  const data = dietRows.value.map((r) => Number(r.avg_happiness ?? 0));
  return {
    options: {
      ...baseChart,
      xaxis: { categories: cats, title: { text: "Diet Type" } },
      yaxis: {
        title: { text: "Avg. Happiness" },
        min: 0,
        labels: { formatter: (val) => Number(val).toFixed(2) },
      },
      tooltip: {
        y: {
          formatter: (v, { dataPointIndex }) => {
            const n = dietRows.value[dataPointIndex]?.n ?? 0;
            return `Avg. happiness: ${Number(v).toFixed(2)} (n=${n})`;
          },
        },
      },
      dataLabels: { enabled: false },
    },
    series: [{ name: "Avg. Happiness", data }],
  };
});

const screenChart = computed(() => {
  const cats = screenRows.value.map((r) => String(r.screen_bucket ?? "NA"));
  const data = screenRows.value.map((r) => Number(r.avg_stress ?? 0));
  return {
    options: {
      ...baseChart,
      chart: { ...baseChart.chart, type: "line" },
      xaxis: {
        categories: cats,
        title: { text: "Screen Time (rounded hours)" },
      },
      yaxis: {
        title: { text: "Avg. Stress" },
        min: 0,
        labels: { formatter: (val) => Number(val).toFixed(2) },
      },
      stroke: { width: 3, curve: "smooth" },
      markers: { size: 3 },
      tooltip: {
        y: {
          formatter: (v, { dataPointIndex }) => {
            const n = screenRows.value[dataPointIndex]?.n ?? 0;
            return `Avg. stress: ${Number(v).toFixed(2)} (n=${n})`;
          },
        },
      },
      dataLabels: { enabled: false },
    },
    series: [{ name: "Avg. Stress", data }],
  };
});
</script>

<template>
  <Header />
  <div class="metrics-page">
    <div class="bg-particles" aria-hidden="true"></div>

    <div class="container">
      <header class="page-title appear">
        <div class="title-left">
          <h1>Wellbeing Metrics</h1>
          <small class="subtitle">Explore key indicators at a glance</small>
        </div>
        <button
          class="btn"
          :class="{ spinning: refreshing }"
          :disabled="refreshing"
          @click="reload"
        >
          <span class="btn-icon" aria-hidden="true">⟳</span>
          <span>{{ refreshing ? "Refreshing…" : "Refresh" }}</span>
        </button>
      </header>

      <div v-if="loading" class="state">Loading…</div>
      <div v-else-if="error" class="state error">Load failed: {{ error }}</div>

      <div v-else class="grid">
        <section class="card appear d1">
          <h2>Sleep Duration Distribution</h2>
          <ApexChart
            height="320"
            type="bar"
            :options="sleepChart.options"
            :series="sleepChart.series"
          />
        </section>

        <section class="card appear d2">
          <h2>Stress Level Distribution</h2>
          <ApexChart
            height="320"
            type="bar"
            :options="stressChart.options"
            :series="stressChart.series"
          />
        </section>

        <section class="card appear d3">
          <h2>Average Happiness by Diet</h2>
          <ApexChart
            height="320"
            type="bar"
            :options="dietChart.options"
            :series="dietChart.series"
          />
        </section>

        <section class="card appear d4">
          <h2>Screen Time vs Average Stress</h2>
          <ApexChart
            height="320"
            type="line"
            :options="screenChart.options"
            :series="screenChart.series"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========== Theme tokens ========== */
:root {
  --bg-1: #0f2f27; /* 深绿顶部 */
  --bg-2: #1c4639; /* 深绿中段 */
  --bg-3: #2a5b49; /* 深绿底部 */
  --surface: #ffffff; /* 白卡片 */
  --border: rgba(17, 37, 31, 0.1);
  --shadow: rgba(12, 24, 20, 0.22);
  --text: #1b332b; /* 深绿文字 */
  --muted: #5a746b; /* 次要文字 */
  --accent: #2fb083; /* 祖母绿主色 */
  --accent-2: #1aa27c; /* 渐变尾色 */
}

.metrics-page {
  min-height: 100vh;
  position: relative;
  background: radial-gradient(
      1100px 520px at 82% -10%,
      rgba(255, 255, 255, 0.1),
      transparent
    ),
    linear-gradient(180deg, var(--bg-1), var(--bg-2) 42%, var(--bg-3));
  color: var(--text);
  overflow-x: hidden;
  background: #325343;
}

.bg-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.35;
  background: radial-gradient(
      3px 3px at 10% 20%,
      rgba(255, 255, 255, 0.22),
      transparent 60%
    ),
    radial-gradient(
      2px 2px at 70% 15%,
      rgba(255, 255, 255, 0.18),
      transparent 60%
    ),
    radial-gradient(
      2px 2px at 30% 75%,
      rgba(255, 255, 255, 0.16),
      transparent 60%
    ),
    radial-gradient(
      3px 3px at 85% 65%,
      rgba(255, 255, 255, 0.2),
      transparent 60%
    );
  animation: drift 26s linear infinite;
}
@keyframes drift {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-40px);
  }
}

.container {
  max-width: 1260px;
  margin: 0 auto;
  padding: 32px 28px 68px;
  box-sizing: border-box;
}

/* 顶部标题条：玻璃白条 */
.page-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 8px 0 26px;
  padding: 18px 20px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  box-shadow: 0 14px 30px var(--shadow);
}
.title-left h1 {
  margin: 0 0 2px;
  font-size: 28px;
  letter-spacing: 0.2px;
}
.subtitle {
  color: var(--muted);
}

/* 按钮：祖母绿渐变 + 刷新旋转 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  border: none;
  border-radius: 14px;
  cursor: pointer;
  box-shadow: 0 12px 26px rgba(43, 176, 130, 0.34);
  transition: transform 0.08s ease, box-shadow 0.12s ease, filter 0.2s ease;
}
.btn:disabled {
  opacity: 0.7;
  cursor: default;
}
.btn:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 16px 30px rgba(43, 176, 130, 0.42);
}
.btn-icon {
  display: inline-block;
  transform-origin: center;
}
.btn.spinning .btn-icon {
  animation: spin 0.9s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 状态条 */
.state {
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid var(--border);
  margin-bottom: 18px;
  box-shadow: 0 8px 20px var(--shadow);
}
.state.error {
  background: rgba(255, 0, 0, 0.12);
}

/* 内容网格：两列布局，留白更舒展 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(520px, 1fr));
  gap: 26px;
  align-items: stretch;
}

/* 卡片：白底、圆角、阴影、悬浮抬升 */
.card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 18px 14px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: var(--surface);
  box-shadow: 0 16px 34px var(--shadow);
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  background: #fff;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 22px 40px var(--shadow);
}
.card h2 {
  margin: 2px 6px 10px;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

/* 入场动效（轻微上移 + 淡入），并做阶梯延迟 */
.appear {
  animation: fadeUp 0.5s ease both;
}
.appear.d1 {
  animation-delay: 0.05s;
}
.appear.d2 {
  animation-delay: 0.12s;
}
.appear.d3 {
  animation-delay: 0.18s;
}
.appear.d4 {
  animation-delay: 0.24s;
}
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card :deep(.apexcharts-canvas) {
  width: 100% !important;
}
.card :deep(.apexcharts-tooltip) {
  border-radius: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .appear,
  .btn.spinning .btn-icon,
  .bg-particles {
    animation: none !important;
  }
  .btn,
  .card {
    transition: none !important;
  }
}

/* 小屏单列 */
@media (max-width: 560px) {
  .container {
    padding: 22px 16px 44px;
  }
  .title-left h1 {
    font-size: 24px;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .card {
    border-radius: 18px;
  }
}
</style>
