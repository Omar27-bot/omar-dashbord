// --- 1. CONFIGURATION FIREBASE ---
const firebaseConfig = { 
    databaseURL: "https://omar-system-default-rtdb.firebaseio.com" 
};

// Initialisation de la liaison
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// --- 2. SURVEILLANCE DES MARCHÉS (WATCHLIST) ---
database.ref('status').on('value', (snap) => {
    const container = document.getElementById("markets");
    if (!snap.exists()) return;
    
    container.innerHTML = ""; // Nettoyage du dashboard
    snap.forEach(child => {
        const d = child.val();
        const trendColor = d.trend === "HAUSSIÈRE" ? "#00ff88" : "#ff4d4d";
        
        container.innerHTML += `
            <div class="card">
                <b style="color: ${trendColor};">${child.key}</b><br>
                <span class="price">${d.price} $</span><br>
                <small style="color: #666;">${d.time}</small>
            </div>`;
    });
});

// --- 3. RÉCEPTION DES ALERTES CRITIQUES ---
database.ref('system/alerts').limitToLast(5).on('value', (snap) => {
    const alertContainer = document.getElementById("alert-container");
    if (snap.exists()) {
        alertContainer.innerHTML = "";
        snap.forEach(a => {
            const val = a.val();
            alertContainer.innerHTML = `
                <div class="alert-item">
                    ⚠️ ${val.message} <small style="font-size:0.7em; opacity:0.6;">(${val.time})</small>
                </div>` + alertContainer.innerHTML;
        });
    } else {
        alertContainer.innerHTML = `<p style="color:#444; text-align:center;">Système en veille nominale, Monsieur.</p>`;
    }
});

// --- 4. GESTION DU CHAT ET ANALYSES MACRO ---
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");

// Fonction pour envoyer un ordre d'analyse
function sendToOmar() {
    const text = userInput.value.trim();
    if (!text) return;

    // Affichage local immédiat de votre message
    chatDisplay.innerHTML += `<div style="margin-bottom:10px; text-align:right; color:#00aaff;"><b>Monsieur:</b> ${text}</div>`;
    
    // Envoi à la base de données pour traitement par le PC
    database.ref('chat/questions').push({
        text: text,
        timestamp: Date.now()
    });

    userInput.value = ""; // Effacer le champ
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// Écoute des réponses générées par Ollama (PC)
database.ref('chat/questions').on('child_added', (snap) => {
    const msgId = snap.key;
    
    // On surveille spécifiquement ce message pour détecter l'arrivée de la réponse
    database.ref(`chat/questions/${msgId}`).on('value', (s) => {
        const data = s.val();
        if (data && data.reponse) {
            // Vérifier si la réponse est déjà affichée pour éviter les répétitions
            const existingMsg = document.getElementById(`msg-${msgId}`);
            if (!existingMsg) {
                chatDisplay.innerHTML += `
                    <div id="msg-${msgId}" style="margin-bottom:20px; border-left:3px solid #00ff88; padding-left:12px; background: rgba(0,255,136,0.05); padding-top:5px; padding-bottom:5px;">
                        <b style="color:#00ff88;">O.M.A.R:</b><br>
                        <span style="color:#eee;">${data.reponse}</span>
                    </div>`;
                chatDisplay.scrollTop = chatDisplay.scrollHeight;
            }
        }
    });
});

// Événements de contrôle
sendBtn.onclick = sendToOmar;
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendToOmar();
});
