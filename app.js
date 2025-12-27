const firebaseConfig = { databaseURL: "https://omar-system-default-rtdb.firebaseio.com" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 📈 Mise à jour des Marchés
database.ref('status').on('value', (snap) => {
    const container = document.getElementById("markets");
    container.innerHTML = "";
    snap.forEach(child => {
        const d = child.val();
        container.innerHTML += `
            <div class="card">
                <b>${child.key}</b><br>
                <span class="price">${d.price} $</span><br>
                <small>${d.time}</small>
            </div>`;
    });
});

// 📡 Réception des Signaux
database.ref("signals").limitToLast(5).on("value", snap => {
    const list = document.getElementById("signalList");
    list.innerHTML = "";
    snap.forEach(s => {
        const val = s.val();
        list.innerHTML = `<li class="signal">🌊 ${val.symbole} @ ${val.price} (RSI: ${val.rsi})</li>` + list.innerHTML;
    });
});

// 💬 Logique du Chat (Envoi vers Firebase pour traitement par l'IA locale)
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");
const chatDisplay = document.getElementById("chat-display");

// On écoute les réponses aux questions
database.ref('chat/questions').limitToLast(1).on('child_changed', (snap) => {
    const data = snap.val();
    if (data.reponse) {
        const chatDisplay = document.getElementById("chat-display");
        chatDisplay.innerHTML += `<div style="color: #00ff88;"><b>O.M.A.R:</b> ${data.reponse}</div>`;
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
});

    chatDisplay.innerHTML += `<div><b>Monsieur:</b> ${text}</div>`;
    
    // On envoie la question dans Firebase. 
    // Votre script Python (Ollama) devra écouter 'chat/questions' pour répondre.
    database.ref('chat/questions').push({
        text: text,
        timestamp: Date.now()
    });

    userInput.value = "";
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

sendBtn.onclick = sendMessage;
userInput.addEventListener("keypress", (e) => { if(e.key === "Enter") sendMessage(); });
