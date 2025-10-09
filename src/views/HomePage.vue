<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue";
import Header from "@/components/Header.vue";
import TipBar from "@/components/TipBar.vue";

import MHAD from "@/assets/gif/MentalHealth.gif";
import Breath from "@/assets/gif/CalmBreath.gif";
import Location from "@/assets/gif/Location.gif";
import Brain from "@/assets/gif/Brain.gif";
import Data from "@/assets/gif/Data.gif";
import Dance from "@/assets/gif/Dance.gif";
import Game from "@/assets/gif/Game.gif";

/** Swiper */
import { Swiper, SwiperSlide } from "swiper/vue";
import {
  Navigation,
  Pagination,
  Autoplay,
  Keyboard,
  A11y,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const moodCardRef = ref(null);
let hideTimer;
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

/** Swiper 配置 */
const modules = [Navigation, Pagination, Autoplay, Keyboard, A11y];
const breakpoints = {
  0: { slidesPerView: 1, spaceBetween: 14, centeredSlides: true },
  640: { slidesPerView: 1.2, spaceBetween: 18, centeredSlides: true },
  768: { slidesPerView: 2, spaceBetween: 22, centeredSlides: false },
  1024: { slidesPerView: 3, spaceBetween: 26 },
  1400: { slidesPerView: 3, spaceBetween: 30 },
};
</script>

<template>
  <div class="home-page">
    <Header />
    <TipBar />

    <main class="home-container">
      <!-- <div class="mhad-banner">
        <img :src="MHAD" alt="Mental Health Action Day" />
      </div> -->

      <h1 class="main-title">Find Your Calm Today</h1>
      <h2 class="subtitle">Choose a way to restore your mind</h2>

      <!-- Swiper 轮播区 -->
      <Swiper
        class="therapy-swiper"
        :modules="modules"
        :loop="true"
        :autoplay="{ delay: 3800, disableOnInteraction: false }"
        :pagination="{ clickable: true, dynamicBullets: true }"
        :navigation="true"
        :keyboard="{ enabled: true, onlyInViewport: true }"
        :breakpoints="breakpoints"
        aria-label="Therapy modules carousel"
      >
        <SwiperSlide>
          <router-link to="/ai-predict" class="therapy-card">
            <img :src="Brain" alt="AI Predict" />
            <div class="therapy-info">
              <h3>AI Predict</h3>
              <p>Personalized insights and recommendations</p>
            </div>
          </router-link>
        </SwiperSlide>

        <SwiperSlide>
          <router-link
            to="/about/health-insights"
            class="therapy-card insights-card"
          >
            <img :src="Location" alt="Health Insights" />
            <div class="therapy-info">
              <h3>Health Insights</h3>
              <p>Evidence-based notes on risks & wellbeing</p>
            </div>
          </router-link>
        </SwiperSlide>

        <SwiperSlide>
          <router-link to="/breathing" class="therapy-card">
            <img :src="Breath" alt="Breathing Space" />
            <div class="therapy-info">
              <h3>Breathing Space</h3>
              <p>Follow the rhythm and release stress</p>
            </div>
          </router-link>
        </SwiperSlide>

        <SwiperSlide>
          <router-link to="/flip-cards" class="therapy-card">
            <img src="@/assets/imgs/home2.png" alt="Positive Flip Cards" />
            <div class="therapy-info">
              <h3>Positive Flip Cards</h3>
              <p>Turn negative thoughts into positive ones</p>
            </div>
          </router-link>
        </SwiperSlide>

        <SwiperSlide>
          <router-link to="/metrics" class="therapy-card">
            <img :src="Data" alt="Mind Observatory" />
            <div class="therapy-info">
              <h3>Mind Observatory</h3>
              <p>Let data speak</p>
            </div>
          </router-link>
        </SwiperSlide>

        <SwiperSlide>
          <router-link to="/music" class="therapy-card">
            <img :src="Dance" alt="Mood Collage" />
            <div class="therapy-info">
              <h3>Mood Collage</h3>
              <p>Listening music</p>
            </div>
          </router-link>
        </SwiperSlide>

        <SwiperSlide>
          <router-link to="/game" class="therapy-card">
            <img :src="Game" alt="Mind Game" />
            <div class="therapy-info">
              <h3>Mind Game</h3>
              <p>Train focus and relax with fun interactions</p>
            </div>
          </router-link>
        </SwiperSlide>
      </Swiper>

      <div class="helper-copy">
        Not sure where to start? Just pick the one you feel like today.
      </div>
    </main>
  </div>
</template>

<style scoped>
/* —— 你的原有样式基础上稍作调整以适配 Swiper —— */

.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #325343;
  color: #fff;
  overflow-x: hidden;
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

.home-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 20px 60px;
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
  margin-bottom: 28px;
  font-weight: 500;
}

/* —— Swiper 容器 —— */
.therapy-swiper {
  width: 100%;
  max-width: 1600px;
  padding: 10px 12px 36px;
}

/* Swiper 导航按钮微调（可按需自定义） */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  color: #ffffff;
  --swiper-navigation-size: 26px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
}
:deep(.swiper-pagination-bullet) {
  background: rgba(255, 255, 255, 0.6);
}
:deep(.swiper-pagination-bullet-active) {
  background: #ffffff;
}

/* —— 卡片 —— */
.therapy-card {
  position: relative;
  background: #fff;
  color: #333;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
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
  margin-top: 10px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .home-container {
    padding: calc(64px + env(safe-area-inset-top)) 12px 24px;
  }
  .main-title {
    font-size: 2rem;
    margin-bottom: 12px;
    text-align: center;
  }
  .subtitle {
    font-size: 1.1rem;
    margin-bottom: 18px;
    text-align: center;
  }
  .therapy-card {
    height: auto;
  }
  .therapy-card img {
    height: 170px;
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
}

/* 可选：进入动画 */
.main-title,
.subtitle,
:deep(.swiper) {
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
:deep(.swiper) {
  animation-delay: 0.34s;
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
  :deep(.swiper) {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
</style>
