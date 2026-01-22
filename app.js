// ============================================================
// O.M.A.R — MOBILE ORCHESTRATOR (app.js) - VERSION CORRIGÉE
// Pilotage du Miroir et du Conseil Souverain - MODE INSTITUTIONNEL
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

// --- ÉTAT GLOBAL ---
const state = {
    profile: "SOUVERAIN",
    decision: "NEUTRAL",
    omarIndex: 0,
    regime: "INITIALISATION",
    stress: 0,
    lastUpdate: null
};

// --- CONFIGURATION INSTITUTIONNELLE (NOIR ET OR) ---
const decisionConfig = {
    NEUTRAL:  { label: "NEUTRAL",  dotColor: "#C0C0C0", status: "Analyse du Nexus en cours..." },
    RISK_ON:  { label: "RISK_ON",  dotColor: "#D4AF37", status: "Marché favorable : Expansion active." }, // Or Premium
    HEDGE:    { label: "HEDGE",    dotColor: "#996515", status: "Couverture de sécurité déployée." },    // Or Profond
    RISK_OFF: { label: "RISK_OFF", dotColor: "#800000", status: "Prudence : Retrait stratégique." },      // Bordeaux Banquier
    CRISIS:   { label: "CRISIS",   dotColor: "#FF0000", status: "ALERTE : Protection Souveraine !" }
};

// --- LOGIQUE DU MIROIR (Lecture du Flux Vivant) ---
function listenToNexus() {
    // Le chemin doit être identique à celui écrit par le démon Python
    const nexusRef = ref(db, 'operational/hud_snapshot');
    
    onValue(nexusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Mise à jour de l'état avec repli sécurisé (fallback)
            state.decision = data.decision || "NEUTRAL";
            state.omarIndex = (data.risk && data.risk.risk_score) ? data.risk.risk_score : 0;
            state.regime = (data.macro && data.macro.regime) ? data.macro.regime : "STABLE";
            state.stress = (data.risk && data.risk.stress_level) ? data.risk.stress_level : 0;
            state.lastUpdate = new Date();
            
            renderMirror();
        } else {
            console.warn("Nexus : En attente de données de synchronisation...");
        }
    }, (error) => {
        console.error("Erreur de raccordement Firebase :", error);
    });
}

function renderMirror() {
    const cfg = decisionConfig[state.decision] || decisionConfig.NEUTRAL;
    
    // Mise à jour du DOM
    const elements = {
        "omar-decision-badge": cfg.label,
        "omar-index": state.omarIndex,
        "omar-regime": state.regime,
        "omar-stress": state.stress.toFixed(2) + "%",
        "omar-status-text": cfg.status
    };

    // Injection sécurisée
    for (const [id, value] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    const dot = document.getElementById("omar-status-dot");
    if (dot) dot.style.backgroundColor = cfg.dotColor;
    
    if (state.lastUpdate) {
        const timeEl = document.getElementById("omar-last-update");
        if (timeEl) {
            timeEl.textContent = `Nexus Synchronisé : ${state.lastUpdate.toLocaleTimeString("fr-CA")}`;
        }
    }
}

// --- LOGIQUE DU CONSEIL (Dialogue Institutionnel) ---
function initCouncil() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    const sendMessage = () => {
        const text = userInput.value.trim();
        if (text) {
            // Envoi vers la file d'attente du Démon
            push(ref(db, 'interactions/messages'), {
                sender: "Monsieur",
                content: text,
                timestamp: serverTimestamp(),
                profile: state.profile
            });
            userInput.value = "";
        }
    };

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });

    // Écoute des réponses d'OMAR
    const chatRef = ref(db, 'interactions/replies');
    onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data && chatHistory) {
            chatHistory.innerHTML = ""; 
            Object.values(data).forEach(msg => {
                const div = document.createElement('div');
                div.className = msg.sender === "OMAR" ? "bot-msg" : "user-msg";
                div.style.borderLeft = msg.sender === "OMAR" ? "2px solid #D4AF37" : "none";
                div.textContent = msg.content;
                chatHistory.appendChild(div);
            });
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    });
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", () => {
    console.log("O.M.A.R HUD : Initialisation du raccordement Souverain...");
    listenToNexus();
    initCouncil();
});
