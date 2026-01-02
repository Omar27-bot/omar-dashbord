// --- CONFIGURATION DU PORTEFEUILLE DE MONSIEUR ---
const portfolioData = {
    "BTC-CAD": { qty: 0.001587, price: 135000 },
    "ETH-CAD": { qty: 0.011276, price: 4600 },
    "XRP-CAD": { qty: 40.0, price: 3.55 },
    "CVS": { qty: 2.7835, price: 112 },
    "FSLR": { qty: 0.1637, price: 315 },
    "GOOGL": { qty: 0.1723, price: 255 },
    "MSFT": { qty: 1.0, price: 590 },
    "SHOP.TO": { qty: 0.2338, price: 145 },
    "VFV.TO": { qty: 0.3727, price: 138 }
};

let wealthHistory = [];
let portfolioChart;

// --- INITIALISATION ---
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    renderWatchlist();
    updateWealth();
    startClock();

    // Listener pour l'entrée utilisateur
    document.getElementById('send-btn').addEventListener('click', askOmar);
});

// --- LOGIQUE D'ÉDITION STYLE "EXCEL" ---
function renderWatchlist() {
    const container = document.getElementById('watchlist-container');
    container.innerHTML = '';

    for (const [sym, data] of Object.entries(portfolioData)) {
        const row = document.createElement('div');
        row.className = 'asset-row';
        row.innerHTML = `
            <span class="asset-name">${sym}</span>
            <input type="number" step="any" class="asset-input" 
                   value="${data.qty}" 
                   onchange="updatePosition('${sym}', this.value)">
            <span class="asset-total" id="total-${sym}">
                ${(data.qty * data.price).toLocaleString()} $
            </span>
        `;
        container.appendChild(row);
    }
}

function updatePosition(sym, newQty) {
    portfolioData[sym].qty = parseFloat(newQty);
    updateWealth();
    document.getElementById(`total-${sym}`).innerText = 
        (portfolioData[sym].qty * portfolioData[sym].price).toLocaleString() + " $";
    
    logToConsole(`Position mise à jour : ${sym} = ${newQty}`);
}

// --- CALCULS ET GRAPHIQUES ---
function updateWealth() {
    let total = 0;
    for (const data of Object.values(portfolioData)) {
        total += data.qty * data.price;
    }

    document.getElementById('total-wealth').innerText = total.toLocaleString() + " CAD";
    
    // Mise à jour du graphique
    wealthHistory.push(total);
    if (wealthHistory.length > 20) wealthHistory.shift();
    updateChartData();
}

function initChart() {
    const ctx = document.getElementById('portfolioChart').getContext('2d');
    portfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                label: 'Net Worth',
                data: wealthHistory,
                borderColor: '#D4AF37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            scales: { y: { display: false }, x: { display: false } },
            plugins: { legend: { display: false } }
        }
    });
}

function updateChartData() {
    portfolioChart.data.datasets[0].data = wealthHistory;
    portfolioChart.update();
}

// --- UTILITAIRES ---
function startClock() {
    setInterval(() => {
        const now = new Date();
        document.getElementById('clock').innerText = now.toLocaleTimeString('fr-FR');
    }, 1000);
}

function logToConsole(msg) {
    const log = document.getElementById('console-log');
    const p = document.createElement('p');
    p.innerHTML = `<strong>[INFO]</strong> ${msg}`;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function askOmar() {
    const input = document.getElementById('user-input');
    const text = input.value;
    if (!text) return;

    logToConsole(`Monsieur: ${text}`);
    input.value = '';
    // Ici, vous pourriez lier un appel API vers votre serveur O.M.A.R.
    setTimeout(() => {
        logToConsole(`O.M.A.R: Monsieur, je traite votre demande concernant vos actifs.`);
    }, 1000);
}
