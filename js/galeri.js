// Galeri: js/fotolar.js içindeki fotoğrafları gösterir, kategoriye göre süzer,
// tıklanınca büyük açar (ok tuşları ve kaydırma ile gezilebilir).
(function () {
  const VERI = window.FOTOLAR || {};
  const izgara = document.getElementById("galeri-izgara");
  const filtre = document.getElementById("galeri-filtre");
  const bolum = document.getElementById("galeri");
  if (!izgara || !filtre) return;

  // Tüm fotoğrafları tek listede topla
  const hepsi = [];
  Object.entries(VERI).forEach(([kat, grup]) => {
    grup.fotolar.forEach((f, i) => hepsi.push({ ...f, kat, baslik: grup.baslik, sira: i + 1 }));
  });
  if (!hepsi.length) { if (bolum) bolum.hidden = true; return; }

  const yazi = f => f.kat === "magaza" ? "Mağazamız" : f.baslik + " örneği";
  let gorunen = hepsi;
  let acik = 0;

  function ciz(kat) {
    gorunen = kat ? hepsi.filter(f => f.kat === kat) : hepsi;
    izgara.innerHTML = gorunen.map((f, i) => `
      <button type="button" class="galeri-oge" data-i="${i}" aria-label="${yazi(f)} ${f.sira}, büyüt">
        <img src="${f.k}" alt="${yazi(f)} ${f.sira}" loading="lazy" width="480" height="640">
        <span>${f.baslik}</span>
      </button>`).join("");
    filtre.querySelectorAll("button").forEach(b =>
      b.setAttribute("aria-pressed", String((b.dataset.kat || "") === (kat || ""))));
  }

  // Filtre düğmeleri
  const dugmeler = [`<button type="button" data-kat="">Tümü</button>`]
    .concat(Object.entries(VERI).map(([kat, g]) => `<button type="button" data-kat="${kat}">${g.baslik}</button>`));
  filtre.innerHTML = dugmeler.join("");
  filtre.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) ciz(b.dataset.kat || "");
  });
  ciz("");

  // Ürün kartlarına "Örnekleri gör" bağlantısı
  document.querySelectorAll(".urun[data-kat]").forEach(kart => {
    const kat = kart.dataset.kat;
    if (!VERI[kat]) return;
    const a = document.createElement("a");
    a.className = "metin-link";
    a.href = "#galeri";
    a.textContent = "Örnekleri gör →";
    a.addEventListener("click", () => ciz(kat));
    kart.appendChild(a);
  });

  // Büyük görünüm
  const lb = document.getElementById("lightbox");
  const lbResim = document.getElementById("lb-resim");
  const lbYazi = document.getElementById("lb-yazi");
  if (!lb || typeof lb.showModal !== "function") return;

  function goster(i) {
    acik = (i + gorunen.length) % gorunen.length;
    const f = gorunen[acik];
    lbResim.src = f.b;
    lbResim.alt = `${yazi(f)} ${f.sira}`;
    lbYazi.textContent = `${yazi(f)} · ${acik + 1} / ${gorunen.length}`;
  }
  izgara.addEventListener("click", e => {
    const o = e.target.closest(".galeri-oge");
    if (!o) return;
    goster(+o.dataset.i);
    lb.showModal();
  });
  document.getElementById("lb-kapat").addEventListener("click", () => lb.close());
  document.getElementById("lb-onceki").addEventListener("click", () => goster(acik - 1));
  document.getElementById("lb-sonraki").addEventListener("click", () => goster(acik + 1));
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });   // boşluğa tıklayınca kapan
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") goster(acik - 1);
    if (e.key === "ArrowRight") goster(acik + 1);
  });
  // Telefonda parmakla kaydırma
  let x0 = null;
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) goster(acik + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
