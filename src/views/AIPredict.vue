<script setup>
import { ref, computed } from "vue";
import api from "@/api";
import Header from "../components/Header.vue";

const loading = ref(false);
const error = ref("");
const rows = ref([]);

const form = ref({
  age: "",
  sleep_quality: 0,
  energy_level: 0,
  appetite_change: 0,
  concentration_difficulty: 0,
  worry_frequency: 0,
});

const OPTIONS = [
  { v: 0, t: "None" },
  { v: 1, t: "A little" },
  { v: 2, t: "Noticeable" },
  { v: 3, t: "Severe" },
];

const topClass = computed(() => rows.value[0]?.predicted_class || "");
const hasResult = computed(() => rows.value.length > 0);

const probEntries = computed(() => {
  if (!hasResult.value) return [];
  const r = rows.value[0];
  return Object.entries(r)
    .filter(([k]) => k.startsWith("probability_"))
    .map(([k, v]) => ({
      label: k.replace("probability_", ""),
      value: Number(v),
    }))
    .sort((a, b) => b.value - a.value);
});

const recommended = computed(() => {
  const c = (topClass.value || "").toLowerCase();
  if (c.includes("severe") || c.includes("moderate")) {
    return {
      to: "/breathing",
      label: "Start Breathing Space",
      desc: "2–5 minutes rhythmic breathing to settle the body.",
    };
  }
  return {
    to: "/flip-cards",
    label: "Try Positive Flip Cards",
    desc: "Reframe unhelpful thoughts into kinder ones.",
  };
});

const file = ref(null);
function onFileChange(e) {
  file.value = e.target.files?.[0] || null;
}

async function onPredictForm() {
  loading.value = true;
  error.value = "";
  rows.value = [];
  try {
    const payload = [
      {
        age: form.value.age === "" ? null : Number(form.value.age),
        sleep_quality: form.value.sleep_quality,
        energy_level: form.value.energy_level,
        appetite_change: form.value.appetite_change,
        concentration_difficulty: form.value.concentration_difficulty,
        worry_frequency: form.value.worry_frequency,
      },
    ];
    const res = await api.aiPredictJson(payload);
    rows.value = res.rows || [];
  } catch (e) {
    error.value = e?.message || "Request failed.";
  } finally {
    loading.value = false;
  }
}

async function onPredictFile() {
  if (!file.value) return;
  loading.value = true;
  error.value = "";
  rows.value = [];
  try {
    const res = await api.aiPredictXlsx(file.value);
    rows.value = res.rows || [];
  } catch (e) {
    error.value = e?.message || "Upload failed.";
  } finally {
    loading.value = false;
  }
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
        EmotiScan · AI Predict
      </div>
      <h1 class="title">Personalized Mental Health Estimate</h1>
      <p class="sub">
        This tool offers awareness-only insights based on your answers. It is
        not a diagnosis or medical advice.
      </p>
    </header>

    <div class="scale card-lite" role="note" aria-label="Scale guide">
      <div class="scale-title">Scale guide (for all items)</div>
      <ul>
        <li><b>None</b> — 0 days in the past week, no noticeable impact.</li>
        <li>
          <b>A little</b> — 1–2 days/week or mild impact; you can carry on.
        </li>
        <li>
          <b>Noticeable</b> — 3–4 days/week or clear impact on focus, sleep,
          appetite or energy.
        </li>
        <li>
          <b>Severe</b> — 5–7 days/week or limits/changes your usual activities.
        </li>
      </ul>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head">
          <h3>Quick form</h3>
          <p class="muted">
            Answer a few questions and get an instant estimate.
          </p>
        </div>

        <div class="form-grid" role="group" aria-labelledby="form">
          <label class="field" for="age">
            <span class="label">Age (optional)</span>
            <input
              id="age"
              v-model="form.age"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              placeholder="e.g., 22"
              aria-describedby="ageHint"
            />
            <small id="ageHint" class="hint"
              >Helps with calibration but not required.</small
            >
          </label>

          <label class="field" for="sleep">
            <span class="label">Sleep issues</span>
            <select id="sleep" v-model="form.sleep_quality">
              <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
                {{ o.t }}
              </option>
            </select>
            <small class="hint"
              >Trouble falling asleep, frequent waking, unrested.</small
            >
          </label>

          <label class="field" for="energy">
            <span class="label">Low energy / fatigue</span>
            <select id="energy" v-model="form.energy_level">
              <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
                {{ o.t }}
              </option>
            </select>
            <small class="hint"
              >How often low energy makes the day harder.</small
            >
          </label>

          <label class="field" for="appetite">
            <span class="label">Appetite changes</span>
            <select id="appetite" v-model="form.appetite_change">
              <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
                {{ o.t }}
              </option>
            </select>
            <small class="hint">Less or more appetite than usual.</small>
          </label>

          <label class="field" for="focus">
            <span class="label">Difficulty concentrating</span>
            <select id="focus" v-model="form.concentration_difficulty">
              <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
                {{ o.t }}
              </option>
            </select>
            <small class="hint"
              >Study/work tasks, conversations, reading, etc.</small
            >
          </label>

          <label class="field" for="worry">
            <span class="label">Worry / tension frequency</span>
            <select id="worry" v-model="form.worry_frequency">
              <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
                {{ o.t }}
              </option>
            </select>
            <small class="hint"
              >Muscle tension, racing thoughts, “on edge”.</small
            >
          </label>
        </div>

        <div class="actions">
          <button
            class="btn primary"
            :disabled="loading"
            @click="onPredictForm"
          >
            <span v-if="!loading">Predict</span>
            <span v-else class="spinner" aria-label="loading"></span>
          </button>
        </div>
      </div>

      <!-- Optional Excel card (kept commented in your version) -->
      <!--
      <div class="card">
        <div class="card-head">
          <h3>Predict from Excel</h3>
          <p class="muted">Column names must match the training features (no target column).</p>
        </div>
        <div class="upload">
          <input type="file" accept=".xlsx,.xls" @change="onFileChange" aria-label="Upload Excel file" />
          <button class="btn" :disabled="!file || loading" @click="onPredictFile">
            <span v-if="!loading">Upload & Predict</span>
            <span v-else class="spinner" aria-label="loading"></span>
          </button>
        </div>
        <p class="tiny muted">Tip: provide a downloadable template for best results.</p>
      </div>
      -->
    </div>

    <p v-if="error" class="alert" role="alert">⚠ {{ error }}</p>

    <div v-if="hasResult" class="card result" aria-live="polite">
      <div class="card-head">
        <h3>Prediction</h3>
        <p class="muted">Estimated likelihood by class</p>
      </div>

      <div class="pill">
        Top class: <b>{{ topClass }}</b>
      </div>

      <div class="probs">
        <div v-for="p in probEntries" :key="p.label" class="bar">
          <div class="bar-label">{{ p.label }}</div>
          <div class="bar-track" :aria-label="p.label + ' probability'">
            <div
              class="bar-fill"
              :style="{ width: (p.value * 100).toFixed(1) + '%' }"
            />
          </div>
          <div class="bar-val">{{ (p.value * 100).toFixed(1) }}%</div>
        </div>
      </div>

      <div class="next-steps">
        <div class="ns-title">Suggested next step</div>
        <router-link :to="recommended.to" class="btn cta big">
          {{ recommended.label }}
        </router-link>
        <p class="tiny muted">{{ recommended.desc }}</p>
      </div>
    </div>

    <!-- <div v-if="!hasResult && !loading && !error" class="empty">
      <div class="empty-text muted">
        Fill the form or upload a sheet to see your estimate.
      </div>
    </div> -->

    <div v-if="loading" class="loading-banner">Working on it…</div>
  </section>
</template>

<style scoped>
:root {
  --page: #fcfefd;
  --text: #142a23;
  --muted: #5b6d65;
  --line: rgba(20, 42, 35, 0.08);

  --card-bg: #fff;
  --card-border: rgba(20, 42, 35, 0.08);
  --shadow: 0 10px 30px rgba(10, 35, 25, 0.08), 0 2px 8px rgba(10, 35, 25, 0.05);

  --accent: #0d7f5a;
  --accent-soft: #e6f4ea;
  --accent-ink: #0c3b2f;

  --track: #eaf4ef; /* stronger track */
  --track-border: #d7e9e1; /* visible border */
  --fill-a: #34c892; /* stronger fill */
  --fill-b: #0f8c66;
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
  max-width: 1080px;
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
  font-size: 38px;
  line-height: 1.15;
  margin: 12px 0 6px;
  font-weight: 800;
  letter-spacing: 0.3px;
}
.sub {
  margin: 0;
  color: var(--muted);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}
@media (max-width: 900px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 18px;
  box-shadow: var(--shadow);
  padding: 18px;
}
.card-head h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}
.card-head .muted {
  margin-top: 4px;
  color: var(--muted);
}
.card-lite {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid var(--card-border);
  border-radius: 14px;
  padding: 12px 14px;
  margin: 10px 0 4px;
  box-shadow: 0 4px 14px rgba(10, 35, 25, 0.05);
}

.scale-title {
  font-weight: 800;
  font-size: 13px;
  letter-spacing: 0.2px;
  margin-bottom: 6px;
}
.scale ul {
  margin: 0;
  padding-left: 18px;
}
.scale li {
  margin: 3px 0;
}

.form-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.form-grid .col-2 {
  grid-column: span 2;
}
.field {
  display: grid;
  gap: 6px;
}
.label {
  font-size: 12px;
  letter-spacing: 0.3px;
  color: var(--muted);
}
.hint {
  font-size: 11px;
  color: var(--muted);
}
input,
select,
textarea {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  outline: none;
  transition: box-shadow 0.15s ease, border-color 0.15s ease,
    transform 0.02s ease;
}
input::placeholder {
  color: #8aa49a;
}
input:focus,
select:focus,
textarea:focus {
  border-color: rgba(13, 127, 90, 0.35);
  box-shadow: 0 0 0 3px rgba(13, 127, 90, 0.18);
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #f4f8f6;
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.2px;
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
.btn.cta {
  background: #fff;
  color: var(--text);
  border: 1px solid var(--line);
}
.btn.cta:hover {
  background: #f6f8f7;
}
.btn.big {
  padding: 14px 22px;
  font-size: 1.05rem;
}

.result {
  margin-top: 18px;
}
.pill {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: #f4faf7;
  border: 1px solid var(--line);
  font-weight: 700;
}

.probs {
  margin-top: 14px;
  display: grid;
  gap: 14px;
}
.bar {
  display: grid;
  grid-template-columns: 180px 1fr 70px;
  align-items: center;
  gap: 12px;
}
.bar-label {
  white-space: nowrap;
}
.bar-track {
  height: 14px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--track);
  border: 1px solid var(--track-border);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--fill-a), var(--fill-b));
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.04),
    inset 0 -1px 0 rgba(255, 255, 255, 0.25);
  transition: width 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
.bar-val {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.next-steps {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px dashed var(--line);
}
.ns-title {
  font-weight: 800;
  margin-bottom: 10px;
}
.ns-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.alert {
  margin-top: 14px;
  color: #c75050;
}
.muted {
  color: var(--muted);
}
.loading-banner {
  margin-top: 16px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f5faf7;
  text-align: center;
  border: 1px solid var(--line);
}

.empty {
  display: grid;
  place-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 16px 12px;
  color: var(--muted);
}
.empty-emoji {
  font-size: 28px;
}
.empty-text {
  font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .blob {
    animation: none;
  }
  .grid {
    background-position: 0 0 !important;
  }
}
</style>
