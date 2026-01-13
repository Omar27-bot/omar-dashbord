// Données OMAR — pourraient être alimentées par WebSocket / API / Webhook plus tard
const state = {
    profile: "DAY",
    decision: "NEUTRAL", // RISK_ON, HEDGE, RISK_OFF, CRISIS
    omarIndex: 50,
    regime: "NEUTRAL", // RISK-ON, NEUTRAL, RISK-OFF
    stress: 1.2,
    stressLevel: "MEDIUM",
    riskLevel: "MODERATE",
    lastUpdate: null
};

// Mapping décision → style
const decisionConfig = {
    NEUTRAL: {
        label: "NEUTRAL",
        className: "decision-neutral",
        statusText: "En attente de signal OMAR…",
        dotColor: "#888"
    },
    RISK_ON: {
        label: "RISK_ON",
        className: "decision-risk-on",
        statusText: "OMAR : Environnement favorable (RISK_ON).",
        dotColor: "#25d366"
    },
    HEDGE: {
        label: "HEDGE",
        className: "decision-hedge",
        statusText: "OMAR : Zone tampon (HEDGE).",
        dotColor: "#f5c542"
    },
    RISK_OFF: {
        label: "RISK_OFF",
        className: "decision-risk-off",
        statusText: "OMAR : Prudence renforcée (RISK_OFF).",
        dotColor: "#ff914d"
    },
    CRISIS: {
        label: "CRISIS",
        className: "decision-crisis",
        statusText: "OMAR : Mode CRISIS activé.",
        dotColor: "#ff4b4b"
    }
};

// Références DOM
const cardEl = document.getElementById("omar-card");
const decisionBadgeEl = document.getElementById("omar-decision-badge");
const profileTagEl = document.getElementById("omar-profile-tag");
const indexEl = document.getElementById("omar-index");
const regimeEl = document.getElementById("omar-regime");
const stressEl = document.getElementById("omar-stress");
const stressLevelEl = document.getElementById("omar-stress-level");
const riskLevelEl = document.getElementById("omar-risk-level");
const statusDotEl = document.getElementById("omar-status-dot");
const statusTextEl = document.getElementById("omar-status-text");
const lastUpdateEl = document.getElementById("omar-last-update");

// Rendu principal
function render() {
    const cfg = decisionConfig[state.decision] || decisionConfig.NEUTRAL;

    // Nettoyer classes de décision
    cardEl.classList.remove(
        "decision-risk-on",
        "decision-hedge",
        "decision-risk-off",
        "decision-crisis",
        "decision-neutral"
    );
    cardEl.classList.add(cfg.className);

    // Haut de la carte
    decisionBadgeEl.textContent = cfg.label;
    profileTagEl.textContent = `PROFILE: ${state.profile.toUpperCase()}`;

    // Bloc index
    indexEl.textContent = Math.round(state.omarIndex);

    // Grille
    regimeEl.textContent = state.regime;
    stressEl.textContent = `${state.stress.toFixed(2)} %`;
    stressLevelEl.textContent = state.stressLevel;
    riskLevelEl.textContent = state.riskLevel;

    // Statut
    statusDotEl.style.backgroundColor = cfg.dotColor;
    statusTextEl.textContent = cfg.statusText;

    // Timestamp
    if (state.lastUpdate) {
        lastUpdateEl.textContent =
            "Dernière mise à jour : " + state.lastUpdate.toLocaleTimeString("fr-CA");
    } else {
        lastUpdateEl.textContent = "Dernière mise à jour : —";
    }
}

// Simulateur local (boutons de test)
function applyScenario(scenario) {
    const now = new Date();
    state.lastUpdate = now;

    switch (scenario) {
        case "RISK_ON":
            state.decision = "RISK_ON";
            state.omarIndex = 35;
            state.regime = "RISK-ON";
            state.stress = 0.8;
            state.stressLevel = "LOW";
            state.riskLevel = "LOW";
            break;
        case "HEDGE":
            state.decision = "HEDGE";
            state.omarIndex = 55;
            state.regime = "NEUTRAL";
            state.stress = 1.5;
            state.stressLevel = "MEDIUM";
            state.riskLevel = "MODERATE";
            break;
        case "RISK_OFF":
            state.decision = "RISK_OFF";
            state.omarIndex = 70;
            state.regime = "RISK-OFF";
            state.stress = 2.4;
            state.stressLevel = "MEDIUM";
            state.riskLevel = "HIGH";
            break;
        case "CRISIS":
            state.decision = "CRISIS";
            state.omarIndex = 88;
            state.regime = "RISK-OFF";
            state.stress = 3.5;
            state.stressLevel = "HIGH";
            state.riskLevel = "CRITICAL";
            break;
        default:
            state.decision = "NEUTRAL";
    }

    render();
}

// Wiring des boutons de test
document.querySelectorAll(".omar-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const scenario = btn.getAttribute("data-scenario");
        applyScenario(scenario);
    });
});

// Premier rendu
render();

// ➜ Plus tard : ici, tu pourras intégrer un fetch / WebSocket / EventSource
// pour recevoir les données du HUD backend ou de TradingView et mettre à jour "state"
// puis appeler render().
