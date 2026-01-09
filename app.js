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

const hudStatusEl = document.getElementById("hud-status");
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// 2. Firebase (à ADAPTER avec ta vraie config)
const firebaseConfig = {
  apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg",
  authDomain: "omar-system.firebaseapp.com",
  databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
  projectId: "omar-system",
  storageBucket: "omar-system.firebasestorage.app",
  messagingSenderId: "571385162146",
  appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb",
  measurementId: "G-8KMSZ5DVSS"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

  // 2.1 Portefeuille
  const portfolioList = document.getElementById("portfolio-list");
  const dashboardTotal = document.getElementById("dashboard-total");

  db.ref("/status/portfolio").on("value", (snap) => {
    const data = snap.val();
    if (!data || !data.assets) {
      portfolioList.innerHTML =
        '<div class="placeholder">Aucun portefeuille disponible.</div>';
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
          <p class="muted">Prix : ${a.price.toFixed ? a.price.toFixed(4) : a.price} CAD</p>
          <p class="big-number">${a.value.toFixed ? a.value.toFixed(2) : a.value} CAD</p>
        </div>
      `;
    });

    portfolioList.innerHTML = html;
    dashboardTotal.textContent = `${total.toFixed ? total.toFixed(2) : total} CAD`;
  });

  // 2.2 Alertes agents
  const alertsList = document.getElementById("alerts-list");
  const dashboardLastAlert = document.getElementById("dashboard-last-alert");

  db.ref("/status/alerts").limitToLast(20).on("value", (snap) => {
    const data = snap.val();
    if (!data) {
      alertsList.innerHTML =
        '<div class="placeholder">Aucune alerte pour l’instant.</div>';
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
        sev === "critical"
          ? "badge-critical"
          : sev === "warning"
          ? "badge-warning"
          : "badge-info";
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
      <span class="badge ${alerts.length ? badgeClassFromSeverity(last.severity) : "badge-info"}">
        ${(last.severity || "INFO").toUpperCase()}
      </span>
      <div>${last.title || "Alerte"}</div>
      <div class="muted">${last.agent || ""} — ${last.timestamp || ""}</div>
    `;
  });

  function badgeClassFromSeverity(sev) {
    const s = (sev || "info").toLowerCase();
    if (s === "critical" || s === "danger" || s === "error") return "badge-critical";
    if (s === "warning" || s === "alert") return "badge-warning";
    return "badge-info";
  }

  // 2.3 Conseil Souverain
  const councilView = document.getElementById("council-view");
  const btnCouncil = document.getElementById("btn-refresh-council");

  function loadCouncil() {
    db.ref("/status/council").once("value").then((snap) => {
      const data = snap.val();
      if (!data) {
        councilView.textContent = "Aucun verdict disponible.";
        return;
      }
      councilView.textContent = JSON.stringify(data, null, 2);
    });
  }

  btnCouncil.addEventListener("click", loadCouncil);
  loadCouncil();

  // 2.4 Carte du monde (snapshot du WorldMapEngine)
  const worldAmericas = document.getElementById("world-americas");
  const worldEurope = document.getElementById("world-europe");
  const worldAsia = document.getElementById("world-asia");
  const dashboardWorld = document.getElementById("dashboard-world");

  db.ref("/status/worldmap").on("value", (snap) => {
    const data = snap.val();
    if (!data || !data.regions) {
      worldAmericas.textContent = "--%";
      worldEurope.textContent = "--%";
      worldAsia.textContent = "--%";
      dashboardWorld.textContent = "Aucune donnée mondiale.";
      return;
    }

    const regions = data.regions; // ex: [[0.45, -0.12, 1.22], [...]]
    const [row1] = regions;

    worldAmericas.textContent = `${row1[0].toFixed(2)}%`;
    worldEurope.textContent = `${row1[1].toFixed(2)}%`;
    worldAsia.textContent = `${row1[2].toFixed(2)}%`;

    dashboardWorld.textContent = `Amériques: ${row1[0].toFixed(
      2
    )}% | Europe: ${row1[1].toFixed(2)}% | Asie: ${row1[2].toFixed(2)}%`;
  });

  // 2.5 Chat OMAR (lecture + envoi simple)
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

  // Lecture des réponses OMAR (poussées par ton backend ou desktop)
  db.ref("/status/chat/history").limitToLast(50).on("value", (snap) => {
    const data = snap.val();
    if (!data) return;
    chatWindow.innerHTML = "";
    Object.values(data).forEach((msg) => {
      appendChatMessage(
        msg.text || "",
        msg.sender === "user" ? "user" : "system"
      );
    });
  });

  // Envoi d’un message (à adapter à ton pipeline réel)
  chatSend.addEventListener("click", () => {
    const txt = chatInput.value.trim();
    if (!txt) return;
    chatInput.value = "";
    // On pousse côté "user" dans Firebase. Le backend / desktop lit et répond.
    const ref = db.ref("/status/chat/inbox").push();
    ref.set({
      text: txt,
      sender: "user",
      timestamp: new Date().toISOString()
    });
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      chatSend.click();
    }
  });

  // 2.6 Statut HUD
  db.ref("/status/system").on("value", (snap) => {
    const data = snap.val();
    if (!data) {
      hudStatusEl.textContent = "OFFLINE";
      return;
    }
    hudStatusEl.textContent = data.message || "EN LIGNE";
  });
} else {
  if (hudStatusEl) {
    hudStatusEl.textContent = "Firebase non chargé";
  }
}
