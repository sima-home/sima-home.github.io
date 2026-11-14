// Ortak büyük fotoğraf penceresi. Kullanım:
//   SimaLightbox.ac([{ src: "img/...webp", yazi: "Açıklama" }, ...], baslangicSirasi)
(function () {
  const lb = document.getElementById("lightbox");
  const resim = document.getElementById("lb-resim");
  const yazi = document.getElementById("lb-yazi");
  let liste = [], sira = 0;

  function goster(i) {
    sira = (i + liste.length) % liste.length;
    resim.src = liste[sira].src;
    resim.alt = liste[sira].yazi;
    yazi.textContent = liste.length > 1 ? `${liste[sira].yazi} · ${sira + 1} / ${liste.length}` : liste[sira].yazi;
    const tek = liste.length < 2;
    document.getElementById("lb-onceki").hidden = tek;
    document.getElementById("lb-sonraki").hidden = tek;
  }

  window.SimaLightbox = {
    ac(yeniListe, i) {
      if (!lb || typeof lb.showModal !== "function") { window.open(yeniListe[i || 0].src, "_blank"); return; }
      liste = yeniListe;
      goster(i || 0);
      if (!lb.open) lb.showModal();
    }
  };
  if (!lb) return;

  document.getElementById("lb-kapat").addEventListener("click", () => lb.close());
  document.getElementById("lb-onceki").addEventListener("click", () => goster(sira - 1));
  document.getElementById("lb-sonraki").addEventListener("click", () => goster(sira + 1));
  lb.addEventListener("click", e => { if (e.target === lb) lb.close(); });       // boşluğa tıklayınca kapan
  lb.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") goster(sira - 1);
    if (e.key === "ArrowRight") goster(sira + 1);
  });
  let x0 = null;                                                                  // telefonda kaydırma
  lb.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", e => {
    if (x0 === null || liste.length < 2) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) goster(sira + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();
