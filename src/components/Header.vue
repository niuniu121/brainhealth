<script setup>
import { computed, onMounted, ref, watch } from "vue";
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

//mobile drawer
const mobileOpen = ref(false);
const open = ref({ services: false, about: false, comm: false });

function toggle(key) {
  open.value[key] = !open.value[key];
}
function closeMobile() {
  mobileOpen.value = false;
}
function toAdmin() {
  closeMobile();
  go({ name: "adminView" });
}

watch(mobileOpen, (v) => {
  document.documentElement.style.overflow = v ? "hidden" : "";
});

//close
router.afterEach(() => {
  mobileOpen.value = false;
  open.value = { services: false, about: false, comm: false };
});
</script>

<template>
  <header class="site-header">
    <div class="nav-wrap">
      <button class="brand" @click="go({ name: 'home' })" aria-label="Go home">
        <img :src="logoUrl" alt="logo" />
        <span class="brand-text">Mental help</span>
      </button>

      <nav class="menu desktop" aria-label="Primary">
        <div class="menu-item">
          <button class="menu-button" type="button">Services</button>
          <div class="dropdown" role="menu">
            <RouterLink class="dd-item" to="/MentalTestView">Mental</RouterLink>
            <a class="dd-item" href="#">Health Course</a>
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

      <!-- hamburger -->
      <button
        class="hamburger"
        :aria-expanded="mobileOpen"
        aria-controls="mobileNav"
        aria-label="Menu"
        @click="mobileOpen = !mobileOpen"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <transition name="fade">
      <div v-if="mobileOpen" class="backdrop" @click="closeMobile"></div>
    </transition>

    <!-- mobile  -->
    <transition name="slide">
      <nav
        v-if="mobileOpen"
        id="mobileNav"
        class="drawer"
        @keydown.esc="closeMobile"
      >
        <div class="drawer-head">
          <span>Menu</span>
          <button class="close" aria-label="Close" @click="closeMobile">
            ×
          </button>
        </div>

        <ul class="m-list" role="menu">
          <li class="m-item">
            <button
              class="m-toggle"
              :aria-expanded="open.services"
              @click="toggle('services')"
            >
              Services
              <i :class="['chev', { open: open.services }]"></i>
            </button>
            <div class="m-sub" v-show="open.services">
              <RouterLink
                class="m-link"
                to="/MentalTestView"
                @click="closeMobile"
                >Mental</RouterLink
              >
              <a class="m-link" href="#" @click="closeMobile">Health Course</a>
            </div>
          </li>

          <li class="m-item">
            <button
              class="m-toggle"
              :aria-expanded="open.about"
              @click="toggle('about')"
            >
              About
              <i :class="['chev', { open: open.about }]"></i>
            </button>
            <div class="m-sub" v-show="open.about">
              <a class="m-link" href="/searchLocation" @click="closeMobile"
                >Description</a
              >
            </div>
          </li>

          <li class="m-item">
            <button
              class="m-toggle"
              :aria-expanded="open.comm"
              @click="toggle('comm')"
            >
              Communication
              <i :class="['chev', { open: open.comm }]"></i>
            </button>
            <div class="m-sub" v-show="open.comm">
              <RouterLink class="m-link" to="/SharingView" @click="closeMobile"
                >Sharing</RouterLink
              >
            </div>
          </li>

          <li v-if="isAdmin" class="m-item">
            <button class="m-link strong" @click="toAdmin">Management</button>
          </li>
        </ul>
      </nav>
    </transition>
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

.menu.desktop {
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

.hamburger {
  display: none;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: transparent;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.hamburger span {
  display: block;
  width: 20px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
}
.hamburger:hover {
  background: rgba(255, 255, 255, 0.08);
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 98;
}
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(86vw, 360px);
  background: #29483b;
  color: #fff;
  z-index: 99;
  box-shadow: -12px 0 32px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
}
.drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 700;
}
.close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  cursor: pointer;
}
.close:hover {
  background: rgba(255, 255, 255, 0.08);
}

.m-list {
  padding: 10px 6px 18px;
  overflow: auto;
}
.m-item {
  padding: 6px 8px;
}
.m-toggle {
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  color: #fff;
  font-weight: 700;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.m-toggle:hover {
  background: rgba(255, 255, 255, 0.08);
}
.chev {
  width: 10px;
  height: 10px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg);
  transition: transform 0.15s ease;
}
.chev.open {
  transform: rotate(45deg);
}

.m-sub {
  padding: 6px 6px 12px 6px;
}
.m-link {
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  text-decoration: none;
  color: #eafff5;
}
.m-link:hover {
  background: rgba(255, 255, 255, 0.08);
}
.m-link.strong {
  font-weight: 700;
}

@media (max-width: 860px) {
  .menu.desktop {
    display: none;
  }
  .hamburger {
    display: inline-flex;
  }
  .nav-wrap {
    height: 64px;
    padding: 0 16px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.22s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}

/* animate */
.brand-text {
  background: linear-gradient(90deg, #fff 0%, #e7fff5 50%, #fff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% 100%;
  transition: background-position 0.6s ease;
}
.brand:hover .brand-text {
  background-position: 100% 0;
}

.menu-button {
  position: relative;
}
.menu-button::after {
  content: "";
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 4px;
  height: 2px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 2px;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.18s ease;
}
.menu-button:hover::after,
.menu-item:focus-within .menu-button::after {
  transform: scaleX(1);
}

@keyframes dd-pop {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.menu-item:hover .dropdown,
.menu-item:focus-within .dropdown {
  animation: dd-pop 0.16s ease-out;
}

.hamburger {
  transition: transform 0.18s ease, background 0.18s ease;
}
.hamburger:hover {
  transform: translateY(-1px);
}
.hamburger:active {
  transform: translateY(0) scale(0.98);
}
.hamburger span {
  transition: transform 0.18s ease, opacity 0.18s ease;
}
.hamburger:hover span:nth-child(2) {
  transform: translateX(2px);
}
.hamburger:hover span:nth-child(1),
.hamburger:hover span:nth-child(3) {
  transform: translateX(-2px);
}

@keyframes header-glow {
  0%,
  100% {
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08),
      inset 0 0 0 0 rgba(167, 225, 192, 0);
  }
  50% {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12),
      inset 0 -1px 0 0 rgba(167, 225, 192, 0.18);
  }
}
.site-header {
  animation: header-glow 6s ease-in-out infinite;
}

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateX(6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.drawer .m-item {
  animation: item-in 0.22s ease both;
}
.drawer .m-item:nth-child(1) {
  animation-delay: 0.1s;
}
.drawer .m-item:nth-child(2) {
  animation-delay: 0.2s;
}
.drawer .m-item:nth-child(3) {
  animation-delay: 0.24s;
}
.drawer .m-item:nth-child(4) {
  animation-delay: 0.26s;
}

/* animate */
.site-header {
  opacity: 0;
  will-change: opacity;
  animation: headerFadeIn 420ms ease-out forwards,
    header-glow 6s ease-in-out infinite;
}

@keyframes headerFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.nav-wrap > .brand,
.nav-wrap > .menu.desktop,
.nav-wrap > .hamburger {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
  filter: blur(1px);
  will-change: opacity, transform, filter;
  animation: headerBits 560ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

@keyframes headerBits {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
    filter: blur(1px);
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

.nav-wrap > .brand {
  animation-delay: 0.1s;
}
.nav-wrap > .menu.desktop {
  animation-delay: 0.2s;
}
.nav-wrap > .hamburger {
  animation-delay: 0.28s;
}

@media (prefers-reduced-motion: reduce) {
  .site-header,
  .nav-wrap > .brand,
  .nav-wrap > .menu.desktop,
  .nav-wrap > .hamburger {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
}
</style>
