<script setup>
import { ref, computed } from "vue";
import api from "@/api";
import Header from "../components/Header.vue";

const DEBUG = true;

const loading = ref(false);
const error = ref("");
const rows = ref([]);

// 九个 PHQ-9
const form = ref({
  age: "",
  q1_interest: "Not at all",
  q2_down: "Not at all",
  q3_sleep: "Not at all",
  q4_energy: "Not at all",
  q5_appetite: "Not at all",
  q6_failure: "Not at all",
  q7_concentration: "Not at all",
  q8_moving: "Not at all",
  q9_thoughts: "Not at all",
});

// 下拉
const OPTIONS = [
  { v: "Not at all", t: "Not at all" },
  { v: "Several days", t: "Several days" },
  { v: "More than half the days", t: "More than half the days" },
  { v: "Nearly every day", t: "Nearly every day" },
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

function buildPayload() {
  const ageNum = form.value.age === "" ? null : Number(form.value.age);

  const payload = [
    {
      little_interest_or_pleasure_in_doing_things: form.value.q1_interest,
      feeling_down_depressed_or_hopeless: form.value.q2_down,
      trouble_falling_or_staying_asleep_or_rsleeping_too_much:
        form.value.q3_sleep,
      feeling_tired_or_having_little_energy: form.value.q4_energy,
      poor_appetite_or_overeating: form.value.q5_appetite,
      Feeling_bad_about_yourself_or_that_you_are_a_failure_or_have_let_yourself_or_your_family_down:
        form.value.q6_failure,
      Trouble_concentrating_on_things_such_as_reading_the_newspaper_or_watching_television:
        form.value.q7_concentration,
      Moving_or_speaking_so_slowly_that_other_people_could_have_noticed_Or_the_opposite_being_so_fidgety_or_restless_that_you_have_been_moving_around_a_lot_more_than_usual:
        form.value.q8_moving,
      Thoughts_that_you_would_be_better_off_dead_or_thoughts_of_hurting_yourself_in_some_way:
        form.value.q9_thoughts,
      age: ageNum,
    },
  ];

  if (DEBUG) console.log("[FE] payload", payload[0]);
  return payload;
}

async function onPredictForm() {
  loading.value = true;
  error.value = "";
  rows.value = [];
  try {
    const payload = buildPayload();
    const res = await api.aiPredictJson(payload);
    if (DEBUG) console.log("[FE] /api/ai/predict-json response", res);
    rows.value = res.rows || [];
  } catch (e) {
    error.value = e?.message || "Request failed.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Header />

  <section class="wrap">
    <header class="page-head">
      <div class="badge">
        <span class="dot"></span>
        EmotiScan · PHQ-9 Estimate
      </div>
      <h1 class="title">Mental Health Questionnaire</h1>
      <p class="sub">Answer the 9 items and get an instant estimate.</p>
    </header>

    <div class="scale card-lite" role="note" aria-label="Scale guide">
      <div class="scale-title">Scale guide</div>
      <ul>
        <li><b>Not at all</b> — 0 days</li>
        <li><b>Several days</b> — 1–2 days</li>
        <li><b>More than half the days</b> — 3–4 days</li>
        <li><b>Nearly every day</b> — 5–7 days</li>
      </ul>
    </div>

    <div class="card">
      <div class="card-head">
        <h3>PHQ-9 Form</h3>
      </div>

      <div class="form-grid">
        <label class="field" for="age">
          <span class="label">Age (optional)</span>
          <input
            id="age"
            v-model="form.age"
            type="number"
            min="0"
            step="1"
            placeholder="e.g., 22"
          />
        </label>

        <!-- Q1 -->
        <label class="field col-2" for="q1">
          <span class="label"
            >1. Little interest or pleasure in doing things</span
          >
          <select id="q1" v-model="form.q1_interest">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q2 -->
        <label class="field col-2" for="q2">
          <span class="label">2. Feeling down, depressed, or hopeless</span>
          <select id="q2" v-model="form.q2_down">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q3 -->
        <label class="field col-2" for="q3">
          <span class="label"
            >3. Trouble falling or staying asleep, or sleeping too much</span
          >
          <select id="q3" v-model="form.q3_sleep">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q4 -->
        <label class="field col-2" for="q4">
          <span class="label">4. Feeling tired or having little energy</span>
          <select id="q4" v-model="form.q4_energy">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q5 -->
        <label class="field col-2" for="q5">
          <span class="label">5. Poor appetite or overeating</span>
          <select id="q5" v-model="form.q5_appetite">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q6 -->
        <label class="field col-2" for="q6">
          <span class="label"
            >6. Feeling bad about yourself / failure / let family down</span
          >
          <select id="q6" v-model="form.q6_failure">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q7 -->
        <label class="field col-2" for="q7">
          <span class="label"
            >7. Trouble concentrating (reading, TV, etc.)</span
          >
          <select id="q7" v-model="form.q7_concentration">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q8 -->
        <label class="field col-2" for="q8">
          <span class="label"
            >8. Moving/speaking slowly OR fidgety/restless</span
          >
          <select id="q8" v-model="form.q8_moving">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>

        <!-- Q9 -->
        <label class="field col-2" for="q9">
          <span class="label"
            >9. Thoughts of being better off dead / self-harm</span
          >
          <select id="q9" v-model="form.q9_thoughts">
            <option v-for="o in OPTIONS" :key="o.v" :value="o.v">
              {{ o.t }}
            </option>
          </select>
        </label>
      </div>

      <div class="actions">
        <button class="btn primary" :disabled="loading" @click="onPredictForm">
          <span v-if="!loading">Predict</span>
          <span v-else class="spinner" aria-label="loading"></span>
        </button>
      </div>
    </div>

    <p v-if="error" class="alert" role="alert">⚠ {{ error }}</p>

    <div v-if="hasResult" class="card result" aria-live="polite">
      <div class="card-head">
        <h3>Prediction</h3>
      </div>
      <div class="pill">
        Top class: <b>{{ topClass }}</b>
      </div>
      <div class="probs">
        <div v-for="p in probEntries" :key="p.label" class="bar">
          <div class="bar-label">{{ p.label }}</div>
          <div class="bar-track">
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
  </section>
</template>

<style scoped>
.wrap {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}
.page-head {
  margin-bottom: 20px;
}
.badge {
  display: inline-flex;
  gap: 6px;
  background: #e6f4ea;
  padding: 4px 10px;
  border-radius: 999px;
}
.badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #23c18a;
}
.title {
  font-size: 28px;
  font-weight: 700;
  margin: 10px 0;
}
.sub {
  color: #666;
}

.card {
  background: #fff;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}
.card-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}
.card-lite {
  background: #f9fdfb;
  border: 1px solid #d7e9e1;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}
.field {
  display: grid;
  gap: 6px;
}
.label {
  font-size: 14px;
  font-weight: 600;
}
select,
input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
textarea {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  resize: vertical;
}

.actions {
  margin-top: 14px;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 700;
  cursor: pointer;
}
.btn.primary {
  background: #0d7f5a;
  color: #fff;
}
.btn.primary:hover {
  background: #0b6849;
}
.btn.cta {
  background: #fff;
  border: 1px solid #ccc;
}
.btn.big {
  padding: 12px 20px;
}

.result {
  margin-top: 20px;
}
.pill {
  display: inline-block;
  background: #f0f9f5;
  padding: 6px 12px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.probs {
  display: grid;
  gap: 10px;
  margin-top: 10px;
}
.bar {
  display: grid;
  grid-template-columns: 180px 1fr 60px;
  gap: 8px;
  align-items: center;
}
.bar-track {
  height: 12px;
  background: #eaf4ef;
  border-radius: 999px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #34c892, #0f8c66);
}
.bar-val {
  text-align: right;
  font-size: 13px;
}
.next-steps {
  margin-top: 20px;
  border-top: 1px dashed #ccc;
  padding-top: 12px;
}
.ns-title {
  font-weight: 700;
  margin-bottom: 6px;
}
.alert {
  margin-top: 12px;
  color: #c75050;
}
</style>
