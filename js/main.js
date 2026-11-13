// Sitenin küçük hareketli parçaları:
// 1) ayarlar.js'teki bilgileri sayfaya yerleştirir
// 2) telefonda menüyü açıp kapatır
// 3) alttaki yılı otomatik yazar
(function () {
  const S = window.SIMA || {};
  const EKSIK = "Yakında eklenecek";

  // Gösterim için hazır metinler
  const goster = {
    telefon: S.telefon,
    adres: S.adres,
    saatler: S.saatler,
    whatsappGoster: S.whatsapp ? "+" + S.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5") : "",
    instagramGoster: S.instagram ? "@" + S.instagram : ""
  };

  document.querySelectorAll("[data-bilgi]").forEach(el => {
    const deger = goster[el.dataset.bilgi];
    if (deger) el.textContent = deger;
    else if (!el.textContent.trim()) { el.textContent = EKSIK; el.classList.add("eksik"); }
  });

  // WhatsApp bağlantıları
  const waLink = S.whatsapp
    ? "https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent(S.whatsappMesaj || "")
    : null;
  document.querySelectorAll("[data-wa]").forEach(a => {
    if (waLink) { a.href = waLink; a.target = "_blank"; a.rel = "noopener"; }
    else a.href = "#iletisim";
  });

  // Telefon bağlantısı
  document.querySelectorAll("[data-tel]").forEach(a => {
    if (S.telefon) a.href = "tel:" + S.telefon.replace(/\s/g, "");
    else a.removeAttribute("href");
  });

  // Pazaryeri ve Instagram bağlantıları
  const linkler = {
    trendyol: S.trendyol,
    hepsiburada: S.hepsiburada,
    instagram: S.instagram ? "https://www.instagram.com/" + S.instagram + "/" : ""
  };
  document.querySelectorAll("[data-link]").forEach(a => {
    const url = linkler[a.dataset.link];
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else if (a.dataset.link === "trendyol") { a.hidden = true; }   // askıdaki mağaza hiç görünmesin
    else {
      a.removeAttribute("href");
      a.classList.add("pasif");
      const alt = a.querySelector(".pazar-alt");
      if (alt) alt.textContent = "Bağlantı yakında";
    }
  });

  // Haritada aç
  document.querySelectorAll("[data-harita]").forEach(a => {
    a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(S.haritaArama || "Sima Home Uşak");
  });

  // Telefonda menü
  const dugme = document.querySelector(".menu-dugme");
  const menu = document.getElementById("menu");
  if (dugme && menu) {
    dugme.addEventListener("click", () => {
      const acik = dugme.getAttribute("aria-expanded") === "true";
      dugme.setAttribute("aria-expanded", String(!acik));
      menu.classList.toggle("acik", !acik);
    });
    menu.addEventListener("click", e => {
      if (e.target.closest("a")) {
        dugme.setAttribute("aria-expanded", "false");
        menu.classList.remove("acik");
      }
    });
  }

  const yil = document.getElementById("yil");
  if (yil) yil.textContent = new Date().getFullYear();
})();
