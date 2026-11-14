// Uygulama örnekleri (oda görselleri) ve renk kartelası bölümlerini çizer.
// Veri: js/kartela.js (araclar/kartela-hazirla.py üretir)
(function () {
  const K = window.KARTELA;
  if (!K) return;
  const ac = (liste, i) => window.SimaLightbox && SimaLightbox.ac(liste, i);

  // ---- Uygulama örnekleri
  const odaIzgara = document.getElementById("oda-izgara");
  if (odaIzgara && K.odalar) {
    odaIzgara.innerHTML = K.odalar.map((o, i) => `
      <figure class="oda">
        <button type="button" class="oda-gorsel" data-i="${i}" aria-label="${o.urun}, ${o.alt}: büyüt">
          <img src="${o.k}" alt="${o.urun} uygulama örneği: ${o.alt}" loading="lazy" width="${o.w}" height="${o.h}">
        </button>
        <figcaption><strong>${o.urun}</strong>${o.alt}</figcaption>
      </figure>`).join("");
    odaIzgara.addEventListener("click", e => {
      const b = e.target.closest(".oda-gorsel");
      if (b) ac(K.odalar.map(o => ({ src: o.b, yazi: `${o.urun} · ${o.alt}` })), +b.dataset.i);
    });
  }

  // ---- Renk kartelası
  const sekmeler = document.getElementById("kartela-sekme");
  const icerik = document.getElementById("kartela-icerik");
  if (!sekmeler || !icerik) return;
  const SIRA = ["fon", "stor", "zebra", "gunesslik-karartma"].filter(k => K[k]);
  let listeler = {};      // tıklanınca açılacak fotoğraf listeleri

  function modelKartlari(urun) {
    return `<div class="model-izgara">` + K[urun].modeller.map((m, i) => {
      listeler[`${urun}-${i}`] = [
        { src: m.kapak.b, yazi: `${m.ad} · kumaş ve renk kartelası` },
        { src: m.yakin.b, yazi: `${m.ad} · yakın çekim` },
        { src: m.kartela.b, yazi: `${m.ad} · renk kartelası` }];
      return `
      <article class="model">
        <button type="button" class="model-gorsel" data-liste="${urun}-${i}" aria-label="${m.ad} yakın çekim ve kartelası, büyüt">
          <img src="${m.kapak.k}" alt="${m.ad} kumaşı yakın çekim ve renk kartelası" loading="lazy" width="${m.kapak.w}" height="${m.kapak.h}">
        </button>
        <h3>${m.ad}</h3>
        <p>${m.aciklama}</p>
      </article>`;
    }).join("") + `</div>`;
  }

  function renkKareleri(anahtar, renkler, onEk, sinif = "") {
    listeler[anahtar] = renkler.map(r => ({ src: r.b, yazi: `${onEk}${r.ad}` }));
    return `<div class="renk-izgara ${sinif}">` + renkler.map((r, i) => `
      <button type="button" class="renk" data-liste="${anahtar}" data-i="${i}" aria-label="${onEk}${r.ad}, büyüt">
        <img src="${r.k}" alt="${onEk}${r.ad}" loading="lazy">
        <span>${r.ad}</span>
      </button>`).join("") + `</div>`;
  }

  function ciz(urun) {
    listeler = {};
    let html = "";
    if (urun === "stor") {
      html = K.stor.seriler.map((s, i) => `
        <div class="seri">
          <h3>${s.ad}</h3><p>${s.aciklama}</p>
          ${renkKareleri(`stor-${i}`, s.renkler, `Stor ${s.ad} · `, "dikey")}
        </div>`).join("");
      if (K.stor.etek) {
        listeler["stor-etek"] = [{ src: K.stor.etek.b, yazi: "Stor etek ve lazer kesim modelleri" }];
        html += `
        <div class="seri">
          <h3>Etek ve lazer kesim modelleri</h3><p>Storunuzun alt kenarını dilediğiniz modelde kestiriyoruz.</p>
          <button type="button" class="etek" data-liste="stor-etek" aria-label="Etek ve lazer kesim modelleri, büyüt">
            <img src="${K.stor.etek.k}" alt="Stor etek ve lazer kesim modelleri" loading="lazy">
          </button>
        </div>`;
      }
    } else if (urun === "zebra") {
      html = renkKareleri("zebra", K.zebra.modeller, "Zebra · ") + (K.zebra.not ? `<p class="kucuk-not">${K.zebra.not}</p>` : "");
    } else {
      html = modelKartlari(urun);
    }
    icerik.innerHTML = html;
    sekmeler.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.urun === urun)));
    sekmeler.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.urun === urun)));
  }

  sekmeler.innerHTML = SIRA.map(k => `<button type="button" role="tab" data-urun="${k}">${K[k].baslik}</button>`).join("");
  sekmeler.addEventListener("click", e => {
    const b = e.target.closest("button[data-urun]");
    if (b) ciz(b.dataset.urun);
  });
  icerik.addEventListener("click", e => {
    const b = e.target.closest("[data-liste]");
    if (b && listeler[b.dataset.liste]) ac(listeler[b.dataset.liste], +(b.dataset.i || 0));
  });
  ciz(SIRA[0]);

  // Ürün kartlarına "Renkleri gör" bağlantısı
  document.querySelectorAll(".urun[data-kat]").forEach(kart => {
    const kat = kart.dataset.kat;
    if (!SIRA.includes(kat)) return;
    const a = document.createElement("a");
    a.className = "metin-link";
    a.href = "#renkler";
    a.textContent = "Renkleri gör →";
    a.addEventListener("click", () => ciz(kat));
    kart.appendChild(a);
  });
})();
