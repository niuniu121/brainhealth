import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import BreathingSpace from '../views/BreathingSpace.vue';
import FlipCards from '@/views/FlipCards.vue'
import SpeechCheck from "@/views/SpeechCheck.vue";

const routes = [
    { path: '/', name: 'home', component: HomePage },
    { path: '/breathing', name: 'BreathingSpace', component: BreathingSpace },
    { path: '/flip-cards', name: 'FlipCards', component: FlipCards },
    { path: "/speech-check", name: "speech-check", component: SpeechCheck }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router
