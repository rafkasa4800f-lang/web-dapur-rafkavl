/* ============ DAPUR (satu station per halaman) ============ */
function dapur(s, st) { // st: "Nugget" | "Dalgona"
  let last = -1;
  const nugget = st === "Nugget";
  $("#app").innerHTML = `<div class="flex justify-between items-center mb-3"><h1 class="text-2xl font-bold">${nugget ? "🍗 Station Nugget Geprek" : "☕ Station Dalgona Coffee"}</h1>
    <a class="underline text-sm" href="${nugget ? "../dapur-dalgona/" : "../dapur-nugget/"}">${nugget ? "☕ ke Dalgona" : "🍗 ke Nugget"}</a></div><div id="q"></div>`;
  const draw = async () => {
    const r = await get({action:"get_orders", token:s.token});
    const l = (r.orders || []).filter(o => o.Status_Pembayaran === "LUNAS" && o["Status_" + st] === "DIMASAK");
    if (last >= 0 && l.length > last) beep();
    last = l.length;
    $("#q").innerHTML = l.map((o, i) => {
      const d = JSON.parse(o["Detail_" + st]);
      return `<div class="${CARD}" style="border-left:5px solid ${nugget ? "#fb923c" : "#d6a77a"}"><div class="text-sm">#${i + 1} · ${esc(o.ID_Pesanan)} · ${esc(o.Nomor_Meja)} · ${esc(o.Nama_Pemesan)}</div>
        <div class="text-3xl font-bold my-1">${nugget ? `${d.mode === "p" ? d.qty + " porsi · " : ""}${d.pcs} pcs · Pedas ${d.pedas}` : `${d.cup} cup · ${esc(d.es)} · Gula ${esc(d.gula)}`}</div>
        <div class="mb-2">${esc(d.cat || "")}</div>
        <button class="${BTN} w-full bg-green-600 text-xl" onclick="fin('${o.ID_Pesanan}')">${st.toUpperCase()} SELESAI</button></div>`;
    }).join("") || `<div class="text-center text-stone-400 mt-10">Tidak ada antrean</div>`;
  };
  window.fin = async id => { await api({action:"update_status", type:"station_" + st.toLowerCase(), id, token:s.token}); draw(); };
  draw(); tm = setInterval(draw, 5000);
}
