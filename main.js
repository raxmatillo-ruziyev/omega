/* =========================================================
   Omega — js/main.js  (vanilla JS, kutubxonasiz)
   ========================================================= */
   (() => {
    "use strict";
    window.omegaReady = true;
  
    /* Formani haqiqiy servisga ulash uchun manzilni shu yerga yozing
       (masalan Formspree: "https://formspree.io/f/xxxxxxx").
       Bo'sh qoldirilsa forma "demo" rejimida ishlaydi. */
    const CONFIG = { formEndpoint: "" };
  
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    const nav = $(".nav");
    const menu = $("#menu");
    const burger = $("#burger");
    const progress = $(".progress");
  
    /* ---------- Menyu (mobil) ---------- */
    const toggleMenu = (open = !menu.classList.contains("is-open")) => {
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    };
    burger?.addEventListener("click", () => toggleMenu());
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(false); });
    document.addEventListener("click", (e) => {
      if (menu.classList.contains("is-open") && !e.target.closest(".nav")) toggleMenu(false);
    });
  
    /* ---------- Sekin, yumshoq anchor scroll ---------- */
    let rafId = 0;
    const easeInOutCubic = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  
    const animateScroll = (targetY) => {
      cancelAnimationFrame(rafId);
      const startY = scrollY;
      const dist = targetY - startY;
      if (reduceMotion || Math.abs(dist) < 2) { scrollTo(0, targetY); return; }
      const duration = Math.min(1800, Math.max(900, Math.abs(dist) * .6));
      const t0 = performance.now();
      const stop = () => cancelAnimationFrame(rafId);
      addEventListener("wheel", stop, { once: true, passive: true });
      addEventListener("touchstart", stop, { once: true, passive: true });
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        scrollTo(0, startY + dist * easeInOutCubic(p));
        if (p < 1) rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };
  
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      e.preventDefault();
      toggleMenu(false);
      if (id === "#") return animateScroll(0);
      const target = $(id);
      if (!target) return;
      const offset = id === "#home" ? 0 : nav.offsetHeight + 8;
      animateScroll(Math.max(0, target.getBoundingClientRect().top + scrollY - offset));
      history.replaceState(null, "", id);
    });
  
    /* ---------- Scroll: chiziq, header, scrollspy ---------- */
    const links = $$('.nav__menu a[href^="#"]:not(.btn)');
    const spy = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
    let ticking = false;
  
    const onScroll = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
      nav.classList.toggle("is-scrolled", scrollY > 8);
  
      let current = "";
      const line = scrollY + innerHeight * .35;
      spy.forEach((s) => { if (s.offsetTop <= line) current = s.id; });
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = spy[spy.length - 1].id;
      links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + current));
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  
    /* ---------- Reveal ---------- */
    const reveals = $$(".reveal");
    if ("IntersectionObserver" in window && !reduceMotion) {
      // Bir guruhdagi elementlar ketma-ket (stagger) chiqadi
      $$(".reviews__grid, .steps, .perks, .dests, .plans, .faq").forEach((g) =>
        $$(".reveal, .step", g).forEach((el, i) => el.style.setProperty("--d", i)));
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const el = en.target, d = +(el.style.getPropertyValue("--d") || 0);
          el.classList.add("is-visible");
          io.unobserve(el);
          // Animatsiya tugagach .reveal olib tashlanadi, shunda hover (ko'tarilish) ishlay oladi
          setTimeout(() => el.classList.remove("reveal", "is-visible"), 1300 + d * 120);
        });
      }, { threshold: .15, rootMargin: "0px 0px -6% 0px" });
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add("is-visible"));
    }
  
    /* ---------- Raqamlar sanaladi ---------- */
    const counters = $$("[data-count]");
    const fmt = (el, v) => (el.dataset.decimals ? v.toFixed(+el.dataset.decimals) : Math.round(v)) + (el.dataset.suffix || "");
    const runCount = (el) => {
      const end = parseFloat(el.dataset.count), dur = 2000, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = fmt(el, end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if ("IntersectionObserver" in window && !reduceMotion) {
      const co = new IntersectionObserver((es) => es.forEach((en) => {
        if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); }
      }), { threshold: .6 });
      counters.forEach((c) => co.observe(c));
    }
  
    /* FAQ akkordeoni index.html oxirida (alohida skript), main.js'ga bog'liq emas */
  
    /* ---------- Kursor ostida yoruqlik ---------- */
    $$(".spot").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", e.clientX - r.left + "px");
        el.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  
    /* ---------- Hero parallaks ---------- */
    const art = $(".hero__art");
    const hero = $(".hero");
    if (art && hero && !reduceMotion && matchMedia("(hover: hover)").matches) {
      hero.addEventListener("pointermove", (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        art.style.setProperty("--px", (x * 18).toFixed(1) + "px");
        art.style.setProperty("--py", (y * 14).toFixed(1) + "px");
      });
      hero.addEventListener("pointerleave", () => {
        art.style.setProperty("--px", "0px");
        art.style.setProperty("--py", "0px");
      });
    }
  
    /* ---------- YouTube: bosilganda yuklanadi (tez sayt) ---------- */
    const video = $(".video[data-video]");
    if (video) {
      const id = video.dataset.video;
      video.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg), linear-gradient(135deg, #5454d4, #f04037)`;
      $(".video__play", video).addEventListener("click", () => {
        const f = document.createElement("iframe");
        f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        f.title = "Omega video";
        f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        f.allowFullscreen = true;
        video.replaceChildren(f);
      });
    }
  
    /* ---------- Forma ---------- */
    $$("form[data-form]").forEach((form) => {
      const status = form.nextElementSibling;
      const input = $("input[type=email]", form);
      const btn = $("button", form);
      const say = (msg, cls) => { status.textContent = msg; status.className = "form-status " + cls; };
  
      input.addEventListener("input", () => form.classList.remove("is-invalid"));
  
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        form.classList.toggle("is-invalid", !ok);
        if (!ok) { say("Please enter a valid email address.", "is-error"); input.focus(); return; }
  
        btn.disabled = true;
        try {
          if (CONFIG.formEndpoint) {
            const res = await fetch(CONFIG.formEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ email: input.value.trim() }),
            });
            if (!res.ok) throw new Error(res.status);
          } else {
            await new Promise((r) => setTimeout(r, 700)); // demo rejim
          }
          say(form.dataset.success || "Thank you!", "is-ok");
          form.reset();
        } catch {
          say("Something went wrong. Please try again.", "is-error");
        } finally {
          btn.disabled = false;
        }
      });
    });
  })();