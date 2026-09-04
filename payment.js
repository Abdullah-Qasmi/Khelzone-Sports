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


/* =========================================================
   LOAD CART
   ========================================================= */

function loadCart() {

    try {

        const savedCart =
            localStorage.getItem(CART_KEY);

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

    return {

        id,

        name,

        price,

        quantity,

        image,

        category,

        size,

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


        console.log(
            "Logged in user:",
            currentUser
        );

        console.log(
            "Authenticated UUID:",
            currentUser.id
        );


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

                    updatePaymentDetails(
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

        updatePaymentDetails(
            selected.value
        );
    }
}


function updatePaymentDetails(
    method
) {

    const cardDetails =
        getElement(
            "cardDetails"
        );

    const cashDetails =
        getElement(
            "cashDetails"
        );


    if (cardDetails) {

        cardDetails.classList.add(
            "hidden"
        );
    }


    if (cashDetails) {

        cashDetails.classList.add(
            "hidden"
        );
    }


    if (
        method === "card"
    ) {

        if (cardDetails) {

            cardDetails.classList.remove(
                "hidden"
            );
        }
    }


    if (
        method === "cod" ||
        method === "cash_on_delivery"
    ) {

        if (cashDetails) {

            cashDetails.classList.remove(
                "hidden"
            );
        }
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

    const form =
        getElement(
            "checkoutForm"
        );


    if (!form) {

        return true;
    }


    const requiredFields =
        form.querySelectorAll(
            "input[required], select[required], textarea[required]"
        );


    let valid = true;


    requiredFields.forEach(
        (field) => {

            if (
                !field.value.trim()
            ) {

                field.classList.add(
                    "border-red-500"
                );

                valid = false;

            } else {

                field.classList.remove(
                    "border-red-500"
                );
            }
        }
    );


    const email =
        form.querySelector(
            'input[type="email"]'
        );


    if (
        email &&
        email.value.trim()
    ) {

        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailRegex.test(
                email.value.trim()
            )
        ) {

            email.classList.add(
                "border-red-500"
            );

            valid = false;
        }
    }


    const phone =
        form.querySelector(
            'input[type="tel"]'
        );


    if (
        phone &&
        phone.value.trim()
    ) {

        const cleanPhone =
            phone.value
                .replace(
                    /[\s-]/g,
                    ""
                )
                .trim();


        const phoneRegex =
            /^(?:\+92|0092|0)3\d{9}$/;


        if (
            !phoneRegex.test(
                cleanPhone
            )
        ) {

            phone.classList.add(
                "border-red-500"
            );

            valid = false;
        }
    }


    if (!valid) {

        alert(
            "Please fill all required customer details correctly."
        );
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


        if (
            cardNumber &&
            !cardNumber.value.trim()
        ) {

            alert(
                "Please enter card details."
            );

            cardNumber.focus();

            return false;
        }


        if (
            expiry &&
            !expiry.value.trim()
        ) {

            alert(
                "Please enter card expiry."
            );

            expiry.focus();

            return false;
        }


        if (
            cvv &&
            !cvv.value.trim()
        ) {

            alert(
                "Please enter CVV."
            );

            cvv.focus();

            return false;
        }


        if (expiry) {

            const expiryRegex =
                /^(0[1-9]|1[0-2])\/\d{2}$/;


            if (
                expiry.value.trim() &&
                !expiryRegex.test(
                    expiry.value.trim()
                )
            ) {

                alert(
                    "Expiry must be in MM/YY format."
                );

                expiry.focus();

                return false;
            }
        }
    }


    return true;
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


    const orderNumber =
        `KZ-${Date.now()}-${Math.floor(
            Math.random() * 1000
        )}`;


    return {

        orderNumber,

        user_id:
            currentUser?.id || null,

        customer_id:
            currentUser?.id || null,

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

        items:
            cartItems.map(
                (item) => ({

                    product_id:
                        item.id,

                    name:
                        item.name,

                    price:
                        Number(item.price),

                    quantity:
                        Number(item.quantity),

                    size:
                        item.size || "",

                    image_url:
                        item.image || "",

                    category:
                        item.category || ""
                })
            ),

        subtotal:
            Number(subtotal),

        shipping:
            Number(shipping),

        discount:
            Number(discount),

        total:
            Number(grandTotal),

        status:
            "pending",

        created_at:
            new Date().toISOString()
    };
}


/* =========================================================
   SAVE LOCAL ORDER
   ========================================================= */

function saveOrderLocally(order) {

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

        /*
         * IMPORTANT:
         * Get the authenticated user directly
         * from Supabase Auth.
         */

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


        console.log(
            "========== ORDER DEBUG =========="
        );

        console.log(
            "AUTH USER ID:",
            userId
        );

        console.log(
            "CURRENT USER ID:",
            currentUser?.id
        );


        /*
         * IMPORTANT:
         * user_id and customer_id are taken
         * directly from auth.uid().
         */

        const orderData = {

            user_id:
                userId,

            customer_id:
                userId,

            total_amount:
                Number(order.total),

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

            order_number:
                order.orderNumber
        };


        console.log(
            "ORDER DATA:",
            orderData
        );


        /*
         * IMPORTANT RLS FIX:
         *
         * DO NOT use:
         *
         * .select()
         * .single()
         *
         * after INSERT.
         *
         * Customer only needs INSERT permission.
         */

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

            console.error(
                "AUTH USER ID:",
                userId
            );

            console.error(
                "ORDER USER ID:",
                orderData.user_id
            );


            return {

                success: false,

                error:
                    insertError.message,

                details:
                    insertError
            };
        }


        console.log(
            "ORDER SUCCESSFULLY SAVED TO SUPABASE"
        );


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

        /*
         * Check login.
         */

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


        /*
         * Recalculate totals.
         */

        calculateTotals();


        /*
         * Build order.
         */

        const order =
            buildOrder();


        console.log(
            "FINAL ORDER:",
            order
        );


        /*
         * Save to Supabase FIRST.
         */

        const result =
            await saveOrderToSupabase(
                order
            );


        /*
         * If Supabase fails,
         * DO NOT clear cart.
         */

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


        /*
         * Supabase success.
         */

        console.log(
            "Order saved successfully."
        );


        /*
         * Local backup.
         */

        saveOrderLocally(
            order
        );


        /*
         * Save last order.
         */

        localStorage.setItem(
            "khz_last_order",
            JSON.stringify(
                order
            )
        );


        /*
         * Clear cart.
         */

        clearCart();


        /*
         * Redirect.
         */

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

        /*
         * Only manually submit if button
         * is outside the form.
         */

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
   INPUT FORMATTING
   ========================================================= */

function setupInputFormatting() {

    const cardNumber =
        getElement(
            "cardNumber"
        );


    if (cardNumber) {

        cardNumber.addEventListener(
            "input",
            function () {

                let value =
                    this.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            16
                        );


                value =
                    value
                        .match(
                            /.{1,4}/g
                        )
                        ?.join(
                            " "
                        ) || "";


                this.value =
                    value;
            }
        );
    }


    const expiry =
        getElement(
            "expiry"
        );


    if (expiry) {

        expiry.addEventListener(
            "input",
            function () {

                let value =
                    this.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            4
                        );


                if (
                    value.length > 2
                ) {

                    value =
                        value.slice(
                            0,
                            2
                        ) +
                        "/" +
                        value.slice(
                            2
                        );
                }


                this.value =
                    value;
            }
        );
    }


    const cvv =
        getElement(
            "cvv"
        );


    if (cvv) {

        cvv.addEventListener(
            "input",
            function () {

                this.value =
                    this.value
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            4
                        );
            }
        );
    }


    const phone =
        getElement(
            "customerPhone"
        );


    if (phone) {

        phone.addEventListener(
            "input",
            function () {

                this.classList.remove(
                    "border-red-500"
                );
            }
        );
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


    const fields =
        form.querySelectorAll(
            "input, select, textarea"
        );


    fields.forEach(
        (field) => {

            field.addEventListener(
                "input",
                function () {

                    this.classList.remove(
                        "border-red-500"
                    );
                }
            );


            field.addEventListener(
                "change",
                function () {

                    this.classList.remove(
                        "border-red-500"
                    );
                }
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


            console.log(
                "Auth state:",
                event
            );


            console.log(
                "Current auth user:",
                currentUser?.id ||
                null
            );
        }
    );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function initializePaymentPage() {

    console.log(
        "KHELZONE payment page initializing..."
    );


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
     * 8. Payment methods
     */

    setupPaymentMethods();


    /*
     * 9. Checkout form
     */

    setupCheckoutForm();


    /*
     * 10. Formatting
     */

    setupInputFormatting();


    /*
     * 11. Validation
     */

    setupValidationFeedback();


    /*
     * 12. Auth listener
     */

    setupAuthListener();


    console.log(
        "Cart:",
        cartItems
    );


    console.log(
        "Subtotal:",
        subtotal
    );


    console.log(
        "Shipping:",
        shipping
    );


    console.log(
        "Grand total:",
        grandTotal
    );


    console.log(
        "Current user:",
        currentUser?.id ||
        null
    );
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