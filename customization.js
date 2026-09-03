/* =========================================================
   KHELZONE — CUSTOMIZATION.JS
   Complete Kit Builder
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    const JERSEY_DESIGNS = [
        { id: "solid", label: "Solid" },
        { id: "stripes-v", label: "Stripes" },
        { id: "stripes-h", label: "H-Stripes" },
        { id: "gradient", label: "Gradient" },
        { id: "geometric", label: "Geometric" },
        { id: "performance", label: "Performance" }
    ];

    const JERSEY_FONTS = [
        { id: "classic", label: "Classic" },
        { id: "athletic", label: "Athletic" },
        { id: "modern", label: "Modern" },
        { id: "bold", label: "Bold" },
        { id: "performance", label: "Performance" }
    ];

    const JERSEY_COLLARS = [
        { id: "round", label: "Round" },
        { id: "v-neck", label: "V-Neck" },
        { id: "polo", label: "Polo" }
    ];

    const JERSEY_SLEEVES = [
        { id: "short", label: "Short Sleeve" },
        { id: "long", label: "Long Sleeve" }
    ];

    const JERSEY_DESIGN_ADDON = 300;
    const JERSEY_LOGO_ADDON = 200;

    const NECKLINE_PATHS = {
        "round": "M134 78 Q160 96 186 78",
        "v-neck": "M136 78 L160 104 L184 78",
        "polo": "M136 78 Q160 90 184 78 M150 78 L150 92 M170 78 L170 92"
    };

    const gearItems = [
        {
            id: "jersey",
            name: "Jersey",
            price: 2500,
            icon: "👕",
            description: "Custom sports jersey",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#16a34a", "#dc2626"],
            sizes: ["XS", "S", "M", "L", "XL", "XXL"],
            customizable: true
        },
        {
            id: "shoes",
            name: "Sports Shoes",
            price: 5500,
            icon: "👟",
            description: "Performance sports shoes",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#dc2626"],
            sizes: ["7", "8", "9", "10", "11", "12"],
            customizable: true
        },
        {
            id: "socks",
            name: "Sports Socks",
            price: 800,
            icon: "🧦",
            description: "Premium sports socks",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#16a34a"],
            sizes: ["S", "M", "L", "XL"],
            customizable: true
        },
        {
            id: "gloves",
            name: "Sports Gloves",
            price: 1800,
            icon: "🧤",
            description: "Grip performance gloves",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#dc2626"],
            sizes: ["S", "M", "L", "XL"],
            customizable: true
        },
        {
            id: "helmet",
            name: "Helmet",
            price: 3500,
            icon: "⛑️",
            description: "Protective sports helmet",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#dc2626"],
            sizes: ["S", "M", "L", "XL"],
            customizable: true
        },
        {
            id: "cap",
            name: "Sports Cap",
            price: 1200,
            icon: "🧢",
            description: "Performance sports cap",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#16a34a"],
            sizes: ["S", "M", "L"],
            customizable: true
        },
        {
            id: "kitbag",
            name: "Kit Bag",
            price: 3000,
            icon: "🎒",
            description: "Complete sports kit bag",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#dc2626"],
            sizes: ["Standard"],
            customizable: true
        }
    ];


    /* =====================================================
       STATE
       ===================================================== */

    let selectedItems = {};
    let activeItem = null;
    let currentView = "front";
    let zoomLevel = 1;


    /* =====================================================
       DOM ELEMENTS
       ===================================================== */

    const itemGrid = document.getElementById("itemGrid");
    const customPanel = document.getElementById("customPanel");
    const customPanelEmpty = document.getElementById("customPanelEmpty");
    const yourKitGrid = document.getElementById("yourKitGrid");
    const yourKitCount = document.getElementById("yourKitCount");
    const kitTotalPrice = document.getElementById("kitTotalPrice");
    const kitTotalBreakdown = document.getElementById("kitTotalBreakdown");
    const mobileStickyTotal = document.getElementById("mobileStickyTotal");
    const cartBadge = document.getElementById("cartBadge");
    const addToCartBtn = document.getElementById("addToCartBtn");
    const mobileStickyAddBtn = document.getElementById("mobileStickyAddBtn");
    const resetAllBtn = document.getElementById("resetAllBtn");
    const viewFrontBtn = document.getElementById("viewFrontBtn");
    const viewBackBtn = document.getElementById("viewBackBtn");
    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const resetPreviewBtn = document.getElementById("resetPreviewBtn");
    const navToggle = document.getElementById("navToggle");
    const navMobile = document.getElementById("navMobile");


    /* =====================================================
       LOCAL STORAGE (kept exactly as the existing project uses it)
       ===================================================== */

    function saveState() {
        localStorage.setItem("khelzoneCustomKit", JSON.stringify(selectedItems));
    }

    function loadState() {
        try {
            const saved = localStorage.getItem("khelzoneCustomKit");
            if (!saved) return;
            selectedItems = JSON.parse(saved) || {};
        } catch (error) {
            selectedItems = {};
        }
    }


    /* =====================================================
       FORMAT PRICE
       ===================================================== */

    function formatPrice(value) {
        return "Rs. " + Number(value).toLocaleString("en-PK");
    }


    /* =====================================================
       JERSEY ADD-ON PRICE
       ===================================================== */

    function computeJerseyAddon(state) {
        let addon = 0;
        if (state.design && state.design !== "solid") addon += JERSEY_DESIGN_ADDON;
        if (state.logo) addon += JERSEY_LOGO_ADDON;
        return addon;
    }

    function itemEffectivePrice(item) {
        if (item.id === "jersey") {
            return Number(item.price || 0) + computeJerseyAddon(item);
        }
        return Number(item.price || 0);
    }


    /* =====================================================
       CREATE ITEM GRID
       ===================================================== */

    function renderItemGrid() {

        if (!itemGrid) return;

        itemGrid.innerHTML = "";

        gearItems.forEach(item => {

            const selected = Boolean(selectedItems[item.id]);

            const card = document.createElement("button");
            card.type = "button";
            card.className = "gear-card" + (selected ? " is-selected" : "");
            card.dataset.item = item.id;

            card.innerHTML = `
                <div class="gear-card__visual">
                    <span class="gear-card__icon">${item.icon}</span>
                    ${selected ? `<span class="gear-card__check">✓</span>` : ""}
                </div>
                <div class="gear-card__content">
                    <strong>${item.name}</strong>
                    <small>${item.description}</small>
                    <span class="gear-card__price">${formatPrice(item.price)}</span>
                </div>
                <span class="gear-card__action">${selected ? "UNSELECT" : "SELECT"}</span>
            `;

            card.addEventListener("click", () => toggleItem(item.id));

            itemGrid.appendChild(card);

        });

    }


    /* =====================================================
       SELECT / UNSELECT
       ===================================================== */

    function toggleItem(itemId) {

        if (selectedItems[itemId]) {

            delete selectedItems[itemId];

            if (activeItem === itemId) {
                activeItem = null;
            }

        } else {

            const item = gearItems.find(product => product.id === itemId);

            if (!item) return;

            const baseState = {
                id: item.id,
                name: item.name,
                price: item.price,
                color: item.colors[0],
                size: item.sizes[Math.min(1, item.sizes.length - 1)],
                playerName: item.id === "jersey" ? "PLAYER" : "",
                number: item.id === "jersey" ? "00" : ""
            };

            if (item.id === "jersey") {
                baseState.teamName = "KHELZONE FC";
                baseState.design = "solid";
                baseState.font = "modern";
                baseState.collar = "round";
                baseState.sleeve = "short";
                baseState.logo = null;
            }

            selectedItems[itemId] = baseState;

            activeItem = itemId;

        }

        saveState();
        renderItemGrid();
        renderCustomPanel();
        renderYourKit();
        updateTotal();
        updatePreview();

    }


    /* =====================================================
       CUSTOMIZATION PANEL
       ===================================================== */

    function renderCustomPanel() {

        if (!customPanel) return;

        const oldControls = customPanel.querySelector(".custom-controls");
        if (oldControls) oldControls.remove();

        if (!activeItem || !selectedItems[activeItem]) {
            if (customPanelEmpty) customPanelEmpty.style.display = "flex";
            return;
        }

        if (customPanelEmpty) customPanelEmpty.style.display = "none";

        const item = gearItems.find(product => product.id === activeItem);
        const state = selectedItems[activeItem];

        if (!item) return;

        const isJersey = item.id === "jersey";
        const addon = isJersey ? computeJerseyAddon(state) : 0;

        const controls = document.createElement("div");
        controls.className = "custom-controls";

        controls.innerHTML = `

            <div class="custom-controls__header">
                <div>
                    <span class="badge">CUSTOMIZING</span>
                    <h3>${item.name}</h3>
                </div>
                <button type="button" class="custom-controls__unselect" id="unselectActiveBtn">
                    UNSELECT
                </button>
            </div>

            <!-- COLOR -->
            <div class="custom-field">
                <label>COLOR</label>
                <div class="color-options" id="colorOptions">
                    ${item.colors.map(color => `
                        <button type="button" class="color-option ${state.color === color ? "is-active" : ""}"
                            data-color="${color}" style="background:${color}" aria-label="Choose color ${color}"></button>
                    `).join("")}
                </div>
            </div>

            ${isJersey ? `
            <!-- DESIGN / PATTERN -->
            <div class="custom-field">
                <label>DESIGN</label>
                <div class="design-options" id="designOptions">
                    ${JERSEY_DESIGNS.map(d => `
                        <button type="button" class="design-option ${state.design === d.id ? "is-active" : ""}" data-design="${d.id}">
                            <span class="design-option__swatch" data-swatch="${d.id}"></span>
                            <span class="design-option__label">${d.label}</span>
                        </button>
                    `).join("")}
                </div>
                <p class="field-hint">Non-solid designs add ${formatPrice(JERSEY_DESIGN_ADDON)} to the total.</p>
            </div>
            ` : ""}

            <!-- SIZE -->
            <div class="custom-field">
                <label>SIZE</label>
                <div class="size-options" id="sizeOptions">
                    ${item.sizes.map(size => `
                        <button type="button" class="size-option ${state.size === size ? "is-active" : ""}" data-size="${size}">
                            ${size}
                        </button>
                    `).join("")}
                </div>
            </div>

            ${isJersey ? `

                <!-- TEAM NAME -->
                <div class="custom-field">
                    <label for="teamNameInput">TEAM NAME</label>
                    <input type="text" id="teamNameInput" maxlength="20"
                        value="${escapeHTML(state.teamName || "")}" placeholder="KHELZONE FC" />
                </div>

                <!-- PLAYER NAME -->
                <div class="custom-field">
                    <label for="playerNameInput">PLAYER NAME</label>
                    <input type="text" id="playerNameInput" maxlength="14"
                        value="${escapeHTML(state.playerName || "")}" placeholder="PLAYER" />
                </div>

                <!-- PLAYER NUMBER -->
                <div class="custom-field">
                    <label for="playerNumberInput">PLAYER NUMBER (00–99)</label>
                    <input type="text" id="playerNumberInput" maxlength="2" inputmode="numeric"
                        value="${escapeHTML(state.number || "00")}" placeholder="00" />
                </div>

                <!-- FONT STYLE -->
                <div class="custom-field">
                    <label>FONT STYLE</label>
                    <div class="font-options" id="fontOptions">
                        ${JERSEY_FONTS.map(f => `
                            <button type="button" class="font-option jersey-font-${f.id} ${state.font === f.id ? "is-active" : ""}" data-font="${f.id}">
                                ${f.label}
                            </button>
                        `).join("")}
                    </div>
                </div>

                <!-- COLLAR -->
                <div class="custom-field">
                    <label>COLLAR</label>
                    <div class="chip-row" id="collarOptions">
                        ${JERSEY_COLLARS.map(c => `
                            <button type="button" class="chip-option ${state.collar === c.id ? "is-active" : ""}" data-collar="${c.id}">
                                ${c.label}
                            </button>
                        `).join("")}
                    </div>
                </div>

                <!-- SLEEVE -->
                <div class="custom-field">
                    <label>SLEEVE</label>
                    <div class="chip-row" id="sleeveOptions">
                        ${JERSEY_SLEEVES.map(s => `
                            <button type="button" class="chip-option ${state.sleeve === s.id ? "is-active" : ""}" data-sleeve="${s.id}">
                                ${s.label}
                            </button>
                        `).join("")}
                    </div>
                </div>

                <!-- LOGO UPLOAD -->
                <div class="custom-field">
                    <label>TEAM LOGO / BADGE</label>
                    <div class="logo-upload">
                        <div class="logo-upload__preview" id="logoPreview">
                            ${state.logo ? `<img src="${state.logo}" alt="Uploaded team logo" />` : `<span>No logo</span>`}
                        </div>
                        <div class="logo-upload__actions">
                            <label class="logo-upload__btn" for="logoFileInput" style="cursor:pointer;">
                                ${state.logo ? "REPLACE LOGO" : "UPLOAD LOGO"}
                            </label>
                            <input type="file" id="logoFileInput" accept="image/*" hidden />
                            ${state.logo ? `<button type="button" class="logo-upload__remove" id="logoRemoveBtn">REMOVE</button>` : ""}
                        </div>
                    </div>
                    <p class="field-hint" id="logoError"></p>
                    <p class="field-hint">A logo adds ${formatPrice(JERSEY_LOGO_ADDON)} to the total.</p>
                </div>

            ` : ""}

            <div class="custom-controls__footer">
                <div class="custom-controls__footer-row">
                    <span>Base ${item.name}</span>
                    <strong>${formatPrice(item.price)}</strong>
                </div>
                ${isJersey && state.design !== "solid" ? `
                <div class="custom-controls__footer-row">
                    <span>Custom Design</span>
                    <strong>+ ${formatPrice(JERSEY_DESIGN_ADDON)}</strong>
                </div>` : ""}
                ${isJersey && state.logo ? `
                <div class="custom-controls__footer-row">
                    <span>Custom Logo</span>
                    <strong>+ ${formatPrice(JERSEY_LOGO_ADDON)}</strong>
                </div>` : ""}
                <div class="custom-controls__footer-total">
                    <span>Item Total</span>
                    <strong>${formatPrice(item.price + addon)}</strong>
                </div>
            </div>

        `;

        customPanel.appendChild(controls);

        /* -------------------------------------------------
           DESIGN SWATCH PREVIEWS (small static preview chips)
           ------------------------------------------------- */
        if (isJersey) {
            controls.querySelectorAll("[data-swatch]").forEach(swatchEl => {
                paintDesignSwatch(swatchEl, swatchEl.dataset.swatch, state.color);
            });
        }


        /* =================================================
           COLOR BUTTONS
           ================================================= */
        controls.querySelectorAll(".color-option").forEach(button => {
            button.addEventListener("click", () => {
                state.color = button.dataset.color;
                saveState();
                renderCustomPanel();
                updatePreview();
            });
        });


        /* =================================================
           DESIGN BUTTONS
           ================================================= */
        if (isJersey) {
            controls.querySelectorAll("[data-design]").forEach(button => {
                button.addEventListener("click", () => {
                    state.design = button.dataset.design;
                    saveState();
                    renderCustomPanel();
                    renderYourKit();
                    updateTotal();
                    updatePreview();
                });
            });
        }


        /* =================================================
           SIZE BUTTONS
           ================================================= */
        controls.querySelectorAll(".size-option").forEach(button => {
            button.addEventListener("click", () => {
                state.size = button.dataset.size;
                saveState();
                renderCustomPanel();
            });
        });


        /* =================================================
           UNSELECT
           ================================================= */
        const unselectBtn = document.getElementById("unselectActiveBtn");
        if (unselectBtn) {
            unselectBtn.addEventListener("click", () => {
                delete selectedItems[activeItem];
                activeItem = null;
                saveState();
                renderItemGrid();
                renderCustomPanel();
                renderYourKit();
                updateTotal();
                updatePreview();
            });
        }


        if (!isJersey) return;


        /* =================================================
           TEAM NAME
           ================================================= */
        const teamNameInput = document.getElementById("teamNameInput");
        if (teamNameInput) {
            teamNameInput.addEventListener("input", event => {
                state.teamName = event.target.value.toUpperCase();
                updatePreview();
                saveState();
            });
        }


        /* =================================================
           PLAYER NAME
           ================================================= */
        const playerNameInput = document.getElementById("playerNameInput");
        if (playerNameInput) {
            playerNameInput.addEventListener("input", event => {
                state.playerName = event.target.value.toUpperCase();
                updatePreview();
                saveState();
            });
        }


        /* =================================================
           PLAYER NUMBER
           ================================================= */
        const playerNumberInput = document.getElementById("playerNumberInput");
        if (playerNumberInput) {
            playerNumberInput.addEventListener("input", event => {
                event.target.value = event.target.value.replace(/\D/g, "").slice(0, 2);
                state.number = event.target.value || "00";
                updatePreview();
                saveState();
            });
        }


        /* =================================================
           FONT BUTTONS
           ================================================= */
        controls.querySelectorAll("[data-font]").forEach(button => {
            button.addEventListener("click", () => {
                state.font = button.dataset.font;
                saveState();
                renderCustomPanel();
                updatePreview();
            });
        });


        /* =================================================
           COLLAR BUTTONS
           ================================================= */
        controls.querySelectorAll("[data-collar]").forEach(button => {
            button.addEventListener("click", () => {
                state.collar = button.dataset.collar;
                saveState();
                renderCustomPanel();
                updatePreview();
            });
        });


        /* =================================================
           SLEEVE BUTTONS
           ================================================= */
        controls.querySelectorAll("[data-sleeve]").forEach(button => {
            button.addEventListener("click", () => {
                state.sleeve = button.dataset.sleeve;
                saveState();
                renderCustomPanel();
                updatePreview();
            });
        });


        /* =================================================
           LOGO UPLOAD
           ================================================= */
        const logoFileInput = document.getElementById("logoFileInput");
        const logoErrorEl = document.getElementById("logoError");

        if (logoFileInput) {
            logoFileInput.addEventListener("change", event => {

                if (logoErrorEl) logoErrorEl.textContent = "";

                const file = event.target.files && event.target.files[0];

                if (!file) return;

                if (!file.type || !file.type.startsWith("image/")) {
                    if (logoErrorEl) logoErrorEl.textContent = "Please choose an image file (PNG, JPG, SVG).";
                    logoFileInput.value = "";
                    return;
                }

                if (file.size > 3 * 1024 * 1024) {
                    if (logoErrorEl) logoErrorEl.textContent = "Image is too large — please use a file under 3MB.";
                    logoFileInput.value = "";
                    return;
                }

                const reader = new FileReader();

                reader.onload = e => {
                    state.logo = e.target.result;
                    saveState();
                    renderCustomPanel();
                    renderYourKit();
                    updateTotal();
                    updatePreview();
                };

                reader.onerror = () => {
                    if (logoErrorEl) logoErrorEl.textContent = "Couldn't read that file — please try another image.";
                    logoFileInput.value = "";
                };

                reader.readAsDataURL(file);

            });
        }

        const logoRemoveBtn = document.getElementById("logoRemoveBtn");
        if (logoRemoveBtn) {
            logoRemoveBtn.addEventListener("click", () => {
                state.logo = null;
                saveState();
                renderCustomPanel();
                renderYourKit();
                updateTotal();
                updatePreview();
            });
        }

    }


    /* =====================================================
       PAINT DESIGN SWATCH (static mini preview chip in the panel)
       ===================================================== */

    function paintDesignSwatch(el, design, color) {

        const base = color || "#111111";
        const accent = adjustColor(base, -40);

        let bg = base;

        switch (design) {
            case "stripes-v":
                bg = `repeating-linear-gradient(90deg, ${base} 0 6px, ${accent} 6px 12px)`;
                break;
            case "stripes-h":
                bg = `repeating-linear-gradient(0deg, ${base} 0 6px, ${accent} 6px 12px)`;
                break;
            case "gradient":
                bg = `linear-gradient(160deg, ${base}, ${accent})`;
                break;
            case "geometric":
                bg = `repeating-conic-gradient(${base} 0% 25%, ${accent} 0% 50%)`;
                break;
            case "performance":
                bg = `repeating-linear-gradient(45deg, ${base} 0 4px, ${accent} 4px 8px)`;
                break;
            default:
                bg = base;
        }

        el.style.background = bg;

    }


    /* =====================================================
       YOUR KIT
       ===================================================== */

    function renderYourKit() {

        if (!yourKitGrid) return;

        yourKitGrid.innerHTML = "";

        const selected = Object.values(selectedItems);

        if (yourKitCount) {
            yourKitCount.textContent = `${selected.length} / 7 selected`;
        }

        if (selected.length === 0) {
            yourKitGrid.innerHTML = `<div class="your-kit__empty">No items selected yet.</div>`;
            return;
        }

        selected.forEach(item => {

            const card = document.createElement("div");
            card.className = "kit-summary-card";

            const isJersey = item.id === "jersey";
            const detail = isJersey
                ? [item.size, item.design && item.design !== "solid" ? item.design.replace("-", " ") : null, item.playerName, item.number ? `#${item.number}` : null]
                    .filter(Boolean).join(" • ")
                : item.size;

            card.innerHTML = `
                <div class="kit-summary-card__icon">
                    ${gearItems.find(x => x.id === item.id)?.icon || "🏅"}
                </div>
                <div class="kit-summary-card__info">
                    <strong>${item.name}</strong>
                    <span>${detail}</span>
                </div>
                <div class="kit-summary-card__price">
                    ${formatPrice(itemEffectivePrice(item))}
                </div>
                <button type="button" class="kit-summary-card__remove" data-remove="${item.id}" aria-label="Remove ${item.name}">
                    ×
                </button>
            `;

            card.addEventListener("click", event => {

                const remove = event.target.closest("[data-remove]");

                if (remove) {
                    delete selectedItems[remove.dataset.remove];
                    if (activeItem === remove.dataset.remove) activeItem = null;
                    saveState();
                    renderItemGrid();
                    renderCustomPanel();
                    renderYourKit();
                    updateTotal();
                    updatePreview();
                    return;
                }

                activeItem = item.id;
                renderCustomPanel();
                renderItemGrid();

            });

            yourKitGrid.appendChild(card);

        });

    }


    /* =====================================================
       TOTAL
       ===================================================== */

    function calculateTotal() {
        return Object.values(selectedItems)
            .reduce((total, item) => total + itemEffectivePrice(item), 0);
    }

    function updateTotal() {

        const total = calculateTotal();
        const formatted = formatPrice(total);

        if (kitTotalPrice) kitTotalPrice.textContent = formatted;
        if (mobileStickyTotal) mobileStickyTotal.textContent = formatted;

        if (kitTotalBreakdown) {

            const jersey = selectedItems.jersey;
            const lines = [];

            if (jersey) {

                lines.push(`<div class="kit-total__breakdown-line"><span>Base Jersey</span><span>${formatPrice(jersey.price)}</span></div>`);

                if (jersey.design && jersey.design !== "solid") {
                    lines.push(`<div class="kit-total__breakdown-line"><span>Custom Design</span><span>+ ${formatPrice(JERSEY_DESIGN_ADDON)}</span></div>`);
                }

                if (jersey.logo) {
                    lines.push(`<div class="kit-total__breakdown-line"><span>Custom Logo</span><span>+ ${formatPrice(JERSEY_LOGO_ADDON)}</span></div>`);
                }

            }

            kitTotalBreakdown.innerHTML = lines.join("");

        }

    }


    /* =====================================================
       PREVIEW STAGE CREATION
       ===================================================== */

    function createPreviewStage(container) {

        if (!container) return;

        container.innerHTML = "";

        const template = document.getElementById("previewStageTemplate");
        if (!template) return;

        const clone = template.content.cloneNode(true);
        container.appendChild(clone);

        /* Scope the pattern/gradient ids to this container so the
           desktop and mobile stages never fight over the same <defs> id. */
        const suffix = container.id || Math.random().toString(36).slice(2);

        container.querySelectorAll("defs [id]").forEach(el => {
            el.id = `${el.id}__${suffix}`;
        });

    }


    const desktopPreviewStageWrap = document.getElementById("desktopPreviewStageWrap");
    const mobilePreviewStageWrap = document.getElementById("mobilePreviewStageWrap");

    createPreviewStage(desktopPreviewStageWrap);
    createPreviewStage(mobilePreviewStageWrap);


    function getPreviewRoots() {
        return [desktopPreviewStageWrap, mobilePreviewStageWrap].filter(Boolean);
    }

    function patternId(container, name) {
        const suffix = container.id || "";
        return `${name}__${suffix}`;
    }


    /* =====================================================
       UPDATE PREVIEW
       ===================================================== */

    function updatePreview() {

        getPreviewRoots().forEach(container => {

            const figure = container.querySelector(".kit-figure");
            if (!figure) return;

            container.querySelectorAll(".part").forEach(part => {
                part.style.display = "none";
            });

            /* -------------------------------------------------
               JERSEY
               ------------------------------------------------- */
            if (selectedItems.jersey) {

                const jersey = selectedItems.jersey;

                const jerseyPart = container.querySelector(
                    currentView === "front" ? ".part--jersey-front" : ".part--jersey-back"
                );

                if (jerseyPart) {
                    jerseyPart.style.display = "block";
                    applyJerseyDesign(container, jerseyPart, jersey);
                }

                const frontNumber = container.querySelector(".js-front-number");
                const teamNameFront = container.querySelector(".js-team-name-front");
                const backName = container.querySelector(".js-back-name");
                const backNumber = container.querySelector(".js-back-number");

                if (frontNumber) frontNumber.textContent = jersey.number || "00";
                if (teamNameFront) teamNameFront.textContent = jersey.teamName || "";
                if (backName) backName.textContent = jersey.playerName || "PLAYER";
                if (backNumber) backNumber.textContent = jersey.number || "00";

                /* Font style on all jersey text nodes */
                [frontNumber, teamNameFront, backName, backNumber].forEach(el => {
                    if (!el) return;
                    el.classList.remove(...JERSEY_FONTS.map(f => `jersey-font-${f.id}`));
                    el.classList.add(`jersey-font-${jersey.font || "modern"}`);
                });

                /* Collar / neckline */
                const necklinePath = NECKLINE_PATHS[jersey.collar] || NECKLINE_PATHS.round;
                const necklineFront = container.querySelector(".js-neckline");
                const necklineBack = container.querySelector(".js-neckline-back");
                if (necklineFront) necklineFront.setAttribute("d", necklinePath);
                if (necklineBack) necklineBack.setAttribute("d", necklinePath);

                /* Sleeve length */
                const isLong = jersey.sleeve === "long";
                const sleeveFront = container.querySelector(".js-sleeve-long");
                const sleeveBack = container.querySelector(".js-sleeve-long-back");
                if (sleeveFront) sleeveFront.style.display = isLong ? "block" : "none";
                if (sleeveBack) sleeveBack.style.display = isLong ? "block" : "none";

                /* Logo image (front only) */
                const logoImage = container.querySelector(".js-logo-front");
                const logoText = container.querySelector(".js-jersey-logo-text");
                if (logoImage) {
                    if (jersey.logo) {
                        logoImage.setAttribute("href", jersey.logo);
                        logoImage.setAttribute("xlink:href", jersey.logo);
                        logoImage.classList.add("is-visible");
                        if (logoText) logoText.style.display = "none";
                    } else {
                        logoImage.removeAttribute("href");
                        logoImage.classList.remove("is-visible");
                        if (logoText) logoText.style.display = "";
                    }
                }

            }

            /* -------------------------------------------------
               HELMET / CAP / GLOVES / SOCKS / SHOES / KIT BAG
               ------------------------------------------------- */
            ["helmet", "gloves", "socks", "shoes", "kitbag"].forEach(partId => {
                if (selectedItems[partId]) {
                    const part = container.querySelector(`.part--${partId}`);
                    if (part) {
                        part.style.display = "block";
                        applyPartColor(part, selectedItems[partId].color);
                    }
                }
            });

            if (selectedItems.cap && !selectedItems.helmet) {
                const part = container.querySelector(".part--cap");
                if (part) {
                    part.style.display = "block";
                    applyPartColor(part, selectedItems.cap.color);
                }
            }

            figure.style.transform = `scale(${zoomLevel})`;

        });

    }


    /* =====================================================
       APPLY JERSEY DESIGN (color + pattern + logo scoping)
       ===================================================== */

    function applyJerseyDesign(container, jerseyPart, jersey) {

        const color = jersey.color || "#111111";
        const accent = adjustColor(color, -40);
        const accent2 = adjustColor(color, -60);

        /* Recolor the pattern/gradient defs that live in this stage's <defs> */
        container.querySelectorAll(".pattern-bg").forEach(el => { el.style.fill = color; });
        container.querySelectorAll(".pattern-fg").forEach(el => { el.style.fill = accent; });
        container.querySelectorAll(".pattern-grad-a").forEach(el => { el.style.stopColor = color; });
        container.querySelectorAll(".pattern-grad-b").forEach(el => { el.style.stopColor = accent2; });

        let fillValue = color;

        switch (jersey.design) {
            case "stripes-v":
                fillValue = `url(#${patternId(container, "patternStripesV")})`;
                break;
            case "stripes-h":
                fillValue = `url(#${patternId(container, "patternStripesH")})`;
                break;
            case "gradient":
                fillValue = `url(#${patternId(container, "patternGradient")})`;
                break;
            case "geometric":
                fillValue = `url(#${patternId(container, "patternGeometric")})`;
                break;
            case "performance":
                fillValue = `url(#${patternId(container, "patternPerformance")})`;
                break;
            default:
                fillValue = color;
        }

        const body = jerseyPart.querySelector(".js-jersey-body, .js-jersey-body-back");
        if (body) {
            body.style.fill = fillValue;
            body.style.opacity = "1";
        }

        applyPartColor(jerseyPart, color);

    }


    /* =====================================================
       APPLY COLOR TO SVG PART (non-jersey parts)
       ===================================================== */

    function applyPartColor(part, color) {

        if (!part || !color) return;

        part.querySelectorAll(".part__fill").forEach(element => {
            if (element.classList.contains("js-jersey-body") || element.classList.contains("js-jersey-body-back")) return;
            element.style.fill = color;
        });

        part.querySelectorAll(".part__accent").forEach(element => {
            element.style.fill = adjustColor(color, -25);
        });

        part.querySelectorAll(".part__shade").forEach(element => {
            element.style.fill = adjustColor(color, -35);
        });

        part.querySelectorAll(".part__stroke").forEach(element => {
            element.style.stroke = adjustColor(color, -35);
        });

    }


    /* =====================================================
       COLOR BRIGHTNESS
       ===================================================== */

    function adjustColor(hex, amount) {

        if (!hex || hex[0] !== "#") return hex;

        let color = hex.substring(1);

        if (color.length === 3) {
            color = color.split("").map(x => x + x).join("");
        }

        let num = parseInt(color, 16);

        let r = Math.max(0, Math.min(255, (num >> 16) + amount));
        let g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
        let b = Math.max(0, Math.min(255, (num & 0xff) + amount));

        return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");

    }


    /* =====================================================
       FRONT / BACK
       ===================================================== */

    function setView(view) {

        currentView = view === "back" ? "back" : "front";

        if (viewFrontBtn) {
            viewFrontBtn.classList.toggle("is-active", currentView === "front");
            viewFrontBtn.setAttribute("aria-pressed", currentView === "front" ? "true" : "false");
        }

        if (viewBackBtn) {
            viewBackBtn.classList.toggle("is-active", currentView === "back");
            viewBackBtn.setAttribute("aria-pressed", currentView === "back" ? "true" : "false");
        }

        getPreviewRoots().forEach(container => {
            const stage = container.querySelector(".preview-stage");
            if (stage) stage.classList.toggle("is-back", currentView === "back");
        });

        updatePreview();

    }

    if (viewFrontBtn) viewFrontBtn.addEventListener("click", () => setView("front"));
    if (viewBackBtn) viewBackBtn.addEventListener("click", () => setView("back"));


    /* =====================================================
       ZOOM
       ===================================================== */

    if (zoomInBtn) {
        zoomInBtn.addEventListener("click", () => {
            zoomLevel = Math.min(1.7, zoomLevel + 0.1);
            updatePreview();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener("click", () => {
            zoomLevel = Math.max(0.7, zoomLevel - 0.1);
            updatePreview();
        });
    }

    if (resetPreviewBtn) {
        resetPreviewBtn.addEventListener("click", () => {
            zoomLevel = 1;
            setView("front");
        });
    }


    /* =====================================================
       CART
       (kept on the existing "khelzoneCart" key + single combined
       "custom-kit" line item, exactly as the current project uses —
       cart.html/cart.js were not provided, so this format is untouched.)
       ===================================================== */

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem("khelzoneCart")) || [];
        } catch {
            return [];
        }
    }

    function saveCart(cart) {
        localStorage.setItem("khelzoneCart", JSON.stringify(cart));
    }

    function updateCartBadge() {
        const cart = getCart();
        const count = cart.reduce((total, item) => total + Number(item.quantity || 1), 0);
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.hidden = count === 0;
        }
    }


    /* =====================================================
       CREATE CUSTOM KIT CART ITEM
       ===================================================== */

    function createCartItem() {

        return {
            id: "custom-kit-" + Date.now(),
            type: "custom-kit",
            name: "Custom Sports Kit",
            price: calculateTotal(),
            quantity: 1,
            customization: JSON.parse(JSON.stringify(selectedItems)),
            addedAt: new Date().toISOString()
        };

    }


    /* =====================================================
       ADD TO CART
       ===================================================== */

    function addCustomKitToCart() {

        const selected = Object.values(selectedItems);

        if (selected.length === 0) {
            showToast("SELECT AT LEAST ONE ITEM");
            return;
        }

        openSummaryModal();

    }

    if (addToCartBtn) addToCartBtn.addEventListener("click", addCustomKitToCart);
    if (mobileStickyAddBtn) mobileStickyAddBtn.addEventListener("click", addCustomKitToCart);


    /* =====================================================
       SUMMARY MODAL
       ===================================================== */

    const summaryModalOverlay = document.getElementById("summaryModalOverlay");
    const summaryModalBody = document.getElementById("summaryModalBody");
    const summaryModalTotal = document.getElementById("summaryModalTotal");
    const summaryModalClose = document.getElementById("summaryModalClose");
    const summaryCancelBtn = document.getElementById("summaryCancelBtn");
    const summaryConfirmBtn = document.getElementById("summaryConfirmBtn");


    function openSummaryModal() {

        if (!summaryModalOverlay) return;

        const items = Object.values(selectedItems);

        if (summaryModalBody) {

            summaryModalBody.innerHTML = items.map(item => {

                const isJersey = item.id === "jersey";

                const lines = [`<div class="summary-line"><span>Size</span><strong>${item.size}</strong></div>`];

                if (isJersey) {
                    lines.push(`<div class="summary-line"><span>Color</span><strong>${item.color}</strong></div>`);
                    if (item.design && item.design !== "solid") {
                        lines.push(`<div class="summary-line"><span>Design</span><strong>${item.design.replace("-", " ")}</strong></div>`);
                    }
                    if (item.teamName) lines.push(`<div class="summary-line"><span>Team Name</span><strong>${escapeHTML(item.teamName)}</strong></div>`);
                    if (item.playerName) lines.push(`<div class="summary-line"><span>Player Name</span><strong>${escapeHTML(item.playerName)}</strong></div>`);
                    lines.push(`<div class="summary-line"><span>Number</span><strong>#${item.number || "00"}</strong></div>`);
                    lines.push(`<div class="summary-line"><span>Font</span><strong>${item.font}</strong></div>`);
                    lines.push(`<div class="summary-line"><span>Collar</span><strong>${item.collar}</strong></div>`);
                    lines.push(`<div class="summary-line"><span>Sleeve</span><strong>${item.sleeve}</strong></div>`);
                    lines.push(`<div class="summary-line"><span>Logo</span><strong>${item.logo ? "Uploaded" : "None"}</strong></div>`);
                }

                lines.push(`<div class="summary-line summary-line--price"><span>Item Price</span><strong>${formatPrice(itemEffectivePrice(item))}</strong></div>`);

                return `
                    <div class="summary-block">
                        <p class="summary-block__title">${item.name}</p>
                        ${lines.join("")}
                    </div>
                `;

            }).join("");

        }

        if (summaryModalTotal) {
            summaryModalTotal.textContent = formatPrice(calculateTotal());
        }

        summaryModalOverlay.hidden = false;
        document.body.classList.add("modal-open");

    }

    function closeSummaryModal() {
        if (!summaryModalOverlay) return;
        summaryModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
    }

    if (summaryModalClose) summaryModalClose.addEventListener("click", closeSummaryModal);
    if (summaryCancelBtn) summaryCancelBtn.addEventListener("click", closeSummaryModal);

    if (summaryModalOverlay) {
        summaryModalOverlay.addEventListener("click", event => {
            if (event.target === summaryModalOverlay) closeSummaryModal();
        });
    }


    /* =====================================================
       CONFIRM CART
       ===================================================== */

    if (summaryConfirmBtn) {
        summaryConfirmBtn.addEventListener("click", () => {

            const cart = getCart();
            const customKit = createCartItem();

            cart.push(customKit);
            saveCart(cart);
            updateCartBadge();
            closeSummaryModal();
            showToast("CUSTOM KIT ADDED TO CART");

        });
    }


    /* =====================================================
       RESET ALL
       ===================================================== */

    const resetModalOverlay = document.getElementById("resetModalOverlay");
    const resetCancelBtn = document.getElementById("resetCancelBtn");
    const resetConfirmBtn = document.getElementById("resetConfirmBtn");

    function openResetModal() {
        if (!resetModalOverlay) {
            performReset();
            return;
        }
        resetModalOverlay.hidden = false;
        document.body.classList.add("modal-open");
    }

    function closeResetModal() {
        if (!resetModalOverlay) return;
        resetModalOverlay.hidden = true;
        document.body.classList.remove("modal-open");
    }

    function performReset() {

        selectedItems = {};
        activeItem = null;
        currentView = "front";
        zoomLevel = 1;

        localStorage.removeItem("khelzoneCustomKit");

        renderItemGrid();
        renderCustomPanel();
        renderYourKit();
        updateTotal();
        setView("front");
        closeResetModal();

    }

    if (resetAllBtn) resetAllBtn.addEventListener("click", openResetModal);
    if (resetCancelBtn) resetCancelBtn.addEventListener("click", closeResetModal);
    if (resetConfirmBtn) resetConfirmBtn.addEventListener("click", performReset);


    /* =====================================================
       TOAST
       ===================================================== */

    const successToast = document.getElementById("successToast");

    function showToast(message) {

        if (!successToast) return;

        const span = successToast.querySelector("span");
        if (span) span.textContent = message;

        successToast.hidden = false;
        successToast.classList.add("is-visible");

        setTimeout(() => {
            successToast.classList.remove("is-visible");
            setTimeout(() => { successToast.hidden = true; }, 300);
        }, 2500);

    }


    /* =====================================================
       MOBILE NAV
       ===================================================== */

    if (navToggle && navMobile) {

        navToggle.addEventListener("click", () => {
            const opened = navMobile.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });

        navMobile.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                navMobile.classList.remove("is-open");
                navToggle.setAttribute("aria-expanded", "false");
            });
        });

    }


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeSummaryModal();
            closeResetModal();
        }
    });


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    loadState();

    /* Backfill new jersey fields for kits saved before this upgrade */
    if (selectedItems.jersey) {
        const j = selectedItems.jersey;
        if (j.teamName === undefined) j.teamName = "KHELZONE FC";
        if (j.design === undefined) j.design = "solid";
        if (j.font === undefined) j.font = "modern";
        if (j.collar === undefined) j.collar = "round";
        if (j.sleeve === undefined) j.sleeve = "short";
        if (j.logo === undefined) j.logo = null;
    }

    renderItemGrid();
    renderCustomPanel();
    renderYourKit();
    updateTotal();
    updateCartBadge();
    setView("front");

});