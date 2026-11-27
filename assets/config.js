// ===== KONFIGURASI =====
const GAS_WEBAPP_URL = "https://script.google.com/macros/s/GANTI/exec";
// QRIS via AstraPay: slug & API key ada di Code.gs (server), bukan di sini, supaya tidak bocor ke browser.
// Harga & nama kasir TIDAK diedit di sini: ubah di assets/harga.json (satu-satunya tempat).
let HARGA_NUGGET_PER_PCS = 2000, ISI_PER_PORSI = 5, HARGA_DALGONA = 12000, NAMA_KASIR = "Haris Mutawakkil", GAMBAR_NUGGET = "img/nugget.svg", GAMBAR_DALGONA = "img/dalgona.svg", BUKA_TANGGAL = "2026-12-10", NOMOR_CASH = "6285178399532";
const ASSET_BASE = document.currentScript.src.replace(/config\.js.*$/, "");
async function loadConfig() {
  try {
    const c = await fetch(ASSET_BASE + "harga.json?t=" + Date.now()).then(r => r.json());
    HARGA_NUGGET_PER_PCS = c.Harga_Nugget_Per_Pcs; ISI_PER_PORSI = c.Isi_Per_Porsi; HARGA_DALGONA = c.Harga_Dalgona; NAMA_KASIR = c.Nama_Kasir;
    if (c.Nomor_Cash) NOMOR_CASH = c.Nomor_Cash;
    if (c.Tanggal_Ambil !== undefined) BUKA_TANGGAL = c.Tanggal_Ambil; // tanggal ambil; "" = tanpa batas (untuk tes)
    if (c.Gambar_Nugget) GAMBAR_NUGGET = c.Gambar_Nugget; if (c.Gambar_Dalgona) GAMBAR_DALGONA = c.Gambar_Dalgona;
  } catch (e) {}
}
// Halaman: / (pelanggan, ?meja=1) | /kasir/ | /dapur-nugget/ | /dapur-dalgona/

