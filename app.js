// ============================================================
// O.M.A.R — MOBILE ORCHESTRATOR (app.js) - RACCORDEMENT RÉEL
// Alignement sur les branches : nexus / system_status
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
    NEUTRAL:  { label: "NEUTRAL",  dotColor: "#C0C0C0", status: "Veille du Nexus..." },
    RISK_ON:  { label: "RISK_ON",  dotColor: "#D4AF37", status: "Expansion Institutionnelle." },
    HEDGE:    { label: "HEDGE",    dotColor: "#996515", status: "Protection activée." },
    RISK_OFF: { label: "RISK_OFF", dotColor: "#800000", status: "Retrait Stratégique." },
    CRISIS:   { label: "CRISIS",   dotColor: "#FF0000", status: "ALERTE SOUVERAINE." }
};

// --- LECTURE DES BRANCHES RÉELLES ---
function listenToNexus() {
    // 1. Branche NEXUS (Pour la décision et le régime)
    const nexusRef = ref(db, 'nexus');
    onValue(nexusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById("omar-decision-badge").textContent = data.decision || "NEUTRAL";
            document.getElementById("omar-regime").textContent = data.regime || "STABLE";
            
            const cfg = decisionConfig[data.decision] || decisionConfig.NEUTRAL;
            document.getElementById("omar-status-dot").style.backgroundColor = cfg.dotColor;
            document.getElementById("omar-status-text").textContent = cfg.status;
        }
    });

    // 2. Branche SYSTEM_STATUS (Pour l'index et le stress)
    const statusRef = ref(db, 'system_status');
    onValue(statusRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            document.getElementById("omar-index").textContent = data.omar_index || data.risk_score || "0";
            document.getElementById("omar-stress").textContent = (data.stress_level || 0).toFixed(2) + "%";
            document.getElementById("omar-last-update").textContent = `Sync: ${new Date().toLocaleTimeString("fr-CA")}`;
        }
    });
}

function initCouncil() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');

    const sendMessage = () => {
        const text = userInput.value.trim();
        if (text) {
            // On envoie dans EVENTS pour que le démon les traite
            push(ref(db, 'events/messages'), {
                sender: "Monsieur",
                content: text,
                timestamp: serverTimestamp()
            });
            userInput.value = "";
        }
    };

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (userInput) userInput.addEventListener('keypress', (e) => { if(e.key === 'Enter') sendMessage(); });

    // Réponses d'OMAR
    onValue(ref(db, 'events/replies'), (snapshot) => {
        const data = snapshot.val();
        if (data && chatHistory) {
            chatHistory.innerHTML = ""; 
            Object.values(data).slice(-5).forEach(msg => {
                const div = document.createElement('div');
                div.className = msg.sender === "OMAR" ? "bot-msg" : "user-msg";
                div.textContent = msg.content;
                chatHistory.appendChild(div);
            });
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    listenToNexus();
    initCouncil();
});
