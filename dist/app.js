const mapOrder = ["Todos", "Mirage", "Dust2", "Inferno", "Nuke", "Ancient", "Anubis", "Cache"];
const typeOrder = ["Todas", "Smoke", "Flash", "Molotov", "HE"];
let lineups = [];
let selectedMap = "Todos";
let selectedType = "Todas";
let favoritesOnly = false;
let lightboxLastFocus = null;
let saved;
try { saved = new Set(JSON.parse(localStorage.getItem("cs2-lineups-favorites") || "[]")); }
catch { saved = new Set(); }
const $ = (selector) => document.querySelector(selector);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));

function renderFilters() {
  $("#map-filters").innerHTML = mapOrder.map((map) => `<button class="chip" type="button" data-map="${esc(map)}" aria-pressed="${selectedMap === map}">${esc(map)}</button>`).join("");
  // Always show Smoke/Flash/Molotov; keep HE only when catalog has HE entries.
  $("#type-filters").innerHTML = typeOrder
    .filter((type) => type === "Todas" || type === "Smoke" || type === "Flash" || type === "Molotov" || lineups.some((item) => item.grenade === type))
    .map((type) => `<button class="chip" type="button" data-type="${esc(type)}" aria-pressed="${selectedType === type}">${esc(type)}</button>`).join("");
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
  $("#lightbox-images").replaceChildren();
  if (lightboxLastFocus && typeof lightboxLastFocus.focus === "function") lightboxLastFocus.focus();
  lightboxLastFocus = null;
}

function render() {
  const query = $("#search").value.trim().toLocaleLowerCase("pt-BR");
  const visible = lineups.filter((item) =>
    (selectedMap === "Todos" || item.map === selectedMap) &&
    (selectedType === "Todas" || item.grenade === selectedType) &&
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
        <div class="card-footer"><span>CAPTURA · ${esc(item.captureCredit || "CS2NADES")}</span><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer" aria-label="Ver fonte e vídeo de ${esc(item.title)}">Ver fonte e vídeo ↗</a></div>
      </div>
    </article>`;
  }).join("");
  $("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "LINEUP" : "LINEUPS"}`;
  $("#empty-state").hidden = visible.length > 0;
  $("#favorites-toggle").setAttribute("aria-pressed", String(favoritesOnly));
  $("#favorites-toggle").setAttribute("title", favoritesOnly ? "Mostrar todas" : "Mostrar favoritos");
}

document.addEventListener("click", (event) => {
  const map = event.target.closest("[data-map]");
  const type = event.target.closest("[data-type]");
  const save = event.target.closest("[data-save]");
  const shot = event.target.closest("[data-lightbox-images]");
  if (map) { selectedMap = map.dataset.map; renderFilters(); render(); }
  if (type) { selectedType = type.dataset.type; renderFilters(); render(); }
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

fetch("lineups.json")
  .then((response) => { if (!response.ok) throw new Error("Não foi possível carregar as lineups"); return response.json(); })
  .then((data) => { lineups = data; renderFilters(); render(); })
  .catch(() => { $("#empty-state").hidden = false; $("#empty-state").textContent = "Não foi possível carregar as lineups. Recarregue a página."; });
