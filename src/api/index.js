async function request(url, opts) {
    const r = await fetch(url, opts);
    if (!r.ok) throw new Error(await r.text());
    return r.json();
}

const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");
const full = (path) => `${BASE}${path.startsWith("/") ? path : `/${path}`}`;

const getJSON = (path) => request(full(path));
const postForm = (path, formData) =>
    request(full(path), { method: "POST", body: formData });

//ai
const postJSON = (path, payload) =>
    request(full(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

export const api = {
    health: () => getJSON("/health"),

    randomTip: (mood) =>
        getJSON(`/api/tips/random${mood ? `?mood=${encodeURIComponent(mood)}` : ""}`),

    flipCards: (limit = 12) => getJSON(`/api/flip-cards?limit=${limit}`),

    openMeteo: (lat, lon) => getJSON(`/api/open-meteo?lat=${lat}&lon=${lon}`),

    airQuality: (lat, lon) => getJSON(`/api/air-quality?lat=${lat}&lon=${lon}`),

    daylight: (lat, lon) => getJSON(`/api/daylight?lat=${lat}&lon=${lon}`),

    // keep
    speechAnalyze(file) {
        const fd = new FormData();
        fd.append("file", file, file?.name || "audio.wav");
        return postForm("/api/speech/analyze", fd);
    },

    aiPredictJson(records) {
        return postJSON("/api/ai/predict-json", records);
    },

    aiPredictXlsx(file) {
        const fd = new FormData();
        fd.append("file", file, file?.name || "data.xlsx");
        return postForm("/api/ai/predict-xlsx", fd);
    },

    // 精准命中后端的 /api/search-disease
    searchHealthImpact(query, { limit = 30, offset = 0 } = {}) {
        const q = (query ?? "").trim();
        if (!q) return Promise.resolve({ items: [], total: 0, count: 0, limit, offset });

        const params = new URLSearchParams({ q, limit, offset });
        return getJSON(`/api/search-disease?${params.toString()}`);
    },


};


export default api;
