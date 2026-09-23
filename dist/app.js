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

function openLightbox({ src, alt, title }) {
  const root = $("#lightbox");
  const img = $("#lightbox-image");
  const caption = $("#lightbox-caption");
  img.src = src;
  img.alt = alt || title || "Captura ampliada";
  caption.textContent = title || "";
  lightboxLastFocus = document.activeElement;
  root.hidden = false;
  document.body.classList.add("lightbox-open");
  root.setAttribute("aria-hidden", "false");
  $("#lightbox-close").focus();
}

function closeLightbox() {
  const root = $("#lightbox");
  if (root.hidden) return;
  root.hidden = true;
  document.body.classList.remove("lightbox-open");
  root.setAttribute("aria-hidden", "true");
  $("#lightbox-image").removeAttribute("src");
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
  $("#cards").innerHTML = visible.map((item) => `
    <article class="lineup-card">
      <button class="shot" type="button" data-lightbox-src="${esc(item.image)}" data-lightbox-alt="Captura da lineup ${esc(item.title)} em ${esc(item.map)}: posição, mira e resultado" data-lightbox-title="${esc(item.map)} · ${esc(item.title)}" aria-label="Ampliar captura: ${esc(item.map)}, ${esc(item.title)}">
        <img src="${esc(item.image)}" alt="Captura da lineup ${esc(item.title)} em ${esc(item.map)}: posição, mira e resultado" loading="lazy" width="1080" height="1080">
        <span class="map-badge">${esc(item.map.toUpperCase())}</span><span class="demo-badge">${esc(item.grenade.toUpperCase())}</span>
      </button>
      <div class="card-content">
        <div class="card-title-row"><h3 class="card-title">${esc(item.title)}</h3><button class="save-button" type="button" data-save="${esc(item.source)}" aria-pressed="${saved.has(item.source)}" aria-label="${saved.has(item.source) ? "Remover dos" : "Adicionar aos"} favoritos" title="${saved.has(item.source) ? "Remover dos" : "Adicionar aos"} favoritos">${saved.has(item.source) ? "♥" : "♡"}</button></div>
        <p class="card-meta"><span>${esc(item.side)}</span><span>${esc(item.area)}</span><span>${esc(item.from)} → ${esc(item.to)}</span></p>
        <p class="card-description">${esc(item.description)}</p>
        <div class="throw-info"><span>LANÇAMENTO</span><strong>${esc(item.throw)}</strong></div>
        <div class="card-footer"><span>CAPTURA · CS2NADES</span><a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer" aria-label="Ver fonte e vídeo de ${esc(item.title)}">Ver fonte e vídeo ↗</a></div>
      </div>
    </article>`).join("");
  $("#result-count").textContent = `${visible.length} ${visible.length === 1 ? "LINEUP" : "LINEUPS"}`;
  $("#empty-state").hidden = visible.length > 0;
  $("#favorites-toggle").setAttribute("aria-pressed", String(favoritesOnly));
  $("#favorites-toggle").setAttribute("title", favoritesOnly ? "Mostrar todas" : "Mostrar favoritos");
}

document.addEventListener("click", (event) => {
  const map = event.target.closest("[data-map]");
  const type = event.target.closest("[data-type]");
  const save = event.target.closest("[data-save]");
  const shot = event.target.closest("[data-lightbox-src]");
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
      src: shot.dataset.lightboxSrc,
      alt: shot.dataset.lightboxAlt,
      title: shot.dataset.lightboxTitle
    });
    return;
  }
  if (event.target.closest("[data-lightbox-close]") || event.target.id === "lightbox") closeLightbox();
});
$("#search").addEventListener("input", render);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!$("#lightbox").hidden) { event.preventDefault(); closeLightbox(); return; }
    if (document.activeElement.id === "search") { document.activeElement.value = ""; render(); document.activeElement.blur(); }
  }
  if (event.key === "/" && !/INPUT|TEXTAREA/.test(document.activeElement.tagName) && $("#lightbox").hidden) { event.preventDefault(); $("#search").focus(); }
});

fetch("lineups.json")
  .then((response) => { if (!response.ok) throw new Error("Não foi possível carregar as lineups"); return response.json(); })
  .then((data) => { lineups = data; renderFilters(); render(); })
  .catch(() => { $("#empty-state").hidden = false; $("#empty-state").textContent = "Não foi possível carregar as lineups. Recarregue a página."; });
