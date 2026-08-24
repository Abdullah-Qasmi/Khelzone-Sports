/* =========================================================
   KHELZONE CART — Vanilla JS
   Handles: cart CRUD, quantity, wishlist, save-for-later,
   coupons, shipping, free-shipping progress, checkout modal,
   order placement, toasts, select-all/clear cart, recommendations.
   All state persisted in localStorage.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------- Storage keys ---------------- */
  const CART_KEY = "khelzone_cart_v1";
  const WISHLIST_KEY = "khelzone_wishlist_v1";
  const SAVED_KEY = "khelzone_saved_for_later_v1";
  const COUPON_KEY = "khelzone_coupon_v1";
  const SEEDED_KEY = "khelzone_cart_seeded_v1";

  /* ---------------- Config ---------------- */
  const FREE_SHIPPING_THRESHOLD = 5000;
  const STANDARD_SHIPPING = 250;
  const EXPRESS_SHIPPING = 500;
  const COUPONS = {
    KHEL10: 0.10,
    SPORTS15: 0.15,
    AYANAB: 0.20,
    ABDULLAH20: 0.20
  };

  /* ---------------- Default seed (matches original static markup) ---------------- */
  const DEFAULT_CART = [
    { id: "bat-1", name: "Predator X1 Pro English Willow", category: "Cricket", seller: "SIALKOT SPORTS HUB", price: 45000, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCF_p2VV9Q0Z2oZt4VqbndUa1VG3fyBBYWP3cVNz3u6gRy9nFeuXGreZGB-pXbtxiTC-bI0elFx1dAaYnkR436X588EJW0slueMw-Wj6vwIwO0xzqe8DdhF_JfRFq_pPwFGXJllyBbA5jXegKtvn2hf6LT0-Zboae6haiu9iBwH5moG8ksF5flXCfEJdcUyQS2PpvVyDPXaaqxDv61NTPXWmJ-5awl1KmDpPAn8fk4TevBapbSOXnlM1A", quantity: 1, size: null, color: null, customization: null },
    { id: "bat-2", name: "Thunderbolt T20 Edition", category: "Cricket", seller: "ELITE GEAR SIALKOT", price: 38500, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_wwZEy4ePFBWemT3A1dBPVEE-jXj-0p9847ApjbNEx2ZDZnnihlpIiQPn6lWXbCw1p-_xDl4-PJssk2o4WVN48IzwlOcDDR08nefmrY9eyStkhrBnwL0i2MHkNtj0Xwl09Zo81ir7tZaZ3fG1-ZwTkg72XfSlrUhBy44Y5y3L8UaNZRPwVsz-c4TKY4pYr1qxuP5Ny1eg6VvpNkuRsyeuMziOlW7gI7_TJxqA_CQuOrc0LpmsfUfyyA", quantity: 1, size: null, color: null, customization: null },
    { id: "bat-3", name: "Classic Kashmir Strike", category: "Cricket", seller: "HERITAGE SPORTS", price: 12000, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1cfg4JyqB1CjFNYsibtY4l1TD6tEU0bd27Fr1RNDeS9IFXyeZQKmhfA7QuLVYq9JJ5wGSXcUrjiSubanaxuyRUs-WxLSF4NOtg5gK3-SRXIlrUM0IXBETLFsYaDQMMqykoLfoG-hE8vjCbPgRxHEg_TaSSvCBDhHdiXZV0Thcjyo7hqrX3mvcGqN-hC91JfKKTYDDixPiZ4NM6wCNRmEW-wdGWbV7S9xYCvWcthrudOGKTECSxH4Pmw", quantity: 1, size: null, color: null, customization: null },
    { id: "glove-1", name: "AeroGrip Pro Gloves", category: "Cricket", seller: "SIALKOT SPORTS HUB", price: 8500, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6_OY4Ubi0TveVJvc2cZNPqzm3w8bx0SgUOSUhLnTrHedQPnlVk9pO4EKEmTBD3pVOmzb8iN2y_himasfcr3ShIP-CjernJaC4dpmzK60jpvgBAUqF0kMgDBi5rtoeAWSJCWYPE2M-MiTn6rtUpIGfS6VoeOr_HCGb8TFop82WPfscEYF27yCzgU0HRojwUoWuglw3bBlic8ofdJAXeF_h304uvrQsluGkBqsFx4GFF8muyQ9cQJoqew", quantity: 1, size: "M", color: null, customization: null },
    { id: "glove-2", name: "Impact Shield Gloves", category: "Cricket", seller: "ELITE GEAR SIALKOT", price: 9200, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Dg8T2Eoa7HwiDQyjaZ1UrFlc5jgktOG0f4gbIPh4LzjuCl8a3Wjfn6prtPAHIJmRqY8MhNWvzgRh4YUulDBQh2XASIomzKoOz38Ck4rZEWBdZIiYjH85axRoW89OEfqvOWtojuTlRy6wiWp0MUYMC7TqXHtKJwwEUQctsVqzCROyKiat4gDNErzR7DrglwSa82icujFi-SEBpMzmfoIzP7xEnQ19V_bbstW0QOlYWN1GufEbPZl1aQ", quantity: 1, size: "L", color: null, customization: null },
    { id: "ball-1", name: "Test Match Red Leather Ball", category: "Cricket", seller: "HERITAGE SPORTS", price: 3500, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAalun1J5LBOt6pW1mnmus-998E_GTJTn0vWwH_2piazDPRhFoOZDi8_trGeaW3L_X8fcXgy1do7ZtTgT0KJrOtl5uuTl9jqVVTUd2jV9c7v3VfnV3OsNMzCAjSFyEhOSAvEq4PrHNwtIcKjPkSbiE7NBhW8prKk2gVAawR7iQUHSgVeI9lRGBqut1cES6Un8-aSDdRtgC5_6jNFt-v6hLvEeMVqC8rn7k_l05j7KXSe4FCMvQPy8mH0g", quantity: 1, size: null, color: null, customization: null },
    { id: "ball-2", name: "ODI White Leather Ball", category: "Cricket", seller: "SIALKOT SPORTS HUB", price: 3800, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDZ4WWo0ckjddhQBAlR51dDvoAuaIwzJwy0Vz2SO37C7h-TOp30RE81cQon6j3PO1dCJlU09yIT-waN2a2Dpp5dX1QyxAowQPy9C-UZWZMUYuyAVr3HOID6dIPxJJhmFaFGVGFmAz5bWKbQNWYA07cgttFrb07Go9MWwILsL2C7oIGxb3q-gR_ATQmjOE5OHos6Jo7F6faVlaVNQfJMY-Kw5X1w4Y7r9xDubLQUTiiqfXj1MPCLUX9X0Q", quantity: 1, size: null, color: null, customization: null }
  ];

  const RECOMMENDATIONS = [
    { id: "rec-football-1", name: "Champion Match Football", category: "Football", price: 3200, image: "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&q=80" },
    { id: "rec-bat-1", name: "Falcon Edge Cricket Bat", category: "Cricket", price: 15500, image: "https://images.unsplash.com/photo-1607734834519-d8576ae60ea6?w=400&q=80" },
    { id: "rec-shoes-1", name: "Velocity Running Shoes", category: "Running", price: 6800, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80" },
    { id: "rec-gloves-1", name: "GripMax Wicket Gloves", category: "Cricket", price: 7200, image: "https://images.unsplash.com/photo-1595435742656-5272d0b3fa82?w=400&q=80" },
    { id: "rec-basketball-1", name: "StreetPro Basketball", category: "Basketball", price: 4100, image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&q=80" },
    { id: "rec-racket-1", name: "AeroSpin Tennis Racket", category: "Tennis", price: 9800, image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&q=80" },
    { id: "rec-bag-1", name: "Trailblazer Sports Bag", category: "Accessories", price: 3600, image: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=400&q=80" }
  ];

  /* ---------------- State ---------------- */
  let cart = [];
  let wishlist = [];
  let saved = [];
  let appliedCoupon = null; // { code, rate }
  let selectedDelivery = "standard";
  let selectedPayment = "cod";

  /* ---------------- Storage helpers ---------------- */
  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn("Storage read failed for", key, e);
      return fallback;
    }
  }
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn("Storage write failed for", key, e);
    }
  }

  function loadState() {
    const seeded = localStorage.getItem(SEEDED_KEY);
    if (!seeded) {
      cart = DEFAULT_CART.map((i) => ({ ...i }));
      safeSet(CART_KEY, cart);
      localStorage.setItem(SEEDED_KEY, "1");
    } else {
      cart = safeGet(CART_KEY, []);
    }
    wishlist = safeGet(WISHLIST_KEY, []);
    saved = safeGet(SAVED_KEY, []);
    appliedCoupon = safeGet(COUPON_KEY, null);
  }
  function persistCart() { safeSet(CART_KEY, cart); }
  function persistWishlist() { safeSet(WISHLIST_KEY, wishlist); }
  function persistSaved() { safeSet(SAVED_KEY, saved); }
  function persistCoupon() { safeSet(COUPON_KEY, appliedCoupon); }

  /* ---------------- Formatting ---------------- */
  function formatPKR(amount) {
    const n = Math.round(amount);
    return "PKR " + n.toLocaleString("en-PK");
  }

  /* ---------------- DOM refs ---------------- */
  const el = {
    itemsContainer: document.getElementById("cart-items-container"),
    itemCountLabel: document.getElementById("item-count-label"),
    cartHeaderCount: document.getElementById("cart-header-count"),
    emptyState: document.getElementById("empty-cart-state"),
    cartContentWrap: document.getElementById("cart-content-wrap"),
    subtotalValue: document.getElementById("subtotal-value"),
    discountRow: document.getElementById("discount-row"),
    discountValue: document.getElementById("discount-value"),
    shippingValue: document.getElementById("shipping-value"),
    totalValue: document.getElementById("total-value"),
    couponInput: document.getElementById("coupon-input"),
    couponApplyBtn: document.getElementById("coupon-apply-btn"),
    couponAppliedNote: document.getElementById("coupon-applied-note"),
    freeShipBarFill: document.getElementById("free-ship-bar-fill"),
    freeShipMsg: document.getElementById("free-ship-msg"),
    freeShipWrap: document.getElementById("free-ship-wrap"),
    checkoutBtn: document.getElementById("checkout-btn"),
    selectAllCheckbox: document.getElementById("select-all-checkbox"),
    clearCartBtn: document.getElementById("clear-cart-btn"),
    savedSection: document.getElementById("saved-for-later-section"),
    savedContainer: document.getElementById("saved-items-container"),
    recommendationsContainer: document.getElementById("recommendations-container"),
    toastContainer: document.getElementById("toast-container"),
    modalRoot: document.getElementById("modal-root"),
    bulkTracker: document.getElementById("bulk-tracker")
  };

  /* ---------------- Toasts ---------------- */
  function showToast(message, opts) {
    opts = opts || {};
    const toast = document.createElement("div");
    toast.className = "toast" + (opts.error ? " toast-error" : "");
    const msg = document.createElement("span");
    msg.textContent = message;
    toast.appendChild(msg);

    const rightWrap = document.createElement("div");
    rightWrap.style.display = "flex";
    rightWrap.style.alignItems = "center";
    rightWrap.style.gap = "10px";

    if (opts.actionLabel && typeof opts.onAction === "function") {
      const actionBtn = document.createElement("button");
      actionBtn.className = "toast-action";
      actionBtn.textContent = opts.actionLabel;
      actionBtn.addEventListener("click", () => {
        opts.onAction();
        dismiss();
      });
      rightWrap.appendChild(actionBtn);
    }
    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;">close</span>';
    closeBtn.addEventListener("click", () => dismiss());
    rightWrap.appendChild(closeBtn);
    toast.appendChild(rightWrap);

    el.toastContainer.appendChild(toast);

    let dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      toast.classList.add("toast-out");
      setTimeout(() => toast.remove(), 200);
    }
    setTimeout(dismiss, opts.duration || 4200);
  }

  /* ---------------- Derived calculations ---------------- */
  function getSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  function getDiscount(subtotal) {
    if (!appliedCoupon) return 0;
    return subtotal * appliedCoupon.rate;
  }
  function getShippingCost(subtotal) {
    if (cart.length === 0) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      return selectedDelivery === "express" ? EXPRESS_SHIPPING : 0;
    }
    return selectedDelivery === "express" ? EXPRESS_SHIPPING : STANDARD_SHIPPING;
  }
  function getTotalQuantity() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  /* ---------------- Rendering ---------------- */
  function render() {
    renderCartItems();
    renderSummary();
    renderFreeShippingProgress();
    renderSaved();
    renderCartCount();
    renderBulkTracker();
    persistCart();
  }

  function renderCartCount() {
    const qty = getTotalQuantity();
    if (el.cartHeaderCount) el.cartHeaderCount.textContent = qty;
    if (el.itemCountLabel) el.itemCountLabel.textContent = cart.length + (cart.length === 1 ? " ITEM" : " ITEMS");
  }

  function renderBulkTracker() {
    if (!el.bulkTracker) return;
    const totalQty = getTotalQuantity();
    const target = 10;
    if (cart.length === 0) {
      el.bulkTracker.style.display = "none";
      return;
    }
    el.bulkTracker.style.display = "flex";
    const pct = Math.min(100, Math.round((totalQty / target) * 100));
    const bar = el.bulkTracker.querySelector(".progress-glow");
    const badge = el.bulkTracker.querySelector("[data-bulk-badge]");
    const msg = el.bulkTracker.querySelector("[data-bulk-msg]");
    if (bar) bar.style.width = pct + "%";
    if (badge) badge.textContent = Math.min(totalQty, target) + " / " + target + " ITEMS";
    if (msg) {
      const remaining = target - totalQty;
      msg.textContent = remaining > 0 ? `Add ${remaining} more for 20% OFF!` : "🎉 You unlocked 20% OFF!";
    }
  }

  function renderCartItems() {
    el.itemsContainer.innerHTML = "";

    if (cart.length === 0) {
      el.emptyState.classList.add("active");
      el.cartContentWrap.style.display = "none";
      return;
    }
    el.emptyState.classList.remove("active");
    el.cartContentWrap.style.display = "";

    cart.forEach((item) => {
      el.itemsContainer.appendChild(buildCartItemCard(item));
    });

    updateSelectAllState();
  }

  function buildCartItemCard(item) {
    const card = document.createElement("div");
    card.className = "bg-surface-container-low border border-surface-container-highest rounded-xl p-sm flex flex-col gap-sm hover:bg-surface-container-high transition-colors group item-enter";
    card.dataset.id = item.id;

    const isWished = wishlist.includes(item.id);
    const subtotal = item.price * item.quantity;

    let customizationHtml = "";
    if (item.customization) {
      const c = item.customization;
      customizationHtml = `
        <div class="custom-details-box mt-xs flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="font-label-caps text-label-caps text-secondary-container">CUSTOM ${escapeHtml(c.sport || "")} JERSEY</span>
            <button class="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary-container underline edit-customization-btn" data-id="${item.id}">Edit Customization</button>
          </div>
          <p class="font-body-md text-[13px] text-on-surface-variant leading-snug">
            Name: ${escapeHtml(c.name || "-")} &nbsp;•&nbsp; Number: ${escapeHtml(c.number || "-")} &nbsp;•&nbsp; Color: ${escapeHtml(c.color || "-")}
          </p>
        </div>`;
    }

    const metaBits = [];
    if (item.size) metaBits.push(`Size: ${escapeHtml(item.size)}`);
    if (item.color) metaBits.push(`Color: ${escapeHtml(item.color)}`);
    const metaLine = metaBits.length
      ? `<p class="font-label-caps text-label-caps text-on-surface-variant mt-1">${metaBits.join(" &nbsp;•&nbsp; ")}</p>`
      : "";

    card.innerHTML = `
      <div class="flex gap-md items-start cart-item-row">
        <input type="checkbox" class="khel-checkbox mt-2 item-select-checkbox" data-id="${item.id}" />
        <div class="w-24 h-24 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0 relative">
          <img class="w-full h-full object-cover" alt="${escapeHtml(item.name)}" src="${item.image}"/>
        </div>
        <div class="flex-grow flex flex-col gap-xs min-w-0">
          <div class="flex justify-between items-start gap-sm">
            <div class="min-w-0">
              <h3 class="font-headline-md text-body-lg font-bold text-on-background truncate">${escapeHtml(item.name)}</h3>
              <p class="font-label-caps text-label-caps text-on-surface-variant">SELLER: ${escapeHtml(item.seller || "KHELZONE")}</p>
              ${metaLine}
            </div>
            <span class="font-price-display text-price-display text-secondary-container whitespace-nowrap item-subtotal">${formatPKR(subtotal)}</span>
          </div>
          ${customizationHtml}
          <div class="flex items-center gap-sm mt-auto flex-wrap pt-xs">
            <div class="flex items-center border border-outline-variant rounded bg-surface">
              <button class="px-2 py-1 text-on-surface-variant hover:text-secondary-container material-symbols-outlined text-sm qty-decrease-btn" data-id="${item.id}">remove</button>
              <span class="px-3 font-label-caps text-label-caps item-qty-display">${item.quantity}</span>
              <button class="px-2 py-1 text-on-surface-variant hover:text-secondary-container material-symbols-outlined text-sm qty-increase-btn" data-id="${item.id}">add</button>
            </div>
            <button class="wishlist-btn ${isWished ? "active" : ""} text-on-surface-variant hover:text-vibrant-orange p-1 rounded-full transition-colors" data-id="${item.id}" title="Wishlist">
              <span class="material-symbols-outlined text-sm">favorite</span>
            </button>
            <button class="save-for-later-btn text-on-surface-variant hover:text-secondary-container p-1 rounded-full transition-colors" data-id="${item.id}" title="Save for later">
              <span class="material-symbols-outlined text-sm">bookmark</span>
            </button>
            <button class="details-btn text-on-surface-variant hover:text-secondary-container p-1 rounded-full transition-colors" data-id="${item.id}" title="Product details">
              <span class="material-symbols-outlined text-sm">info</span>
            </button>
            <button class="remove-item-btn text-error hover:text-error-container p-1 rounded-full transition-colors ml-auto" data-id="${item.id}" title="Remove">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    `;
    return card;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function renderSummary() {
    const subtotal = getSubtotal();
    const discount = getDiscount(subtotal);
    const shipping = getShippingCost(subtotal);
    const total = Math.max(0, subtotal - discount + shipping);

    if (el.subtotalValue) el.subtotalValue.textContent = formatPKR(subtotal);

    if (el.discountRow) {
      if (appliedCoupon) {
        el.discountRow.style.display = "flex";
        el.discountValue.textContent = "- " + formatPKR(discount);
      } else {
        el.discountRow.style.display = "none";
      }
    }
    if (el.shippingValue) {
      el.shippingValue.textContent = cart.length === 0 ? formatPKR(0) : (shipping === 0 ? "FREE" : formatPKR(shipping));
    }
    if (el.totalValue) el.totalValue.textContent = formatPKR(total);

    if (el.couponAppliedNote) {
      el.couponAppliedNote.textContent = appliedCoupon ? `${appliedCoupon.code} — ${Math.round(appliedCoupon.rate * 100)}% discount applied!` : "";
    }

    if (el.checkoutBtn) {
      el.checkoutBtn.classList.toggle("disabled-btn", cart.length === 0);
    }
  }

  function renderFreeShippingProgress() {
    if (!el.freeShipWrap) return;
    if (cart.length === 0) {
      el.freeShipWrap.style.display = "none";
      return;
    }
    el.freeShipWrap.style.display = "flex";
    const subtotal = getSubtotal();
    const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
    el.freeShipBarFill.style.width = pct + "%";
    if (subtotal >= FREE_SHIPPING_THRESHOLD) {
      el.freeShipMsg.textContent = "🎉 You unlocked FREE SHIPPING!";
    } else {
      const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
      el.freeShipMsg.textContent = `Add ${formatPKR(remaining)} more to get FREE SHIPPING.`;
    }
  }

  function renderSaved() {
    if (!el.savedContainer) return;
    el.savedContainer.innerHTML = "";
    if (saved.length === 0) {
      el.savedSection.style.display = "none";
      return;
    }
    el.savedSection.style.display = "flex";
    saved.forEach((item) => {
      const row = document.createElement("div");
      row.className = "bg-surface-container-low border border-surface-container-highest rounded-xl p-sm flex gap-md items-center";
      row.innerHTML = `
        <div class="w-16 h-16 bg-surface-container-highest rounded-lg overflow-hidden flex-shrink-0">
          <img class="w-full h-full object-cover" alt="${escapeHtml(item.name)}" src="${item.image}"/>
        </div>
        <div class="flex-grow min-w-0">
          <h4 class="font-headline-md text-body-md font-bold text-on-background truncate">${escapeHtml(item.name)}</h4>
          <span class="font-price-display text-[15px] text-secondary-container">${formatPKR(item.price)}</span>
        </div>
        <div class="flex items-center gap-sm flex-shrink-0">
          <button class="move-to-cart-btn font-label-caps text-label-caps text-secondary-container hover:underline" data-id="${item.id}">MOVE TO CART</button>
          <button class="remove-saved-btn text-error hover:text-error-container p-1 rounded-full" data-id="${item.id}">
            <span class="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      `;
      el.savedContainer.appendChild(row);
    });
  }

  function renderRecommendations() {
    if (!el.recommendationsContainer) return;
    el.recommendationsContainer.innerHTML = "";
    RECOMMENDATIONS.forEach((p) => {
      const card = document.createElement("div");
      card.className = "bg-surface-container-low border border-surface-container-highest rounded-xl p-sm flex flex-col gap-xs";
      card.innerHTML = `
        <div class="w-full aspect-square bg-surface-container-highest rounded-lg overflow-hidden">
          <img class="w-full h-full object-cover" alt="${escapeHtml(p.name)}" src="${p.image}"/>
        </div>
        <h4 class="font-headline-md text-body-md font-bold text-on-background truncate mt-1">${escapeHtml(p.name)}</h4>
        <p class="font-label-caps text-label-caps text-on-surface-variant">${escapeHtml(p.category)}</p>
        <div class="flex items-center justify-between mt-auto pt-xs">
          <span class="font-price-display text-[15px] text-secondary-container">${formatPKR(p.price)}</span>
          <button class="rec-add-to-cart-btn btn-primary text-surface-container-lowest font-label-caps text-label-caps px-2 py-1 rounded-lg font-bold" data-id="${p.id}">ADD</button>
        </div>
      `;
      el.recommendationsContainer.appendChild(card);
    });
  }

  /* ---------------- Cart actions ---------------- */
  function findCartItem(id) {
    return cart.find((i) => i.id === id);
  }

  function changeQty(id, delta) {
    const item = findCartItem(id);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    item.quantity = newQty;
    render();
    const qtyEl = el.itemsContainer.querySelector(`.item-qty-display`);
    animateQtyPulse(id);
  }

  function animateQtyPulse(id) {
    const card = el.itemsContainer.querySelector(`[data-id="${id}"]`);
    if (!card) return;
    const qtyDisplay = card.querySelector(".item-qty-display");
    if (qtyDisplay) {
      qtyDisplay.classList.remove("qty-pulse");
      void qtyDisplay.offsetWidth;
      qtyDisplay.classList.add("qty-pulse");
    }
  }

  function removeItem(id, opts) {
    opts = opts || {};
    const idx = cart.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const [removed] = cart.splice(idx, 1);
    render();
    if (!opts.silent) {
      showToast("Product removed from cart.", {
        actionLabel: "UNDO",
        onAction: () => {
          cart.splice(idx, 0, removed);
          render();
          showToast("Item restored.");
        }
      });
    }
  }

  function addToCart(product, opts) {
    opts = opts || {};
    const existing = findCartItem(product.id);
    if (existing) {
      existing.quantity += opts.quantity || 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        seller: product.seller || "KHELZONE",
        price: product.price,
        image: product.image,
        quantity: opts.quantity || 1,
        size: opts.size || null,
        color: opts.color || null,
        customization: opts.customization || null
      });
    }
    render();
    showToast(`${product.name} added to cart.`);
  }

  function toggleWishlist(id) {
    const idx = wishlist.indexOf(id);
    if (idx === -1) {
      wishlist.push(id);
      showToast("Added to wishlist.");
    } else {
      wishlist.splice(idx, 1);
      showToast("Removed from wishlist.");
    }
    persistWishlist();
    renderCartItems();
  }

  function moveToSaved(id) {
    const idx = cart.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const [item] = cart.splice(idx, 1);
    saved.push(item);
    persistSaved();
    render();
    showToast("Item saved for later.");
  }

  function moveToCartFromSaved(id) {
    const idx = saved.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const [item] = saved.splice(idx, 1);
    const existing = findCartItem(item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    persistSaved();
    render();
    showToast("Item moved back to cart.");
  }

  function removeSavedItem(id) {
    const idx = saved.findIndex((i) => i.id === id);
    if (idx === -1) return;
    saved.splice(idx, 1);
    persistSaved();
    renderSaved();
    showToast("Item removed from saved list.");
  }

  function applyCoupon() {
    const code = (el.couponInput.value || "").trim().toUpperCase();
    if (!code) return;
    if (appliedCoupon && appliedCoupon.code === code) {
      showToast("Coupon already applied.", { error: true });
      return;
    }
    if (!COUPONS.hasOwnProperty(code)) {
      showToast("Invalid promo code", { error: true });
      return;
    }
    appliedCoupon = { code, rate: COUPONS[code] };
    persistCoupon();
    renderSummary();
    showToast(`${code} — ${Math.round(COUPONS[code] * 100)}% discount applied!`);
  }

  function clearCartConfirmed() {
    cart = [];
    persistCart();
    render();
    showToast("Cart cleared.");
  }

  function updateSelectAllState() {
    if (!el.selectAllCheckbox) return;
    const boxes = el.itemsContainer.querySelectorAll(".item-select-checkbox");
    if (boxes.length === 0) {
      el.selectAllCheckbox.checked = false;
      return;
    }
    el.selectAllCheckbox.checked = Array.from(boxes).every((b) => b.checked);
  }

  /* ---------------- Modals ---------------- */
  function openModal(contentHtml, onMount) {
    closeModal();
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "active-modal-overlay";
    overlay.innerHTML = `<div class="modal-panel" role="dialog" aria-modal="true">${contentHtml}</div>`;
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    el.modalRoot.appendChild(overlay);
    if (typeof onMount === "function") onMount(overlay);
  }
  function closeModal() {
    const existing = document.getElementById("active-modal-overlay");
    if (existing) existing.remove();
  }

  function openClearCartModal() {
    openModal(`
      <div class="p-md flex flex-col gap-md">
        <h3 class="font-headline-md text-headline-md text-on-background">Clear Cart</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Are you sure you want to remove all items?</p>
        <div class="flex justify-end gap-sm mt-sm">
          <button id="clear-cart-cancel" class="font-label-caps text-label-caps px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-background">CANCEL</button>
          <button id="clear-cart-confirm" class="font-label-caps text-label-caps px-md py-sm rounded-lg bg-error text-on-error font-bold">CLEAR CART</button>
        </div>
      </div>
    `, (overlay) => {
      overlay.querySelector("#clear-cart-cancel").addEventListener("click", closeModal);
      overlay.querySelector("#clear-cart-confirm").addEventListener("click", () => {
        clearCartConfirmed();
        closeModal();
      });
    });
  }

  function openDetailsModal(item) {
    const custom = item.customization
      ? `<div class="custom-details-box"><p class="font-body-md text-body-md text-on-surface-variant">Name: ${escapeHtml(item.customization.name || "-")}<br/>Number: ${escapeHtml(item.customization.number || "-")}<br/>Color: ${escapeHtml(item.customization.color || "-")}<br/>Sport: ${escapeHtml(item.customization.sport || "-")}</p></div>`
      : `<p class="font-body-md text-body-md text-on-surface-variant">No customization on this item.</p>`;
    openModal(`
      <div class="p-md flex flex-col gap-sm">
        <div class="flex justify-between items-start">
          <h3 class="font-headline-md text-headline-md text-on-background">${escapeHtml(item.name)}</h3>
          <button id="details-close" class="text-on-surface-variant hover:text-on-background"><span class="material-symbols-outlined">close</span></button>
        </div>
        <img src="${item.image}" alt="${escapeHtml(item.name)}" class="w-full h-48 object-cover rounded-lg" />
        <p class="font-label-caps text-label-caps text-on-surface-variant">SELLER: ${escapeHtml(item.seller || "KHELZONE")} &nbsp;•&nbsp; CATEGORY: ${escapeHtml(item.category || "-")}</p>
        ${item.size ? `<p class="font-body-md text-body-md text-on-surface-variant">Size: ${escapeHtml(item.size)}</p>` : ""}
        <span class="font-price-display text-price-display text-secondary-container">${formatPKR(item.price)}</span>
        ${custom}
      </div>
    `, (overlay) => {
      overlay.querySelector("#details-close").addEventListener("click", closeModal);
    });
  }

  function openEditCustomizationModal(item) {
    const c = item.customization || { name: "", number: "", color: "", sport: "" };
    openModal(`
      <div class="p-md flex flex-col gap-sm">
        <h3 class="font-headline-md text-headline-md text-on-background">Edit Customization</h3>
        <label class="font-label-caps text-label-caps text-on-surface-variant">Player Name
          <input id="custom-name" class="form-input mt-1" value="${escapeHtml(c.name)}" />
        </label>
        <label class="font-label-caps text-label-caps text-on-surface-variant">Player Number
          <input id="custom-number" class="form-input mt-1" value="${escapeHtml(c.number)}" />
        </label>
        <label class="font-label-caps text-label-caps text-on-surface-variant">Color
          <input id="custom-color" class="form-input mt-1" value="${escapeHtml(c.color)}" />
        </label>
        <label class="font-label-caps text-label-caps text-on-surface-variant">Sport
          <input id="custom-sport" class="form-input mt-1" value="${escapeHtml(c.sport)}" />
        </label>
        <div class="flex justify-end gap-sm mt-sm">
          <button id="custom-cancel" class="font-label-caps text-label-caps px-md py-sm rounded-lg border border-outline-variant text-on-surface-variant">CANCEL</button>
          <button id="custom-save" class="font-label-caps text-label-caps px-md py-sm rounded-lg btn-primary text-surface-container-lowest font-bold">SAVE</button>
        </div>
      </div>
    `, (overlay) => {
      overlay.querySelector("#custom-cancel").addEventListener("click", closeModal);
      overlay.querySelector("#custom-save").addEventListener("click", () => {
        item.customization = {
          name: overlay.querySelector("#custom-name").value.trim(),
          number: overlay.querySelector("#custom-number").value.trim(),
          color: overlay.querySelector("#custom-color").value.trim(),
          sport: overlay.querySelector("#custom-sport").value.trim()
        };
        render();
        closeModal();
        showToast("Customization updated.");
      });
    });
  }

  function openCheckoutModal() {
    if (cart.length === 0) {
      showToast("Your cart is empty.", { error: true });
      return;
    }
    const subtotal = getSubtotal();
    const discount = getDiscount(subtotal);
    selectedDelivery = "standard";
    const html = `
      <div class="p-md flex flex-col gap-md">
        <div class="flex justify-between items-start">
          <h3 class="font-headline-md text-headline-md text-on-background">CHECKOUT</h3>
          <button id="checkout-close" class="text-on-surface-variant hover:text-on-background"><span class="material-symbols-outlined">close</span></button>
        </div>

        <div class="flex flex-col gap-sm">
          <h4 class="font-label-caps text-label-caps text-secondary-container">CUSTOMER INFORMATION</h4>
          <input id="cf-name" class="form-input" placeholder="Full Name" />
          <input id="cf-email" class="form-input" placeholder="Email" type="email" />
          <input id="cf-phone" class="form-input" placeholder="Phone" />
          <input id="cf-address" class="form-input" placeholder="Address" />
          <input id="cf-city" class="form-input" placeholder="City" />
        </div>

        <div class="flex flex-col gap-sm">
          <h4 class="font-label-caps text-label-caps text-secondary-container">DELIVERY</h4>
          <div class="grid grid-cols-2 gap-sm">
            <div class="delivery-option selected p-sm" data-value="standard">
              <p class="font-body-md text-body-md text-on-background font-bold">Standard</p>
              <p class="font-label-caps text-label-caps text-on-surface-variant">3–5 Business Days</p>
            </div>
            <div class="delivery-option p-sm" data-value="express">
              <p class="font-body-md text-body-md text-on-background font-bold">Express</p>
              <p class="font-label-caps text-label-caps text-on-surface-variant">1–2 Business Days</p>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h4 class="font-label-caps text-label-caps text-secondary-container">PAYMENT</h4>
          <div class="flex flex-col gap-sm">
            <div class="payment-option selected p-sm flex items-center gap-sm" data-value="cod">
              <span class="material-symbols-outlined text-sm">payments</span>
              <span class="font-body-md text-body-md text-on-background">Cash on Delivery</span>
            </div>
            <div class="payment-option p-sm flex items-center gap-sm" data-value="bank">
              <span class="material-symbols-outlined text-sm">account_balance</span>
              <span class="font-body-md text-body-md text-on-background">Bank Transfer</span>
            </div>
            <div class="payment-option p-sm flex items-center gap-sm" data-value="card">
              <span class="material-symbols-outlined text-sm">credit_card</span>
              <span class="font-body-md text-body-md text-on-background">Card Payment</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-1 border-t border-outline-variant pt-sm" id="checkout-summary">
          <!-- filled dynamically -->
        </div>

        <button id="place-order-btn" class="btn-primary w-full py-sm rounded-lg font-label-caps text-label-caps text-surface-container-lowest font-bold mt-sm">PLACE ORDER</button>
      </div>
    `;
    openModal(html, (overlay) => {
      overlay.querySelector("#checkout-close").addEventListener("click", closeModal);

      function updateSummary() {
        const s = getSubtotal();
        const d = getDiscount(s);
        const ship = getShippingCost(s);
        const t = Math.max(0, s - d + ship);
        overlay.querySelector("#checkout-summary").innerHTML = `
          <div class="flex justify-between text-on-surface-variant"><span class="font-body-md text-body-md">Subtotal</span><span class="font-price-display text-[16px]">${formatPKR(s)}</span></div>
          ${d > 0 ? `<div class="flex justify-between text-secondary-container"><span class="font-body-md text-body-md">Discount</span><span class="font-price-display text-[16px]">- ${formatPKR(d)}</span></div>` : ""}
          <div class="flex justify-between text-on-surface-variant"><span class="font-body-md text-body-md">Shipping</span><span class="font-price-display text-[16px]">${ship === 0 ? "FREE" : formatPKR(ship)}</span></div>
          <div class="flex justify-between pt-xs"><span class="font-headline-md text-body-lg text-on-background">TOTAL</span><span class="font-price-display text-body-lg text-secondary-container font-bold">${formatPKR(t)}</span></div>
        `;
      }
      updateSummary();

      overlay.querySelectorAll(".delivery-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          overlay.querySelectorAll(".delivery-option").forEach((o) => o.classList.remove("selected"));
          opt.classList.add("selected");
          selectedDelivery = opt.dataset.value;
          updateSummary();
        });
      });
      overlay.querySelectorAll(".payment-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          overlay.querySelectorAll(".payment-option").forEach((o) => o.classList.remove("selected"));
          opt.classList.add("selected");
          selectedPayment = opt.dataset.value;
        });
      });

      overlay.querySelector("#place-order-btn").addEventListener("click", () => {
        const name = overlay.querySelector("#cf-name").value.trim();
        const email = overlay.querySelector("#cf-email").value.trim();
        const phone = overlay.querySelector("#cf-phone").value.trim();
        const address = overlay.querySelector("#cf-address").value.trim();
        const city = overlay.querySelector("#cf-city").value.trim();

        if (!name || !email || !phone || !address || !city) {
          showToast("Please fill in all required fields.", { error: true });
          return;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
          showToast("Please enter a valid email address.", { error: true });
          return;
        }
        placeOrder({ name, email, phone, address, city });
      });
    });
  }

  function generateOrderNumber() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `KZ-${y}${m}${d}-${rand}`;
  }

  function placeOrder(customer) {
    const orderNumber = generateOrderNumber();
    const subtotal = getSubtotal();
    const discount = getDiscount(subtotal);
    const shipping = getShippingCost(subtotal);
    const total = Math.max(0, subtotal - discount + shipping);

    closeModal();

    openModal(`
      <div class="p-lg flex flex-col items-center text-center gap-sm">
        <span class="material-symbols-outlined text-secondary-container" style="font-size:56px;">check_circle</span>
        <h3 class="font-headline-lg-mobile text-on-background">Order placed successfully!</h3>
        <p class="font-body-md text-body-md text-on-surface-variant">Order Number</p>
        <p class="font-price-display text-headline-md text-secondary-container">${orderNumber}</p>
        <p class="font-body-md text-body-md text-on-surface-variant">Total: ${formatPKR(total)} • ${selectedDelivery === "express" ? "Express" : "Standard"} Delivery</p>
        <p class="font-body-md text-[14px] text-on-surface-variant">A confirmation has been noted for ${escapeHtml(customer.name)}.</p>
        <button id="order-done-btn" class="btn-primary w-full py-sm rounded-lg font-label-caps text-label-caps text-surface-container-lowest font-bold mt-sm">DONE</button>
      </div>
    `, (overlay) => {
      overlay.querySelector("#order-done-btn").addEventListener("click", () => {
        closeModal();
      });
    });

    cart = [];
    appliedCoupon = null;
    persistCart();
    persistCoupon();
    render();
    showToast(`Order placed! Ref: ${orderNumber}`);
  }

  /* ---------------- Event delegation ---------------- */
  function bindEvents() {
    el.itemsContainer.addEventListener("click", (e) => {
      const incBtn = e.target.closest(".qty-increase-btn");
      const decBtn = e.target.closest(".qty-decrease-btn");
      const removeBtn = e.target.closest(".remove-item-btn");
      const wishBtn = e.target.closest(".wishlist-btn");
      const saveBtn = e.target.closest(".save-for-later-btn");
      const detailsBtn = e.target.closest(".details-btn");
      const editCustomBtn = e.target.closest(".edit-customization-btn");

      if (incBtn) changeQty(incBtn.dataset.id, 1);
      else if (decBtn) changeQty(decBtn.dataset.id, -1);
      else if (removeBtn) removeItem(removeBtn.dataset.id);
      else if (wishBtn) toggleWishlist(wishBtn.dataset.id);
      else if (saveBtn) moveToSaved(saveBtn.dataset.id);
      else if (detailsBtn) {
        const item = findCartItem(detailsBtn.dataset.id);
        if (item) openDetailsModal(item);
      } else if (editCustomBtn) {
        const item = findCartItem(editCustomBtn.dataset.id);
        if (item) openEditCustomizationModal(item);
      }
    });

    el.itemsContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("item-select-checkbox")) {
        updateSelectAllState();
      }
    });

    if (el.selectAllCheckbox) {
      el.selectAllCheckbox.addEventListener("change", () => {
        const checked = el.selectAllCheckbox.checked;
        el.itemsContainer.querySelectorAll(".item-select-checkbox").forEach((b) => (b.checked = checked));
      });
    }

    if (el.clearCartBtn) {
      el.clearCartBtn.addEventListener("click", () => {
        if (cart.length === 0) {
          showToast("Your cart is already empty.");
          return;
        }
        openClearCartModal();
      });
    }

    if (el.couponApplyBtn) {
      el.couponApplyBtn.addEventListener("click", applyCoupon);
    }
    if (el.couponInput) {
      el.couponInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") applyCoupon();
      });
    }

    if (el.checkoutBtn) {
      el.checkoutBtn.addEventListener("click", openCheckoutModal);
    }

    if (el.savedContainer) {
      el.savedContainer.addEventListener("click", (e) => {
        const moveBtn = e.target.closest(".move-to-cart-btn");
        const delBtn = e.target.closest(".remove-saved-btn");
        if (moveBtn) moveToCartFromSaved(moveBtn.dataset.id);
        else if (delBtn) removeSavedItem(delBtn.dataset.id);
      });
    }

    if (el.recommendationsContainer) {
      el.recommendationsContainer.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".rec-add-to-cart-btn");
        if (!addBtn) return;
        const product = RECOMMENDATIONS.find((p) => p.id === addBtn.dataset.id);
        if (product) addToCart(product);
      });
    }

    document.querySelectorAll(".continue-shopping-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = btn.dataset.href || "index.html";
      });
    });
    document.querySelectorAll(".customize-kit-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        window.location.href = btn.dataset.href || "customize.html";
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  /* ---------------- Init ---------------- */
  function init() {
    loadState();
    bindEvents();
    renderRecommendations();
    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();