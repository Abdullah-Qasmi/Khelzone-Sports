/* ==========================================================================
   KHELZONE — SHOP.JS
   COMPLETE SUPABASE PRODUCT + CART + WISHLIST SYSTEM
   ========================================================================== */

"use strict";

/* ==========================================================================
   SUPABASE CONFIG
   ========================================================================== */

const SUPABASE_URL = "https://antqexjhlsaynunlmzqa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);


/* ==========================================================================
   STORAGE KEYS
   ========================================================================== */

const CART_KEY = "khz_cart";
const WISHLIST_KEY = "khz_wishlist";


/* ==========================================================================
   GLOBAL PRODUCTS
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


/* ==========================================================================
   FALLBACK IMAGE
   ========================================================================== */

function fallbackImgFor(sport) {

  const label = String(
    sport || "KHELZONE"
  ).toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
         width="500"
         height="500">

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

  return "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(svg);
}


function safeImage(product) {

  if (
    product.image &&
    String(product.image).trim()
  ) {
    return product.image;
  }

  return fallbackImgFor(product.sport);
}


/* ==========================================================================
   PRODUCT NORMALIZER
   ========================================================================== */

function normalizeProduct(product, index = 0) {

  const price =
    Number(product.price) || 0;

  const oldPrice =
    Number(
      product.old_price ||
      product.oldPrice
    ) || price;

  let discount =
    Number(product.discount) || 0;

  if (
    !discount &&
    oldPrice > price
  ) {

    discount = Math.round(
      (
        (oldPrice - price) /
        oldPrice
      ) * 100
    );
  }

  let sizes = product.sizes;

  if (typeof sizes === "string") {

    try {
      sizes = JSON.parse(sizes);
    }

    catch {
      sizes = sizes
        .split(",")
        .map(size => size.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(sizes)) {
    sizes = ["Standard"];
  }

  sizes = sizes
    .map(size => String(size).trim())
    .filter(Boolean);

  if (!sizes.length) {
    sizes = ["Standard"];
  }

  return {

    id:
      product.id ??
      `product-${index}`,

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
      Number(product.rating) || 0,

    reviews:
      Number(product.reviews) || 0,

    image:
      product.image_url ||
      product.image ||
      "",

    description:
      String(
        product.description ||
        "Premium quality sports gear from KHELZONE."
      ),

    sizes,

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
      ),

    created_at:
      product.created_at ||
      ""
  };
}


/* ==========================================================================
   LOAD PRODUCTS FROM SUPABASE
   ========================================================================== */

async function loadProductsFromSupabase() {

  try {

    console.log(
      "Loading KHELZONE products from Supabase..."
    );

    const {
      data,
      error
    } = await supabaseClient
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order(
        "created_at",
        {
          ascending: false
        }
      );

    if (error) {
      throw error;
    }

    PRODUCTS =
      (data || [])
        .map(
          (product, index) =>
            normalizeProduct(
              product,
              index
            )
        );

    console.log(
      `${PRODUCTS.length} products loaded from Supabase`
    );

  }

  catch (error) {

    console.error(
      "Supabase product loading error:",
      error
    );

    PRODUCTS = [];

    showProductLoadingError();
  }
}


/* ==========================================================================
   PRODUCT LOADING ERROR
   ========================================================================== */

function showProductLoadingError() {

  const grid =
    $("#productGrid") ||
    $("#productsContainer");

  if (!grid) {
    return;
  }

  grid.innerHTML = `
    <div class="col-span-full text-center py-20">

      <h2 class="text-xl font-bold mb-2">
        Unable to Load Products
      </h2>

      <p
        class="text-sm"
        style="color:var(--khz-gray)"
      >
        Please check your Supabase connection.
      </p>

    </div>
  `;

  const empty = $("#emptyState");

  if (empty) {
    empty.classList.add("hidden");
  }

  const loadMore = $("#loadMoreWrap");

  if (loadMore) {
    loadMore.classList.add("hidden");
  }

  const count = $("#toolbarCount");

  if (count) {
    count.textContent = "Showing 0 of 0 products";
  }
}


/* ==========================================================================
   STATE
   ========================================================================== */

const state = {

  search: "",

  sports:
    new Set(),

  types:
    new Set(),

  priceMax:
    20000,

  priceBuckets:
    new Set(),

  brands:
    new Set(),

  sizes:
    new Set(),

  minRating:
    0,

  sort:
    "featured",

  view:
    "grid",

  visibleCount:
    12,

  cart:
    [],

  wishlist:
    []
};


/* ==========================================================================
   CART STORAGE
   ========================================================================== */

function loadCart() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          CART_KEY
        ) || "[]"
      );

    state.cart =
      Array.isArray(saved)
        ? saved
        : [];

  }

  catch {

    state.cart = [];

  }
}


function saveCart() {

  try {

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(
        state.cart
      )
    );

  }

  catch (error) {

    console.error(
      "Could not save cart:",
      error
    );
  }
}


/* ==========================================================================
   WISHLIST STORAGE
   ========================================================================== */

function loadWishlist() {

  try {

    const saved =
      JSON.parse(
        localStorage.getItem(
          WISHLIST_KEY
        ) || "[]"
      );

    state.wishlist =
      Array.isArray(saved)
        ? saved
        : [];

  }

  catch {

    state.wishlist = [];

  }
}


function saveWishlist() {

  try {

    localStorage.setItem(
      WISHLIST_KEY,
      JSON.stringify(
        state.wishlist
      )
    );

  }

  catch (error) {

    console.error(
      "Could not save wishlist:",
      error
    );
  }
}


/* ==========================================================================
   STAR RATING
   ========================================================================== */

function starString(rating) {

  const value =
    Number(rating) || 0;

  let output = "";

  for (
    let i = 1;
    i <= 5;
    i++
  ) {

    output += `
      <svg
        class="
          rating-star
          ${
            i <= Math.round(value)
              ? ""
              : "empty"
          }
        "
        width="13"
        height="13"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="
          M10 15.27
          L16.18 19
          l-1.64-7.03
          L20 7.24
          l-7.19-.61
          L10 0
          7.19 6.63
          0 7.24
          l5.46 4.73
          L3.82 19z
        "/>
      </svg>
    `;
  }

  return output;
}


/* ==========================================================================
   BADGE CLASS
   ========================================================================== */

function badgeClass(badge) {

  switch (
    String(
      badge || ""
    ).toUpperCase()
  ) {

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
   PRICE BUCKET FILTER
   ========================================================================== */

function priceInBucket(
  price,
  bucket
) {

  if (
    bucket === "u2000"
  ) {
    return price < 2000;
  }

  if (
    bucket === "2000-5000"
  ) {
    return (
      price >= 2000 &&
      price <= 5000
    );
  }

  if (
    bucket === "5000-10000"
  ) {
    return (
      price > 5000 &&
      price <= 10000
    );
  }

  if (
    bucket === "a10000"
  ) {
    return price > 10000;
  }

  return true;
}


/* ==========================================================================
   GET FILTERED PRODUCTS
   ========================================================================== */

function getFilteredProducts() {

  let list =
    PRODUCTS.filter(
      product => {

        /* SEARCH */

        if (
          state.search
        ) {

          const query =
            state.search.toLowerCase();

          const text = `
            ${product.name}
            ${product.category}
            ${product.sport}
            ${product.description}
            ${product.brand}
          `.toLowerCase();

          if (
            !text.includes(
              query
            )
          ) {
            return false;
          }
        }


        /* SPORT */

        if (
          state.sports.size &&
          !state.sports.has(
            product.sport
          )
        ) {
          return false;
        }


        /* TYPE */

        if (
          state.types.size &&
          !state.types.has(
            product.category
          )
        ) {
          return false;
        }


        /* PRICE MAX */

        if (
          product.price >
          state.priceMax
        ) {
          return false;
        }


        /* PRICE BUCKET */

        if (
          state.priceBuckets.size
        ) {

          const valid =
            [
              ...state.priceBuckets
            ].some(
              bucket =>
                priceInBucket(
                  product.price,
                  bucket
                )
            );

          if (!valid) {
            return false;
          }
        }


        /* BRAND */

        if (
          state.brands.size &&
          !state.brands.has(
            product.brand
          )
        ) {
          return false;
        }


        /* SIZE */

        if (
          state.sizes.size
        ) {

          const valid =
            product.sizes.some(
              size =>
                state.sizes.has(
                  size
                )
            );

          if (!valid) {
            return false;
          }
        }


        /* RATING */

        if (
          state.minRating &&
          product.rating <
          state.minRating
        ) {
          return false;
        }

        return true;
      }
    );


  /* SORT */

  switch (
    state.sort
  ) {

    case "popular":

      list.sort(
        (a, b) =>
          b.reviews -
          a.reviews
      );

      break;


    case "newest":

      list.sort(
        (a, b) =>
          new Date(
            b.created_at
          ) -
          new Date(
            a.created_at
          )
      );

      break;


    case "price-low":

      list.sort(
        (a, b) =>
          a.price -
          b.price
      );

      break;


    case "price-high":

      list.sort(
        (a, b) =>
          b.price -
          a.price
      );

      break;


    case "rating":

      list.sort(
        (a, b) =>
          b.rating -
          a.rating
      );

      break;

    /* "featured" — keep Supabase's newest-first order as-is */
  }

  return list;
}


/* ==========================================================================
   PRODUCT CARD
   ========================================================================== */

function productCardHTML(product) {

  const liked =
    state.wishlist.some(
      id =>
        String(id) ===
        String(product.id)
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


        <button
          class="
            wishlist-btn
            absolute
            top-3
            right-3
            z-10
            ${
              liked
                ? "active"
                : ""
            }
          "
          data-action="wishlist"
          data-id="${escapeHTML(product.id)}"
          aria-label="Toggle wishlist"
        >
          ♥
        </button>


        <img
          src="${escapeHTML(
            safeImage(product)
          )}"
          alt="${escapeHTML(
            product.name
          )}"
          loading="lazy"
          onerror="
            this.onerror=null;
            this.src='${fallbackImgFor(
              product.sport
            )}';
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


      <div
        class="
          p-4
          flex
          flex-col
          flex-1
        "
      >

        <p
          class="
            text-[11px]
            uppercase
            tracking-wide
          "
          style="
            color:var(--khz-gray)
          "
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
          class="
            text-xs
            line-clamp-2
            mb-2
          "
          style="
            color:var(--khz-gray)
          "
        >
          ${escapeHTML(
            product.description
          )}
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
            style="
              color:var(--khz-gray)
            "
          >
            (${Number(
              product.reviews
            ) || 0})
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

          <span
            class="
              price-current
              text-lg
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
                    price-old
                    text-xs
                  "
                >
                  ${money(
                    product.oldPrice
                  )}
                </span>
              `
              : ""
          }


          ${
            product.discount > 0
              ? `
                <span
                  class="
                    text-xs
                    font-bold
                  "
                  style="
                    color:var(--khz-red)
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
            text-xs
            mb-3
          "
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
          ${
            outOfStock
              ? "disabled"
              : ""
          }
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

  const grid =
    $("#productGrid") ||
    $("#productsContainer");

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


  if (
    state.view === "compact"
  ) {

    grid.className =
      "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4";
  }

  else {

    grid.className =
      "grid grid-cols-2 lg:grid-cols-3 gap-5";
  }


  const empty =
    $("#emptyState");


  if (
    filtered.length === 0
  ) {

    grid.innerHTML = "";

    if (empty) {
      empty.classList.remove(
        "hidden"
      );
    }

  }

  else {

    if (empty) {
      empty.classList.add(
        "hidden"
      );
    }

    grid.innerHTML =
      visible
        .map(
          productCardHTML
        )
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
   TRENDING PRODUCTS
   ========================================================================== */

function renderTrending() {

  const wrap =
    $("#trendingGrid");

  if (!wrap) {
    return;
  }

  const items =
    [...PRODUCTS]
      .sort(
        (a, b) =>
          b.rating -
          a.rating
      )
      .slice(0, 6);


  if (!items.length) {

    wrap.innerHTML = `
      <div
        class="
          col-span-full
          text-center
          py-10
        "
      >

        <p
          class="text-sm"
          style="
            color:var(--khz-gray)
          "
        >
          No products available yet.
        </p>

      </div>
    `;

    return;
  }


  wrap.innerHTML =
    items
      .map(
        product => `
          <div
            class="product-card"
          >

            <div
              class="product-img-wrap"
              style="
                height:210px
              "
            >

              <img
                src="${escapeHTML(
                  safeImage(product)
                )}"
                alt="${escapeHTML(
                  product.name
                )}"
                loading="lazy"
                onerror="
                  this.onerror=null;
                  this.src='${fallbackImgFor(
                    product.sport
                  )}';
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
                  mb-2
                "
              >
                ${escapeHTML(
                  product.name
                )}
              </h3>


              <span
                class="price-current"
              >
                ${money(product.price)}
              </span>


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
        `
      )
      .join("");
}


/* ==========================================================================
   ADD TO CART
   ========================================================================== */

function addToCart(
  id,
  size = null,
  qty = 1
) {

  const product =
    PRODUCTS.find(
      p =>
        String(p.id) ===
        String(id)
    );

  if (!product) {

    showToast(
      "Product not found",
      "cart"
    );

    return;
  }


  if (
    Number(product.stock) <= 0
  ) {

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

    if (
      existing.qty + qty >
      product.stock
    ) {

      showToast(
        `Only ${product.stock} items available`,
        "cart"
      );

      return;
    }

    existing.qty += qty;

  }

  else {

    if (qty > product.stock) {

      showToast(
        `Only ${product.stock} items available`,
        "cart"
      );

      return;
    }

    state.cart.push({

      id:
        product.id,

      size:
        chosenSize,

      qty:
        Math.min(
          qty,
          product.stock
        )
    });
  }


  saveCart();

  renderCart();

  showToast(
    `${product.name} added to cart`,
    "cart"
  );
}


/* ==========================================================================
   UPDATE CART QUANTITY
   ========================================================================== */

function updateCartQty(
  id,
  size,
  delta
) {

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


  const product =
    PRODUCTS.find(
      p =>
        String(p.id) ===
        String(id)
    );


  if (
    delta > 0 &&
    product &&
    item.qty >= product.stock
  ) {

    showToast(
      `Only ${product.stock} items available`,
      "cart"
    );

    return;
  }


  item.qty += delta;


  if (
    item.qty <= 0
  ) {

    state.cart =
      state.cart.filter(
        cartItem =>
          !(
            String(
              cartItem.id
            ) ===
              String(id) &&
            cartItem.size ===
              size
          )
      );

    showToast(
      "Item removed from cart",
      "cart"
    );
  }


  saveCart();

  renderCart();
}


/* ==========================================================================
   REMOVE FROM CART
   ========================================================================== */

function removeFromCart(
  id,
  size
) {

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


  state.cart.forEach(
    item => {

      const product =
        PRODUCTS.find(
          p =>
            String(p.id) ===
            String(item.id)
        );

      if (product) {

        subtotal +=
          product.price *
          Number(
            item.qty || 1
          );
      }
    }
  );


  const shipping =
    subtotal === 0
      ? 0
      : subtotal >= 5000
        ? 0
        : 250;


  return {

    subtotal,

    shipping,

    total:
      subtotal +
      shipping
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
        Number(
          item.qty || 0
        ),
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

  if (body) {

    if (
      state.cart.length === 0
    ) {

      body.innerHTML = `
        <p
          class="
            text-sm
            text-center
            py-16
          "
          style="
            color:var(--khz-gray)
          "
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
          .map(
            item => {

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
                  style="
                    border-color:
                    var(--khz-line)
                  "
                >

                  <img
                    src="${escapeHTML(
                      safeImage(product)
                    )}"
                    class="
                      w-16
                      h-16
                      object-contain
                      rounded-lg
                    "
                    style="
                      background:#141414
                    "
                    onerror="
                      this.onerror=null;
                      this.src='${fallbackImgFor(
                        product.sport
                      )}';
                    "
                  >


                  <div class="flex-1">

                    <p
                      class="
                        text-sm
                        font-bold
                      "
                    >
                      ${escapeHTML(
                        product.name
                      )}
                    </p>


                    <p
                      class="
                        text-xs
                        mb-1
                      "
                      style="
                        color:
                        var(--khz-gray)
                      "
                    >
                      Size:
                      ${escapeHTML(
                        item.size
                      )}
                    </p>


                    <p
                      class="
                        price-current
                        text-sm
                      "
                    >
                      ${money(
                        product.price
                      )}
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
                        "
                        data-action="qtyminus"
                        data-id="${escapeHTML(
                          product.id
                        )}"
                        data-size="${escapeHTML(
                          item.size
                        )}"
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
                        "
                        data-action="qtyplus"
                        data-id="${escapeHTML(
                          product.id
                        )}"
                        data-size="${escapeHTML(
                          item.size
                        )}"
                      >
                        +
                      </button>


                      <button
                        class="
                          ml-auto
                          text-xs
                          underline
                        "
                        style="
                          color:
                          var(--khz-red)
                        "
                        data-action="removecart"
                        data-id="${escapeHTML(
                          product.id
                        )}"
                        data-size="${escapeHTML(
                          item.size
                        )}"
                      >
                        Remove
                      </button>

                    </div>

                  </div>

                </div>
              `;
            }
          )
          .join("");
    }
  }


  const totals =
    cartTotals();


  const subtotal =
    $("#cartSubtotal");

  if (subtotal) {
    subtotal.textContent =
      money(
        totals.subtotal
      );
  }


  const shipping =
    $("#cartShipping");

  if (shipping) {

    shipping.textContent =
      totals.shipping === 0
        ? "FREE"
        : money(
            totals.shipping
          );
  }


  const total =
    $("#cartTotal");

  if (total) {

    total.textContent =
      money(
        totals.total
      );
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

    showToast(
      "Product not found",
      "wishlist"
    );

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


/* ==========================================================================
   WISHLIST UI
   ========================================================================== */

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
        style="
          color:
          var(--khz-gray)
        "
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
      .map(
        id => {

          const product =
            PRODUCTS.find(
              p =>
                String(p.id) ===
                String(id)
            );

          if (!product) {
            return "";
          }

          const outOfStock =
            Number(product.stock) <= 0;

          return `

            <div
              class="
                flex
                gap-3
                py-4
                border-b
              "
            >

              <img
                src="${escapeHTML(
                  safeImage(product)
                )}"
                class="
                  w-16
                  h-16
                  object-contain
                  rounded-lg
                "
                onerror="
                  this.onerror=null;
                  this.src='${fallbackImgFor(
                    product.sport
                  )}';
                "
              >


              <div class="flex-1">

                <p
                  class="
                    text-sm
                    font-bold
                  "
                >
                  ${escapeHTML(
                    product.name
                  )}
                </p>


                <p
                  class="
                    price-current
                    text-sm
                  "
                >
                  ${money(
                    product.price
                  )}
                </p>


                <div
                  class="
                    flex
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
                    data-id="${escapeHTML(
                      product.id
                    )}"
                    ${
                      outOfStock
                        ? "disabled"
                        : ""
                    }
                  >
                    ${
                      outOfStock
                        ? "Unavailable"
                        : "Add to Cart"
                    }
                  </button>


                  <button
                    class="
                      text-xs
                      underline
                    "
                    style="
                      color:
                      var(--khz-red)
                    "
                    data-action="wishlist"
                    data-id="${escapeHTML(
                      product.id
                    )}"
                  >
                    Remove
                  </button>

                </div>

              </div>

            </div>
          `;
        }
      )
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

    showToast(
      "Product not found",
      "cart"
    );

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
      "
    >

      <div
        class="
          p-6
          flex
          items-center
          justify-center
        "
        style="
          background:#141414
        "
      >

        <img
          src="${escapeHTML(
            safeImage(product)
          )}"
          class="
            max-h-80
            object-contain
          "
          onerror="
            this.onerror=null;
            this.src='${fallbackImgFor(
              product.sport
            )}';
          "
        >

      </div>


      <div
        class="
          p-6
          md:p-8
        "
      >

        <p
          class="
            text-xs
            uppercase
            tracking-wide
            mb-1
          "
          style="
            color:
            var(--khz-orange)
          "
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
          >
            ${product.rating || 0}
            (${product.reviews || 0} reviews)
          </span>

        </div>


        <span
          class="
            price-current
            text-2xl
          "
        >
          ${money(product.price)}
        </span>

        ${
          product.oldPrice > product.price
            ? `
              <span
                class="price-old text-sm ml-2"
              >
                ${money(product.oldPrice)}
              </span>
            `
            : ""
        }


        <p
          class="
            text-sm
            mt-4
            mb-5
          "
          style="
            color:
            var(--khz-gray)
          "
        >
          ${escapeHTML(
            product.description
          )}
        </p>


        <p
          class="
            text-xs
            font-bold
            uppercase
            mb-2
          "
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
            product.sizes
              .map(
                size => `
                  <button
                    type="button"
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
            mb-5
          "
          style="
            color:
              ${
                product.stock <= 0
                  ? "var(--khz-red)"
                  : "#00C2A8"
              }
          "
        >
          ${
            product.stock <= 0
              ? "Out of Stock"
              : `In Stock (${product.stock})`
          }
        </p>


        <div
          class="
            flex
            gap-3
          "
        >

          <button
            id="qvAddCart"
            type="button"
            class="
              add-cart-btn
              flex-1
              py-3
              rounded-lg
            "
            ${
              product.stock <= 0
                ? "disabled"
                : ""
            }
          >
            ${
              product.stock <= 0
                ? "Unavailable"
                : "Add to Cart"
            }
          </button>


          <button
            id="qvWishlist"
            type="button"
            class="
              wishlist-btn
              ${
                state.wishlist.some(
                  item =>
                    String(item) ===
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


  $$("#qvSizes .size-pill")
    .forEach(
      button => {

        button.onclick =
          () => {

            quickViewSize =
              button.dataset.size;

            $$("#qvSizes .size-pill")
              .forEach(
                item =>
                  item.classList.remove(
                    "selected"
                  )
              );

            button.classList.add(
              "selected"
            );
          };
      }
    );


  const qvAddCart = $("#qvAddCart");

  if (qvAddCart) {

    qvAddCart.onclick =
      () => {

        addToCart(
          product.id,
          quickViewSize
        );
      };
  }


  const qvWishlist = $("#qvWishlist");

  if (qvWishlist) {

    qvWishlist.onclick =
      () => {

        toggleWishlist(
          product.id
        );

        qvWishlist.classList.toggle(
          "active",
          state.wishlist.some(
            item =>
              String(item) ===
              String(product.id)
          )
        );
      };
  }


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


  el.innerHTML = `
    <span
      style="
        color:
        ${
          type === "wishlist"
            ? "#ff4d6d"
            : "#FF6A00"
        }
      "
    >
      ${type === "wishlist" ? "♥" : "✓"}
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


  container.appendChild(
    el
  );


  setTimeout(
    () => {

      el.classList.add(
        "leaving"
      );

      setTimeout(
        () => el.remove(),
        260
      );

    },
    2400
  );
}


/* ==========================================================================
   FILTERS
   ========================================================================== */

function wireFilters() {

  /* SPORT CHECKBOXES */

  $$('[data-filter="sport"]')
    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",
          () => {

            if (
              checkbox.checked
            ) {

              state.sports.add(
                checkbox.value
              );

            }

            else {

              state.sports.delete(
                checkbox.value
              );
            }


            state.visibleCount = 12;

            syncCategorySelection();

            renderProducts();
          }
        );
      }
    );


  /* TYPE / CATEGORY CHECKBOXES */

  $$('[data-filter="type"]')
    .forEach(
      checkbox => {

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

            state.visibleCount = 12;

            renderProducts();
          }
        );
      }
    );


  /* BRAND CHECKBOXES */

  $$('[data-filter="brand"]')
    .forEach(
      checkbox => {

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

            state.visibleCount = 12;

            renderProducts();
          }
        );
      }
    );


  /* SIZE CHECKBOXES */

  $$('[data-filter="size"]')
    .forEach(
      checkbox => {

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

            state.visibleCount = 12;

            renderProducts();
          }
        );
      }
    );


  /* PRICE BUCKET CHECKBOXES */

  $$('[data-filter="pricebucket"]')
    .forEach(
      checkbox => {

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

            state.visibleCount = 12;

            renderProducts();
          }
        );
      }
    );


  /* RATING FILTER (buttons — click again to unselect) */

  $$('[data-filter="rating"]')
    .forEach(
      button => {

        button.addEventListener(
          "click",
          () => {

            const value =
              Number(
                button.dataset.value
              ) || 0;

            if (
              state.minRating === value
            ) {

              state.minRating = 0;

              $$('[data-filter="rating"]')
                .forEach(
                  item =>
                    item.classList.remove(
                      "selected"
                    )
                );

            }

            else {

              state.minRating = value;

              $$('[data-filter="rating"]')
                .forEach(
                  item =>
                    item.classList.remove(
                      "selected"
                    )
                );

              button.classList.add(
                "selected"
              );
            }

            state.visibleCount = 12;

            renderProducts();
          }
        );
      }
    );


  /* SORT */

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


  /* PRICE SLIDER */

  const priceSlider =
    $("#priceRange");

  if (priceSlider) {

    const initialMax =
      Number(priceSlider.value) ||
      Number(priceSlider.max) ||
      20000;

    state.priceMax = initialMax;

    const label =
      $("#priceRangeLabel");

    if (label) {

      label.textContent =
        money(
          state.priceMax
        );
    }

    priceSlider.addEventListener(
      "input",
      () => {

        state.priceMax =
          Number(
            priceSlider.value
          );

        if (label) {

          label.textContent =
            money(
              state.priceMax
            );
        }

        state.visibleCount = 12;

        renderProducts();
      }
    );
  }


  /* LOAD MORE */

  const loadMore =
    $("#loadMoreBtn");

  if (loadMore) {

    loadMore.addEventListener(
      "click",
      () => {

        state.visibleCount += 9;

        renderProducts();
      }
    );
  }


  /* CLEAR FILTERS */

  const clear =
    $("#clearFiltersBtn");

  if (clear) {

    clear.addEventListener(
      "click",
      clearAllFilters
    );
  }


  const emptyClear =
    $("#emptyClearFiltersBtn");

  if (emptyClear) {

    emptyClear.addEventListener(
      "click",
      clearAllFilters
    );
  }
}


/* ==========================================================================
   CATEGORY CARDS
   ========================================================================== */

function syncCategorySelection() {

  $$(".cat-card")
    .forEach(
      card => {

        card.classList.toggle(
          "selected",

          state.sports.has(
            card.dataset.sport
          )
        );
      }
    );
}


function wireCategoryCards() {

  $$(".cat-card")
    .forEach(
      card => {

        card.addEventListener(
          "click",
          () => {

            const sport =
              card.dataset.sport;

            if (!sport) {
              return;
            }


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
            )
              .forEach(
                checkbox => {

                  checkbox.checked =
                    state.sports.has(
                      sport
                    );
                }
              );


            state.visibleCount = 12;

            renderProducts();
          }
        );
      }
    );
}


/* ==========================================================================
   SEARCH
   ========================================================================== */

function wireSearch() {

  const input =
    $("#searchInput");

  if (!input) {
    return;
  }


  input.addEventListener(
    "input",
    () => {

      state.search =
        input.value.trim();

      state.visibleCount = 12;

      renderProducts();
    }
  );


  /* Prevent an enclosing <form> from reloading the page on Enter */

  input.addEventListener(
    "keydown",
    event => {

      if (event.key === "Enter") {

        event.preventDefault();

        state.search =
          input.value.trim();

        state.visibleCount = 12;

        renderProducts();
      }
    }
  );
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

  state.minRating = 0;

  state.visibleCount = 12;


  $$(
    'input[type="checkbox"]'
  )
    .forEach(
      checkbox =>
        checkbox.checked =
          false
    );


  $$('[data-filter="rating"]')
    .forEach(
      button =>
        button.classList.remove(
          "selected"
        )
    );


  const search =
    $("#searchInput");

  if (search) {
    search.value = "";
  }


  const priceRange =
    $("#priceRange");

  if (priceRange) {

    const maxValue =
      Number(priceRange.max) ||
      20000;

    priceRange.value =
      maxValue;

    state.priceMax =
      maxValue;

  }

  else {

    state.priceMax = 20000;
  }


  const label =
    $("#priceRangeLabel");

  if (label) {
    label.textContent =
      money(state.priceMax);
  }


  const sort =
    $("#sortSelect");

  if (sort) {

    sort.value = "featured";

    state.sort = "featured";
  }


  syncCategorySelection();

  renderProducts();
}


/* ==========================================================================
   DELEGATED ACTIONS
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


      if (
        action === "addcart"
      ) {

        if (button.disabled) {
          return;
        }

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

  const backdrop =
    $("#drawerBackdrop");


  function openDrawer(drawer) {

    if (!drawer) {
      return;
    }

    [
      cartDrawer,
      wishlistDrawer
    ]
      .forEach(
        item => {

          if (item && item !== drawer) {

            item.classList.add(
              "closed"
            );
          }
        }
      );

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
      wishlistDrawer
    ]
      .forEach(
        drawer => {

          if (drawer) {

            drawer.classList.add(
              "closed"
            );
          }
        }
      );


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


  if (backdrop) {

    backdrop.addEventListener(
      "click",
      closeAllDrawers
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


  const quickViewModal =
    $("#quickViewModal");

  if (quickViewModal) {

    quickViewModal.addEventListener(
      "click",
      event => {

        if (event.target === quickViewModal) {

          closeQuickView();
        }
      }
    );
  }


  document.addEventListener(
    "keydown",
    event => {

      if (event.key === "Escape") {

        closeQuickView();

        closeAllDrawers();
      }
    }
  );
}


/* ==========================================================================
   SUPABASE REALTIME
   ========================================================================== */

let realtimeChannel = null;


function setupRealtimeProducts() {

  if (realtimeChannel) {

    console.log(
      "Realtime already active — skipping duplicate subscription."
    );

    return;
  }


  try {

    realtimeChannel =
      supabaseClient
        .channel(
          "products-realtime"
        )
        .on(

          "postgres_changes",

          {
            event: "*",
            schema: "public",
            table: "products"
          },

          async () => {

            console.log(
              "Products updated. Reloading..."
            );

            await loadProductsFromSupabase();

            renderProducts();

            renderTrending();

            renderCart();

            renderWishlistUI();
          }

        )
        .subscribe();

  }

  catch (error) {

    console.error(
      "Could not start Supabase realtime:",
      error
    );
  }
}


/* ==========================================================================
   INIT
   ========================================================================== */

let khzInitialized = false;


async function init() {

  if (khzInitialized) {

    console.log(
      "KHELZONE Shop already initialized — skipping."
    );

    return;
  }

  khzInitialized = true;


  console.log(
    "KHELZONE Shop Initializing..."
  );


  loadCart();

  loadWishlist();


  wireFilters();

  wireSearch();

  wireCategoryCards();

  wireDelegatedActions();

  wireDrawers();


  await loadProductsFromSupabase();


  renderProducts();

  renderTrending();

  renderCart();

  renderWishlistUI();


  setupRealtimeProducts();


  const year =
    $("#yearNow");

  if (year) {

    year.textContent =
      new Date().getFullYear();
  }


  console.log(
    "KHELZONE loaded successfully"
  );
}


/* ==========================================================================
   BOOTSTRAP
   ========================================================================== */

if (document.readyState === "loading") {

  document.addEventListener(
    "DOMContentLoaded",
    init
  );

}

else {

  init();
}