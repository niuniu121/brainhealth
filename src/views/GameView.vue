<script setup>
import { ref } from "vue";
import MatchingLinesGame from "@/components/games/MatchingLinesGame.vue";
import StroopGame from "@/components/games/StroopGame.vue";
import Header from "@/components/Header.vue";

const activeTab = ref("lines"); // 'lines' | 'stroop'
</script>

<template>
  <Header></Header>
  <div class="game-page">
    <header class="hero">
      <h1>Mind Games</h1>
      <p class="sub">Train focus, learn coping skills, and have fun ✨</p>

      <nav class="tabs" role="tablist" aria-label="Mind games">
        <button
          :class="['tab', { active: activeTab === 'lines' }]"
          role="tab"
          :aria-selected="activeTab === 'lines'"
          @click="activeTab = 'lines'"
        >
          ① Coping Strategy Matching
        </button>

        <button
          :class="['tab', { active: activeTab === 'stroop' }]"
          role="tab"
          :aria-selected="activeTab === 'stroop'"
          @click="activeTab = 'stroop'"
        >
          ② Stroop Color Game
        </button>
      </nav>
    </header>

    <section class="panel">
      <MatchingLinesGame v-if="activeTab === 'lines'" />
      <StroopGame v-else />
    </section>
  </div>
</template>

<style scoped>
.game-page {
  min-height: 100vh;
  background: #325343;
  color: #fff;
  display: flex;
  flex-direction: column;
}
.hero {
  padding: 28px 16px;
  text-align: center;
}
.hero h1 {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 6px;
}
.sub {
  opacity: 0.9;
  margin: 0 0 16px;
}
.tabs {
  display: inline-flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.tab {
  background: #2a4639;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 10px 14px;
  border-radius: 999px;
  cursor: pointer;
}
.tab.active {
  background: #3f6d58;
}
.panel {
  padding: 16px;
  max-width: 1100px;
  margin: 0 auto 40px;
  width: 100%;
}
</style>
