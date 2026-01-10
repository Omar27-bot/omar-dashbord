// ---------------------------------------------------------
// O.M.A.R — HUD Zenith Mobile
// Logique institutionnelle (lecteur Firebase)
// ---------------------------------------------------------

// 1. Navigation par onglets
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

// ---------------------------------------------------------
// 2. Firebase (VERSION MODULAIRE V9)
// ---------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ---------------------------------------------------------
// 2.1 Portefeuille
// ---------------------------------------------------------
const portfolioList = document.getElementById("portfolio-list");
const dashboardTotal = document.getElementById("dashboard-total");

onValue(ref(db, "/status/portfolio"), (snap) => {
  const data = snap.val();
  if (!data || !data.assets) {
    portfolioList.innerHTML = '<div class="placeholder">Aucun portefeuille disponible.</div>';
    dashboardTotal.textContent = "--,-- CAD";
    return;
  }

  const assets = data.assets;
  let html = "";
  let total = data.total_value || 0;

  Object.keys(assets).forEach((sym) => {
    const a = assets[sym];
    html += `
      <div class="card">
        <h3>${sym}</h3>
        <p class="muted">Quantité : ${a.qty}</p>
        <p class="muted">Prix : ${a.price} CAD</p>
        <p class="big-number">${a.value} CAD</p>
      </div>
    `;
  });

  portfolioList.innerHTML = html;
  dashboardTotal.textContent = `${total} CAD`;
});

// ---------------------------------------------------------
// 2.2 Alertes agents
// ---------------------------------------------------------
const alertsList = document.getElementById("alerts-list");
const dashboardLastAlert = document.getElementById("dashboard-last-alert");

onValue(ref(db, "/status/alerts"), (snap) => {
  const data = snap.val();
  if (!data) {
    alertsList.innerHTML = '<div class="placeholder">Aucune alerte pour l’instant.</div>';
    dashboardLastAlert.textContent = "Aucune alerte récente.";
    return;
  }

  const alerts = Object.values(data).sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  let html = "";
  alerts.forEach((al) => {
    const sev = (al.severity || "info").toLowerCase();
    const badgeClass =
      sev === "critical" ? "badge-critical" :
      sev === "warning" ? "badge-warning" :
      "badge-info";

    html += `
      <div class="card">
        <span class="badge ${badgeClass}">${sev.toUpperCase()}</span>
        <h3>${al.title || "Alerte"}</h3>
        <p class="muted">${al.agent || "Agent inconnu"} — ${al.timestamp || ""}</p>
        <p>${al.message || ""}</p>
      </div>
    `;
  });

  alertsList.innerHTML = html;

  const last = alerts[0];
  dashboardLastAlert.innerHTML = `
    <span class="badge ${badgeClassFromSeverity(last.severity)}">
      ${(last.severity || "INFO").toUpperCase()}
    </span>
    <div>${last.title}</div>
    <div class="muted">${last.agent} — ${last.timestamp}</div>
  `;
});

function badgeClassFromSeverity(sev) {
  const s = (sev || "info").toLowerCase();
  if (s === "critical" || s === "danger" || s === "error") return "badge-critical";
  if (s === "warning" || s === "alert") return "badge-warning";
  return "badge-info";
}

// ---------------------------------------------------------
// 2.3 Chat OMAR
// ---------------------------------------------------------
const chatWindow = document.getElementById("chat-window");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");

function appendChatMessage(text, type) {
  const div = document.createElement("div");
  div.className = `chat-message ${type}`;
  div.innerHTML = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

onValue(ref(db, "/status/chat/history"), (snap) => {
  const data = snap.val();
  if (!data) return;

  chatWindow.innerHTML = "";
  Object.values(data).forEach((msg) => {
    appendChatMessage(msg.text, msg.sender === "user" ? "user" : "system");
  });
});

chatSend.addEventListener("click", () => {
  const txt = chatInput.value.trim();
  if (!txt) return;
  chatInput.value = "";

  push(ref(db, "/status/chat/inbox"), {
    text: txt,
    sender: "user",
    timestamp: new Date().toISOString()
  });
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") chatSend.click();
});
