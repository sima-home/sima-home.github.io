// Sima Home · yeni görünüm: kaydırmaya bağlı animasyonlar (GSAP + ScrollTrigger + Lenis)
(function () {
  const ust = document.getElementById("ust");
  const azHareket = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Üst şerit: sayfa kayınca koyulaşır
  const ustGuncelle = () => ust.classList.toggle("dolu", scrollY > 40);
  addEventListener("scroll", ustGuncelle, { passive: true });
  ustGuncelle();

  // Kelimeleri tek tek sarar (yanan metin için)
  const metin = document.querySelector(".yanan-metin");
  if (metin) metin.innerHTML = metin.textContent.trim().split(/\s+/).map(k => `<span class="k">${k}</span>`).join(" ");

  if (azHareket || !window.gsap || !window.ScrollTrigger) {
    document.querySelectorAll(".yol-yazi").forEach(y => (y.style.opacity = 1));
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Yumuşak kaydırma
  let lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.simaLenis = lenis;
  }
  // Sayfa içi bağlantılar yumuşak kaysın
  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute("href").length < 2) return;
    const hedef = document.querySelector(a.getAttribute("href"));
    if (!hedef) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(hedef, { duration: 1.6 }) : hedef.scrollIntoView({ behavior: "smooth" });
  });

  // ---------------------------------------------------------------- 1) YOLCULUK
  const katmanlar = gsap.utils.toArray(".yol-katman");
  const yazilar = gsap.utils.toArray(".yol-yazi");
  const yol = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#yolculuk", start: "top top", end: "bottom bottom", scrub: 0.8 }
  });
  // Açılış: dev SIMA harfleri dağılarak kaybolur
  yol.to(".yol-marka span", { yPercent: -30, opacity: 0, filter: "blur(14px)", duration: 0.45, stagger: { each: 0.05, from: "center" } }, 0)
     .to(".yol-alt, .kaydir", { opacity: 0, duration: 0.2 }, 0);
  katmanlar.forEach((k, i) => {
    const img = k.querySelector("img");
    const son = i === katmanlar.length - 1;
    // Her katman pencereye doğru yaklaşır (kamera içeri giriyormuş gibi)
    // 1: dışarıdan pencereye · 2: pencereden içeri · 3: odada perdeye · 4: kumaşa yakın
    // Dik ekranda (telefon) görsel zaten kırpık; odada perdeler kadrajdan çıkmasın diye daha az yaklaşılır
    const dik = innerWidth < innerHeight;
    const hedef = son ? (dik ? 1.15 : 1.3) : (dik ? [2.3, 1.9, 1.12] : [2.5, 2.2, 1.9])[i];
    yol.fromTo(img, { scale: i ? 1.02 : 1 }, { scale: hedef, duration: 1 }, i);
    if (!son) yol.to(katmanlar[i + 1], { opacity: 1, duration: 0.28 }, i + 0.74);
  });
  yazilar.forEach((y, i) => {
    const giris = i + 0.22, son = i === yazilar.length - 1;
    yol.fromTo(y, { opacity: 0, y: 60, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power2.out" }, giris);
    if (!son) yol.to(y, { opacity: 0, y: -50, filter: "blur(10px)", duration: 0.18, ease: "power2.in" }, i + 0.78);
  });
  yol.to(".yol-ilerleme i", { scaleX: 1, duration: katmanlar.length }, 0);

  // ---------------------------------------------------------------- 2) YANAN METİN + SAYILAR
  gsap.to(".yanan-metin .k", {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: { trigger: ".yanan-metin", start: "top 78%", end: "bottom 42%", scrub: true }
  });
  document.querySelectorAll("[data-say]").forEach(el => {
    const hedef = +el.dataset.say, bas = hedef > 1000 ? hedef - 40 : 0, o = { v: bas };
    el.textContent = bas;
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(o, { v: hedef, duration: 1.6, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)) })
    });
  });

  // ---------------------------------------------------------------- 3) KAYAN YAZI (yön ve hız kaydırmaya bağlı)
  const satirlar = gsap.utils.toArray(".kayan-satir").map((satir, i) => {
    const ic = satir.querySelector(".kayan-ic");
    satir.appendChild(ic.cloneNode(true));                     // kesintisiz akış için ikinci kopya
    const kopyalar = satir.querySelectorAll(".kayan-ic");
    const t = i % 2
      ? gsap.fromTo(kopyalar, { xPercent: -100 }, { xPercent: 0, repeat: -1, duration: 34, ease: "none" })
      : gsap.to(kopyalar, { xPercent: -100, repeat: -1, duration: 26, ease: "none" });
    t.totalTime(t.duration() * 1000);                           // geri yönde de durmadan akabilsin
    return t;
  });
  let hizHedef = 1;
  ScrollTrigger.create({
    trigger: ".kayan", start: "top bottom", end: "bottom top",
    onUpdate: s => { hizHedef = s.direction * (1 + Math.min(Math.abs(s.getVelocity()) / 300, 6)); }
  });
  gsap.ticker.add(() => {
    satirlar.forEach(t => { t.timeScale(gsap.utils.interpolate(t.timeScale(), hizHedef, 0.08)); });
    hizHedef = gsap.utils.interpolate(hizHedef, Math.sign(hizHedef) || 1, 0.04);
  });

  // ---------------------------------------------------------------- 4) YATAY GALERİ
  const ray = document.querySelector(".yatay-ray");
  const sahne = document.querySelector(".yatay-sahne");
  const kaydirma = () => Math.max(0, ray.scrollWidth + ray.offsetLeft - innerWidth);
  const yatay = gsap.to(ray, {
    x: () => -kaydirma(), ease: "none",
    scrollTrigger: { trigger: ".yatay", start: "top top", end: () => "+=" + kaydirma(), pin: sahne, scrub: 0.8, invalidateOnRefresh: true }
  });
  gsap.utils.toArray(".kart-gorsel img").forEach(img => {
    gsap.fromTo(img, { yPercent: -8, scale: 1.06 }, { yPercent: 0, scale: 1, ease: "none",
      scrollTrigger: { trigger: img.closest(".kart"), containerAnimation: yatay, start: "left right", end: "right left", scrub: true } });
  });
  gsap.from(".yatay-baslik > *", { y: 50, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: ".yatay", start: "top 70%" } });

  // ---------------------------------------------------------------- 5) LİSTE + üzerine gelince fotoğraf
  gsap.from(".satirlar li", { y: 40, opacity: 0, stagger: 0.08, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".satirlar", start: "top 80%" } });
  const onizleme = document.querySelector(".onizleme");
  if (onizleme && matchMedia("(hover: hover)").matches) {
    const resim = onizleme.querySelector("img");
    const xGit = gsap.quickTo(onizleme, "x", { duration: 0.55, ease: "power3" });
    const yGit = gsap.quickTo(onizleme, "y", { duration: 0.55, ease: "power3" });
    gsap.set(onizleme, { xPercent: -50, yPercent: -50 });
    addEventListener("mousemove", e => { xGit(e.clientX + 150); yGit(e.clientY); });
    document.querySelectorAll(".satirlar a").forEach(a => {
      a.addEventListener("mouseenter", () => { resim.src = a.dataset.resim; gsap.to(onizleme, { opacity: 1, scale: 1, rotate: -3, duration: 0.45, ease: "power3.out" }); });
      a.addEventListener("mouseleave", () => gsap.to(onizleme, { opacity: 0, scale: 0.6, rotate: 0, duration: 0.35 }));
    });
  }

  // ---------------------------------------------------------------- Başlıklar: kelime kelime yükselir
  gsap.utils.toArray(".liste-bas h2, .genis-yazi, .magaza h2").forEach(h => {
    gsap.from(h.children, { yPercent: 60, opacity: 0, filter: "blur(8px)", stagger: 0.12, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: h, start: "top 85%" } });
  });

  // ---------------------------------------------------------------- 6) TAM EKRAN FOTOĞRAF (parallax)
  gsap.fromTo(".genis-gorsel", { yPercent: -8 }, { yPercent: 8, ease: "none",
    scrollTrigger: { trigger: ".genis", start: "top bottom", end: "bottom top", scrub: true } });

  // ---------------------------------------------------------------- 7) MAĞAZA: fotoğraf perde gibi açılır
  gsap.fromTo(".magaza-gorsel", { clipPath: "inset(0% 50% 0% 50%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none",
    scrollTrigger: { trigger: ".magaza", start: "top 85%", end: "top 25%", scrub: true } });
  gsap.fromTo(".magaza-gorsel img", { scale: 1.25 }, { scale: 1, ease: "none",
    scrollTrigger: { trigger: ".magaza", start: "top 85%", end: "bottom top", scrub: true } });
  gsap.from(".adim li", { x: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: ".adim", start: "top 82%" } });

  // ---------------------------------------------------------------- 8) ÇAĞRI: dalgalı yazı yerine oturur
  const harita = document.getElementById("dalga-harita"), turb = document.getElementById("dalga-turb");
  if (harita && turb) {
    const d = { s: 90, f: 0.012 };
    const uygula = () => { harita.setAttribute("scale", d.s.toFixed(1)); turb.setAttribute("baseFrequency", `${d.f.toFixed(4)} ${(d.f * 5).toFixed(4)}`); };
    uygula();
    gsap.to(d, { s: 0, f: 0.004, ease: "none", onUpdate: uygula,
      scrollTrigger: { trigger: ".cagri", start: "top 85%", end: "top 20%", scrub: true } });
    // Üzerine gelince hafifçe tekrar dalgalanır
    const baslik = document.querySelector(".dalgali");
    baslik.addEventListener("mouseenter", () => gsap.fromTo(d, { s: 28 }, { s: 0, duration: 1.2, ease: "power2.out", onUpdate: uygula }));
  }

  // ---------------------------------------------------------------- ALT: dev SIMA yükselir
  gsap.from(".dev-marka span", { yPercent: 100, opacity: 0, stagger: 0.08, duration: 1.2, ease: "power4.out",
    scrollTrigger: { trigger: ".dev-marka", start: "top 95%" } });

  addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
