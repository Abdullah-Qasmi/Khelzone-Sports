/* ============================================================
   KHELZONE PAYMENT.JS
   COMPLETE CLEAN CHECKOUT VERSION
============================================================ */

"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const SUPABASE_URL =
    "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";


const supabaseClient =
    window.supabaseClient ||
    (
        window.supabase &&
        typeof window.supabase.createClient === "function"
            ? window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            )
            : null
    );


/* ============================================================
   GLOBALS
============================================================ */

const CART_KEY = "khz_cart";

let cartItems = [];

let currentUser = null;

let currentProfile = null;

let paymentSettings = null;

let subtotal = 0;

let shipping = 0;

let discount = 0;

let grandTotal = 0;

let isPlacingOrder = false;


/* ============================================================
   BASIC HELPERS
============================================================ */

function getElement(id) {

    return document.getElementById(id);
}


function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatPrice(value) {

    const number =
        Number(value) || 0;

    return (
        "Rs. " +
        number.toLocaleString("en-PK")
    );
}


function getFormValue(...ids) {

    for (const id of ids) {

        const element =
            getElement(id);

        if (
            element &&
            String(element.value || "").trim()
        ) {

            return String(
                element.value
            ).trim();
        }
    }

    return "";
}


/* ============================================================
   FIELD ERRORS
============================================================ */

function setFieldError(
    fieldId,
    errorId,
    message
) {

    const field =
        getElement(fieldId);

    const error =
        getElement(errorId);


    if (field) {

        field.classList.add(
            "border-red-500"
        );
    }


    if (error) {

        if (message) {
            error.textContent =
                message;
        }

        error.classList.remove(
            "hidden"
        );
    }
}


function clearFieldError(
    fieldId,
    errorId
) {

    const field =
        getElement(fieldId);

    const error =
        getElement(errorId);


    if (field) {

        field.classList.remove(
            "border-red-500"
        );
    }


    if (error) {

        error.classList.add(
            "hidden"
        );
    }
}


/* ============================================================
   LOAD CART
============================================================ */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(
                CART_KEY
            );


        if (!savedCart) {

            cartItems = [];

            return cartItems;
        }


        const parsed =
            JSON.parse(
                savedCart
            );


        if (Array.isArray(parsed)) {

            cartItems =
                parsed;

        } else if (
            parsed &&
            Array.isArray(parsed.items)
        ) {

            cartItems =
                parsed.items;

        } else {

            cartItems = [];
        }


        console.log(
            "KHELZONE CART:",
            cartItems
        );


        return cartItems;

    } catch (error) {

        console.error(
            "Cart load error:",
            error
        );

        cartItems = [];

        return cartItems;
    }
}


/* ============================================================
   NORMALIZE CART
============================================================ */

function normalizeCartItem(item) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;
    }


    const id =
        item.id ||
        item.product_id ||
        item.productId;


    if (!id) {
        return null;
    }


    const quantity =
        Math.max(
            1,
            Number(
                item.quantity ??
                item.qty ??
                1
            ) || 1
        );


    const price =
        Number(
            item.price ??
            item.product_price ??
            item.sale_price ??
            0
        ) || 0;


    return {

        ...item,

        id,

        product_id:
            id,

        name:
            item.name ||
            item.product_name ||
            item.title ||
            "Sports Product",

        price,

        quantity,

        image:
            item.image ||
            item.image_url ||
            item.imageUrl ||
            "",

        category:
            item.category ||
            "",

        size:
            item.size ||
            "",

        shippingOrigin:
            item.shippingOrigin ||
            item.shipping_origin ||
            ""
    };
}


/* ============================================================
   PREPARE CART
============================================================ */

function prepareCart() {

    const normalized = [];


    cartItems.forEach(item => {

        const clean =
            normalizeCartItem(
                item
            );


        if (clean) {

            normalized.push(
                clean
            );
        }
    });


    cartItems =
        normalized;


    return cartItems;
}


/* ============================================================
   SAVE CART
============================================================ */

function saveCart() {

    try {

        localStorage.setItem(
            CART_KEY,
            JSON.stringify(
                cartItems
            )
        );

    } catch (error) {

        console.error(
            "Cart save error:",
            error
        );
    }
}


/* ============================================================
   CALCULATE TOTALS
============================================================ */

function calculateTotals() {

    subtotal = 0;


    cartItems.forEach(item => {

        subtotal +=
            (
                Number(item.price) || 0
            ) *
            (
                Number(item.quantity) || 1
            );
    });


    if (subtotal <= 0) {

        shipping = 0;

    } else if (
        subtotal >= 3000
    ) {

        shipping = 0;

    } else {

        shipping = 200;
    }


    discount = 0;


    grandTotal =
        subtotal +
        shipping -
        discount;


    return {

        subtotal,

        shipping,

        discount,

        grandTotal
    };
}


/* ============================================================
   RENDER ORDER ITEMS
============================================================ */

function renderOrderItems() {

    const container =
        getElement(
            "orderItems"
        );


    if (!container) {

        console.warn(
            "orderItems not found."
        );

        return;
    }


    container.innerHTML = "";


    if (
        !cartItems.length
    ) {

        container.innerHTML = `

            <div
                class="
                    py-10
                    text-center
                "
            >

                <div
                    class="
                        mx-auto
                        mb-4
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-white/5
                    "
                >

                    <span
                        class="
                            material-symbols-outlined
                            text-3xl
                            text-white/40
                        "
                    >
                        shopping_cart
                    </span>

                </div>


                <h3
                    class="
                        text-base
                        font-black
                        text-white
                    "
                >
                    Your cart is empty
                </h3>


                <p
                    class="
                        mt-2
                        text-sm
                        text-white/50
                    "
                >
                    Add some sports products
                    before placing your order.
                </p>


                <a
                    href="shop.html"
                    class="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-xl
                        bg-orange-500
                        px-5
                        py-3
                        text-sm
                        font-black
                        uppercase
                        tracking-wide
                        text-black
                    "
                >
                    Continue Shopping
                </a>

            </div>
        `;

        return;
    }


    cartItems.forEach(item => {

        const itemTotal =
            (
                Number(item.price) || 0
            ) *
            (
                Number(item.quantity) || 1
            );


        const image =
            item.image || "";


        let imageHtml = "";


        if (image) {

            imageHtml = `

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(item.name)}"
                    class="
                        h-20
                        w-20
                        rounded-xl
                        object-cover
                        bg-black/20
                    "
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='flex';
                    "
                >

                <div
                    class="
                        hidden
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/5
                    "
                >
                    <span
                        class="
                            material-symbols-outlined
                            text-2xl
                            text-white/30
                        "
                    >
                        sports
                    </span>
                </div>
            `;

        } else {

            imageHtml = `

                <div
                    class="
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/5
                    "
                >
                    <span
                        class="
                            material-symbols-outlined
                            text-2xl
                            text-white/30
                        "
                    >
                        sports
                    </span>
                </div>
            `;
        }


        container.insertAdjacentHTML(
            "beforeend",
            `

            <div
                class="
                    flex
                    gap-4
                    border-b
                    border-white/10
                    py-5
                "
            >

                <div
                    class="shrink-0"
                >
                    ${imageHtml}
                </div>


                <div
                    class="
                        min-w-0
                        flex-1
                    "
                >

                    <div
                        class="
                            flex
                            items-start
                            justify-between
                            gap-3
                        "
                    >

                        <div
                            class="min-w-0"
                        >

                            <h3
                                class="
                                    truncate
                                    text-sm
                                    font-black
                                    text-white
                                "
                            >
                                ${escapeHtml(
                                    item.name
                                )}
                            </h3>


                            ${
                                item.category
                                    ? `
                                        <p
                                            class="
                                                mt-1
                                                text-xs
                                                font-bold
                                                uppercase
                                                text-orange-400
                                            "
                                        >
                                            ${escapeHtml(
                                                item.category
                                            )}
                                        </p>
                                    `
                                    : ""
                            }


                            ${
                                item.size
                                    ? `
                                        <p
                                            class="
                                                mt-1
                                                text-xs
                                                text-white/50
                                            "
                                        >
                                            Size:
                                            ${escapeHtml(
                                                item.size
                                            )}
                                        </p>
                                    `
                                    : ""
                            }

                        </div>


                        <div
                            class="
                                shrink-0
                                text-right
                            "
                        >

                            <p
                                class="
                                    text-sm
                                    font-black
                                    text-orange-400
                                "
                            >
                                ${formatPrice(
                                    itemTotal
                                )}
                            </p>

                        </div>

                    </div>


                    <div
                        class="
                            mt-3
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            class="
                                text-xs
                                font-bold
                                text-white/50
                            "
                        >
                            Qty:
                            ${Number(
                                item.quantity
                            ) || 1}
                        </span>


                        <span
                            class="
                                text-xs
                                text-white/40
                            "
                        >
                            ${formatPrice(
                                item.price
                            )}
                            each
                        </span>

                    </div>

                </div>

            </div>
        `
        );
    });
}


/* ============================================================
   RENDER TOTALS
============================================================ */

function renderTotals() {

    const count =
        cartItems.reduce(
            (total, item) =>
                total +
                (
                    Number(
                        item.quantity
                    ) || 1
                ),
            0
        );


    const countElement =
        getElement(
            "summaryItemCount"
        );


    if (countElement) {

        countElement.textContent =
            `${count} ${
                count === 1
                    ? "item"
                    : "items"
            }`;
    }


    const subtotalElement =
        getElement(
            "subtotalValue"
        );


    if (subtotalElement) {

        subtotalElement.textContent =
            formatPrice(
                subtotal
            );
    }


    const shippingElement =
        getElement(
            "shippingValue"
        );


    if (shippingElement) {

        if (
            shipping === 0 &&
            subtotal > 0
        ) {

            shippingElement.textContent =
                "FREE";

        } else {

            shippingElement.textContent =
                formatPrice(
                    shipping
                );
        }
    }


    const discountRow =
        getElement(
            "discountRow"
        );


    const discountElement =
        getElement(
            "discountValue"
        );


    if (discount > 0) {

        if (discountRow) {

            discountRow.classList.remove(
                "hidden"
            );
        }


        if (discountElement) {

            discountElement.textContent =
                "- " +
                formatPrice(
                    discount
                );
        }

    } else {

        if (discountRow) {

            discountRow.classList.add(
                "hidden"
            );
        }
    }


    const grandTotalElement =
        getElement(
            "grandTotalValue"
        );


    if (grandTotalElement) {

        grandTotalElement.textContent =
            formatPrice(
                grandTotal
            );
    }
}


/* ============================================================
   CART BUTTON
============================================================ */

function updateCartCount() {

    const count =
        cartItems.reduce(
            (total, item) =>
                total +
                (
                    Number(
                        item.quantity
                    ) || 1
                ),
            0
        );


    document
        .querySelectorAll(
            "#cartCount, .cart-count, .cart-badge"
        )
        .forEach(element => {

            element.textContent =
                String(count);

            element.style.display =
                count > 0
                    ? ""
                    : "none";
        });
}


/* ============================================================
   CHECKOUT BUTTON VISIBILITY
============================================================ */

function updateCheckoutVisibility() {

    const button =
        getElement(
            "placeOrderBtn"
        );


    if (!button) {
        return;
    }


    if (!cartItems.length) {

        button.disabled = true;

        button.classList.add(
            "opacity-50",
            "cursor-not-allowed"
        );

    } else {

        button.disabled = false;

        button.classList.remove(
            "opacity-50",
            "cursor-not-allowed"
        );
    }
}


/* ============================================================
   CURRENT USER
============================================================ */

async function loadCurrentUser() {

    if (!supabaseClient) {

        currentUser = null;

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            currentUser = null;

            return null;
        }


        currentUser =
            data?.session?.user ||
            null;


        return currentUser;

    } catch (error) {

        console.error(
            "User error:",
            error
        );

        currentUser = null;

        return null;
    }
}


/* ============================================================
   CUSTOMER PROFILE
============================================================ */

async function loadCustomerProfile() {

    if (
        !supabaseClient ||
        !currentUser?.id
    ) {

        return null;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (error) {

            console.warn(
                "Profile error:",
                error
            );

            return null;
        }


        currentProfile =
            data || null;


        return currentProfile;

    } catch (error) {

        console.warn(
            "Profile exception:",
            error
        );

        return null;
    }
}


/* ============================================================
   FILL CUSTOMER DETAILS
============================================================ */

async function fillCustomerDetails() {

    if (!currentUser) {
        return;
    }


    if (!currentProfile) {

        await loadCustomerProfile();
    }


    const metadata =
        currentUser.user_metadata ||
        {};


    const name =
        currentProfile?.full_name ||
        currentProfile?.name ||
        metadata.full_name ||
        metadata.name ||
        "";


    const phone =
        currentProfile?.phone ||
        metadata.phone ||
        "";


    const email =
        currentUser.email ||
        currentProfile?.email ||
        "";


    const nameField =
        getElement(
            "customerName"
        );


    const emailField =
        getElement(
            "customerEmail"
        );


    const phoneField =
        getElement(
            "customerPhone"
        );


    if (
        nameField &&
        !nameField.value
    ) {

        nameField.value =
            name;
    }


    if (
        emailField &&
        !emailField.value
    ) {

        emailField.value =
            email;
    }


    if (
        phoneField &&
        !phoneField.value
    ) {

        phoneField.value =
            phone;
    }
}


/* ============================================================
   PAYMENT SETTINGS
============================================================ */

async function loadPaymentSettings() {

    if (!supabaseClient) {

        paymentSettings = null;

        return;
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("payment_settings")
                .select("*")
                .limit(1)
                .maybeSingle();


        if (error) {

            console.warn(
                "Payment settings error:",
                error
            );

            paymentSettings = null;

            return;
        }


        paymentSettings =
            data || null;


        console.log(
            "PAYMENT SETTINGS:",
            paymentSettings
        );

    } catch (error) {

        console.warn(
            "Payment settings exception:",
            error
        );

        paymentSettings = null;
    }
}


/* ============================================================
   PAYMENT DETAIL WRAPPER
============================================================ */

function detailsWrapper(
    html
) {

    return `

        <div
            class="
                mt-4
                rounded-2xl
                border
                border-orange-500/20
                bg-orange-500/5
                p-5
                space-y-4
            "
        >
            ${html}
        </div>
    `;
}


/* ============================================================
   CARD DETAILS
============================================================ */

function cardDetailsTemplate() {

    return detailsWrapper(`

        <div
            class="
                flex
                items-center
                gap-3
            "
        >

            <div
                class="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500/10
                "
            >

                <span
                    class="
                        material-symbols-outlined
                        text-orange-500
                    "
                >
                    credit_card
                </span>

            </div>


            <div>

                <h3
                    class="
                        font-black
                        text-lg
                    "
                >
                    Card Payment
                </h3>

                <p
                    class="
                        text-xs
                        text-white/50
                    "
                >
                    Secure card payment
                </p>

            </div>

        </div>


        <div
            class="
                rounded-xl
                border
                border-white/10
                bg-black/20
                p-4
            "
        >

            <p
                class="
                    text-sm
                    text-white/70
                "
            >
                Card payment instructions
                will appear here.
            </p>

            <p
                class="
                    mt-2
                    text-xs
                    text-white/40
                "
            >
                Never share your card PIN,
                CVV or OTP with anyone.
            </p>

        </div>
    `);
}


/* ============================================================
   BANK DETAILS
============================================================ */

function bankDetailsTemplate() {

    const s =
        paymentSettings || {};


    const accountName =
        s.bank_account_name ||
        s.account_name ||
        "KHELZONE";


    const accountNumber =
        s.bank_account_number ||
        s.account_number ||
        "Not configured";


    const bankName =
        s.bank_name ||
        "Not configured";


    return detailsWrapper(`

        <div>

            <h3
                class="
                    text-lg
                    font-black
                "
            >
                Bank Transfer
            </h3>

            <p
                class="
                    mt-1
                    text-xs
                    text-white/50
                "
            >
                Transfer the payment using
                the details below.
            </p>

        </div>


        <div
            class="
                grid
                gap-4
                sm:grid-cols-3
            "
        >

            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    Bank
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        bankName
                    )}
                </p>

            </div>


            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    Account Name
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        accountName
                    )}
                </p>

            </div>


            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    Account Number
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        accountNumber
                    )}
                </p>

            </div>

        </div>


        <div>

            <label
                class="
                    mb-2
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-white/50
                "
            >
                Transaction ID / Reference
            </label>

            <input
                id="paymentReference"
                type="text"
                class="input-field w-full"
                placeholder="Enter transaction ID"
            >

        </div>
    `);
}


/* ============================================================
   EASYPAISA DETAILS
============================================================ */

function easypaisaDetailsTemplate() {

    const s =
        paymentSettings || {};


    const accountName =
        s.easypaisa_account_name ||
        s.easypaisa_name ||
        "KHELZONE";


    const accountNumber =
        s.easypaisa_number ||
        s.easypaisa_account_number ||
        "Not configured";


    return detailsWrapper(`

        <div
            class="
                flex
                items-center
                gap-3
            "
        >

            <div
                class="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500/10
                "
            >

                <span
                    class="
                        material-symbols-outlined
                        text-orange-500
                    "
                >
                    phone_iphone
                </span>

            </div>


            <div>

                <h3
                    class="
                        text-lg
                        font-black
                    "
                >
                    Easypaisa Payment
                </h3>

                <p
                    class="
                        text-xs
                        text-white/50
                    "
                >
                    Send your payment to this
                    Easypaisa account.
                </p>

            </div>

        </div>


        <div
            class="
                grid
                gap-4
                sm:grid-cols-2
            "
        >

            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    Account Name
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        accountName
                    )}
                </p>

            </div>


            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    Easypaisa Number
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        accountNumber
                    )}
                </p>

            </div>

        </div>


        <div>

            <label
                for="senderMobileNumber"
                class="
                    mb-2
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-white/50
                "
            >
                Your Easypaisa Number
            </label>

            <input
                id="senderMobileNumber"
                type="tel"
                class="input-field w-full"
                placeholder="03XX XXXXXXX"
            >

            <p
                id="senderMobileNumberError"
                class="
                    hidden
                    mt-2
                    text-xs
                    text-red-400
                "
            >
                Please enter the Easypaisa
                number you paid from.
            </p>

        </div>


        <div>

            <label
                for="paymentReference"
                class="
                    mb-2
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-white/50
                "
            >
                Transaction ID / Reference
            </label>

            <input
                id="paymentReference"
                type="text"
                class="input-field w-full"
                placeholder="Enter transaction ID"
            >

        </div>
    `);
}


/* ============================================================
   JAZZCASH DETAILS
============================================================ */

function jazzcashDetailsTemplate() {

    const s =
        paymentSettings || {};


    const accountName =
        s.jazzcash_account_name ||
        s.jazzcash_name ||
        "KHELZONE";


    const accountNumber =
        s.jazzcash_number ||
        s.jazzcash_account_number ||
        "Not configured";


    return detailsWrapper(`

        <div
            class="
                flex
                items-center
                gap-3
            "
        >

            <div
                class="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500/10
                "
            >

                <span
                    class="
                        material-symbols-outlined
                        text-orange-500
                    "
                >
                    phone_iphone
                </span>

            </div>


            <div>

                <h3
                    class="
                        text-lg
                        font-black
                    "
                >
                    JazzCash Payment
                </h3>

                <p
                    class="
                        text-xs
                        text-white/50
                    "
                >
                    Send your payment to this
                    JazzCash account.
                </p>

            </div>

        </div>


        <div
            class="
                grid
                gap-4
                sm:grid-cols-2
            "
        >

            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    Account Name
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        accountName
                    )}
                </p>

            </div>


            <div
                class="
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    p-4
                "
            >

                <p
                    class="
                        text-xs
                        uppercase
                        text-white/40
                    "
                >
                    JazzCash Number
                </p>

                <p
                    class="
                        mt-1
                        font-black
                    "
                >
                    ${escapeHtml(
                        accountNumber
                    )}
                </p>

            </div>

        </div>


        <div>

            <label
                for="senderMobileNumber"
                class="
                    mb-2
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-white/50
                "
            >
                Your JazzCash Number
            </label>

            <input
                id="senderMobileNumber"
                type="tel"
                class="input-field w-full"
                placeholder="03XX XXXXXXX"
            >

            <p
                id="senderMobileNumberError"
                class="
                    hidden
                    mt-2
                    text-xs
                    text-red-400
                "
            >
                Please enter the JazzCash
                number you paid from.
            </p>

        </div>


        <div>

            <label
                for="paymentReference"
                class="
                    mb-2
                    block
                    text-xs
                    font-bold
                    uppercase
                    text-white/50
                "
            >
                Transaction ID / Reference
            </label>

            <input
                id="paymentReference"
                type="text"
                class="input-field w-full"
                placeholder="Enter transaction ID"
            >

        </div>
    `);
}


/* ============================================================
   COD DETAILS
============================================================ */

function codDetailsTemplate() {

    return detailsWrapper(`

        <div
            class="
                flex
                items-center
                gap-3
            "
        >

            <div
                class="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500/10
                "
            >

                <span
                    class="
                        material-symbols-outlined
                        text-orange-500
                    "
                >
                    payments
                </span>

            </div>


            <div>

                <h3
                    class="
                        text-lg
                        font-black
                    "
                >
                    Cash on Delivery
                </h3>

                <p
                    class="
                        mt-1
                        text-sm
                        text-white/60
                    "
                >
                    Pay when your order is
                    delivered to your address.
                </p>

            </div>

        </div>
    `);
}


/* ============================================================
   PAYMENT DETAILS RENDER
============================================================ */

function renderPaymentDetailsUI(
    method
) {

    const container =
        getElement(
            "paymentDetails"
        );


    if (!container) {

        console.warn(
            "paymentDetails container not found."
        );

        return;
    }


    let html = "";


    switch (method) {

        case "card":

            html =
                cardDetailsTemplate();

            break;


        case "bank":

            html =
                bankDetailsTemplate();

            break;


        case "easypaisa":

            html =
                easypaisaDetailsTemplate();

            break;


        case "jazzcash":

            html =
                jazzcashDetailsTemplate();

            break;


        case "cod":

        case "cash_on_delivery":

            html =
                codDetailsTemplate();

            break;


        default:

            html = "";
    }


    container.innerHTML =
        html;


    attachDynamicFieldListeners();
}


/* ============================================================
   PAYMENT OPTION HIGHLIGHT
============================================================ */

function highlightPaymentOption(
    method
) {

    document
        .querySelectorAll(
            ".payment-option"
        )
        .forEach(option => {

            const optionMethod =
                option.dataset.paymentOption;


            option.classList.toggle(
                "active",
                optionMethod === method
            );
        });
}


/* ============================================================
   PAYMENT METHODS
============================================================ */

function setupPaymentMethods() {

    const methods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    methods.forEach(radio => {

        radio.addEventListener(
            "change",
            function() {

                const method =
                    this.value;


                highlightPaymentOption(
                    method
                );


                renderPaymentDetailsUI(
                    method
                );
            }
        );
    });


    /*
       Click anywhere on payment card
    */

    document
        .querySelectorAll(
            ".payment-option"
        )
        .forEach(option => {

            option.addEventListener(
                "click",
                function(event) {

                    const radio =
                        this.querySelector(
                            'input[name="paymentMethod"]'
                        );


                    if (!radio) {
                        return;
                    }


                    if (
                        event.target === radio
                    ) {
                        return;
                    }


                    radio.checked =
                        true;


                    radio.dispatchEvent(
                        new Event(
                            "change",
                            {
                                bubbles: true
                            }
                        )
                    );
                }
            );
        });


    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (selected) {

        highlightPaymentOption(
            selected.value
        );


        renderPaymentDetailsUI(
            selected.value
        );
    }
}


/* ============================================================
   DYNAMIC PAYMENT INPUT LISTENERS
============================================================ */

function attachDynamicFieldListeners() {

    const fields = [

        "paymentReference",

        "senderMobileNumber",

        "senderAccountTitle",

        "senderAccountNumber"
    ];


    fields.forEach(id => {

        const field =
            getElement(id);


        if (!field) {
            return;
        }


        field.addEventListener(
            "input",
            function() {

                this.classList.remove(
                    "border-red-500"
                );


                const error =
                    getElement(
                        id + "Error"
                    );


                if (error) {

                    error.classList.add(
                        "hidden"
                    );
                }
            }
        );
    });
}


/* ============================================================
   SELECTED PAYMENT METHOD
============================================================ */

function getSelectedPaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    return (
        selected?.value ||
        "cod"
    );
}


/* ============================================================
   VALIDATE CUSTOMER
============================================================ */

function validateCustomerDetails() {

    let valid = true;

    let firstInvalid = null;


    const name =
        getFormValue(
            "customerName",
            "name",
            "fullName"
        );


    if (!name) {

        setFieldError(
            "customerName",
            "nameError",
            "Please enter your full name."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            getElement(
                "customerName"
            );

    } else {

        clearFieldError(
            "customerName",
            "nameError"
        );
    }


    const email =
        getFormValue(
            "customerEmail",
            "email"
        );


    if (!email) {

        setFieldError(
            "customerEmail",
            "emailError",
            "Please enter your email."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            getElement(
                "customerEmail"
            );

    } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email)
    ) {

        setFieldError(
            "customerEmail",
            "emailError",
            "Please enter a valid email."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            getElement(
                "customerEmail"
            );

    } else {

        clearFieldError(
            "customerEmail",
            "emailError"
        );
    }


    const phone =
        getFormValue(
            "customerPhone",
            "phone"
        );


    const phoneDigits =
        phone.replace(
            /\D/g,
            ""
        );


    if (
        !phone ||
        phoneDigits.length < 10
    ) {

        setFieldError(
            "customerPhone",
            "phoneError",
            "Please enter a valid phone number."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            getElement(
                "customerPhone"
            );

    } else {

        clearFieldError(
            "customerPhone",
            "phoneError"
        );
    }


    const city =
        getFormValue(
            "customerCity",
            "city"
        );


    if (!city) {

        setFieldError(
            "customerCity",
            "cityError",
            "Please enter your city."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            getElement(
                "customerCity"
            );

    } else {

        clearFieldError(
            "customerCity",
            "cityError"
        );
    }


    const address =
        getFormValue(
            "customerAddress",
            "address"
        );


    if (!address) {

        setFieldError(
            "customerAddress",
            "addressError",
            "Please enter your delivery address."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            getElement(
                "customerAddress"
            );

    } else {

        clearFieldError(
            "customerAddress",
            "addressError"
        );
    }


    if (
        firstInvalid
    ) {

        try {

            firstInvalid.focus();

            firstInvalid.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        } catch (error) {}
    }


    return valid;
}


/* ============================================================
   VALIDATE PAYMENT
============================================================ */

function validatePaymentMethod() {

    const method =
        getSelectedPaymentMethod();


    if (
        method === "easypaisa" ||
        method === "jazzcash"
    ) {

        const sender =
            getElement(
                "senderMobileNumber"
            );


        const digits =
            sender
                ? sender.value.replace(
                    /\D/g,
                    ""
                )
                : "";


        if (
            !sender ||
            digits.length < 10
        ) {

            setFieldError(
                "senderMobileNumber",
                "senderMobileNumberError",

                method === "jazzcash"
                    ? "Please enter the JazzCash number you paid from."
                    : "Please enter the Easypaisa number you paid from."
            );


            try {

                sender?.focus();

            } catch (error) {}


            return false;
        }
    }


    return true;
}


/* ============================================================
   BUILD ORDER
============================================================ */

function buildOrder() {

    const customerName =
        getFormValue(
            "customerName",
            "name",
            "fullName"
        );


    const customerEmail =
        getFormValue(
            "customerEmail",
            "email"
        );


    const customerPhone =
        getFormValue(
            "customerPhone",
            "phone"
        );


    const customerAddress =
        getFormValue(
            "customerAddress",
            "address"
        );


    const customerCity =
        getFormValue(
            "customerCity",
            "city"
        );


    const paymentMethod =
        getSelectedPaymentMethod();


    const paymentReference =
        getFormValue(
            "paymentReference"
        );


    let paymentSenderInfo =
        null;


    if (
        paymentMethod === "bank"
    ) {

        paymentSenderInfo = {

            account_title:
                getFormValue(
                    "senderAccountTitle"
                ),

            account_number:
                getFormValue(
                    "senderAccountNumber"
                )
        };

    } else if (
        paymentMethod === "easypaisa" ||
        paymentMethod === "jazzcash"
    ) {

        paymentSenderInfo = {

            mobile_number:
                getFormValue(
                    "senderMobileNumber"
                )
        };
    }


    const orderNumber =
        `KZ-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;


    return {

        orderNumber,

        user_id:
            currentUser?.id ||
            null,

        customer_id:
            currentUser?.id ||
            null,

        customer_name:
            customerName,

        customer_email:
            customerEmail,

        customer_phone:
            customerPhone,

        shipping_address:
            customerAddress,

        city:
            customerCity,

        payment_method:
            paymentMethod,

        payment_reference:
            paymentReference,

        payment_sender_info:
            paymentSenderInfo,

        items:
            cartItems.map(item => ({

                product_id:
                    item.id,

                name:
                    item.name,

                price:
                    Number(
                        item.price
                    ) || 0,

                quantity:
                    Number(
                        item.quantity
                    ) || 1,

                size:
                    item.size ||
                    "",

                image_url:
                    item.image ||
                    "",

                category:
                    item.category ||
                    "",

                shipping_origin:
                    item.shippingOrigin ||
                    null
            })),

        subtotal:
            Number(
                subtotal
            ) || 0,

        shipping:
            Number(
                shipping
            ) || 0,

        discount:
            Number(
                discount
            ) || 0,

        total:
            Number(
                grandTotal
            ) || 0,

        status:
            "pending",

        created_at:
            new Date().toISOString()
    };
}


/* ============================================================
   SAVE ORDER LOCALLY
============================================================ */

function saveOrderLocally(
    order
) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "khz_orders"
                ) || "[]"
            );


        existing.push(
            order
        );


        localStorage.setItem(
            "khz_orders",
            JSON.stringify(
                existing
            )
        );


        return true;

    } catch (error) {

        console.error(
            "Local order error:",
            error
        );

        return false;
    }
}


/* ============================================================
   SAVE ORDER TO SUPABASE
============================================================ */

async function saveOrderToSupabase(
    order
) {

    if (!supabaseClient) {

        return {

            success: false,

            error:
                "Supabase client is not available."
        };
    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();


        if (error) {

            return {

                success: false,

                error:
                    error.message
            };
        }


        const user =
            data?.session?.user;


        if (!user) {

            return {

                success: false,

                error:
                    "You are not logged in. Please login again."
            };
        }


        const orderData = {

            user_id:
                user.id,

            customer_id:
                user.id,

            total_amount:
                Number(
                    order.total
                ) || 0,

            status:
                "pending",

            shipping_name:
                order.customer_name ||
                null,

            shipping_phone:
                order.customer_phone ||
                null,

            shipping_address:
                order.shipping_address ||
                null,

            shipping_city:
                order.city ||
                null,

            customer_email:
                order.customer_email ||
                null,

            payment_method:
                order.payment_method ||
                null,

            payment_reference:
                order.payment_reference ||
                null,

            payment_sender_info:
                order.payment_sender_info ||
                null,

            order_number:
                order.orderNumber,

            items:
                order.items || []
        };


        const {
            data: savedOrder,
            error: insertError
        } =
            await supabaseClient
                .from("orders")
                .insert([
                    orderData
                ])
                .select()
                .single();


        if (insertError) {

            console.error(
                "SUPABASE ORDER ERROR:",
                insertError
            );


            return {

                success: false,

                error:
                    insertError.message,

                details:
                    insertError
            };
        }


        return {

            success: true,

            id:
                savedOrder?.id ||
                null,

            order_id:
                savedOrder?.id ||
                null,

            order_number:
                savedOrder?.order_number ||
                order.orderNumber,

            data:
                savedOrder
        };

    } catch (error) {

        console.error(
            "Save order exception:",
            error
        );


        return {

            success: false,

            error:
                error?.message ||
                "Unable to save order."
        };
    }
}


/* ============================================================
   CLEAR CART
============================================================ */

function clearCart() {

    cartItems = [];

    subtotal = 0;

    shipping = 0;

    discount = 0;

    grandTotal = 0;


    try {

        localStorage.removeItem(
            CART_KEY
        );

    } catch (error) {

        console.error(
            "Clear cart error:",
            error
        );
    }
}


/* ============================================================
   CHECKOUT MESSAGE
============================================================ */

function showCheckoutMessage(
    message,
    type = "error"
) {

    let element =
        getElement(
            "checkoutMessage"
        );


    if (!element) {

        element =
            document.createElement(
                "div"
            );

        element.id =
            "checkoutMessage";


        element.className =
            "mb-5 rounded-xl border px-4 py-3 font-bold";


        const form =
            getElement(
                "checkoutForm"
            );


        if (form) {

            form.prepend(
                element
            );
        }
    }


    if (!element) {

        alert(
            String(message)
        );

        return;
    }


    element.innerHTML =
        message;


    element.classList.remove(
        "hidden",
        "border-red-500/30",
        "bg-red-500/10",
        "text-red-300",
        "border-green-500/30",
        "bg-green-500/10",
        "text-green-300"
    );


    if (
        type === "success"
    ) {

        element.classList.add(
            "border-green-500/30",
            "bg-green-500/10",
            "text-green-300"
        );

    } else {

        element.classList.add(
            "border-red-500/30",
            "bg-red-500/10",
            "text-red-300"
        );
    }
}


function hideCheckoutMessage() {

    const element =
        getElement(
            "checkoutMessage"
        );


    if (element) {

        element.classList.add(
            "hidden"
        );
    }
}


/* ============================================================
   BUTTON LOADING
============================================================ */

function setOrderButtonLoading(
    loading
) {

    const button =
        getElement(
            "placeOrderBtn"
        );


    if (!button) {
        return;
    }


    if (loading) {

        if (
            !button.dataset.originalText
        ) {

            button.dataset.originalText =
                button.innerHTML;
        }


        button.disabled =
            true;


        button.innerHTML = `

            <span
                class="
                    material-symbols-outlined
                    animate-spin
                "
            >
                progress_activity
            </span>

            PLACING ORDER...
        `;

    } else {

        button.disabled =
            false;


        button.innerHTML =
            button.dataset.originalText ||
            `
                <span
                    class="material-symbols-outlined"
                >
                    lock
                </span>

                PLACE ORDER
            `;


        delete button.dataset.originalText;
    }
}


/* ============================================================
   PLACE ORDER
============================================================ */

async function placeOrder(
    event
) {

    if (event) {

        event.preventDefault();

        event.stopPropagation();
    }


    if (isPlacingOrder) {
        return;
    }


    hideCheckoutMessage();


    try {

        isPlacingOrder =
            true;


        /*
           USER
        */

        if (!currentUser) {

            await loadCurrentUser();
        }


        if (!currentUser) {

            throw new Error(
                "Please login before placing your order."
            );
        }


        /*
           CART
        */

        loadCart();

        prepareCart();


        if (!cartItems.length) {

            throw new Error(
                "Your cart is empty."
            );
        }


        /*
           TOTALS
        */

        calculateTotals();


        renderOrderItems();

        renderTotals();


        /*
           CUSTOMER VALIDATION
        */

        if (
            !validateCustomerDetails()
        ) {

            return;
        }


        /*
           PAYMENT VALIDATION
        */

        if (
            !validatePaymentMethod()
        ) {

            return;
        }


        /*
           BUTTON
        */

        setOrderButtonLoading(
            true
        );


        /*
           BUILD ORDER
        */

        const order =
            buildOrder();


        console.log(
            "KHELZONE ORDER:",
            order
        );


        /*
           SAVE
        */

        const result =
            await saveOrderToSupabase(
                order
            );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.error ||
                "Order could not be saved."
            );
        }


        /*
           LOCAL SAVE
        */

        saveOrderLocally(
            order
        );


        localStorage.setItem(
            "khz_last_order",
            JSON.stringify(
                order
            )
        );


        localStorage.setItem(
            "khz_last_order_id",
            String(
                result.id ||
                ""
            )
        );


        localStorage.setItem(
            "khz_last_order_number",
            String(
                result.order_number ||
                order.orderNumber
            )
        );


        /*
           CLEAR CART
        */

        clearCart();


        updateCartCount();

        renderOrderItems();

        calculateTotals();

        renderTotals();


        /*
           SUCCESS
        */

        showCheckoutMessage(
            "Order placed successfully! Redirecting...",
            "success"
        );


        const orderNumber =
            result.order_number ||
            order.orderNumber;


        setTimeout(
            () => {

                window.location.href =
                    "order-success.html?order=" +
                    encodeURIComponent(
                        orderNumber
                    );

            },
            900
        );

    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );


        showCheckoutMessage(
            escapeHtml(
                error?.message ||
                "Something went wrong while placing your order."
            ),
            "error"
        );

    } finally {

        isPlacingOrder =
            false;


        setOrderButtonLoading(
            false
        );
    }
}


/* ============================================================
   CHECKOUT FORM
============================================================ */

function setupCheckoutForm() {

    const form =
        getElement(
            "checkoutForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            placeOrder(event);
        }
    );
}


/* ============================================================
   PLACE ORDER BUTTON
============================================================ */

function setupPlaceOrderButton() {

    const button =
        getElement(
            "placeOrderBtn"
        );


    if (!button) {

        console.warn(
            "placeOrderBtn not found."
        );

        return;
    }


    /*
       Your HTML button is type="button",
       so direct click is required.
    */

    button.onclick =
        placeOrder;
}


/* ============================================================
   VALIDATION FEEDBACK
============================================================ */

function setupValidationFeedback() {

    const fields = [

        "customerName",

        "customerEmail",

        "customerPhone",

        "customerCity",

        "customerAddress"
    ];


    fields.forEach(id => {

        const field =
            getElement(id);


        if (!field) {
            return;
        }


        field.addEventListener(
            "input",
            () => {

                field.classList.remove(
                    "border-red-500"
                );
            }
        );


        field.addEventListener(
            "change",
            () => {

                field.classList.remove(
                    "border-red-500"
                );
            }
        );
    });
}


/* ============================================================
   AUTH LISTENER
============================================================ */

function setupAuthListener() {

    if (
        !supabaseClient?.auth
    ) {

        return;
    }


    supabaseClient.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            console.log(
                "KHELZONE AUTH:",
                event
            );


            currentUser =
                session?.user ||
                null;


            if (currentUser) {

                await fillCustomerDetails();
            }
        }
    );
}


/* ============================================================
   INITIALIZE
============================================================ */

async function initializePaymentPage() {

    console.log(
        "KHELZONE PAYMENT: START"
    );


    try {

        /*
           1. CART
        */

        loadCart();

        prepareCart();


        /*
           2. TOTALS
        */

        calculateTotals();


        /*
           3. PRODUCTS
        */

        renderOrderItems();


        /*
           4. TOTAL UI
        */

        renderTotals();


        /*
           5. CART COUNT
        */

        updateCartCount();


        /*
           6. BUTTON STATE
        */

        updateCheckoutVisibility();


        /*
           7. USER
        */

        await loadCurrentUser();


        /*
           8. PROFILE
        */

        if (currentUser) {

            await loadCustomerProfile();

            await fillCustomerDetails();
        }


        /*
           9. PAYMENT SETTINGS
        */

        await loadPaymentSettings();


        /*
           10. PAYMENT METHODS
        */

        setupPaymentMethods();


        /*
           11. FORM
        */

        setupCheckoutForm();


        /*
           12. BUTTON
        */

        setupPlaceOrderButton();


        /*
           13. VALIDATION
        */

        setupValidationFeedback();


        /*
           14. AUTH
        */

        setupAuthListener();


        /*
           15. FINAL
        */

        console.log(
            "KHELZONE PAYMENT: READY"
        );

    } catch (error) {

        console.error(
            "PAYMENT INITIALIZATION ERROR:",
            error
        );


        showCheckoutMessage(
            "Checkout load error: " +
            escapeHtml(
                error?.message ||
                "Unknown error"
            ),
            "error"
        );
    }
}


/* ============================================================
   START
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePaymentPage,
        {
            once: true
        }
    );

} else {

    initializePaymentPage();
}


/* ============================================================
   GLOBAL ACCESS
============================================================ */

window.KHELZONE_PAYMENT = {

    loadCart,

    prepareCart,

    calculateTotals,

    renderOrderItems,

    renderTotals,

    loadCurrentUser,

    loadCustomerProfile,

    fillCustomerDetails,

    loadPaymentSettings,

    setupPaymentMethods,

    renderPaymentDetailsUI,

    getSelectedPaymentMethod,

    validateCustomerDetails,

    validatePaymentMethod,

    buildOrder,

    saveOrderToSupabase,

    saveOrderLocally,

    clearCart,

    placeOrder,

    initializePaymentPage
};


/* ============================================================
   END OF PAYMENT.JS
============================================================ */