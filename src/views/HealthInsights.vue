<script setup>
import { ref, watch } from "vue";
import Header from "../components/Header.vue";
import api from "@/api";

const q = ref("");
const limit = ref(12);
const offset = ref(0);

const loading = ref(false);
const error = ref("");
const total = ref(0);
const items = ref([]);

async function runSearch() {
  const keyword = q.value.trim();
  if (!keyword) {
    items.value = [];
    total.value = 0;
    error.value = "";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    const res = await api.searchHealthImpact(keyword, {
      limit: limit.value,
      offset: offset.value,
    });
    total.value = res?.total ?? res?.count ?? 0;
    items.value = Array.isArray(res?.items) ? res.items : res?.rows ?? [];
  } catch (e) {
    error.value = (e && e.message) || "Search failed";
    items.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

let timer;
watch(q, () => {
  offset.value = 0;
  clearTimeout(timer);
  timer = setTimeout(runSearch, 300);
});

function nextPage() {
  if (offset.value + limit.value < total.value) {
    offset.value += limit.value;
    runSearch();
  }
}
function prevPage() {
  if (offset.value > 0) {
    offset.value = Math.max(0, offset.value - limit.value);
    runSearch();
  }
}

function applyLimit() {
  let n = parseInt(limit.value, 10);
  if (!Number.isFinite(n)) n = 12;
  n = Math.min(60, Math.max(1, n));
  limit.value = n;
  offset.value = 0;
  runSearch();
}
</script>

<template>
  <Header />

  <div class="bg">
    <div class="blob blob1"></div>
    <div class="blob blob2"></div>
    <div class="blob blob3"></div>
    <div class="grid"></div>
    <div class="grain"></div>
  </div>

  <section class="wrap">
    <header class="page-head">
      <div class="badge">
        <span class="dot"></span>
        Health Insights
      </div>
      <h1 class="title">Evidence-style notes on health & wellbeing</h1>
      <p class="sub">
        Search structured notes about health — features, risks, symptoms and
        practical precautions.
      </p>
    </header>

    <div class="search-row">
      <div class="search-card">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true">
          <path
            d="M10 2a8 8 0 105.293 14.293l4.707 4.707-1.414 1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z"
            fill="currentColor"
          />
        </svg>
        <input
          v-model="q"
          @keydown.enter="runSearch"
          type="text"
          placeholder="Type keywords (e.g., sleep, anxiety)…"
          class="input"
          aria-label="Search keywords"
        />
        <button class="btn primary" @click="runSearch">Search</button>
      </div>

      <div class="limit-input" title="Results per page">
        <input
          class="num"
          type="number"
          min="1"
          max="60"
          step="1"
          v-model.number="limit"
          @keydown.enter="applyLimit"
          @blur="applyLimit"
          aria-label="Results per page"
          placeholder="12"
        />
        <span class="hint">per page</span>
      </div>
    </div>

    <div class="meta">
      <span v-if="loading">Searching…</span>
      <span v-else-if="error" class="error">{{ error }}</span>
      <span v-else-if="q && !items.length" class="muted">No results.</span>
      <span v-else-if="items.length" class="muted">
        Total: <b>{{ total }}</b>
        <span class="sep">•</span>
        Offset: <b>{{ offset }}</b>
      </span>
    </div>

    <div class="cards">
      <template v-if="loading">
        <div v-for="i in 6" :key="i" class="card skeleton"></div>
      </template>

      <article v-for="it in items" :key="it.id" class="card insight-card">
        <div class="card-head-row">
          <h3 class="card-title">Useful Features</h3>
          <span class="tag">#{{ it.id ?? "item" }}</span>
        </div>

        <p class="lead">{{ it.useful_features || "—" }}</p>

        <div class="split">
          <div>
            <div class="label">Health Risks</div>
            <div class="body">{{ it.health_risks || "—" }}</div>
          </div>
          <div>
            <div class="label">Beneficial For</div>
            <div class="body">{{ it.beneficial_subject || "—" }}</div>
          </div>
        </div>

        <div class="split">
          <div>
            <div class="label">Usage Symptoms</div>
            <div class="body">{{ it.usage_symptoms || "—" }}</div>
          </div>
          <div>
            <div class="label">Symptom Frequency</div>
            <div class="body">{{ it.symptom_frequency || "—" }}</div>
          </div>
        </div>

        <div class="mt">
          <div class="label">Precautions</div>
          <div class="body">{{ it.health_precaution || "—" }}</div>
        </div>
      </article>
    </div>

    <div class="pager">
      <button class="btn" @click="prevPage" :disabled="offset === 0 || loading">
        Prev
      </button>
      <button
        class="btn"
        @click="nextPage"
        :disabled="offset + limit >= total || loading"
      >
        Next
      </button>
    </div>

    <div v-if="!loading && q && !items.length" class="empty">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24" class="icon-lg" aria-hidden="true">
          <path
            d="M10 2a8 8 0 105.293 14.293l4.707 4.707-1.414 1.414-4.707-4.707A8 8 0 1010 2z"
            fill="currentColor"
          />
        </svg>
      </div>
      <p class="muted">
        Try another keyword, e.g. <b>sleep</b>, <b>anxiety</b>.
      </p>
    </div>
  </section>
</template>

<style scoped>
:root {
  --text: #142a23;
  --muted: #5b6d65;
  --line: rgba(20, 42, 35, 0.1);

  --card: #fff;
  --card-border: rgba(20, 42, 35, 0.1);
  --shadow: 0 10px 30px rgba(10, 35, 25, 0.08), 0 2px 8px rgba(10, 35, 25, 0.05);

  --accent: #0d7f5a;
  --accent-ink: #0c3b2f;
  --accent-soft: #e6f4ea;

  --tint-a: #f6fbf8;
  --tint-b: #eef8f2;
}

.bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
      1200px 600px at 80% 0%,
      #f3fbf6 0%,
      transparent 60%
    ),
    radial-gradient(1000px 500px at 0% 20%, #f6fbf8 0%, transparent 55%),
    linear-gradient(180deg, #fcfffd 0%, #f7fbf9 50%, #fcfffd 100%);
}
.blob {
  position: absolute;
  width: 44vmax;
  height: 44vmax;
  filter: blur(60px);
  opacity: 0.35;
  mix-blend-mode: multiply;
  border-radius: 50%;
  animation: float 24s ease-in-out infinite;
}
.blob1 {
  left: -10vmax;
  top: -6vmax;
  background: radial-gradient(circle at 30% 30%, #9be3b5, transparent 60%);
}
.blob2 {
  right: -8vmax;
  top: 12vmax;
  background: radial-gradient(circle at 70% 30%, #b7e8ff, transparent 60%);
  animation-delay: -6s;
}
.blob3 {
  left: 20vmax;
  bottom: -12vmax;
  background: radial-gradient(circle at 40% 60%, #ffd9b5, transparent 60%);
  animation-delay: -12s;
}
@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0) scale(1);
  }
  50% {
    transform: translateY(-2vmax) translateX(1vmax) scale(1.03);
  }
}
.grid {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
      to right,
      rgba(13, 127, 90, 0.06) 0 1px,
      transparent 1px 40px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(13, 127, 90, 0.06) 0 1px,
      transparent 1px 40px
    );
  mask-image: radial-gradient(80% 60% at 50% 40%, #000 60%, transparent 100%);
  opacity: 0.6;
}
.grain {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(0, 0, 0, 0.022) 1px, transparent 1px);
  background-size: 3px 3px;
  opacity: 0.6;
  mix-blend-mode: multiply;
}

.wrap {
  position: relative;
  z-index: 1;
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 22px 40px;
  color: var(--text);
}
.page-head {
  margin-bottom: 18px;
}
.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(13, 127, 90, 0.08);
  border: 1px solid var(--line);
  color: var(--text);
  font-weight: 700;
  letter-spacing: 0.2px;
}
.badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #23c18a;
  box-shadow: 0 0 0 4px rgba(35, 193, 138, 0.18);
}
.title {
  font-size: 34px;
  line-height: 1.2;
  margin: 12px 0 6px;
  font-weight: 800;
  letter-spacing: 0.2px;
}
.sub {
  margin: 0;
  color: var(--muted);
}

.search-row {
  display: flex;
  gap: 14px;
  align-items: stretch;
  flex-wrap: wrap;
  margin-top: 16px;
}
.search-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 10px 12px;
}
.icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  color: #2c584a;
}
.input {
  flex: 1;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: var(--text);
}
.input::placeholder {
  color: #8aa49a;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #f4f8f6;
  color: var(--text);
  font-weight: 700;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: transform 0.02s ease, background 0.15s ease, opacity 0.15s ease;
}
.btn:hover {
  background: #eef4f1;
}
.btn:active {
  transform: translateY(1px);
}
.btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn.primary {
  background: var(--accent-soft);
  color: var(--accent-ink);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
}
.btn.primary:hover {
  background: #dff0e6;
}

.limit-input {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 16px;
  box-shadow: var(--shadow);
  padding: 8px 10px;
}
.num {
  width: 84px;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text);
  text-align: center;
}
.num::-webkit-outer-spin-button,
.num::-webkit-inner-spin-button {
  display: none;
}
.hint {
  font-size: 12px;
  color: var(--muted);
}

.meta {
  height: 24px;
  margin-top: 10px;
  font-size: 14px;
}
.muted {
  color: var(--muted);
}
.error {
  color: #c75050;
}
.sep {
  margin: 0 8px;
  opacity: 0.6;
}

.cards {
  margin-top: 16px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 1100px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 720px) {
  .cards {
    grid-template-columns: 1fr;
  }
}
.card {
  border: 1px solid var(--card-border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 34px rgba(10, 35, 25, 0.12),
    0 3px 10px rgba(10, 35, 25, 0.06);
}
.skeleton {
  height: 260px;
  background: linear-gradient(90deg, #f2f6f3 25%, #eaf2ee 37%, #f2f6f3 63%);
  background-size: 400% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.insight-card {
  background: linear-gradient(180deg, var(--tint-a) 0%, var(--tint-b) 100%);
  border-color: rgba(13, 127, 90, 0.16);
}
.insight-card .card-head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}
.tag {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  background: #fff;
  border: 1px solid var(--line);
}
.lead {
  margin: 10px 0 4px;
  line-height: 1.5;
  white-space: pre-wrap;
}
.split {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr;
  margin-top: 10px;
}
@media (max-width: 720px) {
  .split {
    grid-template-columns: 1fr;
  }
}
.label {
  font-weight: 700;
  margin-bottom: 6px;
  color: #2a5a4a;
}
.body {
  white-space: pre-line;
  color: var(--text);
}
.mt {
  margin-top: 12px;
}

.pager {
  margin-top: 22px;
  display: flex;
  gap: 10px;
}

.empty {
  margin-top: 40px;
  text-align: center;
}
.empty-icon {
  margin: 0 auto 12px;
  height: 64px;
  width: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}
.icon-lg {
  width: 28px;
  height: 28px;
  color: #2c584a;
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
  .grid {
    background-position: 0 0 !important;
  }
}

.insight-card {
  background: #325343;
  border-color: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.insight-card .card-title,
.insight-card .label,
.insight-card .body,
.insight-card .lead {
  color: #fff;
}

.insight-card .tag {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.insight-card.card:hover {
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.28), 0 4px 14px rgba(0, 0, 0, 0.18);
}

.insight-card .split,
.insight-card .mt {
}
</style>
