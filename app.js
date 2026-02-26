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
    onValue(
        ref(db, "hud_contract"),
        (snapshot) => {
            try {
                const hud = snapshot.val();
                if (!hud) return;

                const root = document.getElementById("hud-root");
                if (!root) {
                    console.warn("Element hud-root non trouvé");
                    return;
                }

                // --- GLOBAL BIAS ---
                const bias = hud.hud?.global_bias || "NEUTRAL";
                setSafeText("omar-index", bias);
                setSafeText("omar-decision-badge", bias || "SOUVERAIN");

                // --- MACRO REGIME ---
                setSafeText("omar-regime", hud.macro?.regime || "--");

                // --- VIX / STRESS ---
                setSafeText("omar-stress", hud.macro?.vix ?? "--");

                // --- CONSEIL ---
                setSafeText(
                    "omar-status-text",
                    hud.council?.decision
                        ? "Décision souveraine : " + hud.council.decision
                        : "Analyse en cours..."
                );

                // --- SYSTEM STATUS ---
                const sys = hud.system_status || {};
                if (sys.last_heartbeat) {
                    const time = new Date(sys.last_heartbeat).toLocaleTimeString();
                    setSafeText("omar-last-update", "Vivant : " + time);
                }

                // --- SCÉNARIOS ---
                renderScenarios(hud.scenarios || [], root);

                // --- AGENTS ---
                renderAgents(hud.agents || {});

                // --- HEATMAP ---
                renderHeatmap(hud.world_risk || {});

                // --- MODE ALERTE ROUGE ---
                applyAlertMode(hud);
            } catch (error) {
                console.error("Erreur dans startHudSync:", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (hud_contract):", error);
        }
    );
}

// ============================================================
//  SYNCHRONISATION HUD LLM (TEXTE GLOBAL)
// ============================================================

function startHudLlmSync() {
    onValue(
        ref(db, "hud_llm"),
        (snapshot) => {
            try {
                const node = snapshot.val();
                if (!node) return;

                const payload = node.payload || node.value?.payload || node.value || node;

                setLlmText("llm-macro", payload.macro_text);
                setLlmText("llm-risk", payload.risk_text);
                setLlmText("llm-council", payload.council_text);
                setLlmText("llm-security", payload.security_text);
                setLlmText("llm-portfolio", payload.portfolio_text);
                setLlmText("llm-journal", payload.journal_text);
                setLlmText("llm-nexus", payload.nexus_text);
                setLlmText("llm-kernel", payload.kernel_text);
            } catch (error) {
                console.error("Erreur dans startHudLlmSync:", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (hud_llm):", error);
        }
    );
}

// ============================================================
//  HELPER FUNCTIONS - Gestion sécurisée des éléments DOM
// ============================================================

function setSafeText(id, value) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Élément #${id} non trouvé`);
        return;
    }
    el.textContent = String(value);
}

function setLlmText(id, value) {
    const el = document.getElementById(id);
    if (!el) {
        console.warn(`Élément #${id} non trouvé`);
        return;
    }
    const txt = value ? String(value) : "En attente...";
    el.textContent = txt;
}

// ============================================================
//  RENDER SCÉNARIOS
// ============================================================

function renderScenarios(scenarios, root) {
    const container = document.getElementById("scenarios-list");
    if (!container) {
        console.warn("Élément scenarios-list non trouvé");
        return;
    }
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
    if (!container) {
        console.warn("Élément agents-list non trouvé");
        return;
    }
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
    if (!container) {
        console.warn("Élément heatmap-content non trouvé");
        return;
    }
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
    if (!root) {
        console.warn("Élément hud-root non trouvé pour appliquer alerte");
        return;
    }
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
        setSafeText("omar-status-text", "ALERTE ROUGE — Surveillance renforcée.");
    }
}

// ============================================================
//  CHAT OMAR MOBILE
// ============================================================

function startChat() {
    const history = document.getElementById("chat-history");
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");

    if (!history) {
        console.warn("Élément chat-history non trouvé");
        return;
    }

    if (!sendBtn || !userInput) {
        console.warn("Éléments send-btn ou user-input non trouvés");
        return;
    }

    onValue(
        ref(db, "omar_chat/messages"),
        (snap) => {
            try {
                const data = snap.val();
                if (!data) {
                    history.innerHTML = "<div style='color:#555;'>Aucun message...</div>";
                    return;
                }

                history.innerHTML = "";

                const msgs = Object.values(data)
                    .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0))
                    .slice(-50);

                msgs.forEach((m) => {
                    const div = document.createElement("div");
                    const author = m.author || m.sender || "OMAR";
                    const content = m.message || m.content || "";
                    div.className = author === "OMAR" ? "bot-msg" : "user-msg";
                    
                    // Sécurisé : utiliser textContent au lieu de innerHTML
                    const strong = document.createElement("strong");
                    strong.textContent = author + ":";
                    div.appendChild(strong);
                    
                    const messageText = document.createElement("span");
                    messageText.textContent = " " + content;
                    div.appendChild(messageText);
                    
                    history.appendChild(div);
                });

                history.scrollTop = history.scrollHeight;
            } catch (error) {
                console.error("Erreur dans startChat (affichage):", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (omar_chat/messages):", error);
        }
    );

    sendBtn.onclick = () => {
        try {
            const text = userInput.value.trim();
            if (!text) return;

            push(ref(db, "omar_chat/messages"), {
                author: "user",
                message: text,
                level: "INFO",
                timestamp: new Date().toISOString()
            }).catch((error) => {
                console.error("Erreur lors de l'envoi du message:", error);
            });

            userInput.value = "";
        } catch (error) {
            console.error("Erreur dans sendBtn.onclick:", error);
        }
    };
}

// ============================================================
//  OPPORTUNITES / ALERTES / RAPPORTS
// ============================================================

function startOpportunitiesSync() {
    onValue(
        ref(db, "opportunities"),
        (snap) => {
            try {
                const data = snap.val();
                renderSimpleList("opportunities-list", data, "Aucune opportunité...");
            } catch (error) {
                console.error("Erreur dans startOpportunitiesSync:", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (opportunities):", error);
        }
    );
}

function startAlertsSync() {
    onValue(
        ref(db, "alerts"),
        (snap) => {
            try {
                const data = snap.val();
                renderSimpleList("alerts-list", data, "Aucune alerte...");
            } catch (error) {
                console.error("Erreur dans startAlertsSync (alerts):", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (alerts):", error);
        }
    );

    onValue(
        ref(db, "crisis"),
        (snap) => {
            try {
                const data = snap.val();
                if (data) {
                    renderSimpleList("alerts-list", data, "Aucune alerte...");
                }
            } catch (error) {
                console.error("Erreur dans startAlertsSync (crisis):", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (crisis):", error);
        }
    );
}

function startReportsSync() {
    onValue(
        ref(db, "daily_reports"),
        (snap) => {
            try {
                const data = snap.val();
                renderReports("reports-list", data, "Aucun rapport...");
            } catch (error) {
                console.error("Erreur dans startReportsSync:", error);
            }
        },
        (error) => {
            console.error("Erreur Firebase (daily_reports):", error);
        }
    );
}

function renderSimpleList(containerId, data, emptyText) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Élément ${containerId} non trouvé`);
        return;
    }
    container.innerHTML = "";

    if (!data || typeof data !== "object") {
        container.innerHTML = `<div style='font-size:0.8em; color:#777;'>${emptyText}</div>`;
        return;
    }

    const items = Object.values(data);
    if (items.length === 0) {
        container.innerHTML = `<div style='font-size:0.8em; color:#777;'>${emptyText}</div>`;
        return;
    }

    items.slice(-20).forEach((item) => {
        const div = document.createElement("div");
        div.classList.add(
            containerId.includes("alert") ? "alert-item" :
            containerId.includes("report") ? "report-item" :
            "opportunity-item"
        );
        if (typeof item === "string") {
            div.textContent = item;
        } else {
            const title = item.title || item.subject || item.type || "OMAR";
            const msg = item.message || item.summary || item.details || JSON.stringify(item);
            div.textContent = `${title} — ${msg}`;
        }
        container.appendChild(div);
    });
}

function renderReports(containerId, data, emptyText) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Élément ${containerId} non trouvé`);
        return;
    }
    container.innerHTML = "";

    if (!data || typeof data !== "object") {
        container.innerHTML = `<div style='font-size:0.8em; color:#777;'>${emptyText}</div>`;
        return;
    }

    const items = Object.values(data);
    if (items.length === 0) {
        container.innerHTML = `<div style='font-size:0.8em; color:#777;'>${emptyText}</div>`;
        return;
    }

    items.slice(-10).reverse().forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("report-item");
        const title = item.title || "Rapport OMAR";
        const summary = item.summary || "";
        const highlights = Array.isArray(item.highlights) ? item.highlights.filter(Boolean) : [];

        let html = `<strong>${title}</strong><br>`;
        if (summary) {
            html += `<div class="report-summary">${summary}</div>`;
        }
        if (highlights.length > 0) {
            html += `<ul class="report-highlights">`;
            highlights.forEach((h) => {
                html += `<li>${h}</li>`;
            });
            html += `</ul>`;
        }
        div.innerHTML = html;
        container.appendChild(div);
    });
}

// ============================================================
//  INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("Initialisation de l'application OMAR...");
    try {
        startHudSync();
        startHudLlmSync();
        startOpportunitiesSync();
        startAlertsSync();
        startReportsSync();
        startChat();
        console.log("Application OMAR initialisée avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
    }
});