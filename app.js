import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

// ============================================================
//  SYNCHRONISATION HUD_CONTRACT
// ============================================================

function startHudSync() {

    onValue(ref(db, "hud_contract"), (snapshot) => {
        const hud = snapshot.val();
        if (!hud) return;

        // --- GLOBAL BIAS ---
        document.getElementById("omar-index").textContent =
            hud.hud?.global_bias || "NEUTRAL";

        document.getElementById("omar-decision-badge").textContent =
            hud.hud?.global_bias || "SOUVERAIN";

        // --- MACRO REGIME ---
        document.getElementById("omar-regime").textContent =
            hud.macro?.regime || "--";

        // --- VIX / STRESS ---
        document.getElementById("omar-stress").textContent =
            hud.macro?.vix ?? "--";

        // --- CONSEIL ---
        document.getElementById("omar-status-text").textContent =
            hud.council?.decision
                ? "Décision souveraine : " + hud.council.decision
                : "Analyse en cours...";

        // --- SYSTEM STATUS ---
        const sys = hud.system_status || {};
        if (sys.last_heartbeat) {
            const time = new Date(sys.last_heartbeat).toLocaleTimeString();
            document.getElementById("omar-last-update").textContent =
                "Vivant : " + time;
        }
    });
}

// ============================================================
//  CHAT OMAR MOBILE
// ============================================================

function startChat() {
    const history = document.getElementById("chat-history");

    onValue(ref(db, "hud_contract/events/chat"), (snap) => {
        const data = snap.val();
        if (!data) {
            history.innerHTML = "<div style='color:#555;'>Aucun message...</div>";
            return;
        }

        history.innerHTML = "";

        const msgs = Object.values(data)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            .slice(-20);

        msgs.forEach((m) => {
            const div = document.createElement("div");
            div.className = m.sender === "OMAR" ? "bot-msg" : "user-msg";
            div.innerHTML = `<strong>${m.sender}:</strong> ${m.content}`;
            history.appendChild(div);
        });

        history.scrollTop = history.scrollHeight;
    });

    // Envoi message
    document.getElementById("send-btn").onclick = () => {
        const inp = document.getElementById("user-input");
        const text = inp.value.trim();
        if (!text) return;

        push(ref(db, "hud_contract/events/chat"), {
            sender: "Monsieur",
            content: text,
            timestamp: Date.now()
        });

        inp.value = "";
    };
}

// ============================================================
//  INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    startHudSync();
    startChat();
});
