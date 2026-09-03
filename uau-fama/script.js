(() => {
  let items = Array.isArray(window.GALLERY_ITEMS) ? window.GALLERY_ITEMS : [];
  const settings = window.GALLERY_SETTINGS || {};
  const gallery = document.querySelector("#gallery");
  const modal = document.querySelector("#modal");
  const modalMedia = document.querySelector("#modal-media");
  const sentinel = document.querySelector("#scroll-sentinel");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ratios = ["3-2", "1-1", "16-9", "4-3", "2-3", "1-1", "2-1", "3-4"];
  let lastFocused = null;
  let cardNumber = 0;
  let adding = false;
  let layoutColumns = 0;

  const shuffle = source => {
    const copy = [...source];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  function markup(item, ratio, arriving = false) {
    cardNumber++;
    return `<button class="card ratio-${ratio}${arriving && !reducedMotion ? " is-arriving" : ""}" type="button" data-id="${item.id}" data-ratio="${ratio}" aria-label="Abrir ${item.titulo}">
      <img src="${item.thumbnail}" alt="${item.titulo}" loading="lazy" decoding="async">
      ${item.tipo === "video" ? '<span class="play" aria-hidden="true">▶</span>' : ""}
      <span class="card-info"><span class="card-title">${item.titulo}</span><span class="card-index">${String(cardNumber).padStart(2, "0")}</span></span>
    </button>`;
  }

  function desiredColumnCount() {
    if (innerWidth <= 700) return 2;
    if (innerWidth <= 1000) return 3;
    if (innerWidth <= 1200) return 4;
    return 5;
  }

  function shortestColumn() {
    return [...gallery.querySelectorAll(".gallery-column")]
      .sort((a, b) => a.scrollHeight - b.scrollHeight)[0];
  }

  function buildColumns(force = false) {
    const desired = desiredColumnCount();
    if (!force && layoutColumns === desired && gallery.querySelector(".gallery-column")) return;
    const cards = [...gallery.querySelectorAll(".card")];
    gallery.innerHTML = "";
    layoutColumns = desired;
    for (let i = 0; i < desired; i++) {
      const column = document.createElement("div");
      column.className = "gallery-column";
      gallery.appendChild(column);
    }
    cards.forEach(card => shortestColumn().appendChild(card));
  }

  async function appendBatch(arriving = true) {
    if (!items.length || adding) return;
    adding = true;
    buildColumns();
    const startIndex = cardNumber;
    const shuffled = shuffle(items);
    const batchSize = Math.max(16, Math.min(24, shuffled.length));
    for (let i = 0; i < batchSize; i++) {
      const item = shuffled[i % shuffled.length];
      shortestColumn().insertAdjacentHTML("beforeend", markup(item, ratios[(startIndex + i) % ratios.length], arriving));
      if (!reducedMotion) await new Promise(resolve => setTimeout(resolve, 110));
    }
    adding = false;
    fillPage();
  }

  function fillPage() {
    if (settings.infiniteScroll && !adding && sentinel.getBoundingClientRect().top < innerHeight + 1000) appendBatch();
  }

  function visibleCards() {
    return [...gallery.querySelectorAll(".card:not(.is-changing)")].filter(card => {
      const box = card.getBoundingClientRect();
      return box.bottom > 0 && box.top < innerHeight;
    });
  }

  function changeCard(card) {
    if (!card?.isConnected || card.classList.contains("is-changing")) return;
    const choices = items.filter(item => item.id !== card.dataset.id);
    const next = choices[Math.floor(Math.random() * choices.length)] || items[0];
    const ratio = card.dataset.ratio;
    card.classList.add("is-changing");
    setTimeout(() => {
      const holder = document.createElement("div");
      holder.innerHTML = markup(next, ratio);
      const replacement = holder.firstElementChild;
      card.replaceWith(replacement);
      if (!reducedMotion) {
        replacement.classList.add("is-changing");
        requestAnimationFrame(() => requestAnimationFrame(() => replacement.classList.remove("is-changing")));
      }
    }, reducedMotion ? 0 : 1800);
  }

  function changeWave() {
    if (!items.length || modal.classList.contains("open") || document.hidden) return;
    const available = shuffle(visibleCards());
    const count = Math.min(Math.max(Number(settings.shuffleCount) || 3, 1), available.length);
    const stagger = Math.max(Number(settings.shuffleStagger) || 1200, 300);
    available.slice(0, count).forEach((card, index) => {
      setTimeout(() => changeCard(card), index * stagger);
    });
  }

  function embedUrl(url = "") {
    const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([^?&/]+)/);
    if (yt) {
      const origin = location.protocol === "http:" || location.protocol === "https:"
        ? `&origin=${encodeURIComponent(location.origin)}`
        : "";
      return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0${origin}`;
    }
    const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return vimeo ? `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` : null;
  }

  function openModal(item) {
    if (!item) return;
    lastFocused = document.activeElement;
    const embed = item.tipo === "video" ? embedUrl(item.videoUrl) : null;
    if (embed) modalMedia.innerHTML = `<iframe src="${embed}" title="${item.titulo}" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    else if (item.tipo === "video") modalMedia.innerHTML = `<video src="${item.videoUrl}" poster="${item.thumbnail}" controls autoplay playsinline></video>`;
    else modalMedia.innerHTML = `<img src="${item.src || item.thumbnail}" alt="${item.titulo}">`;
    document.querySelector("#modal-title").textContent = item.titulo;
    document.querySelector("#modal-description").textContent = item.descricao || "";
    document.querySelector("#modal-kicker").textContent = (item.tags || []).join(" · ");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modalMedia.innerHTML = "";
    lastFocused?.focus();
  }

  async function loadSheet() {
    if (!settings.sheetUrl) return true;
    // Quando há uma planilha configurada, nenhum item local participa da galeria.
    items = [];
    try {
      const response = await fetch(settings.sheetUrl, { cache: "no-store" });
      if (!response.ok) throw new Error("Planilha indisponível");
      const data = await response.json();
      const rows = Array.isArray(data) ? data : data.items;
      if (!Array.isArray(rows)) throw new Error("Formato de dados inválido");
      items = rows
        .filter(row => row && (row.thumbnail || row.src) && row.titulo)
        .map((row, i) => ({
          ...row,
          id: String(row.id || `item-${i + 1}`),
          tipo: row.tipo || "image",
          thumbnail: row.thumbnail || row.src,
          tags: Array.isArray(row.tags) ? row.tags : String(row.tags || "").split(",").filter(Boolean)
        }));
      return true;
    } catch (error) {
      console.warn("Não foi possível carregar o Google Sheets.", error);
      return false;
    }
  }

  gallery.addEventListener("click", event => {
    const card = event.target.closest(".card");
    if (card) openModal(items.find(item => String(item.id) === card.dataset.id));
  });
  modal.addEventListener("click", event => { if (event.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape" && modal.classList.contains("open")) closeModal(); });
  let scrollQueued = false;
  addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; fillPage(); });
  }, { passive: true });
  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => buildColumns(), 180);
  });

  async function start() {
    const sheetLoaded = await loadSheet();
    document.querySelector("#year").textContent = new Date().getFullYear();
    if (settings.sheetUrl && !sheetLoaded) {
      gallery.innerHTML = '<p class="gallery-message">Não foi possível acessar a planilha neste momento.</p>';
      return;
    }
    if (!items.length) {
      gallery.innerHTML = '<p class="gallery-message">A planilha ainda não possui materiais válidos.</p>';
      return;
    }
    appendBatch(false);
    if (settings.autoShuffle) setInterval(changeWave, Math.max(settings.shuffleInterval || 7000, 4000));
    if (settings.infiniteScroll && "IntersectionObserver" in window) {
      new IntersectionObserver(entries => { if (entries[0].isIntersecting) appendBatch(); }, { rootMargin: "1400px 0px" }).observe(sentinel);
    }
  }
  start();
})();
