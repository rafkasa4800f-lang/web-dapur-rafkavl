// ===== KONFIGURASI =====
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/GANTI/exec";
// QRIS via AstraPay: slug & API key ada di Code.gs (server), bukan di sini, supaya tidak bocor ke browser.
// Harga & nama kasir TIDAK diedit di sini: ubah di assets/harga.json (satu-satunya tempat).
let HARGA_NUGGET_PER_PCS = 2000, ISI_PER_PORSI = 5, HARGA_DALGONA = 12000, NAMA_KASIR = "Haris Mutawakkil";
const ASSET_BASE = document.currentScript.src.replace(/config\.js.*$/, "");
async function loadConfig() {
  try {
    const c = await fetch(ASSET_BASE + "harga.json?t=" + Date.now()).then(r => r.json());
    HARGA_NUGGET_PER_PCS = c.Harga_Nugget_Per_Pcs; ISI_PER_PORSI = c.Isi_Per_Porsi; HARGA_DALGONA = c.Harga_Dalgona; NAMA_KASIR = c.Nama_Kasir;
  } catch (e) {}
}
// Halaman: / (pelanggan, ?meja=1) | /kasir/ | /dapur-nugget/ | /dapur-dalgona/

