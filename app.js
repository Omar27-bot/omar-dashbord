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

// --- FONCTION DE SYNCHRONISATION DU NEXUS ---
function startNexusSync() {
    // 1. Branche Cognitive (Décision et Scénarios)
    const cogRef = ref(db, 'nexus/orchestrator/cognitive');
    onValue(cogRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Mise à jour de la Décision
            const decision = data.council_crystal_decision || "ACTIF";
            document.getElementById("omar-decision-badge").textContent = decision;
            document.getElementById("omar-status-text").textContent = "CRISTAL : " + decision;

            // Mise à jour via Scénarios (Index et Régime)
            if (data.scenarios) {
                const scn = data.scenarios[1] || data.scenarios[0];
                if (scn) {
                    document.getElementById("omar-regime").textContent = scn.title || scn.status;
                    document.getElementById("omar-index").textContent = (scn.score * 100).toFixed(0);
                }
            }
            document.getElementById("omar-last-update").textContent = "SYNCHRONISÉ : " + new Date().toLocaleTimeString();
        }
    });

    // 2. Branche Status Technique (Stress)
    onValue(ref(db, 'system_status'), (snapshot) => {
        const sys = snapshot.val();
        if (sys) {
            document.getElementById("omar-stress").textContent = (sys.stress_level || 0).toFixed(2) + "%";
            if (sys.omar_index) document.getElementById("omar-index").textContent = sys.omar_index;
        }
    });
}

// --- FONCTION DE CHAT (EVENTS) ---
function startChatSync() {
    const input = document.getElementById('user-input');
    const btn = document.getElementById('send-btn');
    const history = document.getElementById('chat-history');

    // Envoi d'un message
    btn.onclick = () => {
        if (!input.value.trim()) return;
        push(ref(db, 'events/messages'), {
            sender: "Monsieur",
            content: input.value,
            timestamp: serverTimestamp()
        });
        input.value = "";
    };

    // Lecture des messages et réponses
    onValue(ref(db, 'events'), (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        
        history.innerHTML = "";
        let combined = [];
        if (data.messages) Object.values(data.messages).forEach(m => combined.push({...m, role: 'user'}));
        if (data.replies) Object.values(data.replies).forEach(r => combined.push({...r, role: 'bot'}));
        
        // Tri par temps et affichage des 10 derniers
        combined.sort((a,b) => a.timestamp - b.timestamp).slice(-10).forEach(msg => {
            const div = document.createElement('div');
            div.className = msg.role === 'bot' ? 'bot-msg' : 'user-msg';
            div.innerHTML = `<strong>${msg.sender}:</strong> ${msg.content}`;
            history.appendChild(div);
        });
        history.scrollTop = history.scrollHeight;
    });
}

// Initialisation globale
document.addEventListener("DOMContentLoaded", () => {
    startNexusSync();
    startChatSync();
});
