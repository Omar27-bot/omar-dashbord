const firebaseConfig = {
  databaseURL: "https://omar-system-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// 🔁 PRIX EN TEMPS RÉEL
db.ref("status").on("value", snap => {
  const markets = document.getElementById("markets");
  markets.innerHTML = "";
  snap.forEach(sym => {
    const d = sym.val();
    markets.innerHTML += `
      <div class="card">
        <b>${sym.key}</b><br>
        ${d.price} CAD<br>
        <small>${d.time}</small>
      </div>`;
  });
});

// 📡 SIGNAUX
db.ref("signals").limitToLast(10).on("child_added", snap => {
  const s = snap.val();
  document.getElementById("signalList").innerHTML =
    `<li class="signal">🌊 ${s.symbole} – RSI ${s.rsi}</li>` +
    document.getElementById("signalList").innerHTML;
});
