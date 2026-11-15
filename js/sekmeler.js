// Üst menüdeki her başlık ayrı bir sekme (sayfa) gibi açılır.
// Her bölümün data-sayfa="..." etiketi hangi sekmede görüneceğini söyler.
// Adres çubuğu (#urunler, #renkler ...) değiştiği için geri tuşu ve paylaşılan linkler de çalışır.
(function () {
  const bolumler = [...document.querySelectorAll("[data-sayfa]")];
  if (!bolumler.length) return;
  const ANA_BASLIK = document.title;
  const BASLIK = {
    urunler: "Ürünler", uygulamalar: "Uygulama Örnekleri", renkler: "Renk Kartelası",
    nasil: "Nasıl Çalışırız", online: "Online Mağaza", iletisim: "İletişim"
  };
  const kok = document.documentElement;
  let aktif = null;

  function git(hedefId, yumusak) {
    let hedef = hedefId ? document.getElementById(hedefId) : null;
    if (hedefId === "icerik") hedef = null;                       // "İçeriğe geç" bağlantısı: sekme değişmez
    const kutu = hedef && hedef.closest("[data-sayfa]");
    const sayfa = kutu ? kutu.dataset.sayfa : (hedefId === "icerik" && aktif) || "anasayfa";

    if (sayfa !== aktif) {
      bolumler.forEach(b => { b.hidden = b.dataset.sayfa !== sayfa; });
      aktif = sayfa;
      document.title = BASLIK[sayfa] ? `${BASLIK[sayfa]} | Sima Home` : ANA_BASLIK;
      document.querySelectorAll("#menu a").forEach(a => {
        if (a.getAttribute("href") === "#" + sayfa) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    }

    // Sekmenin ilk bölümüne gidiliyorsa sayfanın en üstü, sekme içindeki bir bölümse (ör. galeri) oraya kaydır
    const ilkBolum = bolumler.find(b => b.dataset.sayfa === sayfa);
    kok.style.scrollBehavior = "auto";                             // sekme değişince anında başa
    if (hedef && kutu && kutu !== ilkBolum) kutu.scrollIntoView({ behavior: yumusak ? "smooth" : "auto" });
    else window.scrollTo(0, 0);
    kok.style.scrollBehavior = "";
  }

  const hash = () => decodeURIComponent(location.hash.slice(1));
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  // Site içi bağlantılar: tarayıcının kendi kaydırması yerine sekmeyi biz açarız
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (href === "#icerik") return;                               // erişilebilirlik bağlantısı normal çalışsın
    e.preventDefault();
    if (href !== location.hash) history.pushState(null, "", href);
    git(href.slice(1), true);
  });
  window.addEventListener("popstate", () => git(hash(), false));   // geri / ileri tuşu
  window.addEventListener("hashchange", () => git(hash(), false)); // adres elle yazılırsa

  git(hash(), false);
})();
