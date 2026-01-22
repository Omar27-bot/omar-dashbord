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

// ============================================================
//  SYNCHRONISATION NEXUS / HUD
// ============================================================

function startNexusSync() {

    // 1. HUD FINAL (nexus_output)
    onValue(ref(db, "nexus_output/hud"), (snapshot) => {
        const hud = snapshot.val();
        if (!hud) return;

        document.getElementById("omar-index").textContent =
            hud.global_bias || "NEUTRAL";

        document.getElementById("omar-decision-badge").textContent =
            hud.global_bias || "SOUVERAIN";
    });

    // 2. ORCHESTRATEUR (régime, risque, conseil)
    onValue(ref(db, "nexus/orchestrator"), (snapshot) => {
        const data = snapshot.val();
        if (!data || !data.cognitive) return;

        const cog = data.cognitive;

        // Régime macro
        if (cog.regime) {
            document.getElementById("omar-regime").textContent = cog.regime;
        }

        // VIX / Stress
        if (cog.risk && cog.risk.vix !== undefined) {
            document.getElementById("omar-stress").textContent = cog.risk.vix;
        }

        // Verdict du Conseil Souverain
        if (cog.council_crystal_decision) {
            const decision = cog.council_crystal_decision.decision || "N/A";
            document.getElementById("omar-status-text").textContent =
                "Décision souveraine : " + decision;
        }
    });

    // 3. Heartbeat système
    onValue(ref(db, "system_status"), (snapshot) => {
        const status = snapshot.val();
        if (!status || !status.last_heartbeat) return;

        const time = new Date(status.last_heartbeat).toLocaleTimeString();
        document.getElementById("omar-last-update").textContent =
            "Vivant : " + time;
    });
}

// ============================================================
//  CHAT OMAR MOBILE
// ============================================================

function startChat() {
    const history = document.getElementById("chat-history");

    onValue(ref(db, "events/chat"), (snap) => {
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

        push(ref(db, "events/chat"), {
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
    startNexusSync();
    startChat();
});
