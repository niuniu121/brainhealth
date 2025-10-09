import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import BreathingSpace from "../views/BreathingSpace.vue";
import FlipCards from "@/views/FlipCards.vue";
import SpeechCheck from "@/views/SpeechCheck.vue";
import CursorBuddyPage from "@/views/CursorBuddyPage.vue";
import AIPredict from "@/views/AIPredict.vue";
import MetricsDashboard from "../views/MetricsDashboard.vue";
import GameView from "../views/GameView.vue";

const routes = [
    { path: "/", name: "home", component: HomePage },
    { path: "/breathing", name: "BreathingSpace", component: BreathingSpace },
    { path: "/flip-cards", name: "FlipCards", component: FlipCards },
    { path: "/speech-check", name: "speech-check", component: SpeechCheck },
    { path: "/cursor-buddy", name: "cursor-buddy", component: CursorBuddyPage },
    { path: "/ai-predict", name: "aiPredict", component: AIPredict },
    {
        path: "/about/health-insights",
        name: "HealthInsights",
        component: () => import("../views/HealthInsights.vue"),
        meta: { title: "Health Insights" },
    },
    {
        path: "/metrics",
        name: "MetricsDashboard",
        component: () => import("@/views/MetricsDashboard.vue"),
    },
    {
        path: "/game",
        name: "Game",
        component: () => import("@/views/GameView.vue"),
    },
    {
        path: '/music',
        name: 'Music',
        component: () => import('@/views/MusicView.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
