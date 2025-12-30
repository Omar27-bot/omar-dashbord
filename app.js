// Configuration Firebase de l'Empire Monsieur
// Ces identifiants lient votre mobile à l'ID de projet: omar-system
const firebaseConfig = {
    apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg", // Vous la trouverez dans les paramètres du projet Firebase
    authDomain: "omar-system.firebaseapp.com",
    databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
    projectId: "omar-system",
    storageBucket: "omar-system.appspot.com",
    messagingSenderId: "571385162146",
    appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb"
};

// Initialisation de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Éléments de l'interface
const input = document.getElementById('user-input');
const btn = document.getElementById('send-btn');
const history = document.getElementById('chat-history');

// Fonction pour afficher les messages
function addMessage(sender, text, color = "#D4AF37") {
    const p = document.createElement('p');
    p.innerHTML = `<b style="color:${color}">${sender}:</b> ${text}`;
    history.appendChild(p);
    history.scrollTop = history.scrollHeight;
}

// Envoi d'un ordre vers le Cloud (Firebase)
btn.addEventListener('click', () => {
    const msg = input.value;
    if(!msg) return;

    addMessage("Monsieur", msg, "white");

    // Envoi de l'instruction à O.M.A.R. via Firebase
    push(ref(db, 'nexus/instructions'), {
        instruction: msg,
        timestamp: new Date().toISOString(),
        origine: "MOBILE_TERMINAL",
        statut: "en_attente"
    });

    input.value = "";
});

// Écoute des réponses d'O.M.A.R. en temps réel
const responseRef = ref(db, 'nexus/reponses');
onValue(responseRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Logique pour afficher la dernière réponse non lue
        // (Peut être affinée selon vos besoins de tri)
    }
});

// Analyse au clic sur un actif
window.analyze = function(asset) {
    addMessage("ACTION", `Demande d'analyse flash pour ${asset}...`, "white");
    push(ref(db, 'nexus/instructions'), {
        instruction: `Analyse flash de ${asset}`,
        timestamp: new Date().toISOString(),
        origine: "MOBILE_CLICK",
        statut: "prioritaire"
    });
};
