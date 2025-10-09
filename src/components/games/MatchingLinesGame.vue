<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue";

/** ---------- Data: Situations (left) & Coping strategies (right) --------- */
const PAIRS = [
  {
    id: 1,
    situation: "Big presentation tomorrow; feeling anxious tonight.",
    strategy: "Do 4-7-8 breathing x3 and write the top worry.",
  },
  {
    id: 2,
    situation: "Argued with a roommate; heart racing.",
    strategy:
      "Take a 5-minute walk and use “I-statements” to express feelings.",
  },
  {
    id: 3,
    situation: "Overwhelmed by a long to-do list.",
    strategy: "List 3 smallest next steps and start with one.",
  },
  {
    id: 4,
    situation: "Negative self-talk won’t stop.",
    strategy:
      "Cognitive reappraisal: gather evidence and craft an alternative thought.",
  },
  {
    id: 5,
    situation: "Doom-scrolling, focus drifting.",
    strategy: "Pomodoro 25-minute focus + 2-minute stretch break.",
  },
];

function shuffle(a) {
  return [...a].sort(() => Math.random() - 0.5);
}

/** ---------- State --------- */
const left = ref([]); // situations
const right = ref([]); // strategies
const connections = ref([]); // { lId, rId, correct, path }
const selectedLeft = ref(null);

const dragState = ref(null); // { fromId, to: {x,y} } relative to board
const boardRef = ref(null);
const leftColRef = ref(null);
const rightColRef = ref(null);
const svgSize = ref({ w: 0, h: 0 });

const score = computed(() => connections.value.filter((c) => c.correct).length);
const finished = computed(() => score.value === PAIRS.length);

/** ---------- Layout helpers --------- */
function updateSvgSize() {
  const b = boardRef.value?.getBoundingClientRect();
  if (!b) return;
  svgSize.value = { w: b.width, h: b.height };
}
function getCenterInBoard(el) {
  const b = boardRef.value?.getBoundingClientRect();
  if (!el || !b) return { x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  return { x: r.left - b.left + r.width / 2, y: r.top - b.top + r.height / 2 };
}
function getNodeEl(side, id) {
  const q = side === "L" ? `[data-left-id="${id}"]` : `[data-right-id="${id}"]`;
  return (side === "L" ? leftColRef : rightColRef).value?.querySelector(q);
}
function bezierPath(p1, p2) {
  const dx = (p2.x - p1.x) * 0.4;
  const c1 = { x: p1.x + dx, y: p1.y };
  const c2 = { x: p2.x - dx, y: p2.y };
  return `M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`;
}
function drawAllLines() {
  connections.value = connections.value.map((c) => {
    const lEl = getNodeEl("L", c.lId);
    const rEl = getNodeEl("R", c.rId);
    if (!lEl || !rEl) return c;
    const p1 = getCenterInBoard(lEl);
    const p2 = getCenterInBoard(rEl);
    return { ...c, path: bezierPath(p1, p2) };
  });
}

/** ---------- Game flow --------- */
function setupRound() {
  left.value = shuffle(PAIRS).map((p) => ({ id: p.id, text: p.situation }));
  right.value = shuffle(PAIRS).map((p) => ({ id: p.id, text: p.strategy }));
  connections.value = [];
  selectedLeft.value = null;
  dragState.value = null;
  nextTick(() => {
    updateSvgSize();
    drawAllLines();
  });
}

function handleLeftClick(id) {
  selectedLeft.value = id;
}
function handleRightClick(id) {
  if (selectedLeft.value == null) return;
  connect(selectedLeft.value, id);
  selectedLeft.value = null;
}
function connect(lId, rId) {
  // prevent reusing either node
  if (
    connections.value.find((c) => c.lId === lId) ||
    connections.value.find((c) => c.rId === rId)
  )
    return;
  const correct = lId === rId;
  connections.value.push({ lId, rId, correct, path: "" });
  nextTick(drawAllLines);
}

/** ---------- Drag to connect (desktop) --------- */
function startDrag(lId, e) {
  selectedLeft.value = lId;
  const b = boardRef.value?.getBoundingClientRect();
  if (!b) return;
  dragState.value = {
    fromId: lId,
    to: { x: e.clientX - b.left, y: e.clientY - b.top },
  };
}
function onDragMove(e) {
  if (!dragState.value) return;
  const b = boardRef.value?.getBoundingClientRect();
  if (!b) return;
  dragState.value.to = { x: e.clientX - b.left, y: e.clientY - b.top };
}
function endDragOverRight(rId) {
  if (!dragState.value) return;
  connect(dragState.value.fromId, rId);
  dragState.value = null;
  selectedLeft.value = null;
}
function cancelDrag() {
  dragState.value = null;
  selectedLeft.value = null;
}

/** ---------- Resize --------- */
function onResize() {
  updateSvgSize();
  drawAllLines();
}

onMounted(() => {
  setupRound();
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => window.removeEventListener("resize", onResize));
</script>

<template>
  <div class="wrap">
    <div class="topbar">
      <div class="score">
        Score <strong>{{ score }}</strong> / {{ PAIRS.length }}
      </div>
      <div class="btns">
        <button class="ghost" @click="setupRound">Shuffle</button>
        <button
          class="ghost"
          @click="
            connections = [];
            selectedLeft = null;
          "
        >
          Clear lines
        </button>
      </div>
    </div>

    <div
      class="board"
      ref="boardRef"
      @mousemove="onDragMove"
      @mouseleave="cancelDrag"
    >
      <!-- Left column: situations -->
      <div class="col" ref="leftColRef" aria-label="Stress situations">
        <div
          v-for="it in left"
          :key="it.id"
          class="card left"
          :data-left-id="it.id"
          :class="{
            selected: selectedLeft === it.id,
            used: connections.some((c) => c.lId === it.id),
          }"
          tabindex="0"
          @click="handleLeftClick(it.id)"
          @mousedown.prevent="startDrag(it.id, $event)"
        >
          {{ it.text }}
        </div>
      </div>

      <!-- Lines -->
      <svg
        class="wires"
        :width="svgSize.w"
        :height="svgSize.h"
        aria-hidden="true"
      >
        <g>
          <path
            v-for="(c, i) in connections"
            :key="i"
            :d="c.path"
            :class="['wire', c.correct ? 'ok' : 'bad']"
          />
          <path
            v-if="dragState"
            :d="
              (() => {
                if (!selectedLeft) return '';
                const lEl = getNodeEl('L', selectedLeft);
                if (!lEl) return '';
                const p1 = getCenterInBoard(lEl);
                return bezierPath(p1, dragState.to);
              })()
            "
            class="wire temp"
          />
        </g>
      </svg>

      <!-- Right column: strategies -->
      <div class="col" ref="rightColRef" aria-label="Coping strategies">
        <div
          v-for="it in right"
          :key="it.id"
          class="card right"
          :data-right-id="it.id"
          :class="{ used: connections.some((c) => c.rId === it.id) }"
          tabindex="0"
          @click="handleRightClick(it.id)"
          @mouseup.prevent="endDragOverRight(it.id)"
        >
          {{ it.text }}
        </div>
      </div>
    </div>

    <div class="result" v-if="finished">
      <h3>Great job! 🎉</h3>
      <p>You’ve matched all pairs. Want another round?</p>
      <button class="primary" @click="setupRound">Play again</button>
    </div>

    <details class="hint">
      <summary>How to play</summary>
      <ul>
        <li>
          Click a card on the left, then click its matching strategy on the
          right — or drag from left to right.
        </li>
        <li>Green line = correct match; red line = mismatch.</li>
        <li>Lines auto-adjust on window resize.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
/* container */
.wrap {
  background: linear-gradient(180deg, #1f3a30 0%, #1b332a 100%);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.22);
}

/* top bar */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.score {
  font-weight: 600;
}
.btns {
  display: flex;
  gap: 10px;
}
button {
  cursor: pointer;
}
button.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: #fff;
  padding: 8px 12px;
  border-radius: 12px;
  backdrop-filter: blur(2px);
}
button.ghost:hover {
  background: rgba(255, 255, 255, 0.08);
}
button.primary {
  background: #4aa786;
  border: none;
  color: #fff;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 600;
}

/* board */
.board {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 26px;
  min-height: 460px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* cards */
.card {
  background: #ffffff;
  color: #223;
  padding: 16px 14px;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  user-select: none;
  line-height: 1.35;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}
.card.left.selected {
  outline: 2px solid #4aa786;
  outline-offset: 2px;
}
.card.used {
  opacity: 0.78;
}

/* wires */
.wires {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}
.wire {
  fill: none;
  stroke-width: 4px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35));
}
.wire.ok {
  stroke: #39d98a;
}
.wire.bad {
  stroke: #ff6b6b;
  stroke-dasharray: 9 7;
}
.wire.temp {
  stroke: #ffd166;
  stroke-dasharray: 7 6;
}

/* result + help */
.result {
  text-align: center;
  margin-top: 20px;
}
.hint {
  margin-top: 16px;
  opacity: 0.9;
}

@media (max-width: 900px) {
  .board {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .wires {
    display: none;
  } /* mobile: use tap-to-match; hide lines for simplicity */
}
</style>
