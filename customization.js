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

    /* -----------------------------------------------------
       LOGO DRAG-TO-REPOSITION
       The <image class="js-logo-front"> in the SVG template
       sits at this base x/y by default. We keep a per-jersey
       offset (logoOffsetX/Y) and add it on top of the base
       position, clamped so the logo can't be dragged off
       the chest area.
    ----------------------------------------------------- */

    const JERSEY_LOGO_BASE_X = 138;
    const JERSEY_LOGO_BASE_Y = 118;
    const JERSEY_LOGO_OFFSET_X_RANGE = [-40, 40];
    const JERSEY_LOGO_OFFSET_Y_RANGE = [-20, 90];

    function clampLogoOffset(jersey) {
        const [minX, maxX] = JERSEY_LOGO_OFFSET_X_RANGE;
        const [minY, maxY] = JERSEY_LOGO_OFFSET_Y_RANGE;
        jersey.logoOffsetX = Math.max(minX, Math.min(maxX, Number(jersey.logoOffsetX) || 0));
        jersey.logoOffsetY = Math.max(minY, Math.min(maxY, Number(jersey.logoOffsetY) || 0));
    }

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
       BUILDER DRAFT STORAGE
       (this is ONLY the "resume where I left off" state for the
       kit builder itself — separate from the shopping cart)
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
                baseState.logoOffsetX = 0;
                baseState.logoOffsetY = 0;
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
                            ${state.logo ? `<button type="button" class="logo-upload__btn" id="logoResetPosBtn">CENTER LOGO</button>` : ""}
                            ${state.logo ? `<button type="button" class="logo-upload__remove" id="logoRemoveBtn">REMOVE</button>` : ""}
                        </div>
                    </div>
                    <p class="field-hint" id="logoError"></p>
                    ${state.logo ? `<p class="field-hint">Tip: drag the logo directly on the jersey preview (front view) to reposition it.</p>` : ""}
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
                    /* New upload always starts centered */
                    state.logoOffsetX = 0;
                    state.logoOffsetY = 0;
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
                state.logoOffsetX = 0;
                state.logoOffsetY = 0;
                saveState();
                renderCustomPanel();
                renderYourKit();
                updateTotal();
                updatePreview();
            });
        }

        const logoResetPosBtn = document.getElementById("logoResetPosBtn");
        if (logoResetPosBtn) {
            logoResetPosBtn.addEventListener("click", () => {
                state.logoOffsetX = 0;
                state.logoOffsetY = 0;
                saveState();
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
       LOGO DRAG-TO-REPOSITION (pointer events on the SVG <image>)
       ===================================================== */

    function toSVGPoint(svg, evt) {
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const ctm = svg.getScreenCTM();
        if (!ctm) return { x: 0, y: 0 };
        const svgPoint = pt.matrixTransform(ctm.inverse());
        return { x: svgPoint.x, y: svgPoint.y };
    }

    function attachLogoDrag(container, imageEl) {

        if (!imageEl || imageEl.dataset.dragBound === "1") return;
        imageEl.dataset.dragBound = "1";

        let dragging = false;
        let startPointer = { x: 0, y: 0 };
        let startOffset = { x: 0, y: 0 };

        /* Always read the live jersey state — the DOM node is reused
           across selections/removals, so we never capture a stale
           reference in this closure. */
        function getJersey() {
            return selectedItems.jersey;
        }

        imageEl.addEventListener("pointerdown", evt => {

            const jersey = getJersey();
            if (!jersey || !jersey.logo || currentView !== "front") return;

            const svg = container.querySelector(".kit-figure");

            evt.preventDefault();
            dragging = true;

            imageEl.classList.add("is-dragging");

            try { imageEl.setPointerCapture(evt.pointerId); } catch (e) { /* no-op */ }

            startPointer = toSVGPoint(svg, evt);
            startOffset = { x: jersey.logoOffsetX || 0, y: jersey.logoOffsetY || 0 };

        });

        imageEl.addEventListener("pointermove", evt => {

            if (!dragging) return;

            const jersey = getJersey();
            if (!jersey) return;

            const svg = container.querySelector(".kit-figure");
            const current = toSVGPoint(svg, evt);

            jersey.logoOffsetX = startOffset.x + (current.x - startPointer.x);
            jersey.logoOffsetY = startOffset.y + (current.y - startPointer.y);

            clampLogoOffset(jersey);

            updatePreview();

        });

        function endDrag() {
            if (!dragging) return;
            dragging = false;
            imageEl.classList.remove("is-dragging");
            saveState();
        }

        imageEl.addEventListener("pointerup", endDrag);
        imageEl.addEventListener("pointercancel", endDrag);
        imageEl.addEventListener("lostpointercapture", endDrag);

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

                /* Logo image (front only, draggable) */
                const logoImage = container.querySelector(".js-logo-front");
                const logoText = container.querySelector(".js-jersey-logo-text");
                if (logoImage) {
                    if (jersey.logo) {
                        clampLogoOffset(jersey);
                        logoImage.setAttribute("href", jersey.logo);
                        logoImage.setAttribute("xlink:href", jersey.logo);
                        logoImage.setAttribute("x", JERSEY_LOGO_BASE_X + jersey.logoOffsetX);
                        logoImage.setAttribute("y", JERSEY_LOGO_BASE_Y + jersey.logoOffsetY);
                        logoImage.classList.add("is-visible", "logo-draggable");
                        if (logoText) logoText.style.display = "none";
                        attachLogoDrag(container, logoImage);
                    } else {
                        logoImage.removeAttribute("href");
                        logoImage.removeAttribute("xlink:href");
                        logoImage.setAttribute("x", JERSEY_LOGO_BASE_X);
                        logoImage.setAttribute("y", JERSEY_LOGO_BASE_Y);
                        logoImage.classList.remove("is-visible", "logo-draggable", "is-dragging");
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
       SHOPPING CART INTEGRATION
       (Uses the SAME localStorage key + item shape that
       cart.js / cart.html already read, so customized kits
       land in the exact same cart as normal shop products.
       No second/parallel cart system.)
       ===================================================== */

    const CART_STORAGE_KEY = "khz_cart";

    function getCart() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    function saveCart(cartData) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    }

    function updateCartBadge() {
        const cartData = getCart();
        const count = cartData.reduce((total, item) => total + Number(item.qty ?? item.quantity ?? 1), 0);
        if (cartBadge) {
            cartBadge.textContent = count;
            cartBadge.hidden = count === 0;
        }
    }


    /* =====================================================
       CAPTURE A PREVIEW IMAGE OF THE CURRENT KIT
       Serializes the live SVG preview into a self-contained
       data URI so it can travel with the cart item without
       needing any server-side rendering.

       A data-URI SVG rendered inside an <img> tag on cart.html
       can't reach customization.css, so anything that was being
       driven purely by CSS classes (jersey font choice, the
       .part.is-selected opacity rule that nothing in this file
       ever actually toggles) would otherwise be silently lost —
       leaving every accent/shade/trim on a selected item stuck
       at its default 35% "unselected" opacity and making the
       thumbnail look washed out no matter what was picked.
       To fix that we bake the handful of relevant styles in by
       hand before serializing, strip the editor-only guide
       lines, and add a clean backdrop + a little padding so it
       reads as an actual product shot.
       ========================================================= */

    const FALLBACK_KIT_IMAGE = "https://placehold.co/300x300/111111/ffffff?text=KHELZONE";

    const THUMBNAIL_FONT_STACKS = {
        classic: "'Playfair Display', Georgia, serif",
        athletic: "'Oswald', 'Arial Narrow', sans-serif",
        modern: "'Space Grotesk', system-ui, sans-serif",
        bold: "'Anton', Impact, sans-serif",
        performance: "'Barlow Condensed', sans-serif"
    };

    function buildThumbnailStyleBlock() {
        const fontRules = Object.entries(THUMBNAIL_FONT_STACKS)
            .map(([id, stack]) => `.jersey-font-${id} { font-family: ${stack} !important; }`)
            .join(" ");
        return `
            text { font-family: 'Space Grotesk', system-ui, sans-serif; }
            ${fontRules}
            .jersey-font-classic { font-style: italic; }
            .jersey-font-athletic { letter-spacing: 1px; }
            .jersey-font-performance { font-style: italic; }
        `;
    }

    function captureKitPreviewImage() {

        try {

            const source = (desktopPreviewStageWrap || mobilePreviewStageWrap);
            const svg = source && source.querySelector(".kit-figure");

            if (!svg) return FALLBACK_KIT_IMAGE;

            const clone = svg.cloneNode(true);
            clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            clone.style.transform = "";

            /* Widen the viewBox a touch so the figure gets breathing
               room instead of touching the thumbnail's edges. */
            clone.setAttribute("viewBox", "-14 -10 348 440");
            clone.removeAttribute("width");
            clone.removeAttribute("height");
            clone.setAttribute("preserveAspectRatio", "xMidYMid meet");

            /* The faint body silhouette is an editing guide only —
               it isn't part of the actual product, drop it. */
            const silhouette = clone.querySelector(".kit-figure__silhouette");
            if (silhouette) silhouette.remove();

            /* Clean, neutral backdrop so the thumbnail reads as a
               real product shot instead of a transparent cutout
               floating on whatever background cart.html uses. */
            const backdrop = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            backdrop.setAttribute("x", "-14");
            backdrop.setAttribute("y", "-10");
            backdrop.setAttribute("width", "348");
            backdrop.setAttribute("height", "440");
            backdrop.setAttribute("rx", "18");
            backdrop.setAttribute("fill", "#161616");

            /* Inline the only CSS the thumbnail actually needs
               (jersey font choice) since data-URI SVGs can't load
               customization.css. */
            const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
            styleEl.textContent = buildThumbnailStyleBlock();

            clone.insertBefore(styleEl, clone.firstChild);
            clone.insertBefore(backdrop, styleEl.nextSibling);

            /* Only the parts actually selected by the customer should
               render at full strength. Baked in explicitly here since
               the live builder never toggles the CSS class this was
               meant to come from — without this every accent/trim on
               a selected item would render at 35% opacity. */
            clone.querySelectorAll(".part").forEach(part => {
                const isVisible = part.style.display !== "none";
                if (!isVisible) return;
                part.querySelectorAll(".part__fill, .part__accent, .part__stroke, .part__shade, .part__logo")
                    .forEach(el => { el.style.opacity = "1"; });
            });

            /* Uploaded logo image: bake its visibility in explicitly too. */
            clone.querySelectorAll(".part__logo-image").forEach(imgEl => {
                imgEl.style.opacity = imgEl.classList.contains("is-visible") ? "1" : "0";
                imgEl.classList.remove("is-dragging");
            });

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(clone);

            if (!svgString) return FALLBACK_KIT_IMAGE;

            return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

        } catch (error) {
            return FALLBACK_KIT_IMAGE;
        }

    }


    /* =====================================================
       BUILD PER-ITEM CUSTOMIZATION DETAILS
       ===================================================== */

    function buildCustomizationDetails() {

        return Object.values(selectedItems).map(item => {

            const isJersey = item.id === "jersey";

            const detail = {
                id: item.id,
                name: item.name,
                size: item.size,
                color: item.color,
                price: itemEffectivePrice(item)
            };

            if (isJersey) {
                detail.design = item.design;
                detail.font = item.font;
                detail.collar = item.collar;
                detail.sleeve = item.sleeve;
                detail.teamName = item.teamName || "";
                detail.playerName = item.playerName || "";
                detail.number = item.number || "";
                detail.hasLogo = Boolean(item.logo);
                detail.logo = item.logo || null;
                detail.logoOffsetX = item.logoOffsetX || 0;
                detail.logoOffsetY = item.logoOffsetY || 0;
            }

            return detail;

        });

    }


    /* =====================================================
       STABLE HASH (so identical configurations map to the
       same cart line, and different ones never collide)
       ===================================================== */

    function hashString(value) {
        let hash = 0;
        for (let i = 0; i < value.length; i++) {
            hash = (hash << 5) - hash + value.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }


    /* =====================================================
       BUILD THE ACTUAL khz_cart-COMPATIBLE ITEM
       ===================================================== */

    function buildCustomCartItem() {

        const itemsDetail = buildCustomizationDetails();

        const name = itemsDetail.length === 1
            ? `Custom ${itemsDetail[0].name}`
            : `Custom Kit (${itemsDetail.map(d => d.name).join(" + ")})`;

        const configKey = JSON.stringify(itemsDetail);
        const id = "custom-" + hashString(configKey);

        return {
            id,
            productId: id,
            isCustom: true,
            name,
            category: "Custom Kit",
            price: calculateTotal(),
            image: captureKitPreviewImage(),
            size: "Custom",
            qty: 1,
            customization: {
                items: itemsDetail
            }
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
       Pushes into the SAME khz_cart array cart.js reads.
       If an identical configuration already exists (same
       hash), its quantity is incremented instead of creating
       a duplicate line. Any different configuration (name,
       number, color, design, logo, etc.) always gets its own
       separate line, since its hash will differ.
       ===================================================== */

    if (summaryConfirmBtn) {
        summaryConfirmBtn.addEventListener("click", () => {

            const cartData = getCart();
            const newItem = buildCustomCartItem();

            const existingIndex = cartData.findIndex(cartItem => String(cartItem.id) === String(newItem.id));

            if (existingIndex !== -1) {
                const existing = cartData[existingIndex];
                existing.qty = Number(existing.qty ?? existing.quantity ?? 1) + 1;
                delete existing.quantity;
                /* Keep the freshest snapshot of the customization/image in case
                   anything about the build changed since it was first added. */
                existing.customization = newItem.customization;
                existing.image = newItem.image;
                existing.price = newItem.price;
            } else {
                cartData.push(newItem);
            }

            saveCart(cartData);
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
        if (j.logoOffsetX === undefined) j.logoOffsetX = 0;
        if (j.logoOffsetY === undefined) j.logoOffsetY = 0;
    }

    renderItemGrid();
    renderCustomPanel();
    renderYourKit();
    updateTotal();
    updateCartBadge();
    setView("front");

});