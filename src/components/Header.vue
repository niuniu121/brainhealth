<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import logoUrl from "@/assets/icons/icon.png";

const router = useRouter();
const isLoggedIn = ref(false);
const user = ref(null);

onMounted(() => {
  const stored = localStorage.getItem("loggedInUser");
  if (stored) {
    user.value = JSON.parse(stored);
    isLoggedIn.value = true;
  }
});

const isAdmin = computed(() => user.value && user.value.role === "Admin");

function go(target) {
  router.push(target);
}
</script>

<template>
  <header class="site-header">
    <div class="nav-wrap">
      <button class="brand" @click="go({ name: 'home' })" aria-label="Go home">
        <img :src="logoUrl" alt="logo" />
        <span class="brand-text">Mental help</span>
      </button>

      <nav class="menu" aria-label="Primary">
        <div class="menu-item">
          <button class="menu-button" type="button">Services</button>
          <div class="dropdown" role="menu">
            <RouterLink class="dd-item" to="/MentalTestView">Mental</RouterLink>
            <a class="dd-item" href="#">Health Course </a>
          </div>
        </div>

        <div class="menu-item">
          <button class="menu-button" type="button">About</button>
          <div class="dropdown" role="menu">
            <a class="dd-item" href="/searchLocation">Description</a>
          </div>
        </div>

        <div class="menu-item">
          <button class="menu-button" type="button">Communication</button>
          <div class="dropdown" role="menu">
            <RouterLink class="dd-item" to="/SharingView">Sharing</RouterLink>
          </div>
        </div>

        <button
          v-if="isAdmin"
          class="btn outline"
          @click="go({ name: 'adminView' })"
          title="Admin management"
        >
          Management
        </button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: #325343;
  color: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.site-header::after {
  content: "";
  display: block;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.nav-wrap {
  width: 100%;
  height: 64px;
  padding: 0 24px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
.brand img {
  height: 28px;
  width: 28px;
  object-fit: contain;
}
.brand-text {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.2px;
}

.menu {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 24px;
}

.menu-button {
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  padding: 8px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}
.menu-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-item {
  position: relative;
}
.menu-item .dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  display: none;
  min-width: 130px;
  padding: 8px;
  background: #fff;
  color: #1f2d2a;
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
}
.menu-item:hover .dropdown,
.menu-item:focus-within .dropdown {
  display: block;
}

.dd-item {
  display: block;
  padding: 10px 12px;
  border-radius: 8px;
  text-decoration: none;
  color: #1f2d2a;
}
.dd-item:hover {
  background: #f3f5f4;
}

.btn {
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: transparent;
  color: #fff;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.02s;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
.btn:active {
  transform: translateY(1px);
}

.btn.pill {
  border-color: transparent;
  background: #fff;
  color: #325343;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 999px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08), 0 6px 14px rgba(0, 0, 0, 0.12);
}

@media (max-width: 860px) {
  .nav-wrap {
    height: auto;
    padding: 10px 16px;
  }
  .menu {
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
</style>
