/* ==========================================================================
   KHELZONE CART — JAVASCRIPT
   Compatible with shop.js
   Storage Key: khz_cart
   ========================================================================== */

"use strict";


/* ==========================================================================
   STORAGE
   ========================================================================== */

const CART_STORAGE_KEY = "khz_cart";


/* ==========================================================================
   HELPERS
   ========================================================================== */

const $ = (selector, context = document) =>
    context.querySelector(selector);


const $$ = (selector, context = document) =>
    Array.from(
        context.querySelectorAll(selector)
    );


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


/* ==========================================================================
   CART STATE
   ========================================================================== */

let cart = [];


/* ==========================================================================
   LOAD CART
   ========================================================================== */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        cart = saved
            ? JSON.parse(saved)
            : [];


        if (
            !Array.isArray(cart)
        ) {

            cart = [];

        }

    }

    catch (error) {

        console.error(
            "Error loading cart:",
            error
        );

        cart = [];

    }

}


/* ==========================================================================
   SAVE CART
   ========================================================================== */

function saveCart() {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );

    }

    catch (error) {

        console.error(
            "Error saving cart:",
            error
        );

    }

}


/* ==========================================================================
   GET CART TOTAL QUANTITY
   ========================================================================== */

function getCartItemCount() {

    return cart.reduce(

        (total, item) =>

            total +

            Number(
                item.qty ||
                item.quantity ||
                1
            ),

        0

    );

}


/* ==========================================================================
   GET SUBTOTAL
   ========================================================================== */

function getSubtotal() {

    return cart.reduce(

        (total, item) => {

            const price =
                Number(
                    item.price || 0
                );


            const quantity =
                Number(
                    item.qty ||
                    item.quantity ||
                    1
                );


            return total +
                (price * quantity);

        },

        0

    );

}


/* ==========================================================================
   GET SHIPPING
   ========================================================================== */

function getShipping(subtotal) {

    if (
        subtotal <= 0
    ) {

        return 0;

    }


    /* Free delivery above Rs. 10,000 */

    if (
        subtotal >= 10000
    ) {

        return 0;

    }


    return 250;

}


/* ==========================================================================
   GET GRAND TOTAL
   ========================================================================== */

function getGrandTotal() {

    const subtotal =
        getSubtotal();


    const shipping =
        getShipping(
            subtotal
        );


    return subtotal +
        shipping;

}


/* ==========================================================================
   GET PRODUCT IMAGE
   ========================================================================== */

function getItemImage(item) {

    if (
        item.image
    ) {

        return item.image;

    }


    return "https://placehold.co/300x300/111111/ffffff?text=KHELZONE";

}


/* ==========================================================================
   FIND CART ITEM
   ========================================================================== */

function findCartItem(
    productId,
    size = "Standard"
) {

    return cart.find(

        item =>

            String(item.id) ===
            String(productId)

            &&

            String(
                item.size ||
                "Standard"
            ) ===

            String(
                size ||
                "Standard"
            )

    );

}


/* ==========================================================================
   UPDATE CART QUANTITY
   ========================================================================== */

function updateQuantity(
    productId,
    size,
    change
) {

    const item =
        findCartItem(
            productId,
            size
        );


    if (
        !item
    ) {

        return;

    }


    const currentQuantity =
        Number(
            item.qty ||
            item.quantity ||
            1
        );


    const newQuantity =
        currentQuantity +
        Number(change);


    if (
        newQuantity <= 0
    ) {

        removeItem(
            productId,
            size
        );

        return;

    }


    item.qty =
        newQuantity;


    saveCart();

    renderCart();

}


/* ==========================================================================
   REMOVE ITEM
   ========================================================================== */

function removeItem(
    productId,
    size = "Standard"
) {

    cart =
        cart.filter(

            item =>

                !(

                    String(item.id) ===
                    String(productId)

                    &&

                    String(
                        item.size ||
                        "Standard"
                    ) ===

                    String(
                        size ||
                        "Standard"
                    )

                )

        );


    saveCart();

    renderCart();

    showToast(
        "Item removed from cart"
    );

}


/* ==========================================================================
   CLEAR ENTIRE CART
   ========================================================================== */

function clearCart() {

    cart = [];


    saveCart();

    renderCart();

}


/* ==========================================================================
   CART ITEM HTML
   ========================================================================== */

function cartItemHTML(item) {

    const quantity =
        Number(
            item.qty ||
            item.quantity ||
            1
        );


    const price =
        Number(
            item.price || 0
        );


    const total =
        price * quantity;


    const image =
        getItemImage(
            item
        );


    return `

        <div
            class="cart-item"
            data-product-id="${escapeHTML(item.id)}"
            data-size="${escapeHTML(item.size || "Standard")}"
        >

            <div class="cart-item__image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(item.name)}"

                    onerror="
                        this.onerror=null;
                        this.src='https://placehold.co/300x300/111111/ffffff?text=KHELZONE';
                    "
                >

            </div>


            <div class="cart-item__info">

                <span class="cart-item__category">

                    ${escapeHTML(
                        item.category ||
                        "KHELZONE"
                    )}

                </span>


                <h3 class="cart-item__name">

                    ${escapeHTML(
                        item.name ||
                        "Product"
                    )}

                </h3>


                <p class="cart-item__size">

                    Size:
                    <strong>

                        ${escapeHTML(
                            item.size ||
                            "Standard"
                        )}

                    </strong>

                </p>


                <div class="cart-item__price">

                    ${money(
                        price
                    )}

                </div>

            </div>


            <div class="cart-item__quantity">

                <button
                    type="button"

                    class="quantity-btn"

                    data-cart-action="decrease"

                    data-id="${escapeHTML(item.id)}"

                    data-size="${escapeHTML(item.size || "Standard")}"

                    aria-label="Decrease quantity"
                >

                    −

                </button>


                <span class="quantity-value">

                    ${quantity}

                </span>


                <button
                    type="button"

                    class="quantity-btn"

                    data-cart-action="increase"

                    data-id="${escapeHTML(item.id)}"

                    data-size="${escapeHTML(item.size || "Standard")}"

                    aria-label="Increase quantity"
                >

                    +

                </button>

            </div>


            <div class="cart-item__total">

                ${money(
                    total
                )}

            </div>


            <button
                type="button"

                class="cart-item__remove"

                data-cart-action="remove"

                data-id="${escapeHTML(item.id)}"

                data-size="${escapeHTML(item.size || "Standard")}"

                aria-label="Remove item"
            >

                ×

            </button>

        </div>

    `;

}


/* ==========================================================================
   EMPTY CART HTML
   ========================================================================== */

function emptyCartHTML() {

    return `

        <div class="empty-cart">

            <div class="empty-cart__icon">

                🛒

            </div>


            <h2>

                Your Cart is Empty

            </h2>


            <p>

                Looks like you haven't added
                any sports gear yet.

            </p>


            <a
                href="shop.html"
                class="btn btn--primary"
            >

                CONTINUE SHOPPING

            </a>

        </div>

    `;

}


/* ==========================================================================
   RENDER CART ITEMS
   ========================================================================== */

function renderCartItems() {

    const container =

        $("#cartItems") ||

        $("#cartItemsContainer") ||

        $(".cart-items");


    if (
        !container
    ) {

        console.warn(
            "Cart items container not found."
        );

        return;

    }


    if (
        !cart.length
    ) {

        container.innerHTML =
            emptyCartHTML();

        return;

    }


    container.innerHTML =
        cart
            .map(
                cartItemHTML
            )
            .join("");

}


/* ==========================================================================
   UPDATE CART SUMMARY
   ========================================================================== */

function updateCartSummary() {

    const subtotal =
        getSubtotal();


    const shipping =
        getShipping(
            subtotal
        );


    const total =
        getGrandTotal();


    const itemCount =
        getCartItemCount();


    /* Subtotal */

    $$(
        "#cartSubtotal, [data-cart-subtotal]"
    )

        .forEach(
            element => {

                element.textContent =
                    money(
                        subtotal
                    );

            }
        );


    /* Shipping */

    $$(
        "#cartShipping, [data-cart-shipping]"
    )

        .forEach(
            element => {

                element.textContent =

                    shipping === 0

                        ? "FREE"

                        : money(
                            shipping
                        );

            }
        );


    /* Grand Total */

    $$(
        "#cartTotal, #cartGrandTotal, [data-cart-total]"
    )

        .forEach(
            element => {

                element.textContent =
                    money(
                        total
                    );

            }
        );


    /* Cart Count */

    $$(
        "#cartBadge, #cartCount, [data-cart-count]"
    )

        .forEach(
            element => {

                element.textContent =
                    itemCount;


                if (
                    element.hasAttribute(
                        "hidden"
                    )
                ) {

                    element.hidden =
                        itemCount === 0;

                }

            }
        );


    /* Item count text */

    $$(
        "#cartItemCount, [data-cart-item-count]"
    )

        .forEach(
            element => {

                element.textContent =
                    `${itemCount} ${
                        itemCount === 1
                            ? "item"
                            : "items"
                    }`;

            }
        );

}


/* ==========================================================================
   UPDATE CHECKOUT BUTTON
   ========================================================================== */

function updateCheckoutButton() {

    const buttons =

        $$(
            "#checkoutBtn, [data-checkout]"
        );


    buttons.forEach(
        button => {

            const empty =
                cart.length === 0;


            button.disabled =
                empty;


            button.classList.toggle(
                "disabled",
                empty
            );

        }
    );

}


/* ==========================================================================
   RENDER COMPLETE CART
   ========================================================================== */

function renderCart() {

    renderCartItems();

    updateCartSummary();

    updateCheckoutButton();

}


/* ==========================================================================
   CART BUTTON EVENTS
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


            event.preventDefault();


            const action =
                button.dataset.cartAction;


            const productId =
                button.dataset.id;


            const size =
                button.dataset.size ||
                "Standard";


            /* INCREASE */

            if (
                action ===
                "increase"
            ) {

                updateQuantity(
                    productId,
                    size,
                    1
                );

            }


            /* DECREASE */

            else if (
                action ===
                "decrease"
            ) {

                updateQuantity(
                    productId,
                    size,
                    -1
                );

            }


            /* REMOVE */

            else if (
                action ===
                "remove"
            ) {

                removeItem(
                    productId,
                    size
                );

            }

        }

    );

}


/* ==========================================================================
   CHECKOUT
   ========================================================================== */

function wireCheckout() {

    const checkoutButtons =

        $$(
            "#checkoutBtn, [data-checkout]"
        );


    checkoutButtons.forEach(
        button => {

            button.addEventListener(

                "click",

                event => {

                    event.preventDefault();


                    if (
                        cart.length === 0
                    ) {

                        showToast(
                            "Your cart is empty"
                        );

                        return;

                    }


                    /*
                       Redirect to payment page
                    */

                    window.location.href =
                        "payment.html";

                }

            );

        }
    );

}


/* ==========================================================================
   CONTINUE SHOPPING
   ========================================================================== */

function wireContinueShopping() {

    const buttons =

        $$(
            "#continueShoppingBtn, [data-continue-shopping]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(

                "click",

                event => {

                    event.preventDefault();


                    window.location.href =
                        "shop.html";

                }

            );

        }
    );

}


/* ==========================================================================
   CLEAR CART BUTTON
   ========================================================================== */

function wireClearCart() {

    const buttons =

        $$(
            "#clearCartBtn, [data-clear-cart]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(

                "click",

                event => {

                    event.preventDefault();


                    if (
                        cart.length === 0
                    ) {

                        return;

                    }


                    const confirmed =
                        confirm(
                            "Are you sure you want to clear your cart?"
                        );


                    if (
                        confirmed
                    ) {

                        clearCart();

                        showToast(
                            "Cart cleared successfully"
                        );

                    }

                }

            );

        }
    );

}


/* ==========================================================================
   TOAST
   ========================================================================== */

let toastTimer = null;


function showToast(message) {

    let toast =
        $("#cartToast");


    if (
        !toast
    ) {

        toast =
            document.createElement(
                "div"
            );


        toast.id =
            "cartToast";


        toast.className =
            "cart-toast";


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

            2500

        );

}


/* ==========================================================================
   MOBILE NAVIGATION
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

}


/* ==========================================================================
   LISTEN FOR CART CHANGES FROM OTHER TABS
   ========================================================================== */

window.addEventListener(

    "storage",

    event => {

        if (
            event.key ===
            CART_STORAGE_KEY
        ) {

            loadCart();

            renderCart();

        }

    }

);


/* ==========================================================================
   INITIALIZE CART
   ========================================================================== */

function initializeCart() {

    console.log(
        "KHELZONE Cart initializing..."
    );


    /* Load saved cart */

    loadCart();


    /* Render cart */

    renderCart();


    /* Events */

    wireCartEvents();

    wireCheckout();

    wireContinueShopping();

    wireClearCart();

    wireMobileMenu();


    console.log(
        "KHELZONE Cart initialized successfully."
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

        initializeCart

    );

}

else {

    initializeCart();

}


/* ==========================================================================
   GLOBAL CART API
   ========================================================================== */

window.KHELZONE_CART = {

    getCart: () => cart,

    getSubtotal,

    getGrandTotal,

    getCartItemCount,

    updateQuantity,

    removeItem,

    clearCart,

    renderCart

};