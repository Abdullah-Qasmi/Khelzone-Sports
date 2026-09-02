/* ==========================================================================
   KHELZONE WISHLIST — JAVASCRIPT
   Compatible with shop.js and cart.js
   Storage Keys: khz_wishlist (read), khz_cart (write on "Add to Cart")
   ========================================================================== */

"use strict";


/* ==========================================================================
   SUPABASE CONFIGURATION
   (same project/keys already used in shop.js — do not create a new client
   elsewhere; this page only needs its own instance since it has no other
   script tag in common with shop.html)
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
   STORAGE KEYS — must match shop.js / cart.js exactly
   ========================================================================== */

const WISHLIST_STORAGE_KEY = "khz_wishlist";
const CART_STORAGE_KEY = "khz_cart";


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

const KHELZONE_FALLBACK_IMAGE =
  "https://placehold.co/300x300/111111/ffffff?text=KHELZONE";


/* ==========================================================================
   STATE
   ========================================================================== */

let wishlistIds = [];   // array of product IDs, as written by shop.js
let wishlistProducts = []; // resolved product rows for the current IDs


/* ==========================================================================
   LOAD / SAVE WISHLIST (IDs only — same shape shop.js uses)
   ========================================================================== */

function loadWishlistIds() {
  try {
    const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    // shop.js stores each entry as either a raw id string or, historically,
    // an object with an `id` field — normalize both to a plain id array.
    wishlistIds = (Array.isArray(parsed) ? parsed : [])
      .map(entry => (typeof entry === "object" && entry !== null ? entry.id : entry))
      .filter(id => id !== undefined && id !== null && String(id).length);
  } catch (error) {
    console.error("Error loading wishlist:", error);
    wishlistIds = [];
  }
}

function saveWishlistIds() {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  } catch (error) {
    console.error("Error saving wishlist:", error);
  }
}


/* ==========================================================================
   LOAD / SAVE CART (same item shape shop.js / cart.js use)
   ========================================================================== */

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error loading cart:", error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart:", error);
  }
}


/* ==========================================================================
   RESOLVE WISHLIST IDS AGAINST SUPABASE
   ========================================================================== */

async function loadWishlistProducts() {
  wishlistProducts = [];

  if (!wishlistIds.length) {
    return;
  }

  if (!supabaseClient) {
    console.error("Supabase client unavailable.");
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*")
      .in("id", wishlistIds);

    if (error) {
      throw error;
    }

    const byId = new Map((data || []).map(product => [String(product.id), product]));

    // Preserve the order the user wishlisted things in, and silently drop
    // any id that no longer resolves to a real product (deleted/inactive).
    wishlistProducts = wishlistIds
      .map(id => byId.get(String(id)))
      .filter(Boolean);
  } catch (error) {
    console.error("Error loading wishlist products:", error);
    wishlistProducts = [];
  }
}

function productImageFor(product) {
  return (
    product.image_url ||
    product.image ||
    product.thumbnail ||
    KHELZONE_FALLBACK_IMAGE
  );
}


/* ==========================================================================
   REMOVE FROM WISHLIST
   ========================================================================== */

function removeFromWishlist(productId) {
  wishlistIds = wishlistIds.filter(id => String(id) !== String(productId));
  wishlistProducts = wishlistProducts.filter(
    product => String(product.id) !== String(productId)
  );

  saveWishlistIds();
  renderWishlist();
  showToast("Removed from wishlist");
}


/* ==========================================================================
   ADD TO CART (from wishlist)
   ========================================================================== */

function addToCartFromWishlist(productId) {
  const product = wishlistProducts.find(
    item => String(item.id) === String(productId)
  );

  if (!product) {
    console.error("Product not found in wishlist:", productId);
    return;
  }

  const stock = Number(product.stock ?? 999);
  if (stock <= 0) {
    showToast("This product is out of stock.");
    return;
  }

  const size = "Standard";
  const cart = loadCart();

  const existingItem = cart.find(
    item =>
      String(item.id) === String(product.id) &&
      String(item.size || "Standard") === String(size)
  );

  if (existingItem) {
    existingItem.qty = Number(existingItem.qty || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      productId: product.id,
      name: product.name || product.title || "KHELZONE Product",
      price: Number(product.price) || 0,
      image: productImageFor(product),
      size,
      qty: 1
    });
  }

  saveCart(cart);
  showToast(`${product.name || "Item"} added to cart`);
}


/* ==========================================================================
   WISHLIST ITEM HTML
   Reuses the same visual classes cart.css already defines for cart rows,
   so the wishlist page matches the site's existing look with no new CSS.
   ========================================================================== */

function wishlistItemHTML(product) {
  const image = productImageFor(product);
  const price = Number(product.price) || 0;
  const category = product.sport || product.category || "KHELZONE";
  const outOfStock = Number(product.stock ?? 999) <= 0;

  return `
    <div class="cart-item-row flex items-center gap-md" data-product-id="${escapeHTML(product.id)}">

      <img
        src="${escapeHTML(image)}"
        alt="${escapeHTML(product.name)}"
        class="cart-product-image"
        onerror="this.onerror=null;this.src='${KHELZONE_FALLBACK_IMAGE}';"
      >

      <div class="flex-grow min-w-0">
        <span class="font-label-caps text-label-caps text-on-surface-variant">
          ${escapeHTML(category)}
        </span>

        <h3 class="font-headline-md text-headline-md text-on-background truncate">
          ${escapeHTML(product.name || product.title || "KHELZONE Product")}
        </h3>

        <div class="font-price-display text-[18px] text-secondary-container mt-xs">
          ${money(price)}
        </div>
      </div>

      <div class="flex items-center gap-sm flex-shrink-0">

        <button
          type="button"
          class="btn-primary px-md py-sm rounded-lg font-label-caps text-label-caps text-surface-container-lowest font-bold ${outOfStock ? "disabled-btn" : ""}"
          data-wishlist-action="addcart"
          data-id="${escapeHTML(product.id)}"
          ${outOfStock ? "disabled" : ""}
        >${outOfStock ? "OUT OF STOCK" : "ADD TO CART"}</button>

        <button
          type="button"
          class="text-on-surface-variant hover:text-error transition-colors duration-200"
          data-wishlist-action="remove"
          data-id="${escapeHTML(product.id)}"
          aria-label="Remove ${escapeHTML(product.name || "item")} from wishlist"
        >
          <span class="material-symbols-outlined">close</span>
        </button>

      </div>

    </div>
  `;
}


/* ==========================================================================
   RENDER
   ========================================================================== */

function renderWishlist() {
  const container = $("#wishlist-items-container");
  const emptyState = $("#empty-wishlist-state");
  const countLabel = $("#wishlist-item-count-label");

  if (countLabel) {
    const count = wishlistProducts.length;
    countLabel.textContent = `${count} ${count === 1 ? "ITEM" : "ITEMS"}`;
  }

  if (!container) {
    console.warn("Wishlist items container not found.");
    return;
  }

  if (!wishlistProducts.length) {
    container.innerHTML = "";
    if (emptyState) emptyState.classList.add("active");
    return;
  }

  if (emptyState) emptyState.classList.remove("active");
  container.innerHTML = wishlistProducts.map(wishlistItemHTML).join("");
}


/* ==========================================================================
   EVENTS
   ========================================================================== */

function wireWishlistEvents() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-wishlist-action]");
    if (!button) return;

    event.preventDefault();

    const action = button.dataset.wishlistAction;
    const productId = button.dataset.id;

    if (action === "remove") {
      removeFromWishlist(productId);
    } else if (action === "addcart") {
      if (button.disabled) return;
      addToCartFromWishlist(productId);
    }
  });

  $$("[data-href]").forEach(button => {
    button.addEventListener("click", () => {
      window.location.href = button.dataset.href;
    });
  });
}

function wireMobileMenu() {
  const toggle = $("#mobile-menu-btn");
  const mobileMenu = $("#mobile-nav");

  if (!toggle || !mobileMenu) return;

  toggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");
    toggle.classList.toggle("active", isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenu.classList.toggle("hidden", !isOpen);
  });
}


/* ==========================================================================
   TOAST
   ========================================================================== */

let toastTimer = null;

function showToast(message) {
  let toast = $("#wishlistToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "wishlistToast";
    toast.className = "toast";
    const container = $("#toast-container");
    if (container) {
      container.appendChild(toast);
    } else {
      document.body.appendChild(toast);
    }
  }

  toast.textContent = message;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 2500);
}


/* ==========================================================================
   CROSS-TAB / CROSS-PAGE SYNC
   If the wishlist changes in another tab (or on shop.html before navigating
   here), pick it up without requiring a manual refresh.
   ========================================================================== */

window.addEventListener("storage", event => {
  if (event.key === WISHLIST_STORAGE_KEY) {
    loadWishlistIds();
    loadWishlistProducts().then(renderWishlist);
  }
});


/* ==========================================================================
   INITIALIZE
   ========================================================================== */

async function initializeWishlist() {
  console.log("KHELZONE Wishlist initializing...");

  loadWishlistIds();
  wireWishlistEvents();
  wireMobileMenu();

  await loadWishlistProducts();
  renderWishlist();

  console.log("KHELZONE Wishlist initialized successfully.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeWishlist);
} else {
  initializeWishlist();
}


/* ==========================================================================
   GLOBAL API
   ========================================================================== */

window.KHELZONE_WISHLIST = {
  getWishlistIds: () => wishlistIds,
  getWishlistProducts: () => wishlistProducts,
  removeFromWishlist,
  addToCartFromWishlist,
  renderWishlist
};