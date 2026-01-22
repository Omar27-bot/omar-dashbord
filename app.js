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

function startNexusSync() {
    // 1. Écoute de NEXUS_OUTPUT (Le résultat final pour le HUD)
    onValue(ref(db, 'nexus/nexus_output/hud'), (snapshot) => {
        const hud = snapshot.val();
        if (hud) {
            document.getElementById("omar-index").textContent = hud.global_bias || "NEUTRAL";
            document.getElementById("omar-decision-badge").textContent = hud.global_bias || "SOUVERAIN";
        }
    });

    // 2. Écoute de l'ORCHESTRATEUR (Régime et VIX)
    onValue(ref(db, 'nexus/orchestrator'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Régime Macro
            if (data.cognitive && data.cognitive.regime) {
                document.getElementById("omar-regime").textContent = data.cognitive.regime;
            }
            // VIX / Stress
            if (data.cognitive && data.cognitive.risk) {
                document.getElementById("omar-stress").textContent = data.cognitive.risk.vix || "--";
            }
            // Dernière Directive (Verdict du Conseil)
            if (data.cognitive && data.cognitive.council_verdict) {
                document.getElementById("omar-status-text").textContent = "Verdict : " + data.cognitive.council_verdict.decision;
            }
        }
    });

    // 3. Heartbeat (Santé du système)
    onValue(ref(db, 'system_status'), (snapshot) => {
        const status = snapshot.val();
        if (status) {
            const time = new Date(status.last_heartbeat).toLocaleTimeString();
            document.getElementById("omar-last-update").textContent = "Vivant: " + time;
        }
    });
}

// --- GESTION DU CHAT ---
function startChat() {
    const history = document.getElementById('chat-history');
    onValue(ref(db, 'events'), (snap) => {
        const data = snap.val();
        if (!data) return;
        history.innerHTML = "";
        let msgs = [];
        if (data.messages) Object.values(data.messages).forEach(m => msgs.push({...m, type: 'user'}));
        if (data.replies) Object.values(data.replies).forEach(r => msgs.push({...r, type: 'bot'}));
        
        msgs.sort((a,b) => a.timestamp - b.timestamp).slice(-10).forEach(m => {
            const div = document.createElement('div');
            div.className = m.type === 'bot' ? 'bot-msg' : 'user-msg';
            div.innerHTML = `<strong>${m.sender || 'OMAR'}:</strong> ${m.content}`;
            history.appendChild(div);
        });
        history.scrollTop = history.scrollHeight;
    });

    document.getElementById('send-btn').onclick = () => {
        const inp = document.getElementById('user-input');
        if (inp.value) {
            push(ref(db, 'events/messages'), { sender: "Monsieur", content: inp.value, timestamp: serverTimestamp() });
            inp.value = "";
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    startNexusSync();
    startChat();
});
