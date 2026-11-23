/* ============ PELANGGAN ============ */
let cart = {n:null, g:null};
async function cust() {
  if (localStorage.getItem("oid")) return track(localStorage.getItem("oid"));
  await loadConfig();
  const meja = new URLSearchParams(location.search).get("meja");
  cart = {n:null, g:null};
  $("#app").innerHTML = `<div class="hero"><div class="emo">🍗☕</div><h1>Self Order</h1><p>Pesan, bayar, tunggu — tanpa antre</p></div>
  <div class="${CARD}"><input id="nm" placeholder="Nama pemesan" class="${IN}">
    <input id="hp" type="tel" placeholder="No. WhatsApp (08xxx)" class="${IN}">
    ${meja ? `<div>Meja: <b id="mj">${esc(meja)}</b></div>` :
      `<select id="mj" class="${IN}"><option>Takeaway</option>${[1,2,3,4,5,6,7,8,9,10].map(i => `<option>${i}</option>`).join("")}</select>`}</div>
  <div class="${CARD} menu-n"><b class="menu-t">🍗 Nugget Geprek</b> <span class="text-sm text-stone-500">${rp(HARGA_NUGGET_PER_PCS * ISI_PER_PORSI)}/porsi (${ISI_PER_PORSI} pcs) · ${rp(HARGA_NUGGET_PER_PCS)}/pcs</span>
    <select id="nmode" class="${IN} mt-2"><option value="p">Porsi (${ISI_PER_PORSI} pcs)</option><option value="c">Custom pcs</option></select>
    <input id="nq" type="number" min="1" value="1" class="${IN}">
    <select id="np" class="${IN}">${[0,1,2,3,4,5].map(i => `<option value="${i}">Pedas level ${i}</option>`).join("")}</select>
    <input id="nc" placeholder="Catatan" class="${IN}"><button class="${BTN}" onclick="addN()">+ Tambah</button></div>
  <div class="${CARD} menu-g"><b class="menu-t">☕ Dalgona Coffee</b> <span class="text-sm text-stone-500">${rp(HARGA_DALGONA)}/cup</span>
    <input id="gq" type="number" min="1" value="1" class="${IN} mt-2">
    <select id="ge" class="${IN}"><option>Es Normal</option><option>Es Sedikit</option><option>Tanpa Es</option></select>
    <select id="gg" class="${IN}"><option>Normal</option><option>Less</option></select>
    <input id="gc" placeholder="Catatan" class="${IN}"><button class="${BTN}" onclick="addG()">+ Tambah</button></div>
  <div id="cart"></div>`;
  drawCart();
}
function addN() {
  const q = Math.max(1, +$("#nq").value || 1);
  cart.n = {pcs: $("#nmode").value === "p" ? q * ISI_PER_PORSI : q, pedas: +$("#np").value, cat: $("#nc").value};
  drawCart();
}
function addG() {
  cart.g = {cup: Math.max(1, +$("#gq").value || 1), es: $("#ge").value, gula: $("#gg").value, cat: $("#gc").value};
  drawCart();
}
function total(c) { return (c.n ? c.n.pcs * HARGA_NUGGET_PER_PCS : 0) + (c.g ? c.g.cup * HARGA_DALGONA : 0); }
function drawCart() {
  const c = cart;
  $("#cart").innerHTML = `<div class="${CARD}"><b>Keranjang</b>
    ${c.n ? `<div>Nugget: ${c.n.pcs} pcs · Pedas ${c.n.pedas} <button onclick="cart.n=null;drawCart()">❌</button></div>` : ""}
    ${c.g ? `<div>Dalgona: ${c.g.cup} cup · ${c.g.es} · Gula ${c.g.gula} <button onclick="cart.g=null;drawCart()">❌</button></div>` : ""}
    ${!c.n && !c.g ? `<div class="text-stone-400">Kosong</div>` : ""}
    <div class="text-xl font-bold my-2">Total ${rp(total(c))}</div>
    <select id="pay" class="${IN}"><option value="QRIS">QRIS Online</option><option value="OFFLINE">Bayar di Kasir (QR)</option></select>
    <div id="ce" class="text-red-600 text-sm mb-1"></div>
    <button class="${BTN} w-full" onclick="submitOrder()">Pesan Sekarang</button></div>`;
}
async function submitOrder() {
  const nama = $("#nm").value.trim(), hp = $("#hp").value.trim();
  if (!nama || !hp) return $("#ce").textContent = "Nama dan No. WhatsApp wajib diisi";
  if (!cart.n && !cart.g) return $("#ce").textContent = "Pilih menu dulu";
  const meja = $("#mj").value || $("#mj").textContent;
  const r = await api({action:"create_order", nama, hp, meja, nugget:cart.n, dalgona:cart.g, metode:$("#pay").value});
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
        <div>${esc(o.Nama_Pemesan)} · Meja ${esc(o.Nomor_Meja)} · ${rp(o.Total_Harga)}</div></div>
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

