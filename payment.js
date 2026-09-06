/* =========================================================
   KHELZONE - PAYMENT / CHECKOUT
   ========================================================= */

/* =========================================================
   SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";

const supabaseClient =
    window.supabase
        ? window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        )
        : null;


/* =========================================================
   GLOBALS
   ========================================================= */

const CART_KEY = "khz_cart";

let cartItems = [];
let currentUser = null;

let subtotal = 0;
let shipping = 0;
let discount = 0;
let grandTotal = 0;

/*
 * Loaded from the payment_settings table.
 * No fake payment values are ever used.
 */
let paymentSettings = null;


/* =========================================================
   HELPERS
   ========================================================= */

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

    return `Rs. ${number.toLocaleString("en-PK")}`;
}


function setFieldError(
    fieldId,
    errorId,
    message
) {

    const field =
        getElement(fieldId);

    const errorEl =
        getElement(errorId);

    if (field) {

        field.classList.add(
            "border-red-500"
        );
    }

    if (errorEl) {

        if (message) {

            errorEl.textContent =
                message;
        }

        errorEl.classList.remove(
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

    const errorEl =
        getElement(errorId);

    if (field) {

        field.classList.remove(
            "border-red-500"
        );
    }

    if (errorEl) {

        errorEl.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   LOAD CART
   ========================================================= */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(
                CART_KEY
            );

        if (!savedCart) {

            cartItems = [];

            return;
        }

        const parsed =
            JSON.parse(savedCart);

        if (Array.isArray(parsed)) {

            cartItems = parsed;

        } else if (
            parsed &&
            Array.isArray(parsed.items)
        ) {

            cartItems =
                parsed.items;

        } else {

            cartItems = [];
        }

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        cartItems = [];
    }
}


/* =========================================================
   NORMALIZE CART
   ========================================================= */

function normalizeCartItem(
    item,
    index
) {

    if (
        !item ||
        typeof item !== "object"
    ) {
        return null;
    }

    const quantity =
        Number(
            item.quantity ??
            item.qty ??
            item.count ??
            1
        ) || 1;

    const price =
        Number(
            item.price ??
            item.productPrice ??
            item.unit_price ??
            0
        ) || 0;

    const name =
        item.name ??
        item.productName ??
        item.title ??
        "Sports Product";

    const image =
        item.image_url ??
        item.imageUrl ??
        item.image ??
        item.productImage ??
        item.thumbnail ??
        "";

    const id =
        item.id ??
        item.product_id ??
        item.productId ??
        `cart-item-${index}`;

    const category =
        item.category ??
        item.sport ??
        item.productCategory ??
        "";

    const size =
        item.size ??
        item.productSize ??
        "";

    const shippingOrigin =
        item.seller_city ??
        item.sellerCity ??
        item.shipping_origin ??
        item.shippingOrigin ??
        item.shippingFrom ??
        item.origin_city ??
        null;

    return {

        id,

        name,

        price,

        quantity,

        image,

        category,

        size,

        shippingOrigin,

        total:
            price * quantity,

        original:
            item
    };
}


function prepareCart() {

    const normalized = [];

    cartItems.forEach(
        (item, index) => {

            const normalizedItem =
                normalizeCartItem(
                    item,
                    index
                );

            if (normalizedItem) {

                normalized.push(
                    normalizedItem
                );
            }
        }
    );

    cartItems =
        normalized;
}


/* =========================================================
   CALCULATE TOTALS
   ========================================================= */

function calculateTotals() {

    subtotal =
        cartItems.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    (
                        Number(item.price) *
                        Number(item.quantity)
                    )
                );
            },
            0
        );

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

    if (grandTotal < 0) {

        grandTotal = 0;
    }
}


/* =========================================================
   RENDER ORDER ITEMS
   ========================================================= */

function renderOrderItems() {

    const container =
        getElement("orderItems");

    if (!container) {

        console.warn(
            "orderItems element not found."
        );

        return;
    }

    container.innerHTML = "";


    if (!cartItems.length) {

        container.innerHTML = `

            <div class="py-10 text-center">

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
                    Add some sports products before placing your order.
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

                    <span
                        class="
                            material-symbols-outlined
                            text-[20px]
                        "
                    >
                        shopping_bag
                    </span>

                    Continue Shopping

                </a>

            </div>
        `;

        return;
    }


    cartItems.forEach(
        (item) => {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);

            let imageHtml = "";


            if (item.image) {

                imageHtml = `

                    <img
                        src="${escapeHtml(item.image)}"
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


            const shippingOriginHtml =
                item.shippingOrigin
                    ? `
                        <p class="mt-1 text-[11px] text-white/40 flex items-center gap-1">

                            <span class="material-symbols-outlined text-[13px]">
                                local_shipping
                            </span>

                            Shipping from:
                            ${escapeHtml(item.shippingOrigin)}

                        </p>
                    `
                    : `
                        <p class="mt-1 text-[11px] text-white/30 italic">
                            Shipping origin unavailable
                        </p>
                    `;


            const itemHtml = `

                <div
                    class="
                        flex
                        gap-4
                        border-b
                        border-white/10
                        py-5
                    "
                >

                    <div class="shrink-0">

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

                            <div class="min-w-0">

                                <h3
                                    class="
                                        truncate
                                        text-sm
                                        font-black
                                        text-white
                                    "
                                    title="${escapeHtml(item.name)}"
                                >
                                    ${escapeHtml(item.name)}
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
                                                    tracking-wide
                                                    text-orange-400
                                                "
                                            >
                                                ${escapeHtml(item.category)}
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
                                                ${escapeHtml(item.size)}
                                            </p>
                                        `
                                        : ""
                                }


                                ${shippingOriginHtml}

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
                                    ${formatPrice(itemTotal)}
                                </p>

                            </div>

                        </div>


                        <div
                            class="
                                mt-3
                                flex
                                items-center
                                justify-between
                                gap-3
                            "
                        >

                            <p
                                class="
                                    text-xs
                                    text-white/50
                                "
                            >
                                ${formatPrice(item.price)}
                                ×
                                ${item.quantity}
                            </p>


                            <div
                                class="
                                    flex
                                    h-8
                                    min-w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-white/5
                                    px-2
                                    text-xs
                                    font-black
                                    text-white
                                "
                            >
                                Qty:
                                ${item.quantity}
                            </div>

                        </div>

                    </div>

                </div>
            `;

            container.insertAdjacentHTML(
                "beforeend",
                itemHtml
            );
        }
    );
}


/* =========================================================
   RENDER TOTALS
   ========================================================= */

function renderTotals() {

    const summaryItemCount =
        getElement(
            "summaryItemCount"
        );

    const subtotalValue =
        getElement(
            "subtotalValue"
        );

    const shippingValue =
        getElement(
            "shippingValue"
        );

    const discountRow =
        getElement(
            "discountRow"
        );

    const discountValue =
        getElement(
            "discountValue"
        );

    const grandTotalValue =
        getElement(
            "grandTotalValue"
        );


    const totalQuantity =
        cartItems.reduce(
            (
                total,
                item
            ) => {

                return (
                    total +
                    Number(item.quantity)
                );
            },
            0
        );


    if (summaryItemCount) {

        summaryItemCount.textContent =
            `${totalQuantity} ${
                totalQuantity === 1
                    ? "item"
                    : "items"
            }`;
    }


    if (subtotalValue) {

        subtotalValue.textContent =
            formatPrice(
                subtotal
            );
    }


    if (shippingValue) {

        if (
            shipping === 0 &&
            subtotal > 0
        ) {

            shippingValue.textContent =
                "FREE";

            shippingValue.classList.add(
                "text-green-400"
            );

        } else {

            shippingValue.textContent =
                formatPrice(
                    shipping
                );

            shippingValue.classList.remove(
                "text-green-400"
            );
        }
    }


    if (discountRow) {

        if (discount > 0) {

            discountRow.classList.remove(
                "hidden"
            );

            if (discountValue) {

                discountValue.textContent =
                    `- ${formatPrice(
                        discount
                    )}`;
            }

        } else {

            discountRow.classList.add(
                "hidden"
            );
        }
    }


    if (grandTotalValue) {

        grandTotalValue.textContent =
            formatPrice(
                grandTotal
            );
    }
}


/* =========================================================
   CHECKOUT BUTTON
   ========================================================= */

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

        button.setAttribute(
            "aria-disabled",
            "true"
        );

    } else {

        button.disabled = false;

        button.classList.remove(
            "opacity-50",
            "cursor-not-allowed"
        );

        button.removeAttribute(
            "aria-disabled"
        );
    }
}


/* =========================================================
   CURRENT USER
   ========================================================= */

async function loadCurrentUser() {

    if (!supabaseClient) {

        console.error(
            "Supabase client not available."
        );

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


        const session =
            data?.session;


        if (!session?.user) {

            console.warn(
                "No active Supabase session."
            );

            currentUser = null;

            return null;
        }


        currentUser =
            session.user;


        return currentUser;

    } catch (error) {

        console.error(
            "Current user error:",
            error
        );

        currentUser = null;

        return null;
    }
}


/* =========================================================
   PAYMENT SETTINGS
   ========================================================= */

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

            console.error(
                "Payment settings load error:",
                error
            );

            paymentSettings = null;

            return;
        }


        paymentSettings =
            data || null;

    } catch (error) {

        console.error(
            "Payment settings exception:",
            error
        );

        paymentSettings = null;
    }
}


/* =========================================================
   PAYMENT METHODS
   ========================================================= */

function setupPaymentMethods() {

    const methods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    methods.forEach(
        (radio) => {

            radio.addEventListener(
                "change",
                () => {

                    highlightPaymentOption(
                        radio.value
                    );

                    renderPaymentDetailsUI(
                        radio.value
                    );
                }
            );
        }
    );


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


function highlightPaymentOption(
    method
) {

    document
        .querySelectorAll(
            ".payment-option"
        )
        .forEach(
            (el) => {

                el.classList.toggle(
                    "active",
                    el.dataset.paymentOption === method
                );
            }
        );
}


/* =========================================================
   PAYMENT DETAILS UI
   ========================================================= */

function renderPaymentDetailsUI(
    method
) {

    const container =
        getElement(
            "paymentDetails"
        );


    if (!container) {

        return;
    }


    let html = "";


    if (method === "card") {

        html =
            cardDetailsTemplate();

    } else if (method === "bank") {

        html =
            bankDetailsTemplate();

    } else if (method === "easypaisa") {

        html =
            easypaisaDetailsTemplate();

    } else if (method === "jazzcash") {

        html =
            jazzcashDetailsTemplate();

    } else if (
        method === "cod" ||
        method === "cash_on_delivery"
    ) {

        html =
            codDetailsTemplate();
    }


    container.innerHTML =
        html;


    attachDynamicFieldListeners();
}


/* =========================================================
   DETAILS WRAPPER
   ========================================================= */

function detailsWrapper(
    innerHtml
) {

    return `
        <div class="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 space-y-4">
            ${innerHtml}
        </div>
    `;
}


/* =========================================================
   TRANSACTION REFERENCE
   ========================================================= */

function transactionReferenceFieldHtml() {

    return `
        <div>

            <label
                for="paymentReference"
                class="
                    block
                    text-xs
                    uppercase
                    tracking-wider
                    font-bold
                    text-gray-400
                    mb-2
                "
            >
                Transaction ID / Reference *
            </label>

            <input
                id="paymentReference"
                type="text"
                class="input-field"
                placeholder="Enter the transaction ID after you complete the transfer"
            >

            <p
                id="paymentReferenceError"
                class="hidden text-red-400 text-xs mt-2"
            >
                Transaction ID / Reference is required.
            </p>

        </div>
    `;
}


/* =========================================================
   BANK TRANSFER
   ========================================================= */

function bankDetailsTemplate() {

    const s =
        paymentSettings || {};


    /*
     * IMPORTANT:
     * No "not configured" warning anymore.
     *
     * If admin has entered details,
     * real details are shown.
     *
     * If a particular field is empty,
     * only that field shows "—".
     */

    return detailsWrapper(`

        <div
            class="
                text-xs
                uppercase
                tracking-wider
                text-gray-400
                font-bold
            "
        >
            Bank Transfer Details
        </div>


        <div
            class="
                grid
                sm:grid-cols-2
                gap-4
                text-sm
            "
        >

            <div>

                <div
                    class="
                        text-gray-500
                        text-xs
                        mb-1
                    "
                >
                    Bank Name
                </div>

                <div class="font-bold">
                    ${escapeHtml(
                        s.bank_name || "—"
                    )}
                </div>

            </div>


            <div>

                <div
                    class="
                        text-gray-500
                        text-xs
                        mb-1
                    "
                >
                    Account Title
                </div>

                <div class="font-bold">
                    ${escapeHtml(
                        s.account_title || "—"
                    )}
                </div>

            </div>


            <div>

                <div
                    class="
                        text-gray-500
                        text-xs
                        mb-1
                    "
                >
                    Account Number
                </div>

                <div class="font-bold">
                    ${escapeHtml(
                        s.account_number || "—"
                    )}
                </div>

            </div>


            <div>

                <div
                    class="
                        text-gray-500
                        text-xs
                        mb-1
                    "
                >
                    IBAN
                </div>

                <div class="font-bold">
                    ${escapeHtml(
                        s.iban || "—"
                    )}
                </div>

            </div>

        </div>


        <div class="h-px bg-white/10"></div>


        <div
            class="
                text-xs
                uppercase
                tracking-wider
                text-gray-400
                font-bold
            "
        >
            After you transfer, tell us who sent it
        </div>


        <div
            class="
                grid
                sm:grid-cols-2
                gap-4
            "
        >

            <div>

                <label
                    for="senderAccountTitle"
                    class="
                        block
                        text-xs
                        uppercase
                        tracking-wider
                        font-bold
                        text-gray-400
                        mb-2
                    "
                >
                    Your Account Title (sender) *
                </label>

                <input
                    id="senderAccountTitle"
                    type="text"
                    class="input-field"
                    placeholder="Name on the account you paid from"
                >

                <p
                    id="senderAccountTitleError"
                    class="
                        hidden
                        text-red-400
                        text-xs
                        mt-2
                    "
                >
                    Please enter the account title you paid from.
                </p>

            </div>


            <div>

                <label
                    for="senderAccountNumber"
                    class="
                        block
                        text-xs
                        uppercase
                        tracking-wider
                        font-bold
                        text-gray-400
                        mb-2
                    "
                >
                    Your Account Number (sender) *
                </label>

                <input
                    id="senderAccountNumber"
                    type="text"
                    class="input-field"
                    placeholder="Account number you paid from"
                >

                <p
                    id="senderAccountNumberError"
                    class="
                        hidden
                        text-red-400
                        text-xs
                        mt-2
                    "
                >
                    Please enter the account number you paid from.
                </p>

            </div>

        </div>


        ${transactionReferenceFieldHtml()}

    `);
}


/* =========================================================
   EASYPAISA
   ========================================================= */

function easypaisaDetailsTemplate() {

    const s =
        paymentSettings || {};


    const hasEasypaisaDetails =
        s.easypaisa_account_name &&
        s.easypaisa_number;


    const receivingDetailsHtml =
        hasEasypaisaDetails
            ? `

                <div
                    class="
                        text-xs
                        uppercase
                        tracking-wider
                        text-gray-400
                        font-bold
                    "
                >
                    Easypaisa Details
                </div>


                <div
                    class="
                        grid
                        sm:grid-cols-2
                        gap-4
                        text-sm
                    "
                >

                    <div>

                        <div
                            class="
                                text-gray-500
                                text-xs
                                mb-1
                            "
                        >
                            Account Name
                        </div>

                        <div class="font-bold">
                            ${escapeHtml(
                                s.easypaisa_account_name
                            )}
                        </div>

                    </div>


                    <div>

                        <div
                            class="
                                text-gray-500
                                text-xs
                                mb-1
                            "
                        >
                            Easypaisa Number
                        </div>

                        <div class="font-bold">
                            ${escapeHtml(
                                s.easypaisa_number
                            )}
                        </div>

                    </div>

                </div>

            `
            : `
                <div
                    class="
                        text-sm
                        text-gray-400
                    "
                >
                    Easypaisa receiving details are currently unavailable.
                </div>
            `;


    return detailsWrapper(`

        ${receivingDetailsHtml}


        <div class="h-px bg-white/10"></div>


        <div>

            <label
                for="senderMobileNumber"
                class="
                    block
                    text-xs
                    uppercase
                    tracking-wider
                    font-bold
                    text-gray-400
                    mb-2
                "
            >
                Your Easypaisa Number (the number you paid from) *
            </label>

            <input
                id="senderMobileNumber"
                type="tel"
                class="input-field"
                placeholder="03XX XXXXXXX"
            >

            <p
                id="senderMobileNumberError"
                class="
                    hidden
                    text-red-400
                    text-xs
                    mt-2
                "
            >
                Please enter the Easypaisa number you paid from.
            </p>

        </div>


        ${transactionReferenceFieldHtml()}

    `);
}


/* =========================================================
   JAZZCASH
   ========================================================= */

function jazzcashDetailsTemplate() {

    const s =
        paymentSettings || {};


    /*
     * IMPORTANT:
     * No "not configured" warning anymore.
     *
     * Admin details are shown if available.
     * Empty fields simply display "—".
     */

    return detailsWrapper(`

        <div
            class="
                text-xs
                uppercase
                tracking-wider
                text-gray-400
                font-bold
            "
        >
            JazzCash Details
        </div>


        <div
            class="
                grid
                sm:grid-cols-2
                gap-4
                text-sm
            "
        >

            <div>

                <div
                    class="
                        text-gray-500
                        text-xs
                        mb-1
                    "
                >
                    Account Name
                </div>

                <div class="font-bold">
                    ${escapeHtml(
                        s.jazzcash_account_name || "—"
                    )}
                </div>

            </div>


            <div>

                <div
                    class="
                        text-gray-500
                        text-xs
                        mb-1
                    "
                >
                    JazzCash Number
                </div>

                <div class="font-bold">
                    ${escapeHtml(
                        s.jazzcash_number || "—"
                    )}
                </div>

            </div>

        </div>


        <div class="h-px bg-white/10"></div>


        <div>

            <label
                for="senderMobileNumber"
                class="
                    block
                    text-xs
                    uppercase
                    tracking-wider
                    font-bold
                    text-gray-400
                    mb-2
                "
            >
                Your JazzCash Number (the number you paid from) *
            </label>

            <input
                id="senderMobileNumber"
                type="tel"
                class="input-field"
                placeholder="03XX XXXXXXX"
            >

            <p
                id="senderMobileNumberError"
                class="
                    hidden
                    text-red-400
                    text-xs
                    mt-2
                "
            >
                Please enter the JazzCash number you paid from.
            </p>

        </div>


        ${transactionReferenceFieldHtml()}

    `);
}


/* =========================================================
   COD
   ========================================================= */

function codDetailsTemplate() {

    return `
        <div
            class="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-5
                text-sm
                text-gray-400
            "
        >
            Pay in cash when your order is delivered.
            No advance payment required.
        </div>
    `;
}


/* =========================================================
   CARD
   ========================================================= */

function cardDetailsTemplate() {

    return `
        <div
            class="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                p-5
                space-y-4
            "
        >

            <div>

                <label
                    for="cardNumber"
                    class="
                        block
                        text-xs
                        uppercase
                        tracking-wider
                        font-bold
                        text-gray-400
                        mb-2
                    "
                >
                    Card Number *
                </label>

                <input
                    id="cardNumber"
                    type="text"
                    inputmode="numeric"
                    class="input-field"
                    placeholder="1234 5678 9012 3456"
                >

                <p
                    id="cardNumberError"
                    class="
                        hidden
                        text-red-400
                        text-xs
                        mt-2
                    "
                >
                    Please enter a valid card number.
                </p>

            </div>


            <div
                class="
                    grid
                    grid-cols-2
                    gap-4
                "
            >

                <div>

                    <label
                        for="expiry"
                        class="
                            block
                            text-xs
                            uppercase
                            tracking-wider
                            font-bold
                            text-gray-400
                            mb-2
                        "
                    >
                        Expiry *
                    </label>

                    <input
                        id="expiry"
                        type="text"
                        inputmode="numeric"
                        class="input-field"
                        placeholder="MM/YY"
                    >

                    <p
                        id="expiryError"
                        class="
                            hidden
                            text-red-400
                            text-xs
                            mt-2
                        "
                    >
                        Enter expiry as MM/YY.
                    </p>

                </div>


                <div>

                    <label
                        for="cvv"
                        class="
                            block
                            text-xs
                            uppercase
                            tracking-wider
                            font-bold
                            text-gray-400
                            mb-2
                        "
                    >
                        CVV *
                    </label>

                    <input
                        id="cvv"
                        type="text"
                        inputmode="numeric"
                        class="input-field"
                        placeholder="123"
                    >

                    <p
                        id="cvvError"
                        class="
                            hidden
                            text-red-400
                            text-xs
                            mt-2
                        "
                    >
                        CVV is required.
                    </p>

                </div>

            </div>

        </div>
    `;
}


/* =========================================================
   DYNAMIC FIELD LISTENERS
   ========================================================= */

function attachDynamicFieldListeners() {

    const cardNumber =
        getElement("cardNumber");


    if (cardNumber) {

        cardNumber.addEventListener(
            "input",
            function () {

                let value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 16);


                value =
                    value.match(
                        /.{1,4}/g
                    )?.join(" ") || "";


                this.value =
                    value;


                clearFieldError(
                    "cardNumber",
                    "cardNumberError"
                );
            }
        );
    }


    const expiry =
        getElement("expiry");


    if (expiry) {

        expiry.addEventListener(
            "input",
            function () {

                let value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 4);


                if (
                    value.length > 2
                ) {

                    value =
                        value.slice(0, 2) +
                        "/" +
                        value.slice(2);
                }


                this.value =
                    value;


                clearFieldError(
                    "expiry",
                    "expiryError"
                );
            }
        );
    }


    const cvv =
        getElement("cvv");


    if (cvv) {

        cvv.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(/\D/g, "")
                        .slice(0, 4);


                clearFieldError(
                    "cvv",
                    "cvvError"
                );
            }
        );
    }


    const paymentReference =
        getElement(
            "paymentReference"
        );


    if (paymentReference) {

        paymentReference.addEventListener(
            "input",
            function () {

                clearFieldError(
                    "paymentReference",
                    "paymentReferenceError"
                );
            }
        );
    }


    const senderAccountTitle =
        getElement(
            "senderAccountTitle"
        );


    if (senderAccountTitle) {

        senderAccountTitle.addEventListener(
            "input",
            function () {

                clearFieldError(
                    "senderAccountTitle",
                    "senderAccountTitleError"
                );
            }
        );
    }


    const senderAccountNumber =
        getElement(
            "senderAccountNumber"
        );


    if (senderAccountNumber) {

        senderAccountNumber.addEventListener(
            "input",
            function () {

                clearFieldError(
                    "senderAccountNumber",
                    "senderAccountNumberError"
                );
            }
        );
    }


    const senderMobileNumber =
        getElement(
            "senderMobileNumber"
        );


    if (senderMobileNumber) {

        senderMobileNumber.addEventListener(
            "input",
            function () {

                clearFieldError(
                    "senderMobileNumber",
                    "senderMobileNumberError"
                );
            }
        );
    }
}


/* =========================================================
   FORM VALUE
   ========================================================= */

function getFormValue(...ids) {

    for (
        const id of ids
    ) {

        const element =
            getElement(id);


        if (element) {

            return element.value.trim();
        }
    }


    return "";
}


/* =========================================================
   CUSTOMER VALIDATION
   ========================================================= */

function validateCustomerDetails() {

    let valid = true;

    let firstInvalid = null;


    /* FULL NAME */

    const name =
        getElement(
            "customerName"
        );

    const trimmedName =
        name
            ? name.value.trim()
            : "";


    if (!trimmedName) {

        setFieldError(
            "customerName",
            "nameError",
            "Full name is required."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            name;

    } else if (
        !/\s/.test(
            trimmedName
        )
    ) {

        setFieldError(
            "customerName",
            "nameError",
            "Please enter your full name (first and last name)."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            name;

    } else {

        clearFieldError(
            "customerName",
            "nameError"
        );
    }


    /* PHONE */

    const phone =
        getElement(
            "customerPhone"
        );

    const phoneRegex =
        /^(?:\+92|0092|0)3\d{9}$/;


    if (
        !phone ||
        !phone.value.trim()
    ) {

        setFieldError(
            "customerPhone",
            "phoneError",
            "Phone number is required."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            phone;

    } else if (
        !phoneRegex.test(
            phone.value
                .replace(
                    /[\s-]/g,
                    ""
                )
                .trim()
        )
    ) {

        setFieldError(
            "customerPhone",
            "phoneError",
            "Please enter a valid Pakistani phone number."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            phone;

    } else {

        clearFieldError(
            "customerPhone",
            "phoneError"
        );
    }


    /* EMAIL */

    const email =
        getElement(
            "customerEmail"
        );

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        email &&
        email.value.trim() &&
        !emailRegex.test(
            email.value.trim()
        )
    ) {

        setFieldError(
            "customerEmail",
            "emailError",
            "Please enter a valid email address."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            email;

    } else {

        clearFieldError(
            "customerEmail",
            "emailError"
        );
    }


    /* CITY */

    const city =
        getElement(
            "customerCity"
        );


    if (
        !city ||
        !city.value.trim()
    ) {

        setFieldError(
            "customerCity",
            "cityError",
            "City is required."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            city;

    } else {

        clearFieldError(
            "customerCity",
            "cityError"
        );
    }


    /* ADDRESS */

    const address =
        getElement(
            "customerAddress"
        );


    if (
        !address ||
        !address.value.trim()
    ) {

        setFieldError(
            "customerAddress",
            "addressError",
            "Please enter your complete delivery address."
        );

        valid = false;

        firstInvalid =
            firstInvalid ||
            address;

    } else {

        clearFieldError(
            "customerAddress",
            "addressError"
        );
    }


    if (
        !valid &&
        firstInvalid
    ) {

        firstInvalid.focus();

        firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    return valid;
}


/* =========================================================
   PAYMENT VALIDATION
   ========================================================= */

function validatePaymentMethod() {

    const selected =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (!selected) {

        alert(
            "Please select a payment method."
        );

        return false;
    }


    const method =
        selected.value;


    let valid = true;

    let firstInvalid = null;


    /* CARD */

    if (
        method === "card"
    ) {

        const cardNumber =
            getElement(
                "cardNumber"
            );

        const expiry =
            getElement(
                "expiry"
            );

        const cvv =
            getElement(
                "cvv"
            );


        const cardDigits =
            cardNumber
                ? cardNumber.value
                    .replace(
                        /\s/g,
                        ""
                    )
                : "";


        if (
            !cardDigits ||
            cardDigits.length < 13
        ) {

            setFieldError(
                "cardNumber",
                "cardNumberError",
                "Please enter a valid card number."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                cardNumber;

        } else {

            clearFieldError(
                "cardNumber",
                "cardNumberError"
            );
        }


        const expiryRegex =
            /^(0[1-9]|1[0-2])\/\d{2}$/;


        if (
            !expiry ||
            !expiryRegex.test(
                expiry.value.trim()
            )
        ) {

            setFieldError(
                "expiry",
                "expiryError",
                "Enter expiry as MM/YY."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                expiry;

        } else {

            clearFieldError(
                "expiry",
                "expiryError"
            );
        }


        if (
            !cvv ||
            !cvv.value.trim()
        ) {

            setFieldError(
                "cvv",
                "cvvError",
                "CVV is required."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                cvv;

        } else {

            clearFieldError(
                "cvv",
                "cvvError"
            );
        }
    }


    /* BANK / EASYPAISA / JAZZCASH */

    if (
        method === "bank" ||
        method === "easypaisa" ||
        method === "jazzcash"
    ) {

        const reference =
            getElement(
                "paymentReference"
            );


        if (
            !reference ||
            !reference.value.trim()
        ) {

            setFieldError(
                "paymentReference",
                "paymentReferenceError",
                "Transaction ID / Reference is required."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                reference;

        } else {

            clearFieldError(
                "paymentReference",
                "paymentReferenceError"
            );
        }
    }


    /* BANK SENDER DETAILS */

    if (
        method === "bank"
    ) {

        const senderAccountTitle =
            getElement(
                "senderAccountTitle"
            );


        if (
            !senderAccountTitle ||
            !senderAccountTitle.value.trim()
        ) {

            setFieldError(
                "senderAccountTitle",
                "senderAccountTitleError",
                "Please enter the account title you paid from."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                senderAccountTitle;

        } else {

            clearFieldError(
                "senderAccountTitle",
                "senderAccountTitleError"
            );
        }


        const senderAccountNumber =
            getElement(
                "senderAccountNumber"
            );


        if (
            !senderAccountNumber ||
            !senderAccountNumber.value.trim()
        ) {

            setFieldError(
                "senderAccountNumber",
                "senderAccountNumberError",
                "Please enter the account number you paid from."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                senderAccountNumber;

        } else {

            clearFieldError(
                "senderAccountNumber",
                "senderAccountNumberError"
            );
        }
    }


    /* EASYPAISA / JAZZCASH SENDER MOBILE */

    if (
        method === "easypaisa" ||
        method === "jazzcash"
    ) {

        const senderMobileNumber =
            getElement(
                "senderMobileNumber"
            );


        const digitsOnly =
            senderMobileNumber
                ? senderMobileNumber.value
                    .replace(
                        /\D/g,
                        ""
                    )
                : "";


        if (
            !senderMobileNumber ||
            digitsOnly.length < 10
        ) {

            setFieldError(
                "senderMobileNumber",
                "senderMobileNumberError",

                method === "jazzcash"
                    ? "Please enter the JazzCash number you paid from."
                    : "Please enter the Easypaisa number you paid from."
            );

            valid = false;

            firstInvalid =
                firstInvalid ||
                senderMobileNumber;

        } else {

            clearFieldError(
                "senderMobileNumber",
                "senderMobileNumberError"
            );
        }
    }


    if (
        !valid &&
        firstInvalid
    ) {

        firstInvalid.focus();

        firstInvalid.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }


    return valid;
}


/* =========================================================
   BUILD ORDER
   ========================================================= */

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


    const selectedPayment =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    const paymentMethod =
        selectedPayment
            ? selectedPayment.value
            : "cod";


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
            cartItems.map(
                (item) => ({

                    product_id:
                        item.id,

                    name:
                        item.name,

                    price:
                        Number(
                            item.price
                        ),

                    quantity:
                        Number(
                            item.quantity
                        ),

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
                })
            ),

        subtotal:
            Number(
                subtotal
            ),

        shipping:
            Number(
                shipping
            ),

        discount:
            Number(
                discount
            ),

        total:
            Number(
                grandTotal
            ),

        status:
            "pending",

        created_at:
            new Date().toISOString()
    };
}


/* =========================================================
   SAVE LOCAL ORDER
   ========================================================= */

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
            "Local order save error:",
            error
        );

        return false;
    }
}


/* =========================================================
   SAVE ORDER TO SUPABASE
   ========================================================= */

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

            console.error(
                "Session error:",
                error
            );

            return {

                success: false,

                error:
                    error.message
            };
        }


        const session =
            data?.session;


        const user =
            session?.user;


        if (!user) {

            return {

                success: false,

                error:
                    "You are not logged in. Please login again."
            };
        }


        const userId =
            user.id;


        const orderData = {

            user_id:
                userId,

            customer_id:
                userId,

            total_amount:
                Number(
                    order.total
                ),

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

            /*
             * ------------------------------------------------
             * FIX: This is the actual bug that caused the admin
             * dashboard to always show "Order items are not
             * saved in this order record."
             *
             * buildOrder() already computes a clean "items"
             * array (product_id, name, price, quantity, size,
             * image_url, category, shipping_origin) but this
             * object — the one actually inserted into Supabase —
             * never included it. So items were being thrown away
             * right before saving, every single time.
             *
             * "items" must be a JSONB column on the "orders"
             * table in Supabase for this insert to work. If that
             * column does not exist yet, create it:
             *
             *   alter table orders add column items jsonb;
             * ------------------------------------------------
             */
            items:
                order.items || []
        };


        const {
            error: insertError
        } =
            await supabaseClient
                .from("orders")
                .insert([
                    orderData
                ]);


        if (insertError) {

            console.error(
                "SUPABASE ORDER INSERT ERROR:",
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

            data:
                orderData
        };


    } catch (error) {

        console.error(
            "Order save exception:",
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


/* =========================================================
   CLEAR CART
   ========================================================= */

function clearCart() {

    try {

        localStorage.removeItem(
            CART_KEY
        );

        cartItems = [];

    } catch (error) {

        console.error(
            "Clear cart error:",
            error
        );
    }
}


/* =========================================================
   PLACE ORDER
   ========================================================= */

async function placeOrder(
    event
) {

    if (event) {

        event.preventDefault();
    }


    if (!cartItems.length) {

        alert(
            "Your cart is empty."
        );

        return;
    }


    if (
        !validateCustomerDetails()
    ) {

        return;
    }


    if (
        !validatePaymentMethod()
    ) {

        return;
    }


    const button =
        getElement(
            "placeOrderBtn"
        );


    if (button) {

        button.disabled = true;

        button.dataset.originalText =
            button.innerHTML;

        button.innerHTML = `

            <span
                class="
                    material-symbols-outlined
                    animate-spin
                "
            >
                progress_activity
            </span>

            Placing Order...
        `;
    }


    try {

        const user =
            await loadCurrentUser();


        if (!user) {

            alert(
                "Please login before placing your order."
            );


            if (button) {

                button.disabled = false;

                button.innerHTML =
                    button.dataset.originalText ||
                    "Place Order";
            }


            return;
        }


        calculateTotals();


        const order =
            buildOrder();


        const result =
            await saveOrderToSupabase(
                order
            );


        if (
            !result ||
            !result.success
        ) {

            console.error(
                "ORDER NOT SAVED:",
                result?.error
            );


            alert(
                "Order could not be saved.\n\n" +
                (
                    result?.error ||
                    "Unknown Supabase error."
                )
            );


            if (button) {

                button.disabled = false;

                button.innerHTML =
                    button.dataset.originalText ||
                    "Place Order";
            }


            return;
        }


        saveOrderLocally(
            order
        );


        localStorage.setItem(
            "khz_last_order",
            JSON.stringify(
                order
            )
        );


        clearCart();


        window.location.href =
            `order-success.html?order=${encodeURIComponent(
                order.orderNumber
            )}`;


    } catch (error) {

        console.error(
            "Place order error:",
            error
        );


        alert(
            "Something went wrong while placing your order.\n\n" +
            (
                error?.message ||
                "Please try again."
            )
        );


        if (button) {

            button.disabled = false;

            button.innerHTML =
                button.dataset.originalText ||
                "Place Order";
        }
    }
}


/* =========================================================
   CHECKOUT FORM
   ========================================================= */

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
        placeOrder
    );


    const button =
        getElement(
            "placeOrderBtn"
        );


    if (button) {

        if (
            !form.contains(
                button
            )
        ) {

            button.addEventListener(
                "click",
                placeOrder
            );
        }
    }
}


/* =========================================================
   VALIDATION FEEDBACK
   ========================================================= */

function setupValidationFeedback() {

    const form =
        getElement(
            "checkoutForm"
        );


    if (!form) {

        return;
    }


    const errorMap = {

        customerName:
            "nameError",

        customerPhone:
            "phoneError",

        customerEmail:
            "emailError",

        customerCity:
            "cityError",

        customerAddress:
            "addressError"
    };


    const fields =
        form.querySelectorAll(
            "input, select, textarea"
        );


    fields.forEach(
        (field) => {

            const errorId =
                errorMap[field.id];


            const clear = () => {

                if (errorId) {

                    clearFieldError(
                        field.id,
                        errorId
                    );

                } else {

                    field.classList.remove(
                        "border-red-500"
                    );
                }
            };


            field.addEventListener(
                "input",
                clear
            );


            field.addEventListener(
                "change",
                clear
            );
        }
    );
}


/* =========================================================
   AUTH LISTENER
   ========================================================= */

function setupAuthListener() {

    if (!supabaseClient) {

        return;
    }


    supabaseClient.auth.onAuthStateChange(
        (
            event,
            session
        ) => {

            currentUser =
                session?.user ||
                null;
        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializePaymentPage() {

    /*
     * 1. Load cart
     */

    loadCart();


    /*
     * 2. Normalize cart
     */

    prepareCart();


    /*
     * 3. Calculate totals
     */

    calculateTotals();


    /*
     * 4. Render products
     */

    renderOrderItems();


    /*
     * 5. Render totals
     */

    renderTotals();


    /*
     * 6. Checkout button
     */

    updateCheckoutVisibility();


    /*
     * 7. Get logged-in user
     */

    await loadCurrentUser();


    /*
     * 8. Load admin payment settings
     */

    await loadPaymentSettings();


    /*
     * 9. Payment methods
     */

    setupPaymentMethods();


    /*
     * 10. Checkout form
     */

    setupCheckoutForm();


    /*
     * 11. Validation
     */

    setupValidationFeedback();


    /*
     * 12. Auth listener
     */

    setupAuthListener();
}


/* =========================================================
   START
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePaymentPage
    );

} else {

    initializePaymentPage();
}
