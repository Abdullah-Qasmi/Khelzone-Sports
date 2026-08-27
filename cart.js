/* ==========================================================================
   KHELZONE — CART.JS
   SHOP.JS + ADMIN PRODUCT SYSTEM
   ========================================================================== */

"use strict";

/* ==========================================================================
   STORAGE KEYS
   ========================================================================== */

const PRODUCTS_KEY = "khz_products_v1";
const CART_KEY = "khz_cart";
const WISHLIST_KEY = "khz_wishlist";

/* ==========================================================================
   GLOBALS
   ========================================================================== */

let PRODUCTS = [];
let CART = [];
let SAVED_FOR_LATER = [];

let appliedCoupon = null;

/* ==========================================================================
   HELPERS
   ========================================================================== */

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  [...context.querySelectorAll(selector)];

function money(value) {
  return "PKR " + (Number(value) || 0).toLocaleString("en-PK");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==========================================================================
   FALLBACK IMAGE
   ========================================================================== */

function fallbackImgFor(sport) {
  const label =
    String(sport || "KHELZONE").toUpperCase();

  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="500"
      height="500"
    >
      <rect
        width="500"
        height="500"
        fill="#141414"
      />

      <rect
        x="15"
        y="15"
        width="470"
        height="470"
        fill="none"
        stroke="#FF6A00"
        stroke-width="3"
      />

      <text
        x="50%"
        y="47%"
        fill="#FF6A00"
        font-family="Arial"
        font-weight="800"
        font-size="34"
        text-anchor="middle"
      >
        KHELZONE
      </text>

      <text
        x="50%"
        y="56%"
        fill="#A6A6A6"
        font-family="Arial"
        font-size="15"
        text-anchor="middle"
      >
        ${escapeHTML(label)}
      </text>
    </svg>
  `;

  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg)
  );
}

function safeImage(product) {
  if (
    product &&
    product.image &&
    String(product.image).trim()
  ) {
    return product.image;
  }

  return fallbackImgFor(
    product ? product.sport : "Sports"
  );
}

/* ==========================================================================
   LOAD PRODUCTS
   ========================================================================== */

function loadProducts() {
  try {
    const saved =
      localStorage.getItem(PRODUCTS_KEY);

    if (!saved) {
      PRODUCTS = [];
      return;
    }

    const parsed =
      JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      PRODUCTS = [];
      return;
    }

    PRODUCTS =
      parsed
        .filter(product => product)
        .map((product, index) => {

          const price =
            Number(product.price) || 0;

          const oldPrice =
            Number(product.oldPrice) ||
            price;

          let discount =
            Number(product.discount) || 0;

          if (
            !discount &&
            oldPrice > price
          ) {
            discount =
              Math.round(
                ((oldPrice - price) /
                  oldPrice) *
                  100
              );
          }

          return {
            id:
              product.id ??
              `admin-${index}`,

            name:
              String(
                product.name ||
                "KHELZONE Product"
              ),

            category:
              String(
                product.category ||
                "Accessories"
              ),

            sport:
              String(
                product.sport ||
                product.category ||
                "Sports"
              ),

            price,

            oldPrice,

            discount,

            rating:
              Number(product.rating) ||
              0,

            reviews:
              Number(product.reviews) ||
              0,

            image:
              product.image || "",

            description:
              String(
                product.description ||
                "Quality sports gear from KHELZONE."
              ),

            sizes:
              Array.isArray(product.sizes)
                ? product.sizes
                : ["Standard"],

            stock:
              Math.max(
                0,
                Number(product.stock) || 0
              ),

            badge:
              String(
                product.badge || ""
              ),

            brand:
              String(
                product.brand ||
                "KHELZONE"
              )
          };
        });
  }

  catch (error) {
    console.error(
      "KHELZONE products loading error:",
      error
    );

    PRODUCTS = [];
  }
}

/* ==========================================================================
   LOAD CART
   ========================================================================== */

function loadCart() {
  try {
    const saved =
      JSON.parse(
        localStorage.getItem(CART_KEY) ||
        "[]"
      );

    CART =
      Array.isArray(saved)
        ? saved
        : [];
  }

  catch (error) {
    console.error(
      "KHELZONE cart loading error:",
      error
    );

    CART = [];
  }

  /*
   * Clean invalid cart items.
   */

  CART =
    CART.filter(item => {

      if (!item) {
        return false;
      }

      const product =
        findProduct(item.id);

      return !!product;
    });

  saveCart();
}

/* ==========================================================================
   SAVE CART
   ========================================================================== */

function saveCart() {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(CART)
  );
}

/* ==========================================================================
   FIND PRODUCT
   ========================================================================== */

function findProduct(id) {
  return PRODUCTS.find(
    product =>
      String(product.id) ===
      String(id)
  );
}

/* ==========================================================================
   ADD TO CART
   ========================================================================== */

function addToCart(
  id,
  size,
  quantity = 1
) {
  const product =
    findProduct(id);

  if (!product) {
    showToast(
      "Product no longer exists.",
      "error"
    );

    return;
  }

  if (
    Number(product.stock) <= 0
  ) {
    showToast(
      "Product is out of stock.",
      "error"
    );

    return;
  }

  const chosenSize =
    size ||
    (
      Array.isArray(product.sizes) &&
      product.sizes.length
        ? product.sizes[0]
        : "Standard"
    );

  const qty =
    Math.max(
      1,
      Number(quantity) || 1
    );

  const existing =
    CART.find(
      item =>
        String(item.id) ===
          String(id) &&
        String(item.size) ===
          String(chosenSize)
    );

  if (existing) {
    existing.qty += qty;

    if (
      existing.qty >
      Number(product.stock)
    ) {
      existing.qty =
        Number(product.stock);
    }
  }

  else {
    CART.push({
      id: product.id,
      size: chosenSize,
      qty: Math.min(
        qty,
        Number(product.stock)
      )
    });
  }

  saveCart();

  renderCart();

  showToast(
    `${product.name} added to cart.`,
    "cart"
  );
}

/* ==========================================================================
   UPDATE QUANTITY
   ========================================================================== */

function updateQuantity(
  id,
  size,
  change
) {
  const item =
    CART.find(
      cartItem =>
        String(cartItem.id) ===
          String(id) &&
        String(cartItem.size) ===
          String(size)
    );

  if (!item) {
    return;
  }

  const product =
    findProduct(id);

  if (!product) {
    return;
  }

  const current =
    Number(item.qty) || 1;

  let next =
    current + change;

  if (next < 1) {
    next = 1;
  }

  const stock =
    Number(product.stock) || 0;

  if (stock > 0 && next > stock) {
    next = stock;

    showToast(
      `Only ${stock} item(s) available.`,
      "error"
    );
  }

  item.qty = next;

  saveCart();

  renderCart();
}

/* ==========================================================================
   REMOVE ITEM
   ========================================================================== */

function removeFromCart(
  id,
  size
) {
  const product =
    findProduct(id);

  CART =
    CART.filter(
      item =>
        !(
          String(item.id) ===
            String(id) &&
          String(item.size) ===
            String(size)
        )
    );

  saveCart();

  renderCart();

  if (product) {
    showToast(
      `${product.name} removed from cart.`,
      "cart"
    );
  }
}

/* ==========================================================================
   CLEAR CART
   ========================================================================== */

function clearCart() {
  if (!CART.length) {
    return;
  }

  CART = [];

  saveCart();

  renderCart();

  showToast(
    "Cart cleared.",
    "cart"
  );
}

/* ==========================================================================
   CART COUNT
   ========================================================================== */

function getCartQuantity() {
  return CART.reduce(
    (total, item) =>
      total +
      Number(item.qty || 0),
    0
  );
}

/* ==========================================================================
   SUBTOTAL
   ========================================================================== */

function getSubtotal() {
  return CART.reduce(
    (total, item) => {

      const product =
        findProduct(item.id);

      if (!product) {
        return total;
      }

      return (
        total +
        Number(product.price || 0) *
          Number(item.qty || 1)
      );
    },
    0
  );
}

/* ==========================================================================
   SHIPPING
   ========================================================================== */

function getShipping(subtotal) {
  if (subtotal <= 0) {
    return 0;
  }

  /*
   * Free shipping above PKR 5000
   */

  if (subtotal >= 5000) {
    return 0;
  }

  return 250;
}

/* ==========================================================================
   COUPON
   ========================================================================== */

function getDiscount(subtotal) {
  if (!appliedCoupon) {
    return 0;
  }

  if (
    appliedCoupon === "KHEL10"
  ) {
    return Math.round(
      subtotal * 0.10
    );
  }

  return 0;
}

function applyCoupon() {
  const input =
    $("#coupon-input");

  if (!input) {
    return;
  }

  const code =
    input.value
      .trim()
      .toUpperCase();

  if (!code) {
    showToast(
      "Enter a promo code.",
      "error"
    );

    return;
  }

  if (code === "KHEL10") {
    appliedCoupon =
      "KHEL10";

    input.value =
      "KHEL10";

    const note =
      $("#coupon-applied-note");

    if (note) {
      note.textContent =
        "KHEL10 applied — 10% OFF";
    }

    showToast(
      "Coupon applied successfully.",
      "cart"
    );

    renderTotals();

    return;
  }

  appliedCoupon = null;

  const note =
    $("#coupon-applied-note");

  if (note) {
    note.textContent = "";
  }

  showToast(
    "Invalid coupon code.",
    "error"
  );

  renderTotals();
}

/* ==========================================================================
   FREE SHIPPING MESSAGE
   ========================================================================== */

function renderFreeShipping() {
  const wrap =
    $("#free-ship-wrap");

  const message =
    $("#free-ship-msg");

  const bar =
    $("#free-ship-bar-fill");

  if (
    !wrap ||
    !message ||
    !bar
  ) {
    return;
  }

  const subtotal =
    getSubtotal();

  if (subtotal <= 0) {
    wrap.style.display =
      "none";

    return;
  }

  wrap.style.display =
    "flex";

  const target =
    5000;

  if (subtotal >= target) {
    message.textContent =
      "🎉 You unlocked FREE SHIPPING!";

    bar.style.width =
      "100%";

    return;
  }

  const remaining =
    target - subtotal;

  message.textContent =
    `Add ${money(remaining)} more to get FREE SHIPPING.`;

  const percent =
    Math.min(
      100,
      (subtotal / target) * 100
    );

  bar.style.width =
    `${percent}%`;
}

/* ==========================================================================
   TOTALS
   ========================================================================== */

function renderTotals() {
  const subtotal =
    getSubtotal();

  const discount =
    getDiscount(subtotal);

  const shipping =
    getShipping(
      Math.max(
        0,
        subtotal - discount
      )
    );

  const total =
    Math.max(
      0,
      subtotal -
        discount +
        shipping
    );

  const subtotalElement =
    $("#subtotal-value");

  if (subtotalElement) {
    subtotalElement.textContent =
      money(subtotal);
  }

  const shippingElement =
    $("#shipping-value");

  if (shippingElement) {
    shippingElement.textContent =
      shipping === 0
        ? subtotal > 0
          ? "FREE"
          : money(0)
        : money(shipping);
  }

  const totalElement =
    $("#total-value");

  if (totalElement) {
    totalElement.textContent =
      money(total);
  }

  const discountRow =
    $("#discount-row");

  const discountValue =
    $("#discount-value");

  if (discount > 0) {
    if (discountRow) {
      discountRow.style.display =
        "flex";
    }

    if (discountValue) {
      discountValue.textContent =
        "- " + money(discount);
    }
  }

  else {
    if (discountRow) {
      discountRow.style.display =
        "none";
    }

    if (discountValue) {
      discountValue.textContent =
        "- PKR 0";
    }
  }

  renderFreeShipping();
}

/* ==========================================================================
   CART ITEM HTML
   ========================================================================== */

function cartItemHTML(
  item
) {
  const product =
    findProduct(item.id);

  if (!product) {
    return "";
  }

  const quantity =
    Number(item.qty) || 1;

  const maxStock =
    Number(product.stock) || 0;

  const lineTotal =
    Number(product.price) *
    quantity;

  return `
    <article
      class="
        cart-item
        bg-surface-container-low
        border
        border-outline-variant/50
        rounded-xl
        p-sm
        md:p-md
        flex
        gap-sm
        md:gap-md
        items-start
      "
      data-id="${escapeHTML(product.id)}"
      data-size="${escapeHTML(item.size)}"
    >

      <!-- SELECT -->

      <div class="pt-1">
        <input
          type="checkbox"
          class="khel-checkbox cart-select-checkbox"
          data-id="${escapeHTML(product.id)}"
          data-size="${escapeHTML(item.size)}"
        >
      </div>

      <!-- IMAGE -->

      <div
        class="
          w-24
          h-24
          md:w-32
          md:h-32
          rounded-lg
          overflow-hidden
          flex
         -shrink-0
          items-center
          justify-center
        "
        style="background:#141414"
      >

        <img
          src="${escapeHTML(safeImage(product))}"
          alt="${escapeHTML(product.name)}"
          class="w-full h-full object-contain"
          loading="lazy"
          onerror="
            this.onerror=null;
            this.src='${fallbackImgFor(product.sport)}';
          "
        >

      </div>

      <!-- PRODUCT INFO -->

      <div class="flex-1 min-w-0">

        <div
          class="
            flex
            flex-col
            md:flex-row
            md:justify-between
            gap-xs
          "
        >

          <div>

            <p
              class="
                text-[10px]
                uppercase
                tracking-wider
                text-on-surface-variant
              "
            >
              ${escapeHTML(product.sport)}
              ·
              ${escapeHTML(product.category)}
            </p>

            <h3
              class="
                font-headline-md
                text-headline-md
                text-on-background
                leading-tight
                mt-1
              "
            >
              ${escapeHTML(product.name)}
            </h3>

          </div>

          <div
            class="
              font-price-display
              text-[17px]
              text-secondary-container
              font-bold
              whitespace-nowrap
            "
          >
            ${money(lineTotal)}
          </div>

        </div>

        <p
          class="
            text-xs
            text-on-surface-variant
            mt-1
          "
        >
          ${escapeHTML(product.description)}
        </p>

        <div
          class="
            flex
            flex-wrap
            items-center
            gap-2
            mt-2
          "
        >

          <span
            class="
              text-xs
              px-2
              py-1
              rounded
              bg-surface-container-highest
            "
          >
            Size:
            <strong>
              ${escapeHTML(item.size || "Standard")}
            </strong>
          </span>

          <span
            class="
              text-xs
              ${
                maxStock > 0
                  ? "text-secondary-container"
                  : "text-error"
              }
            "
          >
            ${
              maxStock > 0
                ? `In Stock (${maxStock})`
                : "Out of Stock"
            }
          </span>

        </div>

        <!-- CONTROLS -->

        <div
          class="
            flex
            flex-wrap
            items-center
            gap-3
            mt-3
          "
        >

          <div
            class="
              flex
              items-center
              border
              border-outline-variant
              rounded-lg
              overflow-hidden
            "
          >

            <button
              type="button"
              class="
                w-8
                h-8
                flex
                items-center
                justify-center
                hover:bg-white/10
              "
              data-action="qty-minus"
              data-id="${escapeHTML(product.id)}"
              data-size="${escapeHTML(item.size)}"
            >
              −
            </button>

            <span
              class="
                w-9
                text-center
                text-sm
                font-bold
              "
            >
              ${quantity}
            </span>

            <button
              type="button"
              class="
                w-8
                h-8
                flex
                items-center
                justify-center
                hover:bg-white/10
              "
              data-action="qty-plus"
              data-id="${escapeHTML(product.id)}"
              data-size="${escapeHTML(item.size)}"
              ${
                maxStock > 0 &&
                quantity >= maxStock
                  ? "disabled"
                  : ""
              }
            >
              +
            </button>

          </div>

          <button
            type="button"
            class="
              text-xs
              text-error
              hover:underline
              flex
              items-center
              gap-1
            "
            data-action="remove"
            data-id="${escapeHTML(product.id)}"
            data-size="${escapeHTML(item.size)}"
          >
            <span
              class="material-symbols-outlined text-sm"
            >
              delete
            </span>
            REMOVE
          </button>

          <button
            type="button"
            class="
              text-xs
              text-on-surface-variant
              hover:text-secondary-container
              hover:underline
            "
            data-action="save-later"
            data-id="${escapeHTML(product.id)}"
            data-size="${escapeHTML(item.size)}"
          >
            SAVE FOR LATER
          </button>

        </div>

        <div
          class="
            mt-2
            text-[11px]
            text-on-surface-variant
          "
        >
          ${money(product.price)} each
        </div>

      </div>

    </article>
  `;
}

/* ==========================================================================
   RENDER CART
   ========================================================================== */

function renderCart() {
  const container =
    $("#cart-items-container");

  const emptyState =
    $("#empty-cart-state");

  const cartCount =
    getCartQuantity();

  const itemCountLabel =
    $("#item-count-label");

  if (itemCountLabel) {
    itemCountLabel.textContent =
      `${cartCount} ${
        cartCount === 1
          ? "ITEM"
          : "ITEMS"
      }`;
  }

  if (container) {

    if (CART.length === 0) {
      container.innerHTML = "";
    }

    else {
      container.innerHTML =
        CART
          .map(cartItemHTML)
          .join("");
    }
  }

  if (emptyState) {
    emptyState.style.display =
      CART.length === 0
        ? "flex"
        : "none";
  }

  const selectAll =
    $("#select-all-checkbox");

  if (selectAll) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
  }

  renderTotals();

  renderSavedForLater();

  renderRecommendations();
}

/* ==========================================================================
   SELECT ALL
   ========================================================================== */

function updateSelectAllState() {
  const boxes =
    $$(".cart-select-checkbox");

  const selectAll =
    $("#select-all-checkbox");

  if (!selectAll) {
    return;
  }

  if (boxes.length === 0) {
    selectAll.checked = false;
    selectAll.indeterminate = false;
    return;
  }

  const checked =
    boxes.filter(
      checkbox =>
        checkbox.checked
    ).length;

  selectAll.checked =
    checked === boxes.length;

  selectAll.indeterminate =
    checked > 0 &&
    checked < boxes.length;
}

/* ==========================================================================
   SELECT ALL EVENT
   ========================================================================== */

function wireSelectAll() {
  const selectAll =
    $("#select-all-checkbox");

  if (!selectAll) {
    return;
  }

  selectAll.addEventListener(
    "change",
    () => {

      $$(".cart-select-checkbox")
        .forEach(
          checkbox => {
            checkbox.checked =
              selectAll.checked;
          }
        );

      updateSelectAllState();
    }
  );

  document.addEventListener(
    "change",
    event => {

      if (
        event.target.matches(
          ".cart-select-checkbox"
        )
      ) {
        updateSelectAllState();
      }
    }
  );
}

/* ==========================================================================
   SAVE FOR LATER
   ========================================================================== */

function saveForLater(
  id,
  size
) {
  const item =
    CART.find(
      cartItem =>
        String(cartItem.id) ===
          String(id) &&
        String(cartItem.size) ===
          String(size)
    );

  if (!item) {
    return;
  }

  const alreadySaved =
    SAVED_FOR_LATER.some(
      saved =>
        String(saved.id) ===
          String(id) &&
        String(saved.size) ===
          String(size)
    );

  if (!alreadySaved) {
    SAVED_FOR_LATER.push({
      id: item.id,
      size: item.size,
      qty: item.qty
    });
  }

  CART =
    CART.filter(
      cartItem =>
        !(
          String(cartItem.id) ===
            String(id) &&
          String(cartItem.size) ===
            String(size)
        )
    );

  saveCart();

  renderCart();

  showToast(
    "Item saved for later.",
    "cart"
  );
}

/* ==========================================================================
   SAVED FOR LATER RENDER
   ========================================================================== */

function renderSavedForLater() {
  const section =
    $("#saved-for-later-section");

  const container =
    $("#saved-items-container");

  if (
    !section ||
    !container
  ) {
    return;
  }

  if (
    !SAVED_FOR_LATER.length
  ) {
    section.style.display =
      "none";

    container.innerHTML =
      "";

    return;
  }

  section.style.display =
    "flex";

  container.innerHTML =
    SAVED_FOR_LATER
      .map(item => {

        const product =
          findProduct(item.id);

        if (!product) {
          return "";
        }

        return `
          <div
            class="
              bg-surface-container-low
              border
              border-outline-variant/50
              rounded-xl
              p-sm
              flex
              items-center
              gap-sm
            "
          >

            <img
              src="${escapeHTML(safeImage(product))}"
              alt="${escapeHTML(product.name)}"
              class="
                w-20
                h-20
                rounded-lg
                object-contain
              "
              style="background:#141414"
              onerror="
                this.onerror=null;
                this.src='${fallbackImgFor(product.sport)}';
              "
            >

            <div class="flex-1">

              <h4
                class="
                  text-sm
                  font-bold
                "
              >
                ${escapeHTML(product.name)}
              </h4>

              <p
                class="
                  text-xs
                  text-on-surface-variant
                "
              >
                Size:
                ${escapeHTML(item.size)}
              </p>

              <p
                class="
                  text-sm
                  text-secondary-container
                  font-bold
                  mt-1
                "
              >
                ${money(product.price)}
              </p>

            </div>

            <button
              type="button"
              class="
                px-3
                py-2
                rounded-lg
                border
                border-secondary-container
                text-secondary-container
                text-xs
                font-bold
              "
              data-action="move-to-cart"
              data-id="${escapeHTML(product.id)}"
              data-size="${escapeHTML(item.size)}"
            >
              MOVE TO CART
            </button>

          </div>
        `;
      })
      .join("");
}

/* ==========================================================================
   MOVE SAVED ITEM TO CART
   ========================================================================== */

function moveSavedToCart(
  id,
  size
) {
  const index =
    SAVED_FOR_LATER.findIndex(
      item =>
        String(item.id) ===
          String(id) &&
        String(item.size) ===
          String(size)
    );

  if (index < 0) {
    return;
  }

  const saved =
    SAVED_FOR_LATER[index];

  const product =
    findProduct(id);

  if (!product) {
    return;
  }

  if (
    Number(product.stock) <= 0
  ) {
    showToast(
      "Product is out of stock.",
      "error"
    );

    return;
  }

  addToCart(
    id,
    size,
    saved.qty || 1
  );

  SAVED_FOR_LATER.splice(
    index,
    1
  );

  renderSavedForLater();
}

/* ==========================================================================
   RECOMMENDATIONS
   ========================================================================== */

function renderRecommendations() {
  const container =
    $("#recommendations-container");

  if (!container) {
    return;
  }

  if (!PRODUCTS.length) {
    container.innerHTML = `
      <div
        class="
          col-span-full
          text-center
          py-8
          text-sm
          text-on-surface-variant
        "
      >
        Products added from the Shop/Admin panel
        will appear here.
      </div>
    `;

    return;
  }

  /*
   * Show products from the same product
   * database used by shop.html.
   *
   * Avoid products already in cart.
   */

  const cartIds =
    new Set(
      CART.map(
        item =>
          String(item.id)
      )
    );

  let recommendations =
    PRODUCTS.filter(
      product =>
        !cartIds.has(
          String(product.id)
        )
    );

  /*
   * If everything is in cart,
   * show products anyway.
   */

  if (!recommendations.length) {
    recommendations =
      PRODUCTS;
  }

  recommendations =
    recommendations.slice(
      0,
      6
    );

  container.innerHTML =
    recommendations
      .map(product => {

        const outOfStock =
          Number(product.stock) <= 0;

        return `
          <article
            class="
              bg-surface-container-low
              border
              border-outline-variant/50
              rounded-xl
              overflow-hidden
              flex
              flex-col
            "
          >

            <div
              class="
                h-36
                md:h-44
                flex
                items-center
                justify-center
                relative
              "
              style="background:#141414"
            >

              ${
                product.badge
                  ? `
                    <span
                      class="
                        absolute
                        top-2
                        left-2
                        text-[9px]
                        uppercase
                        font-bold
                        px-2
                        py-1
                        rounded
                        bg-secondary-container
                        text-black
                      "
                    >
                      ${escapeHTML(product.badge)}
                    </span>
                  `
                  : ""
              }

              <img
                src="${escapeHTML(safeImage(product))}"
                alt="${escapeHTML(product.name)}"
                class="
                  w-full
                  h-full
                  object-contain
                "
                loading="lazy"
                onerror="
                  this.onerror=null;
                  this.src='${fallbackImgFor(product.sport)}';
                "
              >

            </div>

            <div
              class="
                p-3
                flex
                flex-col
                flex-1
              "
            >

              <p
                class="
                  text-[9px]
                  uppercase
                  tracking-wider
                  text-on-surface-variant
                "
              >
                ${escapeHTML(product.sport)}
              </p>

              <h4
                class="
                  text-xs
                  md:text-sm
                  font-bold
                  mt-1
                  line-clamp-2
                "
              >
                ${escapeHTML(product.name)}
              </h4>

              <div
                class="
                  mt-2
                  flex
                  items-center
                  gap-2
                "
              >

                <span
                  class="
                    text-sm
                    font-bold
                    text-secondary-container
                  "
                >
                  ${money(product.price)}
                </span>

                ${
                  product.oldPrice >
                  product.price
                    ? `
                      <span
                        class="
                          text-[10px]
                          line-through
                          text-on-surface-variant
                        "
                      >
                        ${money(product.oldPrice)}
                      </span>
                    `
                    : ""
                }

              </div>

              <button
                type="button"
                class="
                  mt-auto
                  pt-2
                  add-recommendation-btn
                  w-full
                  py-2
                  rounded-lg
                  text-[10px]
                  font-bold
                  uppercase
                  ${
                    outOfStock
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }
                "
                data-action="recommendation-add"
                data-id="${escapeHTML(product.id)}"
                ${
                  outOfStock
                    ? "disabled"
                    : ""
                }
              >
                ${
                  outOfStock
                    ? "OUT OF STOCK"
                    : "ADD TO CART"
                }
              </button>

            </div>

          </article>
        `;
      })
      .join("");
}

/* ==========================================================================
   CHECKOUT
   ========================================================================== */

function checkout() {
  if (!CART.length) {
    showToast(
      "Your cart is empty.",
      "error"
    );

    return;
  }

  /*
   * Check stock before checkout.
   */

  for (const item of CART) {

    const product =
      findProduct(item.id);

    if (!product) {
      showToast(
        "A product in your cart is no longer available.",
        "error"
      );

      return;
    }

    if (
      Number(item.qty) >
      Number(product.stock)
    ) {
      showToast(
        `${product.name} does not have enough stock.`,
        "error"
      );

      return;
    }
  }

  /*
   * Demo checkout.
   * Replace this later with your actual
   * checkout/payment page.
   */

  showToast(
    "Checkout is ready — payment page can be connected here.",
    "cart"
  );
}

/* ==========================================================================
   TOAST
   ========================================================================== */

function showToast(
  message,
  type = "cart"
) {
  const container =
    $("#toast-container");

  if (!container) {
    return;
  }

  const toast =
    document.createElement("div");

  toast.className =
    `
      flex
      items-center
      gap-3
      px-4
      py-3
      rounded-xl
      mb-2
      shadow-xl
      border
      border-outline-variant
      bg-surface-container-high
      text-on-background
    `;

  let icon =
    "check_circle";

  if (type === "error") {
    icon =
      "error";
  }

  toast.innerHTML = `
    <span
      class="material-symbols-outlined"
      style="
        color:
          ${
            type === "error"
              ? "var(--khz-red)"
              : "var(--khz-orange)"
          };
      "
    >
      ${icon}
    </span>

    <span
      class="
        text-sm
        font-medium
      "
    >
      ${escapeHTML(message)}
    </span>
  `;

  container.appendChild(toast);

  setTimeout(
    () => {
      toast.style.opacity =
        "0";

      toast.style.transform =
        "translateY(10px)";

      toast.style.transition =
        "all 0.25s ease";

      setTimeout(
        () => toast.remove(),
        250
      );
    },
    2400
  );
}

/* ==========================================================================
   DELEGATED ACTIONS
   ========================================================================== */

function wireActions() {
  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "[data-action]"
        );

      if (!button) {
        return;
      }

      const action =
        button.dataset.action;

      const id =
        button.dataset.id;

      const size =
        button.dataset.size ||
        "Standard";

      /* ------------------------------------------------------------
         PLUS
         ------------------------------------------------------------ */

      if (
        action ===
        "qty-plus"
      ) {

        updateQuantity(
          id,
          size,
          1
        );

        return;
      }

      /* ------------------------------------------------------------
         MINUS
         ------------------------------------------------------------ */

      if (
        action ===
        "qty-minus"
      ) {

        updateQuantity(
          id,
          size,
          -1
        );

        return;
      }

      /* ------------------------------------------------------------
         REMOVE
         ------------------------------------------------------------ */

      if (
        action ===
        "remove"
      ) {

        removeFromCart(
          id,
          size
        );

        return;
      }

      /* ------------------------------------------------------------
         SAVE FOR LATER
         ------------------------------------------------------------ */

      if (
        action ===
        "save-later"
      ) {

        saveForLater(
          id,
          size
        );

        return;
      }

      /* ------------------------------------------------------------
         MOVE TO CART
         ------------------------------------------------------------ */

      if (
        action ===
        "move-to-cart"
      ) {

        moveSavedToCart(
          id,
          size
        );

        return;
      }

      /* ------------------------------------------------------------
         RECOMMENDATION ADD
         ------------------------------------------------------------ */

      if (
        action ===
        "recommendation-add"
      ) {

        addToCart(
          id
        );

        return;
      }
    }
  );
}

/* ==========================================================================
   CLEAR CART BUTTON
   ========================================================================== */

function wireClearCart() {
  const button =
    $("#clear-cart-btn");

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    () => {

      if (!CART.length) {
        showToast(
          "Your cart is already empty.",
          "error"
        );

        return;
      }

      clearCart();
    }
  );
}

/* ==========================================================================
   COUPON BUTTON
   ========================================================================== */

function wireCoupon() {
  const button =
    $("#coupon-apply-btn");

  const input =
    $("#coupon-input");

  if (button) {
    button.addEventListener(
      "click",
      applyCoupon
    );
  }

  if (input) {
    input.addEventListener(
      "keydown",
      event => {

        if (
          event.key ===
          "Enter"
        ) {
          event.preventDefault();

          applyCoupon();
        }
      }
    );
  }
}

/* ==========================================================================
   CHECKOUT BUTTON
   ========================================================================== */

function wireCheckout() {
  const button =
    $("#checkout-btn");

  if (!button) {
    return;
  }

  button.addEventListener(
    "click",
    checkout
  );
}

/* ==========================================================================
   CONTINUE SHOPPING BUTTONS
   ========================================================================== */

function wireNavigationButtons() {
  $$(
    "[data-href]"
  ).forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const href =
          button.dataset.href;

        if (href) {
          window.location.href =
            href;
        }
      }
    );
  });
}

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */

function wireMobileMenu() {
  const button =
    $("#mobile-menu-btn");

  const nav =
    $("#mobile-nav");

  if (!button || !nav) {
    return;
  }

  button.addEventListener(
    "click",
    () => {

      nav.classList.toggle(
        "hidden"
      );
    }
  );
}

/* ==========================================================================
   ESCAPE / BACKDROP
   ========================================================================== */

function wireEscape() {
  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        const nav =
          $("#mobile-nav");

        if (nav) {
          nav.classList.add(
            "hidden"
          );
        }
      }
    }
  );
}

/* ==========================================================================
   SHOP → CART STORAGE SYNC
   ========================================================================== */

window.addEventListener(
  "storage",
  event => {

    /*
     * Shop.js changes khz_cart.
     * Reload cart immediately if another tab
     * changes it.
     */

    if (
      event.key ===
      CART_KEY
    ) {

      loadCart();

      renderCart();

      return;
    }

    /*
     * Admin changes products.
     * Reload products and update cart.
     */

    if (
      event.key ===
      PRODUCTS_KEY
    ) {

      loadProducts();

      loadCart();

      renderCart();

      showToast(
        "Product catalog updated.",
        "cart"
      );
    }
  }
);

/* ==========================================================================
   PAGE FOCUS
   ========================================================================== */

window.addEventListener(
  "focus",
  () => {

    loadProducts();
    loadCart();

    renderCart();
  }
);

/* ==========================================================================
   PAGE VISIBILITY
   ========================================================================== */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState ===
      "visible"
    ) {

      loadProducts();
      loadCart();

      renderCart();
    }
  }
);

/* ==========================================================================
   INIT
   ========================================================================== */

function initCart() {

  /*
   * IMPORTANT:
   *
   * First load the EXACT SAME
   * product database used by shop.js.
   */

  loadProducts();

  /*
   * Then load the cart IDs/quantities
   * stored by shop.js.
   */

  loadCart();

  /*
   * Wire everything.
   */

  wireActions();

  wireClearCart();

  wireCoupon();

  wireCheckout();

  wireNavigationButtons();

  wireMobileMenu();

  wireEscape();

  wireSelectAll();

  /*
   * Finally render.
   */

  renderCart();

  /*
   * Current year.
   */

  const year =
    $("#yearNow");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  console.log(
    "KHELZONE CART:",
    PRODUCTS.length,
    "products loaded."
  );

  console.log(
    "KHELZONE CART:",
    CART.length,
    "cart lines loaded."
  );
}

/* ==========================================================================
   START
   ========================================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initCart
  );

}

else {
  initCart();
}