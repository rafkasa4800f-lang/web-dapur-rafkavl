/* ============ PELANGGAN (Take Away) ============ */
let cart = {n:null, g:null}, f = {}, co = {nama:"", hp:"", pay:"QRIS"};
const total = c => (c.n ? c.n.pcs * HARGA_NUGGET_PER_PCS : 0) + (c.g ? c.g.cup * HARGA_DALGONA : 0);
const chips = (key, opts, sel, fn = "setF") => `<div class="chips">${opts.map(([v, l]) => `<button class="ch ${String(v) === String(sel) ? "on" : ""}" onclick="${fn}('${key}','${v}')">${l}</button>`).join("")}</div>`;

async function cust() {
  if (localStorage.getItem("oid")) return track(localStorage.getItem("oid"));
  await loadConfig();
  cart = {n:null, g:null};
  $("#app").innerHTML = `<div class="hero"><span class="pill">🛍️ Take Away</span><h1>Nugget Geprek<br>&amp; Dalgona Coffee</h1><p>Pesan sendiri, bayar, ambil — tanpa antre</p></div>
    <div class="grid">${prod("n")}${prod("g")}</div><div id="bar"></div><div id="sheet"></div>`;
}
function prod(k) {
  const n = k === "n";
  return `<div class="prod ${n ? "menu-n" : "menu-g"}"><div class="ph" data-e="${n ? "🍗" : "☕"}"><img src="${ASSET_BASE + (n ? GAMBAR_NUGGET : GAMBAR_DALGONA)}" alt="" onerror="this.parentNode.classList.add('nofoto');this.remove()"></div>
    <div class="pb"><b class="menu-t">${n ? "Nugget Geprek" : "Dalgona Coffee"}</b>
    <div class="text-sm text-stone-500">${n ? `${rp(HARGA_NUGGET_PER_PCS)}/pcs · ${rp(HARGA_NUGGET_PER_PCS * ISI_PER_PORSI)}/porsi` : `${rp(HARGA_DALGONA)}/cup`}</div>
    <button class="${BTN} w-full mt-2" onclick="openSheet('${k}')">+ Pesan</button></div></div>`;
}
function drawBar() {
  $("#bar").innerHTML = total(cart) ? `<div class="bar"><div><div class="text-xs text-stone-500">Total</div><b class="text-xl">${rp(total(cart))}</b></div><button class="${BTN}" onclick="drawCo()">Checkout →</button></div>` : "";
}
function openSheet(k) {
  f = k === "n" ? {k, mode:"p", q:1, pedas:2, cat:""} : {k, q:1, es:"Es Normal", gula:"Normal", cat:""};
  drawSheet();
}
const pcs = () => f.mode === "p" ? f.q * ISI_PER_PORSI : f.q;
const price = () => f.k === "n" ? pcs() * HARGA_NUGGET_PER_PCS : f.q * HARGA_DALGONA;
function setF(k, v) { f[k] = k === "pedas" ? +v : v; drawSheet(); }
function stp(d) { f.q = Math.max(1, f.q + d); drawSheet(); }
function drawSheet() {
  const n = f.k === "n";
  $("#sheet").innerHTML = `<div class="ov" onclick="closeSheet()"></div><div class="sh"><div class="grab"></div>
    <h2 class="menu-t text-xl mb-3">${n ? "🍗 Nugget Geprek" : "☕ Dalgona Coffee"}</h2>
    ${n ? `<div class="lbl">Mode</div>${chips("mode", [["p", `Porsi (${ISI_PER_PORSI} pcs)`], ["c", "Custom pcs"]], f.mode)}` : ""}
    <div class="lbl">${n ? (f.mode === "p" ? "Jumlah porsi" : "Jumlah pcs") : "Jumlah cup"}</div>
    <div class="step"><button onclick="stp(-1)">−</button><b>${f.q}</b><button onclick="stp(1)">+</button>${n ? `<span class="text-sm text-stone-500">= ${pcs()} pcs</span>` : ""}</div>
    ${n ? `<div class="lbl">Level pedas</div>${chips("pedas", [0, 1, 2, 3, 4, 5].map(i => [i, i]), f.pedas)}`
        : `<div class="lbl">Es</div>${chips("es", [["Es Normal", "Normal"], ["Es Sedikit", "Sedikit"], ["Tanpa Es", "Tanpa"]], f.es)}<div class="lbl">Gula</div>${chips("gula", [["Normal", "Normal"], ["Less", "Less"]], f.gula)}`}
    <input class="${IN} mt-3" placeholder="Catatan (opsional)" value="${esc(f.cat)}" oninput="f.cat=this.value">
    <button class="${BTN} w-full" onclick="saveItem()">Tambah • ${rp(price())}</button></div>`;
}
function saveItem() {
  if (f.k === "n") cart.n = {pcs:pcs(), pedas:f.pedas, cat:f.cat}; else cart.g = {cup:f.q, es:f.es, gula:f.gula, cat:f.cat};
  closeSheet(); drawBar();
}
function closeSheet() { $("#sheet").innerHTML = ""; }
function setCo(k, v) { co[k] = v; drawCo(); }
function rmItem(k) { cart[k] = null; drawBar(); total(cart) ? drawCo() : closeSheet(); }
function drawCo() {
  const c = cart;
  $("#sheet").innerHTML = `<div class="ov" onclick="closeSheet()"></div><div class="sh"><div class="grab"></div><h2 class="menu-t text-xl mb-2">Keranjang · Take Away</h2>
    ${c.n ? `<div class="row">🍗 Nugget ${c.n.pcs} pcs · Pedas ${c.n.pedas}<button onclick="rmItem('n')">✕</button></div>` : ""}
    ${c.g ? `<div class="row">☕ Dalgona ${c.g.cup} cup · ${esc(c.g.es)}<button onclick="rmItem('g')">✕</button></div>` : ""}
    <input class="${IN} mt-2" placeholder="Nama pemesan" value="${esc(co.nama)}" oninput="co.nama=this.value">
    <input type="tel" class="${IN}" placeholder="No. WhatsApp (08xxx)" value="${esc(co.hp)}" oninput="co.hp=this.value">
    <div class="lbl">Pembayaran</div>${chips("pay", [["QRIS", "QRIS Online"], ["OFFLINE", "Bayar di Kasir"]], co.pay, "setCo")}
    <div id="ce" class="text-red-600 text-sm mt-2"></div>
    <button class="${BTN} w-full mt-2" onclick="submitOrder()">Pesan • ${rp(total(c))}</button></div>`;
}
async function submitOrder() {
  if (!co.nama.trim() || !co.hp.trim()) return $("#ce").textContent = "Nama dan No. WhatsApp wajib diisi";
  const r = await api({action:"create_order", nama:co.nama.trim(), hp:co.hp.trim(), meja:"Takeaway", nugget:cart.n, dalgona:cart.g, metode:co.pay});
  if (r.status !== "success") return $("#ce").textContent = r.message || "Gagal";
  localStorage.setItem("oid", r.id);
  track(r.id);
}

const LBL = {MENUNGGU:"Menunggu Bayar 💳", DIMASAK:"Sedang Dibuat ⏳", SELESAI:"Selesai ✅"};
async function track(id) {
  $("#app").innerHTML = `<div id="t"></div>`;
  let built = false, alerted = false;
  const tick = async () => {
    const r = await get({action:"get_order_by_id", id}), o = r.order;
    if (!o) return $("#t").innerHTML = `<div class="${CARD}">Pesanan tidak ditemukan.</div><button class="${BTN}" onclick="newOrder()">Pesan baru</button>`;
    if (!built) {
      built = true;
      $("#t").innerHTML = `<div class="${CARD}"><div class="text-sm">ID Pesanan</div><div class="text-xl font-bold">${esc(o.ID_Pesanan)}</div>
        <div>${esc(o.Nama_Pemesan)} · ${esc(o.Nomor_Meja)} · ${rp(o.Total_Harga)}</div></div>
        <div id="pay" class="${CARD} flex flex-col items-center"></div><div id="st"></div>
        <button class="${BTN} mt-3" onclick="newOrder()">Pesan baru</button>`;
      const box = $("#pay");
      if (o.Status_Pembayaran !== "LUNAS") {
        box.innerHTML = `<div class="mb-2 font-semibold">${o.Metode_Pembayaran === "QRIS" ? "Scan QRIS untuk membayar" : "Tunjukkan QR ini ke kasir"}</div><div id="qr"></div>`;
        if (o.Metode_Pembayaran === "QRIS") makeQris(o); else new QRCode($("#qr"), {text:o.ID_Pesanan, width:200, height:200});
      } else box.remove();
    }
    if (o.Status_Pembayaran !== "LUNAS" && o.Metode_Pembayaran === "QRIS")
      get({action:"check_qris", id}).then(r => { if (r.gw === "expired" && $("#qr")) $("#qr").innerHTML = "⛔ QRIS kedaluwarsa. Silakan pesan ulang."; });
    if (o.Status_Pembayaran === "LUNAS" && $("#pay")) $("#pay").remove();
    const siap = o.Status_Pesanan === "SIAP_DIAMBIL";
    $("#st").innerHTML = (siap ? `<div class="ready">✅ PESANAN SIAP DIAMBIL!</div>` : "") +
      `<div class="${CARD}">${o.Status_Nugget !== "NONE" ? `<div class="row">🍗 Nugget Geprek<span class="chip c-${o.Status_Nugget}">${LBL[o.Status_Nugget]}</span></div>` : ""}
       ${o.Status_Dalgona !== "NONE" ? `<div class="row">☕ Dalgona Coffee<span class="chip c-${o.Status_Dalgona}">${LBL[o.Status_Dalgona]}</span></div>` : ""}</div>`;
    if (siap && !alerted) { alerted = true; beep(); }
  };
  await tick();
  tm = setInterval(tick, 4000);
}
async function makeQris(o) {
  const d = (await get({action:"get_qris", id:o.ID_Pesanan})).data;
  if (!d) return $("#qr").textContent = "Gagal memuat QRIS, pilih bayar di kasir.";
  new QRCode($("#qr"), {text:d.qris, width:220, height:220});
  $("#qr").insertAdjacentHTML("afterend", `<div class="mt-2 font-bold">Bayar tepat ${rp(d.pay_amount)}</div><a class="underline text-sm" target="_blank" href="${esc(d.checkout_url)}">Buka halaman bayar</a>`);
}
function newOrder() { localStorage.removeItem("oid"); clearInterval(tm); cust(); }

