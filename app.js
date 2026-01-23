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

        const root = document.getElementById("hud-root");

        // --- GLOBAL BIAS ---
        const bias = hud.hud?.global_bias || "NEUTRAL";
        document.getElementById("omar-index").textContent = bias;
        document.getElementById("omar-decision-badge").textContent = bias || "SOUVERAIN";

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

        // --- SCÉNARIOS ---
        renderScenarios(hud.scenarios || [], root);

        // --- AGENTS ---
        renderAgents(hud.agents || {});

        // --- HEATMAP ---
        renderHeatmap(hud.world_risk || {});

        // --- MODE ALERTE ROUGE ---
        applyAlertMode(hud);
    });
}

// ============================================================
//  RENDER SCÉNARIOS
// ============================================================

function renderScenarios(scenarios, root) {
    const container = document.getElementById("scenarios-list");
    container.innerHTML = "";

    if (!Array.isArray(scenarios) || scenarios.length === 0) {
        container.innerHTML = "<div style='font-size:0.8em; color:#777;'>Aucun scénario...</div>";
        return;
    }

    // tri par score décroissant
    scenarios
        .slice()
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .forEach(sc => {
            const div = document.createElement("div");
            div.classList.add("scenario-item");

            const score = sc.score || 0;
            if (score >= 0.75) div.classList.add("critical");
            else if (score >= 0.5) div.classList.add("alert");
            else div.classList.add("stable");

            div.textContent = `[${sc.id || "SCN"}] ${sc.title || ""} — ${sc.region || ""} — ${score.toFixed(2)}`;
            container.appendChild(div);
        });
}

// ============================================================
//  RENDER AGENTS
// ============================================================

function renderAgents(agents) {
    const container = document.getElementById("agents-list");
    container.innerHTML = "";

    if (!agents || typeof agents !== "object" || Object.keys(agents).length === 0) {
        container.innerHTML = "<div style='font-size:0.8em; color:#777;'>Aucun agent...</div>";
        return;
    }

    Object.entries(agents).forEach(([name, info]) => {
        const div = document.createElement("div");
        div.classList.add("agent-item");

        if (info.status === "ERROR") {
            div.classList.add("error");
            div.textContent = `[${name}] ERROR — ${info.error || ""}`;
        } else {
            const priority = (info.priority || "").toUpperCase();
            if (priority === "MAJOR") div.classList.add("major");
            else if (priority === "MINOR") div.classList.add("minor");

            div.textContent = `[${name}] ${info.verdict || "N/A"} — conf=${info.confidence ?? "?"} — ${priority || "N/A"}`;
        }

        container.appendChild(div);
    });
}

// ============================================================
//  MINI HEATMAP
// ============================================================

function renderHeatmap(worldRisk) {
    const container = document.getElementById("heatmap-content");
    container.innerHTML = "";

    if (!worldRisk || typeof worldRisk !== "object" || Object.keys(worldRisk).length === 0) {
        container.innerHTML = "<div style='font-size:0.8em; color:#777;'>En attente de données...</div>";
        return;
    }

    const row = document.createElement("div");
    row.classList.add("heatmap-row");

    Object.entries(worldRisk).forEach(([iso, risk]) => {
        const dot = document.createElement("div");
        dot.classList.add("heat-dot");

        const r = String(risk).toLowerCase();
        if (r === "high") dot.classList.add("high");
        else if (r === "medium") dot.classList.add("medium");
        else dot.classList.add("low");

        dot.title = `${iso} — ${risk}`;
        row.appendChild(dot);
    });

    container.appendChild(row);

    const label = document.createElement("div");
    label.classList.add("heat-label");
    label.textContent = "Chaque point = un pays (vert=faible, orange=moyen, rouge=élevé)";
    container.appendChild(label);
}

// ============================================================
//  MODE ALERTE ROUGE
// ============================================================

function applyAlertMode(hud) {
    const root = document.getElementById("hud-root");
    root.classList.remove("alert");

    let critical = false;

    // Scénarios critiques
    const scenarios = hud.scenarios || [];
    if (Array.isArray(scenarios)) {
        critical = scenarios.some(sc => (sc.score || 0) >= 0.75);
    }

    // Risk regime critique
    const riskRegime = hud.macro?.risk_regime || "";
    if (riskRegime.toUpperCase() === "CRITICAL") {
        critical = true;
    }

    if (critical) {
        root.classList.add("alert");
        document.getElementById("omar-status-text").textContent =
            "ALERTE ROUGE — Surveillance renforcée.";
    }
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
