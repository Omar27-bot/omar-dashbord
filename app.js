const firebaseConfig = { databaseURL: "https://omar-system-default-rtdb.firebaseio.com" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 📈 1. MISE À JOUR DES MARCHÉS
database.ref('status').on('value', (snap) => {
    const container = document.getElementById("markets");
    if (!snap.exists()) return;
    container.innerHTML = "";
    snap.forEach(child => {
        const d = child.val();
        container.innerHTML += `
            <div class="card">
                <b>${child.key}</b><br>
                <span class="price">${d.price} $</span><br>
                <small style="color: #888;">${d.time}</small>
            </div>`;
    });
});

// 🚨 2. SURVEILLANCE DES ALERTES CRITIQUES
database.ref('system/alerts').limitToLast(3).on('value', (snap) => {
    const alertContainer = document.getElementById("alert-container");
    if (snap.exists()) {
        alertContainer.innerHTML = "";
        snap.forEach(a => {
            const val = a.val();
            alertContainer.innerHTML = `<div class="alert-item">⚠️ ${val.message}</div>` + alertContainer.innerHTML;
        });
    } else {
        alertContainer.innerHTML = `<p style="color:#666; text-align:center;">Aucune alerte active, Monsieur.</p>`;
    }
});

// 💬 3. GESTION DU CHAT MACRO
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");

function sendToOmar() {
    const text = userInput.value;
    if (!text) return;

    chatDisplay.innerHTML += `<div style="margin-bottom:10px; color:#00aaff;"><b>Monsieur:</b> ${text}</div>`;
    
    // Envoi à Firebase pour traitement Python
    database.ref('chat/questions').push({
        text: text,
        timestamp: Date.now()
    });

    userInput.value = "";
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Écoute des réponses de l'IA
database.ref('chat/questions').limitToLast(1).on('child_changed', (snap) => {
    const data = snap.val();
    if (data.reponse) {
        chatDisplay.innerHTML += `<div style="margin-bottom:15px; color:#eee; border-left:2px solid #00ff88; padding-left:10px;">
            <b style="color:#00ff88;">O.M.A.R:</b><br>${data.reponse}
        </div>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
});

sendBtn.onclick = sendToOmar;
userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") sendToOmar(); });
