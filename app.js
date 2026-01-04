// Firebase ES Modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// CONFIG FIREBASE
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

// INIT
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// UI
const statusEl = document.getElementById("connectionStatus");
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

// TABS
document.querySelectorAll(".tab-button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
  });
});

// STATUS
function setStatus(text, ok = true) {
  statusEl.textContent = text;
  statusEl.style.color = ok ? "#00c853" : "#ff4b4b";
}

// CHAT
function appendChat(author, text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = "chat-message " + (isUser ? "user" : "system");
  msg.innerHTML = `<strong>${author}</strong><br>${text}`;
  chatWindow.appendChild(msg);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

chatForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  appendChat("Monsieur", text, true);
  chatInput.value = "";

  push(ref(db, "commandes/mobile_chat"), {
    from: "mobile",
    text,
    timestamp: Date.now()
  });
});

// FIREBASE LISTENERS
function listen(path, callback) {
  onValue(ref(db, path), snap => {
    setStatus("Connecté", true);
    callback(snap.val());
  }, () => setStatus("Hors ligne", false));
}

// ALERTES
listen("signals", data => {
  const list = document.getElementById("alertsList");
  list.innerHTML = "";
  if (!data) return;
  Object.values(data).forEach(a => {
    list.innerHTML += `<div class="card"><strong>${a.title}</strong><br>${a.message}</div>`;
  });
});

// WATCHLIST
listen("status", data => {
  const list = document.getElementById("watchlistList");
  const total = document.getElementById("portfolioValue");
  list.innerHTML = "";
  if (!data || !data.assets) return;

  total.textContent = data.total_value || "—";

  Object.entries(data.assets).forEach(([sym, a]) => {
    list.innerHTML += `
      <div class="card">
        <strong>${sym}</strong><br>
        Valeur: ${a.value}<br>
        P&L: ${a.pl} (${a.pl_pct}%)
      </div>`;
  });
});

// RAPPORT JOURNALIER
listen("system/daily_report", data => {
  const rep = document.getElementById("dailyReport");
  if (!data) return;
  rep.innerHTML = `<strong>${data.day}</strong> — ${data.time}<br><br>${data.text}`;
});

// HISTORIQUE
listen("system/reports_history", data => {
  const list = document.getElementById("reportsHistory");
  list.innerHTML = "";
  if (!data) return;
  Object.values(data).forEach(r => {
    list.innerHTML += `<div class="card">${r.day} — ${r.summary}</div>`;
  });
});

// AGENTS
listen("nexus/agents", data => {
  const list = document.getElementById("agentsResults");
  list.innerHTML = "";
  if (!data) return;
  Object.values(data).forEach(a => {
    list.innerHTML += `<div class="card"><strong>${a.agent}</strong><br>${a.result}</div>`;
  });
});

// CHAT
listen("chat", data => {
  chatWindow.innerHTML = "";
  if (!data) return;
  Object.values(data)
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(m => appendChat(m.from === "mobile" ? "Monsieur" : "O.M.A.R", m.text, m.from === "mobile"));
});
