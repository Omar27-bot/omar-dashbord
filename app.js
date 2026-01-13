// ---------------------------------------------------------
// O.M.A.R — HUD Zenith Mobile
// Logique institutionnelle (lecteur Firebase)
// ---------------------------------------------------------

// 🔱 Navigation par onglets
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${target}`).classList.add("active");
  });
});

// 🔱 Éléments DOM institutionnels
const hudStatusEl = document.getElementById("hud-status");
const dashboardTotal = document.getElementById("dashboard-total");
const dashboardChange = document.getElementById("dashboard-change");
const dashboardFlux = document.getElementById("dashboard-flux");
const dashboardLastAlert = document.getElementById("dashboard-last-alert");
const dashboardWorld = document.getElementById("dashboard-world");

const portfolioList = document.getElementById("portfolio-list");
const portfolioLastUpdate = document.getElementById("portfolio-last-update");

const alertsList = document.getElementById("alerts-list");

const instMacroRegime = document.getElementById("inst-macro-regime");
const instMacroStress = document.getElementById("inst-macro-stress");
const instMacroSystemic = document.getElementById("inst-macro-systemic");
const instRiskLevel = document.getElementById("inst-risk-level");
const instRiskTrend = document.getElementById("inst-risk-trend");
const instStratDecision = document.getElementById("inst-strategy-decision");
const instStratSeverity = document.getElementById("inst-strategy-severity");
const instSystemStability = document.getElementById("inst-system-stability");
const instSystemLastMajor = document.getElementById("inst-system-last-major");
const instScenariosList = document.getElementById("inst-scenarios-list");

const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// 🔱 Firebase V9 (CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg",
  authDomain: "omar-system.firebaseapp.com",
  databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
  projectId: "omar-system",
  storageBucket: "omar-system.appspot.com",
  messagingSenderId: "571385162146",
  appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb",
  measurementId: "G-8KMSZ5DVSS",
};

let db;

try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  if (hudStatusEl) hudStatusEl.textContent = "EN LIGNE";
} catch (e) {
  console.error("Firebase init error:", e);
  if (hudStatusEl) hudStatusEl.textContent = "Firebase non chargé";
}

// 🔱 Helpers
function safe(val, def = "--") {
  return val === undefined || val === null ? def : val;
}

function appendChatMessage(text, type) {
  const div = document.createElement("div");
  div.className = `chat-message ${type}`;
  div.innerHTML = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function badgeClassFromSeverity(sev) {
  const s = (sev || "info").toLowerCase();
  if (s === "critical" || s === "danger" || s === "error") return "badge-critical";
  if (s === "warning" || s === "alert") return "badge-warning";
  return "badge-info";
}

// 🔱 HUD institutionnel
if (db) {
  // 1. Portefeuille
  onValue(ref(db, "/status/portfolio"), (snap) => {
    const data = snap.val();
    if (!data || !data.assets) {
      portfolioList.innerHTML = '<div class="placeholder">Aucun portefeuille disponible.</div>';
      dashboardTotal.textContent = "--,-- CAD";
      dashboardChange.textContent = "Variation : --%";
      if (portfolioLastUpdate) portfolioLastUpdate.textContent = "Dernière mise à jour : --:--";
      return;
    }

    const assets = data.assets;
    let html = "";
    let total = data.total_value || 0;
    const change = data.daily_change || 0;

    Object.keys(assets).forEach((sym) => {
      const a = assets[sym];
      html += `
        <div class="card">
          <h3>${sym}</h3>
          <p class="muted">Quantité : ${safe(a.qty, 0)}</p>
          <p class="muted">Prix : ${safe(a.price, 0)} CAD</p>
          <p class="big-number">${safe(a.value, 0)} CAD</p>
        </div>
      `;
    });

    portfolioList.innerHTML = html;
    dashboardTotal.textContent = `${total} CAD`;
    dashboardChange.textContent = `Variation : ${change} %`;
    if (portfolioLastUpdate && data.last_update) {
      portfolioLastUpdate.textContent = `Dernière mise à jour : ${data.last_update}`;
    }
  });

  // 2. Alertes
  onValue(ref(db, "/status/alerts"), (snap) => {
    const data = snap.val();
    if (!data) {
      alertsList.innerHTML = '<div class="placeholder">Aucune alerte pour l’instant.</div>';
      dashboardLastAlert.textContent = "Aucune alerte récente.";
      return;
    }

    const alerts = Object.values(data).sort(
      (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );

    let html = "";
    alerts.forEach((al) => {
      const sev = (al.severity || "info").toLowerCase();
      const badgeClass = badgeClassFromSeverity(sev);
      html += `
        <div class="card">
          <span class="badge ${badgeClass}">${sev.toUpperCase()}</span>
          <h3>${safe(al.title, "Alerte")}</h3>
          <p class="muted">${safe(al.agent, "Agent inconnu")} — ${safe(al.timestamp, "")}</p>
          <p>${safe(al.message, "")}</p>
        </div>
      `;
    });

    alertsList.innerHTML = html;

    const last = alerts[0];
    const lastBadgeClass = badgeClassFromSeverity(last.severity);
    dashboardLastAlert.innerHTML = `
      <span class="badge ${lastBadgeClass}">
        ${(last.severity || "INFO").toUpperCase()}
      </span>
      <div>${safe(last.title, "Alerte")}</div>
      <div class="muted">${safe(last.agent, "")} — ${safe(last.timestamp, "")}</div>
    `;
  });

  // 3. Institutionnel
  onValue(ref(db, "/status/institutional_mobile"), (snap) => {
    const data = snap.val();
    if (!data) return;

    const macro = data.macro || {};
    const risk = data.risk || {};
    const strategy = data.strategy || {};
    const system = data.system || {};
    const scenarios = data.scenarios || [];

    instMacroRegime.textContent = `Régime : ${safe(macro.regime)}`;
    instMacroStress.textContent = `Stress : ${safe(macro.stress)}`;
    instMacroSystemic.textContent = `Risque systémique : ${safe(macro.systemic_risk)}`;

    instRiskLevel.textContent = `Niveau : ${safe(risk.level)}`;
    instRiskTrend.textContent = `Trend : ${safe(risk.trend)}`;

    instStratDecision.textContent = `Décision : ${safe(strategy.decision)}`;
    instStratSeverity.textContent = `Sévérité : ${safe(strategy.severity)}`;

    instSystemStability.textContent = `Stabilité : ${safe(system.stability)}`;
    instSystemLastMajor.textContent = `Dernier MAJOR : ${safe(system.last_major)}`;

    instScenariosList.innerHTML = scenarios.length
      ? scenarios
          .map(
            (s) =>
              `<div class="muted">[${safe(s.type)}] p=${safe(s.probability)}, sev=${safe(
                s.severity
              )} — ${safe(s.description)}</div>`
