/* ============ KASIR ============ */
function badge(o) {
  if (o.Status_Pembayaran !== "LUNAS") return "Menunggu Bayar";
  if (o.Status_Pesanan === "SIAP_DIAMBIL") return "Siap Diambil";
  if (o.Status_Nugget === "ANTRI" || o.Status_Dalgona === "ANTRI") return "Terjadwal (booking)";
  const p = [];
  if (o.Status_Nugget !== "NONE") p.push("Nugget: " + o.Status_Nugget);
  if (o.Status_Dalgona !== "NONE") p.push("Dalgona: " + o.Status_Dalgona);
  return p.join(" / ");
}
function kasir(s) {
  $("#app").innerHTML = `<h1 class="text-2xl font-bold">Kasir</h1><div class="text-sm text-stone-500 mb-3">👤 ${esc(s.name || NAMA_KASIR)}</div>
  <div class="${CARD}"><button id="sc" class="${BTN}">📷 Scan QR</button><div id="rd" class="mt-2"></div>
    <div class="flex gap-2 mt-2"><input id="mid" placeholder="ID Pesanan" class="${IN} mb-0"><button class="${BTN}" onclick="loadOrder($('#mid').value.trim())">Cari</button></div></div>
  <div id="det"></div><h2 class="font-bold mb-2">Monitor Pesanan</h2><div id="lst"></div>`;
  let sc;
  $("#sc").onclick = () => {
    sc = new Html5Qrcode("rd");
    sc.start({facingMode:"environment"}, {fps:10, qrbox:220}, t => { sc.stop().then(() => sc.clear()); loadOrder(t); });
  };
  window.loadOrder = async id => {
    const o = (await get({action:"get_order_by_id", id})).order;
    if (!o) return $("#det").innerHTML = `<div class="${CARD} text-red-600">Pesanan tidak ditemukan</div>`;
    const n = o.Detail_Nugget ? JSON.parse(o.Detail_Nugget) : null, g = o.Detail_Dalgona ? JSON.parse(o.Detail_Dalgona) : null, tot = +o.Total_Harga;
    if (o.Status_Pembayaran === "LUNAS") return $("#det").innerHTML = `<div class="${CARD}">${esc(o.ID_Pesanan)} sudah LUNAS ✅</div>`;
    $("#det").innerHTML = `<div class="${CARD}"><div class="font-bold">${esc(o.ID_Pesanan)} · ${esc(o.Nama_Pemesan)} · ${esc(o.Nomor_Meja)}</div>
      ${n ? `<div>Nugget ${n.mode === "p" ? n.qty + " porsi = " : ""}${n.pcs} pcs, pedas ${n.pedas}</div>` : ""}${g ? `<div>Dalgona ${g.cup} cup, ${esc(g.es)}, gula ${esc(g.gula)}</div>` : ""}
      <div class="text-4xl font-bold my-2">${rp(tot)}</div>
      <input id="uang" type="number" placeholder="Uang diterima" class="${IN}">
      <div class="flex flex-wrap gap-2 mb-2">${[["Uang Pas", tot], ["20.000", 20000], ["50.000", 50000], ["100.000", 100000]].map(([l, v]) => `<button class="px-3 py-1 rounded bg-stone-200" onclick="$('#uang').value=${v};calc(${tot})">${l}</button>`).join("")}</div>
      <div id="kb" class="text-2xl font-bold mb-2">Kembalian: Rp 0</div>
      <button class="${BTN} w-full bg-green-600" onclick="bayar('${o.ID_Pesanan}')">Konfirmasi Sudah Bayar</button></div>`;
    $("#uang").oninput = () => calc(tot);
  };
  window.calc = tot => { const k = (+$("#uang").value || 0) - tot; $("#kb").textContent = k >= 0 ? "Kembalian: " + rp(k) : "Kurang: " + rp(-k); };
  window.bayar = async id => {
    const r = await api({action:"update_status", type:"payment", id, token:s.token});
    $("#det").innerHTML = `<div class="${CARD}">${r.status === "success" ? "✅ Lunas, diteruskan ke dapur" : esc(r.message)}</div>`; mon();
  };
  const mon = async () => {
    const r = await get({action:"get_orders", token:s.token});
    $("#lst").innerHTML = (r.orders || []).slice().reverse().map(o => `<div class="${CARD} text-sm"><b>${esc(o.ID_Pesanan)}</b> · ${esc(o.Nama_Pemesan)} · ${rp(o.Total_Harga)} · ${o.Metode_Pembayaran === "QRIS" ? "📱 QRIS" : "💵 Cash"}<br><span class="chip">${badge(o)}</span></div>`).join("") || "Belum ada pesanan";
  };
  mon(); tm = setInterval(mon, 5000);
}

