/* ==========================================================================
   KHELZONE — Kit Customizer
   All data, state and rendering for customize-kit lives in this file.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------
     1. PRODUCT DEFINITIONS
     ------------------------------------------------------------------ */

  var COLOR_SETS = {
    jersey: [
      { name: "Black", hex: "#111111" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" },
      { name: "Green", hex: "#2FA84F" },
      { name: "Yellow", hex: "#FFD400" }
    ],
    shoes: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" }
    ],
    socks: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" },
      { name: "Green", hex: "#2FA84F" }
    ],
    kitbag: [
      { name: "Black", hex: "#111111" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" }
    ],
    helmet: [
      { name: "Black", hex: "#111111" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" }
    ],
    gloves: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" }
    ],
    cap: [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#FFFFFF" },
      { name: "Orange", hex: "#FF6A00" },
      { name: "Red", hex: "#E53A3A" },
      { name: "Blue", hex: "#2F6FED" }
    ]
  };

  var ITEMS = {
    jersey: {
      key: "jersey",
      label: "Jersey",
      price: 2500,
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      defaultSize: "M",
      hasNameNumber: true,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M8 4l4 3 4-3 3 4-2 2v9a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-9L5 8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    },
    shoes: {
      key: "shoes",
      label: "Shoes",
      price: 4500,
      sizes: ["6", "7", "8", "9", "10", "11", "12"],
      defaultSize: "9",
      hasNameNumber: false,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M3 17h15a3 3 0 0 0 3-3v-1l-6-1-3-4-4 1-2 2-3 1z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M3 17v2h18v-2" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    },
    socks: {
      key: "socks",
      label: "Socks",
      price: 800,
      sizes: ["S", "M", "L", "XL"],
      defaultSize: "M",
      hasNameNumber: false,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M9 3h6v9l4 6a2 2 0 0 1-2 3H9a2 2 0 0 1-2-2V3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    },
    kitbag: {
      key: "kitbag",
      label: "Kit Bag",
      price: 2000,
      sizes: ["Small", "Medium", "Large"],
      defaultSize: "Medium",
      hasNameNumber: false,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="9" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 9V7a4 4 0 0 1 8 0v2" stroke="currentColor" stroke-width="1.6"/></svg>'
    },
    helmet: {
      key: "helmet",
      label: "Helmet",
      price: 3500,
      sizes: ["Small", "Medium", "Large"],
      defaultSize: "Medium",
      hasNameNumber: false,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M4 15a8 8 0 0 1 16 0v2H4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 17h16" stroke="currentColor" stroke-width="1.6"/></svg>'
    },
    gloves: {
      key: "gloves",
      label: "Gloves",
      price: 2500,
      sizes: ["Small", "Medium", "Large", "XL"],
      defaultSize: "Medium",
      hasNameNumber: false,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M7 11V5a1.5 1.5 0 0 1 3 0v5M10 10V4a1.5 1.5 0 0 1 3 0v6M13 10V5a1.5 1.5 0 0 1 3 0v6M16 11V8a1.5 1.5 0 0 1 3 0v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2l2-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    },
    cap: {
      key: "cap",
      label: "Cap",
      price: 900,
      sizes: ["Adjustable", "Small", "Medium", "Large"],
      defaultSize: "Adjustable",
      hasNameNumber: false,
      icon:
        '<svg viewBox="0 0 24 24" fill="none"><path d="M4 14a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 14h20" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 6v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
    }
  };

  var ITEM_ORDER = ["jersey", "shoes", "socks", "kitbag", "helmet", "gloves", "cap"];

  var CURRENCY_PREFIX = "Rs. ";

  /* ------------------------------------------------------------------
     2. STATE
     ------------------------------------------------------------------ */

  function makeDefaultState() {
    var state = {};
    ITEM_ORDER.forEach(function (key) {
      var def = ITEMS[key];
      state[key] = {
        selected: false,
        color: COLOR_SETS[key][0].hex,
        colorName: COLOR_SETS[key][0].name,
        size: def.defaultSize
      };
      if (def.hasNameNumber) {
        state[key].name = "";
        state[key].number = "";
      }
    });
    return state;
  }

  var kit = makeDefaultState();
  var activeItem = null;
  var previewView = "front"; // 'front' | 'back'
  var zoomLevel = 1;
  var ZOOM_MIN = 0.7;
  var ZOOM_MAX = 1.5;
  var ZOOM_STEP = 0.1;

  /* ------------------------------------------------------------------
     3. DOM REFS
     ------------------------------------------------------------------ */

  var itemGridEl = document.getElementById("itemGrid");
  var customPanelEl = document.getElementById("customPanel");
  var yourKitGridEl = document.getElementById("yourKitGrid");
  var yourKitCountEl = document.getElementById("yourKitCount");
  var kitTotalPriceEl = document.getElementById("kitTotalPrice");
  var mobileStickyTotalEl = document.getElementById("mobileStickyTotal");
  var addToCartBtn = document.getElementById("addToCartBtn");
  var mobileStickyAddBtn = document.getElementById("mobileStickyAddBtn");
  var resetAllBtn = document.getElementById("resetAllBtn");

  var desktopPreviewWrap = document.getElementById("desktopPreviewStageWrap");
  var mobilePreviewWrap = document.getElementById("mobilePreviewStageWrap");
  var previewTemplate = document.getElementById("previewStageTemplate");

  var viewFrontBtn = document.getElementById("viewFrontBtn");
  var viewBackBtn = document.getElementById("viewBackBtn");
  var zoomInBtn = document.getElementById("zoomInBtn");
  var zoomOutBtn = document.getElementById("zoomOutBtn");
  var resetPreviewBtn = document.getElementById("resetPreviewBtn");

  var summaryModalOverlay = document.getElementById("summaryModalOverlay");
  var summaryModalBody = document.getElementById("summaryModalBody");
  var summaryModalTotal = document.getElementById("summaryModalTotal");
  var summaryModalClose = document.getElementById("summaryModalClose");
  var summaryCancelBtn = document.getElementById("summaryCancelBtn");
  var summaryConfirmBtn = document.getElementById("summaryConfirmBtn");

  var resetModalOverlay = document.getElementById("resetModalOverlay");
  var resetCancelBtn = document.getElementById("resetCancelBtn");
  var resetConfirmBtn = document.getElementById("resetConfirmBtn");

  var successToast = document.getElementById("successToast");
  var cartBadge = document.getElementById("cartBadge");

  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");

  var previewStages = []; // { root, zoomLayer } for desktop + mobile

  /* ------------------------------------------------------------------
     4. HELPERS
     ------------------------------------------------------------------ */

  function formatPrice(n) {
    var s = String(Math.round(n));
    // 3-digit grouping, e.g. 2500 -> "2,500", 12500 -> "12,500"
    var grouped = s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return CURRENCY_PREFIX + grouped;
  }

  function computeTotal() {
    var total = 0;
    ITEM_ORDER.forEach(function (key) {
      if (kit[key].selected) total += ITEMS[key].price;
    });
    return total;
  }

  function selectedCount() {
    var n = 0;
    ITEM_ORDER.forEach(function (key) { if (kit[key].selected) n++; });
    return n;
  }

  function isWhiteLike(hex) {
    return hex.toUpperCase() === "#FFFFFF" || hex.toUpperCase() === "#FFD400";
  }

  /* ------------------------------------------------------------------
     5. RENDER: ITEM GRID
     ------------------------------------------------------------------ */

  function renderItemGrid() {
    itemGridEl.innerHTML = "";
    ITEM_ORDER.forEach(function (key) {
      var def = ITEMS[key];
      var s = kit[key];

      var card = document.createElement("button");
      card.type = "button";
      card.className = "item-card kz-reveal is-visible";
      if (key === activeItem) card.classList.add("is-active");
      if (s.selected) card.classList.add("is-selected");
      card.setAttribute("data-item", key);
      card.setAttribute("aria-pressed", s.selected ? "true" : "false");

      card.innerHTML =
        '<div class="item-card__top">' +
          '<div class="item-card__icon">' + def.icon + "</div>" +
          '<span class="item-card__check">' +
            (s.selected
              ? '<svg viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              : "") +
          "</span>" +
        "</div>" +
        '<p class="item-card__name">' + def.label + "</p>" +
        '<div class="item-card__meta">' +
          '<span class="item-card__swatch" style="background:' + s.color + '"></span>' +
          "<span>" + s.colorName + " &middot; " + s.size + "</span>" +
        "</div>" +
        '<div class="item-card__price">' + formatPrice(def.price) + "</div>";

      card.addEventListener("click", function () {
        kit[key].selected = true;
        activeItem = key;
        renderAll();
        // Scroll the panel into view on smaller screens
        if (window.innerWidth < 960) {
          requestAnimationFrame(function () {
            customPanelEl.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      });

      itemGridEl.appendChild(card);
    });
  }

  /* ------------------------------------------------------------------
     6. RENDER: CUSTOM PANEL (active item controls)
     ------------------------------------------------------------------ */

  function renderCustomPanel() {
    if (!activeItem) {
      customPanelEl.innerHTML =
        '<div class="custom-panel__empty" id="customPanelEmpty">' +
          '<svg viewBox="0 0 24 24" fill="none" class="custom-panel__empty-icon"><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.4"/></svg>' +
          "<p>Select an item above to start customizing it.</p>" +
        "</div>";
      return;
    }

    var key = activeItem;
    var def = ITEMS[key];
    var s = kit[key];
    var colors = COLOR_SETS[key];

    var html = "";
    html += '<div class="custom-panel__head">';
    html += '<h3 class="custom-panel__title">' + def.label + "</h3>";
    html += '<button type="button" class="custom-panel__remove" id="removeItemBtn">REMOVE</button>';
    html += "</div>";

    // Color
    html += '<div class="control-group">';
    html += '<span class="control-label">' + def.label + " Color</span>";
    html += '<div class="swatch-row" id="colorSwatchRow">';
    colors.forEach(function (c) {
      var selected = s.color.toUpperCase() === c.hex.toUpperCase();
      html +=
        '<button type="button" class="swatch' + (isWhiteLike(c.hex) ? " swatch--white" : "") +
        (selected ? " is-selected" : "") + '" style="background:' + c.hex +
        '" data-color="' + c.hex + '" data-color-name="' + c.name + '" aria-label="' + c.name + '" title="' + c.name + '">' +
        (selected
          ? '<svg viewBox="0 0 24 24" fill="none" class="swatch__check"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          : "") +
        "</button>";
    });
    html +=
      '<label class="swatch--custom">' +
        '<input type="color" class="swatch--custom-input" id="customColorInput" value="' + s.color + '" aria-label="Custom color" />' +
        '<span class="swatch--custom-label">Custom</span>' +
      "</label>";
    html += "</div></div>";

    // Size
    html += '<div class="control-group">';
    html += '<span class="control-label">' + def.label + " Size</span>";
    html += '<div class="size-row" id="sizeRow">';
    def.sizes.forEach(function (sz) {
      var selected = s.size === sz;
      html +=
        '<button type="button" class="size-btn' + (selected ? " is-selected" : "") +
        '" data-size="' + sz + '">' + sz + "</button>";
    });
    html += "</div></div>";

    // Jersey-only: name + number
    if (def.hasNameNumber) {
      html += '<div class="control-group">';
      html += '<div class="control-row">';
      html +=
        '<div>' +
          '<label class="control-label" for="jerseyNameInput">Player Name</label>' +
          '<input type="text" id="jerseyNameInput" class="text-field" maxlength="15" placeholder="e.g. ABDULLAH" value="' + (s.name || "") + '" />' +
          '<p class="field-hint">Max 15 characters &middot; shown on the back</p>' +
        "</div>";
      html +=
        '<div>' +
          '<label class="control-label" for="jerseyNumberInput">Jersey Number</label>' +
          '<input type="text" inputmode="numeric" id="jerseyNumberInput" class="text-field" maxlength="2" placeholder="e.g. 10" value="' + (s.number || "") + '" />' +
          '<p class="field-hint">Max 2 digits</p>' +
        "</div>";
      html += "</div></div>";
    }

    customPanelEl.innerHTML = html;

    // ---- wire up events ----
    document.getElementById("removeItemBtn").addEventListener("click", function () {
      kit[key].selected = false;
      if (activeItem === key) activeItem = null;
      renderAll();
    });

    customPanelEl.querySelectorAll("#colorSwatchRow .swatch").forEach(function (btn) {
      btn.addEventListener("click", function () {
        kit[key].color = btn.getAttribute("data-color");
        kit[key].colorName = btn.getAttribute("data-color-name");
        renderAll();
      });
    });

    var customColorInput = document.getElementById("customColorInput");
    customColorInput.addEventListener("input", function () {
      kit[key].color = customColorInput.value;
      kit[key].colorName = "Custom";
      renderAll();
    });

    customPanelEl.querySelectorAll("#sizeRow .size-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        kit[key].size = btn.getAttribute("data-size");
        renderAll();
      });
    });

    if (def.hasNameNumber) {
      var nameInput = document.getElementById("jerseyNameInput");
      var numberInput = document.getElementById("jerseyNumberInput");

      nameInput.addEventListener("input", function () {
        var v = nameInput.value.toUpperCase().slice(0, 15);
        nameInput.value = v;
        kit[key].name = v;
        updatePreview();
        renderYourKit();
      });

      numberInput.addEventListener("input", function () {
        var v = numberInput.value.replace(/[^0-9]/g, "").slice(0, 2);
        numberInput.value = v;
        kit[key].number = v;
        updatePreview();
        renderYourKit();
      });
    }
  }

  /* ------------------------------------------------------------------
     7. RENDER: YOUR KIT (mini summary cards)
     ------------------------------------------------------------------ */

  function renderYourKit() {
    yourKitGridEl.innerHTML = "";
    ITEM_ORDER.forEach(function (key) {
      var def = ITEMS[key];
      var s = kit[key];

      var card = document.createElement("div");
      card.className = "kit-mini" + (s.selected ? " is-filled" : "");

      if (s.selected) {
        var detail = s.colorName + " &middot; " + s.size;
        if (def.hasNameNumber && (s.name || s.number)) {
          detail += " &middot; " + (s.name || "—") + (s.number ? " #" + s.number : "");
        }
        card.innerHTML =
          '<div class="kit-mini__info">' +
            '<p class="kit-mini__name">' +
              '<svg viewBox="0 0 24 24" fill="none" class="kit-mini__check"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
              def.label +
            "</p>" +
            '<p class="kit-mini__detail">' + detail + "</p>" +
          "</div>" +
          '<span class="item-card__swatch" style="background:' + s.color + '"></span>';
      } else {
        card.innerHTML =
          '<div class="kit-mini__info">' +
            '<p class="kit-mini__name" style="color:var(--text-muted)">' + def.label + "</p>" +
            '<p class="kit-mini__detail">Not added yet</p>' +
          "</div>" +
          '<button type="button" class="kit-mini__add" data-add="' + key + '">+ Add</button>';
      }

      yourKitGridEl.appendChild(card);
    });

    yourKitGridEl.querySelectorAll("[data-add]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-add");
        kit[key].selected = true;
        activeItem = key;
        renderAll();
        requestAnimationFrame(function () {
          customPanelEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    });

    yourKitCountEl.textContent = selectedCount() + " / 7 selected";
  }

  /* ------------------------------------------------------------------
     8. RENDER: TOTAL
     ------------------------------------------------------------------ */

  function renderTotal() {
    var total = computeTotal();
    var formatted = formatPrice(total);
    kitTotalPriceEl.textContent = formatted;
    mobileStickyTotalEl.textContent = formatted;
    var hasAny = selectedCount() > 0;
    addToCartBtn.disabled = !hasAny;
    mobileStickyAddBtn.disabled = !hasAny;
  }

  /* ------------------------------------------------------------------
     9. LIVE PREVIEW
     ------------------------------------------------------------------ */

  function buildPreviewStage(container) {
    container.innerHTML = "";
    var node = previewTemplate.content.cloneNode(true);
    container.appendChild(node);
    var root = container.querySelector(".preview-stage");
    var zoomLayer = container.querySelector(".preview-stage__zoom");
    return { root: root, zoomLayer: zoomLayer };
  }

  function initPreviewStages() {
    previewStages = [
      buildPreviewStage(desktopPreviewWrap),
      buildPreviewStage(mobilePreviewWrap)
    ];
  }

  function updatePreview() {
    previewStages.forEach(function (stage) {
      var root = stage.root;
      if (!root) return;

      root.classList.toggle("is-back", previewView === "back");
      stage.zoomLayer.style.transform = "scale(" + zoomLevel + ")";

      // headgear priority: helmet over cap when both are selected
      if (kit.helmet.selected) {
        root.setAttribute("data-headgear", "helmet");
      } else if (kit.cap.selected) {
        root.setAttribute("data-headgear", "cap");
      } else {
        root.removeAttribute("data-headgear");
      }

      ITEM_ORDER.forEach(function (key) {
        var s = kit[key];
        var parts = root.querySelectorAll('.part[data-part="' + key + '"]');
        parts.forEach(function (part) {
          part.classList.toggle("is-selected", s.selected);
          var fill = part.querySelectorAll(".part__fill");
          fill.forEach(function (f) { f.style.fill = s.color; });
        });
      });

      // Jersey text
      var frontNumber = root.querySelector(".js-front-number");
      var backName = root.querySelector(".js-back-name");
      var backNumber = root.querySelector(".js-back-number");
      var jerseyState = kit.jersey;

      if (frontNumber) frontNumber.textContent = jerseyState.number || "";
      if (backName) backName.textContent = jerseyState.name || "PLAYER";
      if (backNumber) backNumber.textContent = jerseyState.number || "00";
    });
  }

  function setPreviewView(view) {
    previewView = view;
    viewFrontBtn.setAttribute("aria-pressed", view === "front" ? "true" : "false");
    viewBackBtn.setAttribute("aria-pressed", view === "back" ? "true" : "false");
    updatePreview();
  }

  function setZoom(next) {
    zoomLevel = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    updatePreview();
  }

  /* ------------------------------------------------------------------
     10. MASTER RENDER
     ------------------------------------------------------------------ */

  function renderAll() {
    renderItemGrid();
    renderCustomPanel();
    renderYourKit();
    renderTotal();
    updatePreview();
  }

  /* ------------------------------------------------------------------
     11. SUMMARY MODAL
     ------------------------------------------------------------------ */

  function buildSummaryHtml() {
    var html = "";
    ITEM_ORDER.forEach(function (key) {
      var def = ITEMS[key];
      var s = kit[key];
      if (!s.selected) return;

      html += '<div class="summary-block">';
      html += '<p class="summary-block__title">' + def.label + "</p>";
      html += '<div class="summary-block__line"><span>Color</span><span>' + s.colorName + "</span></div>";
      html += '<div class="summary-block__line"><span>Size</span><span>' + s.size + "</span></div>";
      if (def.hasNameNumber) {
        html += '<div class="summary-block__line"><span>Name</span><span>' + (s.name || "—") + "</span></div>";
        html += '<div class="summary-block__line"><span>Number</span><span>' + (s.number || "—") + "</span></div>";
      }
      html += '<div class="summary-block__line"><span>Price</span><span>' + formatPrice(def.price) + "</span></div>";
      html += "</div>";
    });
    return html;
  }

  function openSummaryModal() {
    summaryModalBody.innerHTML = buildSummaryHtml();
    summaryModalTotal.textContent = formatPrice(computeTotal());
    summaryModalOverlay.hidden = false;
  }

  function closeSummaryModal() {
    summaryModalOverlay.hidden = true;
  }

  /* ------------------------------------------------------------------
     12. CART INTEGRATION (localStorage)
     ------------------------------------------------------------------ */

  // NOTE: KHELZONE's existing shop pages are expected to read/write a cart
  // array under this localStorage key. If your existing cart implementation
  // uses a different key or item shape, update CART_STORAGE_KEY and the
  // fields below so this stays compatible with it.
  var CART_STORAGE_KEY = "khelzone_cart";

  function readCart() {
    try {
      var raw = localStorage.getItem(CART_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(cartArr) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartArr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function buildCustomKitEntry() {
    var items = {};
    ITEM_ORDER.forEach(function (key) {
      var s = kit[key];
      if (!s.selected) return;
      items[key] = {
        label: ITEMS[key].label,
        color: s.color,
        colorName: s.colorName,
        size: s.size,
        price: ITEMS[key].price
      };
      if (ITEMS[key].hasNameNumber) {
        items[key].name = s.name || "";
        items[key].number = s.number || "";
      }
    });

    return {
      id: "custom-kit-" + Date.now(),
      type: "custom-kit",
      title: "Custom Sports Kit",
      items: items,
      itemCount: selectedCount(),
      total: computeTotal(),
      quantity: 1,
      createdAt: new Date().toISOString()
    };
  }

  function updateCartBadge() {
    var cartArr = readCart();
    if (cartArr.length > 0) {
      cartBadge.hidden = false;
      cartBadge.textContent = cartArr.length > 99 ? "99+" : String(cartArr.length);
    } else {
      cartBadge.hidden = true;
    }
  }

  function addCustomKitToCart() {
    var entry = buildCustomKitEntry();
    var cartArr = readCart();
    cartArr.push(entry);
    writeCart(cartArr);
    updateCartBadge();
    showToast();
  }

  function showToast() {
    successToast.hidden = false;
    successToast.style.animation = "none";
    // force reflow so the animation restarts on repeated adds
    void successToast.offsetWidth;
    successToast.style.animation = "";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      successToast.hidden = true;
    }, 2600);
  }

  /* ------------------------------------------------------------------
     13. RESET
     ------------------------------------------------------------------ */

  function resetKit() {
    kit = makeDefaultState();
    activeItem = null;
    previewView = "front";
    zoomLevel = 1;
    setPreviewView("front");
    renderAll();
  }

  /* ------------------------------------------------------------------
     14. EVENT WIRING
     ------------------------------------------------------------------ */

  function initNav() {
    if (!navToggle || !navMobile) return;
    navToggle.addEventListener("click", function () {
      var isOpen = navMobile.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    navMobile.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initPreviewControls() {
    viewFrontBtn.addEventListener("click", function () { setPreviewView("front"); });
    viewBackBtn.addEventListener("click", function () { setPreviewView("back"); });
    zoomInBtn.addEventListener("click", function () { setZoom(zoomLevel + ZOOM_STEP); });
    zoomOutBtn.addEventListener("click", function () { setZoom(zoomLevel - ZOOM_STEP); });
    resetPreviewBtn.addEventListener("click", function () {
      zoomLevel = 1;
      setPreviewView("front");
    });
  }

  function initAddToCartFlow() {
    function tryOpen() {
      if (selectedCount() === 0) return;
      openSummaryModal();
    }
    addToCartBtn.addEventListener("click", tryOpen);
    mobileStickyAddBtn.addEventListener("click", tryOpen);

    summaryModalClose.addEventListener("click", closeSummaryModal);
    summaryCancelBtn.addEventListener("click", closeSummaryModal);
    summaryModalOverlay.addEventListener("click", function (e) {
      if (e.target === summaryModalOverlay) closeSummaryModal();
    });

    summaryConfirmBtn.addEventListener("click", function () {
      addCustomKitToCart();
      closeSummaryModal();
      addToCartBtn.classList.add("kz-added");
      setTimeout(function () { addToCartBtn.classList.remove("kz-added"); }, 400);
    });
  }

  function initResetFlow() {
    resetAllBtn.addEventListener("click", function () {
      resetModalOverlay.hidden = false;
    });
    resetCancelBtn.addEventListener("click", function () {
      resetModalOverlay.hidden = true;
    });
    resetModalOverlay.addEventListener("click", function (e) {
      if (e.target === resetModalOverlay) resetModalOverlay.hidden = true;
    });
    resetConfirmBtn.addEventListener("click", function () {
      resetModalOverlay.hidden = true;
      resetKit();
    });
  }

  function initScrollReveal() {
    var els = document.querySelectorAll(".kz-reveal");
    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );
      els.forEach(function (el) { observer.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("is-visible"); });
    }
  }

  function initKeyboardEscape() {
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (!summaryModalOverlay.hidden) closeSummaryModal();
      if (!resetModalOverlay.hidden) resetModalOverlay.hidden = true;
    });
  }

  /* ------------------------------------------------------------------
     15. INIT
     ------------------------------------------------------------------ */

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initPreviewStages();
    initPreviewControls();
    initAddToCartFlow();
    initResetFlow();
    initKeyboardEscape();

    renderAll();
    setPreviewView("front");
    updateCartBadge();

    initScrollReveal();
  });
})();