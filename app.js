const firebaseConfig = {
  databaseURL: "https://omar-system-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔁 MISE À JOUR DU HUD (MARCHÉS RÉELS)
// On écoute le dossier 'trading/markets' mis à jour par Python
db.ref('trading/markets').on('value', (snapshot) => {
    const data = snapshot.val();
    const marketsContainer = document.getElementById("markets");
    
    if (data) {
        console.log("Données de l'Empire reçues, Monsieur !");
        marketsContainer.innerHTML = ""; // On nettoie l'affichage
        
        // On boucle sur chaque actif (XRP, NVDA, etc.)
        Object.keys(data).forEach(key => {
            const d = data[key];
            
            // On détermine la couleur selon la position EMA 200
            const colorClass = d.position_ema === "AU-DESSUS" ? "text-success" : "text-danger";
            
            marketsContainer.innerHTML += `
              <div class="card">
                <div class="card-header"><b>${key}</b></div>
                <div class="card-body">
                    <h3 class="price">${d.prix} $</h3>
                    <p class="${colorClass}"><b>${d.position_ema} EMA 200</b></p>
                    <hr>
                    <div class="indicators">
                        <small>RSI: ${d.rsi}</small> | 
                        <small>STOCH: ${d.stoch_k}</small>
                    </div>
                    <div class="text-muted" style="font-size: 0.7em;">MAJ: ${d.timestamp}</div>
                </div>
              </div>`;
        });
    }
});

// 📡 SIGNAUX (POUR LES ALERTES AGENTS)
db.ref("signals").limitToLast(10).on("child_added", snap => {
    const s = snap.val();
    const signalList = document.getElementById("signalList");
    if (s) {
        signalList.innerHTML =
        `<li class="signal">🌊 ${s.symbole} – RSI ${s.rsi} | ${s.action}</li>` +
        signalList.innerHTML;
    }
});
