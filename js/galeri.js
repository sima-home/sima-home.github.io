// Galeri: js/fotolar.js içindeki fotoğrafları gösterir, kategoriye göre süzer,
// tıklanınca ortak büyük görünümde (lightbox.js) açar.
(function () {
  const VERI = window.FOTOLAR || {};
  const izgara = document.getElementById("galeri-izgara");
  const filtre = document.getElementById("galeri-filtre");
  const bolum = document.getElementById("galeri");
  if (!izgara || !filtre) return;

  const hepsi = [];
  Object.entries(VERI).forEach(([kat, grup]) => {
    grup.fotolar.forEach((f, i) => hepsi.push({ ...f, kat, baslik: grup.baslik, sira: i + 1 }));
  });
  if (!hepsi.length) { if (bolum) bolum.hidden = true; return; }

  const yazi = f => f.kat === "magaza" ? "Mağazamız" : f.baslik + " örneği";
  let gorunen = hepsi;

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

  filtre.innerHTML = [`<button type="button" data-kat="">Tümü</button>`]
    .concat(Object.entries(VERI).map(([kat, g]) => `<button type="button" data-kat="${kat}">${g.baslik}</button>`))
    .join("");
  filtre.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (b) ciz(b.dataset.kat || "");
  });
  ciz("");

  // Ürün kartlarına "Örnekleri gör" (sadece galeride fotoğrafı olan ürünler, örn. tül)
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

  izgara.addEventListener("click", e => {
    const o = e.target.closest(".galeri-oge");
    if (!o || !window.SimaLightbox) return;
    SimaLightbox.ac(gorunen.map(f => ({ src: f.b, yazi: yazi(f) })), +o.dataset.i);
  });
})();
