/* ==========================================================================
   KHELZONE SHOP — JAVASCRIPT
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

  supabaseClient =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );

}

else {

  console.error(
    "Supabase library not loaded."
  );

}


/* ==========================================================================
   HELPERS
   ========================================================================== */

const $ = (
  selector,
  context = document
) =>
  context.querySelector(
    selector
  );


const $$ = (
  selector,
  context = document
) =>
  Array.from(
    context.querySelectorAll(
      selector
    )
  );


function money(value) {

  return `Rs. ${Number(
    value || 0
  ).toLocaleString("en-PK")}`;

}


function escapeHTML(value) {

  return String(
    value ?? ""
  )

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


function safeArray(value) {

  if (
    Array.isArray(value)
  ) {

    return value;

  }


  if (
    typeof value ===
    "string"
  ) {

    try {

      const parsed =
        JSON.parse(value);

      if (
        Array.isArray(parsed)
      ) {

        return parsed;

      }

    }

    catch {

      return value
        .split(",")
        .map(
          item =>
            item.trim()
        )
        .filter(Boolean);

    }

  }


  return [];

}


/* ==========================================================================
   APP STATE
   ========================================================================== */

const state = {

  products: [],

  cart: [],

  wishlist: [],

  search: "",

  sports:
    new Set(),

  types:
    new Set(),

  brands:
    new Set(),

  sizes:
    new Set(),

  priceBuckets:
    new Set(),

  minRating: 0,

  priceMax: 20000,

  sort:
    "featured",

  visibleCount: 12

};


/* ==========================================================================
   LOCAL STORAGE KEYS
   ========================================================================== */

const CART_STORAGE_KEY =
  "khz_cart";


const WISHLIST_STORAGE_KEY =
  "khz_wishlist";


/* ==========================================================================
   CART STORAGE
   ========================================================================== */

function loadCart() {

  try {

    const saved =
      localStorage.getItem(
        CART_STORAGE_KEY
      );


    if (!saved) {

      state.cart = [];

      return;

    }


    const parsed =
      JSON.parse(saved);


    state.cart =
      Array.isArray(parsed)
        ? parsed
        : [];

  }

  catch (error) {

    console.error(
      "Could not load cart:",
      error
    );

    state.cart = [];

  }

}


function saveCart() {

  try {

    localStorage.setItem(
      CART_STORAGE_KEY,

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
      localStorage.getItem(
        WISHLIST_STORAGE_KEY
      );


    if (!saved) {

      state.wishlist = [];

      return;

    }


    const parsed =
      JSON.parse(saved);


    state.wishlist =
      Array.isArray(parsed)
        ? parsed
        : [];

  }

  catch (error) {

    console.error(
      "Could not load wishlist:",
      error
    );

    state.wishlist = [];

  }

}


function saveWishlist() {

  try {

    localStorage.setItem(
      WISHLIST_STORAGE_KEY,

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
   PRODUCT NORMALIZATION
   ========================================================================== */

function normalizeProduct(
  product
) {

  if (!product) {

    return null;

  }


  let sizes =
    safeArray(
      product.sizes
    );


  if (
    !sizes.length
  ) {

    sizes =
      safeArray(
        product.size
      );

  }


  if (
    !sizes.length
  ) {

    sizes = [
      "Standard"
    ];

  }


  return {

    id:
      product.id,

    name:
      product.name ||
      product.title ||
      "KHELZONE Product",

    description:
      product.description ||
      "",

    price:
      Number(
        product.price
      ) || 0,

    oldPrice:
      Number(
        product.old_price ||
        product.oldPrice ||
        0
      ),

    image:
      product.image_url ||
      product.image ||
      product.thumbnail ||
      "",

    images:
      safeArray(
        product.images
      ),

    sport:
      product.sport ||
      product.category ||
      "",

    category:
      product.category ||
      product.sport ||
      "",

    type:
      product.type ||
      product.product_type ||
      "",

    brand:
      product.brand ||
      "",

    rating:
      Number(
        product.rating ||
        0
      ),

    reviews:
      Number(
        product.reviews ||
        0
      ),

    sizes,

    featured:
      Boolean(
        product.featured ||
        product.is_featured
      ),

    trending:
      Boolean(
        product.trending ||
        product.is_trending
      ),

    stock:
      Number(
        product.stock ??
        999
      ),

    active:
      product.is_active !==
      false

  };

}


/* ==========================================================================
   LOAD PRODUCTS FROM SUPABASE
   ========================================================================== */

async function loadProductsFromSupabase() {

  if (!supabaseClient) {

    console.error(
      "Supabase client unavailable."
    );

    state.products = [];

    return;

  }


  try {

    console.log(
      "Loading products from Supabase..."
    );


    const {
      data,
      error
    } =
      await supabaseClient

        .from(
          "products"
        )

        .select(
          "*"
        )

        .order(
          "created_at",
          {
            ascending:
              false
          }
        );


    if (error) {

      throw error;

    }


    state.products =
      (data || [])

        .filter(
          product =>
            product.is_active !==
            false
        )

        .map(
          normalizeProduct
        )

        .filter(
          Boolean
        );


    console.log(
      `${state.products.length} products loaded.`
    );

  }

  catch (error) {

    console.error(
      "Error loading products:",
      error
    );

    state.products = [];

  }

}


/* ==========================================================================
   PRODUCT HELPERS
   ========================================================================== */

function findProduct(
  id
) {

  return state.products.find(

    product =>

      String(
        product.id
      ) ===

      String(
        id
      )

  );

}


function getProductImage(
  product
) {

  if (
    !product
  ) {

    return "";

  }


  if (
    product.image
  ) {

    return product.image;

  }


  if (

    Array.isArray(
      product.images
    ) &&

    product.images.length

  ) {

    return product.images[0];

  }


  return "";

}


function isInWishlist(
  id
) {

  return state.wishlist.some(

    item =>

      String(
        typeof item ===
        "object"

          ? item.id

          : item

      ) ===

      String(id)

  );

}


/* ==========================================================================
   FILTER PRODUCTS
   ========================================================================== */

function getFilteredProducts() {

  let products =
    [...state.products];


  /* SEARCH */

  if (
    state.search
  ) {

    const query =
      state.search
        .toLowerCase();


    products =
      products.filter(
        product => {

          const searchable =
            [

              product.name,

              product.description,

              product.sport,

              product.category,

              product.type,

              product.brand

            ]

              .join(" ")

              .toLowerCase();


          return searchable.includes(
            query
          );

        }
      );

  }


  /* SPORTS */

  if (
    state.sports.size
  ) {

    products =
      products.filter(
        product => {

          const sport =
            String(
              product.sport ||
              product.category ||
              ""
            )

              .trim()

              .toLowerCase();


          return [

            ...state.sports

          ]

            .some(
              selected =>

                sport ===

                String(
                  selected
                )

                  .trim()

                  .toLowerCase()

            );

        }
      );

  }


  /* TYPES */

  if (
    state.types.size
  ) {

    products =
      products.filter(
        product =>

          [...state.types]

            .some(

              type =>

                String(
                  product.type ||
                  ""
                )

                  .toLowerCase() ===

                String(
                  type
                )

                  .toLowerCase()

            )

      );

  }


  /* BRANDS */

  if (
    state.brands.size
  ) {

    products =
      products.filter(
        product =>

          [...state.brands]

            .some(

              brand =>

                String(
                  product.brand ||
                  ""
                )

                  .toLowerCase() ===

                String(
                  brand
                )

                  .toLowerCase()

            )

      );

  }


  /* SIZES */

  if (
    state.sizes.size
  ) {

    products =
      products.filter(
        product =>

          product.sizes.some(
            size =>

              state.sizes.has(
                size
              )
          )

      );

  }


  /* MAX PRICE */

  if (
    state.priceMax
  ) {

    products =
      products.filter(

        product =>

          Number(
            product.price
          ) <=

          Number(
            state.priceMax
          )

      );

  }


  /* MINIMUM RATING */

  if (
    state.minRating > 0
  ) {

    products =
      products.filter(

        product =>

          Number(
            product.rating ||
            0
          ) >=

          state.minRating

      );

  }


  /* PRICE BUCKETS */

  if (
    state.priceBuckets.size
  ) {

    products =
      products.filter(
        product => {

          const price =
            Number(
              product.price
            );


          return [

            ...state.priceBuckets

          ]

            .some(
              bucket => {

                if (
                  bucket ===
                  "under5000"
                ) {

                  return (
                    price < 5000
                  );

                }


                if (
                  bucket ===
                  "5000to10000"
                ) {

                  return (

                    price >= 5000 &&

                    price <= 10000

                  );

                }


                if (
                  bucket ===
                  "10000to15000"
                ) {

                  return (

                    price >= 10000 &&

                    price <= 15000

                  );

                }


                if (
                  bucket ===
                  "above15000"
                ) {

                  return (
                    price > 15000
                  );

                }


                return true;

              }
            );

        }
      );

  }


  /* SORTING */

  if (
    state.sort ===
    "price-low"
  ) {

    products.sort(
      (
        a,
        b
      ) =>

        Number(
          a.price
        ) -

        Number(
          b.price
        )
    );

  }


  else if (
    state.sort ===
    "price-high"
  ) {

    products.sort(
      (
        a,
        b
      ) =>

        Number(
          b.price
        ) -

        Number(
          a.price
        )
    );

  }


  else if (
    state.sort ===
    "rating"
  ) {

    products.sort(
      (
        a,
        b
      ) =>

        Number(
          b.rating ||
          0
        ) -

        Number(
          a.rating ||
          0
        )
    );

  }


  else if (
    state.sort ===
    "newest"
  ) {

    products.reverse();

  }


  return products;

}


/* ==========================================================================
   PRODUCT CARD
   ========================================================================== */

function productCardHTML(
  product
) {

  const image =
    getProductImage(
      product
    );


  const wishlistActive =
    isInWishlist(
      product.id
    );


  const stock =
    Number(
      product.stock
    );


  const outOfStock =
    stock <= 0;


  const rating =
    Number(
      product.rating ||
      0
    );


  return `

    <article
      class="product-card"
      data-product-id="${escapeHTML(product.id)}"
    >

      <div class="product-card__image-wrap">

        <img
          src="${escapeHTML(image)}"

          alt="${escapeHTML(product.name)}"

          class="product-card__image"

          loading="lazy"

          onerror="
            this.onerror=null;
            this.src='https://placehold.co/600x600/111111/ffffff?text=KHELZONE';
          "
        >


        ${
          product.featured

            ? `
              <span class="product-card__badge">
                FEATURED
              </span>
            `

            : ""
        }


        <button
          type="button"

          class="product-card__wishlist ${
            wishlistActive
              ? "active"
              : ""
          }"

          data-action="wishlist"

          data-id="${escapeHTML(product.id)}"

          aria-label="Add ${escapeHTML(product.name)} to wishlist"
        >

          ♥
        </button>


        <div
          class="product-card__overlay"
        >

          <button
            type="button"

            class="product-card__quick"

            data-action="quickview"

            data-id="${escapeHTML(product.id)}"
          >

            QUICK VIEW

          </button>

        </div>

      </div>


      <div class="product-card__content">

        <div class="product-card__meta">

          <span>
            ${escapeHTML(
              product.sport ||
              product.category ||
              "Sports"
            )}
          </span>


          <span>
            ${escapeHTML(
              product.brand ||
              "KHELZONE"
            )}
          </span>

        </div>


        <h3
          class="product-card__title"
        >

          ${escapeHTML(
            product.name
          )}

        </h3>


        <div
          class="product-card__rating"
        >

          <span>
            ★
          </span>

          <span>
            ${rating.toFixed(1)}
          </span>

        </div>


        <div
          class="product-card__bottom"
        >

          <div
            class="product-card__price"
          >

            <strong>

              ${money(
                product.price
              )}

            </strong>


            ${
              product.oldPrice > 0

                ? `

                  <del>

                    ${money(
                      product.oldPrice
                    )}

                  </del>

                `

                : ""

            }

          </div>


          <button
            type="button"

            class="product-card__cart"

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

                ? "OUT OF STOCK"

                : "ADD TO CART"
            }

          </button>

        </div>

      </div>

    </article>

  `;

}


/* ==========================================================================
   RENDER PRODUCTS
   ========================================================================== */

function renderProducts() {

  const grid =
    $("#productGrid") ||
    $("#productsGrid") ||
    $(".product-grid");


  if (!grid) {

    console.warn(
      "Product grid not found."
    );

    return;

  }


  const filtered =
    getFilteredProducts();


  const visible =
    filtered.slice(
      0,
      state.visibleCount
    );


  const resultCount =
    $("#resultCount");


  if (
    resultCount
  ) {

    resultCount.textContent =
      `${filtered.length} products`;

  }


  if (
    !visible.length
  ) {

    grid.innerHTML = `

      <div
        class="empty-products"
      >

        <h3>
          No products found
        </h3>

        <p>
          Try changing your filters.
        </p>

        <button
          type="button"

          id="emptyClearFiltersBtn"

          class="btn btn--primary"
        >

          CLEAR FILTERS

        </button>

      </div>

    `;

  }

  else {

    grid.innerHTML =
      visible

        .map(
          productCardHTML
        )

        .join("");

  }


  const loadMore =
    $("#loadMoreBtn");


  if (
    loadMore
  ) {

    loadMore.style.display =

      filtered.length >
      state.visibleCount

        ? ""

        : "none";

  }

}


/* ==========================================================================
   TRENDING PRODUCTS
   ========================================================================== */

function renderTrending() {

  const container =
    $("#trendingGrid");


  if (
    !container
  ) {

    return;

  }


  const trending =
    state.products

      .filter(
        product =>
          product.trending ||
          product.featured
      )

      .slice(
        0,
        6
      );


  if (
    !trending.length
  ) {

    container.innerHTML =
      "";

    return;

  }


  container.innerHTML =
    trending

      .map(
        productCardHTML
      )

      .join("");

}
/* ==========================================================================
   CART SYSTEM
   ========================================================================== */

function getCartItemCount() {

  return state.cart.reduce(
    (total, item) => {

      return total +
        Number(
          item.qty ||
          item.quantity ||
          1
        );

    },
    0
  );

}


function getCartTotal() {

  return state.cart.reduce(
    (total, item) => {

      return total +

        (
          Number(
            item.price ||
            0
          ) *

          Number(
            item.qty ||
            item.quantity ||
            1
          )
        );

    },
    0
  );

}


function updateCartBadge() {

  const count =
    getCartItemCount();


  const badges = [

    "#cartBadge",

    "#cartCount",

    "#cart-count",

    "[data-cart-count]"

  ];


  badges.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          badge => {

            badge.textContent =
              count;


            if (
              badge.hasAttribute(
                "hidden"
              )
            ) {

              badge.hidden =
                count === 0;

            }


            badge.classList.toggle(
              "is-visible",
              count > 0
            );

          }
        );

    }
  );

}


function updateCartDrawer() {

  const drawerItems =
    $("#cartDrawerItems") ||
    $("#cartDrawerList") ||
    $("#miniCartItems");


  if (
    !drawerItems
  ) {

    return;

  }


  if (
    !state.cart.length
  ) {

    drawerItems.innerHTML = `

      <div class="cart-drawer__empty">

        <p>
          Your cart is empty.
        </p>

      </div>

    `;


    updateCartDrawerTotal();

    return;

  }


  drawerItems.innerHTML =
    state.cart

      .map(
        item => {

          const image =
            item.image ||
            "https://placehold.co/200x200/111111/ffffff?text=KHELZONE";


          return `

            <div
              class="cart-drawer__item"
              data-cart-id="${escapeHTML(item.id)}"
              data-cart-size="${escapeHTML(item.size || 'Standard')}"
            >

              <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(item.name)}"
                onerror="
                  this.onerror=null;
                  this.src='https://placehold.co/200x200/111111/ffffff?text=KHELZONE';
                "
              >


              <div
                class="cart-drawer__info"
              >

                <h4>

                  ${escapeHTML(
                    item.name
                  )}

                </h4>


                <p>

                  Size:
                  ${escapeHTML(
                    item.size ||
                    "Standard"
                  )}

                </p>


                <strong>

                  ${money(
                    item.price
                  )}

                </strong>


                <div
                  class="cart-drawer__quantity"
                >

                  <button
                    type="button"
                    data-cart-action="decrease"
                    data-id="${escapeHTML(item.id)}"
                    data-size="${escapeHTML(item.size || 'Standard')}"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>


                  <span>

                    ${Number(
                      item.qty ||
                      item.quantity ||
                      1
                    )}

                  </span>


                  <button
                    type="button"
                    data-cart-action="increase"
                    data-id="${escapeHTML(item.id)}"
                    data-size="${escapeHTML(item.size || 'Standard')}"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>

                </div>

              </div>


              <button
                type="button"
                class="cart-drawer__remove"
                data-cart-action="remove"
                data-id="${escapeHTML(item.id)}"
                data-size="${escapeHTML(item.size || 'Standard')}"
                aria-label="Remove item"
              >

                ×

              </button>

            </div>

          `;

        }
      )

      .join("");


  updateCartDrawerTotal();

}


function updateCartDrawerTotal() {

  const total =
    getCartTotal();


  const selectors = [

    "#cartDrawerTotal",

    "#miniCartTotal",

    "[data-cart-total]"

  ];


  selectors.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          element => {

            element.textContent =
              money(
                total
              );

          }
        );

    }
  );

}


function refreshCartUI() {

  updateCartBadge();

  updateCartDrawer();

}


/* ==========================================================================
   ADD PRODUCT TO CART
   ========================================================================== */

function addToCart(
  productId,
  selectedSize = null
) {

  const product =
    findProduct(
      productId
    );


  if (
    !product
  ) {

    console.error(
      "Product not found:",
      productId
    );

    return;

  }


  if (
    Number(
      product.stock
    ) <= 0
  ) {

    showToast(
      "This product is out of stock."
    );

    return;

  }


  const size =
    selectedSize ||

    product.sizes?.[0] ||

    "Standard";


  const existingItem =
    state.cart.find(

      item =>

        String(
          item.id
        ) ===

        String(
          product.id
        )

        &&

        String(
          item.size ||
          "Standard"
        ) ===

        String(
          size
        )

    );


  if (
    existingItem
  ) {

    existingItem.qty =
      Number(
        existingItem.qty ||
        1
      ) + 1;

  }

  else {

    state.cart.push({

      id:
        product.id,

      productId:
        product.id,

      name:
        product.name,

      price:
        Number(
          product.price
        ),

      image:
        getProductImage(
          product
        ),

      size,

      qty:
        1

    });

  }


  saveCart();

  refreshCartUI();

  showToast(
    `${product.name} added to cart`
  );

}


/* ==========================================================================
   REMOVE CART ITEM
   ========================================================================== */

function removeFromCart(
  productId,
  size = "Standard"
) {

  state.cart =
    state.cart.filter(

      item =>

        !(

          String(
            item.id
          ) ===

          String(
            productId
          )

          &&

          String(
            item.size ||
            "Standard"
          ) ===

          String(
            size
          )

        )

    );


  saveCart();

  refreshCartUI();

}


/* ==========================================================================
   CHANGE CART QUANTITY
   ========================================================================== */

function changeCartQuantity(
  productId,
  size,
  change
) {

  const item =
    state.cart.find(

      cartItem =>

        String(
          cartItem.id
        ) ===

        String(
          productId
        )

        &&

        String(
          cartItem.size ||
          "Standard"
        ) ===

        String(
          size ||
          "Standard"
        )

    );


  if (
    !item
  ) {

    return;

  }


  const newQuantity =

    Number(
      item.qty ||
      1
    )

    +

    Number(
      change
    );


  if (
    newQuantity <= 0
  ) {

    removeFromCart(
      productId,
      size
    );

    return;

  }


  item.qty =
    newQuantity;


  saveCart();

  refreshCartUI();

}


/* ==========================================================================
   CART EVENT DELEGATION
   ========================================================================== */

function wireCartEvents() {

  document.addEventListener(
    "click",

    event => {

      const button =
        event.target.closest(
          "[data-cart-action]"
        );


      if (
        !button
      ) {

        return;

      }


      const action =
        button.dataset.cartAction;


      const productId =
        button.dataset.id;


      const size =
        button.dataset.size ||
        "Standard";


      if (
        action ===
        "increase"
      ) {

        changeCartQuantity(
          productId,
          size,
          1
        );

      }


      else if (
        action ===
        "decrease"
      ) {

        changeCartQuantity(
          productId,
          size,
          -1
        );

      }


      else if (
        action ===
        "remove"
      ) {

        removeFromCart(
          productId,
          size
        );

      }

    }
  );

}


/* ==========================================================================
   WISHLIST SYSTEM
   ========================================================================== */

function toggleWishlist(
  productId
) {

  const existingIndex =
    state.wishlist.findIndex(

      item =>

        String(

          typeof item ===
          "object"

            ? item.id

            : item

        ) ===

        String(
          productId
        )

    );


  if (
    existingIndex >= 0
  ) {

    state.wishlist.splice(
      existingIndex,
      1
    );


    showToast(
      "Removed from wishlist"
    );

  }

  else {

    state.wishlist.push(
      String(
        productId
      )
    );


    showToast(
      "Added to wishlist"
    );

  }


  saveWishlist();

  renderWishlistUI();

  renderProducts();

  renderTrending();

}


/* ==========================================================================
   RENDER WISHLIST BUTTONS
   ========================================================================== */

function renderWishlistUI() {

  $$(
    '[data-action="wishlist"]'
  )

    .forEach(
      button => {

        const id =
          button.dataset.id;


        const active =
          isInWishlist(
            id
          );


        button.classList.toggle(
          "active",
          active
        );


        button.setAttribute(
          "aria-pressed",
          active
            ? "true"
            : "false"
        );

      }
    );

}


/* ==========================================================================
   TOAST NOTIFICATION
   ========================================================================== */

let toastTimer = null;


function showToast(
  message
) {

  let toast =
    $("#shopToast");


  if (
    !toast
  ) {

    toast =
      document.createElement(
        "div"
      );


    toast.id =
      "shopToast";


    toast.className =
      "shop-toast";


    document.body.appendChild(
      toast
    );

  }


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    toastTimer
  );


  toastTimer =
    setTimeout(
      () => {

        toast.classList.remove(
          "show"
        );

      },
      2800
    );

}


/* ==========================================================================
   QUICK VIEW MODAL
   ========================================================================== */

function openQuickView(
  productId
) {

  const product =
    findProduct(
      productId
    );


  if (
    !product
  ) {

    return;

  }


  let modal =
    $("#quickViewModal");


  if (
    !modal
  ) {

    modal =
      document.createElement(
        "div"
      );


    modal.id =
      "quickViewModal";


    modal.className =
      "quick-view-modal";


    document.body.appendChild(
      modal
    );

  }


  const image =
    getProductImage(
      product
    );


  const sizeOptions =
    product.sizes

      .map(
        (
          size,
          index
        ) => `

          <button
            type="button"

            class="quick-view__size ${
              index === 0
                ? "active"
                : ""
            }"

            data-quick-size="${escapeHTML(size)}"
          >

            ${escapeHTML(size)}

          </button>

        `
      )

      .join("");


  modal.innerHTML = `

    <div
      class="quick-view-modal__backdrop"
      data-quick-close
    ></div>


    <div
      class="quick-view"
      role="dialog"
      aria-modal="true"
    >

      <button
        type="button"

        class="quick-view__close"

        data-quick-close

        aria-label="Close"
      >

        ×

      </button>


      <div
        class="quick-view__image"
      >

        <img
          src="${escapeHTML(image)}"

          alt="${escapeHTML(product.name)}"

          onerror="
            this.onerror=null;
            this.src='https://placehold.co/600x600/111111/ffffff?text=KHELZONE';
          "
        >

      </div>


      <div
        class="quick-view__content"
      >

        <span
          class="quick-view__category"
        >

          ${escapeHTML(
            product.sport ||
            product.category ||
            "Sports"
          )}

        </span>


        <h2>

          ${escapeHTML(
            product.name
          )}

        </h2>


        <div
          class="quick-view__rating"
        >

          ★
          ${Number(
            product.rating ||
            0
          ).toFixed(1)}

        </div>


        <h3>

          ${money(
            product.price
          )}

        </h3>


        <p>

          ${escapeHTML(
            product.description ||
            "Premium sports equipment from KHELZONE."
          )}

        </p>


        <div
          class="quick-view__sizes"
        >

          <span>
            Select Size
          </span>

          <div
            class="quick-view__size-list"
          >

            ${sizeOptions}

          </div>

        </div>


        <button
          type="button"

          class="quick-view__add btn btn--primary"

          data-quick-add="${escapeHTML(product.id)}"
        >

          ADD TO CART

        </button>

      </div>

    </div>

  `;


  document.body.classList.add(
    "modal-open"
  );


  modal.classList.add(
    "show"
  );

}


/* ==========================================================================
   CLOSE QUICK VIEW
   ========================================================================== */

function closeQuickView() {

  const modal =
    $("#quickViewModal");


  if (
    !modal
  ) {

    return;

  }


  modal.classList.remove(
    "show"
  );


  document.body.classList.remove(
    "modal-open"
  );


  setTimeout(
    () => {

      if (
        modal.parentNode
      ) {

        modal.remove();

      }

    },
    250
  );

}
/* ==========================================================================
   HOMEPAGE → SHOP CATEGORY URL FILTER
   Supports:
   shop.html?category=Cricket
   shop.html?sport=Cricket
   ========================================================================== */

function applyCategoryFromURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );


  const category =
    params.get("category") ||
    params.get("sport");


  if (!category) {

    return;

  }


  const decodedCategory =
    decodeURIComponent(
      category
    )
      .trim();


  if (!decodedCategory) {

    return;

  }


  /* Clear previous sport filters */

  state.sports.clear();


  /* Add selected category */

  state.sports.add(
    decodedCategory
  );


  /* Reset visible products */

  state.visibleCount =
    12;


  /* Update UI */

  syncCategorySelection();

  syncSportCheckboxes();


  console.log(
    "Category filter applied from Homepage:",
    decodedCategory
  );

}


/* ==========================================================================
   SYNC CATEGORY SELECTION
   ========================================================================== */

function syncCategorySelection() {

  const selectedSports =
    [
      ...state.sports
    ]
      .map(
        sport =>
          String(sport)
            .trim()
            .toLowerCase()
      );


  const categorySelectors = [

    "[data-category]",

    "[data-sport]",

    ".category-card"

  ];


  categorySelectors.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          element => {

            let category =
              element.dataset.category ||
              element.dataset.sport;


            if (!category) {

              category =
                element
                  .textContent
                  .trim();

            }


            const isActive =
              selectedSports.includes(

                String(category)
                  .trim()
                  .toLowerCase()

              );


            element.classList.toggle(
              "active",
              isActive
            );


            element.classList.toggle(
              "is-active",
              isActive
            );

          }
        );

    }
  );

}


/* ==========================================================================
   SYNC SPORT CHECKBOXES
   ========================================================================== */

function syncSportCheckboxes() {

  $$(
    '[data-filter="sport"]'
  )

    .forEach(
      checkbox => {

        const value =
          checkbox.value
            .trim()
            .toLowerCase();


        checkbox.checked =

          [
            ...state.sports
          ]

            .map(
              sport =>
                String(sport)
                  .trim()
                  .toLowerCase()
            )

            .includes(
              value
            );

      }
    );

}


/* ==========================================================================
   GENERIC FILTER CHECKBOX HANDLER
   ========================================================================== */

function updateSetFilter(
  set,
  value,
  checked
) {

  if (checked) {

    set.add(
      value
    );

  }

  else {

    set.delete(
      value
    );

  }


  state.visibleCount =
    12;


  renderProducts();

}


/* ==========================================================================
   SPORT FILTERS
   ========================================================================== */

function wireSportFilters() {

  $$(
    '[data-filter="sport"]'
  )

    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",

          () => {

            updateSetFilter(

              state.sports,

              checkbox.value,

              checkbox.checked

            );


            syncCategorySelection();

          }

        );

      }
    );

}


/* ==========================================================================
   TYPE FILTERS
   ========================================================================== */

function wireTypeFilters() {

  $$(
    '[data-filter="type"]'
  )

    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",

          () => {

            updateSetFilter(

              state.types,

              checkbox.value,

              checkbox.checked

            );

          }

        );

      }
    );

}


/* ==========================================================================
   BRAND FILTERS
   ========================================================================== */

function wireBrandFilters() {

  $$(
    '[data-filter="brand"]'
  )

    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",

          () => {

            updateSetFilter(

              state.brands,

              checkbox.value,

              checkbox.checked

            );

          }

        );

      }
    );

}


/* ==========================================================================
   SIZE FILTERS
   ========================================================================== */

function wireSizeFilters() {

  $$(
    '[data-filter="size"]'
  )

    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",

          () => {

            updateSetFilter(

              state.sizes,

              checkbox.value,

              checkbox.checked

            );

          }

        );

      }
    );

}


/* ==========================================================================
   PRICE BUCKET FILTERS
   ========================================================================== */

function wirePriceBucketFilters() {

  $$(
    '[data-filter="price"]'
  )

    .forEach(
      checkbox => {

        checkbox.addEventListener(
          "change",

          () => {

            updateSetFilter(

              state.priceBuckets,

              checkbox.value,

              checkbox.checked

            );

          }

        );

      }
    );

}


/* ==========================================================================
   RATING FILTERS
   ========================================================================== */

function wireRatingFilters() {

  $$(
    '[data-filter="rating"]'
  )

    .forEach(
      input => {

        input.addEventListener(
          "change",

          () => {

            if (
              input.checked === false
            ) {

              state.minRating =
                0;

            }

            else {

              state.minRating =
                Number(
                  input.value
                ) || 0;

            }


            state.visibleCount =
              12;


            renderProducts();

          }

        );

      }
    );

}


/* ==========================================================================
   PRICE RANGE
   ========================================================================== */

function wirePriceRange() {

  const range =
    $("#priceRange") ||
    $('[data-price-range]');


  if (!range) {

    return;

  }


  const output =
    $("#priceRangeValue") ||
    $("#priceValue") ||
    $('[data-price-value]');


  const updatePrice = () => {

    state.priceMax =
      Number(
        range.value
      );


    if (
      output
    ) {

      output.textContent =
        money(
          state.priceMax
        );

    }


    state.visibleCount =
      12;


    renderProducts();

  };


  range.addEventListener(
    "input",
    updatePrice
  );


  updatePrice();

}


/* ==========================================================================
   SEARCH
   ========================================================================== */

function wireSearch() {

  const searchInputs = [

    "#shopSearch",

    "#searchInput",

    "[data-shop-search]"

  ];


  searchInputs.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          input => {

            input.addEventListener(
              "input",

              () => {

                state.search =
                  input.value
                    .trim();


                state.visibleCount =
                  12;


                renderProducts();

              }

            );


            input.addEventListener(
              "keydown",

              event => {

                if (
                  event.key ===
                  "Enter"
                ) {

                  event.preventDefault();

                  state.search =
                    input.value
                      .trim();


                  renderProducts();

                }

              }

            );

          }
        );

    }
  );

}


/* ==========================================================================
   CATEGORY CARDS
   ========================================================================== */

function wireCategoryCards() {

  const categoryElements = [

    "[data-category]",

    "[data-sport]"

  ];


  categoryElements.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          element => {

            element.addEventListener(
              "click",

              event => {

                const category =
                  element.dataset.category ||
                  element.dataset.sport;


                if (
                  !category
                ) {

                  return;

                }


                /* If this is an anchor,
                   prevent page reload */

                if (
                  element.tagName ===
                  "A"
                ) {

                  event.preventDefault();

                }


                const normalizedCategory =
                  String(
                    category
                  )
                    .trim();


                const alreadySelected =
                  [
                    ...state.sports
                  ]

                    .map(
                      sport =>
                        String(sport)
                          .trim()
                          .toLowerCase()
                    )

                    .includes(

                      normalizedCategory
                        .toLowerCase()

                    );


                /* Clear existing category */

                state.sports.clear();


                /* Clicking selected category
                   again shows all products */

                if (
                  !alreadySelected
                ) {

                  state.sports.add(
                    normalizedCategory
                  );

                }


                state.visibleCount =
                  12;


                syncCategorySelection();

                syncSportCheckboxes();

                renderProducts();


                /* Update URL without reload */

                const url =
                  new URL(
                    window.location.href
                  );


                if (
                  state.sports.size
                ) {

                  url.searchParams.set(

                    "category",

                    normalizedCategory

                  );

                }

                else {

                  url.searchParams.delete(
                    "category"
                  );

                  url.searchParams.delete(
                    "sport"
                  );

                }


                window.history.replaceState(
                  {},
                  "",
                  url
                );


                /* Scroll to products */

                const productsSection =
                  $("#productsSection") ||
                  $("#productGrid") ||
                  $("#productsGrid");


                if (
                  productsSection
                ) {

                  productsSection.scrollIntoView({

                    behavior:
                      "smooth",

                    block:
                      "start"

                  });

                }

              }

            );

          }
        );

    }
  );

}


/* ==========================================================================
   SORT PRODUCTS
   ========================================================================== */

function wireSort() {

  const sortSelect =
    $("#sortSelect") ||
    $("#sortProducts") ||
    $('[data-sort]');


  if (!sortSelect) {

    return;

  }


  sortSelect.addEventListener(
    "change",

    () => {

      state.sort =
        sortSelect.value ||
        "featured";


      state.visibleCount =
        12;


      renderProducts();

    }

  );

}


/* ==========================================================================
   CLEAR ALL FILTERS
   ========================================================================== */

function clearAllFilters() {

  state.search =
    "";


  state.sports.clear();

  state.types.clear();

  state.brands.clear();

  state.sizes.clear();

  state.priceBuckets.clear();

  state.minRating =
    0;


  state.priceMax =
    20000;


  state.sort =
    "featured";


  state.visibleCount =
    12;


  /* Clear inputs */

  $$(
    'input[type="checkbox"]'
  )

    .forEach(
      checkbox => {

        checkbox.checked =
          false;

      }
    );


  /* Clear search */

  $$(
    "#shopSearch, #searchInput, [data-shop-search]"
  )

    .forEach(
      input => {

        input.value =
          "";

      }
    );


  /* Reset price range */

  const range =
    $("#priceRange") ||
    $('[data-price-range]');


  if (
    range
  ) {

    range.value =
      range.max ||
      20000;

  }


  const priceOutput =
    $("#priceRangeValue") ||
    $("#priceValue") ||
    $('[data-price-value]');


  if (
    priceOutput
  ) {

    priceOutput.textContent =
      money(
        Number(
          range?.value ||
          20000
        )
      );

  }


  /* Reset sort */

  const sortSelect =
    $("#sortSelect") ||
    $("#sortProducts") ||
    $('[data-sort]');


  if (
    sortSelect
  ) {

    sortSelect.value =
      "featured";

  }


  /* Remove category URL */

  const url =
    new URL(
      window.location.href
    );


  url.searchParams.delete(
    "category"
  );

  url.searchParams.delete(
    "sport"
  );


  window.history.replaceState(
    {},
    "",
    url
  );


  syncCategorySelection();

  syncSportCheckboxes();

  renderProducts();

}


/* ==========================================================================
   CLEAR FILTER BUTTONS
   ========================================================================== */

function wireClearFilters() {

  const selectors = [

    "#clearFiltersBtn",

    "#clearAllFilters",

    "[data-clear-filters]"

  ];


  selectors.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          button => {

            button.addEventListener(
              "click",

              event => {

                event.preventDefault();

                clearAllFilters();

              }

            );

          }
        );

    }
  );


  /* Empty state clear button */

  document.addEventListener(
    "click",

    event => {

      const button =
        event.target.closest(
          "#emptyClearFiltersBtn"
        );


      if (
        button
      ) {

        clearAllFilters();

      }

    }

  );

}


/* ==========================================================================
   LOAD MORE PRODUCTS
   ========================================================================== */

function wireLoadMore() {

  const loadMore =
    $("#loadMoreBtn");


  if (!loadMore) {

    return;

  }


  loadMore.addEventListener(
    "click",

    () => {

      state.visibleCount +=
        12;


      renderProducts();

    }

  );

}
/* ==========================================================================
   PRODUCT CARD EVENTS
   ========================================================================== */

function wireProductCardEvents() {

  document.addEventListener(
    "click",

    event => {

      /* ADD TO CART */

      const addCartButton =
        event.target.closest(
          '[data-action="addcart"]'
        );


      if (
        addCartButton
      ) {

        event.preventDefault();


        if (
          addCartButton.disabled
        ) {

          return;

        }


        const productId =
          addCartButton.dataset.id;


        addToCart(
          productId
        );


        return;

      }


      /* WISHLIST */

      const wishlistButton =
        event.target.closest(
          '[data-action="wishlist"]'
        );


      if (
        wishlistButton
      ) {

        event.preventDefault();

        event.stopPropagation();


        const productId =
          wishlistButton.dataset.id;


        toggleWishlist(
          productId
        );


        return;

      }


      /* QUICK VIEW */

      const quickViewButton =
        event.target.closest(
          '[data-action="quickview"]'
        );


      if (
        quickViewButton
      ) {

        event.preventDefault();


        const productId =
          quickViewButton.dataset.id;


        openQuickView(
          productId
        );


        return;

      }

    }

  );

}


/* ==========================================================================
   QUICK VIEW EVENTS
   ========================================================================== */

function wireQuickViewEvents() {

  document.addEventListener(
    "click",

    event => {

      /* CLOSE QUICK VIEW */

      const closeButton =
        event.target.closest(
          "[data-quick-close]"
        );


      if (
        closeButton
      ) {

        closeQuickView();

        return;

      }


      /* SELECT SIZE */

      const sizeButton =
        event.target.closest(
          "[data-quick-size]"
        );


      if (
        sizeButton
      ) {

        event.preventDefault();


        const modal =
          $("#quickViewModal");


        if (
          modal
        ) {

          $$(
            "[data-quick-size]",
            modal
          )

            .forEach(
              button => {

                button.classList.remove(
                  "active"
                );

              }
            );


          sizeButton.classList.add(
            "active"
          );

        }


        return;

      }


      /* ADD TO CART FROM QUICK VIEW */

      const quickAddButton =
        event.target.closest(
          "[data-quick-add]"
        );


      if (
        quickAddButton
      ) {

        event.preventDefault();


        const productId =
          quickAddButton.dataset.quickAdd;


        const modal =
          $("#quickViewModal");


        let selectedSize =
          "Standard";


        if (
          modal
        ) {

          const activeSize =
            $(
              ".quick-view__size.active",
              modal
            );


          if (
            activeSize
          ) {

            selectedSize =
              activeSize.dataset.quickSize ||
              activeSize.textContent.trim();

          }

        }


        addToCart(
          productId,
          selectedSize
        );


        closeQuickView();

        return;

      }

    }

  );


  /* ESC KEY CLOSE */

  document.addEventListener(
    "keydown",

    event => {

      if (
        event.key ===
        "Escape"
      ) {

        closeQuickView();

      }

    }

  );

}


/* ==========================================================================
   CART DRAWER
   ========================================================================== */

function getCartDrawer() {

  return (
    $("#cartDrawer") ||
    $(".cart-drawer") ||
    $("#miniCart")
  );

}


function openCartDrawer() {

  const drawer =
    getCartDrawer();


  if (
    !drawer
  ) {

    return;

  }


  drawer.classList.add(
    "open"
  );


  drawer.classList.add(
    "is-open"
  );


  document.body.classList.add(
    "cart-open"
  );


  updateCartDrawer();

}


function closeCartDrawer() {

  const drawer =
    getCartDrawer();


  if (
    !drawer
  ) {

    return;

  }


  drawer.classList.remove(
    "open"
  );


  drawer.classList.remove(
    "is-open"
  );


  document.body.classList.remove(
    "cart-open"
  );

}


function wireCartDrawer() {

  const openButtons = [

    "#cartButton",

    "#cartBtn",

    "[data-open-cart]",

    ".cart-button"

  ];


  openButtons.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          button => {

            button.addEventListener(
              "click",

              event => {

                event.preventDefault();

                openCartDrawer();

              }

            );

          }
        );

    }
  );


  document.addEventListener(
    "click",

    event => {

      const closeButton =
        event.target.closest(
          "[data-close-cart]"
        );


      if (
        closeButton
      ) {

        closeCartDrawer();

      }

    }

  );

}


/* ==========================================================================
   MOBILE MENU
   ========================================================================== */

function wireMobileMenu() {

  const toggle =
    $("#navToggle") ||
    $(".nav-toggle") ||
    $("[data-nav-toggle]");


  const mobileMenu =
    $("#navMobile") ||
    $(".mobile-nav") ||
    $("[data-mobile-nav]");


  if (
    !toggle ||
    !mobileMenu
  ) {

    return;

  }


  toggle.addEventListener(
    "click",

    () => {

      const isOpen =
        mobileMenu.classList.toggle(
          "open"
        );


      mobileMenu.classList.toggle(
        "is-open",
        isOpen
      );


      toggle.classList.toggle(
        "active",
        isOpen
      );


      toggle.setAttribute(
        "aria-expanded",

        isOpen
          ? "true"
          : "false"
      );

    }

  );


  $$(
    "a",
    mobileMenu
  )

    .forEach(
      link => {

        link.addEventListener(
          "click",

          () => {

            mobileMenu.classList.remove(
              "open"
            );


            mobileMenu.classList.remove(
              "is-open"
            );


            toggle.classList.remove(
              "active"
            );


            toggle.setAttribute(
              "aria-expanded",
              "false"
            );

          }

        );

      }
    );

}


/* ==========================================================================
   CART BADGE CLICK SUPPORT
   ========================================================================== */

function wireCartBadge() {

  const badge =
    $("#cartBadge");


  if (
    !badge
  ) {

    return;

  }


  const parent =
    badge.closest(
      "a, button"
    );


  if (
    !parent
  ) {

    return;

  }


  parent.addEventListener(
    "click",

    () => {

      refreshCartUI();

    }

  );

}


/* ==========================================================================
   INITIALIZE SHOP
   ========================================================================== */

async function initializeShop() {

  console.log(
    "KHELZONE Shop initializing..."
  );


  /* Load saved cart */

  loadCart();


  /* Load saved wishlist */

  loadWishlist();


  /* Update cart immediately */

  refreshCartUI();


  /* Event listeners */

  wireProductCardEvents();

  wireQuickViewEvents();

  wireCartEvents();

  wireCartDrawer();

  wireMobileMenu();

  wireCartBadge();

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


  /* Load products */

  await loadProductsFromSupabase();


    /* Homepage category filter */

  applyCategoryFromURL();


  /* Render products */

 renderProductsImproved();

  renderTrending();

  renderWishlistUI();

  refreshCartUI();


  /* ==========================================================
     AUTO SCROLL TO FILTERED PRODUCTS
     Homepage → Shop category selection
     ========================================================== */

  const params =
    new URLSearchParams(
      window.location.search
    );


  const selectedCategory =
    params.get("category") ||
    params.get("sport");


  if (
    selectedCategory
  ) {

    setTimeout(
      () => {

        const productsSection =
          $("#productsSection") ||
          $("#productGrid") ||
          $("#productsGrid");


        if (
          productsSection
        ) {

          productsSection.scrollIntoView({

            behavior:
              "smooth",

            block:
              "start"

          });

        }

      },

      500
    );

  }


  console.log(
    "KHELZONE Shop initialized successfully."
  );

}


/* ==========================================================================
   START APPLICATION
   ========================================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",

    initializeShop
  );

}

else {

  initializeShop();

}


/* ==========================================================================
   OPTIONAL GLOBAL FUNCTIONS
   Useful for debugging and other pages
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

  refreshCartUI

};
/* ==========================================================================
   KHELZONE SHOP — FINAL CART + WISHLIST + VOLLEYBALL FIX
   Paste this at the VERY END of shop.js
   ========================================================================== */


/* ==========================================================================
   VOLLEYBALL IMAGE FALLBACK
   ========================================================================== */

const VOLLEYBALL_FALLBACK =
  "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=900&q=85";


const originalFallbackImgFor =
  typeof fallbackImgFor === "function"
    ? fallbackImgFor
    : null;


function khelzoneProductImage(product) {

  const sport =
    String(
      product?.sport ||
      product?.category ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    sport.includes("volleyball") ||
    sport.includes("volley ball")
  ) {

    return VOLLEYBALL_FALLBACK;

  }


  if (
    product?.image &&
    String(product.image).trim()
  ) {

    return product.image;

  }


  if (
    originalFallbackImgFor
  ) {

    return originalFallbackImgFor(
      product?.sport
    );

  }


  return VOLLEYBALL_FALLBACK;

}
function starString(rating) {

  const rounded =
    Math.round(
      Number(rating) || 0
    );

  return "★★★★★"
    .split("")
    .map(
      (star, index) =>
        index < rounded
          ? "★"
          : "☆"
    )
    .join("");

}

/* ==========================================================================
   BETTER PRODUCT CARD UI
   ========================================================================== */

function improvedProductCardHTML(product) {

  const liked =
    state.wishlist.some(
      id =>
        String(id) ===
        String(product.id)
    );


  const outOfStock =
    Number(product.stock) <= 0;


  const image =
    khelzoneProductImage(
      product
    );


  return `

    <article
      class="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111318] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-black/30"
      data-id="${escapeHTML(product.id)}"
    >

      <!-- IMAGE -->

      <div class="relative aspect-square overflow-hidden bg-[#0a0c0f]">

        ${
          product.badge
            ? `
              <span
                class="absolute top-3 left-3 z-20 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
              >
                ${escapeHTML(product.badge)}
              </span>
            `
            : ""
        }


        <button
          type="button"
          class="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 text-lg backdrop-blur transition hover:scale-110 ${
            liked
              ? "text-orange-500"
              : "text-white"
          }"
          data-action="wishlist"
          data-id="${escapeHTML(product.id)}"
          aria-label="Add to wishlist"
        >
          ${liked ? "♥" : "♡"}
        </button>


        <img
          src="${escapeHTML(image)}"
          alt="${escapeHTML(product.name)}"
          class="h-full w-full object-contain p-5 transition duration-500 group-hover:scale-105"
          loading="lazy"
          onerror="
            this.onerror=null;
            this.src='${VOLLEYBALL_FALLBACK}';
          "
        >


        <!-- QUICK VIEW -->

        <div
          class="absolute inset-x-0 bottom-0 translate-y-full p-3 transition duration-300 group-hover:translate-y-0"
        >

          <button
            type="button"
            class="w-full rounded-xl bg-white py-3 text-xs font-black uppercase tracking-wider text-black transition hover:bg-orange-500 hover:text-white"
            data-action="quickview"
            data-id="${escapeHTML(product.id)}"
          >
            Quick View
          </button>

        </div>

      </div>


      <!-- CONTENT -->

      <div class="flex flex-1 flex-col p-4">

        <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">

          ${escapeHTML(product.sport || "Sports")}

        </p>


        <h3 class="mt-2 min-h-[44px] text-sm font-bold leading-snug text-white">

          ${escapeHTML(product.name)}

        </h3>


        <p class="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">

          ${escapeHTML(
            product.description ||
            "Premium sports equipment from KHELZONE."
          )}

        </p>


        <!-- RATING -->

        <div class="mt-3 flex items-center gap-2">

          <span class="text-sm tracking-wider text-orange-400">

            ${starString(
              Number(product.rating) || 0
            )}

          </span>

          <span class="text-[11px] text-gray-500">

            (${Number(product.reviews) || 0})

          </span>

        </div>


        <!-- PRICE -->

        <div class="mt-4 flex items-end gap-2">

          <span class="text-lg font-black text-white">

            ${money(product.price)}

          </span>


          ${
            Number(product.oldPrice) >
            Number(product.price)

              ? `

                <span class="pb-0.5 text-xs text-gray-600 line-through">

                  ${money(product.oldPrice)}

                </span>

              `

              : ""
          }

        </div>


        <!-- STOCK -->

        <div class="mt-2 text-[10px] font-bold uppercase tracking-wider">

          ${
            outOfStock

              ? `<span class="text-red-500">Out of Stock</span>`

              : `<span class="text-green-500">In Stock</span>`
          }

        </div>


        <!-- ADD TO CART -->

        <button
          type="button"
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition ${
            outOfStock

              ? "cursor-not-allowed bg-white/5 text-gray-600"

              : "bg-orange-500 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/20"
          }"
          data-action="addcart"
          data-id="${escapeHTML(product.id)}"
          ${outOfStock ? "disabled" : ""}
        >

          <span>

            ${
              outOfStock
                ? "Unavailable"
                : "Add to Cart"
            }

          </span>

          ${
            !outOfStock
              ? `
                <span class="text-base leading-none">
                  +
                </span>
              `
              : ""
          }

        </button>

      </div>

    </article>

  `;

}


/* ==========================================================================
   REPLACE PRODUCT RENDER
   ========================================================================== */

function renderProductsImproved() {

  const grid =
    $("#productGrid");


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
    $("#productCount");


  if (
    count
  ) {

    count.textContent =
      `${filtered.length} Products`;

  }


  const emptyState =
    $("#emptyState");


  if (
    !visible.length
  ) {

    grid.innerHTML =
      "";


    if (
      emptyState
    ) {

      emptyState.classList.remove(
        "hidden"
      );

    }

    return;

  }


  if (
    emptyState
  ) {

    emptyState.classList.add(
      "hidden"
    );

  }


  grid.innerHTML =
    visible
      .map(
        improvedProductCardHTML
      )
      .join("");


  const loadMore =
    $("#loadMoreBtn");


  if (
    loadMore
  ) {

    loadMore.hidden =
      visible.length >=
      filtered.length;

  }

}


/* ==========================================================================
   NAVBAR CART
   ========================================================================== */

function updateNavbarCart() {

  let cart = [];


  try {

    cart =
      JSON.parse(
        localStorage.getItem(
          "khz_cart"
        ) || "[]"
      );

  }

  catch {

    cart = [];

  }


  const totalItems =
    cart.reduce(

      (total, item) =>

        total +
        Number(
          item.qty ||
          item.quantity ||
          1
        ),

      0

    );


  const cartCount =
    $("#cartCount") ||
    $("#cartBadge");


  if (
    cartCount
  ) {

    cartCount.textContent =
      totalItems;


    cartCount.hidden =
      totalItems === 0;


    cartCount.classList.toggle(
      "hidden",
      totalItems === 0
    );

  }

}


/* ==========================================================================
   CART ICON CLICK → CART.HTML
   ========================================================================== */

function connectCartToCartPage() {

  const selectors = [

    "#cartIconBtn",

    "#cartBtn",

    "#cartButton",

    "[data-cart-button]",

    ".cart-icon-btn"

  ];


  selectors.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          button => {

            button.addEventListener(
              "click",

              event => {

                event.preventDefault();


                window.location.href =
                  "cart.html";

              }

            );

          }
        );

    }
  );

}


/* ==========================================================================
   WISHLIST COUNT
   ========================================================================== */

function updateWishlistCount() {

  let wishlist = [];


  try {

    wishlist =
      JSON.parse(
        localStorage.getItem(
          "khz_wishlist"
        ) || "[]"
      );

  }

  catch {

    wishlist = [];

  }


  const wishlistCount =
    $("#wishlistCount") ||
    $("#wishlistBadge");


  if (
    wishlistCount
  ) {

    wishlistCount.textContent =
      wishlist.length;


    wishlistCount.hidden =
      wishlist.length === 0;


    wishlistCount.classList.toggle(
      "hidden",
      wishlist.length === 0
    );

  }

}






/* ==========================================================================
   WISHLIST ICON CLICK
   ========================================================================== */

function connectWishlistButton() {

  const selectors = [

    "#wishlistIconBtn",

    "#wishlistBtn",

    "[data-open-wishlist]",

    ".wishlist-icon-btn"

  ];


  selectors.forEach(
    selector => {

      $$(
        selector
      )

        .forEach(
          button => {

            button.addEventListener(
              "click",

              event => {

                event.preventDefault();


                const wishlistPanel =
                  $("#wishlistPanel") ||
                  $("#wishlistDrawer");


                if (
                  wishlistPanel
                ) {

                  wishlistPanel.classList.toggle(
                    "hidden"
                  );


                  wishlistPanel.classList.toggle(
                    "translate-x-full"
                  );


                  renderWishlistUI();

                }

              }

            );

          }
        );

    }
  );

}


/* ==========================================================================
   KEEP COUNTS SYNCED
   ========================================================================== */

window.addEventListener(
  "storage",

  event => {

    if (
      event.key === "khz_cart"
    ) {

      updateNavbarCart();

    }


    if (
      event.key === "khz_wishlist"
    ) {

      updateWishlistCount();

    }

  }
);


/* ==========================================================================
   FINAL INITIALIZATION
   ========================================================================== */

document.addEventListener(
  "DOMContentLoaded",

  () => {

    setTimeout(
      () => {

        updateNavbarCart();

        updateWishlistCount();

        connectCartToCartPage();

        connectWishlistButton();

      },

      300
    );

  }
);