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

// --- FONCTION DE MISE À JOUR ---
onValue(ref(db, 'nexus/orchestrator/cognitive'), (snap) => {
    const data = snap.val();
    if (data) {
        // 1. Directive et Badge
        const decision = data.council_crystal_decision || "VEILLE";
        document.getElementById("badge").textContent = decision;
        document.getElementById("directive").textContent = "CRISTAL : " + decision;

        // 2. Scénarios (Risque et Régime)
        if (data.scenarios && data.scenarios[1]) {
            const scn = data.scenarios[1];
            document.getElementById("index").textContent = (scn.score * 100).toFixed(0);
            document.getElementById("regime").textContent = scn.title;
        }
        document.getElementById("sync-time").textContent = "SYNC: " + new Date().toLocaleTimeString();
    }
});

// Lecture du stress technique
onValue(ref(db, 'system_status'), (snap) => {
    const status = snap.val();
    if (status) {
        document.getElementById("stress").textContent = (status.stress_level || 0).toFixed(2) + "%";
        if (status.omar_index) document.getElementById("index").textContent = status.omar_index;
    }
});

// --- CHAT OMAR ---
const chatBox = document.getElementById('chat');
onValue(ref(db, 'events'), (snap) => {
    const ev = snap.val();
    if (!ev) return;
    chatBox.innerHTML = "";
    let all = [];
    if (ev.messages) Object.values(ev.messages).forEach(m => all.push({...m, cl: 'white'}));
    if (ev.replies) Object.values(ev.replies).forEach(r => all.push({...r, cl: '#D4AF37'}));
    
    all.sort((a,b) => a.timestamp - b.timestamp).slice(-10).forEach(m => {
        chatBox.innerHTML += `<div style="color:${m.cl}; margin-bottom:5px;">> ${m.content}</div>`;
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});

// Envoi
document.getElementById('send-btn').onclick = () => {
    const el = document.getElementById('msg-in');
    if (el.value) {
        push(ref(db, 'events/messages'), { sender: "Monsieur", content: el.value, timestamp: serverTimestamp() });
        el.value = "";
    }
};
