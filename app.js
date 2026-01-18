// ============================================================
// O.M.A.R — MOBILE ORCHESTRATOR (app.js)
// Pilotage du Miroir et du Conseil Souverain
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

const decisionConfig = {
    NEUTRAL:  { label: "NEUTRAL",  dotColor: "#888", status: "Analyse du Nexus..." },
    RISK_ON:  { label: "RISK_ON",  dotColor: "#25d366", status: "Climat favorable à l'expansion." },
    HEDGE:    { label: "HEDGE",    dotColor: "#f5c542", status: "Protection du capital activée." },
    RISK_OFF: { label: "RISK_OFF", dotColor: "#ff914d", status: "Prudence recommandée." },
    CRISIS:   { label: "CRISIS",   dotColor: "#ff4b4b", status: "ALERTE SOUVERAINE." }
};

// --- LOGIQUE DU MIROIR (Lecture Seule) ---
function listenToNexus() {
    const nexusRef = ref(db, 'operational/hud_snapshot');
    onValue(nexusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            state.decision = data.decision || "NEUTRAL";
            state.omarIndex = data.risk?.risk_score || 0;
            state.regime = data.macro?.regime || "STABLE";
            state.stress = data.risk?.stress_level || 0;
            state.lastUpdate = new Date();
            renderMirror();
        }
    });
}

function renderMirror() {
    const cfg = decisionConfig[state.decision] || decisionConfig.NEUTRAL;
    
    document.getElementById("omar-decision-badge").textContent = cfg.label;
    document.getElementById("omar-index").textContent = state.omarIndex;
    document.getElementById("omar-regime").textContent = state.regime;
    document.getElementById("omar-stress").textContent = state.stress.toFixed(2) + "%";
    document.getElementById("omar-status-dot").style.backgroundColor = cfg.dotColor;
    document.getElementById("omar-status-text").textContent = cfg.status;
    
    if (state.lastUpdate) {
        document.getElementById("omar-last-update").textContent = 
            `Dernière mise à jour : ${state.lastUpdate.toLocaleTimeString("fr-CA")}`;
    }
}

// --- LOGIQUE DU CONSEIL (Dialogue) ---
function initCouncil() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    // Envoi de message
    const sendMessage = () => {
        const text = userInput.value.trim();
        if (text) {
            push(ref(db, 'interactions/messages'), {
                sender: "Monsieur",
                content: text,
                timestamp: serverTimestamp()
            });
            userInput.value = "";
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });

    // Écoute des réponses d'OMAR
    const chatRef = ref(db, 'interactions/replies');
    onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            chatHistory.innerHTML = ""; // Rafraîchir l'historique
            Object.values(data).forEach(msg => {
                const div = document.createElement('div');
                div.className = msg.sender === "OMAR" ? "bot-msg" : "user-msg";
                div.textContent = msg.content;
                chatHistory.appendChild(div);
            });
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    });
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", () => {
    listenToNexus();
    initCouncil();
});
