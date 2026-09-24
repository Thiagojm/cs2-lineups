const mapOrder = ["Todos", "Mirage", "Dust2", "Inferno", "Nuke", "Ancient", "Anubis", "Cache"];
const typeOrder = ["Todas", "Smoke", "Flash", "Molotov", "HE"];
const sideOrder = ["TR", "CT"];
let lineups = [];
let selectedMap = "Todos";
let selectedType = "Todas";
let selectedSide = "TR";
let favoritesOnly = false;
let lightboxLastFocus = null;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 1.12;
let lightboxScale = 1;
let lightboxTx = 0;
let lightboxTy = 0;
let lightboxPanning = false;
let lightboxPanOrigin = null;
const lightboxTouches = new Map();
let lightboxPinchOrigin = null;
let saved;
try { saved = new Set(JSON.parse(localStorage.getItem("cs2-lineups-favorites") || "[]")); }
catch { saved = new Set(); }
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function applyLightboxZoom() {
  const el = $("#lightbox-images");
  el.style.transform = `translate(${lightboxTx}px, ${lightboxTy}px) scale(${lightboxScale})`;
  el.classList.toggle("is-zoomed", lightboxScale > 1 + 1e-6);
  el.classList.toggle("is-panning", lightboxPanning);
}

function resetLightboxZoom() {
  lightboxScale = 1;
  lightboxTx = 0;
  lightboxTy = 0;
  lightboxPanning = false;
  lightboxPanOrigin = null;
  lightboxTouches.clear();
  lightboxPinchOrigin = null;
  applyLightboxZoom();
}

function renderFilters() {
  $("#map-filters").innerHTML = mapOrder.map((map) => `<button class="chip" type="button" data-map="${esc(map)}" aria-pressed="${selectedMap === map}">${esc(map)}</button>`).join("");
  // Always show Smoke/Flash/Molotov; keep HE only when catalog has HE entries.
  $("#type-filters").innerHTML = typeOrder
    .filter((type) => type === "Todas" || type === "Smoke" || type === "Flash" || type === "Molotov" || lineups.some((item) => item.grenade === type))
    .map((type) => `<button class="chip" type="button" data-type="${esc(type)}" aria-pressed="${selectedType === type}">${esc(type)}</button>`).join("");
  $("#side-filters").innerHTML = sideOrder.map((side) => `<button class="chip" type="button" data-side="${esc(side)}" aria-pressed="${selectedSide === side}">${esc(side)}</button>`).join("");
}

function setPageInert(active) {
  for (const el of document.body.children) {
    if (el.id === "lightbox") continue;
    if (active) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }
}

function lightboxFocusables() {
  return [...$("#lightbox").querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])")]
    .filter((el) => !el.disabled && el.getAttribute("aria-hidden") !== "true");
}

function trapLightboxFocus(event) {
  const items = lightboxFocusables();
  if (!items.length) {
    event.preventDefault();
    $("#lightbox-close").focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!items.includes(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

function openLightbox({ images, title }) {
  const root = $("#lightbox");
  $("#lightbox-images").innerHTML = images.map((src, index) => `
    <div class="capture-panel"><img src="${esc(src)}" alt="${esc(title)} — ${images.length > 1 ? index === 0 ? "posição" : "mira" : "captura ampliada"}" loading="eager">${images.length > 1 ? `<span class="capture-label ${index === 0 ? "top-label" : "bottom-label"}">${index === 0 ? "T SPAWN" : "CROSS"}</span>` : ""}</div>`).join("");
  $("#lightbox-images").classList.toggle("split", images.length > 1);
  $("#lightbox-caption").textContent = title || "";
  resetLightboxZoom();
  lightboxLastFocus = document.activeElement;
  root.hidden = false;
  document.body.classList.add("lightbox-open");
  root.setAttribute("aria-hidden", "false");
  setPageInert(true);
  $("#lightbox-close").focus();
}

function closeLightbox() {
  const root = $("#lightbox");
  if (root.hidden) return;
  root.hidden = true;
  document.body.classList.remove("lightbox-open");
  root.setAttribute("aria-hidden", "true");
  setPageInert(false);
  resetLightboxZoom();
  $("#lightbox-images").replaceChildren();
  if (lightboxLastFocus && typeof lightboxLastFocus.focus === "function") lightboxLastFocus.focus();
  lightboxLastFocus = null;
}

function render() {
  const query = $("#search").value.trim().toLocaleLowerCase("pt-BR");
  const visible = lineups.filter((item) =>
    (selectedMap === "Todos" || item.map === selectedMap) &&
    (selectedType === "Todas" || item.grenade === selectedType) &&
    item.side === selectedSide &&
    (!favoritesOnly || saved.has(item.source)) &&
    (!query || [item.map, item.grenade, item.title, item.from, item.to, item.area, item.description].some((part) => String(part).toLocaleLowerCase("pt-BR").includes(query)))
  );
  $("#cards").innerHTML = visible.map((item) => {
    const images = item.images || [item.image];
    const shot = item.images
      ? `<div class="shot-gallery">${images.map((src, index) => `<span class="capture-panel"><img src="${esc(src)}" alt="${esc(item.title)} em ${esc(item.map)} — ${index === 0 ? "posição" : "mira"}" loading="lazy"><span class="capture-label ${index === 0 ? "top-label" : "bottom-label"}">${index === 0 ? "T SPAWN" : "CROSS"}</span></span>`).join("")}</div>`
      : `<img src="${esc(item.image)}" alt="Captura da lineup ${esc(item.title)} em ${esc(item.map)}: posição, mira e resultado" loading="lazy" width="1080" height="1080">`;
    return `
    <article class="lineup-card">
      <button class="shot" type="button" data-lightbox-images="${esc(JSON.stringify(images))}" data-lightbox-title="${esc(item.map)} · ${esc(item.title)}" aria-label="Ampliar captura: ${esc(item.map)}, ${esc(item.title)}">
        ${shot}
        <span class="map-badge">${esc(item.map.toUpperCase())}</span><span class="demo-badge">${esc(item.grenade.toUpperCase())}</span>
      </button>
      <div class="card-content">
        <div class="card-title-row"><h3 class="card-title">${esc(item.title)}</h3><button class="save-button" type="button" data-save="${esc(item.source)}" aria-pressed="${saved.has(item.source)}" aria-label="${saved.has(item.source) ? "Remover dos" : "Adicionar aos"} favoritos" title="${saved.has(item.source) ? "Remover dos" : "Adicionar aos"} favoritos">${saved.has(item.source) ? "♥" : "♡"}</button></div>
        <p class="card-meta"><span>${esc(item.side)}</span><span>${esc(item.area)}</span><span>${esc(item.from)} → ${esc(item.to)}</span></p>
        <p class="card-description">${esc(item.description)}</p>
        <div class="throw-info"><span>LANÇAMENTO</span><strong>${esc(item.throw)}</strong></div>
        <div class="card-footer"><span>CAPTURA · ${esc(item.captureCredit || "CS2NADES")}</span>${/^https?:\/\//i.test(item.source) ? `<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer" aria-label="Ver fonte e vídeo de ${esc(item.title)}">Ver fonte e vídeo ↗</a>` : `<span>ID · ${esc(item.source)}</span>`}</div>
      </div>
    </article>`;
  }).join("");
  $("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "LINEUP" : "LINEUPS"}`;
  const empty = $("#empty-state");
  empty.hidden = visible.length > 0;
  if (visible.length === 0) {
    const catalogHasCt = lineups.some((item) => item.side === "CT");
    empty.textContent = selectedSide === "CT" && !catalogHasCt
      ? "Ainda não há lineups de CT no catálogo."
      : "Nenhuma lineup encontrada. Ajuste a busca ou os filtros.";
  }
  $("#favorites-toggle").setAttribute("aria-pressed", String(favoritesOnly));
  $("#favorites-toggle").setAttribute("title", favoritesOnly ? "Mostrar todas" : "Mostrar favoritos");
}

document.addEventListener("click", (event) => {
  const map = event.target.closest("[data-map]");
  const type = event.target.closest("[data-type]");
  const side = event.target.closest("[data-side]");
  const save = event.target.closest("[data-save]");
  const shot = event.target.closest("[data-lightbox-images]");
  if (map) { selectedMap = map.dataset.map; renderFilters(); render(); }
  if (type) { selectedType = type.dataset.type; renderFilters(); render(); }
  if (side) { selectedSide = side.dataset.side; renderFilters(); render(); }
  if (save) {
    const id = save.dataset.save;
    saved.has(id) ? saved.delete(id) : saved.add(id);
    localStorage.setItem("cs2-lineups-favorites", JSON.stringify([...saved]));
    render();
  }
  if (event.target.closest("#favorites-toggle")) { favoritesOnly = !favoritesOnly; render(); }
  if (shot) {
    openLightbox({
      images: JSON.parse(shot.dataset.lightboxImages),
      alt: shot.dataset.lightboxAlt,
      title: shot.dataset.lightboxTitle
    });
    return;
  }
  if (event.target.closest("[data-lightbox-close]") || event.target.id === "lightbox") closeLightbox();
});
$("#search").addEventListener("input", render);
document.addEventListener("keydown", (event) => {
  if (!$("#lightbox").hidden) {
    if (event.key === "Escape") { event.preventDefault(); closeLightbox(); return; }
    if (event.key === "Tab") { trapLightboxFocus(event); return; }
  }
  if (event.key === "Escape" && document.activeElement.id === "search") { document.activeElement.value = ""; render(); document.activeElement.blur(); }
  if (event.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { event.preventDefault(); $("#search").focus(); }
});

document.addEventListener("focusin", (event) => {
  const root = $("#lightbox");
  if (root.hidden || root.contains(event.target)) return;
  $("#lightbox-close").focus();
});

$("#lightbox").addEventListener("wheel", (event) => {
  const root = $("#lightbox");
  if (root.hidden) return;
  event.preventDefault();
  const el = $("#lightbox-images");
  if (!el || event.target.closest(".lightbox-close")) return;
  const direction = event.deltaY < 0 ? 1 : -1;
  const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, lightboxScale * (direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP)));
  if (Math.abs(next - lightboxScale) < 1e-6) {
    if (next === ZOOM_MIN) { lightboxTx = 0; lightboxTy = 0; applyLightboxZoom(); }
    return;
  }
  const rect = el.getBoundingClientRect();
  const ox = event.clientX - (rect.left + rect.width / 2);
  const oy = event.clientY - (rect.top + rect.height / 2);
  const factor = next / lightboxScale;
  lightboxTx = ox - (ox - lightboxTx) * factor;
  lightboxTy = oy - (oy - lightboxTy) * factor;
  lightboxScale = next;
  if (lightboxScale <= ZOOM_MIN + 1e-6) {
    lightboxScale = ZOOM_MIN;
    lightboxTx = 0;
    lightboxTy = 0;
  }
  applyLightboxZoom();
}, { passive: false });

$("#lightbox-images").addEventListener("pointerdown", (event) => {
  if ($("#lightbox").hidden) return;
  if (event.button !== 0) return;
  const el = $("#lightbox-images");
  if (event.pointerType === "touch") {
    if (lightboxTouches.size >= 2) return;
    lightboxTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    el.setPointerCapture(event.pointerId);
    if (lightboxTouches.size === 2) {
      const [a, b] = [...lightboxTouches.values()];
      const rect = el.getBoundingClientRect();
      lightboxPinchOrigin = {
        x: (a.x + b.x) / 2, y: (a.y + b.y) / 2,
        distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
        scale: lightboxScale, tx: lightboxTx, ty: lightboxTy,
        cx: rect.left + rect.width / 2 - lightboxTx,
        cy: rect.top + rect.height / 2 - lightboxTy
      };
      lightboxPanning = false;
      lightboxPanOrigin = null;
    } else if (lightboxScale > ZOOM_MIN + 1e-6) {
      lightboxPanning = true;
      lightboxPanOrigin = { x: event.clientX, y: event.clientY, tx: lightboxTx, ty: lightboxTy };
    }
    applyLightboxZoom();
    event.preventDefault();
    return;
  }
  if (lightboxScale <= ZOOM_MIN + 1e-6) return;
  lightboxPanning = true;
  lightboxPanOrigin = { x: event.clientX, y: event.clientY, tx: lightboxTx, ty: lightboxTy };
  el.setPointerCapture(event.pointerId);
  applyLightboxZoom();
  event.preventDefault();
});

$("#lightbox-images").addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") {
    if (!lightboxTouches.has(event.pointerId)) return;
    lightboxTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (lightboxPinchOrigin && lightboxTouches.size === 2) {
      const [a, b] = [...lightboxTouches.values()];
      const origin = lightboxPinchOrigin;
      const scale = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, origin.scale * Math.hypot(a.x - b.x, a.y - b.y) / origin.distance));
      const factor = scale / origin.scale;
      lightboxScale = scale;
      lightboxTx = origin.tx + (a.x + b.x) / 2 - origin.x + (1 - factor) * (origin.x - origin.cx - origin.tx);
      lightboxTy = origin.ty + (a.y + b.y) / 2 - origin.y + (1 - factor) * (origin.y - origin.cy - origin.ty);
      if (scale <= ZOOM_MIN + 1e-6) { lightboxTx = 0; lightboxTy = 0; }
      applyLightboxZoom();
    } else if (lightboxPanning && lightboxPanOrigin) {
      lightboxTx = lightboxPanOrigin.tx + event.clientX - lightboxPanOrigin.x;
      lightboxTy = lightboxPanOrigin.ty + event.clientY - lightboxPanOrigin.y;
      applyLightboxZoom();
    }
    return;
  }
  if (!lightboxPanning || !lightboxPanOrigin) return;
  lightboxTx = lightboxPanOrigin.tx + (event.clientX - lightboxPanOrigin.x);
  lightboxTy = lightboxPanOrigin.ty + (event.clientY - lightboxPanOrigin.y);
  applyLightboxZoom();
});

function endLightboxPan(event) {
  if (event.pointerType === "touch") {
    if (!lightboxTouches.delete(event.pointerId)) return;
    lightboxPinchOrigin = null;
    const remaining = [...lightboxTouches.values()][0];
    lightboxPanning = !!remaining && lightboxScale > ZOOM_MIN + 1e-6;
    lightboxPanOrigin = lightboxPanning ? { x: remaining.x, y: remaining.y, tx: lightboxTx, ty: lightboxTy } : null;
  } else if (!lightboxPanning) return;
  else {
    lightboxPanning = false;
    lightboxPanOrigin = null;
  }
  if (event && $("#lightbox-images").hasPointerCapture?.(event.pointerId)) {
    $("#lightbox-images").releasePointerCapture(event.pointerId);
  }
  applyLightboxZoom();
}

$("#lightbox-images").addEventListener("pointerup", endLightboxPan);
$("#lightbox-images").addEventListener("pointercancel", endLightboxPan);

fetch("lineups.json")
  .then((response) => { if (!response.ok) throw new Error("Não foi possível carregar as lineups"); return response.json(); })
  .then((data) => { lineups = data; renderFilters(); render(); })
  .catch(() => { $("#empty-state").hidden = false; $("#empty-state").textContent = "Não foi possível carregar as lineups. Recarregue a página."; });
