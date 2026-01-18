// ============================================================
// O.M.A.R — MOBILE MIRROR (app.js)
// Orchestrateur de l'interface de Monsieur
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Note : Monsieur, utilisez ici votre configuration CLIENT Firebase 
// pour éviter d'exposer la Private Key du compte de service.
const firebaseConfig =  {
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

// --- ÉTAT GLOBAL O.M.A.R ---
const state = {
    profile: "SOUVERAIN",
    decision: "NEUTRAL",
    omarIndex: 50,
    regime: "NEUTRAL",
    stress: 1.2,
    stressLevel: "STABLE",
    riskLevel: "MODERATE",
    lastUpdate: null,
    // Suivi spécifique de Monsieur
    assets: {
        symbol: "CVS.NE",
        shares: 0.5442
    }
};

const decisionConfig = {
    NEUTRAL:  { label: "NEUTRAL",  className: "decision-neutral",  statusText: "Analyse en cours...", dotColor: "#888" },
    RISK_ON:  { label: "RISK_ON",  className: "decision-risk-on",  statusText: "Conditions optimales pour CVS.NE.", dotColor: "#25d366" },
    HEDGE:    { label: "HEDGE",    className: "decision-hedge",    statusText: "Protection des actifs activée.", dotColor: "#f5c542" },
    RISK_OFF: { label: "RISK_OFF", className: "decision-risk-off",  statusText: "Réduction d'exposition suggérée.", dotColor: "#ff914d" },
    CRISIS:   { label: "CRISIS",   className: "decision-crisis",    statusText: "ALERTE SOUVERAINE : Sécurisation maximale.", dotColor: "#ff4b4b" }
};

// --- RÉFÉRENCES DOM ---
const elements = {
    card: document.getElementById("omar-card"),
    badge: document.getElementById("omar-decision-badge"),
    profile: document.getElementById("omar-profile-tag"),
    index: document.getElementById("omar-index"),
    regime: document.getElementById("omar-regime"),
    stress: document.getElementById("omar-stress"),
    statusDot: document.getElementById("omar-status-dot"),
    statusText: document.getElementById("omar-status-text"),
    lastUpdate: document.getElementById("omar-last-update"),
    assetRef: document.getElementById("omar-asset-info") // Nouveau champ pour CVS.NE
};

// --- LOGIQUE DE RENDU ---
function render() {
    const cfg = decisionConfig[state.decision] || decisionConfig.NEUTRAL;

    // Mise à jour visuelle (Mirroring)
    if(elements.card) {
        elements.card.className = `card ${cfg.className}`;
        elements.badge.textContent = cfg.label;
        elements.profile.textContent = `MODE: ${state.profile}`;
        elements.index.textContent = Math.round(state.omarIndex);
        elements.regime.textContent = state.regime;
        elements.stress.textContent = `${state.stress.toFixed(2)}%`;
        elements.statusDot.style.backgroundColor = cfg.dotColor;
        elements.statusText.textContent = cfg.statusText;
        
        if (state.lastUpdate) {
            elements.lastUpdate.textContent = `Mise à jour : ${state.lastUpdate.toLocaleTimeString("fr-CA")}`;
        }
    }
}

// --- SYNCHRONISATION TEMPS RÉEL ---
function listenToNexus() {
    const nexusRef = ref(db, 'operational/hud_snapshot');
    onValue(nexusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            state.decision = data.decision || "NEUTRAL";
            state.omarIndex = data.risk?.risk_score * 10 || 50;
            state.regime = data.macro?.regime || "NEUTRAL";
            state.lastUpdate = new Date();
            render();
        }
    });
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
    listenToNexus();
    render();
});
