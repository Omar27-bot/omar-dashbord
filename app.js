// ---------------------------------------------------------
// O.M.A.R — HUD Zenith Mobile
// Logique institutionnelle (lecteur Firebase)
// ---------------------------------------------------------

// Navigation par onglets
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

// Éléments DOM clé
const hudStatusEl = document.getElementById("hud-status");
const dashboardTotal = document.getElementById("dashboard-total");
const dashboardChange = document.getElementById("dashboard-change");
const dashboardFlux = document.getElementById("dashboard-flux");
const dashboardLastAlert = document.getElementById("dashboard-last-alert");
const dashboardWorld = document.getElementById("dashboard-world");

const portfolioList = document.getElementById("portfolio-list");
const portfolioLastUpdate = document.getElementById("portfolio-last-update");

const alertsList = document.getElementById("alerts-list");

const worldAmericas = document.getElementById("world-americas");
const worldEurope = document.getElementById("world-europe");
const worldAsia = document.getElementById("world-asia");

const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

// ---------------------------------------------------------
// Firebase V9 (CDN)
// ---------------------------------------------------------
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
  storageBucket: "omar-system.firebasestorage.app",
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

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// 1. Portefeuille / Dashboard
// ---------------------------------------------------------
if (db) {
  onValue(ref(db, "/status/portfolio"), (snap) => {
    const data = snap.val();
    if (!data || !data.assets) {
      portfolioList.innerHTML =
        '<div class="placeholder">Aucun portefeuille disponible.</div>';
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

  // -------------------------------------------------------
  // 2. Alertes agents & système
  // -------------------------------------------------------
  onValue(ref(db, "/status/alerts"), (snap) => {
    const data = snap.val();
    if (!data) {
      alertsList.innerHTML =
        '<div class="placeholder">Aucune alerte pour l’instant.</div>';
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

  // -------------------------------------------------------
  // 3. WorldMap / Marchés Globaux
  // -------------------------------------------------------
  onValue(ref(db, "/status/worldmap"), (snap) => {
    const data = snap.val();
    if (!data || !data.regions) {
      worldAmericas.textContent = "--%";
      worldEurope.textContent = "--%";
      worldAsia.textContent = "--%";
      dashboardWorld.textContent = "Aucune donnée mondiale.";
      return;
    }

    const regions = data.regions;
    const [row1] = regions;

    worldAmericas.textContent = `${row1[0].toFixed(2)}%`;
    worldEurope.textContent = `${row1[1].toFixed(2)}%`;
    worldAsia.textContent = `${row1[2].toFixed(2)}%`;

    dashboardWorld.textContent = `Amériques: ${row1[0].toFixed(
      2
    )}% | Europe: ${row1[1].toFixed(2)}% | Asie: ${row1[2].toFixed(2)}%`;
  });

  // -------------------------------------------------------
  // 4. Statut HUD / Flux
  // -------------------------------------------------------
  onValue(ref(db, "/status/system"), (snap) => {
    const data = snap.val();
    if (!data) {
      if (hudStatusEl) hudStatusEl.textContent = "OFFLINE";
      dashboardFlux.textContent = "Flux indisponibles.";
      return;
    }
    if (hudStatusEl) hudStatusEl.textContent = data.message || "EN LIGNE";
    dashboardFlux.textContent = data.flux_status || "Flux : OK";
  });

  // -------------------------------------------------------
  // 5. Chat OMAR (lecture + envoi)
  // -------------------------------------------------------
  onValue(ref(db, "/status/chat/history"), (snap) => {
    const data = snap.val();
    if (!data) return;
    chatWindow.innerHTML = "";
    Object.values(data).forEach((msg) => {
      const type =
        msg.sender === "user"
          ? "user"
          : "assistant";
      appendChatMessage(msg.text || "", type);
    });
  });

  chatSend.addEventListener("click", () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    chatInput.value = "";

    appendChatMessage(txt, "user");

    push(ref(db, "/status/chat/inbox"), {
      text: txt,
      sender: "user",
      timestamp: new Date().toISOString(),
    });
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") chatSend.click();
  });
}
