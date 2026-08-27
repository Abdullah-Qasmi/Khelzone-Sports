/* ==========================================================================
   KHELZONE — SHOP.JS
   ADMIN → SHOP PRODUCT SYSTEM
   ========================================================================== */

"use strict";

/* ==========================================================================
   STORAGE KEYS
   ========================================================================== */

const PRODUCTS_KEY = "khz_products_v1";
const CART_KEY = "khz_cart";
const WISHLIST_KEY = "khz_wishlist";

/* ==========================================================================
   GLOBAL PRODUCT ARRAY
   ========================================================================== */

let PRODUCTS = [];

/* ==========================================================================
   BASIC HELPERS
   ========================================================================== */

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  [...context.querySelectorAll(selector)];

function money(value) {
  return "Rs. " + (Number(value) || 0).toLocaleString("en-PK");
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fallbackImgFor(sport) {
  const label = String(sport || "KHELZONE").toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500">
      <rect width="500" height="500" fill="#141414"/>
      <rect x="15" y="15" width="470" height="470"
        fill="none" stroke="#FF6A00" stroke-width="3"/>
      <text x="50%" y="47%" fill="#FF6A00"
        font-family="Arial" font-weight="800" font-size="34"
        text-anchor="middle">KHELZONE</text>
      <text x="50%" y="56%" fill="#A6A6A6"
        font-family="Arial" font-size="15"
        text-anchor="middle">${escapeHTML(label)}</text>
    </svg>
  `;

  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function safeImage(product) {
  if (product.image && String(product.image).trim()) {
    return product.image;
  }

  return fallbackImgFor(product.sport);
}

/* ==========================================================================
   LOAD ADMIN PRODUCTS
   ========================================================================== */

function loadAdminProducts() {
  try {
    const saved = localStorage.getItem(PRODUCTS_KEY);

    if (!saved) {
      PRODUCTS = [];
      return;
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      PRODUCTS = [];
      return;
    }

    PRODUCTS = parsed
      .filter(product => product)
      .map((product, index) => {
        const price = Number(product.price) || 0;

        const oldPrice =
          Number(product.oldPrice) || price;

        let discount =
          Number(product.discount) || 0;

        if (!discount && oldPrice > price) {
          discount = Math.round(
            ((oldPrice - price) / oldPrice) * 100
          );
        }

        return {
          id: product.id ?? `admin-${index}`,

          name: String(
            product.name || "KHELZONE Product"
          ),

          category: String(
            product.category || "Accessories"
          ),

          sport: String(
            product.sport ||
            product.category ||
            "Sports"
          ),

          price,

          oldPrice,

          discount,

          rating:
            Number(product.rating) || 0,

          reviews:
            Number(product.reviews) || 0,

          image:
            product.image || "",

          description: String(
            product.description ||
            "Quality sports gear from KHELZONE."
          ),

          sizes:
            Array.isArray(product.sizes)
              ? product.sizes
              : ["Standard"],

          stock: Math.max(
            0,
            Number(product.stock) || 0
          ),

          badge: String(
            product.badge || ""
          ),

          brand: String(
            product.brand || "KHELZONE"
          )
        };
      });
  }

  catch (error) {
    console.error(
      "KHELZONE product loading error:",
      error
    );

    PRODUCTS = [];
  }
}

/* ==========================================================================
   INITIAL PRODUCT LOAD
   ========================================================================== */

loadAdminProducts();

/* ==========================================================================
   STATE
   ========================================================================== */

const state = {
  search: "",
  sports: new Set(),
  types: new Set(),
  priceMax: 20000,
  priceBuckets: new Set(),
  brands: new Set(),
  sizes: new Set(),
  minRating: 0,
  sort: "featured",
  view: "grid",
  visibleCount: 12,
  cart: [],
  wishlist: []
};

/* ==========================================================================
   CART / WISHLIST STORAGE
   ========================================================================== */

function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    state.cart =
      Array.isArray(saved) ? saved : [];
  }

  catch {
    state.cart = [];
  }
}

function saveCart() {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(state.cart)
  );
}

function loadWishlist() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(WISHLIST_KEY) || "[]"
    );

    state.wishlist =
      Array.isArray(saved) ? saved : [];
  }

  catch {
    state.wishlist = [];
  }
}

function saveWishlist() {
  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(state.wishlist)
  );
}

loadCart();
loadWishlist();

/* ==========================================================================
   STAR RATING
   ========================================================================== */

function starString(rating) {
  const value = Number(rating) || 0;
  let output = "";

  for (let i = 1; i <= 5; i++) {
    output += `
      <svg
        class="rating-star ${i <= Math.round(value) ? "" : "empty"}"
        width="13"
        height="13"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"/>
      </svg>
    `;
  }

  return output;
}

/* ==========================================================================
   BADGES
   ========================================================================== */

function badgeClass(badge) {
  switch (String(badge || "").toUpperCase()) {
    case "NEW":
      return "badge-new";

    case "SALE":
      return "badge-sale";

    case "BEST SELLER":
      return "badge-best";

    case "TRENDING":
      return "badge-trend";

    case "LIMITED":
      return "badge-limited";

    case "TOP RATED":
      return "badge-top";

    default:
      return "";
  }
}

/* ==========================================================================
   FILTERING
   ========================================================================== */

function priceInBucket(price, bucket) {
  if (bucket === "u2000") {
    return price < 2000;
  }

  if (bucket === "2000-5000") {
    return price >= 2000 && price <= 5000;
  }

  if (bucket === "5000-10000") {
    return price > 5000 && price <= 10000;
  }

  if (bucket === "a10000") {
    return price > 10000;
  }

  return true;
}

function getFilteredProducts() {
  let list = PRODUCTS.filter(product => {

    /* SEARCH */

    if (state.search) {
      const query =
        state.search.toLowerCase();

      const text = `
        ${product.name}
        ${product.category}
        ${product.sport}
        ${product.description}
        ${product.brand}
      `.toLowerCase();

      if (!text.includes(query)) {
        return false;
      }
    }

    /* SPORT */

    if (
      state.sports.size &&
      !state.sports.has(product.sport)
    ) {
      return false;
    }

    /* TYPE */

    if (
      state.types.size &&
      !state.types.has(product.category)
    ) {
      return false;
    }

    /* PRICE */

    if (product.price > state.priceMax) {
      return false;
    }

    /* PRICE BUCKET */

    if (state.priceBuckets.size) {
      const valid = [...state.priceBuckets].some(
        bucket =>
          priceInBucket(product.price, bucket)
      );

      if (!valid) {
        return false;
      }
    }

    /* BRAND */

    if (
      state.brands.size &&
      !state.brands.has(product.brand)
    ) {
      return false;
    }

    /* SIZE */

    if (state.sizes.size) {
      const sizes =
        Array.isArray(product.sizes)
          ? product.sizes
          : [];

      const valid = sizes.some(
        size => state.sizes.has(size)
      );

      if (!valid) {
        return false;
      }
    }

    /* RATING */

    if (
      state.minRating &&
      product.rating < state.minRating
    ) {
      return false;
    }

    return true;
  });

  /* SORT */

  switch (state.sort) {
    case "popular":
      list.sort(
        (a, b) => b.reviews - a.reviews
      );
      break;

    case "newest":
      list.sort(
        (a, b) => Number(b.id) - Number(a.id)
      );
      break;

    case "price-low":
      list.sort(
        (a, b) => a.price - b.price
      );
      break;

    case "price-high":
      list.sort(
        (a, b) => b.price - a.price
      );
      break;

    case "rating":
      list.sort(
        (a, b) => b.rating - a.rating
      );
      break;

    default:
      break;
  }

  return list;
}

/* ==========================================================================
   PRODUCT CARD
   ========================================================================== */

function productCardHTML(product) {
  const liked = state.wishlist.some(
    id =>
      String(id) === String(product.id)
  );

  const outOfStock =
    Number(product.stock) <= 0;

  return `
    <div
      class="product-card"
      data-id="${escapeHTML(product.id)}"
    >

      <div class="product-img-wrap">

        ${
          product.badge
            ? `
              <span
                class="badge ${badgeClass(product.badge)}
                absolute top-3 left-3 z-10"
              >
                ${escapeHTML(product.badge)}
              </span>
            `
            : ""
        }

        <button
          class="
            wishlist-btn
            absolute
            top-3
            right-3
            z-10
            ${liked ? "active" : ""}
          "
          data-action="wishlist"
          data-id="${escapeHTML(product.id)}"
          aria-label="Toggle wishlist"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            stroke-width="2"
          >
            <path d="
              M20.8 4.6
              a5.5 5.5 0 00-7.8 0
              L12 5.6
              l-1-1
              a5.5 5.5 0 10-7.8 7.8
              l1 1
              L12 21
              l7.8-7.6
              1-1
              a5.5 5.5 0 000-7.8z
            "/>
          </svg>
        </button>

        <img
          src="${escapeHTML(safeImage(product))}"
          alt="${escapeHTML(product.name)}"
          loading="lazy"
          onerror="
            this.onerror=null;
            this.src='${fallbackImgFor(product.sport)}';
          "
        >

        <button
          class="
            quick-view-btn
            absolute
            w-full
            py-3
          "
          data-action="quickview"
          data-id="${escapeHTML(product.id)}"
        >
          Quick View
        </button>

      </div>

      <div class="p-4 flex flex-col flex-1">

        <p
          class="text-[11px] uppercase tracking-wide"
          style="color:var(--khz-gray)"
        >
          ${escapeHTML(product.sport)}
          ·
          ${escapeHTML(product.category)}
        </p>

        <h3
          class="
            font-bold
            text-sm
            mt-1
            mb-1
            leading-snug
          "
        >
          ${escapeHTML(product.name)}
        </h3>

        <p
          class="text-xs line-clamp-2 mb-2"
          style="color:var(--khz-gray)"
        >
          ${escapeHTML(product.description)}
        </p>

        <div
          class="
            flex
            items-center
            gap-1
            mb-2
          "
        >
          ${starString(product.rating)}

          <span
            class="text-xs ml-1"
            style="color:var(--khz-gray)"
          >
            (${Number(product.reviews) || 0})
          </span>
        </div>

        <div
          class="
            flex
            items-baseline
            gap-2
            mb-1
          "
        >
          <span class="price-current text-lg">
            ${money(product.price)}
          </span>

          ${
            product.oldPrice > product.price
              ? `
                <span class="price-old text-xs">
                  ${money(product.oldPrice)}
                </span>
              `
              : ""
          }

          ${
            product.discount > 0
              ? `
                <span
                  class="text-xs font-bold"
                  style="color:var(--khz-red)"
                >
                  -${product.discount}%
                </span>
              `
              : ""
          }
        </div>

        <p
          class="text-xs mb-3"
          style="
            color:
              ${
                outOfStock
                  ? "var(--khz-red)"
                  : "#00C2A8"
              }
          "
        >
          ${
            outOfStock
              ? "Out of Stock"
              : `In Stock (${product.stock})`
          }
        </p>

        <button
          class="
            add-cart-btn
            mt-auto
            w-full
            py-2.5
            rounded-lg
            text-xs
          "
          data-action="addcart"
          data-id="${escapeHTML(product.id)}"
          ${outOfStock ? "disabled" : ""}
        >
          ${
            outOfStock
              ? "Unavailable"
              : "Add to Cart"
          }
        </button>

      </div>

    </div>
  `;
}

/* ==========================================================================
   RENDER PRODUCTS
   ========================================================================== */

function renderProducts() {
  const grid = $("#productGrid");

  if (!grid) {
    return;
  }

  const filtered =
    getFilteredProducts();

  const visible =
    filtered.slice(
      0,
      state.visibleCount
    );

  const count =
    $("#toolbarCount");

  if (count) {
    count.textContent =
      `Showing ${visible.length} of ${filtered.length} products`;
  }

  if (state.view === "compact") {
    grid.className =
      "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";
  }

  else {
    grid.className =
      "grid grid-cols-2 lg:grid-cols-3 gap-5";
  }

  const empty =
    $("#emptyState");

  if (filtered.length === 0) {
    grid.innerHTML = "";

    if (empty) {
      empty.classList.remove("hidden");
    }
  }

  else {
    if (empty) {
      empty.classList.add("hidden");
    }

    grid.innerHTML =
      visible
        .map(productCardHTML)
        .join("");
  }

  const loadMore =
    $("#loadMoreWrap");

  if (loadMore) {
    loadMore.classList.toggle(
      "hidden",
      state.visibleCount >=
      filtered.length
    );
  }
}

/* ==========================================================================
   TRENDING
   ========================================================================== */

function renderTrending() {
  const wrap =
    $("#trendingGrid");

  if (!wrap) {
    return;
  }

  const items =
    PRODUCTS.slice(0, 6);

  if (!items.length) {
    wrap.innerHTML = `
      <div
        class="col-span-full text-center py-10"
      >
        <p
          class="text-sm"
          style="color:var(--khz-gray)"
        >
          Add products from the Admin Panel
          to see them here.
        </p>
      </div>
    `;

    return;
  }

  wrap.innerHTML =
    items
      .map(product => `
        <div
          class="product-card"
          data-id="${escapeHTML(product.id)}"
        >

          <div
            class="product-img-wrap"
            style="height:210px"
          >

            ${
              product.badge
                ? `
                  <span
                    class="
                      badge
                      ${badgeClass(product.badge)}
                      absolute
                      top-3
                      left-3
                      z-10
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
              loading="lazy"
              onerror="
                this.onerror=null;
                this.src='${fallbackImgFor(product.sport)}';
              "
            >

            <button
              class="
                quick-view-btn
                absolute
                w-full
                py-3
              "
              data-action="quickview"
              data-id="${escapeHTML(product.id)}"
            >
              Quick View
            </button>

          </div>

          <div class="p-4">

            <h3
              class="
                font-bold
                text-sm
                mb-1
              "
            >
              ${escapeHTML(product.name)}
            </h3>

            <div
              class="
                flex
                items-baseline
                gap-2
              "
            >

              <span class="price-current">
                ${money(product.price)}
              </span>

              ${
                product.oldPrice > product.price
                  ? `
                    <span class="price-old text-xs">
                      ${money(product.oldPrice)}
                    </span>
                  `
                  : ""
              }

            </div>

            <button
              class="
                add-cart-btn
                mt-3
                w-full
                py-2
                rounded-lg
                text-xs
              "
              data-action="addcart"
              data-id="${escapeHTML(product.id)}"
              ${
                Number(product.stock) <= 0
                  ? "disabled"
                  : ""
              }
            >
              ${
                Number(product.stock) <= 0
                  ? "Unavailable"
                  : "Add to Cart"
              }
            </button>

          </div>

        </div>
      `)
      .join("");
}

/* ==========================================================================
   CART
   ========================================================================== */

function addToCart(id, size, qty = 1) {
  const product =
    PRODUCTS.find(
      p =>
        String(p.id) ===
        String(id)
    );

  if (!product) {
    return;
  }

  if (Number(product.stock) <= 0) {
    showToast(
      "Product is out of stock",
      "cart"
    );

    return;
  }

  const chosenSize =
    size ||
    (
      product.sizes &&
      product.sizes.length
        ? product.sizes[0]
        : "Standard"
    );

  const existing =
    state.cart.find(
      item =>
        String(item.id) ===
          String(id) &&
        item.size ===
          chosenSize
    );

  if (existing) {
    existing.qty += qty;
  }

  else {
    state.cart.push({
      id: product.id,
      size: chosenSize,
      qty
    });
  }

  saveCart();
  renderCart();

  showToast(
    `${product.name} added to cart`,
    "cart"
  );
}

function updateCartQty(id, size, delta) {
  const item =
    state.cart.find(
      cartItem =>
        String(cartItem.id) ===
          String(id) &&
        cartItem.size ===
          size
    );

  if (!item) {
    return;
  }

  item.qty += delta;

  if (item.qty <= 0) {
    state.cart =
      state.cart.filter(
        cartItem =>
          !(
            String(cartItem.id) ===
              String(id) &&
            cartItem.size ===
              size
          )
      );
  }

  saveCart();
  renderCart();
}

function removeFromCart(id, size) {
  state.cart =
    state.cart.filter(
      item =>
        !(
          String(item.id) ===
            String(id) &&
          item.size ===
            size
        )
    );

  saveCart();
  renderCart();

  showToast(
    "Item removed from cart",
    "cart"
  );
}

/* ==========================================================================
   CART TOTALS
   ========================================================================== */

function cartTotals() {
  let subtotal = 0;

  state.cart.forEach(item => {
    const product =
      PRODUCTS.find(
        p =>
          String(p.id) ===
          String(item.id)
      );

    if (product) {
      subtotal +=
        product.price *
        Number(item.qty || 1);
    }
  });

  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 5000
        ? 0
        : 250;

  return {
    subtotal,
    shipping,
    total: subtotal + shipping
  };
}

/* ==========================================================================
   RENDER CART
   ========================================================================== */

function renderCart() {
  const count =
    state.cart.reduce(
      (sum, item) =>
        sum +
        Number(item.qty || 0),
      0
    );

  const countElement =
    $("#cartCount");

  if (countElement) {
    countElement.textContent =
      count;

    countElement.classList.toggle(
      "hidden",
      count === 0
    );
  }

  const body =
    $("#cartItems");

  if (!body) {
    return;
  }

  if (state.cart.length === 0) {
    body.innerHTML = `
      <p
        class="
          text-sm
          text-center
          py-16
        "
        style="color:var(--khz-gray)"
      >
        Your cart is empty.
        <br>
        Time to gear up!
      </p>
    `;
  }

  else {
    body.innerHTML =
      state.cart
        .map(item => {
          const product =
            PRODUCTS.find(
              p =>
                String(p.id) ===
                String(item.id)
            );

          if (!product) {
            return "";
          }

          return `
            <div
              class="
                flex
                gap-3
                py-4
                border-b
              "
              style="border-color:var(--khz-line)"
            >

              <img
                src="${escapeHTML(safeImage(product))}"
                class="
                  w-16
                  h-16
                  object-contain
                  rounded-lg
                "
                style="background:#141414"
                onerror="
                  this.onerror=null;
                  this.src='${fallbackImgFor(product.sport)}';
                "
              >

              <div class="flex-1">

                <p
                  class="
                    text-sm
                    font-bold
                    leading-snug
                  "
                >
                  ${escapeHTML(product.name)}
                </p>

                <p
                  class="
                    text-xs
                    mb-1
                  "
                  style="color:var(--khz-gray)"
                >
                  Size:
                  ${escapeHTML(item.size)}
                </p>

                <p
                  class="
                    price-current
                    text-sm
                  "
                >
                  ${money(product.price)}
                </p>

                <div
                  class="
                    flex
                    items-center
                    gap-2
                    mt-2
                  "
                >

                  <button
                    class="
                      w-6
                      h-6
                      rounded
                      border
                      text-xs
                    "
                    style="border-color:var(--khz-line)"
                    data-action="qtyminus"
                    data-id="${escapeHTML(product.id)}"
                    data-size="${escapeHTML(item.size)}"
                  >
                    −
                  </button>

                  <span
                    class="
                      text-sm
                      w-5
                      text-center
                    "
                  >
                    ${item.qty}
                  </span>

                  <button
                    class="
                      w-6
                      h-6
                      rounded
                      border
                      text-xs
                    "
                    style="border-color:var(--khz-line)"
                    data-action="qtyplus"
                    data-id="${escapeHTML(product.id)}"
                    data-size="${escapeHTML(item.size)}"
                  >
                    +
                  </button>

                  <button
                    class="
                      ml-auto
                      text-xs
                      underline
                    "
                    style="color:var(--khz-red)"
                    data-action="removecart"
                    data-id="${escapeHTML(product.id)}"
                    data-size="${escapeHTML(item.size)}"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>
          `;
        })
        .join("");
  }

  const totals =
    cartTotals();

  const subtotal =
    $("#cartSubtotal");

  if (subtotal) {
    subtotal.textContent =
      money(totals.subtotal);
  }

  const shipping =
    $("#cartShipping");

  if (shipping) {
    shipping.textContent =
      totals.shipping === 0
        ? "FREE"
        : money(totals.shipping);
  }

  const total =
    $("#cartTotal");

  if (total) {
    total.textContent =
      money(totals.total);
  }
}

/* ==========================================================================
   WISHLIST
   ========================================================================== */

function toggleWishlist(id) {
  const product =
    PRODUCTS.find(
      p =>
        String(p.id) ===
        String(id)
    );

  if (!product) {
    return;
  }

  const index =
    state.wishlist.findIndex(
      wishlistId =>
        String(wishlistId) ===
        String(id)
    );

  if (index >= 0) {
    state.wishlist.splice(
      index,
      1
    );

    showToast(
      `${product.name} removed from wishlist`,
      "wishlist"
    );
  }

  else {
    state.wishlist.push(
      product.id
    );

    showToast(
      `${product.name} added to wishlist`,
      "wishlist"
    );
  }

  saveWishlist();
  renderWishlistUI();
  renderProducts();
  renderTrending();
}

function renderWishlistUI() {
  const count =
    state.wishlist.length;

  const countElement =
    $("#wishlistCount");

  if (countElement) {
    countElement.textContent =
      count;

    countElement.classList.toggle(
      "hidden",
      count === 0
    );
  }

  const body =
    $("#wishlistItems");

  if (!body) {
    return;
  }

  if (count === 0) {
    body.innerHTML = `
      <p
        class="
          text-sm
          text-center
          py-16
        "
        style="color:var(--khz-gray)"
      >
        No saved items yet.
        <br>
        Tap the heart on any product.
      </p>
    `;

    return;
  }

  body.innerHTML =
    state.wishlist
      .map(id => {
        const product =
          PRODUCTS.find(
            p =>
              String(p.id) ===
              String(id)
          );

        if (!product) {
          return "";
        }

        return `
          <div
            class="
              flex
              gap-3
              py-4
              border-b
            "
            style="border-color:var(--khz-line)"
          >

            <img
              src="${escapeHTML(safeImage(product))}"
              class="
                w-16
                h-16
                object-contain
                rounded-lg
              "
              style="background:#141414"
            >

            <div class="flex-1">

              <p
                class="
                  text-sm
                  font-bold
                  leading-snug
                "
              >
                ${escapeHTML(product.name)}
              </p>

              <p
                class="
                  price-current
                  text-sm
                "
              >
                ${money(product.price)}
              </p>

              <div
                class="
                  flex
                  items-center
                  gap-3
                  mt-2
                "
              >

                <button
                  class="
                    text-xs
                    font-bold
                    px-3
                    py-1.5
                    rounded
                    add-cart-btn
                  "
                  data-action="addcart"
                  data-id="${escapeHTML(product.id)}"
                >
                  Add to Cart
                </button>

                <button
                  class="text-xs underline"
                  style="color:var(--khz-red)"
                  data-action="wishlist"
                  data-id="${escapeHTML(product.id)}"
                >
                  Remove
                </button>

              </div>

            </div>

          </div>
        `;
      })
      .join("");
}

/* ==========================================================================
   QUICK VIEW
   ========================================================================== */

let quickViewSize = null;

function openQuickView(id) {
  const product =
    PRODUCTS.find(
      p =>
        String(p.id) ===
        String(id)
    );

  if (!product) {
    return;
  }

  quickViewSize =
    product.sizes &&
    product.sizes.length
      ? product.sizes[0]
      : "Standard";

  const content =
    $("#qvContent");

  if (!content) {
    return;
  }

  content.innerHTML = `
    <div
      class="
        grid
        md:grid-cols-2
        gap-0
      "
    >

      <div
        class="
          p-6
          flex
          items-center
          justify-center
        "
        style="background:#141414"
      >

        <img
          src="${escapeHTML(safeImage(product))}"
          class="max-h-80 object-contain"
          onerror="
            this.onerror=null;
            this.src='${fallbackImgFor(product.sport)}';
          "
        >

      </div>

      <div class="p-6 md:p-8">

        <p
          class="
            text-xs
            uppercase
            tracking-wide
            mb-1
          "
          style="color:var(--khz-orange)"
        >
          ${escapeHTML(product.sport)}
          ·
          ${escapeHTML(product.category)}
        </p>

        <h2
          class="
            font-display
            text-2xl
            mb-2
          "
        >
          ${escapeHTML(product.name)}
        </h2>

        <div
          class="
            flex
            items-center
            gap-2
            mb-3
          "
        >
          ${starString(product.rating)}

          <span
            class="text-xs"
            style="color:var(--khz-gray)"
          >
            ${product.rating || 0}
            (${product.reviews || 0} reviews)
          </span>
        </div>

        <div
          class="
            flex
            items-baseline
            gap-3
            mb-4
          "
        >

          <span
            class="
              price-current
              text-2xl
            "
          >
            ${money(product.price)}
          </span>

          ${
            product.oldPrice >
            product.price
              ? `
                <span class="price-old">
                  ${money(product.oldPrice)}
                </span>
              `
              : ""
          }

          ${
            product.discount > 0
              ? `
                <span
                  class="
                    badge
                    badge-sale
                  "
                >
                  -${product.discount}%
                </span>
              `
              : ""
          }

        </div>

        <p
          class="
            text-sm
            mb-5
          "
          style="color:var(--khz-gray)"
        >
          ${escapeHTML(product.description)}
        </p>

        <p
          class="
            text-xs
            font-bold
            uppercase
            mb-2
          "
          style="color:var(--khz-gray)"
        >
          Select Size
        </p>

        <div
          class="
            flex
            flex-wrap
            gap-2
            mb-5
          "
          id="qvSizes"
        >

          ${
            (
              product.sizes &&
              product.sizes.length
                ? product.sizes
                : ["Standard"]
            )
              .map(
                size => `
                  <button
                    class="
                      size-pill
                      px-4
                      py-2
                      rounded-lg
                      text-xs
                      ${
                        size ===
                        quickViewSize
                          ? "selected"
                          : ""
                      }
                    "
                    data-size="${escapeHTML(size)}"
                  >
                    ${escapeHTML(size)}
                  </button>
                `
              )
              .join("")
          }

        </div>

        <p
          class="
            text-xs
            font-bold
            uppercase
            mb-2
          "
          style="color:var(--khz-gray)"
        >
          Quantity
        </p>

        <div
          class="
            flex
            items-center
            gap-3
            mb-6
          "
        >

          <button
            id="qvQtyMinus"
            class="
              w-8
              h-8
              rounded
              border
            "
            style="border-color:var(--khz-line)"
          >
            −
          </button>

          <span
            id="qvQty"
            class="w-6 text-center"
          >
            1
          </span>

          <button
            id="qvQtyPlus"
            class="
              w-8
              h-8
              rounded
              border
            "
            style="border-color:var(--khz-line)"
          >
            +
          </button>

          <span
            class="
              text-xs
              ml-auto
            "
            style="
              color:
                ${
                  Number(product.stock) > 0
                    ? "#00C2A8"
                    : "var(--khz-red)"
                }
            "
          >
            ${
              Number(product.stock) > 0
                ? `In Stock (${product.stock})`
                : "Out of Stock"
            }
          </span>

        </div>

        <div class="flex gap-3">

          <button
            id="qvAddCart"
            class="
              add-cart-btn
              flex-1
              py-3
              rounded-lg
              text-sm
            "
            ${
              Number(product.stock) <= 0
                ? "disabled"
                : ""
            }
          >
            Add to Cart
          </button>

          <button
            id="qvWishlist"
            class="
              wishlist-btn
              ${
                state.wishlist.some(
                  id =>
                    String(id) ===
                    String(product.id)
                )
                  ? "active"
                  : ""
              }
            "
            style="
              width:48px;
              height:48px;
              position:static;
            "
          >
            ♥
          </button>

        </div>

      </div>

    </div>
  `;

  let quantity = 1;

  $("#qvQtyPlus").onclick =
    () => {
      quantity++;

      $("#qvQty").textContent =
        quantity;
    };

  $("#qvQtyMinus").onclick =
    () => {
      if (quantity > 1) {
        quantity--;

        $("#qvQty").textContent =
          quantity;
      }
    };

  $$("#qvSizes .size-pill")
    .forEach(button => {
      button.onclick = () => {
        quickViewSize =
          button.dataset.size;

        $$("#qvSizes .size-pill")
          .forEach(item =>
            item.classList.remove(
              "selected"
            )
          );

        button.classList.add(
          "selected"
        );
      };
    });

  $("#qvAddCart").onclick =
    () => {
      addToCart(
        product.id,
        quickViewSize,
        quantity
      );
    };

  $("#qvWishlist").onclick =
    () => {
      toggleWishlist(
        product.id
      );

      $("#qvWishlist")
        .classList.toggle(
          "active"
        );
    };

  const modal =
    $("#quickViewModal");

  if (modal) {
    modal.classList.remove(
      "hidden"
    );

    document.body.style.overflow =
      "hidden";
  }
}

function closeQuickView() {
  const modal =
    $("#quickViewModal");

  if (modal) {
    modal.classList.add(
      "hidden"
    );
  }

  document.body.style.overflow =
    "";
}

/* ==========================================================================
   TOAST
   ========================================================================== */

function showToast(
  message,
  type = "cart"
) {
  const container =
    $("#toastContainer");

  if (!container) {
    return;
  }

  const el =
    document.createElement(
      "div"
    );

  el.className =
    "toast flex items-center gap-3 px-4 py-3 rounded-xl mb-2";

  const icon =
    type === "wishlist"
      ? `
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="var(--khz-red)"
        >
          <path d="
            M20.8 4.6
            a5.5 5.5 0 00-7.8 0
            L12 5.6
            l-1-1
            a5.5 5.5 0 10-7.8 7.8
            l1 1
            L12 21
            l7.8-7.6
            1-1
            a5.5 5.5 0 000-7.8z
          "/>
        </svg>
      `
      : `
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--khz-orange)"
          stroke-width="2"
        >
          <path d="M20 6L9 17l-5-5"/>
        </svg>
      `;

  el.innerHTML = `
    ${icon}
    <span class="text-sm font-medium">
      ${escapeHTML(message)}
    </span>
  `;

  container.appendChild(el);

  setTimeout(() => {
    el.classList.add("leaving");

    setTimeout(
      () => el.remove(),
      260
    );
  }, 2400);
}

/* ==========================================================================
   FILTER UI
   ========================================================================== */

function wireFilters() {

  $$('[data-filter="sport"]')
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          if (checkbox.checked) {
            state.sports.add(
              checkbox.value
            );
          }

          else {
            state.sports.delete(
              checkbox.value
            );
          }

          state.visibleCount =
            12;

          syncCategorySelection();
          renderProducts();
        }
      );
    });

  $$('[data-filter="type"]')
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          if (checkbox.checked) {
            state.types.add(
              checkbox.value
            );
          }

          else {
            state.types.delete(
              checkbox.value
            );
          }

          state.visibleCount =
            12;

          renderProducts();
        }
      );
    });

  $$('[data-filter="pricebucket"]')
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          if (checkbox.checked) {
            state.priceBuckets.add(
              checkbox.value
            );
          }

          else {
            state.priceBuckets.delete(
              checkbox.value
            );
          }

          state.visibleCount =
            12;

          renderProducts();
        }
      );
    });

  $$('[data-filter="brand"]')
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          if (checkbox.checked) {
            state.brands.add(
              checkbox.value
            );
          }

          else {
            state.brands.delete(
              checkbox.value
            );
          }

          state.visibleCount =
            12;

          renderProducts();
        }
      );
    });

  $$('[data-filter="size"]')
    .forEach(checkbox => {

      checkbox.addEventListener(
        "change",
        () => {

          if (checkbox.checked) {
            state.sizes.add(
              checkbox.value
            );
          }

          else {
            state.sizes.delete(
              checkbox.value
            );
          }

          state.visibleCount =
            12;

          renderProducts();
        }
      );
    });

  $$('[data-filter="rating"]')
    .forEach(radio => {

      radio.addEventListener(
        "change",
        () => {

          state.minRating =
            parseFloat(
              radio.value
            ) || 0;

          state.visibleCount =
            12;

          renderProducts();
        }
      );
    });

  const priceSlider =
    $("#priceRange");

  if (priceSlider) {

    priceSlider.addEventListener(
      "input",
      () => {

        state.priceMax =
          parseInt(
            priceSlider.value,
            10
          ) || 20000;

        const label =
          $("#priceRangeLabel");

        if (label) {
          label.textContent =
            money(
              state.priceMax
            );
        }

        state.visibleCount =
          12;

        renderProducts();
      }
    );
  }

  const sort =
    $("#sortSelect");

  if (sort) {

    sort.addEventListener(
      "change",
      event => {

        state.sort =
          event.target.value;

        renderProducts();
      }
    );
  }

  const gridButton =
    $("#viewGridBtn");

  if (gridButton) {

    gridButton.addEventListener(
      "click",
      () =>
        setView("grid")
    );
  }

  const compactButton =
    $("#viewCompactBtn");

  if (compactButton) {

    compactButton.addEventListener(
      "click",
      () =>
        setView("compact")
    );
  }

  const clearButton =
    $("#clearFiltersBtn");

  if (clearButton) {
    clearButton.addEventListener(
      "click",
      clearAllFilters
    );
  }

  const clearButton2 =
    $("#clearFiltersBtn2");

  if (clearButton2) {
    clearButton2.addEventListener(
      "click",
      clearAllFilters
    );
  }

  const loadMore =
    $("#loadMoreBtn");

  if (loadMore) {

    loadMore.addEventListener(
      "click",
      () => {

        state.visibleCount +=
          9;

        renderProducts();
      }
    );
  }
}

/* ==========================================================================
   VIEW
   ========================================================================== */

function setView(view) {
  state.view =
    view;

  const gridButton =
    $("#viewGridBtn");

  const compactButton =
    $("#viewCompactBtn");

  if (gridButton) {
    gridButton.classList.toggle(
      "bg-white/10",
      view === "grid"
    );
  }

  if (compactButton) {
    compactButton.classList.toggle(
      "bg-white/10",
      view === "compact"
    );
  }

  renderProducts();
}

/* ==========================================================================
   CLEAR FILTERS
   ========================================================================== */

function clearAllFilters() {
  state.search = "";

  state.sports.clear();
  state.types.clear();
  state.brands.clear();
  state.sizes.clear();
  state.priceBuckets.clear();

  state.priceMax =
    20000;

  state.minRating =
    0;

  state.visibleCount =
    12;

  $$(
    'input[type="checkbox"]'
  ).forEach(
    checkbox =>
      checkbox.checked =
        false
  );

  $$(
    'input[type="radio"][data-filter="rating"]'
  ).forEach(
    radio =>
      radio.checked =
        false
  );

  const priceRange =
    $("#priceRange");

  if (priceRange) {
    priceRange.value =
      20000;
  }

  const priceLabel =
    $("#priceRangeLabel");

  if (priceLabel) {
    priceLabel.textContent =
      money(20000);
  }

  const search =
    $("#searchInput");

  if (search) {
    search.value =
      "";
  }

  const mobileSearch =
    $("#searchInputMobile");

  if (mobileSearch) {
    mobileSearch.value =
      "";
  }

  syncCategorySelection();
  renderProducts();
}

/* ==========================================================================
   CATEGORY CARDS
   ========================================================================== */

function syncCategorySelection() {
  $$(".cat-card")
    .forEach(card => {

      card.classList.toggle(
        "selected",
        state.sports.has(
          card.dataset.sport
        )
      );
    });
}

function wireCategoryCards() {
  $$(".cat-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const sport =
            card.dataset.sport;

          if (
            state.sports.has(
              sport
            )
          ) {
            state.sports.delete(
              sport
            );
          }

          else {
            state.sports.add(
              sport
            );
          }

          syncCategorySelection();

          $$(
            `[data-filter="sport"][value="${sport}"]`
          ).forEach(
            checkbox =>
              checkbox.checked =
                state.sports.has(
                  sport
                )
          );

          state.visibleCount =
            12;

          renderProducts();

          const shopGrid =
            $("#shopGrid");

          if (shopGrid) {
            shopGrid.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });
          }
        }
      );
    });
}

/* ==========================================================================
   SEARCH
   ========================================================================== */

function wireSearch() {
  const input =
    $("#searchInput");

  const clearButton =
    $("#searchClearBtn");

  if (!input) {
    return;
  }

  input.addEventListener(
    "input",
    () => {

      state.search =
        input.value.trim();

      state.visibleCount =
        12;

      if (clearButton) {
        clearButton.classList.toggle(
          "hidden",
          state.search === ""
        );
      }

      renderProducts();
    }
  );

  if (clearButton) {

    clearButton.addEventListener(
      "click",
      () => {

        input.value =
          "";

        state.search =
          "";

        clearButton.classList.add(
          "hidden"
        );

        renderProducts();
      }
    );
  }
}

/* ==========================================================================
   PRODUCT ACTIONS
   ========================================================================== */

function wireDelegatedActions() {
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

      if (action === "addcart") {

        addToCart(id);
      }

      else if (
        action === "wishlist"
      ) {

        toggleWishlist(id);
      }

      else if (
        action === "quickview"
      ) {

        openQuickView(id);
      }

      else if (
        action === "qtyplus"
      ) {

        updateCartQty(
          id,
          button.dataset.size,
          1
        );
      }

      else if (
        action === "qtyminus"
      ) {

        updateCartQty(
          id,
          button.dataset.size,
          -1
        );
      }

      else if (
        action === "removecart"
      ) {

        removeFromCart(
          id,
          button.dataset.size
        );
      }
    }
  );
}

/* ==========================================================================
   DRAWERS
   ========================================================================== */

function wireDrawers() {
  const cartDrawer =
    $("#cartDrawer");

  const wishlistDrawer =
    $("#wishlistDrawer");

  const mobileFilter =
    $("#mobileFilterDrawer");

  const mobileNav =
    $("#mobileNav");

  const backdrop =
    $("#drawerBackdrop");

  function openDrawer(drawer) {
    if (!drawer) {
      return;
    }

    drawer.classList.remove(
      "closed"
    );

    if (backdrop) {
      backdrop.classList.remove(
        "hidden"
      );
    }

    document.body.style.overflow =
      "hidden";
  }

  function closeAllDrawers() {
    [
      cartDrawer,
      wishlistDrawer,
      mobileFilter
    ].forEach(drawer => {

      if (drawer) {
        drawer.classList.add(
          "closed"
        );
      }
    });

    if (mobileNav) {
      mobileNav.classList.add(
        "hidden"
      );
    }

    if (backdrop) {
      backdrop.classList.add(
        "hidden"
      );
    }

    document.body.style.overflow =
      "";
  }

  const cartButton =
    $("#cartIconBtn");

  if (cartButton) {
    cartButton.addEventListener(
      "click",
      () =>
        openDrawer(
          cartDrawer
        )
    );
  }

  const cartMobile =
    $("#cartIconBtnMobile");

  if (cartMobile) {
    cartMobile.addEventListener(
      "click",
      () =>
        openDrawer(
          cartDrawer
        )
    );
  }

  const closeCart =
    $("#closeCartBtn");

  if (closeCart) {
    closeCart.addEventListener(
      "click",
      closeAllDrawers
    );
  }

  const wishlistButton =
    $("#wishlistIconBtn");

  if (wishlistButton) {
    wishlistButton.addEventListener(
      "click",
      () =>
        openDrawer(
          wishlistDrawer
        )
    );
  }

  const closeWishlist =
    $("#closeWishlistBtn");

  if (closeWishlist) {
    closeWishlist.addEventListener(
      "click",
      closeAllDrawers
    );
  }

  const filterButton =
    $("#mobileFilterBtn");

  if (filterButton) {
    filterButton.addEventListener(
      "click",
      () =>
        openDrawer(
          mobileFilter
        )
    );
  }

  const closeFilter =
    $("#closeMobileFilterBtn");

  if (closeFilter) {
    closeFilter.addEventListener(
      "click",
      closeAllDrawers
    );
  }

  const applyFilter =
    $("#applyMobileFilterBtn");

  if (applyFilter) {
    applyFilter.addEventListener(
      "click",
      closeAllDrawers
    );
  }

  const menuButton =
    $("#mobileMenuBtn");

  if (menuButton) {
    menuButton.addEventListener(
      "click",
      () => {

        if (mobileNav) {
          mobileNav.classList.remove(
            "hidden"
          );
        }

        if (backdrop) {
          backdrop.classList.remove(
            "hidden"
          );
        }

        document.body.style.overflow =
          "hidden";
      }
    );
  }

  const closeMenu =
    $("#closeMobileNavBtn");

  if (closeMenu) {
    closeMenu.addEventListener(
      "click",
      closeAllDrawers
    );
  }

  if (backdrop) {
    backdrop.addEventListener(
      "click",
      closeAllDrawers
    );
  }

  /* ================================================================
     VIEW CART → cart.html
     ================================================================ */

  const viewCart =
    $("#viewCartBtn");

  if (viewCart) {
    viewCart.addEventListener(
      "click",
      () => {
        window.location.href =
          "cart.html";
      }
    );
  }

  /* ================================================================
     CHECKOUT
     ================================================================ */

  const checkout =
    $("#checkoutBtn");

  if (checkout) {
    checkout.addEventListener(
      "click",
      () => {

        if (
          state.cart.length === 0
        ) {
          showToast(
            "Your cart is empty",
            "cart"
          );

          return;
        }

        showToast(
          "Checkout is a demo — order not placed",
          "cart"
        );
      }
    );
  }

  const closeQuick =
    $("#closeQuickViewBtn");

  if (closeQuick) {
    closeQuick.addEventListener(
      "click",
      closeQuickView
    );
  }

  const modal =
    $("#quickViewModal");

  if (modal) {
    modal.addEventListener(
      "click",
      event => {

        if (
          event.target ===
          modal
        ) {
          closeQuickView();
        }
      }
    );
  }

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeQuickView();
        closeAllDrawers();
      }
    }
  );
}

/* ==========================================================================
   NEWSLETTER
   ========================================================================== */

function wireNewsletter() {
  const form =
    $("#newsletterForm");

  if (!form) {
    return;
  }

  form.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const email =
        $("#newsletterEmail");

      if (
        !email ||
        !email.value.trim()
      ) {
        return;
      }

      form.classList.add(
        "hidden"
      );

      const success =
        $("#newsletterSuccess");

      if (success) {
        success.classList.remove(
          "hidden"
        );
      }
    }
  );
}

/* ==========================================================================
   URL SPORT FILTER
   ========================================================================== */

function applyUrlSportFilter() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const sport =
    params.get("sport");

  if (!sport) {
    return;
  }

  const match =
    [
      "Football",
      "Cricket",
      "Tennis",
      "Basketball",
      "Volleyball",
      "Badminton",
      "Fitness",
      "Running",
      "Boxing",
      "Hockey",
      "Accessories"
    ].find(
      item =>
        item.toLowerCase() ===
        sport.toLowerCase()
    );

  if (!match) {
    return;
  }

  state.sports.add(
    match
  );

  $$(
    `[data-filter="sport"][value="${match}"]`
  ).forEach(
    checkbox =>
      checkbox.checked =
        true
  );

  syncCategorySelection();
}

/* ==========================================================================
   ADMIN → SHOP LIVE UPDATE
   ========================================================================== */

window.addEventListener(
  "storage",
  event => {

    if (
      event.key !==
      PRODUCTS_KEY
    ) {
      return;
    }

    console.log(
      "KHELZONE: Admin catalog updated."
    );

    loadAdminProducts();

    renderProducts();
    renderTrending();
    renderCart();
    renderWishlistUI();
  }
);

/* ==========================================================================
   WHEN SHOP TAB GETS FOCUS, RELOAD ADMIN PRODUCTS
   ========================================================================== */

window.addEventListener(
  "focus",
  () => {

    loadAdminProducts();

    renderProducts();
    renderTrending();
    renderCart();
    renderWishlistUI();
  }
);

/* ==========================================================================
   INIT
   ========================================================================== */

function init() {
  loadAdminProducts();
  loadCart();
  loadWishlist();

  wireFilters();
  wireSearch();
  wireCategoryCards();
  wireDelegatedActions();
  wireDrawers();
  wireNewsletter();

  applyUrlSportFilter();

  renderTrending();
  renderProducts();
  renderCart();
  renderWishlistUI();

  const priceLabel =
    $("#priceRangeLabel");

  if (priceLabel) {
    priceLabel.textContent =
      money(
        state.priceMax
      );
  }

  const year =
    $("#yearNow");

  if (year) {
    year.textContent =
      new Date().getFullYear();
  }

  console.log(
    `KHELZONE: ${PRODUCTS.length} admin products loaded.`
  );

  if (
    new URLSearchParams(
      window.location.search
    ).get("sport")
  ) {

    requestAnimationFrame(
      () => {

        const shopGrid =
          $("#shopGrid");

        if (shopGrid) {
          shopGrid.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      }
    );
  }
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
    init
  );

}

else {
  init();
}