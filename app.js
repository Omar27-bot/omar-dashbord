// ============================================================
// O.M.A.R — ZENITH MOBILE ORCHESTRATOR (app.js)
// Mode : Souverain / Institutionnel Premium
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

// --- CONFIGURATION DES ÉTATS (OR ET NOIR) ---
const UI_THEME = {
    "Alerte":      { color: "#D4AF37", label: "ALERTE SOUVERAINE", icon: "⚠️" },
    "Surveillance": { color: "#C0C0C0", label: "SURVEILLANCE", icon: "👁️" },
    "RISK_ON":     { color: "#D4AF37", label: "EXPANSION", icon: "📈" },
    "DEFAULT":     { color: "#888",    label: "ANALYSE", icon: "⚙️" }
};

// --- 1. VIE DU NEXUS (SYSTÈME ET SCÉNARIOS) ---
function syncNexusLife() {
    // Branche Cognitive (Le Cerveau)
    onValue(ref(db, 'nexus/orchestrator/cognitive'), (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        // Mise à jour de la Décision Centrale
        const decision = data.council_crystal_decision || "NEUTRAL";
        const theme = UI_THEME[decision] || UI_THEME["DEFAULT"];

        updateElement("omar-decision-badge", theme.label);
        updateElement("omar-status-text", `Conseil : ${decision}`);
        const dot = document.getElementById("omar-status-dot");
        if (dot) dot.style.backgroundColor = theme.color;

        // Injection des Scénarios dans la zone "Régime" ou "Alertes"
        if (data.scenarios) {
            const scenarioList = Object.values(data.scenarios);
            const mainScenario = scenarioList[1] || scenarioList[0]; // Priorité au Global
            updateElement("omar-regime", `${mainScenario.title} : ${mainScenario.status}`);
            updateElement("omar-index", (mainScenario.score * 100).toFixed(0));
        }
    });

    // Branche Status Technique
    onValue(ref(db, 'system_status'), (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        updateElement("omar-stress", (data.stress_level || 0).toFixed(2) + "%");
    });
}

// --- 2. O.M.A.R CHAT (LE CONSEIL SOUVERAIN) ---
function syncCouncilChat() {
    const chatHistory = document.getElementById('chat-history');
    if (!chatHistory) return;

    // Écoute des messages (Events)
    onValue(ref(db, 'events'), (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        chatHistory.innerHTML = ""; // Nettoyage pour fresh start

        // On fusionne et trie les messages et les réponses par timestamp
        const allMsgs = [];
        if (data.messages) Object.values(data.messages).forEach(m => allMsgs.push({...m, type: 'user'}));
        if (data.replies) Object.values(data.replies).forEach(r => allMsgs.push({...r, type: 'bot'}));
        
        allMsgs.sort((a, b) => a.timestamp - b.timestamp);

        allMsgs.slice(-6).forEach(msg => {
            const msgDiv = document.createElement('div');
            msgDiv.className = msg.type === 'bot' ? 'bot-msg' : 'user-msg';
            msgDiv.innerHTML = `
                <span style="color: #D4AF37; font-size: 0.7em;">${msg.sender || 'SYS'}</span><br>
                ${msg.content}
            `;
            chatHistory.appendChild(msgDiv);
        });
        chatHistory.scrollTop = chatHistory.scrollHeight;
    });
}

// --- HELPER FONCTION ---
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('fade-in'); // Animation de vie
        el.textContent = value;
        setTimeout(() => el.classList.remove('fade-in'), 500);
    }
}

// --- INITIALISATION ---
document.addEventListener("DOMContentLoaded", () => {
    syncNexusLife();
    syncCouncilChat();
    
    // Interaction Envoi
    const input = document.getElementById('user-input');
    const btn = document.getElementById('send-btn');
    
    const send = () => {
        if (!input.value.trim()) return;
        push(ref(db, 'events/messages'), {
            sender: "Monsieur",
            content: input.value,
            timestamp: serverTimestamp()
        });
        input.value = "";
    };

    if (btn) btn.onclick = send;
    if (input) input.onkeypress = (e) => { if(e.key === 'Enter') send(); };
});
