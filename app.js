// Adresse de ton HUD sur le réseau local (à adapter)
// Exemple : "http://192.168.0.10:5000"
const BASE_URL = "http://192.168.0.10:5000";

// Sélecteurs de base
const statusEl = document.getElementById("connectionStatus");
const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");

// Sections
const alertsList = document.getElementById("alertsList");
const watchlistList = document.getElementById("watchlistList");
const portfolioValueEl = document.getElementById("portfolioValue");
const dailyReportEl = document.getElementById("dailyReport");
const reportsHistoryEl = document.getElementById("reportsHistory");
const agentsResultsEl = document.getElementById("agentsResults");

// Chat
const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

// Gestion des tabs
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

// Utilitaires
function setStatus(text, ok = true) {
  statusEl.textContent = text;
  statusEl.style.color = ok ? "#00c853" : "#ff4b4b";
}

async function fetchJSON(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    setStatus("Connecté", true);
    return data;
  } catch (e) {
    setStatus("Hors ligne", false);
    throw e;
  }
}

// Rendu des alertes
function renderAlerts(data) {
  alertsList.innerHTML = "";
  if (!data || data.length === 0) {
    alertsList.innerHTML = `<p class="placeholder">Aucune alerte active.</p>`;
    return;
  }

  data.forEach((alert) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = alert.title || "Alerte";

    const tag = document.createElement("div");
    tag.className = "card-tag";
    if (alert.level === "CRITICAL") tag.classList.add("danger");
    if (alert.level === "INFO") tag.classList.add("ok");
    tag.textContent = alert.level || "ALERTE";

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    body.textContent = alert.message || "";

    card.appendChild(header);
    card.appendChild(body);
    alertsList.appendChild(card);
  });
}

// Rendu watchlist
function renderWatchlist(data) {
  watchlistList.innerHTML = "";
  if (!data || !data.assets || data.assets.length === 0) {
    watchlistList.innerHTML = `<p class="placeholder">Aucun actif à surveiller.</p>`;
    portfolioValueEl.textContent = "—";
    return;
  }

  portfolioValueEl.textContent = (data.total_value || 0).toLocaleString("fr-CA", {
    style: "currency",
    currency: "CAD",
  });

  data.assets.forEach((asset) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = asset.symbol || "—";

    const tag = document.createElement("div");
    tag.className = "card-tag";
    tag.textContent = asset.weight ? `${asset.weight.toFixed(1)} %` : "—";

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    const value = asset.value || 0;
    const pl = asset.pl || 0;
    const plPct = asset.pl_pct || 0;

    body.innerHTML = `
      Valeur: ${value.toLocaleString("fr-CA", { style: "currency", currency: "CAD" })}<br/>
      P&L: ${pl.toFixed(2)} CAD (${plPct.toFixed(2)} %)
    `;

    card.appendChild(header);
    card.appendChild(body);
    watchlistList.appendChild(card);
  });
}

// Rendu rapport du jour
function renderDailyReport(data) {
  if (!data || !data.text) {
    dailyReportEl.innerHTML = `<p class="placeholder">En attente du rapport journalier généré par O.M.A.R.</p>`;
    return;
  }

  dailyReportEl.innerHTML = `
    <strong>Jour :</strong> ${data.day || "—"}<br/>
    <strong>Heure :</strong> ${data.time || "—"}<br/><br/>
    <pre style="white-space: pre-wrap; margin: 0;">${data.text}</pre>
  `;
}

// Rendu historique rapports
function renderReportsHistory(data) {
  reportsHistoryEl.innerHTML = "";
  if (!data || data.length === 0) {
    reportsHistoryEl.innerHTML = `<p class="placeholder">Aucun rapport historique disponible.</p>`;
    return;
  }

  data.forEach((rep) => {
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
    body.textContent = (rep.summary || "").slice(0, 140) + "…";

    card.appendChild(header);
    card.appendChild(body);
    reportsHistoryEl.appendChild(card);
  });
}

// Rendu résultats agents
function renderAgents(data) {
  agentsResultsEl.innerHTML = "";
  if (!data || data.length === 0) {
    agentsResultsEl.innerHTML = `<p class="placeholder">Aucun résultat récent des agents.</p>`;
    return;
  }

  data.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.className = "card-header";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = entry.agent || "Agent";

    const tag = document.createElement("div");
    tag.className = "card-tag";
    tag.textContent = entry.status || "OK";

    header.appendChild(title);
    header.appendChild(tag);

    const body = document.createElement("div");
    body.className = "card-body";
    body.textContent = entry.result || "";

    card.appendChild(header);
    card.appendChild(body);
    agentsResultsEl.appendChild(card);
  });
}

// Chat
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

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  appendChatMessage("Monsieur", text, true);
  chatInput.value = "";

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    appendChatMessage("O.M.A.R", data.reply || "Réponse indisponible.");
  } catch (e) {
    appendChatMessage("O.M.A.R", "Monsieur, je ne parviens pas à joindre le HUD.");
  }
});

// Rafraîchissement périodique
async function refreshAll() {
  try {
    const [alerts, watchlist, daily, history, agents] = await Promise.all([
      fetchJSON("/api/alerts"),
      fetchJSON("/api/watchlist"),
      fetchJSON("/api/daily-report"),
      fetchJSON("/api/reports-history"),
      fetchJSON("/api/agents-results"),
    ]);

    renderAlerts(alerts);
    renderWatchlist(watchlist);
    renderDailyReport(daily);
    renderReportsHistory(history);
    renderAgents(agents);
  } catch (e) {
    // status déjà géré dans fetchJSON
  }
}

// Tick initial + intervalle
refreshAll();
setInterval(refreshAll, 15000);
