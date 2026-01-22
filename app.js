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

// --- MIROIR TEMPS RÉEL ---
function startNexusSync() {
    const cognitivePath = ref(db, 'nexus/orchestrator/cognitive');
    
    onValue(cognitivePath, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // 1. Badge et Directive
            const decision = data.council_crystal_decision || "VEILLE";
            document.getElementById("omar-decision-badge").textContent = decision;
            document.getElementById("omar-status-text").textContent = "Conseil Souverain : " + decision;

            // 2. Scénarios (Risque et Régime)
            if (data.scenarios && data.scenarios[1]) {
                const global = data.scenarios[1];
                document.getElementById("omar-index").textContent = (global.score * 100).toFixed(0);
                document.getElementById("omar-regime").textContent = global.title;
            }
            
            document.getElementById("omar-last-update").textContent = "Sync: " + new Date().toLocaleTimeString();
        }
    });

    // Branche technique
    onValue(ref(db, 'system_status'), (snapshot) => {
        const status = snapshot.val();
        if (status) {
            document.getElementById("omar-stress").textContent = (status.stress_level || 0).toFixed(2) + "%";
            // Si l'index n'est pas dans les scénarios, on le prend ici
            if (status.omar_index) document.getElementById("omar-index").textContent = status.omar_index;
        }
    });
}

// --- CONSEIL (CHAT) ---
function startChatSync() {
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

    onValue(ref(db, 'events'), (snapshot) => {
        const events = snapshot.val();
        if (!events) return;
        history.innerHTML = "";
        let msgs = [];
        if (events.messages) Object.values(events.messages).forEach(m => msgs.push({...m, type: 'user'}));
        if (events.replies) Object.values(events.replies).forEach(r => msgs.push({...r, type: 'bot'}));
        
        msgs.sort((a,b) => a.timestamp - b.timestamp).slice(-8).forEach(m => {
            const d = document.createElement('div');
            d.className = m.type === 'bot' ? 'bot-msg' : 'user-msg';
            d.innerHTML = `<strong>${m.sender}:</strong> ${m.content}`;
            history.appendChild(d);
        });
        history.scrollTop = history.scrollHeight;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    startNexusSync();
    startChatSync();
});
