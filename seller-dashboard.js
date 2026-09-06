/* ============================================================
   KHELZONE SELLER DASHBOARD
   COMPLETE VERSION
   Tables:
   - profiles
   - products
   - orders
   - order_items
============================================================ */

"use strict";

/* ============================================================
   GLOBAL CONFIG
============================================================ */

const supabaseClient = window.supabaseClient;

const LOGIN_PAGE = "index.html";

const DATA_TIMEOUT = 15000;

const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered"
];

/* ============================================================
   GLOBAL STATE
============================================================ */

let currentUser = null;
let currentProfile = null;

let allProducts = [];
let allOrders = [];
let allOrderItems = [];

let currentProductId = null;

/* ============================================================
   BASIC HELPERS
============================================================ */

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* ============================================================
   CURRENCY
============================================================ */

function formatCurrency(value) {
    const number = Number(value || 0);

    return "Rs. " + number.toLocaleString("en-PK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

/* ============================================================
   DATE
============================================================ */

function formatDate(value) {
    if (!value) {
        return "—";
    }

    try {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-PK", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    } catch (error) {
        return "—";
    }
}

/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(status) {
    const value = String(
        status || "pending"
    ).trim().toLowerCase();

    if (ORDER_STATUSES.includes(value)) {
        return value;
    }

    return "pending";
}

function getStatusClass(status) {
    const value = normalizeStatus(status);

    return {
        pending: "status-pending",
        processing: "status-processing",
        shipped: "status-shipped",
        delivered: "status-delivered"
    }[value] || "status-pending";
}

function formatStatus(status) {
    const value = normalizeStatus(status);

    return value.charAt(0).toUpperCase() +
        value.slice(1);
}

/* ============================================================
   TIMEOUT HELPER
============================================================ */

function withTimeout(
    promise,
    timeout = DATA_TIMEOUT,
    message = "Request timed out."
) {
    return Promise.race([
        promise,

        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(message));
            }, timeout);
        })
    ]);
}

/* ============================================================
   TOAST
============================================================ */

function showToast(message, type = "success") {

    let toast =
        document.getElementById(
            "sellerToast"
        );

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "sellerToast";

        toast.style.position = "fixed";
        toast.style.right = "20px";
        toast.style.bottom = "20px";
        toast.style.zIndex = "99999";
        toast.style.padding = "14px 18px";
        toast.style.borderRadius = "10px";
        toast.style.fontWeight = "800";
        toast.style.fontSize = "13px";
        toast.style.boxShadow =
            "0 15px 40px rgba(0,0,0,.4)";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    if (type === "error") {
        toast.style.background = "#7f1d1d";
        toast.style.color = "#fecaca";
        toast.style.border =
            "1px solid #ef4444";
    } else {
        toast.style.background = "#14532d";
        toast.style.color = "#bbf7d0";
        toast.style.border =
            "1px solid #22c55e";
    }

    toast.style.display = "block";

    clearTimeout(
        toast._timer
    );

    toast._timer = setTimeout(() => {
        toast.style.display = "none";
    }, 3000);
}

/* ============================================================
   TABLE MESSAGE
============================================================ */

function showTableMessage(
    tbody,
    colspan,
    message
) {
    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="${colspan}"
                class="table-message"
            >
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}

/* ============================================================
   SUPABASE CHECK
============================================================ */

function checkSupabaseClient() {

    if (!supabaseClient) {

        console.error(
            "window.supabaseClient is missing."
        );

        showToast(
            "Supabase is not configured.",
            "error"
        );

        return false;
    }

    return true;
}

/* ============================================================
   LOADING SCREEN
============================================================ */

function hideLoadingScreen() {

    const screen =
        document.getElementById(
            "loadingScreen"
        );

    if (!screen) {
        return;
    }

    screen.style.display = "none";
}

function showLoadingScreen() {

    const screen =
        document.getElementById(
            "loadingScreen"
        );

    if (!screen) {
        return;
    }

    screen.style.display = "flex";
}

/* ============================================================
   AUTH
============================================================ */

async function getCurrentUser() {

    if (!checkSupabaseClient()) {
        return null;
    }

    try {

        const result =
            await withTimeout(
                supabaseClient.auth.getUser(),
                DATA_TIMEOUT,
                "Authentication request timed out."
            );

        if (result.error) {
            throw result.error;
        }

        return result.data?.user || null;

    } catch (error) {

        console.error(
            "Get current user error:",
            error
        );

        return null;
    }
}

/* ============================================================
   PROFILE
============================================================ */

async function loadCurrentProfile() {

    if (!currentUser) {
        return null;
    }

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("profiles")
                    .select("*")
                    .eq("id", currentUser.id)
                    .maybeSingle(),
                DATA_TIMEOUT,
                "Profile request timed out."
            );

        if (result.error) {
            throw result.error;
        }

        currentProfile =
            result.data || null;

        return currentProfile;

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        return null;
    }
}

/* ============================================================
   SELLER ACCESS
============================================================ */

async function checkSellerAccess() {

    currentUser =
        await getCurrentUser();

    if (!currentUser) {

        window.location.href =
            LOGIN_PAGE;

        return false;
    }

    currentProfile =
        await loadCurrentProfile();

    if (!currentProfile) {

        showToast(
            "Seller profile not found.",
            "error"
        );

        setTimeout(() => {
            window.location.href =
                LOGIN_PAGE;
        }, 1500);

        return false;
    }

    const role =
        String(
            currentProfile.role || ""
        ).toLowerCase();

    /*
     * Seller access.
     *
     * Some projects may use:
     * seller
     * vendor
     *
     * Admin is intentionally NOT treated
     * as seller here.
     */

    if (
        role !== "seller" &&
        role !== "vendor"
    ) {

        showToast(
            "Seller access denied.",
            "error"
        );

        setTimeout(() => {
            window.location.href =
                LOGIN_PAGE;
        }, 1500);

        return false;
    }

    return true;
}

/* ============================================================
   PROFILE UI
============================================================ */

function renderSellerProfile() {

    if (!currentProfile) {
        return;
    }

    const name =
        currentProfile.full_name ||
        currentProfile.name ||
        currentUser?.email ||
        "Seller";

    const email =
        currentProfile.email ||
        currentUser?.email ||
        "—";

    const phone =
        currentProfile.phone ||
        "—";

    const avatar =
        document.getElementById(
            "profileAvatar"
        );

    if (avatar) {
        avatar.textContent =
            name.charAt(0).toUpperCase();
    }

    const sellerNameTop =
        document.getElementById(
            "sellerNameTop"
        );

    if (sellerNameTop) {
        sellerNameTop.textContent =
            name;
    }

    const profileName =
        document.getElementById(
            "profileName"
        );

    if (profileName) {
        profileName.textContent =
            name;
    }

    const profileEmail =
        document.getElementById(
            "profileEmail"
        );

    if (profileEmail) {
        profileEmail.textContent =
            email;
    }

    const profilePhone =
        document.getElementById(
            "profilePhone"
        );

    if (profilePhone) {
        profilePhone.textContent =
            phone;
    }

    const profileRole =
        document.getElementById(
            "profileRole"
        );

    if (profileRole) {
        profileRole.textContent =
            "Seller";
    }
}

/* ============================================================
   NAVIGATION
============================================================ */

function initNavigation() {

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.getAttribute(
                        "data-section"
                    );

                if (!section) {
                    return;
                }

                showSection(section);

                closeMobileMenu();
            }
        );
    });
}

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(
            ".section"
        );

    sections.forEach(section => {

        section.classList.remove(
            "active"
        );

        section.style.display =
            "none";
    });

    const target =
        document.getElementById(
            sectionName
        );

    if (target) {

        target.classList.add(
            "active"
        );

        target.style.display =
            "block";
    }

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );

    buttons.forEach(button => {

        button.classList.remove(
            "active"
        );

        if (
            button.getAttribute(
                "data-section"
            ) === sectionName
        ) {
            button.classList.add(
                "active"
            );
        }
    });

    const titles = {
        dashboardSection:
            "Seller Dashboard",

        productsSection:
            "My Products",

        ordersSection:
            "My Orders",

        profileSection:
            "My Profile"
    };

    const subtitles = {
        dashboardSection:
            "Manage your KHELZONE store",

        productsSection:
            "Manage your products",

        ordersSection:
            "Manage customer orders",

        profileSection:
            "Your seller account"
    };

    const title =
        document.getElementById(
            "pageTitle"
        );

    const subtitle =
        document.getElementById(
            "pageSubtitle"
        );

    if (title) {
        title.textContent =
            titles[sectionName] ||
            "Seller Dashboard";
    }

    if (subtitle) {
        subtitle.textContent =
            subtitles[sectionName] ||
            "Manage your KHELZONE store";
    }
}

/* ============================================================
   MOBILE MENU
============================================================ */

function initMobileMenu() {

    const button =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "mobile-open"
            );
        }
    );
}

function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }
}

/* ============================================================
   LOGOUT
============================================================ */

function initLogout() {

    const button =
        document.getElementById(
            "logoutBtn"
        );

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        async () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmed) {
                return;
            }

            try {

                button.disabled = true;

                const result =
                    await withTimeout(
                        supabaseClient.auth.signOut(),
                        DATA_TIMEOUT,
                        "Logout timed out."
                    );

                if (result.error) {
                    throw result.error;
                }

                window.location.href =
                    LOGIN_PAGE;

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                button.disabled = false;

                showToast(
                    "Logout failed.",
                    "error"
                );
            }
        }
    );
}

/* ============================================================
   PRODUCTS
============================================================ */

async function loadProducts() {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (!tbody) {
        return;
    }

    showTableMessage(
        tbody,
        8,
        "Loading products..."
    );

    if (!currentUser) {
        return;
    }

    try {

        /*
         * IMPORTANT:
         *
         * seller_id must equal the logged-in
         * user's profile ID.
         */

        const result =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .select("*")
                    .eq(
                        "seller_id",
                        currentUser.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    ),
                DATA_TIMEOUT,
                "Products request timed out."
            );

        if (result.error) {
            throw result.error;
        }

        allProducts =
            Array.isArray(result.data)
                ? result.data
                : [];

        renderProducts(
            allProducts
        );

        updateDashboardStats();

    } catch (error) {

        console.error(
            "Load seller products error:",
            error
        );

        showTableMessage(
            tbody,
            8,
            "Failed to load products."
        );
    }
}

/* ============================================================
   RENDER PRODUCTS
============================================================ */

function renderProducts(products) {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (!tbody) {
        return;
    }

    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        showTableMessage(
            tbody,
            8,
            "You have no products yet."
        );

        return;
    }

    tbody.innerHTML =
        products.map(product => {

            const active =
                product.is_active !== false;

            const status =
                active
                    ? "active"
                    : "inactive";

            const image =
                product.image_url ||
                product.image ||
                "";

            return `
                <tr>

                    <td>

                        <div
                            style="
                                display:flex;
                                align-items:center;
                                gap:10px;
                            "
                        >

                            ${
                                image
                                    ? `
                                        <img
                                            class="product-image"
                                            src="${escapeHTML(image)}"
                                            alt="${escapeHTML(product.name || "Product")}"
                                        >
                                      `
                                    : `
                                        <div
                                            class="product-image"
                                            style="
                                                display:flex;
                                                align-items:center;
                                                justify-content:center;
                                                font-size:20px;
                                            "
                                        >
                                            📦
                                        </div>
                                      `
                            }

                            <div>

                                <div
                                    style="
                                        color:#fff;
                                        font-weight:800;
                                    "
                                >
                                    ${escapeHTML(
                                        product.name ||
                                        "Unnamed Product"
                                    )}
                                </div>

                                <div
                                    style="
                                        color:#777;
                                        font-size:11px;
                                        margin-top:3px;
                                    "
                                >
                                    ${escapeHTML(
                                        product.brand ||
                                        ""
                                    )}
                                </div>

                            </div>

                        </div>

                    </td>

                    <td>
                        ${escapeHTML(
                            product.category ||
                            "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            product.sport ||
                            "—"
                        )}
                    </td>

                    <td>
                        <strong
                            style="color:#ff5a00;"
                        >
                            ${formatCurrency(
                                product.price
                            )}
                        </strong>
                    </td>

                    <td>
                        ${Number(
                            product.stock || 0
                        )}
                    </td>

                    <td>

                        <span
                            class="status ${
                                active
                                    ? "status-delivered"
                                    : "status-pending"
                            }"
                        >
                            ${
                                active
                                    ? "Active"
                                    : "Inactive"
                            }
                        </span>

                    </td>

                    <td>

                        ${
                            product.is_best_seller
                                ? `
                                    <span
                                        class="status status-shipped"
                                    >
                                        ★ Yes
                                    </span>
                                  `
                                : `
                                    <span
                                        style="
                                            color:#777;
                                            font-size:12px;
                                        "
                                    >
                                        No
                                    </span>
                                  `
                        }

                    </td>

                    <td>

                        <div
                            style="
                                display:flex;
                                gap:7px;
                                flex-wrap:wrap;
                            "
                        >

                            <button
                                class="btn btn-dark"
                                type="button"
                                onclick="editProduct('${escapeHTML(product.id)}')"
                            >
                                Edit
                            </button>

                            <button
                                class="btn btn-dark"
                                type="button"
                                onclick="toggleProductStatus('${escapeHTML(product.id)}')"
                            >
                                ${
                                    active
                                        ? "Disable"
                                        : "Activate"
                                }
                            </button>

                            <button
                                class="btn btn-danger"
                                type="button"
                                onclick="deleteProduct('${escapeHTML(product.id)}')"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}

/* ============================================================
   PRODUCT SEARCH
============================================================ */

function initProductSearch() {

    const input =
        document.getElementById(
            "productSearch"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            if (!query) {

                renderProducts(
                    allProducts
                );

                return;
            }

            const filtered =
                allProducts.filter(
                    product => {

                        const text =
                            [
                                product.name,
                                product.category,
                                product.sport,
                                product.brand
                            ]
                                .filter(Boolean)
                                .join(" ")
                                .toLowerCase();

                        return text.includes(
                            query
                        );
                    }
                );

            renderProducts(
                filtered
            );
        }
    );
}

/* ============================================================
   OPEN ADD PRODUCT
============================================================ */

function openAddProductModal() {

    currentProductId = null;

    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {
        form.reset();
    }

    const hidden =
        document.getElementById(
            "productId"
        );

    if (hidden) {
        hidden.value = "";
    }

    const title =
        document.getElementById(
            "productModalTitle"
        );

    if (title) {
        title.textContent =
            "Add Product";
    }

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {
        modal.classList.add(
            "open"
        );
    }
}

/* ============================================================
   CLOSE PRODUCT MODAL
============================================================ */

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {
        modal.classList.remove(
            "open"
        );
    }

    currentProductId = null;
}

/* ============================================================
   EDIT PRODUCT
============================================================ */

function editProduct(productId) {

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;
    }

    currentProductId =
        product.id;

    const productIdInput =
        document.getElementById(
            "productId"
        );

    if (productIdInput) {
        productIdInput.value =
            product.id;
    }

    const name =
        document.getElementById(
            "productName"
        );

    const sport =
        document.getElementById(
            "productSport"
        );

    const category =
        document.getElementById(
            "productCategory"
        );

    const description =
        document.getElementById(
            "productDescription"
        );

    const price =
        document.getElementById(
            "productPrice"
        );

    const stock =
        document.getElementById(
            "productStock"
        );

    const brand =
        document.getElementById(
            "productBrand"
        );

    const image =
        document.getElementById(
            "productImage"
        );

    if (name) {
        name.value =
            product.name || "";
    }

    if (sport) {
        sport.value =
            product.sport || "";
    }

    if (category) {
        category.value =
            product.category || "";
    }

    if (description) {
        description.value =
            product.description || "";
    }

    if (price) {
        price.value =
            product.price ?? "";
    }

    if (stock) {
        stock.value =
            product.stock ?? 0;
    }

    if (brand) {
        brand.value =
            product.brand || "";
    }

    if (image) {
        image.value =
            product.image_url ||
            product.image ||
            "";
    }

    const title =
        document.getElementById(
            "productModalTitle"
        );

    if (title) {
        title.textContent =
            "Edit Product";
    }

    const modal =
        document.getElementById(
            "productModal"
        );

    if (modal) {
        modal.classList.add(
            "open"
        );
    }
}

/* ============================================================
   SAVE PRODUCT
============================================================ */

async function saveProduct(event) {

    event.preventDefault();

    if (!currentUser) {

        showToast(
            "Seller account not found.",
            "error"
        );

        return;
    }

    const name =
        document.getElementById(
            "productName"
        )?.value.trim();

    const sport =
        document.getElementById(
            "productSport"
        )?.value.trim();

    const category =
        document.getElementById(
            "productCategory"
        )?.value.trim();

    const description =
        document.getElementById(
            "productDescription"
        )?.value.trim();

    const price =
        Number(
            document.getElementById(
                "productPrice"
            )?.value || 0
        );

    const stock =
        Number(
            document.getElementById(
                "productStock"
            )?.value || 0
        );

    const brand =
        document.getElementById(
            "productBrand"
        )?.value.trim();

    const image =
        document.getElementById(
            "productImage"
        )?.value.trim();

    if (!name) {

        showToast(
            "Product name is required.",
            "error"
        );

        return;
    }

    if (!sport) {

        showToast(
            "Please select a sport.",
            "error"
        );

        return;
    }

    if (price < 0) {

        showToast(
            "Price cannot be negative.",
            "error"
        );

        return;
    }

    if (stock < 0) {

        showToast(
            "Stock cannot be negative.",
            "error"
        );

        return;
    }

    const payload = {

        name: name,

        description:
            description || null,

        sport: sport,

        category:
            category || null,

        brand:
            brand || null,

        price: price,

        stock: stock,

        image_url:
            image || null,

        is_active: true,

        is_best_seller: false
    };

    try {

        let result;

        if (currentProductId) {

            /*
             * Security:
             * Update only if this product belongs
             * to the current seller.
             */

            result =
                await withTimeout(
                    supabaseClient
                        .from("products")
                        .update(payload)
                        .eq(
                            "id",
                            currentProductId
                        )
                        .eq(
                            "seller_id",
                            currentUser.id
                        ),
                    DATA_TIMEOUT,
                    "Product update timed out."
                );

        } else {

            payload.seller_id =
                currentUser.id;

            result =
                await withTimeout(
                    supabaseClient
                        .from("products")
                        .insert(
                            payload
                        ),
                    DATA_TIMEOUT,
                    "Product creation timed out."
                );
        }

        if (result.error) {
            throw result.error;
        }

        closeProductModal();

        showToast(
            currentProductId
                ? "Product updated successfully."
                : "Product added successfully.",
            "success"
        );

        await loadProducts();

        await loadDashboardStats();

    } catch (error) {

        console.error(
            "Save product error:",
            error
        );

        showToast(
            error?.message ||
            "Failed to save product.",
            "error"
        );
    }
}

/* ============================================================
   TOGGLE PRODUCT STATUS
============================================================ */

async function toggleProductStatus(
    productId
) {

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) {

        showToast(
            "Product not found.",
            "error"
        );

        return;
    }

    const newValue =
        product.is_active === false;

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .update({
                        is_active:
                            newValue
                    })
                    .eq(
                        "id",
                        productId
                    )
                    .eq(
                        "seller_id",
                        currentUser.id
                    ),
                DATA_TIMEOUT,
                "Product status update timed out."
            );

        if (result.error) {
            throw result.error;
        }

        showToast(
            newValue
                ? "Product activated."
                : "Product disabled.",
            "success"
        );

        await loadProducts();

    } catch (error) {

        console.error(
            "Toggle product status error:",
            error
        );

        showToast(
            "Failed to update product.",
            "error"
        );
    }
}

/* ============================================================
   DELETE PRODUCT
============================================================ */

async function deleteProduct(
    productId
) {

    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );

    if (!product) {
        return;
    }

    const confirmed =
        window.confirm(
            `Delete "${product.name || "this product"}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .delete()
                    .eq(
                        "id",
                        productId
                    )
                    .eq(
                        "seller_id",
                        currentUser.id
                    ),
                DATA_TIMEOUT,
                "Product deletion timed out."
            );

        if (result.error) {
            throw result.error;
        }

        showToast(
            "Product deleted successfully.",
            "success"
        );

        await loadProducts();

        await loadDashboardStats();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        showToast(
            error?.message ||
            "Failed to delete product.",
            "error"
        );
    }
}

/* ============================================================
   LOAD ORDER ITEMS
============================================================ */

async function loadOrderItems() {

    allOrderItems = [];

    if (!currentUser) {
        return [];
    }

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("order_items")
                    .select("*")
                    .eq(
                        "seller_id",
                        currentUser.id
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    ),
                DATA_TIMEOUT,
                "Order items request timed out."
            );

        if (result.error) {
            throw result.error;
        }

        allOrderItems =
            Array.isArray(result.data)
                ? result.data
                : [];

        return allOrderItems;

    } catch (error) {

        console.error(
            "Load order items error:",
            error
        );

        allOrderItems = [];

        return [];
    }
}

/* ============================================================
   LOAD ORDERS
============================================================ */

async function loadOrders() {

    const tbody =
        document.getElementById(
            "ordersTableBody"
        );

    if (tbody) {

        showTableMessage(
            tbody,
            11,
            "Loading orders..."
        );
    }

    if (!currentUser) {
        return;
    }

    try {

        /*
         * First get this seller's order_items.
         */

        await loadOrderItems();

        if (
            !Array.isArray(
                allOrderItems
            ) ||
            allOrderItems.length === 0
        ) {

            allOrders = [];

            renderOrders([]);

            renderRecentOrders([]);

            updateDashboardStats();

            return;
        }

        const orderIds =
            [
                ...new Set(
                    allOrderItems
                        .map(item => item.order_id)
                        .filter(Boolean)
                )
            ];

        if (orderIds.length === 0) {

            allOrders = [];

            renderOrders([]);

            renderRecentOrders([]);

            return;
        }

        /*
         * Then get only those orders.
         */

        const result =
            await withTimeout(
                supabaseClient
                    .from("orders")
                    .select("*")
                    .in(
                        "id",
                        orderIds
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    ),
                DATA_TIMEOUT,
                "Orders request timed out."
            );

        if (result.error) {
            throw result.error;
        }

        allOrders =
            Array.isArray(result.data)
                ? result.data
                : [];

        /*
         * Attach seller's items to each order.
         */

        allOrders =
            allOrders.map(order => {

                const items =
                    allOrderItems.filter(
                        item =>
                            String(
                                item.order_id
                            ) ===
                            String(order.id)
                    );

                return {
                    ...order,
                    seller_items:
                        items
                };
            });

        renderOrders(
            allOrders
        );

        renderRecentOrders(
            allOrders
        );

        updateDashboardStats();

    } catch (error) {

        console.error(
            "Load seller orders error:",
            error
        );

        if (tbody) {

            showTableMessage(
                tbody,
                11,
                "Failed to load orders."
            );
        }
    }
}

/* ============================================================
   GET CUSTOMER NAME
============================================================ */

function getCustomerName(order) {

    return (
        order.shipping_name ||
        order.customer_name ||
        order.name ||
        "Customer"
    );
}

/* ============================================================
   GET CUSTOMER EMAIL
============================================================ */

function getCustomerEmail(order) {

    return (
        order.customer_email ||
        order.email ||
        "—"
    );
}

/* ============================================================
   GET CUSTOMER PHONE
============================================================ */

function getCustomerPhone(order) {

    return (
        order.shipping_phone ||
        order.phone ||
        "—"
    );
}

/* ============================================================
   GET ORDER NUMBER
============================================================ */

function getOrderNumber(order) {

    return (
        order.order_number ||
        order.id ||
        "—"
    );
}

/* ============================================================
   GET SELLER ORDER TOTAL
============================================================ */

function getSellerOrderTotal(order) {

    const items =
        Array.isArray(
            order.seller_items
        )
            ? order.seller_items
            : [];

    return items.reduce(
        (sum, item) => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const price =
                Number(
                    item.price || 0
                );

            return sum +
                (quantity * price);

        },
        0
    );
}

/* ============================================================
   RENDER ORDERS
============================================================ */

function renderOrders(orders) {

    const tbody =
        document.getElementById(
            "ordersTableBody"
        );

    if (!tbody) {
        return;
    }

    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        showTableMessage(
            tbody,
            11,
            "No orders found."
        );

        return;
    }

    let rows = [];

    orders.forEach(order => {

        const items =
            Array.isArray(
                order.seller_items
            )
                ? order.seller_items
                : [];

        if (items.length === 0) {
            return;
        }

        items.forEach(item => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const price =
                Number(
                    item.price || 0
                );

            const lineTotal =
                quantity * price;

            rows.push(`
                <tr>

                    <td>
                        <strong
                            style="color:#ff5a00;"
                        >
                            ${escapeHTML(
                                String(
                                    getOrderNumber(
                                        order
                                    )
                                ).slice(0, 12)
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            getCustomerName(
                                order
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getCustomerEmail(
                                order
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            getCustomerPhone(
                                order
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.product_name ||
                            "Product"
                        )}
                    </td>

                    <td>
                        ${quantity}
                    </td>

                    <td>
                        ${formatCurrency(
                            price
                        )}
                    </td>

                    <td>
                        <strong>
                            ${formatCurrency(
                                lineTotal
                            )}
                        </strong>
                    </td>

                    <td>

                        <span
                            class="status ${getStatusClass(
                                order.status
                            )}"
                        >
                            ${escapeHTML(
                                formatStatus(
                                    order.status
                                )
                            )}
                        </span>

                    </td>

                    <td>
                        ${formatDate(
                            order.created_at
                        )}
                    </td>

                    <td>

                        <div
                            style="
                                display:flex;
                                gap:7px;
                            "
                        >

                            <button
                                type="button"
                                class="btn btn-dark"
                                onclick="viewOrder('${escapeHTML(order.id)}')"
                            >
                                View
                            </button>

                            <button
                                type="button"
                                class="btn btn-orange"
                                onclick="changeOrderStatus('${escapeHTML(order.id)}')"
                            >
                                Status
                            </button>

                        </div>

                    </td>

                </tr>
            `);
        });
    });

    if (rows.length === 0) {

        showTableMessage(
            tbody,
            11,
            "No orders found."
        );

        return;
    }

    tbody.innerHTML =
        rows.join("");
}

/* ============================================================
   RECENT ORDERS
============================================================ */

function renderRecentOrders(
    orders
) {

    const tbody =
        document.getElementById(
            "recentOrdersBody"
        );

    if (!tbody) {
        return;
    }

    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        showTableMessage(
            tbody,
            7,
            "No recent orders."
        );

        return;
    }

    const recent =
        orders.slice(0, 5);

    let rows = [];

    recent.forEach(order => {

        const items =
            Array.isArray(
                order.seller_items
            )
                ? order.seller_items
            : [];

        if (items.length === 0) {
            return;
        }

        const item =
            items[0];

        const quantity =
            Number(
                item.quantity || 0
            );

        const price =
            Number(
                item.price || 0
            );

        const total =
            quantity * price;

        rows.push(`
            <tr>

                <td>
                    ${escapeHTML(
                        String(
                            getOrderNumber(
                                order
                            )
                        ).slice(0, 12)
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        getCustomerName(
                            order
                        )
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        item.product_name ||
                        "Product"
                    )}
                </td>

                <td>
                    ${quantity}
                </td>

                <td>
                    ${formatCurrency(
                        total
                    )}
                </td>

                <td>

                    <span
                        class="status ${getStatusClass(
                            order.status
                        )}"
                    >
                        ${escapeHTML(
                            formatStatus(
                                order.status
                            )
                        )}
                    </span>

                </td>

                <td>
                    ${formatDate(
                        order.created_at
                    )}
                </td>

            </tr>
        `);
    });

    if (rows.length === 0) {

        showTableMessage(
            tbody,
            7,
            "No recent orders."
        );

        return;
    }

    tbody.innerHTML =
        rows.join("");
}

/* ============================================================
   VIEW ORDER
============================================================ */

function viewOrder(orderId) {

    const order =
        allOrders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) {

        showToast(
            "Order not found.",
            "error"
        );

        return;
    }

    const modal =
        document.getElementById(
            "orderModal"
        );

    const body =
        document.getElementById(
            "orderModalBody"
        );

    if (!modal || !body) {
        return;
    }

    const items =
        Array.isArray(
            order.seller_items
        )
            ? order.seller_items
            : [];

    let itemsHTML =
        items.map(item => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const price =
                Number(
                    item.price || 0
                );

            return `
                <div
                    style="
                        background:#141414;
                        border:1px solid rgba(255,255,255,.06);
                        border-radius:10px;
                        padding:13px;
                        margin-bottom:10px;
                    "
                >

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            gap:15px;
                        "
                    >

                        <div>

                            <div
                                style="
                                    color:#fff;
                                    font-weight:800;
                                "
                            >
                                ${escapeHTML(
                                    item.product_name ||
                                    "Product"
                                )}
                            </div>

                            <div
                                style="
                                    color:#777;
                                    font-size:12px;
                                    margin-top:4px;
                                "
                            >
                                Quantity:
                                ${quantity}
                            </div>

                        </div>

                        <div
                            style="
                                color:#ff5a00;
                                font-weight:900;
                            "
                        >
                            ${formatCurrency(
                                quantity *
                                price
                            )}
                        </div>

                    </div>

                    <div
                        style="
                            color:#888;
                            font-size:11px;
                            margin-top:7px;
                        "
                    >
                        Unit price:
                        ${formatCurrency(price)}
                    </div>

                </div>
            `;

        }).join("");

    if (!itemsHTML) {
        itemsHTML =
            `<div style="color:#777;">No items.</div>`;
    }

    const sellerTotal =
        getSellerOrderTotal(
            order
        );

    body.innerHTML = `

        <div
            class="detail-grid"
            style="margin-bottom:20px;"
        >

            <div class="detail-item">

                <div class="detail-label">
                    Order ID
                </div>

                <div class="detail-value">
                    ${escapeHTML(
                        getOrderNumber(
                            order
                        )
                    )}
                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    Status
                </div>

                <div class="detail-value">

                    <span
                        class="status ${getStatusClass(
                            order.status
                        )}"
                    >
                        ${escapeHTML(
                            formatStatus(
                                order.status
                            )
                        )}
                    </span>

                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    Customer
                </div>

                <div class="detail-value">
                    ${escapeHTML(
                        getCustomerName(
                            order
                        )
                    )}
                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    Email
                </div>

                <div class="detail-value">
                    ${escapeHTML(
                        getCustomerEmail(
                            order
                        )
                    )}
                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    Contact
                </div>

                <div class="detail-value">
                    ${escapeHTML(
                        getCustomerPhone(
                            order
                        )
                    )}
                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    City
                </div>

                <div class="detail-value">
                    ${escapeHTML(
                        order.shipping_city ||
                        "—"
                    )}
                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    Payment Method
                </div>

                <div class="detail-value">
                    ${escapeHTML(
                        order.payment_method ||
                        "—"
                    )}
                </div>

            </div>

            <div class="detail-item">

                <div class="detail-label">
                    Seller Total
                </div>

                <div
                    class="detail-value"
                    style="color:#ff5a00;"
                >
                    ${formatCurrency(
                        sellerTotal
                    )}
                </div>

            </div>

        </div>

        <div
            class="detail-item"
            style="margin-bottom:15px;"
        >

            <div class="detail-label">
                Shipping Address
            </div>

            <div class="detail-value">
                ${escapeHTML(
                    order.shipping_address ||
                    "—"
                )}
            </div>

        </div>

        <div>

            <div
                style="
                    color:#fff;
                    font-size:15px;
                    font-weight:900;
                    margin-bottom:10px;
                "
            >
                Your Order Items
            </div>

            ${itemsHTML}

        </div>

        <div
            style="
                display:flex;
                justify-content:flex-end;
                margin-top:15px;
            "
        >

            <button
                type="button"
                class="btn btn-orange"
                onclick="changeOrderStatus('${escapeHTML(order.id)}')"
            >
                Change Status
            </button>

        </div>
    `;

    modal.classList.add(
        "open"
    );
}

/* ============================================================
   CLOSE ORDER MODAL
============================================================ */

function closeOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );

    if (modal) {
        modal.classList.remove(
            "open"
        );
    }
}

/* ============================================================
   CHANGE ORDER STATUS
============================================================ */

async function changeOrderStatus(
    orderId
) {

    const order =
        allOrders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) {

        showToast(
            "Order not found.",
            "error"
        );

        return;
    }

    const current =
        normalizeStatus(
            order.status
        );

    const currentIndex =
        ORDER_STATUSES.indexOf(
            current
        );

    let options =
        ORDER_STATUSES;

    /*
     * Seller can move the order through
     * the four normal statuses.
     */

    const selected =
        window.prompt(
            "Enter status:\n\n" +
            "1. Pending\n" +
            "2. Processing\n" +
            "3. Shipped\n" +
            "4. Delivered\n\n" +
            "Current: " +
            formatStatus(current),
            String(
                currentIndex + 1
            )
        );

    if (selected === null) {
        return;
    }

    let newStatus = null;

    const numeric =
        Number(
            selected.trim()
        );

    if (
        numeric >= 1 &&
        numeric <= 4
    ) {
        newStatus =
            options[
                numeric - 1
            ];
    } else {

        const typed =
            selected
                .trim()
                .toLowerCase();

        if (
            ORDER_STATUSES.includes(
                typed
            )
        ) {
            newStatus = typed;
        }
    }

    if (!newStatus) {

        showToast(
            "Invalid status.",
            "error"
        );

        return;
    }

    if (newStatus === current) {

        showToast(
            "Order is already " +
            formatStatus(current) +
            ".",
            "error"
        );

        return;
    }

    await setOrderStatus(
        orderId,
        newStatus
    );
}

/* ============================================================
   SET ORDER STATUS
============================================================ */

async function setOrderStatus(
    orderId,
    newStatus
) {

    const status =
        normalizeStatus(
            newStatus
        );

    if (!ORDER_STATUSES.includes(status)) {

        showToast(
            "Invalid order status.",
            "error"
        );

        return;
    }

    if (!currentUser) {
        return;
    }

    try {

        /*
         * First verify this seller actually
         * has items in this order.
         */

        const sellerItems =
            allOrderItems.filter(
                item =>
                    String(
                        item.order_id
                    ) ===
                    String(orderId) &&
                    String(
                        item.seller_id
                    ) ===
                    String(currentUser.id)
            );

        if (
            sellerItems.length === 0
        ) {

            showToast(
                "You cannot update this order.",
                "error"
            );

            return;
        }

        /*
         * IMPORTANT:
         *
         * Current orders table has ONE status
         * for the whole order.
         *
         * Therefore updating it changes the
         * order status for the customer/admin too.
         */

        const result =
            await withTimeout(
                supabaseClient
                    .from("orders")
                    .update({
                        status: status,
                        updated_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "id",
                        orderId
                    ),
                DATA_TIMEOUT,
                "Order status update timed out."
            );

        if (result.error) {
            throw result.error;
        }

        showToast(
            "Order status updated to " +
            formatStatus(status) +
            ".",
            "success"
        );

        closeOrderModal();

        await loadOrders();

    } catch (error) {

        console.error(
            "Set order status error:",
            error
        );

        showToast(
            error?.message ||
            "Failed to update order status.",
            "error"
        );
    }
}

/* ============================================================
   ORDER SEARCH
============================================================ */

function initOrderSearch() {

    const input =
        document.getElementById(
            "orderSearch"
        );

    if (!input) {
        return;
    }

    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            if (!query) {

                renderOrders(
                    allOrders
                );

                return;
            }

            const filtered =
                allOrders.filter(
                    order => {

                        const items =
                            Array.isArray(
                                order.seller_items
                            )
                                ? order.seller_items
                                : [];

                        const itemText =
                            items
                                .map(
                                    item =>
                                        item.product_name ||
                                        ""
                                )
                                .join(" ");

                        const text =
                            [
                                getOrderNumber(
                                    order
                                ),
                                getCustomerName(
                                    order
                                ),
                                getCustomerEmail(
                                    order
                                ),
                                getCustomerPhone(
                                    order
                                ),
                                itemText,
                                order.status
                            ]
                                .join(" ")
                                .toLowerCase();

                        return text.includes(
                            query
                        );
                    }
                );

            renderOrders(
                filtered
            );
        }
    );
}

/* ============================================================
   DASHBOARD STATS
============================================================ */

async function loadDashboardStats() {

    if (!currentUser) {
        return;
    }

    try {

        /*
         * Products count is based on loaded seller
         * products.
         */

        const totalProducts =
            allProducts.length;

        const totalOrders =
            allOrders.length;

        const pendingOrders =
            allOrders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) === "pending"
            ).length;

        const deliveredOrders =
            allOrders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) === "delivered"
            ).length;

        const totalSales =
            allOrderItems.reduce(
                (sum, item) => {

                    const quantity =
                        Number(
                            item.quantity || 0
                        );

                    const price =
                        Number(
                            item.price || 0
                        );

                    return sum +
                        quantity *
                        price;

                },
                0
            );

        updateElement(
            "totalProducts",
            totalProducts
        );

        updateElement(
            "totalOrders",
            totalOrders
        );

        updateElement(
            "pendingOrders",
            pendingOrders
        );

        updateElement(
            "deliveredOrders",
            deliveredOrders
        );

        updateElement(
            "totalSales",
            formatCurrency(
                totalSales
            )
        );

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );
    }
}

function updateDashboardStats() {

    const totalProducts =
        allProducts.length;

    const totalOrders =
        allOrders.length;

    const pendingOrders =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "pending"
        ).length;

    const deliveredOrders =
        allOrders.filter(
            order =>
                normalizeStatus(
                    order.status
                ) === "delivered"
        ).length;

    const totalSales =
        allOrderItems.reduce(
            (sum, item) => {

                const quantity =
                    Number(
                        item.quantity || 0
                    );

                const price =
                    Number(
                        item.price || 0
                    );

                return sum +
                    quantity *
                    price;

            },
            0
        );

    updateElement(
        "totalProducts",
        totalProducts
    );

    updateElement(
        "totalOrders",
        totalOrders
    );

    updateElement(
        "pendingOrders",
        pendingOrders
    );

    updateElement(
        "deliveredOrders",
        deliveredOrders
    );

    updateElement(
        "totalSales",
        formatCurrency(
            totalSales
        )
    );
}

/* ============================================================
   UPDATE ELEMENT
============================================================ */

function updateElement(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value;
}

/* ============================================================
   MODAL EVENTS
============================================================ */

function initModals() {

    const closeOrder =
        document.getElementById(
            "closeOrderModal"
        );

    if (closeOrder) {

        closeOrder.addEventListener(
            "click",
            closeOrderModal
        );
    }

    const closeProduct =
        document.getElementById(
            "closeProductModal"
        );

    if (closeProduct) {

        closeProduct.addEventListener(
            "click",
            closeProductModal
        );
    }

    const cancelProduct =
        document.getElementById(
            "cancelProductBtn"
        );

    if (cancelProduct) {

        cancelProduct.addEventListener(
            "click",
            closeProductModal
        );
    }

    const addProduct =
        document.getElementById(
            "addProductBtn"
        );

    if (addProduct) {

        addProduct.addEventListener(
            "click",
            openAddProductModal
        );
    }

    const productForm =
        document.getElementById(
            "productForm"
        );

    if (productForm) {

        productForm.addEventListener(
            "submit",
            saveProduct
        );
    }

    /*
     * Close modals by clicking backdrop.
     */

    const orderModal =
        document.getElementById(
            "orderModal"
        );

    if (orderModal) {

        orderModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    orderModal
                ) {
                    closeOrderModal();
                }
            }
        );
    }

    const productModal =
        document.getElementById(
            "productModal"
        );

    if (productModal) {

        productModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    productModal
                ) {
                    closeProductModal();
                }
            }
        );
    }
}

/* ============================================================
   ESC KEY
============================================================ */

function initEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }

            closeOrderModal();

            closeProductModal();

            closeMobileMenu();
        }
    );
}

/* ============================================================
   REFRESH DASHBOARD
============================================================ */

async function refreshDashboard() {

    await loadProducts();

    await loadOrders();

    updateDashboardStats();
}

/* ============================================================
   INITIALIZE
============================================================ */

async function startSellerDashboard() {

    try {

        showLoadingScreen();

        if (!checkSupabaseClient()) {
            return;
        }

        const access =
            await checkSellerAccess();

        if (!access) {
            return;
        }

        renderSellerProfile();

        initNavigation();

        initMobileMenu();

        initLogout();

        initProductSearch();

        initOrderSearch();

        initModals();

        initEscapeKey();

        /*
         * Start with dashboard.
         */

        showSection(
            "dashboardSection"
        );

        /*
         * Load seller products.
         */

        await loadProducts();

        /*
         * Load seller orders.
         */

        await loadOrders();

        /*
         * Update dashboard.
         */

        updateDashboardStats();

        /*
         * Hide loading only after initialization
         * finishes.
         */

        hideLoadingScreen();

    } catch (error) {

        console.error(
            "SELLER DASHBOARD START ERROR:",
            error
        );

        hideLoadingScreen();

        showToast(
            "Seller dashboard failed to load.",
            "error"
        );
    }
}

/* ============================================================
   WINDOW EXPORTS
============================================================ */

window.startSellerDashboard =
    startSellerDashboard;

window.showSection =
    showSection;

window.editProduct =
    editProduct;

window.deleteProduct =
    deleteProduct;

window.toggleProductStatus =
    toggleProductStatus;

window.viewOrder =
    viewOrder;

window.changeOrderStatus =
    changeOrderStatus;

window.setOrderStatus =
    setOrderStatus;

window.openAddProductModal =
    openAddProductModal;

window.closeProductModal =
    closeProductModal;

window.closeOrderModal =
    closeOrderModal;

window.loadProducts =
    loadProducts;

window.loadOrders =
    loadOrders;

/* ============================================================
   DOM READY
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startSellerDashboard
    );

} else {

    startSellerDashboard();
}