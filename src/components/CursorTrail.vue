<template>
  <teleport to="body">
    <canvas
      ref="cv"
      class="pointer-events-none fixed inset-0"
      :style="{ zIndex: 2147483647 }"
    ></canvas>
  </teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const cv = ref(null);
let ctx,
  dpr = 1,
  w = 0,
  h = 0,
  raf = 0,
  last = 0;
const parts = [];

function resize() {
  dpr = Math.max(1, window.devicePixelRatio || 1);
  w = window.innerWidth;
  h = window.innerHeight;
  cv.value.width = w * dpr;
  cv.value.height = h * dpr;
  cv.value.style.width = w + "px";
  cv.value.style.height = h + "px";
  ctx = cv.value.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = "lighter";
}

function spawn(x, y) {
  const n = 12;
  for (let i = 0; i < n; i++) {
    const ang = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 120;
    const life = 420 + Math.random() * 380;
    const size = 2.5 + Math.random() * 4.5;
    const colors = ["#ffffff", "#A7E1C0", "#FF7F9A", "#D1FFE9"];
    parts.push({
      x,
      y,
      vx: Math.cos(ang) * sp,
      vy: Math.sin(ang) * sp,
      t: 0,
      life,
      size,
      color: colors[(Math.random() * colors.length) | 0],
    });
  }
}

function move(e) {
  const now = performance.now();
  if (now - last < 22) return;
  last = now;
  spawn(e.clientX, e.clientY);
}

function tick(ts) {
  raf = requestAnimationFrame(tick);
  ctx.clearRect(0, 0, w, h);
  for (let i = parts.length - 1; i >= 0; i--) {
    const p = parts[i];
    p.t += 16;
    const k = p.t / p.life;
    if (k >= 1) {
      parts.splice(i, 1);
      continue;
    }
    p.x += p.vx * 0.016;
    p.y += p.vy * 0.016;
    const r = p.size * (1 - k);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    g.addColorStop(0, p.color);
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

onMounted(() => {
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("pointermove", move, { passive: true });
  raf = requestAnimationFrame(tick);
});

onUnmounted(() => {
  window.removeEventListener("resize", resize);
  document.removeEventListener("pointermove", move);
  cancelAnimationFrame(raf);
});
</script>
