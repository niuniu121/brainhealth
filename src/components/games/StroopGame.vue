<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Done from "@/assets/gif/Done.gif";
import Header from "@/components/Header.vue";

const COLORS = [
  { key: "red", label: "Red", css: "#e74c3c", hotkey: "A" },
  { key: "green", label: "Green", css: "#27ae60", hotkey: "S" },
  { key: "blue", label: "Blue", css: "#2980b9", hotkey: "D" },
  { key: "yellow", label: "Yellow", css: "#f1c40f", hotkey: "F" },
  { key: "purple", label: "Purple", css: "#8e44ad", hotkey: "J" },
  { key: "orange", label: "Orange", css: "#e67e22", hotkey: "K" },
];

const rounds = ref(15); // 本局题目数
const idx = ref(0); // 当前题目索引
const score = ref(0); // 得分
const streak = ref(0); // 连对
const rtList = ref([]); // 反应时间集合
const options = ref([]); // color key
const word = ref(""); // RED / GREEN
const fontColor = ref(""); // color key
const phase = ref("ready"); // ready | playing | result
const feedback = ref(null); // 'correct' | 'wrong' | null
const startedAt = ref(0); // 题目起始时间（用于RT）
const difficulty = ref("mixed"); // easy(匹配) | hard(全不匹配) | mixed(随机)

const avgRT = computed(() => {
  if (!rtList.value.length) return 0;
  return Math.round(
    rtList.value.reduce((a, b) => a + b, 0) / rtList.value.length
  );
});
const finished = computed(() => idx.value >= rounds.value);

function randPick(arr, n) {
  const t = [...arr];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return n ? t.slice(0, n) : t[0];
}

function newTrial() {
  const wordColor = randPick(COLORS);
  let colorForFont;

  if (difficulty.value === "easy") {
    colorForFont = wordColor.key;
  } else if (difficulty.value === "hard") {
    const others = COLORS.filter((c) => c.key !== wordColor.key);
    colorForFont = randPick(others).key;
  } else {
    if (Math.random() < 0.2) colorForFont = wordColor.key;
    else
      colorForFont = randPick(
        COLORS.filter((c) => c.key !== wordColor.key)
      ).key;
  }

  word.value = wordColor.label.toUpperCase();
  fontColor.value = colorForFont;

  const pool = new Set([colorForFont]);
  while (pool.size < 4) pool.add(randPick(COLORS).key);
  options.value = randPick([...pool], 4);

  feedback.value = null;
  startedAt.value = performance.now();
}

function startGame() {
  score.value = 0;
  streak.value = 0;
  rtList.value = [];
  idx.value = 0;
  phase.value = "playing";
  newTrial();
}

function nextOrEnd() {
  idx.value += 1;
  if (finished.value) {
    phase.value = "result";
  } else {
    newTrial();
  }
}

function answer(choiceKey) {
  if (phase.value !== "playing") return;
  const rt = performance.now() - startedAt.value;
  rtList.value.push(rt);

  if (choiceKey === fontColor.value) {
    score.value += 1;
    streak.value += 1;
    feedback.value = "correct";
  } else {
    streak.value = 0;
    feedback.value = "wrong";
  }
  setTimeout(nextOrEnd, 350);
}

function onKey(e) {
  const k = e.key.toUpperCase();
  const map = new Map(COLORS.map((c) => [c.hotkey, c.key]));
  if (map.has(k)) answer(map.get(k));
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="wrap">
    <div class="top">
      <div class="left">
        <label class="pill">
          Rounds
          <input type="number" min="5" max="50" v-model.number="rounds" />
        </label>
        <label class="pill">
          Mode
          <select v-model="difficulty">
            <option value="mixed">Mixed</option>
            <option value="easy">Easy (match)</option>
            <option value="hard">Hard (mismatch)</option>
          </select>
        </label>
      </div>

      <div class="mid" v-if="phase !== 'result'">
        <span
          >Score: <b>{{ score }}</b></span
        >
        <span
          >Streak: <b>{{ streak }}</b></span
        >
        <span
          >Round: <b>{{ Math.min(idx + 1, rounds) }}</b> / {{ rounds }}</span
        >
        <span v-if="rtList.length"
          >Avg RT: <b>{{ avgRT }}</b> ms</span
        >
      </div>

      <div class="right">
        <button class="ghost" v-if="phase !== 'playing'" @click="startGame">
          Start
        </button>
        <button class="ghost" v-else @click="startGame">Restart</button>
      </div>
    </div>

    <div v-if="phase !== 'result'" class="stage">
      <div
        class="stim"
        :style="{ color: COLORS.find((c) => c.key === fontColor)?.css }"
        :class="feedback"
      >
        {{ word }}
      </div>

      <div class="opts">
        <button v-for="k in options" :key="k" class="opt" @click="answer(k)">
          {{ COLORS.find((c) => c.key === k)?.label }}
          <span class="hint">{{
            COLORS.find((c) => c.key === k)?.hotkey
          }}</span>
        </button>
      </div>
      <p class="note">
        Select the <b>font color</b> (not the word meaning). 键盘快捷键：A / S /
        D / F / J / K
      </p>
    </div>

    <div v-else class="result">
      <div class="pen"><img :src="Done" alt="Done" class="done-gif" /></div>
      <p>
        Score: <b>{{ score }}</b> / {{ rounds }} ・ Avg RT:
        <b>{{ avgRT }}</b> ms
      </p>
      <button class="primary" @click="startGame">Play Again</button>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  background: #1f3a30;
  border-radius: 16px;
  padding: 16px;
}
.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.left,
.mid,
.right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #2a4639;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 10px;
  border-radius: 999px;
}
input,
select {
  background: transparent;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 4px 8px;
  outline: none;
}
button {
  cursor: pointer;
}
button.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
}
button.primary {
  background: #4aa786;
  border: none;
  color: #fff;
  padding: 10px 14px;
  border-radius: 10px;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.stim {
  font-size: 68px;
  font-weight: 900;
  letter-spacing: 1px;
  background: #163127;
  border-radius: 16px;
  padding: 20px 32px;
  min-width: 320px;
  text-align: center;
  transition: transform 0.15s ease;
}
.stim.correct {
  transform: scale(1.04);
}
.stim.wrong {
  transform: scale(0.96);
}
.opts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
  max-width: 800px;
}
.opt {
  background: #fff;
  color: #223;
  padding: 14px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
}
.hint {
  opacity: 0.6;
  font-weight: 500;
}
.note {
  opacity: 0.9;
  text-align: center;
}

.result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 16px;
  min-height: 300px;
}

.pen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-bottom: 16px;
}

.done-gif {
  width: 220px;
  height: auto;
  margin-bottom: 12px;
  border-radius: 12px;
}
</style>
