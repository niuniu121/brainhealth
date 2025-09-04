<template>
  <div
    v-if="!isCoarse && !reduceMotion && visible"
    class="pointer-events-none fixed left-0 top-0 z-[9999]"
    :style="wrapperStyle"
  >
    <img
      :src="state === 'link' ? handSrc : idleSrc"
      alt=""
      class="select-none"
      :style="imgStyle"
      draggable="false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import idleSrc from "@/assets/cursor/buddy-default.svg";
import handSrc from "@/assets/cursor/buddy-hand.svg";

const x = ref(0);
const y = ref(0);
const state = ref("default");
const visible = ref(false);
const isCoarse = ref(false);
const reduceMotion = ref(false);

function onMove(e) {
  x.value = e.clientX;
  y.value = e.clientY;
  visible.value = true;
  const t = e.target;
  state.value = t?.closest?.(
    "a,button,[role='button'],input,select,textarea,summary,label"
  )
    ? "link"
    : "default";
}

onMounted(() => {
  isCoarse.value = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  reduceMotion.value =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  window.addEventListener("mousemove", onMove, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMove);
});

const wrapperStyle = computed(() => ({
  transform: `translate(${x.value}px, ${y.value}px)`,
  transition: "transform 35ms linear",
}));

const imgStyle = computed(() => ({
  width: "48px",
  height: "48px",
  transform: "translate(-50%, -50%)",
  filter:
    state.value === "link" ? "drop-shadow(0 2px 6px rgba(0,0,0,.25))" : "none",
}));
</script>

<style>
@keyframes pulse {
  from {
    transform: translate(-50%, -50%) scale(0.6);
    opacity: 0.9;
  }
  to {
    transform: translate(-50%, -50%) scale(1.6);
    opacity: 0;
  }
}
</style>
