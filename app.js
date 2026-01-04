// app.js — OMAR HUD Mobile + Firebase Realtime Database (module ES)

// Import Firebase SDK (version modulaire)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import {
  getDatabase,
  ref,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// --- CONFIGURATION FIREBASE OMAR-SYSTEM ---
const firebaseConfig = {
  apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg",
  authDomain: "omar-system.firebaseapp.com",
  databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
  projectId: "omar-system",
  storageBucket: "omar-system.firebasestorage.app",
  messagingSenderId: "571385162146",
  appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb",
  measurementId: "G-8KMSZ5DVSS"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const db = getDatabase(app);

// Sélecteurs UI
const statusEl = document.getElementById("connectionStatus");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

const alertsList = document.getElementById("alertsList");
const watchlistList = document.getElementById("watchlistList");
const portfolioValueEl = document.getElementById("portfolioValue");
const dailyReportEl = document.getElementById("dailyReport");
const reportsHistoryEl = document.getElementById("reportsHistory");
const agentsResultsEl = document.getElementById("agentsResults");

const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

// Gestion des onglets
tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    tabButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    tabPanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === `tab-${target}`);
    });
  });
});

function setStatus(text, ok = true) {
  statusEl.textContent = text;
  statusEl.style.color = ok ? "#00c853" : "#ff4b4b";
}

// --- RENDUS UI ---

function renderAlerts(dataArr) {
  alertsList.innerHTML = "";
  if (!dataArr || dataArr.length === 0) {
    alertsList.innerHTML = `<p class="placeholder">Aucune alerte active.</p>`;
    return;
  }

  dataArr.forEach((alert) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = alert.title || alert.label || "Alerte";

    const tag = document.createElement("div");
    tag.className = "card-tag";
    const level = (alert.level || alert.severity || "ALERTE").toUpperCase();
    if (level.includes("CRIT")) tag.classList.add("danger");
    if (level.includes("INFO") || level.includes("OK")) tag.classList.add("ok");
    tag.textContent = level;

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    body.textContent = alert.message || alert.details || "";

    card.appendChild(header);
    card.appendChild(body);
    alertsList.appendChild(card);
  });
}

function renderWatchlist(statusData) {
  watchlistList.innerHTML = "";

  // Structure attendue (à adapter côté PC) :
  // {
  //   total_value: number,
  //   assets: {
  //      "BTC-CAD": { value, pl, pl_pct, weight },
  //      ...
  //   }
  // }

  if (!statusData || !statusData.assets) {
    watchlistList.innerHTML = `<p class="placeholder">Aucun actif à surveiller.</p>`;
    portfolioValueEl.textContent = "—";
    return;
  }

  const total = statusData.total_value || 0;
  portfolioValueEl.textContent = total
    ? total.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })
    : "—";

  Object.entries(statusData.assets).forEach(([symbol, asset]) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = symbol;

    const tag = document.createElement("div");
    tag.className = "card-tag";
    if (asset.weight != null) {
      tag.textContent = `${Number(asset.weight).toFixed(1)} %`;
    } else {
      tag.textContent = "—";
    }

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    const value = Number(asset.value || 0);
    const pl = Number(asset.pl || 0);
    const plPct = Number(asset.pl_pct || 0);

    body.innerHTML = `
      Valeur: ${value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}<br/>
      P&L: ${pl.toFixed(2)} CAD (${plPct.toFixed(2)} %)
    `;

    card.appendChild(header);
    card.appendChild(body);
    watchlistList.appendChild(card);
  });
}

function renderDailyReport(rep) {
  if (!rep || !rep.text) {
    dailyReportEl.innerHTML = `<p class="placeholder">En attente du rapport journalier généré par O.M.A.R.</p>`;
    return;
  }

  const day = rep.day || "—";
  const time = rep.time || "—";
  const text = rep.text;

  dailyReportEl.innerHTML = `
    <strong>Jour :</strong> ${day}<br/>
    <strong>Heure :</strong> ${time}<br/><br/>
    <pre style="white-space: pre-wrap; margin: 0;">${text}</pre>
  `;
}

function renderReportsHistory(list) {
  reportsHistoryEl.innerHTML = "";
  if (!list || list.length === 0) {
    reportsHistoryEl.innerHTML = `<p class="placeholder">Aucun rapport historique disponible.</p>`;
    return;
  }

  list.forEach((rep) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = rep.day || "Rapport";

    const tag = document.createElement("div");
    tag.className = "card-tag";
    tag.textContent = rep.time || "";

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    const summary = rep.summary || rep.text || "";
    body.textContent = summary.length > 160 ? summary.slice(0, 157) + "…" : summary;

    card.appendChild(header);
    card.appendChild(body);
    reportsHistoryEl.appendChild(card);
  });
}

function renderAgents(list) {
  agentsResultsEl.innerHTML = "";
  if (!list || list.length === 0) {
    agentsResultsEl.innerHTML = `<p class="placeholder">Aucun résultat récent des agents.</p>`;
    return;
  }

  list.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = entry.agent || entry.name || "Agent";

    const tag = document.createElement("div");
    tag.className = "card-tag";
    tag.textContent = entry.status || "OK";

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    body.textContent = entry.result || entry.details || "";

    card.appendChild(header);
    card.appendChild(body);
    agentsResultsEl.appendChild(card);
  });
}

// --- CHAT ---

function appendChatMessage(author, text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = "chat-message " + (isUser ? "user" : "system");

  const a = document.createElement("div");
  a.className = "chat-author";
  a.textContent = author;

  const t = document.createElement("div");
  t.className = "chat-text";
  t.textContent = text;

  msg.appendChild(a);
  msg.appendChild(t);
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateChatWindow(messages) {
  // messages = [{from, text, timestamp, reply?}, ...]
  chatWindow.innerHTML = "";
  if (!messages || messages.length === 0) {
    appendChatMessage(
      "O.M.A.R",
      "Monsieur, je suis à votre disposition. Vous pouvez m’écrire ci‑dessous."
    );
    return;
  }

  messages
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    .forEach((m) => {
      const isUser = m.from === "monsieur" || m.from === "mobile";
      const author = isUser ? "Monsieur" : "O.M.A.R";
      appendChatMessage(author, m.text || "", isUser);
      if (m.reply) {
        appendChatMessage("O.M.A.R", m.reply, false);
      }
    });
}

async function sendMessageToOmar(text) {
  const msg = {
    from: "mobile",
    text: text,
    timestamp: Date.now()
  };
  try {
    await push(ref(db, "commandes/mobile_chat"), msg);
  } catch (e) {
    appendChatMessage("O.M.A.R", "Monsieur, la commande n’a pas pu être envoyée.", false);
  }
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  appendChatMessage("Monsieur", text, true);
  chatInput.value = "";
  sendMessageToOmar(text);
});

// --- ABONNEMENTS FIREBASE ---

function safeOnValue(path, handler) {
  const r = ref(db, path);
  onValue(
    r,
    (snapshot) => {
      setStatus("Connecté", true);
      handler(snapshot.val());
    },
    (error) => {
      console.error("Firebase error on", path, error);
      setStatus("Hors ligne", false);
    }
  );
}

// signals : alertes
safeOnValue("signals", (data) => {
  const arr = data ? Object.values(data) : [];
  renderAlerts(arr);
});

// status : portefeuille / actifs
safeOnValue("status", (data) => {
  renderWatchlist(data || {});
});

// system/daily_report : rapport du jour
safeOnValue("system/daily_report", (data) => {
  renderDailyReport(data || {});
});

// system/reports_history : historique
safeOnValue("system/reports_history", (data) => {
  const arr = data ? Object.values(data) : [];
  renderReportsHistory(arr);
});

// nexus/agents : résultats des agents
safeOnValue("nexus/agents", (data) => {
  const arr = data ? Object.values(data) : [];
  renderAgents(arr);
});

// chat : historique entre Monsieur et O.M.A.R
safeOnValue("chat", (data) => {
  const arr = data ? Object.values(data) : [];
  updateChatWindow(arr);
});

// system_status : éventuellement, adapter le pill de statut
safeOnValue("system_status", (data) => {
  if (!data) return;
  if (data.state === "OK") {
    setStatus("Système nominal", true);
  } else if (data.state) {
    setStatus(data.state, false);
  }
});
