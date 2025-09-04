<template>
  <div class="min-h-screen cursor-none">
    <CursorBuddy />
    <CursorTrail />
    <router-view />
  </div>
</template>

<script setup>
import CursorBuddy from "@/components/CursorBuddy.vue";
import CursorTrail from "@/components/CursorTrail.vue";
</script>
