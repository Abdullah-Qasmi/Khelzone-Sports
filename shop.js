/* ==========================================================================
   KHELZONE SHOP — JAVASCRIPT
   Rebuilt from the original file:
   - One single premium product-card renderer (used by the grid) instead of
     two competing renderers.
   - Navbar Wishlist / Cart buttons open the existing #wishlistDrawer /
     #cartDrawer using the "open" class shop.css expects.
   - Cart/Wishlist counters fixed.
   - Mobile menu + mobile search wired to the IDs that actually exist in
     shop.html.
   - Supabase config, filtering, sorting, search and the cart/wishlist data
     model are unchanged.

   NEW IN THIS VERSION:
   - "Trending Gear" grid/rendering removed (Trending Sports strip is
     untouched — that's a different, separate section).
   - Quick View rebuilt into a full product-details modal: specifications
     table, return & warranty, ratings & reviews (with submission +
     validation), and seller/shop information — all loaded dynamically
     from Supabase, nothing hardcoded.
   ========================================================================== */

"use strict";


/* ==========================================================================
   SUPABASE CONFIGURATION
   ========================================================================== */

const SUPABASE_URL =
  "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";

let supabaseClient = null;

if (window.supabase) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
} else {
  console.error("Supabase library not loaded.");
}


/* ==========================================================================
   HELPERS
   ========================================================================== */

const $ = (selector, context = document) =>
  context.querySelector(selector);

const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

function money(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-PK")}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

/* Star rating string, e.g. 4.6 -> "★★★★★" with the 5th star muted via CSS */
function starString(rating) {
  const rounded = Math.round(Number(rating) || 0);

  return "★★★★★"
    .split("")
    .map((star, index) => (index < rounded ? "★" : "☆"))
    .join("");
}

/* Fallback image (used when a product has no image, or fails to load) */
const KHELZONE_FALLBACK_IMAGE =
  "https://placehold.co/600x600/111111/ffffff?text=KHELZONE";

const VOLLEYBALL_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=85";

const KHELZONE_SHOP_FALLBACK_LOGO =
  "https://placehold.co/120x120/1a1d23/ff5a00?text=KZ";

function productImageFor(product) {
  const sport = String(product?.sport || product?.category || "")
    .trim()
    .toLowerCase();

  if (product?.image && String(product.image).trim()) {
    return product.image;
  }

  if (sport.includes("volleyball")) {
    return VOLLEYBALL_FALLBACK_IMAGE;
  }

  return KHELZONE_FALLBACK_IMAGE;
}


/* ==========================================================================
   APP STATE
   ========================================================================== */

const state = {
  products: [],
  cart: [],
  wishlist: [],

  search: "",

  sports: new Set(),
  types: new Set(),
  brands: new Set(),
  sizes: new Set(),
  priceBuckets: new Set(),

  minRating: 0,
  priceMax: 10000,

  sort: "featured",
  visibleCount: 12,

  /* Quick View runtime cache — cleared every time a new product opens */
  quickView: {
    productId: null,
    specifications: [],
    reviews: [],
    seller: null,
    currentUser: null
  }
};

const CART_STORAGE_KEY = "khz_cart";
const WISHLIST_STORAGE_KEY = "khz_wishlist";


/* ==========================================================================
   CART / WISHLIST STORAGE
   ========================================================================== */

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    state.cart = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load cart:", error);
    state.cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.cart));
  } catch (error) {
    console.error("Could not save cart:", error);
  }
}

function loadWishlist() {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    state.wishlist = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load wishlist:", error);
    state.wishlist = [];
  }
}

function saveWishlist() {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(state.wishlist));
  } catch (error) {
    console.error("Could not save wishlist:", error);
  }
}


/* ==========================================================================
   PRODUCT NORMALIZATION
   ========================================================================== */

function normalizeProduct(product) {
  if (!product) {
    return null;
  }

  let sizes = safeArray(product.sizes);
  if (!sizes.length) sizes = safeArray(product.size);
  if (!sizes.length) sizes = ["Standard"];

  return {
    id: product.id,

    name: product.name || product.title || "KHELZONE Product",
    description: product.description || "",

    price: Number(product.price) || 0,
    oldPrice: Number(product.old_price || product.oldPrice || 0),

    image: product.image_url || product.image || product.thumbnail || "",
    images: safeArray(product.images),

    sport: product.sport || product.category || "",
    category: product.category || product.sport || "",
    type: product.type || product.product_type || "",
    brand: product.brand || "",

    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),

    sizes,

    featured: Boolean(product.featured || product.is_featured),
    trending: Boolean(product.trending || product.is_trending),

    stock: Number(product.stock ?? 999),
    active: product.is_active !== false,

    /* Optional manual override: if the row in Supabase has a "badge"
       column, honour it verbatim instead of the auto-derived badge. */
    badge: product.badge || "",

    /* NEW: seller-provided policy text, shown verbatim in Quick View */
    returnPolicy: product.return_policy || product.returnPolicy || "",
    warranty: product.warranty || "",

    sellerId: product.seller_id || product.sellerId || null,

    createdAt: product.created_at || product.createdAt || null
  };
}


/* ==========================================================================
   LOAD PRODUCTS FROM SUPABASE
   ========================================================================== */

async function loadProductsFromSupabase() {
  if (!supabaseClient) {
    console.error("Supabase client unavailable.");
    state.products = [];
    return;
  }

  try {
    console.log("Loading products from Supabase...");

    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    state.products = (data || [])
      .filter(product => product.is_active !== false)
      .map(normalizeProduct)
      .filter(Boolean);

    console.log(`${state.products.length} products loaded.`);
  } catch (error) {
    console.error("Error loading products:", error);
    state.products = [];
  }
}


/* ==========================================================================
   PRODUCT HELPERS
   ========================================================================== */

function findProduct(id) {
  return state.products.find(
    product => String(product.id) === String(id)
  );
}

function isInWishlist(id) {
  return state.wishlist.some(
    item => String(typeof item === "object" ? item.id : item) === String(id)
  );
}

/* Priority-ordered badge: OUT OF STOCK > SALE > NEW > TRENDING >
   BEST SELLER > TOP RATED. A manual `badge` column always wins. */
function badgeFor(product) {
  if (product.badge) return product.badge.toUpperCase();

  if (Number(product.stock) <= 0) return "OUT OF STOCK";

  if (product.oldPrice > product.price && product.oldPrice > 0) return "SALE";

  if (product.createdAt) {
    const ageDays =
      (Date.now() - new Date(product.createdAt).getTime()) / 86400000;
    if (ageDays >= 0 && ageDays <= 14) return "NEW";
  }

  if (product.trending) return "TRENDING";
  if (product.featured) return "BEST SELLER";

  if (product.rating >= 4.7 && product.reviews >= 10) return "TOP RATED";

  return "";
}

function stockStatus(product) {
  const stock = Number(product.stock);

  if (stock <= 0) {
    return { label: "OUT OF STOCK", className: "out-stock" };
  }

  if (stock <= 5) {
    return { label: "LOW STOCK", className: "low-stock" };
  }

  return { label: "IN STOCK", className: "in-stock" };
}


/* ==========================================================================
   FILTER PRODUCTS
   ========================================================================== */

function getFilteredProducts() {
  let products = [...state.products];

  /* ================================================================
     SEARCH
     ================================================================ */
  if (state.search) {
    const query = state.search.toLowerCase();

    products = products.filter(product => {
      const searchable = [
        product.name,
        product.description,
        product.sport,
        product.category,
        product.type,
        product.brand
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }


  /* ================================================================
     SPORTS
     ================================================================ */
  if (state.sports.size) {
    products = products.filter(product => {
      const sport = String(
        product.sport || product.category || ""
      )
        .trim()
        .toLowerCase();

      return [...state.sports].some(
        selected =>
          sport === String(selected).trim().toLowerCase()
      );
    });
  }


  /* ================================================================
     TYPES
     ================================================================ */
  if (state.types.size) {
    products = products.filter(product =>
      [...state.types].some(
        type =>
          String(product.type || "").toLowerCase() ===
          String(type).toLowerCase()
      )
    );
  }


  /* ================================================================
     BRANDS
     ================================================================ */
  if (state.brands.size) {
    products = products.filter(product =>
      [...state.brands].some(
        brand =>
          String(product.brand || "").toLowerCase() ===
          String(brand).toLowerCase()
      )
    );
  }


  /* ================================================================
     SIZES
     ================================================================ */
  if (state.sizes.size) {
    products = products.filter(product =>
      product.sizes.some(size =>
        state.sizes.has(size)
      )
    );
  }


  /* ================================================================
     PRICE FILTER
     Rs. 500 → Rs. 10,000
     
     Selected price is the MAXIMUM price.

     Example:
     Rs. 5,000 selected
     → Rs. 500
     → Rs. 1,000
     → Rs. 3,500
     → Rs. 5,000

     Rs. 5,000 se upar products nahi ayenge.
     ================================================================ */
  if (
    state.priceMax !== null &&
    state.priceMax !== undefined
  ) {
    const maxPrice = Number(state.priceMax);

    products = products.filter(product => {
      const price = Number(product.price);

      return (
        Number.isFinite(price) &&
        price >= 10 &&
        price <= maxPrice
      );
    });
  }


  /* ================================================================
     MINIMUM RATING
     ================================================================ */
  if (state.minRating > 0) {
    products = products.filter(
      product =>
        Number(product.rating || 0) >= state.minRating
    );
  }


  /* ================================================================
     PRICE BUCKETS
     ================================================================ */
  if (state.priceBuckets.size) {
    products = products.filter(product => {
      const price = Number(product.price);

      return [...state.priceBuckets].some(bucket => {

        if (bucket === "under5000") {
          return price < 5000;
        }

        if (bucket === "5000to10000") {
          return price >= 5000 && price <= 10000;
        }

        if (bucket === "10000to15000") {
          return price >= 10000 && price <= 15000;
        }

        if (bucket === "above15000") {
          return price > 15000;
        }

        return true;
      });
    });
  }


  /* ================================================================
     SORTING
     ================================================================ */
  if (state.sort === "price-low") {

    products.sort((a, b) =>
      Number(a.price || 0) -
      Number(b.price || 0)
    );

  } else if (state.sort === "price-high") {

    products.sort((a, b) =>
      Number(b.price || 0) -
      Number(a.price || 0)
    );

  } else if (state.sort === "rating") {

    products.sort((a, b) =>
      Number(b.rating || 0) -
      Number(a.rating || 0)
    );

  } else if (state.sort === "newest") {

    products.reverse();
  }


  return products;
}




/* ==========================================================================
   PRODUCT CARD — SINGLE PREMIUM RENDERER
   Uses the BEM classes defined in the "PRODUCT CARD" section of shop.css.
   Required hooks preserved exactly: data-action="wishlist|quickview|addcart"
   and data-id="PRODUCT_ID".
   ========================================================================== */

function productCardHTML(product) {
  const image = productImageFor(product);
  const wishlistActive = isInWishlist(product.id);
  const badge = badgeFor(product);
  const stock = stockStatus(product);
  const outOfStock = stock.className === "out-stock";
  const rating = Number(product.rating || 0);

  const badgeClass =
    badge === "OUT OF STOCK"
      ? "product-card__badge product-card__badge--muted"
      : badge === "SALE"
      ? "product-card__badge product-card__badge--sale"
      : "product-card__badge";

  return `
    <article class="product-card" data-product-id="${escapeHTML(product.id)}">

      <div class="product-card__image-wrap">

        ${
          badge
            ? `<span class="${badgeClass}">${escapeHTML(badge)}</span>`
            : ""
        }

        <button
          type="button"
          class="product-card__wishlist ${wishlistActive ? "active" : ""}"
          data-action="wishlist"
          data-id="${escapeHTML(product.id)}"
          aria-label="${wishlistActive ? "Remove" : "Add"} ${escapeHTML(product.name)} ${wishlistActive ? "from" : "to"} wishlist"
          aria-pressed="${wishlistActive ? "true" : "false"}"
        >${wishlistActive ? "♥" : "♡"}</button>

        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
          class="product-card__image"
          loading="lazy"
          onerror="this.onerror=null;this.src='${KHELZONE_FALLBACK_IMAGE}';"
        >

        <div class="product-card__quick-wrap">
          <button
            type="button"
            class="product-card__quick"
            data-action="quickview"
            data-id="${escapeHTML(product.id)}"
          >Quick View</button>
        </div>

      </div>

      <div class="product-card__content">

        <p class="product-card__sport">
          ${escapeHTML(product.sport || product.category || "Sports")}
        </p>

        <h3 class="product-card__title">${escapeHTML(product.name)}</h3>

        ${
          product.description
            ? `<p class="product-card__description">${escapeHTML(product.description)}</p>`
            : ""
        }

        <div class="product-card__rating">
          ${starString(rating)}
          <span>${rating.toFixed(1)} (${Number(product.reviews) || 0})</span>
        </div>

        <div class="product-card__price">
          <strong>${money(product.price)}</strong>
          ${
            product.oldPrice > product.price
              ? `<del>${money(product.oldPrice)}</del>`
              : ""
          }
        </div>

        <p class="product-card__stock ${stock.className}">${stock.label}</p>

        <button
          type="button"
          class="product-card__cart"
          data-action="addcart"
          data-id="${escapeHTML(product.id)}"
          ${outOfStock ? "disabled" : ""}
        >${outOfStock ? "OUT OF STOCK" : "ADD TO CART"}</button>

      </div>

    </article>
  `;
}


/* ==========================================================================
   RENDER PRODUCTS
   ========================================================================== */

function renderProducts() {
  const grid = $("#productGrid") || $("#productsGrid") || $(".product-grid");
  if (!grid) {
    console.warn("Product grid not found.");
    return;
  }

  const filtered = getFilteredProducts();
  const visible = filtered.slice(0, state.visibleCount);

  const count = $("#productCount") || $("#toolbarCount") || $("#resultCount");
  if (count) {
    count.textContent = `${filtered.length} product${filtered.length === 1 ? "" : "s"}`;
  }

  const emptyState = $("#emptyState");

  if (!visible.length) {
    grid.innerHTML = "";
    if (emptyState) emptyState.classList.remove("hidden");
  } else {
    if (emptyState) emptyState.classList.add("hidden");
    grid.innerHTML = visible.map(productCardHTML).join("");
  }

  const loadMore = $("#loadMoreBtn");
  if (loadMore) {
    loadMore.classList.toggle("hidden", filtered.length <= state.visibleCount);
  }
}


/* ==========================================================================
   CART SYSTEM
   ========================================================================== */

function getCartItemCount() {
  return state.cart.reduce(
    (total, item) => total + Number(item.qty || item.quantity || 1),
    0
  );
}

function getCartTotal() {
  return state.cart.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.qty || item.quantity || 1),
    0
  );
}

function updateCartBadge() {
  const count = getCartItemCount();

  ["#cartCount", "#cartBadge", "#cart-count", "[data-cart-count]"].forEach(
    selector => {
      $$(selector).forEach(badge => {
        badge.textContent = count;
        badge.classList.toggle("hidden", count === 0);
      });
    }
  );
}

function updateCartDrawer() {
  const drawerItems =
    $("#cartDrawerItems") || $("#cartDrawerList") || $("#miniCartItems");

  if (!drawerItems) return;

  if (!state.cart.length) {
    drawerItems.innerHTML = `
      <div class="drawer-empty">
        <p style="color:white;font-weight:800;margin-bottom:8px;">YOUR CART IS EMPTY</p>
        <p>Add some gear to get started.</p>
      </div>`;

    updateCartDrawerTotal();
    return;
  }

  drawerItems.innerHTML = state.cart
    .map(item => {
      const image = item.image || KHELZONE_FALLBACK_IMAGE;
      const size = item.size || "Standard";
      const qty = Number(item.qty || item.quantity || 1);

      return `
        <div class="drawer-item">
          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(item.name)}"
            onerror="this.onerror=null;this.src='${KHELZONE_FALLBACK_IMAGE}';"
          >

          <div class="drawer-item-info">
            <p class="drawer-item-name">${escapeHTML(item.name)}</p>
            <p style="margin-top:4px;color:#7d838d;font-size:10px;">Size: ${escapeHTML(size)}</p>
            <p class="drawer-item-price">${money(item.price)}</p>

            <div class="drawer-item-qty">
              <button type="button" data-cart-action="decrease" data-id="${escapeHTML(item.id)}" data-size="${escapeHTML(size)}" aria-label="Decrease quantity">−</button>
              <span>${qty}</span>
              <button type="button" data-cart-action="increase" data-id="${escapeHTML(item.id)}" data-size="${escapeHTML(size)}" aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button
            type="button"
            class="drawer-remove"
            data-cart-action="remove"
            data-id="${escapeHTML(item.id)}"
            data-size="${escapeHTML(size)}"
            aria-label="Remove item"
          >×</button>
        </div>`;
    })
    .join("");

  updateCartDrawerTotal();
}

function updateCartDrawerTotal() {
  const total = getCartTotal();

  ["#cartDrawerTotal", "#miniCartTotal", "[data-cart-total]"].forEach(
    selector => {
      $$(selector).forEach(el => {
        el.textContent = money(total);
      });
    }
  );
}

function refreshCartUI() {
  updateCartBadge();
  updateCartDrawer();
}

function addToCart(productId, selectedSize = null) {
  const product = findProduct(productId);

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  if (Number(product.stock) <= 0) {
    showToast("This product is out of stock.");
    return;
  }

  const size = selectedSize || product.sizes?.[0] || "Standard";

  const existingItem = state.cart.find(
    item =>
      String(item.id) === String(product.id) &&
      String(item.size || "Standard") === String(size)
  );

  if (existingItem) {
    existingItem.qty = Number(existingItem.qty || 1) + 1;
  } else {
    state.cart.push({
      id: product.id,
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      image: productImageFor(product),
      size,
      qty: 1
    });
  }

  saveCart();
  refreshCartUI();
  showToast(`${product.name} added to cart`);
}

function removeFromCart(productId, size = "Standard") {
  state.cart = state.cart.filter(
    item =>
      !(
        String(item.id) === String(productId) &&
        String(item.size || "Standard") === String(size)
      )
  );

  saveCart();
  refreshCartUI();
}

function changeCartQuantity(productId, size, change) {
  const item = state.cart.find(
    cartItem =>
      String(cartItem.id) === String(productId) &&
      String(cartItem.size || "Standard") === String(size || "Standard")
  );

  if (!item) return;

  const newQuantity = Number(item.qty || 1) + Number(change);

  if (newQuantity <= 0) {
    removeFromCart(productId, size);
    return;
  }

  item.qty = newQuantity;
  saveCart();
  refreshCartUI();
}

function wireCartQuantityEvents() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-cart-action]");
    if (!button) return;

    const action = button.dataset.cartAction;
    const productId = button.dataset.id;
    const size = button.dataset.size || "Standard";

    if (action === "increase") changeCartQuantity(productId, size, 1);
    else if (action === "decrease") changeCartQuantity(productId, size, -1);
    else if (action === "remove") removeFromCart(productId, size);
  });
}


/* ==========================================================================
   WISHLIST SYSTEM
   ========================================================================== */

function toggleWishlist(productId) {
  const existingIndex = state.wishlist.findIndex(
    item =>
      String(typeof item === "object" ? item.id : item) === String(productId)
  );

  if (existingIndex >= 0) {
    state.wishlist.splice(existingIndex, 1);
    showToast("Removed from wishlist");
  } else {
    state.wishlist.push(String(productId));
    showToast("Added to wishlist");
  }

  saveWishlist();
  updateWishlistBadge();
  renderWishlistItems();
  renderProducts();
}

/* Sync every wishlist button on the page (grid + drawer) with state */
function renderWishlistUI() {
  $$('[data-action="wishlist"]').forEach(button => {
    const id = button.dataset.id;
    const active = isInWishlist(id);

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function updateWishlistBadge() {
  const badge = $("#wishlistCount");
  if (!badge) return;

  const count = state.wishlist.length;
  badge.textContent = count;
  badge.classList.toggle("hidden", count === 0);
}

function renderWishlistItems() {
  const container = $("#wishlistItems");
  if (!container) return;

  if (!state.wishlist.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <p style="color:white;font-weight:800;margin-bottom:8px;">YOUR WISHLIST IS EMPTY</p>
        <p>Save your favorite gear here and come back when you're ready.</p>
      </div>`;
    return;
  }

  const items = state.wishlist
    .map(id => findProduct(id))
    .filter(Boolean);

  if (!items.length) {
    container.innerHTML = `
      <div class="drawer-empty">
        <p style="color:white;font-weight:800;margin-bottom:8px;">YOUR WISHLIST IS EMPTY</p>
        <p>Save your favorite gear here and come back when you're ready.</p>
      </div>`;
    return;
  }

  container.innerHTML = items
    .map(product => {
      const image = productImageFor(product);

      return `
        <div class="drawer-item">
          <img
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.name)}"
            onerror="this.onerror=null;this.src='${KHELZONE_FALLBACK_IMAGE}';"
          >

          <div class="drawer-item-info">
            <p class="drawer-item-name">${escapeHTML(product.name)}</p>
            <p class="drawer-item-price">${money(product.price)}</p>
          </div>

          <button
            type="button"
            class="drawer-remove"
            data-action="wishlist"
            data-id="${escapeHTML(product.id)}"
            aria-label="Remove ${escapeHTML(product.name)} from wishlist"
          >×</button>
        </div>`;
    })
    .join("");
}


/* ==========================================================================
   TOAST NOTIFICATION
   ========================================================================== */

let toastTimer = null;

function showToast(message) {
  let toast = $("#shopToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "shopToast";
    toast.className = "shop-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}


/* ==========================================================================
   QUICK VIEW — DATA LOADERS (Supabase)
   All of this is dynamic; nothing here is hardcoded per product.
   ========================================================================== */

async function fetchProductSpecifications(productId) {
  if (!supabaseClient) return [];

  try {
    const { data, error } = await supabaseClient
      .from("product_specifications")
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return (data || []).filter(row => row.name && row.value);
  } catch (error) {
    console.warn("Could not load specifications:", error.message || error);
    return [];
  }
}

async function fetchProductReviews(productId) {
  if (!supabaseClient) return [];

  try {
    /* ============================================================
       1. REVIEWS LOAD
       ============================================================ */

    const { data: reviews, error: reviewError } = await supabaseClient
      .from("product_reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (reviewError) throw reviewError;

    if (!reviews || !reviews.length) {
      return [];
    }

    /* ============================================================
       2. GET REVIEWER USER IDS
       ============================================================ */

    const userIds = [
      ...new Set(
        reviews
          .map(review => review.user_id)
          .filter(Boolean)
      )
    ];

    /* ============================================================
       3. LOAD PUBLIC PROFILE NAMES
       ============================================================ */

    let profiles = [];

    if (userIds.length) {
      const { data: profileData, error: profileError } =
        await supabaseClient
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

      if (profileError) {
        console.warn(
          "Could not load reviewer profiles:",
          profileError.message || profileError
        );
      } else {
        profiles = profileData || [];
      }
    }

    /* ============================================================
       4. ATTACH PROFILE TO EACH REVIEW
       ============================================================ */

    return reviews.map(review => {
      const profile = profiles.find(
        item => String(item.id) === String(review.user_id)
      );

      return {
        ...review,

        profiles: profile
          ? {
              full_name: profile.full_name || ""
            }
          : null
      };
    });

  } catch (error) {
    console.error(
      "Could not load reviews:",
      error.message || error
    );

    return [];
  }
}

async function fetchCurrentUser() {
  if (!supabaseClient) return null;

  try {
    const { data: { user } = {} } = await supabaseClient.auth.getUser();
    return user || null;
  } catch (error) {
    return null;
  }
}


/* ==========================================================================
   QUICK VIEW — RENDER PIECES
   ========================================================================== */

function renderSpecificationsHTML(specifications) {
  if (!specifications.length) return "";

  const rows = specifications
    .map(
      spec => `
        <tr>
          <td>${escapeHTML(spec.name)}</td>
          <td>${escapeHTML(spec.value)}</td>
        </tr>`
    )
    .join("");

  return `
    <div class="qv-section">
      <h4 class="qv-section-title">Specifications</h4>
      <table class="qv-specs-table">
        <thead>
          <tr><th>Specification</th><th>Details</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderReturnWarrantyHTML(product) {
  if (!product.returnPolicy && !product.warranty) return "";

  return `
    <div class="qv-section">
      <h4 class="qv-section-title">Return &amp; Warranty</h4>
      <div class="qv-return-warranty">
        ${
          product.returnPolicy
            ? `<div class="qv-rw-item">
                 <span class="qv-rw-label">Return</span>
                 <span class="qv-rw-value">${escapeHTML(product.returnPolicy)}</span>
               </div>`
            : ""
        }
        ${
          product.warranty
            ? `<div class="qv-rw-item">
                 <span class="qv-rw-label">Warranty</span>
                 <span class="qv-rw-value">${escapeHTML(product.warranty)}</span>
               </div>`
            : ""
        }
      </div>
    </div>`;
}

function starPickerHTML(name) {
  return `
    <div class="qv-star-picker" data-star-picker="${name}">
      ${[1, 2, 3, 4, 5]
        .map(
          value =>
            `<button type="button" class="qv-star-btn" data-star-value="${value}" aria-label="${value} star">☆</button>`
        )
        .join("")}
    </div>`;
}

function renderReviewsHTML(product, reviews, currentUser, isOwner) {
  const rating = Number(product.rating || 0);
  const reviewCount = Number(product.reviews) || reviews.length || 0;

  const alreadyReviewed =
    currentUser &&
    reviews.some(review => String(review.user_id) === String(currentUser.id));

  let formHTML = "";

  if (!currentUser) {
    formHTML = `
      <div class="qv-review-login">
        <p>Login to rate this product.</p>
        <button type="button" class="cta-outline px-5 py-2 text-xs" data-quick-login>LOGIN</button>
      </div>`;
  } else if (isOwner) {
    formHTML = `<p class="qv-review-note">You can't review your own product.</p>`;
  } else if (alreadyReviewed) {
    formHTML = `<p class="qv-review-note">You've already reviewed this product. Thanks!</p>`;
  } else {
    formHTML = `
      <form class="qv-review-form" data-review-form data-product-id="${escapeHTML(product.id)}">
        <label class="qv-rw-label">Your Rating</label>
        ${starPickerHTML("newReview")}
        <textarea
          class="qv-review-textarea"
          data-review-text
          rows="3"
          maxlength="600"
          placeholder="Share your experience with this product (optional)"
        ></textarea>
        <button type="submit" class="cta-primary px-6 py-3 text-xs" data-review-submit>
          SUBMIT REVIEW
        </button>
      </form>`;
  }

  const reviewItems = reviews
    .slice(0, 20)
.map(
  review => {
    const reviewerName =
      review.profiles?.full_name ||
      "KHELZONE Customer";

    return `
      <div class="qv-review-item">

        <div class="qv-review-header">
          <div class="qv-review-user">
            <span class="qv-review-avatar">
              ${escapeHTML(reviewerName.charAt(0).toUpperCase())}
            </span>

            <div>
              <p class="qv-review-name">
                ${escapeHTML(reviewerName)}
              </p>

              <p class="qv-review-date">
                ${
                  review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : ""
                }
              </p>
            </div>
          </div>

          <div class="qv-review-stars">
            ${starString(review.rating)}
          </div>
        </div>

        ${
          review.review
            ? `<p class="qv-review-text">${escapeHTML(review.review)}</p>`
            : ""
        }

      </div>
    `;
  }
)
    .join("");

  return `
    <div class="qv-section">
      <h4 class="qv-section-title">Ratings &amp; Reviews</h4>

      <div class="qv-rating-summary">
        <span class="qv-rating-stars">${starString(rating)}</span>
        <span class="qv-rating-value">${rating.toFixed(1)}</span>
        <span class="qv-rating-count">(${reviewCount} Review${reviewCount === 1 ? "" : "s"})</span>
      </div>

      <div class="qv-review-status" data-review-status></div>

      ${formHTML}

      ${
        reviewItems
          ? `<div class="qv-review-list">${reviewItems}</div>`
          : `<p class="qv-review-note">No reviews yet. Be the first to review this product.</p>`
      }
    </div>`;
}

function renderSellerHTML(seller) {
  if (!seller) return "";

  const logo = seller.shop_logo || KHELZONE_SHOP_FALLBACK_LOGO;
  const banner = seller.shop_banner || "";

  return `
    <div class="qv-section qv-seller-card">
      <h4 class="qv-section-title">Sold By</h4>

      ${
        banner
          ? `<div class="qv-seller-banner" style="background-image:url('${escapeHTML(banner)}')"></div>`
          : ""
      }

      <div class="qv-seller-row">
        <img
          class="qv-seller-logo"
          src="${escapeHTML(logo)}"
          alt="${escapeHTML(seller.shop_name || "KHELZONE Seller")}"
          onerror="this.onerror=null;this.src='${KHELZONE_SHOP_FALLBACK_LOGO}';"
        >

        <div class="qv-seller-info">
          <p class="qv-seller-name">${escapeHTML(seller.shop_name || "KHELZONE Seller")}</p>
          ${
            seller.contact_number
              ? `<a class="qv-seller-contact" href="tel:${escapeHTML(seller.contact_number)}">
                   ☎ Contact Seller — ${escapeHTML(seller.contact_number)}
                 </a>`
              : ""
          }
        </div>
      </div>
    </div>`;
}


/* ==========================================================================
   QUICK VIEW MODAL — MAIN
   ========================================================================== */

async function openQuickView(productId) {
  const product = findProduct(productId);
  if (!product) return;

  let modal = $("#quickViewModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    modal.className = "quick-view-modal";
    document.body.appendChild(modal);
  }

  /* Show a lightweight loading state immediately so the modal feels
     instant, then fill in the dynamic sections once data arrives. */
  const image = productImageFor(product);

  modal.innerHTML = `
    <div class="quick-view-box" role="dialog" aria-modal="true">

      <button type="button" class="quick-view-close" data-quick-close aria-label="Close">×</button>

      <div class="quick-view-image">
        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
          onerror="this.onerror=null;this.src='${KHELZONE_FALLBACK_IMAGE}';"
        >
      </div>

      <div class="quick-view-content" data-quick-content>

        <p class="section-eyebrow">${escapeHTML(product.sport || product.category || "Sports")}</p>

        <h2 class="font-display text-2xl mt-2">${escapeHTML(product.name)}</h2>

        <div class="mt-3 text-sm text-orange-400">
          ★ ${Number(product.rating || 0).toFixed(1)}
          <span class="text-white/40">(${Number(product.reviews) || 0} reviews)</span>
        </div>

        <div class="qv-price-row mt-4">
          <h3 class="font-display text-2xl text-orange-500">${money(product.price)}</h3>
          ${
            product.oldPrice > product.price
              ? `<span class="qv-old-price">${money(product.oldPrice)}</span>`
              : ""
          }
        </div>

        <p class="qv-stock ${stockStatus(product).className}">${stockStatus(product).label}</p>

        ${
          product.description
            ? `<p class="mt-4 text-sm text-white/60 leading-relaxed">${escapeHTML(product.description)}</p>`
            : ""
        }

        <div class="mt-6">
          <span class="text-xs font-bold uppercase tracking-widest text-white/50">Select Size</span>
          <div class="flex flex-wrap gap-2 mt-3">
            ${product.sizes
              .map(
                (size, index) => `
                  <button
                    type="button"
                    class="size-option ${index === 0 ? "active" : ""}"
                    data-quick-size="${escapeHTML(size)}"
                  >${escapeHTML(size)}</button>`
              )
              .join("")}
          </div>
        </div>

        <button
          type="button"
          class="cta-primary w-full py-4 text-sm mt-8"
          data-quick-add="${escapeHTML(product.id)}"
          ${Number(product.stock) <= 0 ? "disabled" : ""}
        >${Number(product.stock) <= 0 ? "OUT OF STOCK" : "ADD TO CART"}</button>

        <div class="qv-dynamic-sections" data-quick-dynamic>
          <p class="qv-loading">Loading product details…</p>
        </div>

      </div>

    </div>
  `;

  document.body.classList.add("modal-open");
  requestAnimationFrame(() => modal.classList.add("show"));

  /* Reset per-open cache */
  state.quickView.productId = product.id;

  /* Fetch specifications, reviews, seller profile and current user in
     parallel, then render once everything is back. */
  const [specifications, reviews, currentUser] = await Promise.all([
    fetchProductSpecifications(product.id),
    fetchProductReviews(product.id),
    fetchCurrentUser()
  ]);

  const seller = product.sellerId
    ? await fetchSellerShopProfile(product.sellerId)
    : null;

  /* The modal might have been closed / switched to another product while
     we were awaiting — bail out if so. */
  if (state.quickView.productId !== product.id) return;

  state.quickView.specifications = specifications;
  state.quickView.reviews = reviews;
  state.quickView.seller = seller;
  state.quickView.currentUser = currentUser;

  const isOwner =
    currentUser && String(currentUser.id) === String(product.sellerId);

  const dynamicContainer = $("[data-quick-dynamic]", modal);
  if (dynamicContainer) {
    dynamicContainer.innerHTML = [
      renderSpecificationsHTML(specifications),
      renderReturnWarrantyHTML(product),
      renderReviewsHTML(product, reviews, currentUser, isOwner),
      renderSellerHTML(seller)
    ].join("");
  }
}

function closeQuickView() {
  const modal = $("#quickViewModal");
  if (!modal) return;

  modal.classList.remove("show");
  document.body.classList.remove("modal-open");

  state.quickView.productId = null;

  setTimeout(() => {
    if (modal.parentNode) modal.remove();
  }, 250);
}


/* ==========================================================================
   RATING SUBMISSION (with validation)
   ========================================================================== */

function getSelectedStarValue(pickerEl) {
  const active = $(".qv-star-btn.active", pickerEl);
  return active ? Number(active.dataset.starValue) : 0;
}

function setReviewStatus(message, type = "info") {
  const statusEl = $("[data-review-status]");
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = `qv-review-status qv-review-status--${type}`;
}

async function submitProductReview(productId, rating, reviewText) {
  if (!supabaseClient) {
    setReviewStatus("Reviews are unavailable right now.", "error");
    return;
  }

  /* --- VALIDATION ------------------------------------------------- */

  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    setReviewStatus("Please select a rating between 1 and 5 stars.", "error");
    return;
  }

  const { data: { user } = {} } = await supabaseClient.auth.getUser();

  if (!user) {
    setReviewStatus("Please login to submit a rating.", "error");
    return;
  }

  const product = findProduct(productId);

  if (product && String(product.sellerId) === String(user.id)) {
    setReviewStatus("Sellers can't review their own products.", "error");
    return;
  }

  const alreadyReviewed = state.quickView.reviews.some(
    review => String(review.user_id) === String(user.id)
  );

  if (alreadyReviewed) {
    setReviewStatus("You've already reviewed this product.", "error");
    return;
  }

  /* --- SUBMIT ------------------------------------------------------- */

  setReviewStatus("Submitting your review…", "info");

  try {
    const { error } = await supabaseClient.from("product_reviews").insert([
      {
        product_id: productId,
        user_id: user.id,
        rating: numericRating,
        review: reviewText ? reviewText.trim().slice(0, 600) : null
      }
    ]);

    if (error) throw error;

    setReviewStatus("Thanks! Your review has been submitted.", "success");

    /* Refresh the product's live rating/review-count from Supabase
       (updated server-side by a trigger), then re-render Quick View. */
    const { data: freshProduct } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (freshProduct) {
      const normalized = normalizeProduct(freshProduct);
      const index = state.products.findIndex(
        p => String(p.id) === String(productId)
      );
      if (index >= 0) state.products[index] = normalized;
    }

    renderProducts();

    if (state.quickView.productId === productId) {
  await openQuickView(productId);
}

renderProducts();
  } catch (error) {
    console.error("Review submission failed:", error);

    if (String(error.message || "").toLowerCase().includes("duplicate")) {
      setReviewStatus("You've already reviewed this product.", "error");
    } else {
      setReviewStatus("Could not submit your review. Please try again.", "error");
    }
  }
}


/* ==========================================================================
   QUICK VIEW EVENTS
   ========================================================================== */

function wireQuickViewEvents() {
  document.addEventListener("click", event => {
    if (event.target.closest("[data-quick-close]")) {
      closeQuickView();
      return;
    }

    if (event.target === $("#quickViewModal")) {
      closeQuickView();
      return;
    }

    const sizeButton = event.target.closest("[data-quick-size]");
    if (sizeButton) {
      event.preventDefault();

      const modal = $("#quickViewModal");
      if (modal) {
        $$("[data-quick-size]", modal).forEach(btn =>
          btn.classList.remove("active")
        );
        sizeButton.classList.add("active");
      }
      return;
    }

    const quickAddButton = event.target.closest("[data-quick-add]");
    if (quickAddButton && !quickAddButton.disabled) {
      event.preventDefault();

      const productId = quickAddButton.dataset.quickAdd;
      const modal = $("#quickViewModal");

      let selectedSize = "Standard";
      if (modal) {
        const activeSize = $(".size-option.active", modal);
        if (activeSize) {
          selectedSize =
            activeSize.dataset.quickSize || activeSize.textContent.trim();
        }
      }

      addToCart(productId, selectedSize);
      closeQuickView();
      return;
    }

    /* Star picker (used for submitting a new review) */
    const starButton = event.target.closest(".qv-star-btn");
    if (starButton) {
      event.preventDefault();

      const picker = starButton.closest("[data-star-picker]");
      if (!picker) return;

      const value = Number(starButton.dataset.starValue);

      $$(".qv-star-btn", picker).forEach(btn => {
        const btnValue = Number(btn.dataset.starValue);
        btn.classList.toggle("active", btnValue <= value);
        btn.textContent = btnValue <= value ? "★" : "☆";
      });

      picker.dataset.selectedValue = value;
      return;
    }

    /* "Login to review" shortcut — sends the shopper to the account page.
       Falls back gracefully if the site doesn't have a dedicated page. */
    if (event.target.closest("[data-quick-login]")) {
      event.preventDefault();
      window.location.href = "login.html";
      return;
    }
  });

  document.addEventListener("submit", event => {
    const form = event.target.closest("[data-review-form]");
    if (!form) return;

    event.preventDefault();

    const productId = form.dataset.productId;
    const picker = $("[data-star-picker]", form);
    const rating = picker ? Number(picker.dataset.selectedValue || 0) : 0;
    const textArea = $("[data-review-text]", form);
    const reviewText = textArea ? textArea.value : "";

    if (!rating) {
      setReviewStatus("Please select a star rating first.", "error");
      return;
    }

    submitProductReview(productId, rating, reviewText);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeQuickView();
      closeWishlistDrawer();
      closeCartDrawer();
    }
  });
}


/* ==========================================================================
   HOMEPAGE → SHOP CATEGORY URL FILTER
   Supports: shop.html?category=Cricket / shop.html?sport=Cricket
   ========================================================================== */

function applyCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || params.get("sport");

  if (!category) return;

  const decodedCategory = decodeURIComponent(category).trim();
  if (!decodedCategory) return;

  state.sports.clear();
  state.sports.add(decodedCategory);
  state.visibleCount = 12;

  syncCategorySelection();
  syncSportCheckboxes();

  console.log("Category filter applied from Homepage:", decodedCategory);
}

function syncCategorySelection() {
  const selectedSports = [...state.sports].map(sport =>
    String(sport).trim().toLowerCase()
  );

  ["[data-category]", "[data-sport]", ".cat-card"].forEach(selector => {
    $$(selector).forEach(element => {
      let category = element.dataset.category || element.dataset.sport;
      if (!category) category = element.textContent.trim();

      const isActive = selectedSports.includes(
        String(category).trim().toLowerCase()
      );

      element.classList.toggle("active", isActive);
      element.classList.toggle("is-active", isActive);
    });
  });
}

function syncSportCheckboxes() {
  $$('[data-filter="sport"]').forEach(checkbox => {
    const value = checkbox.value.trim().toLowerCase();

    checkbox.checked = [...state.sports]
      .map(sport => String(sport).trim().toLowerCase())
      .includes(value);
  });
}


/* ==========================================================================
   FILTER WIRING
   ========================================================================== */

function updateSetFilter(set, value, checked) {
  if (checked) set.add(value);
  else set.delete(value);

  state.visibleCount = 12;
  renderProducts();
}

function wireSportFilters() {
  $$('[data-filter="sport"]').forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateSetFilter(state.sports, checkbox.value, checkbox.checked);
      syncCategorySelection();
    });
  });
}

function wireTypeFilters() {
  $$('[data-filter="type"]').forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateSetFilter(state.types, checkbox.value, checkbox.checked);
    });
  });
}

function wireBrandFilters() {
  $$('[data-filter="brand"]').forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateSetFilter(state.brands, checkbox.value, checkbox.checked);
    });
  });
}

function wireSizeFilters() {
  $$('[data-filter="size"]').forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateSetFilter(state.sizes, checkbox.value, checkbox.checked);
    });
  });
}

function wirePriceBucketFilters() {
  $$('[data-filter="price"]').forEach(checkbox => {
    checkbox.addEventListener("change", () => {
      updateSetFilter(state.priceBuckets, checkbox.value, checkbox.checked);
    });
  });
}

function wireRatingFilters() {
  $$('[data-filter="rating"]').forEach(input => {
    input.addEventListener("change", () => {
      state.minRating = input.checked === false ? 0 : Number(input.value) || 0;
      state.visibleCount = 12;
      renderProducts();
    });
  });
}

function wirePriceRange() {
  const range = $("#priceRange") || $("[data-price-range]");
  if (!range) return;

  const output =
    $("#priceRangeLabel") ||
    $("#priceRangeValue") ||
    $("#priceValue") ||
    $("[data-price-value]");

  // Price range: Rs. 500 - Rs. 10,000
  const MIN_PRICE = 10;
  const MAX_PRICE = 10000;

  range.min = MIN_PRICE;
  range.max = MAX_PRICE;
  range.step = 10;

  // Default = maximum price
  range.value = MAX_PRICE;

  const updatePrice = () => {
    const selectedPrice = Number(range.value);

    state.priceMax = selectedPrice;

    if (output) {
      output.textContent = money(selectedPrice);
    }

    state.visibleCount = 12;
    renderProducts();
  };

  range.addEventListener("input", updatePrice);

  updatePrice();
}

function wireSearch() {
  const searchInputs = [
    "#shopSearch",
    "#searchInput",
    "#searchInputMobile",
    "[data-shop-search]"
  ];

  searchInputs.forEach(selector => {
    $$(selector).forEach(input => {

      /* ================================================================
         LIVE SEARCH
         ================================================================ */
      input.addEventListener("input", () => {
        state.search = input.value.trim();

        /* Keep all search boxes in sync */
        searchInputs.forEach(other => {
          $$(other).forEach(el => {
            if (el !== input) {
              el.value = input.value;
            }
          });
        });

        /* Search clear button */
        const clearBtn = $("#searchClearBtn");

        if (clearBtn) {
          clearBtn.classList.toggle("hidden", !input.value.trim());
        }

        state.visibleCount = 12;

        renderProducts();
      });


      /* ================================================================
         ENTER → SEARCH + SCROLL TO PRODUCTS
         ================================================================ */
      input.addEventListener("keydown", event => {

        if (event.key !== "Enter") {
          return;
        }

        event.preventDefault();

        /* Get the latest search text */
        state.search = input.value.trim();

        /* Keep all search boxes synchronized */
        searchInputs.forEach(other => {
          $$(other).forEach(el => {
            el.value = input.value;
          });
        });

        /* Update clear button */
        const clearBtn = $("#searchClearBtn");

        if (clearBtn) {
          clearBtn.classList.toggle(
            "hidden",
            !input.value.trim()
          );
        }

        /* Reset visible products */
        state.visibleCount = 12;

        /* Render filtered products first */
        renderProducts();


        /* ================================================================
           SCROLL AFTER PRODUCTS HAVE BEEN RENDERED
           ================================================================ */
        setTimeout(() => {

          /*
           * Try the main shop/product section first.
           * This supports different IDs in shop.html.
           */
          const productsSection =
            $("#shopGrid") ||
            $("#productGrid") ||
            $("#productsGrid") ||
            $(".product-grid");

          /*
           * If products section exists, smoothly scroll to it.
           */
          if (productsSection) {

            productsSection.scrollIntoView({
              behavior: "smooth",
              block: "start"
            });

            return;
          }

          /*
           * Fallback:
           * If product grid itself wasn't found, try empty state.
           */
          const emptyState = $("#emptyState");

          if (emptyState) {
            emptyState.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });
          }

        }, 150);
      });
    });
  });


  /* ================================================================
     CLEAR SEARCH BUTTON
     ================================================================ */
  const clearBtn = $("#searchClearBtn");

  if (clearBtn) {

    clearBtn.addEventListener("click", () => {

      /* Clear every search box */
      searchInputs.forEach(selector => {
        $$(selector).forEach(input => {
          input.value = "";
        });
      });

      /* Reset search */
      state.search = "";

      /* Reset visible products */
      state.visibleCount = 12;

      /* Hide clear button */
      clearBtn.classList.add("hidden");

      /* Render all products */
      renderProducts();
    });
  }
}


function wireCategoryCards() {
  ["[data-category]", "[data-sport]"].forEach(selector => {
    $$(selector).forEach(element => {
      element.addEventListener("click", event => {
        const category = element.dataset.category || element.dataset.sport;
        if (!category) return;

        if (element.tagName === "A") event.preventDefault();

        const normalizedCategory = String(category).trim();

        const alreadySelected = [...state.sports]
          .map(sport => String(sport).trim().toLowerCase())
          .includes(normalizedCategory.toLowerCase());

        state.sports.clear();
        if (!alreadySelected) state.sports.add(normalizedCategory);

        state.visibleCount = 12;

        syncCategorySelection();
        syncSportCheckboxes();
        renderProducts();

        const url = new URL(window.location.href);
        if (state.sports.size) {
          url.searchParams.set("category", normalizedCategory);
        } else {
          url.searchParams.delete("category");
          url.searchParams.delete("sport");
        }
        window.history.replaceState({}, "", url);

        const productsSection =
          $("#shopGrid") || $("#productGrid") || $("#productsGrid");
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  });
}

function wireSort() {
  const sortSelect = $("#sortSelect") || $("#sortProducts") || $("[data-sort]");
  if (!sortSelect) return;

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value || "featured";
    state.visibleCount = 12;
    renderProducts();
  });
}

function clearAllFilters() {
  state.search = "";
  state.sports.clear();
  state.types.clear();
  state.brands.clear();
  state.sizes.clear();
  state.priceBuckets.clear();
  state.minRating = 0;

  const range = $("#priceRange") || $("[data-price-range]");
  state.priceMax = Number(range?.max || 10000);

  state.sort = "featured";
  state.visibleCount = 12;

  $$('input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });

  ["#shopSearch", "#searchInput", "#searchInputMobile", "[data-shop-search]"].forEach(
    selector => {
      $$(selector).forEach(input => {
        input.value = "";
      });
    }
  );

  const searchClearBtn = $("#searchClearBtn");
  if (searchClearBtn) searchClearBtn.classList.add("hidden");

  if (range) range.value = range.max || 10000;

  const priceOutput =
    $("#priceRangeLabel") ||
    $("#priceRangeValue") ||
    $("#priceValue") ||
    $("[data-price-value]");
  if (priceOutput) priceOutput.textContent = money(Number(range?.value || 10000));

  const sortSelect = $("#sortSelect") || $("#sortProducts") || $("[data-sort]");
  if (sortSelect) sortSelect.value = "featured";

  const url = new URL(window.location.href);
  url.searchParams.delete("category");
  url.searchParams.delete("sport");
  window.history.replaceState({}, "", url);

  syncCategorySelection();
  syncSportCheckboxes();
  renderProducts();
}

function wireClearFilters() {
  const selectors = [
    "#clearFiltersBtn",
    "#clearFiltersBtn2",
    "#emptyClearFiltersBtn",
    "#clearAllFilters",
    "[data-clear-filters]"
  ];

  selectors.forEach(selector => {
    $$(selector).forEach(button => {
      button.addEventListener("click", event => {
        event.preventDefault();
        clearAllFilters();
      });
    });
  });
}

function wireLoadMore() {
  const loadMore = $("#loadMoreBtn");
  if (!loadMore) return;

  loadMore.addEventListener("click", () => {
    state.visibleCount += 12;
    renderProducts();
  });
}


/* ==========================================================================
   PRODUCT CARD EVENTS (delegated — works for dynamically rendered cards)
   ========================================================================== */

function wireProductCardEvents() {
  document.addEventListener("click", event => {
    const addCartButton = event.target.closest('[data-action="addcart"]');
    if (addCartButton) {
      event.preventDefault();
      if (addCartButton.disabled) return;

      addToCart(addCartButton.dataset.id);
      return;
    }

    const wishlistButton = event.target.closest('[data-action="wishlist"]');
    if (wishlistButton) {
      event.preventDefault();
      event.stopPropagation();

      toggleWishlist(wishlistButton.dataset.id);
      return;
    }

    const quickViewButton = event.target.closest('[data-action="quickview"]');
    if (quickViewButton) {
      event.preventDefault();
      openQuickView(quickViewButton.dataset.id);
    }
  });
}


/* ==========================================================================
   NAVBAR DRAWERS — WISHLIST + CART
   ========================================================================== */

function openWishlistDrawer() {
  const drawer = $("#wishlistDrawer");
  const overlay = $("#wishlistOverlay");
  if (!drawer) return;

  renderWishlistItems();

  drawer.classList.add("open");
  if (overlay) overlay.classList.add("open");
  document.body.classList.add("drawer-open");
}

function closeWishlistDrawer() {
  const drawer = $("#wishlistDrawer");
  const overlay = $("#wishlistOverlay");
  if (!drawer) return;

  drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");

  if (!$("#cartDrawer")?.classList.contains("open")) {
    document.body.classList.remove("drawer-open");
  }
}

function openCartDrawer() {
  const drawer = $("#cartDrawer");
  const overlay = $("#cartOverlay");
  if (!drawer) return;

  updateCartDrawer();

  drawer.classList.add("open");
  if (overlay) overlay.classList.add("open");
  document.body.classList.add("drawer-open");
}

function closeCartDrawer() {
  const drawer = $("#cartDrawer");
  const overlay = $("#cartOverlay");
  if (!drawer) return;

  drawer.classList.remove("open");
  if (overlay) overlay.classList.remove("open");

  if (!$("#wishlistDrawer")?.classList.contains("open")) {
    document.body.classList.remove("drawer-open");
  }
}

function wireDrawers() {
  const wishlistIconBtn = $("#wishlistIconBtn");
  if (wishlistIconBtn) {
    wishlistIconBtn.addEventListener("click", event => {
      event.preventDefault();
      openWishlistDrawer();
    });
  }

  const closeWishlistBtn = $("#closeWishlistBtn");
  if (closeWishlistBtn) {
    closeWishlistBtn.addEventListener("click", closeWishlistDrawer);
  }

  const wishlistOverlay = $("#wishlistOverlay");
  if (wishlistOverlay) {
    wishlistOverlay.addEventListener("click", closeWishlistDrawer);
  }

  const cartIconBtn = $("#cartIconBtn");
  if (cartIconBtn) {
    cartIconBtn.addEventListener("click", event => {
      event.preventDefault();
      openCartDrawer();
    });
  }

  const closeCartBtn = $("#closeCartBtn");
  if (closeCartBtn) {
    closeCartBtn.addEventListener("click", closeCartDrawer);
  }

  const cartOverlay = $("#cartOverlay");
  if (cartOverlay) {
    cartOverlay.addEventListener("click", closeCartDrawer);
  }

  const goToCartBtn = $("#goToCartBtn");
  if (goToCartBtn) {
    goToCartBtn.addEventListener("click", event => {
      event.preventDefault();
      window.location.href = "cart.html";
    });
  }
}


/* ==========================================================================
   MOBILE MENU
   ========================================================================== */

function wireMobileMenu() {
  const toggle = $("#mobileMenuBtn") || $("#navToggle") || $("[data-nav-toggle]");
  const mobileMenu = $("#mobileMenu") || $("#navMobile") || $("[data-mobile-nav]");

  if (!toggle || !mobileMenu) return;

  toggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");

    toggle.classList.toggle("active", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  $$("a", mobileMenu).forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      toggle.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}


/* ==========================================================================
   INITIALIZE SHOP
   ========================================================================== */

async function initializeShop() {
  console.log("KHELZONE Shop initializing...");

  loadCart();
  loadWishlist();
  refreshCartUI();
  updateWishlistBadge();

  wireProductCardEvents();
  wireQuickViewEvents();
  wireCartQuantityEvents();
  wireDrawers();
  wireMobileMenu();

  wireSportFilters();
  wireTypeFilters();
  wireBrandFilters();
  wireSizeFilters();
  wirePriceBucketFilters();
  wireRatingFilters();
  wirePriceRange();
  wireSearch();
  wireCategoryCards();
  wireSort();
  wireClearFilters();
  wireLoadMore();

  await loadProductsFromSupabase();

  applyCategoryFromURL();

  renderProducts();
  renderWishlistUI();
  refreshCartUI();
  updateWishlistBadge();

  const params = new URLSearchParams(window.location.search);
  const selectedCategory = params.get("category") || params.get("sport");

  if (selectedCategory) {
    setTimeout(() => {
      const productsSection =
        $("#shopGrid") || $("#productGrid") || $("#productsGrid");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 500);
  }

  const yearNow = $("#yearNow");
  if (yearNow) yearNow.textContent = new Date().getFullYear();

  console.log("KHELZONE Shop initialized successfully.");
}


/* ==========================================================================
   START APPLICATION
   ========================================================================== */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeShop);
} else {
  initializeShop();
}


/* ==========================================================================
   PUBLIC API (debugging / other pages)
   ========================================================================== */

window.KHELZONE_SHOP = {
  addToCart,
  removeFromCart,
  changeCartQuantity,
  getCartItemCount,
  getCartTotal,
  clearAllFilters,
  openQuickView,
  closeQuickView,
  openCartDrawer,
  closeCartDrawer,
  openWishlistDrawer,
  closeWishlistDrawer,
  refreshCartUI
};