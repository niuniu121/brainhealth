<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Header from "@/components/Header.vue";
import TipBar from "@/components/TipBar.vue";

const moodCardRef = ref(null);
let hideTimer;

/* tap to reveal overlay on touch devices */
function revealOnTouch() {
  const el = moodCardRef.value;
  if (!el) return;
  el.classList.add("touch-reveal");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => el.classList.remove("touch-reveal"), 1500);
}

onMounted(() => {
  const el = moodCardRef.value;
  if (!el) return;
  el.addEventListener("click", revealOnTouch, { passive: true });
  el.addEventListener("touchstart", revealOnTouch, { passive: true });
});

onBeforeUnmount(() => {
  const el = moodCardRef.value;
  if (!el) return;
  el.removeEventListener("click", revealOnTouch);
  el.removeEventListener("touchstart", revealOnTouch);
  clearTimeout(hideTimer);
});
</script>

<template>
  <div class="home-page">
    <Header />
    <TipBar />

    <main class="home-container">
      <h1 class="main-title">Find Your Calm Today</h1>
      <h2 class="subtitle">Choose a way to restore your mind</h2>

      <div class="therapy-options">
        <router-link to="/breathing" class="therapy-card">
          <img src="@/assets/imgs/home.png" alt="Breathing Space" />
          <div class="therapy-info">
            <h3>Breathing Space</h3>
            <p>Follow the rhythm and release stress</p>
          </div>
        </router-link>

        <!-- Disabled / Coming soon card -->
        <div
          ref="moodCardRef"
          class="therapy-card is-disabled"
          tabindex="0"
          role="button"
          aria-disabled="true"
          aria-label="Mood Collage coming soon"
        >
          <img src="@/assets/imgs/home1.png" alt="Mood Collage (coming soon)" />
          <div class="therapy-info">
            <h3>Mood Collage</h3>
            <p>Express your feelings with colors</p>
          </div>

          <!-- overlay -->
          <div class="coming-soon" aria-hidden="true">
            <span class="pill">
              <span class="dot"></span>
              Coming&nbsp;soon…
            </span>
            <small class="hint">Tap or hover to preview</small>
          </div>
        </div>

        <router-link to="/flip-cards" class="therapy-card">
          <img src="@/assets/imgs/home2.png" alt="Positive Flip Cards" />
          <div class="therapy-info">
            <h3>Positive Flip Cards</h3>
            <p>Turn negative thoughts into positive ones</p>
          </div>
        </router-link>

        <div class="helper-copy">
          Not sure where to start? Just pick the one you feel like today.
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #325343;
  color: #fff;
  overflow-x: hidden;
}

.home-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px 60px;
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: hidden;
}

.main-title {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 1.8rem;
  margin-bottom: 60px;
  font-weight: 500;
}

.therapy-options {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
}

.therapy-card {
  position: relative;
  background: #fff;
  color: #333;
  border-radius: 12px;
  overflow: hidden;
  width: 420px;
  height: 350px;
  transition: 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  outline: none;
}

.therapy-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
}

.therapy-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.therapy-info {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.therapy-info h3 {
  font-size: 1.4rem;
  margin-bottom: 8px;
  font-weight: 600;
}

.therapy-info p {
  font-size: 1rem;
  color: #555;
}

.helper-copy {
  width: 100%;
  text-align: center;
  margin-top: 16px;
  opacity: 0.9;
}

/* —— Coming soon overlay —— */
.is-disabled {
  cursor: default;
}
.is-disabled::after {
  /* subtle vignette on hover/focus/touch */
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
      120% 80% at 50% 10%,
      rgba(0, 0, 0, 0) 30%,
      rgba(0, 0, 0, 0.35) 100%
    ),
    linear-gradient(180deg, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0.45) 100%);
  opacity: 0;
  transition: opacity 260ms ease;
  pointer-events: none;
}
.is-disabled .coming-soon {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 10px;
  text-align: center;
  opacity: 0;
  transform: translateY(8px) scale(0.98);
  transition: opacity 280ms ease,
    transform 320ms cubic-bezier(0.22, 0.61, 0.36, 1);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  pointer-events: none;
}

.is-disabled .pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.2px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.92),
    rgba(230, 240, 236, 0.92)
  );
  color: #1f3a2f;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18);
  position: relative;
  overflow: hidden;
}
.is-disabled .pill::before {
  /* gentle shimmer */
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-120%);
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255, 255, 255, 0.7) 50%,
    transparent 70%
  );
  animation: shimmer 2.2s infinite;
}
@keyframes shimmer {
  0% {
    transform: translateX(-120%);
  }
  60% {
    transform: translateX(120%);
  }
  100% {
    transform: translateX(120%);
  }
}

.is-disabled .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2f6e54;
  animation: pulse 1.4s infinite ease-in-out;
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.3);
    opacity: 1;
  }
}

.is-disabled .hint {
  color: #eaf5ef;
  opacity: 0.9;
  font-size: 0.9rem;
}

/* reveal triggers */
.is-disabled:hover::after,
.is-disabled:focus-visible::after,
.is-disabled.touch-reveal::after {
  opacity: 1;
}
.is-disabled:hover .coming-soon,
.is-disabled:focus-visible .coming-soon,
.is-disabled.touch-reveal .coming-soon {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* disable link-like hover lift for disabled card */
.is-disabled:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* —— Responsive —— */
@media (max-width: 768px) {
  .home-container {
    padding: calc(64px + env(safe-area-inset-top)) 16px 24px;
    align-items: stretch;
    text-align: left;
  }
  .main-title {
    font-size: 2rem;
    line-height: 1.2;
    margin-bottom: 12px;
    text-align: left;
  }
  .subtitle {
    font-size: 1.1rem;
    margin-bottom: 24px;
    font-weight: 500;
    opacity: 0.95;
    text-align: left;
  }
  .therapy-options {
    gap: 16px;
    justify-content: stretch;
  }
  .therapy-card {
    width: 100%;
    max-width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
  }
  .therapy-card img {
    height: 160px;
  }
  .therapy-info {
    padding: 14px;
    align-items: flex-start;
  }
  .therapy-info h3 {
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
  .therapy-info p {
    font-size: 0.95rem;
  }
  .helper-copy {
    font-size: 0.95rem;
    margin-top: 8px;
    text-align: center;
  }
}

@media (max-width: 360px) {
  .home-container {
    padding: calc(56px + env(safe-area-inset-top)) 12px 20px;
  }
  .main-title {
    font-size: 1.7rem;
  }
  .subtitle {
    font-size: 1rem;
  }
  .therapy-card img {
    height: 140px;
  }
}

/* Page entrance animation */
.home-page {
  opacity: 0;
  animation: pageFade 600ms ease-out forwards;
}
@keyframes pageFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.main-title,
.subtitle,
.therapy-options > .therapy-card {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  filter: blur(2px);
  will-change: transform, opacity, filter;
  animation: riseIn 720ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}
.main-title {
  animation-delay: 0.1s;
}
.subtitle {
  animation-delay: 0.22s;
}
.therapy-options > .therapy-card:nth-child(1) {
  animation-delay: 0.34s;
}
.therapy-options > .therapy-card:nth-child(2) {
  animation-delay: 0.44s;
}
.therapy-options > .therapy-card:nth-child(3) {
  animation-delay: 0.54s;
}
@keyframes riseIn {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
    filter: blur(2px);
  }
  60% {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: none;
    filter: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .home-page,
  .main-title,
  .subtitle,
  .therapy-options > .therapy-card {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}

.therapy-card {
  transform: translateY(0) !important;
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1),
    box-shadow 260ms ease !important;
  will-change: transform, box-shadow;
}

.therapy-card:hover,
.therapy-card:focus-within {
  transform: translateY(-12px) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25) !important;
}

.is-disabled:hover,
.is-disabled:focus-within {
  transform: translateY(-12px) !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25) !important;
}

.is-disabled:hover::after,
.is-disabled:focus-visible::after,
.is-disabled.touch-reveal::after {
  opacity: 1 !important;
}
.is-disabled:hover .coming-soon,
.is-disabled:focus-visible .coming-soon,
.is-disabled.touch-reveal .coming-soon {
  opacity: 1 !important;
  transform: translateY(0) scale(1) !important;
}
</style>
