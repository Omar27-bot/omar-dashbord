import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg",
    authDomain: "omar-system.firebaseapp.com",
    databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
    projectId: "omar-system",
    storageBucket: "omar-system.firebasestorage.app",
    messagingSenderId: "571385162146",
    appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Thème de décision
const THEME = {
    "Alerte": { color: "#FF4B4B", msg: "Vigilance accrue requise." },
    "Surveillance": { color: "#D4AF37", msg: "Analyse des flux stable." },
    "Normal": { color: "#25D366", msg: "Opérations nominales." }
};

// --- SYNCHRONISATION DU MIROIR ---
function startMiroir() {
    const cognitiveRef = ref(db, 'nexus/orchestrator/cognitive');
    
    onValue(cognitiveRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // 1. Décision Cristal
            const decision = data.council_crystal_decision || "VEILLE";
            document.getElementById("omar-decision-badge").textContent = decision;
            
            // 2. Traitement des Scénarios (V11)
            if (data.scenarios && data.scenarios[1]) {
                const globalScn = data.scenarios[1];
                document.getElementById("omar-regime").textContent = globalScn.title;
                document.getElementById("omar-index").textContent = (globalScn.score * 100).toFixed(0);
                
                // Mise à jour de la directive basse
                const info = THEME[globalScn.status] || THEME["Surveillance"];
                document.getElementById("omar-status-text").textContent = `${globalScn.status} : ${info.msg}`;
                document.getElementById("omar-status-dot").style.backgroundColor = info.color;
            }

            document.getElementById("omar-last-update").textContent = new Date().toLocaleTimeString();
        }
    });

    // Branche technique
    onValue(ref(db, 'system_status'), (snapshot) => {
        const technical = snapshot.val();
        if (technical) {
            document.getElementById("omar-stress").textContent = (technical.stress_level || 0).toFixed(2) + "%";
        }
    });
}

// --- CONSEIL SOUVERAIN (CHAT) ---
function startCouncil() {
    const input = document.getElementById('user-input');
    const btn = document.getElementById('send-btn');
    const history = document.getElementById('chat-history');

    btn.onclick = () => {
        if (!input.value.trim()) return;
        push(ref(db, 'events/messages'), {
            sender: "Monsieur",
            content: input.value,
            timestamp: serverTimestamp()
        });
        input.value = "";
    };

    // Écoute des réponses combinées
    onValue(ref(db, 'events'), (snapshot) => {
        const events = snapshot.val();
        if (!events) return;
        
        history.innerHTML = "";
        let combined = [];
        if (events.messages) Object.values(events.messages).forEach(m => combined.push({...m, role: 'user'}));
        if (events.replies) Object.values(events.replies).forEach(r => combined.push({...r, role: 'bot'}));
        
        combined.sort((a,b) => a.timestamp - b.timestamp).slice(-10).forEach(msg => {
            const div = document.createElement('div');
            div.className = msg.role === 'bot' ? 'bot-msg' : 'user-msg';
            div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.content}`;
            history.appendChild(div);
        });
        history.scrollTop = history.scrollHeight;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    startMiroir();
    startCouncil();
});
