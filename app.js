// ============================================================
// O.M.A.R — MOBILE ORCHESTRATOR (app.js) - RACCORDEMENT PROFOND
// Alignement chirurgical sur : nexus/orchestrator/cognitive
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg",
    authDomain: "omar-system.firebaseapp.com",
    databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
    projectId: "omar-system",
    storageBucket: "omar-system.firebasestorage.app",
    messagingSenderId: "571385162146",
    appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb",
    measurementId: "G-8KMSZ5DVSS"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const decisionConfig = {
    "Surveillance": { label: "SURVEILLANCE", dotColor: "#C0C0C0", status: "Analyse des tensions en cours..." },
    "Alerte":       { label: "ALERTE",       dotColor: "#FF914D", status: "Volatilité détectée sur le Nexus." },
    "SOUVERAIN":    { label: "SOUVERAIN",    dotColor: "#D4AF37", status: "Décision du Conseil Souverain." },
    "NEUTRAL":      { label: "NEUTRAL",      dotColor: "#888",    status: "Veille stratégique active." }
};

function listenToNexus() {
    // --- 1. LE COEUR STRATÉGIQUE (La zone qui bloquait) ---
    // On descend dans l'arborescence : nexus > orchestrator > cognitive
    const cognitiveRef = ref(db, 'nexus/orchestrator/cognitive');
    
    onValue(cognitiveRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // On récupère la décision du Cristal du Conseil
            const decision = data.council_crystal_decision || "NEUTRAL";
            
            // Mise à jour des labels
            const badge = document.getElementById("omar-decision-badge");
            const statusText = document.getElementById("omar-status-text");
            const dot = document.getElementById("omar-status-dot");

            if (badge) badge.textContent = decision;
            
            // On applique le thème Or et Noir selon la décision
            const cfg = decisionConfig[decision] || decisionConfig.NEUTRAL;
            if (dot) dot.style.backgroundColor = cfg.dotColor;
            if (statusText) statusText.textContent = cfg.status;
            
            // Mise à jour du régime via le premier scénario (Ex: Volatilité crypto)
            if (data.scenarios && data.scenarios[1]) {
                const regimeEl = document.getElementById("omar-regime");
                if (regimeEl) regimeEl.textContent = data.scenarios[1].status;
            }
        }
    });

    // --- 2. LE STATUS TECHNIQUE ---
    const statusRef = ref(db, 'system_status');
    onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const indexEl = document.getElementById("omar-index");
            const stressEl = document.getElementById("omar-stress");
            
            if (indexEl) indexEl.textContent = data.omar_index || "0";
            if (stressEl) stressEl.textContent = (data.stress_level || 0).toFixed(2) + "%";
        }
    });
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("O.M.A.R : Raccordement au Conseil Souverain...");
    listenToNexus();
    // initCouncil() reste identique à votre version précédente
});
