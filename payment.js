/* ==========================================================================
   KHELZONE CHECKOUT / PAYMENT
   ========================================================================== */

"use strict";


/* ==========================================================================
   CONFIG
========================================================================== */

const CART_STORAGE_KEY = "khz_cart";
const ORDERS_STORAGE_KEY = "khz_orders";
const LAST_ORDER_STORAGE_KEY = "khz_last_order";

const FREE_SHIPPING_LIMIT = 5000;
const STANDARD_SHIPPING = 250;


/* ==========================================================================
   STATE
========================================================================== */

let cart = [];
let selectedPaymentMethod = "card";
let isProcessingOrder = false;

let orderTotals = {
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0
};


/* ==========================================================================
   DOM HELPERS
========================================================================== */

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
}


/* ==========================================================================
   MONEY
========================================================================== */

function money(value) {
    const amount = Number(value) || 0;

    return "Rs. " + amount.toLocaleString("en-PK");
}


/* ==========================================================================
   HTML ESCAPE
========================================================================== */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return entities[char];
    });
}


/* ==========================================================================
   PRODUCT IMAGE
========================================================================== */

function getProductImage(item) {

    const image =
        item.image_url ||
        item.image ||
        item.product_image ||
        item.thumbnail ||
        "";

    if (String(image).trim()) {
        return String(image);
    }

    const name = escapeHTML(
        item.name ||
        item.title ||
        item.product_name ||
        "KHELZONE Product"
    );

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="300"
             height="300"
             viewBox="0 0 300 300">

            <rect width="300" height="300" fill="#141414"/>

            <rect x="15"
                  y="15"
                  width="270"
                  height="270"
                  rx="15"
                  fill="none"
                  stroke="#ff6a00"
                  stroke-width="2"/>

            <text x="150"
                  y="140"
                  fill="#ff6a00"
                  font-family="Arial"
                  font-size="22"
                  font-weight="900"
                  text-anchor="middle">
                KHELZONE
            </text>

            <text x="150"
                  y="172"
                  fill="#888"
                  font-family="Arial"
                  font-size="12"
                  text-anchor="middle">
                ${name.substring(0, 28)}
            </text>

        </svg>
    `;

    return "data:image/svg+xml;charset=UTF-8," +
        encodeURIComponent(svg);
}


/* ==========================================================================
   LOAD CART
========================================================================== */

function loadCart() {

    try {

        const saved = localStorage.getItem(CART_STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            console.warn("khz_cart is not an array.");
            return [];
        }

        return parsed;

    } catch (error) {

        console.error("KHELZONE cart loading error:", error);

        return [];

    }
}


/* ==========================================================================
   NORMALIZE CART ITEM
========================================================================== */

function normalizeCartItem(item, index) {

    if (!item || typeof item !== "object") {
        return null;
    }

    const rawQuantity =
        item.quantity ??
        item.qty ??
        1;

    const quantity = Math.max(
        1,
        parseInt(rawQuantity, 10) || 1
    );

    const rawPrice =
        item.price ??
        item.sale_price ??
        item.salePrice ??
        item.unit_price ??
        item.unitPrice ??
        0;

    const price = Math.max(
        0,
        Number(rawPrice) || 0
    );

    const name =
        item.name ||
        item.title ||
        item.product_name ||
        item.productName ||
        "KHELZONE Product";

    const id =
        item.id ??
        item.product_id ??
        item.productId ??
        `cart-item-${index}`;

    return {

        ...item,

        id: String(id),

        name: String(name),

        price: price,

        quantity: quantity,

        image:
            item.image_url ||
            item.image ||
            item.product_image ||
            item.thumbnail ||
            "",

        size:
            item.size ||
            item.selectedSize ||
            "",

        color:
            item.color ||
            item.selectedColor ||
            "",

        sport:
            item.sport ||
            item.category ||
            ""

    };
}


/* ==========================================================================
   PREPARE CART
========================================================================== */

function prepareCart() {

    const rawCart = loadCart();

    cart = rawCart
        .map(normalizeCartItem)
        .filter(function (item) {
            return item !== null &&
                item.quantity > 0 &&
                item.price >= 0;
        });

}


/* ==========================================================================
   CART COUNT
========================================================================== */

function getCartItemCount() {

    return cart.reduce(function (total, item) {

        return total +
            (Number(item.quantity) || 0);

    }, 0);
}


/* ==========================================================================
   CALCULATE TOTALS
========================================================================== */

function calculateTotals() {

    const subtotal = cart.reduce(function (total, item) {

        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;

        return total + (price * quantity);

    }, 0);


    let shipping = 0;

    if (subtotal > 0 && subtotal < FREE_SHIPPING_LIMIT) {
        shipping = STANDARD_SHIPPING;
    }


    const discount = 0;

    const total = Math.max(
        0,
        subtotal + shipping - discount
    );


    orderTotals = {
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        total: total
    };


    return orderTotals;
}


/* ==========================================================================
   RENDER ORDER ITEMS
========================================================================== */

function renderOrderItems() {

    const container = $("#orderItems");

    if (!container) {
        return;
    }


    if (!cart.length) {

        container.innerHTML = `
            <div class="text-center py-10 text-gray-500">
                Your cart is empty.
            </div>
        `;

        return;
    }


    container.innerHTML = cart.map(function (item) {

        const name = escapeHTML(item.name);

        const image = getProductImage(item);

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            Number(item.price) * quantity;


        const variants = [];


        if (item.size) {

            variants.push(
                "Size: " +
                escapeHTML(item.size)
            );

        }


        if (item.color) {

            variants.push(
                "Color: " +
                escapeHTML(item.color)
            );

        }


        const variantHTML =
            variants.length > 0
                ? `
                    <div class="text-[10px] text-gray-500 mt-1">
                        ${variants.join(" • ")}
                    </div>
                  `
                : "";


        const safeImage =
            escapeHTML(image);


        return `
            <div class="product-row py-4 border-b border-white/5">

                <div class="flex gap-3">

                    <div class="w-16 h-16 rounded-xl overflow-hidden bg-white/5 shrink-0">

                        <img
                            src="${safeImage}"
                            alt="${name}"
                            class="w-full h-full object-cover"
                            onerror="this.onerror=null;this.src='${escapeHTML(
                                getProductImage({
                                    name: "KHELZONE Product"
                                })
                            )}';"
                        >

                    </div>


                    <div class="min-w-0 flex-1">

                        <div class="font-semibold text-sm truncate">
                            ${name}
                        </div>

                        ${variantHTML}

                        <div class="text-xs text-gray-500 mt-2">
                            Qty: ${quantity}
                        </div>

                    </div>


                    <div class="text-sm font-bold whitespace-nowrap">
                        ${money(itemTotal)}
                    </div>

                </div>

            </div>
        `;

    }).join("");
}


/* ==========================================================================
   RENDER TOTALS
========================================================================== */

function renderTotals() {

    const totals = calculateTotals();


    const subtotalElement = $("#subtotalValue");

    if (subtotalElement) {
        subtotalElement.textContent =
            money(totals.subtotal);
    }


    const shippingElement = $("#shippingValue");

    if (shippingElement) {

        shippingElement.textContent =
            totals.shipping === 0
                ? "FREE"
                : money(totals.shipping);

        shippingElement.classList.toggle(
            "text-green-500",
            totals.shipping === 0
        );

    }


    const discountRow = $("#discountRow");

    if (discountRow) {

        discountRow.classList.toggle(
            "hidden",
            totals.discount <= 0
        );

    }


    const discountElement = $("#discountValue");

    if (discountElement) {

        discountElement.textContent =
            "- " + money(totals.discount);

    }


    const grandTotalElement =
        $("#grandTotalValue");

    if (grandTotalElement) {

        grandTotalElement.textContent =
            money(totals.total);

    }


    const itemCountElement =
        $("#summaryItemCount");

    if (itemCountElement) {

        const count = getCartItemCount();

        itemCountElement.textContent =
            count +
            (count === 1 ? " item" : " items");

    }


    const navCartCount =
        $("#navCartCount");

    if (navCartCount) {

        navCartCount.textContent =
            getCartItemCount();

    }

}


/* ==========================================================================
   CHECKOUT VISIBILITY
========================================================================== */

function updateCheckoutVisibility() {

    const emptyCheckout =
        $("#emptyCheckout");

    const checkoutContent =
        $("#checkoutContent");


    if (!cart.length) {

        emptyCheckout?.classList.remove("hidden");

        checkoutContent?.classList.add("hidden");

    } else {

        emptyCheckout?.classList.add("hidden");

        checkoutContent?.classList.remove("hidden");

    }

}


/* ==========================================================================
   PAYMENT METHOD NAME
========================================================================== */

function getPaymentMethodName(method) {

    const names = {

        card: "Credit / Debit Card",

        bank: "Bank Transfer",

        cod: "Cash on Delivery",

        easypaisa: "Easypaisa",

        jazzcash: "JazzCash"

    };

    return names[method] || "Cash on Delivery";
}


/* ==========================================================================
   PAYMENT DETAILS
========================================================================== */

function renderPaymentDetails(method) {

    const container =
        $("#paymentDetails");

    if (!container) {
        return;
    }


    /* CARD */

    if (method === "card") {

        container.innerHTML = `

            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">

                <div class="flex items-center gap-2 mb-5">

                    <span class="material-symbols-outlined text-orange-500">
                        credit_card
                    </span>

                    <div class="font-bold">
                        Card Details
                    </div>

                </div>


                <div class="space-y-4">

                    <div>

                        <label class="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                            Card Number
                        </label>

                        <input
                            id="cardNumber"
                            type="text"
                            inputmode="numeric"
                            autocomplete="cc-number"
                            maxlength="19"
                            class="input-field"
                            placeholder="1234 5678 9012 3456">

                    </div>


                    <div class="grid grid-cols-2 gap-4">

                        <div>

                            <label class="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                                Expiry
                            </label>

                            <input
                                id="cardExpiry"
                                type="text"
                                inputmode="numeric"
                                autocomplete="cc-exp"
                                maxlength="5"
                                class="input-field"
                                placeholder="MM/YY">

                        </div>


                        <div>

                            <label class="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                                CVV
                            </label>

                            <input
                                id="cardCVV"
                                type="password"
                                inputmode="numeric"
                                autocomplete="cc-csc"
                                maxlength="4"
                                class="input-field"
                                placeholder="123">

                        </div>

                    </div>


                    <div>

                        <label class="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                            Cardholder Name
                        </label>

                        <input
                            id="cardName"
                            type="text"
                            autocomplete="cc-name"
                            class="input-field"
                            placeholder="Name on card">

                    </div>

                </div>


                <div class="mt-4 text-xs text-gray-500 flex gap-2">

                    <span class="material-symbols-outlined text-sm">
                        lock
                    </span>

                    <span>
                        Demo checkout only. Do not use real card details.
                    </span>

                </div>

            </div>

        `;

        setupCardFormatting();

        return;
    }


    /* BANK */

    if (method === "bank") {

        container.innerHTML = `

            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">

                <div class="flex items-center gap-3 mb-5">

                    <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">

                        <span class="material-symbols-outlined text-orange-500">
                            account_balance
                        </span>

                    </div>

                    <div>

                        <div class="font-bold">
                            Bank Transfer
                        </div>

                        <div class="text-xs text-gray-500">
                            Transfer the order amount to:
                        </div>

                    </div>

                </div>


                <div class="space-y-3">

                    <div class="flex justify-between gap-4 bg-white/5 rounded-xl p-4">

                        <span class="text-gray-500 text-sm">
                            Bank
                        </span>

                        <strong class="text-sm">
                            KHELZONE Business Account
                        </strong>

                    </div>


                    <div class="flex justify-between gap-4 bg-white/5 rounded-xl p-4">

                        <span class="text-gray-500 text-sm">
                            Account Title
                        </span>

                        <strong class="text-sm">
                            KHELZONE
                        </strong>

                    </div>


                    <div class="flex justify-between gap-4 bg-white/5 rounded-xl p-4">

                        <span class="text-gray-500 text-sm">
                            Account Number
                        </span>

                        <strong class="text-sm tracking-wider">
                            XXXXXXXX
                        </strong>

                    </div>


                    <div class="flex justify-between gap-4 bg-white/5 rounded-xl p-4">

                        <span class="text-gray-500 text-sm">
                            IBAN
                        </span>

                        <strong class="text-sm tracking-wider">
                            PKXX XXXX XXXX XXXX
                        </strong>

                    </div>

                </div>


                <div class="mt-5 text-xs text-yellow-500 bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">

                    Replace these placeholder bank details with your real business bank details.

                </div>

            </div>

        `;

        return;
    }


    /* EASYPAISA */

    if (method === "easypaisa") {

        container.innerHTML = `

            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">

                <div class="flex items-center gap-3 mb-5">

                    <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">

                        <span class="material-symbols-outlined text-orange-500">
                            smartphone
                        </span>

                    </div>

                    <div>

                        <div class="font-bold">
                            Easypaisa
                        </div>

                        <div class="text-xs text-gray-500">
                            Enter your Easypaisa number.
                        </div>

                    </div>

                </div>


                <label class="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                    Easypaisa Mobile Number
                </label>

                <input
                    id="easypaisaNumber"
                    type="tel"
                    inputmode="numeric"
                    autocomplete="tel"
                    maxlength="13"
                    class="input-field"
                    placeholder="03XX XXXXXXX">


                <div class="mt-4 text-xs text-gray-500">

                    Frontend demo only. Real Easypaisa payment requires merchant/gateway integration.

                </div>

            </div>

        `;

        return;
    }


    /* JAZZCASH */

    if (method === "jazzcash") {

        container.innerHTML = `

            <div class="rounded-2xl border border-white/10 bg-black/20 p-5">

                <div class="flex items-center gap-3 mb-5">

                    <div class="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">

                        <span class="material-symbols-outlined text-orange-500">
                            phone_iphone
                        </span>

                    </div>

                    <div>

                        <div class="font-bold">
                            JazzCash
                        </div>

                        <div class="text-xs text-gray-500">
                            Enter your JazzCash number.
                        </div>

                    </div>

                </div>


                <label class="block text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                    JazzCash Mobile Number
                </label>

                <input
                    id="jazzcashNumber"
                    type="tel"
                    inputmode="numeric"
                    autocomplete="tel"
                    maxlength="13"
                    class="input-field"
                    placeholder="03XX XXXXXXX">


                <div class="mt-4 text-xs text-gray-500">

                    Frontend demo only. Real JazzCash payment requires merchant/gateway integration.

                </div>

            </div>

        `;

        return;
    }


    /* COD */

    if (method === "cod") {

        container.innerHTML = `

            <div class="rounded-2xl border border-green-500/10 bg-green-500/5 p-5">

                <div class="flex items-start gap-3">

                    <span class="material-symbols-outlined text-green-500">
                        local_shipping
                    </span>

                    <div>

                        <div class="font-bold">
                            Cash on Delivery Selected
                        </div>

                        <p class="text-xs text-gray-500 mt-1 leading-relaxed">
                            Pay in cash when your KHELZONE order arrives.
                        </p>

                    </div>

                </div>

            </div>

        `;

    }

}


/* ==========================================================================
   PAYMENT METHODS
========================================================================== */

function setupPaymentMethods() {

    const options =
        $$(".payment-option");


    options.forEach(function (option) {

        option.addEventListener("click", function (event) {

            const radio =
                option.querySelector(
                    'input[type="radio"]'
                );


            if (!radio) {
                return;
            }


            radio.checked = true;

            selectedPaymentMethod =
                radio.value;


            options.forEach(function (item) {

                item.classList.toggle(
                    "active",
                    item === option
                );

            });


            renderPaymentDetails(
                selectedPaymentMethod
            );

        });

    });


    /* Also handle radio change directly */

    $$('input[name="paymentMethod"]')
        .forEach(function (radio) {

            radio.addEventListener(
                "change",
                function () {

                    if (!radio.checked) {
                        return;
                    }


                    selectedPaymentMethod =
                        radio.value;


                    options.forEach(function (option) {

                        const optionRadio =
                            option.querySelector(
                                'input[type="radio"]'
                            );

                        option.classList.toggle(
                            "active",
                            optionRadio === radio
                        );

                    });


                    renderPaymentDetails(
                        selectedPaymentMethod
                    );

                }
            );

        });


    const checked =
        document.querySelector(
            'input[name="paymentMethod"]:checked'
        );


    if (checked) {

        selectedPaymentMethod =
            checked.value;

    }


    const activeOption =
        options.find(function (option) {

            const radio =
                option.querySelector(
                    'input[type="radio"]'
                );

            return radio &&
                radio.value === selectedPaymentMethod;

        });


    options.forEach(function (option) {

        option.classList.toggle(
            "active",
            option === activeOption
        );

    });


    renderPaymentDetails(
        selectedPaymentMethod
    );

}


/* ==========================================================================
   CARD FORMATTING
========================================================================== */

function setupCardFormatting() {

    const cardNumber =
        $("#cardNumber");

    const expiry =
        $("#cardExpiry");

    const cvv =
        $("#cardCVV");


    if (cardNumber) {

        cardNumber.addEventListener(
            "input",
            function (event) {

                let value =
                    event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16);


                const chunks =
                    value.match(/.{1,4}/g);


                event.target.value =
                    chunks
                        ? chunks.join(" ")
                        : "";

            }
        );

    }


    if (expiry) {

        expiry.addEventListener(
            "input",
            function (event) {

                let value =
                    event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);


                if (value.length > 2) {

                    value =
                        value.slice(0, 2) +
                        "/" +
                        value.slice(2);

                }


                event.target.value =
                    value;

            }
        );

    }


    if (cvv) {

        cvv.addEventListener(
            "input",
            function (event) {

                event.target.value =
                    event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 4);

            }
        );

    }

}


/* ==========================================================================
   PHONE VALIDATION
========================================================================== */

function isValidPakistaniPhone(value) {

    const cleaned =
        String(value || "")
            .replace(/[\s-]/g, "");


    return /^(\+92|0092|0)3\d{9}$/
        .test(cleaned);
}


/* ==========================================================================
   EMAIL VALIDATION
========================================================================== */

function isValidEmail(value) {

    const email =
        String(value || "").trim();


    if (!email) {
        return true;
    }


    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}


/* ==========================================================================
   FIELD ERROR
========================================================================== */

function showFieldError(id, show) {

    const element =
        $("#" + id);


    if (!element) {
        return;
    }


    element.classList.toggle(
        "hidden",
        !show
    );
}


/* ==========================================================================
   CUSTOMER VALIDATION
========================================================================== */

function validateCustomerDetails() {

    let valid = true;


    const name =
        $("#customerName")?.value.trim() || "";

    const phone =
        $("#customerPhone")?.value.trim() || "";

    const city =
        $("#customerCity")?.value.trim() || "";

    const address =
        $("#customerAddress")?.value.trim() || "";

    const email =
        $("#customerEmail")?.value.trim() || "";


    const nameInvalid =
        name.length < 2;

    const phoneInvalid =
        !isValidPakistaniPhone(phone);

    const cityInvalid =
        city.length < 2;

    const addressInvalid =
        address.length < 8;

    const emailInvalid =
        !isValidEmail(email);


    showFieldError(
        "nameError",
        nameInvalid
    );

    showFieldError(
        "phoneError",
        phoneInvalid
    );

    showFieldError(
        "addressError",
        addressInvalid
    );


    if (nameInvalid) {
        valid = false;
    }


    if (phoneInvalid) {
        valid = false;
    }


    if (cityInvalid) {

        showToast(
            "Please enter your city.",
            "error"
        );

        valid = false;

    }


    if (addressInvalid) {
        valid = false;
    }


    if (emailInvalid) {

        showToast(
            "Please enter a valid email address.",
            "error"
        );

        valid = false;

    }


    if (!valid) {

        if (nameInvalid) {
            $("#customerName")?.focus();
        } else if (phoneInvalid) {
            $("#customerPhone")?.focus();
        } else if (cityInvalid) {
            $("#customerCity")?.focus();
        } else if (addressInvalid) {
            $("#customerAddress")?.focus();
        }

    }


    return valid;
}


/* ==========================================================================
   PAYMENT VALIDATION
========================================================================== */

function validatePaymentDetails() {


    /* COD */

    if (selectedPaymentMethod === "cod") {
        return true;
    }


    /* BANK */

    if (selectedPaymentMethod === "bank") {
        return true;
    }


    /* CARD */

    if (selectedPaymentMethod === "card") {

        const number =
            $("#cardNumber")?.value
                .replace(/\D/g, "") || "";

        const expiry =
            $("#cardExpiry")?.value.trim() || "";

        const cvv =
            $("#cardCVV")?.value.trim() || "";

        const cardName =
            $("#cardName")?.value.trim() || "";


        if (!/^\d{16}$/.test(number)) {

            showToast(
                "Please enter a valid 16-digit card number.",
                "error"
            );

            $("#cardNumber")?.focus();

            return false;
        }


        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {

            showToast(
                "Please enter expiry in MM/YY format.",
                "error"
            );

            $("#cardExpiry")?.focus();

            return false;
        }


        if (!/^\d{3,4}$/.test(cvv)) {

            showToast(
                "Please enter a valid CVV.",
                "error"
            );

            $("#cardCVV")?.focus();

            return false;
        }


        if (cardName.length < 2) {

            showToast(
                "Please enter the cardholder name.",
                "error"
            );

            $("#cardName")?.focus();

            return false;
        }


        return true;
    }


    /* EASYPAISA */

    if (selectedPaymentMethod === "easypaisa") {

        const number =
            $("#easypaisaNumber")
                ?.value.trim() || "";


        if (!isValidPakistaniPhone(number)) {

            showToast(
                "Please enter a valid Easypaisa mobile number.",
                "error"
            );

            $("#easypaisaNumber")?.focus();

            return false;
        }


        return true;
    }


    /* JAZZCASH */

    if (selectedPaymentMethod === "jazzcash") {

        const number =
            $("#jazzcashNumber")
                ?.value.trim() || "";


        if (!isValidPakistaniPhone(number)) {

            showToast(
                "Please enter a valid JazzCash mobile number.",
                "error"
            );

            $("#jazzcashNumber")?.focus();

            return false;
        }


        return true;
    }


    showToast(
        "Please select a payment method.",
        "error"
    );


    return false;
}


/* ==========================================================================
   ORDER ID
========================================================================== */

function generateOrderId() {

    const timestamp =
        Date.now()
            .toString()
            .slice(-8);

    const random =
        Math.floor(
            100 +
            Math.random() * 900
        );


    return `KZ-${timestamp}-${random}`;
}


/* ==========================================================================
   CUSTOMER DATA
========================================================================== */

function getCustomerData() {

    return {

        name:
            $("#customerName")
                ?.value.trim() || "",

        phone:
            $("#customerPhone")
                ?.value.trim() || "",

        email:
            $("#customerEmail")
                ?.value.trim() || "",

        city:
            $("#customerCity")
                ?.value.trim() || "",

        postal:
            $("#customerPostal")
                ?.value.trim() || "",

        address:
            $("#customerAddress")
                ?.value.trim() || "",

        notes:
            $("#orderNotes")
                ?.value.trim() || ""

    };
}


/* ==========================================================================
   BUILD ORDER
========================================================================== */

function buildOrder() {

    const customer =
        getCustomerData();


    const orderItems =
        cart.map(function (item) {

            return {

                id: item.id,

                name: item.name,

                price: Number(item.price) || 0,

                quantity: Number(item.quantity) || 1,

                image:
                    item.image ||
                    item.image_url ||
                    "",

                size:
                    item.size || "",

                color:
                    item.color || "",

                sport:
                    item.sport || ""

            };

        });


    return {

        id:
            generateOrderId(),

        createdAt:
            new Date().toISOString(),

        status:
            "pending",

        paymentMethod:
            selectedPaymentMethod,

        paymentMethodName:
            getPaymentMethodName(
                selectedPaymentMethod
            ),

        customer:
            customer,

        items:
            orderItems,

        subtotal:
            Number(orderTotals.subtotal) || 0,

        shipping:
            Number(orderTotals.shipping) || 0,

        discount:
            Number(orderTotals.discount) || 0,

        total:
            Number(orderTotals.total) || 0

    };
}


/* ==========================================================================
   SAVE ORDER
========================================================================== */

function saveOrder(order) {

    try {

        let existing = [];


        const saved =
            localStorage.getItem(
                ORDERS_STORAGE_KEY
            );


        if (saved) {

            try {

                const parsed =
                    JSON.parse(saved);

                if (Array.isArray(parsed)) {
                    existing = parsed;
                }

            } catch (parseError) {

                console.warn(
                    "Existing orders data was invalid. Resetting it."
                );

            }

        }


        existing.unshift(order);


        localStorage.setItem(
            ORDERS_STORAGE_KEY,
            JSON.stringify(existing)
        );


        localStorage.setItem(
            LAST_ORDER_STORAGE_KEY,
            JSON.stringify(order)
        );


        return true;

    } catch (error) {

        console.error(
            "KHELZONE order save error:",
            error
        );

        return false;
    }
}


/* ==========================================================================
   CLEAR CART
========================================================================== */

function clearCart() {

    try {

        localStorage.removeItem(
            CART_STORAGE_KEY
        );

        cart = [];

        return true;

    } catch (error) {

        console.error(
            "KHELZONE cart clear error:",
            error
        );

        return false;
    }
}


/* ==========================================================================
   SUCCESS MODAL
========================================================================== */

function showSuccessModal(order) {

    const modal =
        $("#successModal");


    if (!modal) {

        alert(
            "Order placed successfully!\n\n" +
            "Order ID: " +
            order.id
        );

        return;
    }


    const orderId =
        $("#successOrderId");

    const total =
        $("#successTotal");

    const payment =
        $("#successPayment");


    if (orderId) {
        orderId.textContent =
            order.id;
    }


    if (total) {
        total.textContent =
            money(order.total);
    }


    if (payment) {
        payment.textContent =
            order.paymentMethodName;
    }


    modal.classList.remove(
        "hidden"
    );

}


/* ==========================================================================
   LOADING BUTTON
========================================================================== */

function setPlaceOrderLoading(loading) {

    const button =
        $("#placeOrderBtn");

    if (!button) {
        return;
    }


    button.disabled =
        loading;


    button.classList.toggle(
        "opacity-70",
        loading
    );

    button.classList.toggle(
        "cursor-not-allowed",
        loading
    );


    const text =
        $("#placeOrderText");

    if (text) {

        text.textContent =
            loading
                ? "Processing..."
                : "Place Order";

    }


    const icon =
        $("#placeOrderIcon");

    if (icon) {

        icon.classList.toggle(
            "hidden",
            loading
        );

    }


    const spinner =
        $("#placeOrderSpinner");

    if (spinner) {

        spinner.classList.toggle(
            "hidden",
            !loading
        );

    }

}


/* ==========================================================================
   PLACE ORDER
========================================================================== */

async function placeOrder(event) {

    if (event) {
        event.preventDefault();
    }


    /* Prevent duplicate clicks */

    if (isProcessingOrder) {
        return;
    }


    if (!cart.length) {

        showToast(
            "Your cart is empty.",
            "error"
        );

        return;
    }


    if (!validateCustomerDetails()) {

        showToast(
            "Please complete your delivery details.",
            "error"
        );

        return;
    }


    if (!validatePaymentDetails()) {
        return;
    }


    isProcessingOrder = true;

    setPlaceOrderLoading(true);


    try {

        /*
           Demo processing delay.
           No real payment is processed here.
        */

        await new Promise(function (resolve) {

            setTimeout(
                resolve,
                700
            );

        });


        /*
           Recalculate totals immediately
           before creating the order.
        */

        calculateTotals();


        const order =
            buildOrder();


        const saved =
            saveOrder(order);


        if (!saved) {

            throw new Error(
                "Could not save order."
            );

        }


        clearCart();


        showSuccessModal(order);


        /*
           Update page UI after cart is cleared.
        */

        updateCheckoutVisibility();

        renderOrderItems();

        renderTotals();


    } catch (error) {

        console.error(
            "KHELZONE place order error:",
            error
        );


        showToast(
            "Something went wrong while placing your order. Please try again.",
            "error"
        );


    } finally {

        isProcessingOrder = false;

        setPlaceOrderLoading(false);

    }

}


/* ==========================================================================
   TOAST
========================================================================== */

let toastTimer = null;


function showToast(message, type = "info") {

    const toast =
        $("#toast");

    const text =
        $("#toastText");

    const icon =
        $("#toastIcon");


    if (!toast || !text) {

        console.log(
            `[KHELZONE ${type}] ${message}`
        );

        return;
    }


    text.textContent =
        message;


    if (icon) {

        if (type === "error") {

            icon.textContent =
                "error";

            icon.className =
                "material-symbols-outlined text-red-500";

        } else {

            icon.textContent =
                "check_circle";

            icon.className =
                "material-symbols-outlined text-orange-500";

        }

    }


    toast.classList.remove(
        "translate-y-20",
        "opacity-0"
    );


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(function () {

            toast.classList.add(
                "translate-y-20",
                "opacity-0"
            );

        }, 2800);

}


/* ==========================================================================
   SUCCESS BUTTONS
========================================================================== */

function setupSuccessButtons() {

    const continueButton =
        $("#continueShoppingBtn");


    if (continueButton) {

        continueButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "shop.html";

            }
        );

    }


    const ordersButton =
        $("#viewOrdersBtn");


    if (ordersButton) {

        ordersButton.addEventListener(
            "click",
            function () {

                /*
                   Change to orders.html when
                   your orders page is ready.
                */

                window.location.href =
                    "homepage.html";

            }
        );

    }

}


/* ==========================================================================
   CHECKOUT FORM
========================================================================== */

function setupCheckoutForm() {

    const form =
        $("#checkoutForm");


    if (!form) {
        return;
    }


    /*
       IMPORTANT:
       Only the form submit handles the order.
       This prevents duplicate orders.
    */

    form.addEventListener(
        "submit",
        placeOrder
    );


    /* Clear validation errors */

    $("#customerName")
        ?.addEventListener(
            "input",
            function () {

                showFieldError(
                    "nameError",
                    false
                );

            }
        );


    $("#customerPhone")
        ?.addEventListener(
            "input",
            function () {

                showFieldError(
                    "phoneError",
                    false
                );

            }
        );


    $("#customerAddress")
        ?.addEventListener(
            "input",
            function () {

                showFieldError(
                    "addressError",
                    false
                );

            }
        );

}


/* ==========================================================================
   PLACE ORDER BUTTON
========================================================================== */

function setupPlaceOrderButton() {

    const button =
        $("#placeOrderBtn");


    if (!button) {
        return;
    }


    /*
       If button is inside a form and has:
       
       type="submit"

       then the form submit event handles it.

       We intentionally DO NOT add another click handler here.
       This prevents duplicate orders.
    */

    button.setAttribute(
        "type",
        "submit"
    );

}


/* ==========================================================================
   INITIALIZE
========================================================================== */

function initCheckout() {

    console.log(
        "KHELZONE checkout initialized."
    );


    prepareCart();

    calculateTotals();

    updateCheckoutVisibility();

    renderOrderItems();

    renderTotals();

    setupPaymentMethods();

    setupCheckoutForm();

    setupPlaceOrderButton();

    setupSuccessButtons();

}


/* ==========================================================================
   START
========================================================================== */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initCheckout
    );

} else {

    initCheckout();

}