/* =========================================================
   KHELZONE — CUSTOMIZATION.JS
   Complete Kit Builder
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    const gearItems = [
        {
            id: "jersey",
            name: "Jersey",
            price: 2500,
            icon: "👕",
            description: "Custom sports jersey",
            colors: ["#111111", "#ffffff", "#ff5a00", "#2563eb", "#16a34a", "#dc2626"],
            sizes: ["S", "M", "L", "XL", "XXL"],
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

    const itemGrid =
        document.getElementById("itemGrid");

    const customPanel =
        document.getElementById("customPanel");

    const customPanelEmpty =
        document.getElementById("customPanelEmpty");

    const yourKitGrid =
        document.getElementById("yourKitGrid");

    const yourKitCount =
        document.getElementById("yourKitCount");

    const kitTotalPrice =
        document.getElementById("kitTotalPrice");

    const mobileStickyTotal =
        document.getElementById("mobileStickyTotal");

    const cartBadge =
        document.getElementById("cartBadge");

    const addToCartBtn =
        document.getElementById("addToCartBtn");

    const mobileStickyAddBtn =
        document.getElementById("mobileStickyAddBtn");

    const resetAllBtn =
        document.getElementById("resetAllBtn");

    const viewFrontBtn =
        document.getElementById("viewFrontBtn");

    const viewBackBtn =
        document.getElementById("viewBackBtn");

    const zoomInBtn =
        document.getElementById("zoomInBtn");

    const zoomOutBtn =
        document.getElementById("zoomOutBtn");

    const resetPreviewBtn =
        document.getElementById("resetPreviewBtn");

    const navToggle =
        document.getElementById("navToggle");

    const navMobile =
        document.getElementById("navMobile");


    /* =====================================================
       LOCAL STORAGE
       ===================================================== */

    function saveState() {

        localStorage.setItem(
            "khelzoneCustomKit",
            JSON.stringify(selectedItems)
        );

    }


    function loadState() {

        try {

            const saved =
                localStorage.getItem("khelzoneCustomKit");

            if (!saved) return;

            selectedItems =
                JSON.parse(saved) || {};

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
       CREATE ITEM GRID
       ===================================================== */

    function renderItemGrid() {

        if (!itemGrid) return;

        itemGrid.innerHTML = "";

        gearItems.forEach(item => {

            const selected =
                Boolean(selectedItems[item.id]);

            const card =
                document.createElement("button");

            card.type = "button";

            card.className =
                "gear-card" +
                (selected ? " is-selected" : "");

            card.dataset.item =
                item.id;

            card.innerHTML = `

                <div class="gear-card__visual">

                    <span class="gear-card__icon">
                        ${item.icon}
                    </span>

                    ${selected ? `
                        <span class="gear-card__check">
                            ✓
                        </span>
                    ` : ""}

                </div>

                <div class="gear-card__content">

                    <strong>
                        ${item.name}
                    </strong>

                    <small>
                        ${item.description}
                    </small>

                    <span class="gear-card__price">
                        ${formatPrice(item.price)}
                    </span>

                </div>

                <span class="gear-card__action">
                    ${selected ? "UNSELECT" : "SELECT"}
                </span>

            `;

            card.addEventListener(
                "click",
                () => toggleItem(item.id)
            );

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

            const item =
                gearItems.find(
                    product => product.id === itemId
                );

            if (!item) return;

            selectedItems[itemId] = {

                id: item.id,

                name: item.name,

                price: item.price,

                color: item.colors[0],

                size: item.sizes[
                    Math.min(
                        1,
                        item.sizes.length - 1
                    )
                ],

                playerName:
                    item.id === "jersey"
                        ? "PLAYER"
                        : "",

                number:
                    item.id === "jersey"
                        ? "00"
                        : ""

            };

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

        const oldControls =
            customPanel.querySelector(
                ".custom-controls"
            );

        if (oldControls) {
            oldControls.remove();
        }

        if (!activeItem ||
            !selectedItems[activeItem]) {

            if (customPanelEmpty) {
                customPanelEmpty.style.display = "flex";
            }

            return;

        }

        if (customPanelEmpty) {
            customPanelEmpty.style.display = "none";
        }

        const item =
            gearItems.find(
                product => product.id === activeItem
            );

        const state =
            selectedItems[activeItem];

        if (!item) return;

        const controls =
            document.createElement("div");

        controls.className =
            "custom-controls";


        /* -------------------------------------------------
           HEADER
           ------------------------------------------------- */

        controls.innerHTML = `

            <div class="custom-controls__header">

                <div>

                    <span class="badge">
                        CUSTOMIZING
                    </span>

                    <h3>
                        ${item.name}
                    </h3>

                </div>

                <button
                    type="button"
                    class="custom-controls__unselect"
                    id="unselectActiveBtn"
                >
                    UNSELECT
                </button>

            </div>


            <!-- COLOR -->

            <div class="custom-field">

                <label>
                    COLOR
                </label>

                <div
                    class="color-options"
                    id="colorOptions"
                >

                    ${item.colors.map(color => `

                        <button
                            type="button"
                            class="color-option ${state.color === color ? "is-active" : ""}"
                            data-color="${color}"
                            style="background:${color}"
                            aria-label="Choose color ${color}"
                        ></button>

                    `).join("")}

                </div>

            </div>


            <!-- SIZE -->

            <div class="custom-field">

                <label>
                    SIZE
                </label>

                <div
                    class="size-options"
                    id="sizeOptions"
                >

                    ${item.sizes.map(size => `

                        <button
                            type="button"
                            class="size-option ${state.size === size ? "is-active" : ""}"
                            data-size="${size}"
                        >
                            ${size}
                        </button>

                    `).join("")}

                </div>

            </div>


            ${
                item.id === "jersey"
                ? `

                <!-- PLAYER NAME -->

                <div class="custom-field">

                    <label for="playerNameInput">
                        PLAYER NAME
                    </label>

                    <input
                        type="text"
                        id="playerNameInput"
                        maxlength="14"
                        value="${escapeHTML(state.playerName || "")}"
                        placeholder="PLAYER"
                    />

                </div>


                <!-- PLAYER NUMBER -->

                <div class="custom-field">

                    <label for="playerNumberInput">
                        PLAYER NUMBER
                    </label>

                    <input
                        type="text"
                        id="playerNumberInput"
                        maxlength="2"
                        inputmode="numeric"
                        value="${escapeHTML(state.number || "00")}"
                        placeholder="00"
                    />

                </div>

                `
                : ""
            }


            <div class="custom-controls__footer">

                <span>
                    ${item.name}
                </span>

                <strong>
                    ${formatPrice(item.price)}
                </strong>

            </div>

        `;

        customPanel.appendChild(controls);


        /* =================================================
           COLOR BUTTONS
           ================================================= */

        controls
            .querySelectorAll(".color-option")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.color =
                            button.dataset.color;

                        saveState();

                        renderCustomPanel();

                        updatePreview();

                    }
                );

            });


        /* =================================================
           SIZE BUTTONS
           ================================================= */

        controls
            .querySelectorAll(".size-option")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        state.size =
                            button.dataset.size;

                        saveState();

                        renderCustomPanel();

                    }
                );

            });


        /* =================================================
           UNSELECT
           ================================================= */

        const unselectBtn =
            document.getElementById(
                "unselectActiveBtn"
            );

        if (unselectBtn) {

            unselectBtn.addEventListener(
                "click",
                () => {

                    delete selectedItems[activeItem];

                    activeItem = null;

                    saveState();

                    renderItemGrid();

                    renderCustomPanel();

                    renderYourKit();

                    updateTotal();

                    updatePreview();

                }
            );

        }


        /* =================================================
           PLAYER NAME
           ================================================= */

        const playerNameInput =
            document.getElementById(
                "playerNameInput"
            );

        if (playerNameInput) {

            playerNameInput.addEventListener(
                "input",
                event => {

                    state.playerName =
                        event.target.value
                            .toUpperCase();

                    updatePreview();

                    saveState();

                }
            );

        }


        /* =================================================
           PLAYER NUMBER
           ================================================= */

        const playerNumberInput =
            document.getElementById(
                "playerNumberInput"
            );

        if (playerNumberInput) {

            playerNumberInput.addEventListener(
                "input",
                event => {

                    event.target.value =
                        event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);

                    state.number =
                        event.target.value || "00";

                    updatePreview();

                    saveState();

                }
            );

        }

    }


    /* =====================================================
       YOUR KIT
       ===================================================== */

    function renderYourKit() {

        if (!yourKitGrid) return;

        yourKitGrid.innerHTML = "";

        const selected =
            Object.values(selectedItems);

        if (yourKitCount) {

            yourKitCount.textContent =
                `${selected.length} / 7 selected`;

        }


        if (selected.length === 0) {

            yourKitGrid.innerHTML = `

                <div class="your-kit__empty">
                    No items selected yet.
                </div>

            `;

            return;

        }


        selected.forEach(item => {

            const card =
                document.createElement("div");

            card.className =
                "kit-summary-card";

            card.innerHTML = `

                <div class="kit-summary-card__icon">
                    ${
                        gearItems.find(
                            x => x.id === item.id
                        )?.icon || "🏅"
                    }
                </div>

                <div class="kit-summary-card__info">

                    <strong>
                        ${item.name}
                    </strong>

                    <span>
                        ${item.size}
                    </span>

                </div>

                <div class="kit-summary-card__price">
                    ${formatPrice(item.price)}
                </div>

                <button
                    type="button"
                    class="kit-summary-card__remove"
                    data-remove="${item.id}"
                    aria-label="Remove ${item.name}"
                >
                    ×
                </button>

            `;

            card.addEventListener(
                "click",
                event => {

                    const remove =
                        event.target.closest(
                            "[data-remove]"
                        );

                    if (remove) {

                        delete selectedItems[
                            remove.dataset.remove
                        ];

                        if (
                            activeItem ===
                            remove.dataset.remove
                        ) {
                            activeItem = null;
                        }

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

                }
            );

            yourKitGrid.appendChild(card);

        });

    }


    /* =====================================================
       TOTAL
       ===================================================== */

    function calculateTotal() {

        return Object.values(selectedItems)
            .reduce(
                (total, item) =>
                    total + Number(item.price || 0),
                0
            );

    }


    function updateTotal() {

        const total =
            calculateTotal();

        const formatted =
            formatPrice(total);

        if (kitTotalPrice) {
            kitTotalPrice.textContent =
                formatted;
        }

        if (mobileStickyTotal) {
            mobileStickyTotal.textContent =
                formatted;
        }

    }


    /* =====================================================
       PREVIEW STAGE CREATION
       ===================================================== */

    function createPreviewStage(container) {

        if (!container) return;

        container.innerHTML = "";

        const template =
            document.getElementById(
                "previewStageTemplate"
            );

        if (!template) return;

        const clone =
            template.content.cloneNode(true);

        container.appendChild(clone);

    }


    const desktopPreviewStageWrap =
        document.getElementById(
            "desktopPreviewStageWrap"
        );

    const mobilePreviewStageWrap =
        document.getElementById(
            "mobilePreviewStageWrap"
        );


    createPreviewStage(
        desktopPreviewStageWrap
    );

    createPreviewStage(
        mobilePreviewStageWrap
    );


    /* =====================================================
       GET ALL PREVIEW ROOTS
       ===================================================== */

    function getPreviewRoots() {

        return [
            desktopPreviewStageWrap,
            mobilePreviewStageWrap
        ].filter(Boolean);

    }


    /* =====================================================
       UPDATE PREVIEW
       ===================================================== */

    function updatePreview() {

        getPreviewRoots()
            .forEach(container => {

                const figure =
                    container.querySelector(
                        ".kit-figure"
                    );

                if (!figure) return;


                /* -------------------------------------------------
                   RESET PART VISIBILITY
                   ------------------------------------------------- */

                container
                    .querySelectorAll(".part")
                    .forEach(part => {

                        part.style.display =
                            "none";

                    });


                /* -------------------------------------------------
                   JERSEY
                   ------------------------------------------------- */

                if (selectedItems.jersey) {

                    const jersey =
                        selectedItems.jersey;

                    const jerseyPart =
                        container.querySelector(
                            currentView === "front"
                                ? ".part--jersey-front"
                                : ".part--jersey-back"
                        );

                    if (jerseyPart) {

                        jerseyPart.style.display =
                            "block";

                        applyPartColor(
                            jerseyPart,
                            jersey.color
                        );

                    }


                    const frontNumber =
                        container.querySelector(
                            ".js-front-number"
                        );

                    const backName =
                        container.querySelector(
                            ".js-back-name"
                        );

                    const backNumber =
                        container.querySelector(
                            ".js-back-number"
                        );


                    if (frontNumber) {

                        frontNumber.textContent =
                            jersey.number || "00";

                    }

                    if (backName) {

                        backName.textContent =
                            jersey.playerName ||
                            "PLAYER";

                    }

                    if (backNumber) {

                        backNumber.textContent =
                            jersey.number || "00";

                    }

                }


                /* -------------------------------------------------
                   HELMET
                   ------------------------------------------------- */

                if (selectedItems.helmet) {

                    const part =
                        container.querySelector(
                            ".part--helmet"
                        );

                    if (part) {

                        part.style.display =
                            "block";

                        applyPartColor(
                            part,
                            selectedItems.helmet.color
                        );

                    }

                }


                /* -------------------------------------------------
                   CAP
                   ------------------------------------------------- */

                if (
                    selectedItems.cap &&
                    !selectedItems.helmet
                ) {

                    const part =
                        container.querySelector(
                            ".part--cap"
                        );

                    if (part) {

                        part.style.display =
                            "block";

                        applyPartColor(
                            part,
                            selectedItems.cap.color
                        );

                    }

                }


                /* -------------------------------------------------
                   GLOVES
                   ------------------------------------------------- */

                if (selectedItems.gloves) {

                    const part =
                        container.querySelector(
                            ".part--gloves"
                        );

                    if (part) {

                        part.style.display =
                            "block";

                        applyPartColor(
                            part,
                            selectedItems.gloves.color
                        );

                    }

                }


                /* -------------------------------------------------
                   SOCKS
                   ------------------------------------------------- */

                if (selectedItems.socks) {

                    const part =
                        container.querySelector(
                            ".part--socks"
                        );

                    if (part) {

                        part.style.display =
                            "block";

                        applyPartColor(
                            part,
                            selectedItems.socks.color
                        );

                    }

                }


                /* -------------------------------------------------
                   SHOES
                   ------------------------------------------------- */

                if (selectedItems.shoes) {

                    const part =
                        container.querySelector(
                            ".part--shoes"
                        );

                    if (part) {

                        part.style.display =
                            "block";

                        applyPartColor(
                            part,
                            selectedItems.shoes.color
                        );

                    }

                }


                /* -------------------------------------------------
                   KIT BAG
                   ------------------------------------------------- */

                if (selectedItems.kitbag) {

                    const part =
                        container.querySelector(
                            ".part--kitbag"
                        );

                    if (part) {

                        part.style.display =
                            "block";

                        applyPartColor(
                            part,
                            selectedItems.kitbag.color
                        );

                    }

                }


                /* -------------------------------------------------
                   ZOOM
                   ------------------------------------------------- */

                figure.style.transform =
                    `scale(${zoomLevel})`;

            });

    }


    /* =====================================================
       APPLY COLOR TO SVG PART
       ===================================================== */

    function applyPartColor(
        part,
        color
    ) {

        if (!part || !color) return;

        part
            .querySelectorAll(".part__fill")
            .forEach(element => {

                element.style.fill =
                    color;

            });


        part
            .querySelectorAll(".part__accent")
            .forEach(element => {

                element.style.fill =
                    adjustColor(
                        color,
                        -25
                    );

            });


        part
            .querySelectorAll(".part__shade")
            .forEach(element => {

                element.style.fill =
                    adjustColor(
                        color,
                        -35
                    );

            });


        part
            .querySelectorAll(".part__stroke")
            .forEach(element => {

                element.style.stroke =
                    adjustColor(
                        color,
                        -35
                    );

            });

    }


    /* =====================================================
       COLOR BRIGHTNESS
       ===================================================== */

    function adjustColor(
        hex,
        amount
    ) {

        if (!hex || hex[0] !== "#") {
            return hex;
        }

        let color =
            hex.substring(1);

        if (color.length === 3) {

            color =
                color
                    .split("")
                    .map(x => x + x)
                    .join("");

        }

        let num =
            parseInt(color, 16);

        let r =
            Math.max(
                0,
                Math.min(
                    255,
                    (num >> 16) + amount
                )
            );

        let g =
            Math.max(
                0,
                Math.min(
                    255,
                    ((num >> 8) & 0xff) + amount
                )
            );

        let b =
            Math.max(
                0,
                Math.min(
                    255,
                    (num & 0xff) + amount
                )
            );

        return (
            "#" +
            (
                (r << 16) |
                (g << 8) |
                b
            )
                .toString(16)
                .padStart(6, "0")
        );

    }


    /* =====================================================
       FRONT / BACK
       ===================================================== */

    function setView(view) {

        currentView =
            view === "back"
                ? "back"
                : "front";


        if (viewFrontBtn) {

            viewFrontBtn.classList.toggle(
                "is-active",
                currentView === "front"
            );

            viewFrontBtn.setAttribute(
                "aria-pressed",
                currentView === "front"
                    ? "true"
                    : "false"
            );

        }


        if (viewBackBtn) {

            viewBackBtn.classList.toggle(
                "is-active",
                currentView === "back"
            );

            viewBackBtn.setAttribute(
                "aria-pressed",
                currentView === "back"
                    ? "true"
                    : "false"
            );

        }


        updatePreview();

    }


    if (viewFrontBtn) {

        viewFrontBtn.addEventListener(
            "click",
            () => setView("front")
        );

    }


    if (viewBackBtn) {

        viewBackBtn.addEventListener(
            "click",
            () => setView("back")
        );

    }


    /* =====================================================
       ZOOM
       ===================================================== */

    if (zoomInBtn) {

        zoomInBtn.addEventListener(
            "click",
            () => {

                zoomLevel =
                    Math.min(
                        1.7,
                        zoomLevel + 0.1
                    );

                updatePreview();

            }
        );

    }


    if (zoomOutBtn) {

        zoomOutBtn.addEventListener(
            "click",
            () => {

                zoomLevel =
                    Math.max(
                        0.7,
                        zoomLevel - 0.1
                    );

                updatePreview();

            }
        );

    }


    if (resetPreviewBtn) {

        resetPreviewBtn.addEventListener(
            "click",
            () => {

                zoomLevel = 1;

                setView("front");

            }
        );

    }


    /* =====================================================
       CART
       ===================================================== */

    function getCart() {

        try {

            return JSON.parse(
                localStorage.getItem(
                    "khelzoneCart"
                )
            ) || [];

        } catch {

            return [];

        }

    }


    function saveCart(cart) {

        localStorage.setItem(
            "khelzoneCart",
            JSON.stringify(cart)
        );

    }


    function updateCartBadge() {

        const cart =
            getCart();

        const count =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(item.quantity || 1),
                0
            );

        if (cartBadge) {

            cartBadge.textContent =
                count;

            cartBadge.hidden =
                count === 0;

        }

    }


    /* =====================================================
       CREATE CUSTOM KIT CART ITEM
       ===================================================== */

    function createCartItem() {

        const items =
            Object.values(selectedItems);

        return {

            id:
                "custom-kit-" +
                Date.now(),

            type:
                "custom-kit",

            name:
                "Custom Sports Kit",

            price:
                calculateTotal(),

            quantity:
                1,

            customization:
                JSON.parse(
                    JSON.stringify(selectedItems)
                ),

            addedAt:
                new Date().toISOString()

        };

    }


    /* =====================================================
       ADD TO CART
       ===================================================== */

    function addCustomKitToCart() {

        const selected =
            Object.values(selectedItems);

        if (selected.length === 0) {

            showToast(
                "SELECT AT LEAST ONE ITEM"
            );

            return;

        }


        openSummaryModal();

    }


    if (addToCartBtn) {

        addToCartBtn.addEventListener(
            "click",
            addCustomKitToCart
        );

    }


    if (mobileStickyAddBtn) {

        mobileStickyAddBtn.addEventListener(
            "click",
            addCustomKitToCart
        );

    }


    /* =====================================================
       SUMMARY MODAL
       ===================================================== */

    const summaryModalOverlay =
        document.getElementById(
            "summaryModalOverlay"
        );

    const summaryModalBody =
        document.getElementById(
            "summaryModalBody"
        );

    const summaryModalTotal =
        document.getElementById(
            "summaryModalTotal"
        );

    const summaryModalClose =
        document.getElementById(
            "summaryModalClose"
        );

    const summaryCancelBtn =
        document.getElementById(
            "summaryCancelBtn"
        );

    const summaryConfirmBtn =
        document.getElementById(
            "summaryConfirmBtn"
        );


    function openSummaryModal() {

        if (!summaryModalOverlay) return;

        const items =
            Object.values(selectedItems);

        if (summaryModalBody) {

            summaryModalBody.innerHTML =
                items.map(item => `

                    <div class="summary-line">

                        <span>
                            ${item.name}
                            ${
                                item.size
                                    ? ` · ${item.size}`
                                    : ""
                            }
                        </span>

                        <strong>
                            ${formatPrice(item.price)}
                        </strong>

                    </div>

                `).join("");

        }


        if (summaryModalTotal) {

            summaryModalTotal.textContent =
                formatPrice(
                    calculateTotal()
                );

        }


        summaryModalOverlay.hidden =
            false;

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeSummaryModal() {

        if (!summaryModalOverlay) return;

        summaryModalOverlay.hidden =
            true;

        document.body.classList.remove(
            "modal-open"
        );

    }


    if (summaryModalClose) {

        summaryModalClose.addEventListener(
            "click",
            closeSummaryModal
        );

    }


    if (summaryCancelBtn) {

        summaryCancelBtn.addEventListener(
            "click",
            closeSummaryModal
        );

    }


    if (summaryModalOverlay) {

        summaryModalOverlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    summaryModalOverlay
                ) {

                    closeSummaryModal();

                }

            }
        );

    }


    /* =====================================================
       CONFIRM CART
       ===================================================== */

    if (summaryConfirmBtn) {

        summaryConfirmBtn.addEventListener(
            "click",
            () => {

                const cart =
                    getCart();

                const customKit =
                    createCartItem();

                cart.push(
                    customKit
                );

                saveCart(cart);

                updateCartBadge();

                closeSummaryModal();

                showToast(
                    "CUSTOM KIT ADDED TO CART"
                );

            }
        );

    }


    /* =====================================================
       RESET ALL
       ===================================================== */

    const resetModalOverlay =
        document.getElementById(
            "resetModalOverlay"
        );

    const resetCancelBtn =
        document.getElementById(
            "resetCancelBtn"
        );

    const resetConfirmBtn =
        document.getElementById(
            "resetConfirmBtn"
        );


    function openResetModal() {

        if (!resetModalOverlay) {

            performReset();

            return;

        }

        resetModalOverlay.hidden =
            false;

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeResetModal() {

        if (!resetModalOverlay) return;

        resetModalOverlay.hidden =
            true;

        document.body.classList.remove(
            "modal-open"
        );

    }


    function performReset() {

        selectedItems = {};

        activeItem = null;

        currentView = "front";

        zoomLevel = 1;

        localStorage.removeItem(
            "khelzoneCustomKit"
        );

        renderItemGrid();

        renderCustomPanel();

        renderYourKit();

        updateTotal();

        setView("front");

        closeResetModal();

    }


    if (resetAllBtn) {

        resetAllBtn.addEventListener(
            "click",
            openResetModal
        );

    }


    if (resetCancelBtn) {

        resetCancelBtn.addEventListener(
            "click",
            closeResetModal
        );

    }


    if (resetConfirmBtn) {

        resetConfirmBtn.addEventListener(
            "click",
            performReset
        );

    }


    /* =====================================================
       TOAST
       ===================================================== */

    const successToast =
        document.getElementById(
            "successToast"
        );


    function showToast(message) {

        if (!successToast) return;

        const span =
            successToast.querySelector(
                "span"
            );

        if (span) {
            span.textContent =
                message;
        }

        successToast.hidden =
            false;

        successToast.classList.add(
            "is-visible"
        );


        setTimeout(() => {

            successToast.classList.remove(
                "is-visible"
            );

            setTimeout(() => {

                successToast.hidden =
                    true;

            }, 300);

        }, 2500);

    }


    /* =====================================================
       MOBILE NAV
       ===================================================== */

    if (
        navToggle &&
        navMobile
    ) {

        navToggle.addEventListener(
            "click",
            () => {

                const opened =
                    navMobile.classList.toggle(
                        "is-open"
                    );

                navToggle.setAttribute(
                    "aria-expanded",
                    opened
                        ? "true"
                        : "false"
                );

            }
        );


        navMobile
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navMobile.classList.remove(
                            "is-open"
                        );

                        navToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            });

    }


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeSummaryModal();

                closeResetModal();

            }

        }
    );


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    loadState();

    renderItemGrid();

    renderCustomPanel();

    renderYourKit();

    updateTotal();

    updateCartBadge();

    setView("front");

});