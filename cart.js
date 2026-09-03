/* ==========================================================================
   KHELZONE CART — JAVASCRIPT
   ==========================================================================
   Compatible with:
   - shop.js
   - shop.html
   - cart.html

   Storage Key:
   khz_cart

   Features:
   - Shop → Cart
   - Quantity + / -
   - Remove item
   - Clear cart
   - Item count
   - Subtotal
   - Shipping
   - Free shipping above Rs. 10,000
   - Grand total
   - Coupon support
   - Checkout
   - Empty cart state
   - Cross-tab cart updates
   - You May Also Like
   - Real products from Supabase
   ========================================================================== */

"use strict";


/* ==========================================================================
   STORAGE
   ========================================================================== */

const CART_STORAGE_KEY = "khz_cart";


/* ==========================================================================
   SUPABASE
   ========================================================================== */

const SUPABASE_URL =
    "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";

let cartSupabaseClient = null;

if (window.supabase) {

    try {

        cartSupabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

        console.log(
            "KHELZONE: Supabase connected for recommendations."
        );

    }

    catch (error) {

        console.error(
            "KHELZONE: Supabase initialization failed:",
            error
        );

    }

}

else {

    console.warn(
        "KHELZONE: Supabase library not found."
    );

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


/* ==========================================================================
   CART STATE
   ========================================================================== */

let cart = [];


/* ==========================================================================
   COUPON STATE
   ========================================================================== */

let appliedCoupon = null;

let discountAmount = 0;


/* ==========================================================================
   LOAD CART
   ========================================================================== */

function loadCart() {

    try {

        const saved =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!saved) {

            cart = [];

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (Array.isArray(parsed)) {

            cart = parsed;

        }

        else {

            cart = [];

        }

    }

    catch (error) {

        console.error(
            "KHELZONE: Error loading cart:",
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
            "KHELZONE: Error saving cart:",
            error
        );

    }

}


/* ==========================================================================
   NORMALIZE CART ITEM
   ========================================================================== */

function normalizeCartItem(item) {

    if (!item || typeof item !== "object") {

        return null;

    }


    const quantity =
        Number(
            item.qty ??
            item.quantity ??
            1
        );


    const price =
        Number(
            item.price ?? 0
        );


    return {

        id:
            item.id ??
            item.productId ??
            "",

        productId:
            item.productId ??
            item.id ??
            "",

        name:
            item.name ||
            item.title ||
            "KHELZONE Product",

        category:
            item.category ||
            item.sport ||
            "",

        price:
            Number.isFinite(price)
                ? price
                : 0,

        image:
            item.image ||
            item.image_url ||
            item.thumbnail ||
            "",

        size:
            item.size ||
            "Standard",

        qty:
            Number.isFinite(quantity) &&
            quantity > 0
                ? quantity
                : 1

    };

}


/* ==========================================================================
   CLEAN CART
   ========================================================================== */

function normalizeCart() {

    cart = cart
        .map(normalizeCartItem)
        .filter(
            item =>
                item &&
                item.id !== ""
        );

}


/* ==========================================================================
   GET CART ITEM COUNT
   ========================================================================== */

function getCartItemCount() {

    return cart.reduce(

        (total, item) => {

            const quantity =
                Number(
                    item.qty ??
                    item.quantity ??
                    1
                );


            return total +
                (
                    Number.isFinite(quantity)
                        ? quantity
                        : 1
                );

        },

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
                    item.qty ??
                    item.quantity ??
                    1
                );


            return total +
                (
                    price *
                    (
                        Number.isFinite(quantity)
                            ? quantity
                            : 1
                    )
                );

        },

        0

    );

}


/* ==========================================================================
   GET SHIPPING
   ========================================================================== */

function getShipping(subtotal) {

    if (subtotal <= 0) {

        return 0;

    }


    if (subtotal >= 10000) {

        return 0;

    }


    return 250;

}


/* ==========================================================================
   GET DISCOUNT
   ========================================================================== */

function getDiscount(subtotal) {

    if (
        !appliedCoupon ||
        subtotal <= 0
    ) {

        return 0;

    }


    if (
        appliedCoupon.type === "percentage"
    ) {

        return Math.round(
            subtotal *
            (
                appliedCoupon.value /
                100
            )
        );

    }


    if (
        appliedCoupon.type === "fixed"
    ) {

        return Math.min(
            appliedCoupon.value,
            subtotal
        );

    }


    return 0;

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


    const discount =
        getDiscount(
            subtotal
        );


    return Math.max(
        0,
        subtotal +
        shipping -
        discount
    );

}


/* ==========================================================================
   GET ITEM IMAGE
   ========================================================================== */

function getItemImage(item) {

    if (
        item &&
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

            String(
                item.id ??
                item.productId
            ) ===
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
   UPDATE QUANTITY
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


    if (!item) {

        return;

    }


    const currentQuantity =
        Number(
            item.qty ??
            item.quantity ??
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


    delete item.quantity;


    saveCart();

    renderCart();

    loadRecommendations();

}


/* ==========================================================================
   SET QUANTITY
   ========================================================================== */

function setQuantity(
    productId,
    size,
    quantity
) {

    const item =
        findCartItem(
            productId,
            size
        );


    if (!item) {

        return;

    }


    const newQuantity =
        Number(quantity);


    if (
        !Number.isFinite(newQuantity) ||
        newQuantity <= 0
    ) {

        removeItem(
            productId,
            size
        );

        return;

    }


    item.qty =
        Math.floor(
            newQuantity
        );


    delete item.quantity;


    saveCart();

    renderCart();

    loadRecommendations();

}


/* ==========================================================================
   REMOVE ITEM
   ========================================================================== */

function removeItem(
    productId,
    size = "Standard"
) {

    const oldLength =
        cart.length;


    cart =
        cart.filter(

            item =>

                !(
                    String(
                        item.id ??
                        item.productId
                    ) ===
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


    if (
        cart.length ===
        oldLength
    ) {

        return;

    }


    saveCart();

    renderCart();

    loadRecommendations();


    showToast(
        "Item removed from cart"
    );

}


/* ==========================================================================
   CLEAR ENTIRE CART
   ========================================================================== */

function clearCart(
    showMessage = false
) {

    cart = [];


    appliedCoupon = null;

    discountAmount = 0;


    saveCart();

    renderCart();

    loadRecommendations();


    if (showMessage) {

        showToast(
            "Cart cleared successfully"
        );

    }

}


/* ==========================================================================
   CART ITEM HTML
   ========================================================================== */

function cartItemHTML(item) {

    const quantity =
        Number(
            item.qty ??
            item.quantity ??
            1
        );


    const price =
        Number(
            item.price || 0
        );


    const total =
        price *
        quantity;


    const image =
        getItemImage(item);


    const productId =
        item.id ??
        item.productId ??
        "";


    const size =
        item.size ||
        "Standard";


    return `

        <article
            class="cart-item"
            data-product-id="${escapeHTML(productId)}"
            data-size="${escapeHTML(size)}"
        >

            <div
                class="cart-item__image"
                style="
                    width:72px;
                    height:72px;
                    min-width:72px;
                    max-width:72px;
                    min-height:72px;
                    max-height:72px;
                    flex:0 0 72px;
                    overflow:hidden;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                "
            >

                <img
                    class="cart-item__image-img"
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(item.name)}"
                    loading="lazy"
                    decoding="async"
                    width="72"
                    height="72"
                    style="
                        width:100%;
                        height:100%;
                        min-width:0;
                        min-height:0;
                        max-width:100%;
                        max-height:100%;
                        object-fit:contain;
                        object-position:center;
                        display:block;
                    "
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
                        ${escapeHTML(size)}
                    </strong>

                </p>


                <div class="cart-item__price">

                    ${money(price)}

                </div>

            </div>


            <div class="cart-item__quantity">

                <button
                    type="button"
                    class="quantity-btn"
                    data-cart-action="decrease"
                    data-id="${escapeHTML(productId)}"
                    data-size="${escapeHTML(size)}"
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
                    data-id="${escapeHTML(productId)}"
                    data-size="${escapeHTML(size)}"
                    aria-label="Increase quantity"
                >

                    +

                </button>

            </div>


            <div class="cart-item__total">

                ${money(total)}

            </div>


            <button
                type="button"
                class="cart-item__remove"
                data-cart-action="remove"
                data-id="${escapeHTML(productId)}"
                data-size="${escapeHTML(size)}"
                aria-label="Remove item"
            >

                ×

            </button>

        </article>

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
   GET CART ITEMS CONTAINER
   ========================================================================== */

function getCartItemsContainer() {

    return (

        $("#cart-items-container") ||

        $("#cartItemsContainer") ||

        $("#cartItems") ||

        $(".cart-items")

    );

}


/* ==========================================================================
   RENDER CART ITEMS
   ========================================================================== */

function renderCartItems() {

    const container =
        getCartItemsContainer();


    if (!container) {

        console.warn(
            "KHELZONE: Cart items container not found."
        );

        return;

    }


    if (!cart.length) {

        container.innerHTML =
            emptyCartHTML();

        return;

    }


    container.innerHTML =
        cart
            .map(cartItemHTML)
            .join("");

}


/* ==========================================================================
   UPDATE ITEM COUNT LABEL
   ========================================================================== */

function updateItemCountLabel() {

    const itemCount =
        getCartItemCount();


    const labels = $$(
        "#item-count-label"
    );


    labels.forEach(
        element => {

            element.textContent =
                `${itemCount} ${
                    itemCount === 1
                        ? "ITEM"
                        : "ITEMS"
                }`;

        }
    );


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
   UPDATE CART BADGE
   ========================================================================== */

function updateCartBadge() {

    const itemCount =
        getCartItemCount();


    $$(
        "#cartCount, #cartBadge, [data-cart-count]"
    )
        .forEach(
            element => {

                element.textContent =
                    itemCount;


                element.classList.toggle(
                    "hidden",
                    itemCount === 0
                );

            }
        );

}


/* ==========================================================================
   UPDATE SUBTOTAL
   ========================================================================== */

function updateSubtotal() {

    const subtotal =
        getSubtotal();


    $$(
        "#subtotal-value"
    )
        .forEach(
            element => {

                element.textContent =
                    money(subtotal);

            }
        );


    $$(
        "#cartSubtotal, [data-cart-subtotal]"
    )
        .forEach(
            element => {

                element.textContent =
                    money(subtotal);

            }
        );

}


/* ==========================================================================
   UPDATE SHIPPING
   ========================================================================== */

function updateShipping() {

    const subtotal =
        getSubtotal();


    const shipping =
        getShipping(
            subtotal
        );


    $$(
        "#shipping-value"
    )
        .forEach(
            element => {

                element.textContent =
                    shipping === 0
                        ? "FREE"
                        : money(shipping);

            }
        );


    $$(
        "#cartShipping, [data-cart-shipping]"
    )
        .forEach(
            element => {

                element.textContent =
                    shipping === 0
                        ? "FREE"
                        : money(shipping);

            }
        );

}


/* ==========================================================================
   UPDATE DISCOUNT
   ========================================================================== */

function updateDiscount() {

    const subtotal =
        getSubtotal();


    const discount =
        getDiscount(
            subtotal
        );


    const discountRow =
        $("#discount-row");


    const discountValue =
        $("#discount-value");


    if (discountRow) {

        discountRow.style.display =
            discount > 0
                ? ""
                : "none";

    }


    if (discountValue) {

        discountValue.textContent =
            `- ${money(discount)}`;

    }


    discountAmount =
        discount;

}


/* ==========================================================================
   UPDATE GRAND TOTAL
   ========================================================================== */

function updateGrandTotal() {

    const total =
        getGrandTotal();


    $$(
        "#total-value"
    )
        .forEach(
            element => {

                element.textContent =
                    money(total);

            }
        );


    $$(
        "#cartTotal, #cartGrandTotal, [data-cart-total]"
    )
        .forEach(
            element => {

                element.textContent =
                    money(total);

            }
        );

}


/* ==========================================================================
   FREE SHIPPING MESSAGE
   ========================================================================== */

function updateFreeShipping() {

    const wrap =
        $("#free-ship-wrap");


    const message =
        $("#free-ship-msg");


    const bar =
        $("#free-ship-bar-fill");


    if (!wrap) {

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
        "";


    const threshold =
        10000;


    const remaining =
        Math.max(
            0,
            threshold -
            subtotal
        );


    if (message) {

        if (remaining > 0) {

            message.textContent =
                `Add ${money(remaining)} more for FREE delivery`;

        }

        else {

            message.textContent =
                "🎉 You unlocked FREE delivery!";

        }

    }


    if (bar) {

        const percentage =
            Math.min(
                100,
                (
                    subtotal /
                    threshold
                ) * 100
            );


        bar.style.width =
            `${percentage}%`;

    }

}


/* ==========================================================================
   UPDATE CHECKOUT BUTTON
   ========================================================================== */

function updateCheckoutButton() {

    const buttons =
        $$(
            "#checkout-btn, #checkoutBtn, [data-checkout]"
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


            button.setAttribute(
                "aria-disabled",
                empty
                    ? "true"
                    : "false"
            );

        }
    );

}


/* ==========================================================================
   UPDATE EMPTY STATE
   ========================================================================== */

function updateEmptyState() {

    const emptyState =
        $("#empty-cart-state");


    if (!emptyState) {

        return;

    }


    emptyState.style.display =
        cart.length === 0
            ? ""
            : "none";

}


/* ==========================================================================
   UPDATE SAVED FOR LATER
   ========================================================================== */

function updateSavedForLater() {

    const section =
        $("#saved-for-later-section");


    if (!section) {

        return;

    }


    section.style.display =
        "none";

}


/* ==========================================================================
   UPDATE COUPON NOTE
   ========================================================================== */

function updateCouponNote() {

    const note =
        $("#coupon-applied-note");


    if (!note) {

        return;

    }


    if (!appliedCoupon) {

        note.textContent = "";

        return;

    }


    note.textContent =
        `${appliedCoupon.code} applied`;

}


/* ==========================================================================
   RENDER COMPLETE CART
   ========================================================================== */

function renderCart() {

    normalizeCart();

    renderCartItems();

    updateItemCountLabel();

    updateCartBadge();

    updateSubtotal();

    updateShipping();

    updateDiscount();

    updateGrandTotal();

    updateFreeShipping();

    updateCheckoutButton();

    updateEmptyState();

    updateSavedForLater();

    updateCouponNote();

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


            if (!button) {

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


            if (!productId) {

                return;

            }


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
   CLEAR CART BUTTON
   ========================================================================== */

function wireClearCart() {

    const buttons =
        $$(
            "#clear-cart-btn, #clearCartBtn, [data-clear-cart]"
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

                        clearCart(true);

                    }

                }

            );

        }

    );

}


/* ==========================================================================
   CHECKOUT
   ========================================================================== */

function wireCheckout() {

    const checkoutButtons =
        $$(
            "#checkout-btn, #checkoutBtn, [data-checkout]"
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


                    saveCart();


                    const checkoutData = {

                        items:
                            cart,

                        subtotal:
                            getSubtotal(),

                        shipping:
                            getShipping(
                                getSubtotal()
                            ),

                        discount:
                            getDiscount(
                                getSubtotal()
                            ),

                        total:
                            getGrandTotal(),

                        createdAt:
                            new Date().toISOString()

                    };


                    try {

                        localStorage.setItem(
                            "khz_checkout",
                            JSON.stringify(
                                checkoutData
                            )
                        );

                    }

                    catch (error) {

                        console.error(
                            "Could not save checkout data:",
                            error
                        );

                    }


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
   COUPON SYSTEM
   ========================================================================== */

function wireCoupon() {

    const applyButton =
        $("#coupon-apply-btn");


    const input =
        $("#coupon-input");


    if (
        !applyButton ||
        !input
    ) {

        return;

    }


    applyButton.addEventListener(

        "click",

        event => {

            event.preventDefault();


            const code =
                input.value
                    .trim()
                    .toUpperCase();


            if (!code) {

                showToast(
                    "Enter a coupon code"
                );

                return;

            }


            const coupons = {

                KHEL10: {

                    code: "KHEL10",

                    type: "percentage",

                    value: 10

                },

                KHELZONE10: {

                    code: "KHELZONE10",

                    type: "percentage",

                    value: 10

                },

                SAVE500: {

                    code: "SAVE500",

                    type: "fixed",

                    value: 500

                }

            };


            if (
                !coupons[code]
            ) {

                appliedCoupon = null;

                discountAmount = 0;

                updateCouponNote();

                updateDiscount();

                updateGrandTotal();


                showToast(
                    "Invalid coupon code"
                );

                return;

            }


            appliedCoupon =
                coupons[code];


            discountAmount =
                getDiscount(
                    getSubtotal()
                );


            updateCouponNote();

            updateDiscount();

            updateGrandTotal();


            showToast(
                `${code} applied successfully`
            );

        }

    );

}


/* ==========================================================================
   ENTER KEY FOR COUPON
   ========================================================================== */

function wireCouponEnter() {

    const input =
        $("#coupon-input");


    const button =
        $("#coupon-apply-btn");


    if (
        !input ||
        !button
    ) {

        return;

    }


    input.addEventListener(

        "keydown",

        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                button.click();

            }

        }

    );

}


/* ==========================================================================
   SELECT ALL
   ========================================================================== */

function wireSelectAll() {

    const checkbox =
        $("#select-all-checkbox");


    if (!checkbox) {

        return;

    }


    checkbox.addEventListener(

        "change",

        () => {

            const itemCheckboxes =
                $$(
                    ".cart-item input[type='checkbox']"
                );


            itemCheckboxes.forEach(
                itemCheckbox => {

                    itemCheckbox.checked =
                        checkbox.checked;

                }

            );

        }

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
   TOAST
   ========================================================================== */

let toastTimer = null;


function showToast(message) {

    let toast =
        $("#cartToast");


    if (!toast) {

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
   ============================================================
   YOU MAY ALSO LIKE
   ============================================================
   Real products are loaded from Supabase products table.
   ========================================================================== */


/* ==========================================================================
   GET RECOMMENDATION IMAGE
   ========================================================================== */

function getRecommendationImage(product) {

    if (
        product?.image
    ) {

        return product.image;

    }


    if (
        product?.image_url
    ) {

        return product.image_url;

    }


    if (
        Array.isArray(product?.images) &&
        product.images.length
    ) {

        return product.images[0];

    }


    if (
        typeof product?.images === "string" &&
        product.images.trim()
    ) {

        return product.images;

    }


    if (
        product?.thumbnail
    ) {

        return product.thumbnail;

    }


    return "https://placehold.co/400x400/111111/ffffff?text=KHELZONE";

}


/* ==========================================================================
   RECOMMENDATION CARD
   ========================================================================== */

function recommendationCardHTML(product) {

    const id =
        product.id;


    const name =
        product.name ||
        product.title ||
        "Sports Product";


    const price =
        Number(
            product.price ??
            product.sale_price ??
            0
        );


    const oldPrice =
        Number(
            product.old_price ??
            product.compare_at_price ??
            0
        );


    const category =
        product.category ||
        product.sport ||
        "SPORTS";


    const image =
        getRecommendationImage(
            product
        );


    return `

        <article
            class="recommendation-product"
            data-recommendation-product="${escapeHTML(String(id))}"
        >

            <!-- PRODUCT IMAGE -->

            <div class="recommendation-product__image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(name)}"
                    loading="lazy"
                    decoding="async"
                    onerror="
                        this.onerror=null;
                        this.src='https://placehold.co/400x400/111111/ffffff?text=KHELZONE';
                    "
                >


                <span class="recommendation-product__badge">

                    PICK

                </span>

            </div>


            <!-- PRODUCT CONTENT -->

            <div class="recommendation-product__content">

                <div class="recommendation-product__category">

                    ${escapeHTML(category)}

                </div>


                <h4 class="recommendation-product__name">

                    ${escapeHTML(name)}

                </h4>


                <div class="recommendation-product__rating">

                    <span>★</span>

                    <span>4.8</span>

                    <small>
                        • Popular
                    </small>

                </div>


                <div class="recommendation-product__bottom">

                    <div class="recommendation-product__prices">

                        <strong>

                            ${money(price)}

                        </strong>


                        ${
                            oldPrice > price
                                ? `
                                    <del>
                                        ${money(oldPrice)}
                                    </del>
                                `
                                : ""
                        }

                    </div>


                    <button
                        type="button"
                        class="recommendation-product__add"
                        data-recommendation-add="${escapeHTML(String(id))}"
                        aria-label="Add ${escapeHTML(name)} to cart"
                    >

                        <span class="material-symbols-outlined">

                            add

                        </span>

                    </button>

                </div>

            </div>

        </article>

    `;

}


/* ==========================================================================
   LOAD RECOMMENDATIONS
   ========================================================================== */

async function loadRecommendations() {

    const container =
        $("#recommendations-container");


    if (!container) {

        console.warn(
            "KHELZONE: recommendations-container not found."
        );

        return;

    }


    if (!cartSupabaseClient) {

        console.warn(
            "KHELZONE: Supabase client unavailable."
        );

        container.innerHTML = "";

        return;

    }


    /* Loading */

    container.innerHTML = `

        <div class="recommendation-loading"></div>

        <div class="recommendation-loading"></div>

        <div class="recommendation-loading"></div>

        <div class="recommendation-loading"></div>

    `;


    try {

        /*
           IMPORTANT:
           We do NOT use .eq("is_active", true)

           because shop.js accepts products where
           is_active is true, null, or missing.

           Only products explicitly marked false
           are removed below.
        */

        const {
            data,
            error
        } =
            await cartSupabaseClient

                .from("products")

                .select("*")

                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )

                .limit(30);


        if (error) {

            console.error(
                "KHELZONE: Recommendation query failed:",
                error
            );

            container.innerHTML = "";

            return;

        }


        let products =
            Array.isArray(data)
                ? data.filter(
                    product =>
                        product &&
                        product.is_active !== false
                )
                : [];


        /*
           Remove products already in cart
        */

        const cartProductIds =
            new Set(

                cart.map(
                    item =>
                        String(
                            item.productId ||
                            item.id
                        )
                )

            );


        products =
            products.filter(
                product =>
                    !cartProductIds.has(
                        String(product.id)
                    )
            );


        /*
           Prioritize featured/trending products
        */

        products.sort(

            (a, b) => {

                const scoreA =
                    (a.featured ? 3 : 0) +
                    (a.is_featured ? 3 : 0) +
                    (a.trending ? 2 : 0) +
                    (a.is_trending ? 2 : 0);


                const scoreB =
                    (b.featured ? 3 : 0) +
                    (b.is_featured ? 3 : 0) +
                    (b.trending ? 2 : 0) +
                    (b.is_trending ? 2 : 0);


                return scoreB - scoreA;

            }

        );


        /*
           Show maximum 4 products
        */

        products =
            products.slice(
                0,
                4
            );


        if (!products.length) {

            container.innerHTML = "";

            return;

        }


        /*
           Render cards
        */

        container.innerHTML =
            products
                .map(
                    recommendationCardHTML
                )
                .join("");


        wireRecommendationEvents();


        console.log(
            "KHELZONE: Recommendations loaded:",
            products
        );

    }

    catch (error) {

        console.error(
            "KHELZONE: Recommendation loading error:",
            error
        );

        container.innerHTML = "";

    }

}


/* ==========================================================================
   RECOMMENDATION BUTTON EVENTS
   ========================================================================== */

function wireRecommendationEvents() {

    const buttons =
        $$(
            "[data-recommendation-add]"
        );


    buttons.forEach(

        button => {

            button.addEventListener(

                "click",

                async () => {

                    const productId =
                        button.dataset.recommendationAdd;


                    if (!productId) {

                        return;

                    }


                    if (
                        button.disabled
                    ) {

                        return;

                    }


                    button.disabled =
                        true;


                    const originalHTML =
                        button.innerHTML;


                    button.innerHTML = `

                        <span
                            class="material-symbols-outlined recommendation-spinner"
                        >
                            progress_activity
                        </span>

                    `;


                    const success =
                        await addRecommendationToCart(
                            productId
                        );


                    if (!success) {

                        button.disabled =
                            false;

                        button.innerHTML =
                            originalHTML;

                    }

                }

            );

        }

    );

}


/* ==========================================================================
   ADD RECOMMENDATION TO CART
   ========================================================================== */

async function addRecommendationToCart(
    productId
) {

    if (!cartSupabaseClient) {

        showToast(
            "Products are temporarily unavailable"
        );

        return false;

    }


    try {

        const {
            data: product,
            error
        } =
            await cartSupabaseClient

                .from("products")

                .select("*")

                .eq(
                    "id",
                    productId
                )

                .single();


        if (
            error ||
            !product
        ) {

            console.error(
                "KHELZONE: Could not find recommendation product:",
                error
            );

            showToast(
                "Could not add product"
            );

            return false;

        }


        /*
           Check if product already exists
        */

        const existingIndex =
            cart.findIndex(

                item =>

                    String(
                        item.productId ||
                        item.id
                    ) ===
                    String(
                        product.id
                    )

            );


        if (
            existingIndex !== -1
        ) {

            cart[existingIndex].qty =
                Number(
                    cart[existingIndex].qty ||
                    1
                ) + 1;

        }

        else {

            const image =
                getRecommendationImage(
                    product
                );


            let defaultSize =
                "Standard";


            /*
               If product has sizes,
               use first available size.
            */

            if (
                Array.isArray(
                    product.sizes
                ) &&
                product.sizes.length
            ) {

                defaultSize =
                    product.sizes[0];

            }


            cart.push({

                id:
                    product.id,

                productId:
                    product.id,

                name:
                    product.name ||
                    product.title ||
                    "Sports Product",

                price:
                    Number(
                        product.price ??
                        product.sale_price ??
                        0
                    ),

                image:
                    image,

                size:
                    defaultSize,

                qty:
                    1,

                category:
                    product.category ||
                    product.sport ||
                    ""

            });

        }


        /*
           Save
        */

        saveCart();


        /*
           Refresh cart UI
        */

        renderCart();


        /*
           Refresh recommendation products
           so added product disappears.
        */

        await loadRecommendations();


        showToast(
            "Product added to cart"
        );


        return true;

    }

    catch (error) {

        console.error(
            "KHELZONE: Recommendation add error:",
            error
        );

        showToast(
            "Could not add product"
        );

        return false;

    }

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

            loadRecommendations();

        }

    }

);


/* ==========================================================================
   LISTEN FOR PAGE VISIBILITY
   ========================================================================== */

document.addEventListener(

    "visibilitychange",

    () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            loadCart();

            renderCart();

            loadRecommendations();

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


    /* Load cart saved by shop.js */

    loadCart();


    /* Clean/normalize data */

    normalizeCart();


    /* Save normalized cart */

    saveCart();


    /* Render */

    renderCart();


    /* Events */

    wireCartEvents();

    wireClearCart();

    wireCheckout();

    wireContinueShopping();

    wireCoupon();

    wireCouponEnter();

    wireSelectAll();

    wireMobileMenu();


    /*
       IMPORTANT:
       Load real products from Supabase
       for You May Also Like.
    */

    loadRecommendations();


    console.log(
        "KHELZONE Cart initialized successfully."
    );


    console.log(
        "KHELZONE Cart items:",
        cart
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

    getCart: () =>
        cart,

    getSubtotal,

    getShipping,

    getDiscount,

    getGrandTotal,

    getCartItemCount,

    updateQuantity,

    setQuantity,

    removeItem,

    clearCart,

    renderCart,

    loadRecommendations

};