<script setup>
import Header from "@/components/Header.vue";
import TipBar from "@/components/TipBar.vue";
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

        <div class="therapy-card">
          <img src="@/assets/imgs/home1.png" alt="Mood Collage" />
          <div class="therapy-info">
            <h3>Mood Collage</h3>
            <p>Express your feelings with colors</p>
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

/* —— Home 入口动画：整页淡入 —— */
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

/* animate */
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
</style>
