<template>
  <Header />
  <div class="music-page">
    <h2 class="music-title">Relaxing Music for Mental Wellness</h2>
    <p class="music-subtitle">Choose a track to calm your mind and unwind</p>

    <div class="gif-container">
      <img :src="RestGif" alt="Relaxing Animation" class="rest-gif" />
    </div>

    <div v-for="(track, index) in tracks" :key="index" class="music-card">
      <div class="music-info">
        <h3>{{ track.title }}</h3>
        <audio :src="track.src" controls class="audio-player"></audio>
      </div>

      <a :href="track.src" download>
        <button class="download-btn">Download</button>
      </a>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import RestGif from "@/assets/gif/Rest.gif";

const tracks = [
  {
    title: "Forest Meditation",
    src: new URL("@/assets/music/forest-meditation.mp3", import.meta.url).href,
  },
  {
    title: "Calm Ocean Waves",
    src: new URL("@/assets/music/calm-ocean.mp3", import.meta.url).href,
  },
  {
    title: "Soft Piano Journey",
    src: new URL("@/assets/music/soft-piano.mp3", import.meta.url).href,
  },
  {
    title: "Deep Breath Flow",
    src: new URL("@/assets/music/deep-breath.mp3", import.meta.url).href,
  },
  {
    title: "Mind Balance",
    src: new URL("@/assets/music/mind-balance.mp3", import.meta.url).href,
  },
];
</script>

<style scoped>
.music-page {
  padding: 3rem 2rem;
  background-color: #113d2f;
  color: #ffffff;
  min-height: 100vh;
  text-align: center;
}

.music-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.music-subtitle {
  margin-bottom: 2rem;
  font-size: 1rem;
  opacity: 0.85;
}

.gif-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.rest-gif {
  width: 240px;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  animation: fadeIn 2s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.music-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  color: #113d2f;
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem auto;
  max-width: 700px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.music-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.music-info {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.audio-player {
  width: 100%;
  accent-color: #3c7d66;
  border-radius: 8px;
}

.download-btn {
  align-self: flex-end;
  margin-top: 1rem;
  background: #3c7d66;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.4rem;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.3s ease, transform 0.2s ease;
}

.download-btn:hover {
  background: #2d5d50;
  transform: scale(1.05);
}
</style>
