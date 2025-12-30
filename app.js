// Configuration Firebase de l'Empire OMAR-SYSTEM
const firebaseConfig = {
    apiKey: "AIzaSyCc7P7swrV4oXeOxMhFRZScIGmFB-gfkvg", // À récupérer dans votre console Firebase
    authDomain: "omar-system.firebaseapp.com",
    databaseURL: "https://omar-system-default-rtdb.firebaseio.com",
    projectId: "omar-system",
    storageBucket: "omar-system.appspot.com",
    messagingSenderId: "571385162146",
    appId: "1:571385162146:web:6763c7f74f02fc0f2ceafb"
};

// Importation des modules Firebase (version CDN pour mobile)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js";

// Initialisation de la connexion
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- GESTION DU GRAPHIQUE (CHART.JS) ---
const ctx = document.getElementById('portfolioChart').getContext('2d');
const portfolioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Crypto', 'Actions', 'Immo', 'Cash'],
        datasets: [{
            data: [45, 35, 12, 8],
            backgroundColor: ['#D4AF37', '#AA8A2E', '#856A20', '#634F18'],
            borderColor: '#050505',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: { legend: { display: false } },
        cutout: '70%'
    }
});

// --- ÉLÉMENTS DE L'INTERFACE ---
const input = document.getElementById('user-input');
const btn = document.getElementById('send-btn');
const history = document.getElementById('chat-history');

// Fonction pour afficher les messages dans la console mobile
function addMessage(sender, text, color = "#D4AF37") {
    const p = document.createElement('p');
    p.style.marginBottom = "10px";
    p.innerHTML = `<b style="color:${color}">${sender}:</b> ${text}`;
    history.appendChild(p);
    history.scrollTop = history.scrollHeight;
}

// --- ENVOI DES ORDRES SÉCURISÉS ---
function envoyerOrdre(message, type = "MANUEL") {
    if(!message) return;

    // Ajout visuel immédiat pour Monsieur
    if(type === "MANUEL") addMessage("Monsieur", message, "white");

    // Envoi vers le Cloud avec la Clé de Validation
    push(ref(db, 'nexus/instructions'), {
        instruction: message,
        cle_secrete: 'OMAR_SECURE_2025', // Clé autorisant l'écriture sur Firebase
        timestamp: new Date().toISOString(),
        origine: "MOBILE_TERMINAL",
        priorite: type === "PRIORITAIRE" ? 1 : 0
    }).then(() => {
        if(type === "MANUEL") {
            setTimeout(() => {
                addMessage("O.M.A.R.", "Ordre transmis au Cerveau, Monsieur. Transmission Nexus établie.");
            }, 800);
        }
    }).catch((error) => {
        addMessage("ERREUR", "Échec de transmission. Vérifiez votre connexion, Monsieur.", "#ff4444");
    });
}

// Événement clic sur le bouton d'envoi
btn.addEventListener('click', () => {
    const msg = input.value;
    envoyerOrdre(msg);
    input.value = "";
});

// Support de la touche "Entrée"
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const msg = input.value;
        envoyerOrdre(msg);
        input.value = "";
    }
});

// --- ANALYSE AU CLIC SUR LA WATCHLIST ---
window.analyze = function(asset) {
    addMessage("ACTION", `Analyse flash demandée pour <b>${asset}</b>...`, "white");
    envoyerOrdre(`Analyse flash de ${asset} pour mon terminal mobile`, "PRIORITAIRE");
};

// Écoute des alertes système (optionnel)
const systemRef = ref(db, 'nexus/alertes');
onValue(systemRef, (snapshot) => {
    const alerte = snapshot.val();
    if(alerte) {
        addMessage("SYSTÈME", alerte.message, "#ff4444");
    }
});
