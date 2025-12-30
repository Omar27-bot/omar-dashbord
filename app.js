// Initialisation du graphique de Monsieur
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

// Gestion du dialogue
const input = document.getElementById('user-input');
const btn = document.getElementById('send-btn');
const history = document.getElementById('chat-history');

function addMessage(sender, text, color = "#D4AF37") {
    const p = document.createElement('p');
    p.innerHTML = `<b style="color:${color}">${sender}:</b> ${text}`;
    history.appendChild(p);
    history.scrollTop = history.scrollHeight;
}

btn.addEventListener('click', () => {
    const msg = input.value;
    if(!msg) return;
    addMessage("Monsieur", msg, "white");
    input.value = "";
    
    // Ici, vous pourriez appeler votre API Firebase pour déclencher O.M.A.R.
    setTimeout(() => {
        addMessage("O.M.A.R.", "Ordre reçu, Monsieur. Analyse en cours via Nexus.");
    }, 1000);
});

// Analyse au clic
function analyze(asset) {
    addMessage("ACTION", `Analyse prioritaire de ${asset}...`, "white");
    // Simulation de réponse
    setTimeout(() => {
        addMessage("O.M.A.R.", `Monsieur, ${asset} montre des signes de croissance vers notre objectif de 12%.`);
    }, 800);
}
