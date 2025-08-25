<script setup>
import { ref } from "vue";
import { api } from "@/api";

const file = ref(null);
const uploading = ref(false);
const result = ref(null);
const errMsg = ref("");

function onPick(e) {
  const f = e.target.files?.[0];
  if (!f) return;
  if (!/wav|x-wav|wave/i.test(f.type) && !/\.wav$/i.test(f.name || "")) {
    errMsg.value = "Please upload a WAV audio file (20–30 seconds).";
    file.value = null;
    return;
  }
  errMsg.value = "";
  file.value = f;
}

async function analyze() {
  if (!file.value) {
    errMsg.value = "Please select a WAV audio file first.";
    return;
  }
  errMsg.value = "";
  result.value = null;
  uploading.value = true;
  try {
    const r = await api.speechAnalyze(file.value);
    result.value = r;
  } catch (e) {
    errMsg.value = String(e?.message || e);
  } finally {
    uploading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-emerald-900 text-white">
    <div class="mx-auto max-w-3xl px-6 py-10">
      <h1 class="text-3xl md:text-4xl font-bold">
        Speech & Word-Finding Checker
      </h1>
      <p class="mt-2 text-white/80">
        Upload a <b>20–30s WAV</b> speech clip to generate: Fluency, Pause
        Density, Mean Pause Duration, and Long Pause Ratio.
      </p>

      <!-- File Picker -->
      <div class="mt-8 rounded-2xl border border-white/15 bg-white/10 p-6">
        <label class="block text-sm mb-2">Audio File (WAV)</label>
        <input
          type="file"
          accept=".wav,audio/wav,audio/x-wav"
          @change="onPick"
          class="block w-full text-sm text-emerald-900 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700"
        />
        <p v-if="file" class="mt-2 text-white/80 text-sm">
          Selected: {{ file?.name }} ({{ Math.round(file?.size / 1024) }} KB)
        </p>

        <div class="mt-4 flex gap-3">
          <button
            @click="analyze"
            :disabled="uploading || !file"
            class="rounded-xl px-5 py-2.5 font-medium shadow bg-white text-emerald-900 hover:bg-white/90 disabled:opacity-50"
          >
            {{ uploading ? "Analyzing..." : "Analyze" }}
          </button>
          <button
            @click="
              () => {
                file = null;
                result = null;
                errMsg = '';
              }
            "
            class="rounded-xl px-5 py-2.5 font-medium shadow border border-white/20 hover:bg-white/10"
          >
            Reset
          </button>
        </div>

        <p v-if="errMsg" class="mt-3 text-red-200 text-sm">{{ errMsg }}</p>
      </div>

      <!-- Results -->
      <div v-if="result" class="mt-8 grid gap-4 md:grid-cols-2">
        <div class="rounded-2xl border border-white/15 bg-white/10 p-5">
          <div class="text-sm opacity-80">Total Duration</div>
          <div class="text-2xl font-semibold mt-1">
            {{ result.duration_s }} s
          </div>
        </div>

        <div class="rounded-2xl border border-white/15 bg-white/10 p-5">
          <div class="text-sm opacity-80">Pause Density (per min)</div>
          <div class="text-2xl font-semibold mt-1">
            {{ result.pause_density_per_min }}
          </div>
        </div>

        <div class="rounded-2xl border border-white/15 bg-white/10 p-5">
          <div class="text-sm opacity-80">Mean Pause Duration</div>
          <div class="text-2xl font-semibold mt-1">
            {{ result.mean_pause_ms }} ms
          </div>
        </div>

        <div class="rounded-2xl border border-white/15 bg-white/10 p-5">
          <div class="text-sm opacity-80">Long Pause Ratio (>700ms)</div>
          <div class="text-2xl font-semibold mt-1">
            {{ result.long_pause_pct }}%
          </div>
        </div>
      </div>

      <div
        v-if="result"
        class="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5"
      >
        <div class="text-base opacity-80">Hint</div>
        <div class="mt-1 text-lg font-medium">{{ result.fluency_hint }}</div>
        <div class="mt-2 text-sm opacity-70">{{ result.disclaimer }}</div>
      </div>
    </div>
  </div>
</template>
