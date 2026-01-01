// --- CONFIGURATION FIREBASE (NEXUS) ---
// Note : Assurez-vous que les scripts Firebase sont bien chargés dans votre index.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    databaseURL: "https://omar-system-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- GESTION DU TEMPS RÉEL (Correctif de la date figée) ---
function updateClock() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('clock').textContent = now.toLocaleDateString('fr-FR', options);
}
setInterval(updateClock, 1000);
updateClock();

// --- VISUALISATION DU PORTEFEUILLE (1009.09 $) ---
const ctx = document.getElementById('portfolioChart').getContext('2d');
const portfolioChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Actions/FNB', 'Crypto', 'Cash'],
        datasets: [{
            data: [630.93, 342.69, 35.47], // Vos chiffres exacts
            backgroundColor: ['#D4AF37', '#AA8A2E', '#634F18'],
            borderColor: '#050505',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: { legend: { display: false } }
    }
});

// --- MOTEUR DE DIALOGUE AVEC O.M.A.R. ---
const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const chatHistory = document.getElementById('chat-history');

async function sendMessage() {
    const message = userInput.value.trim();
    if (message === "") return;

    // Affichage immédiat pour Monsieur
    chatHistory.innerHTML += `<div style="margin-bottom:10px; color:white;"><b>Monsieur:</b> ${message}</div>`;
    userInput.value = "";

    try {
        // Envoi de l'ordre vers le Nexus Cloud
        await push(ref(db, 'nexus/instructions'), {
            instruction: message,
            timestamp: serverTimestamp(),
            client: "Mobile_Interface",
            status: "en_attente"
        });

        chatHistory.innerHTML += `<div style="margin-bottom:10px; color:#D4AF37; font-style:italic;">O.M.A.R. traite votre demande...</div>`;
    } catch (error) {
        chatHistory.innerHTML += `<div style="color:red;">Erreur de liaison Nexus : ${error.message}</div>`;
    }
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

// --- GESTION DE LA WATCHLIST ---
window.analyze = function(asset) {
    userInput.value = `Analyse flash de ${asset}`;
    sendMessage();
};
