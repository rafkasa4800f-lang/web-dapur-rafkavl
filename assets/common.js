const $ = s => document.querySelector(s);
const rp = n => "Rp " + Number(n).toLocaleString("id-ID");
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IN = "inp w-full mb-2", CARD = "glass p-4 mb-3";
const BTN = "btn";
const api = b => fetch(GAS_WEBAPP_URL, {method:"POST", headers:{"Content-Type":"text/plain"}, body:JSON.stringify(b)}).then(r => r.json());
const get = p => fetch(GAS_WEBAPP_URL + "?" + new URLSearchParams(p)).then(r => r.json());
const beep = () => { try { const a = new AudioContext(), o = a.createOscillator(); o.connect(a.destination); o.frequency.value = 880; o.start(); o.stop(a.currentTime + .5); } catch (e) {} };
let tm;

function guard(role, next) {
  const s = JSON.parse(sessionStorage.getItem("s_" + role) || "null");
  if (s) return next(s);
  $("#app").innerHTML = `<div class="${CARD} mt-10"><h1 class="text-xl font-bold mb-2">Login ${role}</h1>
    <input id="pw" type="password" placeholder="Password" class="${IN}"><div id="le" class="text-red-600 text-sm mb-2"></div>
    <button id="lb" class="${BTN} w-full">Masuk</button></div>`;
  $("#lb").onclick = async () => {
    const r = await api({action:"verify_login", role, password:$("#pw").value});
    if (r.status !== "success") return $("#le").textContent = r.message || "Gagal";
    sessionStorage.setItem("s_" + role, JSON.stringify({role, token:r.token, name:r.name}));
    location.reload();
  };
}

