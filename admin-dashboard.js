/* ============================================================
   KHELZONE ADMIN DASHBOARD
   FIXED COMPLETE VERSION
   NO INFINITE LOADING
   + WORKING ORDER STATUS DROPDOWN
============================================================ */

"use strict";

/* ============================================================
   SUPABASE
============================================================ */

const supabaseClient = window.supabaseClient;

/* ============================================================
   GLOBAL STATE
============================================================ */

let currentUser = null;
let currentProfile = null;

let allProducts = [];
let allSellers = [];
let allCustomers = [];
let allOrders = [];

/* ============================================================
   CONSTANTS
============================================================ */

const LOGIN_PAGE = "login.html";
const HOME_PAGE = "homepage.html";

const ACCESS_TIMEOUT = 15000;
const DATA_TIMEOUT = 15000;

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

function formatCurrency(value) {
    const number = Number(value || 0);

    return `Rs ${number.toLocaleString("en-PK")}`;
}

function formatDate(value) {
    if (!value) {
        return "—";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getStatusClass(status) {
    const value = String(status || "")
        .trim()
        .toLowerCase();

    if (
        value === "active" ||
        value === "approved" ||
        value === "completed" ||
        value === "delivered"
    ) {
        return "bg-green-500/15 text-green-400 border border-green-500/30";
    }

    if (
        value === "pending" ||
        value === "processing"
    ) {
        return "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30";
    }

    if (value === "shipped") {
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";
    }

    if (
        value === "inactive" ||
        value === "cancelled" ||
        value === "rejected"
    ) {
        return "bg-red-500/15 text-red-400 border border-red-500/30";
    }

    return "bg-gray-500/15 text-gray-300 border border-gray-500/30";
}

function showTableMessage(tbody, colspan, message) {
    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="${colspan}"
                class="px-6 py-8 text-center text-gray-400"
            >
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}

function getCustomerName(order) {
    return (
        order?.shipping_name ||
        order?.customer_name ||
        order?.full_name ||
        order?.name ||
        order?.customer_email ||
        "Unknown Customer"
    );
}

function getOrderNumber(order) {
    return (
        order?.order_number ||
        order?.order_id ||
        order?.id ||
        "—"
    );
}

/* ============================================================
   TOAST NOTIFICATION
============================================================ */

function showToast(message, type = "success") {
    const toast = document.getElementById("adminToast");

    if (!toast) {
        return;
    }

    toast.textContent = message;
    toast.className = "";
    toast.classList.add(type, "show");

    clearTimeout(showToast._timer);

    showToast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

/* ============================================================
   TIMEOUT HELPER
============================================================ */

function withTimeout(promise, timeout = 15000, message = "Request timed out.") {
    let timer;

    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => {
            reject(new Error(message));
        }, timeout);
    });

    return Promise.race([
        promise,
        timeoutPromise
    ]).finally(() => {
        clearTimeout(timer);
    });
}

/* ============================================================
   SUPABASE CHECK
============================================================ */

function checkSupabaseClient() {
    if (!window.supabaseClient) {
        console.error(
            "KHELZONE: window.supabaseClient not found."
        );

        showAccessError(
            "Supabase connection was not initialized."
        );

        return false;
    }

    if (!window.supabaseClient.auth) {
        console.error(
            "KHELZONE: Supabase Auth not available."
        );

        showAccessError(
            "Supabase Auth is not available."
        );

        return false;
    }

    return true;
}

/* ============================================================
   ACCESS UI
============================================================ */

function hideCheckingScreen() {
    const screen = document.getElementById("checkingScreen");

    if (screen) {
        screen.classList.add("hidden");
        screen.style.display = "none";
    }
}

function showCheckingScreen() {
    const screen = document.getElementById("checkingScreen");

    if (screen) {
        screen.classList.remove("hidden");
        screen.style.display = "flex";
    }
}

function showAccessDenied(message = "You do not have admin access.") {
    hideCheckingScreen();

    const accessDenied =
        document.getElementById("accessDenied");

    const dashboard =
        document.getElementById("dashboard");

    if (dashboard) {
        dashboard.classList.add("hidden");
        dashboard.style.display = "none";
    }

    if (accessDenied) {
        accessDenied.classList.remove("hidden");
        accessDenied.style.display = "flex";

        const messageElement =
            accessDenied.querySelector("[data-access-message]") ||
            accessDenied.querySelector(".access-text") ||
            accessDenied.querySelector("p");

        if (messageElement) {
            messageElement.textContent = message;
        }
    }
}

function showAccessError(message) {
    console.error("KHELZONE ACCESS ERROR:", message);

    showAccessDenied(message);
}

function showAdminDashboard() {
    hideCheckingScreen();

    const accessDenied =
        document.getElementById("accessDenied");

    const dashboard =
        document.getElementById("dashboard");

    if (accessDenied) {
        accessDenied.classList.add("hidden");
        accessDenied.style.display = "none";
    }

    if (dashboard) {
        dashboard.classList.remove("hidden");
        dashboard.style.display = "block";
    }

    if (currentUser) {
        const adminName =
            document.getElementById("adminName");

        const adminEmail =
            document.getElementById("adminEmail");

        if (adminName) {
            adminName.textContent =
                currentProfile?.full_name ||
                currentUser.user_metadata?.full_name ||
                "Admin";
        }

        if (adminEmail) {
            adminEmail.textContent =
                currentUser.email || "-";
        }
    }
}

/* ============================================================
   ADMIN ACCESS CHECK
============================================================ */

async function checkAdminAccess() {
    showCheckingScreen();

    if (!checkSupabaseClient()) {
        return false;
    }

    try {
        console.log(
            "KHELZONE: Checking admin access..."
        );

        const sessionResult = await withTimeout(
            supabaseClient.auth.getSession(),
            ACCESS_TIMEOUT,
            "Login session check timed out."
        );

        const sessionError =
            sessionResult?.error;

        const session =
            sessionResult?.data?.session;

        if (sessionError) {
            console.error(
                "KHELZONE SESSION ERROR:",
                sessionError
            );

            showAccessError(
                "Could not check your login session."
            );

            return false;
        }

        if (!session || !session.user) {
            console.warn(
                "KHELZONE: No logged-in user."
            );

            showAccessDenied(
                "Please login with your admin account first."
            );

            setTimeout(() => {
                window.location.href = LOGIN_PAGE;
            }, 1500);

            return false;
        }

        currentUser = session.user;

        console.log(
            "KHELZONE USER:",
            currentUser.email
        );

        const profileResult = await withTimeout(
            supabaseClient
                .from("profiles")
                .select("id, email, full_name, role")
                .eq("id", currentUser.id)
                .maybeSingle(),

            ACCESS_TIMEOUT,

            "Admin profile check timed out."
        );

        const profile =
            profileResult?.data;

        const profileError =
            profileResult?.error;

        if (profileError) {
            console.error(
                "KHELZONE PROFILE ERROR:",
                profileError
            );

            showAccessError(
                "Could not verify your admin profile."
            );

            return false;
        }

        if (!profile) {
            console.warn(
                "KHELZONE: Profile not found."
            );

            showAccessDenied(
                "Your account profile was not found."
            );

            return false;
        }

        currentProfile = profile;

        console.log(
            "KHELZONE PROFILE:",
            currentProfile
        );

        const role =
            String(profile.role || "")
                .trim()
                .toLowerCase();

        console.log(
            "KHELZONE ROLE:",
            role
        );

        if (role !== "admin") {
            console.warn(
                "KHELZONE: NOT ADMIN"
            );

            showAccessDenied(
                "This account does not have admin access."
            );

            return false;
        }

        console.log(
            "KHELZONE: ADMIN ACCESS GRANTED"
        );

        showAdminDashboard();

        return true;

    } catch (error) {
        console.error(
            "KHELZONE ADMIN CHECK ERROR:",
            error
        );

        showAccessError(
            error?.message ||
            "An error occurred while checking admin access."
        );

        return false;
    }
}

/* ============================================================
   NAVIGATION
============================================================ */

function initNavigation() {
    const buttons =
        document.querySelectorAll("[data-section]");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const section =
                button.dataset.section;

            if (!section) {
                return;
            }

            showSection(section);

            closeMobileMenu();
        });
    });
}

function showSection(sectionName) {
    const sections =
        document.querySelectorAll(".section");

    sections.forEach(section => {
        section.classList.remove("active");
        section.style.display = "none";
    });

    const target =
        document.getElementById(sectionName);

    if (target) {
        target.classList.add("active");
        target.style.display = "block";
    }

    const buttons =
        document.querySelectorAll("[data-section]");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

    document
        .querySelectorAll(
            `[data-section="${sectionName}"]`
        )
        .forEach(button => {
            button.classList.add("active");
        });

    const titles = {
        dashboardSection: "Dashboard",
        productsSection: "Products",
        sellersSection: "Sellers",
        customersSection: "Customers",
        ordersSection: "Orders"
    };

    const pageTitle =
        document.getElementById("pageTitle");

    if (pageTitle) {
        pageTitle.textContent =
            titles[sectionName] || "Dashboard";
    }
}

/* ============================================================
   MOBILE MENU
============================================================ */

function initMobileMenu() {
    const button =
        document.getElementById("mobileMenuBtn");

    const sidebar =
        document.getElementById("sidebar");

    if (!button || !sidebar) {
        return;
    }

    button.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
    });
}

function closeMobileMenu() {
    const sidebar =
        document.getElementById("sidebar");

    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }
}

/* ============================================================
   LOGOUT
============================================================ */

function initLogout() {
    const buttons =
        document.querySelectorAll(
            "#logoutBtn, #logoutButton, [data-logout]"
        );

    buttons.forEach(button => {
        button.addEventListener(
            "click",
            async () => {

                try {
                    button.disabled = true;

                    const { error } =
                        await withTimeout(
                            supabaseClient.auth.signOut(),
                            DATA_TIMEOUT,
                            "Logout timed out."
                        );

                    if (error) {
                        throw error;
                    }

                    window.location.href =
                        LOGIN_PAGE;

                } catch (error) {

                    console.error(
                        "KHELZONE LOGOUT ERROR:",
                        error
                    );

                    button.disabled = false;

                    alert(
                        "Logout failed. Please try again."
                    );
                }
            }
        );
    });
}

/* ============================================================
   DASHBOARD COUNTS
============================================================ */

async function loadDashboardCounts() {
    try {

        const results =
            await Promise.allSettled([

                withTimeout(
                    supabaseClient
                        .from("products")
                        .select("id", {
                            count: "exact",
                            head: true
                        }),
                    DATA_TIMEOUT
                ),

                withTimeout(
                    supabaseClient
                        .from("sellers")
                        .select("id", {
                            count: "exact",
                            head: true
                        }),
                    DATA_TIMEOUT
                ),

                withTimeout(
                    supabaseClient
                        .from("profiles")
                        .select("id", {
                            count: "exact",
                            head: true
                        })
                        .eq("role", "customer"),
                    DATA_TIMEOUT
                ),

                withTimeout(
                    supabaseClient
                        .from("orders")
                        .select("id", {
                            count: "exact",
                            head: true
                        }),
                    DATA_TIMEOUT
                )
            ]);

        const productResult =
            results[0].status === "fulfilled"
                ? results[0].value
                : null;

        const sellerResult =
            results[1].status === "fulfilled"
                ? results[1].value
                : null;

        const customerResult =
            results[2].status === "fulfilled"
                ? results[2].value
                : null;

        const orderResult =
            results[3].status === "fulfilled"
                ? results[3].value
                : null;

        const productCount =
            document.getElementById("productCount");

        const sellerCount =
            document.getElementById("sellerCount");

        const customerCount =
            document.getElementById("customerCount");

        const orderCount =
            document.getElementById("orderCount");

        if (productCount) {
            productCount.textContent =
                productResult?.count ?? 0;
        }

        if (sellerCount) {
            sellerCount.textContent =
                sellerResult?.count ?? 0;
        }

        if (customerCount) {
            customerCount.textContent =
                customerResult?.count ?? 0;
        }

        if (orderCount) {
            orderCount.textContent =
                orderResult?.count ?? 0;
        }

    } catch (error) {

        console.error(
            "Dashboard count error:",
            error
        );
    }
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
        7,
        "Loading products..."
    );

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .select("*")
                    .order("created_at", {
                        ascending: false
                    }),
                DATA_TIMEOUT,
                "Products request timed out."
            );

        const data =
            result?.data;

        const error =
            result?.error;

        if (error) {
            throw error;
        }

        allProducts =
            Array.isArray(data)
                ? data
                : [];

        renderProducts(allProducts);

    } catch (error) {

        console.error(
            "Products error:",
            error
        );

        showTableMessage(
            tbody,
            7,
            "Failed to load products."
        );
    }
}

function renderProducts(products) {
    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (!tbody) {
        return;
    }

    if (!Array.isArray(products) || !products.length) {
        showTableMessage(
            tbody,
            7,
            "No products found."
        );

        return;
    }

    tbody.innerHTML =
        products.map(product => {

            const status =
                String(
                    product.status || "active"
                ).toLowerCase();

            return `
                <tr class="border-b border-white/10 hover:bg-white/5">

                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">

                            ${
                                product.image_url
                                    ? `
                                        <img
                                            src="${escapeHTML(product.image_url)}"
                                            alt="${escapeHTML(product.name || "Product")}"
                                            class="w-12 h-12 rounded-lg object-cover"
                                        >
                                      `
                                    : `
                                        <div class="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                                            🏷️
                                        </div>
                                      `
                            }

                            <div>
                                <div class="font-semibold text-white">
                                    ${escapeHTML(
                                        product.name ||
                                        "Unnamed Product"
                                    )}
                                </div>

                                <div class="text-xs text-gray-500">
                                    ${escapeHTML(
                                        product.brand || ""
                                    )}
                                </div>
                            </div>

                        </div>
                    </td>

                    <td class="px-6 py-4 text-white font-semibold">
                        ${formatCurrency(product.price)}
                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            product.category || "—"
                        )}
                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            product.seller_name ||
                            product.seller ||
                            "—"
                        )}
                    </td>

                    <td class="px-6 py-4">

                        <span
                            class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}"
                        >
                            ${escapeHTML(status)}
                        </span>

                    </td>

                    <td class="px-6 py-4">

                        <button
                            type="button"
                            onclick="toggleBestSeller('${escapeHTML(product.id)}')"
                            class="best-seller-btn ${
                                product.is_best_seller
                                    ? "active"
                                    : ""
                            }"
                        >
                            ${
                                product.is_best_seller
                                    ? "★ Best Seller"
                                    : "☆ Best Seller"
                            }
                        </button>

                    </td>

                    <td class="px-6 py-4">

                        <div class="flex gap-2">

                            <button
                                type="button"
                                onclick="toggleProductStatus('${escapeHTML(product.id)}')"
                                class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                            >
                                ${
                                    status === "active"
                                        ? "Disable"
                                        : "Activate"
                                }
                            </button>

                            <button
                                type="button"
                                onclick="deleteProduct('${escapeHTML(product.id)}')"
                                class="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}

async function toggleBestSeller(productId) {
    try {

        const product =
            allProducts.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );

        if (!product) {
            return;
        }

        const newValue =
            !Boolean(product.is_best_seller);

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .update({
                        is_best_seller: newValue
                    })
                    .eq("id", productId),
                DATA_TIMEOUT,
                "Best seller update timed out."
            );

        if (error) {
            throw error;
        }

        await loadProducts();

    } catch (error) {

        console.error(
            "Best seller error:",
            error
        );

        alert(
            "Could not update Best Seller status."
        );
    }
}

async function toggleProductStatus(productId) {
    try {

        const product =
            allProducts.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );

        if (!product) {
            return;
        }

        const currentStatus =
            String(
                product.status || "active"
            ).toLowerCase();

        const newStatus =
            currentStatus === "active"
                ? "inactive"
                : "active";

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .update({
                        status: newStatus
                    })
                    .eq("id", productId),
                DATA_TIMEOUT,
                "Product status update timed out."
            );

        if (error) {
            throw error;
        }

        await loadProducts();

    } catch (error) {

        console.error(
            "Product status error:",
            error
        );

        alert(
            "Could not update product status."
        );
    }
}

async function deleteProduct(productId) {
    if (
        !confirm(
            "Are you sure you want to delete this product?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("products")
                    .delete()
                    .eq("id", productId),
                DATA_TIMEOUT,
                "Product deletion timed out."
            );

        if (error) {
            throw error;
        }

        alert(
            "Product deleted successfully."
        );

        await loadProducts();
        await loadDashboardCounts();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );

        alert(
            "Could not delete product."
        );
    }
}

/* ============================================================
   SELLERS
============================================================ */

async function loadSellers() {
    const tbody =
        document.getElementById(
            "sellersTableBody"
        );

    if (!tbody) {
        return;
    }

    showTableMessage(
        tbody,
        6,
        "Loading sellers..."
    );

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("sellers")
                    .select("*")
                    .order("created_at", {
                        ascending: false
                    }),
                DATA_TIMEOUT,
                "Sellers request timed out."
            );

        if (result?.error) {
            throw result.error;
        }

        allSellers =
            Array.isArray(result?.data)
                ? result.data
                : [];

        renderSellers(allSellers);

    } catch (error) {

        console.error(
            "Sellers error:",
            error
        );

        showTableMessage(
            tbody,
            6,
            "Failed to load sellers."
        );
    }
}

function renderSellers(sellers) {
    const tbody =
        document.getElementById(
            "sellersTableBody"
        );

    if (!tbody) {
        return;
    }

    if (!Array.isArray(sellers) || !sellers.length) {
        showTableMessage(
            tbody,
            6,
            "No sellers found."
        );

        return;
    }

    tbody.innerHTML =
        sellers.map(seller => {

            const status =
                seller.status || "pending";

            return `
                <tr class="border-b border-white/10 hover:bg-white/5">

                    <td class="px-6 py-4">

                        <div class="font-semibold text-white">
                            ${escapeHTML(
                                seller.business_name ||
                                seller.shop_name ||
                                "Unnamed Seller"
                            )}
                        </div>

                        <div class="text-xs text-gray-500">
                            ${escapeHTML(
                                seller.owner_name || ""
                            )}
                        </div>

                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            seller.email || "—"
                        )}
                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            seller.phone || "—"
                        )}
                    </td>

                    <td class="px-6 py-4">

                        <span
                            class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}"
                        >
                            ${escapeHTML(status)}
                        </span>

                    </td>

                    <td class="px-6 py-4 text-gray-400">
                        ${formatDate(
                            seller.created_at
                        )}
                    </td>

                    <td class="px-6 py-4">

                        <div class="flex gap-2">

                            <button
                                type="button"
                                onclick="viewSeller('${escapeHTML(seller.id)}')"
                                class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                            >
                                View
                            </button>

                            <button
                                type="button"
                                onclick="updateSellerStatus('${escapeHTML(seller.id)}')"
                                class="px-3 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm"
                            >
                                Status
                            </button>

                            <button
                                type="button"
                                onclick="deleteSeller('${escapeHTML(seller.id)}')"
                                class="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}

function viewSeller(sellerId) {
    const seller =
        allSellers.find(
            item =>
                String(item.id) ===
                String(sellerId)
        );

    if (!seller) {
        return;
    }

    alert(
        `SELLER DETAILS\n\n` +
        `Business: ${seller.business_name || seller.shop_name || "—"}\n` +
        `Owner: ${seller.owner_name || "—"}\n` +
        `Email: ${seller.email || "—"}\n` +
        `Phone: ${seller.phone || "—"}\n` +
        `City: ${seller.city || "—"}\n` +
        `Category: ${seller.category || "—"}\n` +
        `Monthly Sales: ${seller.monthly_volume || "—"}\n` +
        `Status: ${seller.status || "—"}`
    );
}

async function updateSellerStatus(sellerId) {
    try {

        const seller =
            allSellers.find(
                item =>
                    String(item.id) ===
                    String(sellerId)
            );

        if (!seller) {
            return;
        }

        const statuses = [
            "pending",
            "approved",
            "rejected",
            "active"
        ];

        const currentStatus =
            String(
                seller.status || "pending"
            ).toLowerCase();

        const currentIndex =
            statuses.indexOf(currentStatus);

        const nextIndex =
            currentIndex >= 0
                ? (currentIndex + 1) % statuses.length
                : 0;

        const newStatus =
            statuses[nextIndex];

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("sellers")
                    .update({
                        status: newStatus
                    })
                    .eq("id", sellerId),
                DATA_TIMEOUT,
                "Seller status update timed out."
            );

        if (error) {
            throw error;
        }

        await loadSellers();

    } catch (error) {

        console.error(
            "Seller status error:",
            error
        );

        alert(
            "Could not update seller status."
        );
    }
}

async function deleteSeller(sellerId) {
    if (
        !confirm(
            "Are you sure you want to delete this seller?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("sellers")
                    .delete()
                    .eq("id", sellerId),
                DATA_TIMEOUT,
                "Seller deletion timed out."
            );

        if (error) {
            throw error;
        }

        alert(
            "Seller deleted successfully."
        );

        await loadSellers();
        await loadDashboardCounts();

    } catch (error) {

        console.error(
            "Delete seller error:",
            error
        );

        alert(
            "Could not delete seller."
        );
    }
}

/* ============================================================
   CUSTOMERS
============================================================ */

async function loadCustomers() {
    const tbody =
        document.getElementById(
            "customersTableBody"
        );

    if (!tbody) {
        return;
    }

    showTableMessage(
        tbody,
        6,
        "Loading customers..."
    );

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("profiles")
                    .select("*")
                    .eq("role", "customer")
                    .order("created_at", {
                        ascending: false
                    }),
                DATA_TIMEOUT,
                "Customers request timed out."
            );

        if (result?.error) {
            throw result.error;
        }

        allCustomers =
            Array.isArray(result?.data)
                ? result.data
                : [];

        renderCustomers(allCustomers);

    } catch (error) {

        console.error(
            "Customers error:",
            error
        );

        showTableMessage(
            tbody,
            6,
            "Failed to load customers."
        );
    }
}

function renderCustomers(customers) {
    const tbody =
        document.getElementById(
            "customersTableBody"
        );

    if (!tbody) {
        return;
    }

    if (!Array.isArray(customers) || !customers.length) {
        showTableMessage(
            tbody,
            6,
            "No customers found."
        );

        return;
    }

    tbody.innerHTML =
        customers.map(customer => {

            return `
                <tr class="border-b border-white/10 hover:bg-white/5">

                    <td class="px-6 py-4 text-white font-semibold">
                        ${escapeHTML(
                            customer.full_name ||
                            customer.name ||
                            "—"
                        )}
                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            customer.email || "—"
                        )}
                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            customer.phone || "—"
                        )}
                    </td>

                    <td class="px-6 py-4 text-gray-300">
                        ${escapeHTML(
                            customer.city || "—"
                        )}
                    </td>

                    <td class="px-6 py-4 text-gray-400">
                        ${formatDate(
                            customer.created_at
                        )}
                    </td>

                    <td class="px-6 py-4">

                        <div class="flex gap-2">

                            <button
                                type="button"
                                onclick="viewCustomer('${escapeHTML(customer.id)}')"
                                class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                            >
                                View
                            </button>

                            <button
                                type="button"
                                onclick="deleteCustomer('${escapeHTML(customer.id)}')"
                                class="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm"
                            >
                                Delete
                            </button>

                        </div>

                    </td>

                </tr>
            `;

        }).join("");
}

function viewCustomer(customerId) {
    const customer =
        allCustomers.find(
            item =>
                String(item.id) ===
                String(customerId)
        );

    if (!customer) {
        return;
    }

    alert(
        `CUSTOMER DETAILS\n\n` +
        `Name: ${customer.full_name || customer.name || "—"}\n` +
        `Email: ${customer.email || "—"}\n` +
        `Phone: ${customer.phone || "—"}\n` +
        `City: ${customer.city || "—"}\n` +
        `Joined: ${formatDate(customer.created_at)}`
    );
}

async function deleteCustomer(customerId) {
    if (
        !confirm(
            "Are you sure you want to delete this customer profile?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("profiles")
                    .delete()
                    .eq("id", customerId),
                DATA_TIMEOUT,
                "Customer deletion timed out."
            );

        if (error) {
            throw error;
        }

        alert(
            "Customer deleted successfully."
        );

        await loadCustomers();
        await loadDashboardCounts();

    } catch (error) {

        console.error(
            "Delete customer error:",
            error
        );

        alert(
            "Could not delete customer."
        );
    }
}

/* ============================================================
   ORDERS
============================================================ */

async function loadOrders() {
    const tbody =
        document.getElementById(
            "ordersTableBody"
        );

    if (!tbody) {
        return;
    }

    showTableMessage(
        tbody,
        6,
        "Loading orders..."
    );

    try {

        const result =
            await withTimeout(
                supabaseClient
                    .from("orders")
                    .select("*")
                    .order("created_at", {
                        ascending: false
                    }),
                DATA_TIMEOUT,
                "Orders request timed out."
            );

        if (result?.error) {
            throw result.error;
        }

        allOrders =
            Array.isArray(result?.data)
                ? result.data
                : [];

        renderOrders(allOrders);

    } catch (error) {

        console.error(
            "Orders error:",
            error
        );

        showTableMessage(
            tbody,
            6,
            "Failed to load orders."
        );
    }
}

function renderOrders(orders) {
    const tbody =
        document.getElementById(
            "ordersTableBody"
        );

    if (!tbody) {
        return;
    }

    if (!Array.isArray(orders) || !orders.length) {
        showTableMessage(
            tbody,
            6,
            "No orders found."
        );

        return;
    }

    tbody.innerHTML =
        orders.map(order => {

            const status =
                order.status || "pending";

            return `
                <tr class="border-b border-white/10 hover:bg-white/5">

                    <td class="px-6 py-4">

                        <div class="font-semibold text-white">
                            #${escapeHTML(
                                getOrderNumber(order)
                            )}
                        </div>

                        <div class="text-xs text-gray-500">
                            ${escapeHTML(
                                order.id || ""
                            )}
                        </div>

                    </td>

                    <td class="px-6 py-4">

                        <div class="font-semibold text-white">
                            ${escapeHTML(
                                getCustomerName(order)
                            )}
                        </div>

                        <div class="text-xs text-gray-500">
                            ${escapeHTML(
                                order.customer_email ||
                                order.email ||
                                ""
                            )}
                        </div>

                    </td>

                    <td class="px-6 py-4 text-white font-semibold">
                        ${formatCurrency(
                            order.total_amount ||
                            order.total
                        )}
                    </td>

                    <td class="px-6 py-4">

                        <span
                            class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(status)}"
                        >
                            ${escapeHTML(status)}
                        </span>

                    </td>

                    <td class="px-6 py-4 text-gray-400">
                        ${formatDate(
                            order.created_at
                        )}
                    </td>

                    <td class="px-6 py-4">

                        <div class="flex gap-2">

                            <button
                                type="button"
                                onclick="viewOrder('${escapeHTML(order.id)}')"
                                class="px-3 py-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-semibold"
                            >
                                View Order
                            </button>

                            <button
                                type="button"
                                onclick="openStatusMenu('${escapeHTML(order.id)}', this)"
                                class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                            >
                                Status
                            </button>

                            <button
                                type="button"
                                onclick="deleteOrder('${escapeHTML(order.id)}')"
                                class="px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm"
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
   ORDER ITEMS
============================================================ */

function parseOrderItems(order) {
    let items =
        order?.items ||
        order?.order_items ||
        order?.cart_items ||
        null;

    if (typeof items === "string") {
        try {
            items = JSON.parse(items);
        } catch (error) {
            items = null;
        }
    }

    if (
        items &&
        !Array.isArray(items) &&
        typeof items === "object"
    ) {
        items = [items];
    }

    return Array.isArray(items)
        ? items
        : [];
}

/* ============================================================
   VIEW ORDER
============================================================ */

async function fetchOrderItemsFromTable(orderId) {
    const attempts = [
        { table: "order_items", column: "order_id" },
        { table: "order_items", column: "orderId" },
        { table: "orderitems", column: "order_id" }
    ];

    for (const attempt of attempts) {
        try {
            const result = await withTimeout(
                supabaseClient
                    .from(attempt.table)
                    .select("*")
                    .eq(attempt.column, orderId),
                DATA_TIMEOUT
            );

            if (
                !result?.error &&
                Array.isArray(result?.data) &&
                result.data.length
            ) {
                return result.data;
            }

        } catch (error) {
            /* try next attempt silently */
        }
    }

    return [];
}

async function viewOrder(orderId) {
    const order =
        allOrders.find(
            item =>
                String(item.id) ===
                String(orderId)
        );

    if (!order) {
        alert("Order not found.");
        return;
    }

    let items =
        parseOrderItems(order);

    if (!items.length) {
        items =
            await fetchOrderItemsFromTable(orderId);
    }

    let itemsText = "";

    if (items.length) {

        itemsText =
            items.map((item, index) => {

                const name =
                    item.name ||
                    item.product_name ||
                    item.title ||
                    "Product";

                const quantity =
                    item.quantity ||
                    item.qty ||
                    1;

                const price =
                    item.price ||
                    item.unit_price ||
                    0;

                const size =
                    item.size
                        ? ` | Size: ${item.size}`
                        : "";

                const color =
                    item.color
                        ? ` | Color: ${item.color}`
                        : "";

                const brand =
                    item.brand
                        ? ` | Brand: ${item.brand}`
                        : "";

                return (
                    `${index + 1}. ${name}` +
                    `${brand}` +
                    ` | Qty: ${quantity}` +
                    ` | Price: ${formatCurrency(price)}` +
                    `${size}` +
                    `${color}`
                );

            }).join("\n");

    } else {

        itemsText =
            "Order items are not saved in this order record.";
    }

    const customerName =
        getCustomerName(order);

    const phone =
        order.shipping_phone ||
        order.phone ||
        "—";

    const email =
        order.customer_email ||
        order.email ||
        "—";

    const city =
        order.shipping_city ||
        order.city ||
        "—";

    const postalCode =
        order.shipping_postal_code ||
        order.postal_code ||
        "—";

    const address =
        order.shipping_address ||
        order.address ||
        "—";

    const paymentMethod =
        order.payment_method ||
        "—";

    const paymentReference =
        order.payment_reference ||
        "—";

    const senderInfo =
        order.payment_sender_info ||
        "—";

    const notes =
        order.order_notes ||
        order.notes ||
        "—";

    const total =
        order.total_amount ||
        order.total ||
        0;

    const details =
        `KHELZONE ORDER DETAILS\n` +
        `================================\n\n` +

        `ORDER INFORMATION\n` +
        `--------------------------------\n` +
        `Order ID: ${order.id || "—"}\n` +
        `Order Number: ${getOrderNumber(order)}\n` +
        `Date: ${formatDate(order.created_at)}\n` +
        `Status: ${order.status || "pending"}\n\n` +

        `CUSTOMER INFORMATION\n` +
        `--------------------------------\n` +
        `Name: ${customerName}\n` +
        `Phone: ${phone}\n` +
        `Email: ${email}\n` +
        `City: ${city}\n` +
        `Postal Code: ${postalCode}\n` +
        `Address: ${address}\n\n` +

        `ORDER ITEMS\n` +
        `--------------------------------\n` +
        `${itemsText}\n\n` +

        `PAYMENT INFORMATION\n` +
        `--------------------------------\n` +
        `Method: ${paymentMethod}\n` +
        `Payment Reference: ${paymentReference}\n` +
        `Sender Information: ${senderInfo}\n\n` +

        `ORDER TOTAL\n` +
        `--------------------------------\n` +
        `Total: ${formatCurrency(total)}\n\n` +

        `ORDER NOTES\n` +
        `--------------------------------\n` +
        `${notes}`;

    alert(details);
}

/* ============================================================
   ORDER STATUS — DROPDOWN MENU (FIXED / WORKING VERSION)
============================================================ */

const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "cancelled"
];

function openStatusMenu(orderId, anchorButton) {
    // close any already-open menu
    document.querySelectorAll(".status-menu").forEach(el => el.remove());

    const order = allOrders.find(
        item => String(item.id) === String(orderId)
    );

    if (!order) {
        alert("Order not found.");
        return;
    }

    const currentStatus = String(order.status || "pending").toLowerCase();

    const menu = document.createElement("div");
    menu.className = "status-menu";
    menu.style.cssText = `
        position: absolute;
        z-index: 99999;
        background: #1b1b1b;
        border: 1px solid #333;
        border-radius: 10px;
        padding: 6px;
        box-shadow: 0 15px 40px rgba(0,0,0,.5);
        min-width: 160px;
    `;

    ORDER_STATUSES.forEach(status => {
        const item = document.createElement("button");
        item.type = "button";
        item.textContent =
            status.charAt(0).toUpperCase() + status.slice(1);

        item.style.cssText = `
            display: block;
            width: 100%;
            text-align: left;
            padding: 8px 12px;
            border-radius: 6px;
            border: none;
            background: ${status === currentStatus ? "rgba(255,90,0,.15)" : "transparent"};
            color: ${status === currentStatus ? "#ff5a00" : "#ddd"};
            cursor: pointer;
            font-weight: 700;
            font-size: 13px;
        `;

        item.addEventListener("mouseenter", () => {
            item.style.background = "rgba(255,90,0,.1)";
        });

        item.addEventListener("mouseleave", () => {
            item.style.background =
                status === currentStatus ? "rgba(255,90,0,.15)" : "transparent";
        });

        item.addEventListener("click", async () => {
            menu.remove();
            await setOrderStatus(orderId, status);
        });

        menu.appendChild(item);
    });

    document.body.appendChild(menu);

    const rect = anchorButton.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 6}px`;
    menu.style.left = `${rect.left + window.scrollX}px`;

    setTimeout(() => {
        document.addEventListener("click", function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== anchorButton) {
                menu.remove();
                document.removeEventListener("click", closeMenu);
            }
        });
    }, 0);
}

async function setOrderStatus(orderId, newStatus) {
    try {

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("orders")
                    .update({
                        status: newStatus
                    })
                    .eq("id", orderId),
                DATA_TIMEOUT,
                "Order status update timed out."
            );

        if (error) {
            throw error;
        }

        showToast(`Order status set to "${newStatus}".`, "success");

        await loadOrders();
        await loadDashboardCounts();

    } catch (error) {

        console.error(
            "Order status error:",
            error
        );

        showToast("Could not update order status.", "error");
    }
}

/* ============================================================
   DELETE ORDER
============================================================ */

async function deleteOrder(orderId) {
    if (
        !confirm(
            "Are you sure you want to delete this order?"
        )
    ) {
        return;
    }

    try {

        const { error } =
            await withTimeout(
                supabaseClient
                    .from("orders")
                    .delete()
                    .eq("id", orderId),
                DATA_TIMEOUT,
                "Order deletion timed out."
            );

        if (error) {
            throw error;
        }

        alert(
            "Order deleted successfully."
        );

        await loadOrders();
        await loadDashboardCounts();

    } catch (error) {

        console.error(
            "Delete order error:",
            error
        );

        alert(
            "Could not delete order."
        );
    }
}

/* ============================================================
   SEARCH
============================================================ */

function initSearches() {

    const productSearch =
        document.getElementById(
            "productSearch"
        );

    if (productSearch) {

        productSearch.addEventListener(
            "input",
            () => {

                const query =
                    productSearch.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    allProducts.filter(product => {

                        return (
                            String(product.name || "")
                                .toLowerCase()
                                .includes(query) ||

                            String(product.category || "")
                                .toLowerCase()
                                .includes(query) ||

                            String(product.seller_name || "")
                                .toLowerCase()
                                .includes(query) ||

                            String(product.seller || "")
                                .toLowerCase()
                                .includes(query) ||

                            String(product.brand || "")
                                .toLowerCase()
                                .includes(query)
                        );
                    });

                renderProducts(filtered);
            }
        );
    }

    const sellerSearch =
        document.getElementById(
            "sellerSearch"
        );

    if (sellerSearch) {

        sellerSearch.addEventListener(
            "input",
            () => {

                const query =
                    sellerSearch.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    allSellers.filter(seller => {

                        return (
                            String(
                                seller.business_name ||
                                seller.shop_name ||
                                ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                seller.owner_name || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                seller.email || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                seller.phone || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                seller.status || ""
                            )
                                .toLowerCase()
                                .includes(query)
                        );
                    });

                renderSellers(filtered);
            }
        );
    }

    const customerSearch =
        document.getElementById(
            "customerSearch"
        );

    if (customerSearch) {

        customerSearch.addEventListener(
            "input",
            () => {

                const query =
                    customerSearch.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    allCustomers.filter(customer => {

                        return (
                            String(
                                customer.full_name || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                customer.name || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                customer.email || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                customer.phone || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                customer.city || ""
                            )
                                .toLowerCase()
                                .includes(query)
                        );
                    });

                renderCustomers(filtered);
            }
        );
    }

    const orderSearch =
        document.getElementById(
            "orderSearch"
        );

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            () => {

                const query =
                    orderSearch.value
                        .trim()
                        .toLowerCase();

                const filtered =
                    allOrders.filter(order => {

                        return (
                            String(
                                order.order_number || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                order.order_id || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                order.id || ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                getCustomerName(order)
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                order.customer_email ||
                                order.email ||
                                ""
                            )
                                .toLowerCase()
                                .includes(query) ||

                            String(
                                order.status || ""
                            )
                                .toLowerCase()
                                .includes(query)
                        );
                    });

                renderOrders(filtered);
            }
        );
    }
}

/* ============================================================
   GLOBAL FUNCTIONS
============================================================ */

window.toggleBestSeller =
    toggleBestSeller;

window.toggleProductStatus =
    toggleProductStatus;

window.deleteProduct =
    deleteProduct;

window.viewSeller =
    viewSeller;

window.updateSellerStatus =
    updateSellerStatus;

window.deleteSeller =
    deleteSeller;

window.viewCustomer =
    viewCustomer;

window.deleteCustomer =
    deleteCustomer;

window.viewOrder =
    viewOrder;

window.openStatusMenu =
    openStatusMenu;

window.deleteOrder =
    deleteOrder;

/* ============================================================
   EMERGENCY LOADING SAFETY
============================================================ */

let emergencyLoadingTimer = null;

function startEmergencyLoadingSafety() {

    clearTimeout(emergencyLoadingTimer);

    emergencyLoadingTimer =
        setTimeout(() => {

            const checkingScreen =
                document.getElementById(
                    "checkingScreen"
                );

            if (
                checkingScreen &&
                !checkingScreen.classList.contains("hidden")
            ) {

                console.error(
                    "KHELZONE: Emergency loading timeout triggered."
                );

                showAccessError(
                    "Admin access check took too long. Please refresh and try again."
                );
            }

        }, 18000);
}

/* ============================================================
   START DASHBOARD
============================================================ */

async function startAdminDashboard() {

    startEmergencyLoadingSafety();

    try {

        console.log(
            "================================"
        );

        console.log(
            "KHELZONE ADMIN DASHBOARD START"
        );

        console.log(
            "================================"
        );

        const isAdmin =
            await checkAdminAccess();

        clearTimeout(
            emergencyLoadingTimer
        );

        if (!isAdmin) {
            return;
        }

        initNavigation();

        initMobileMenu();

        initLogout();

        initSearches();

        await Promise.allSettled([

            loadDashboardCounts(),

            loadProducts(),

            loadSellers(),

            loadCustomers(),

            loadOrders()

        ]);

        showAdminDashboard();

        showSection(
            "dashboardSection"
        );

        console.log(
            "KHELZONE ADMIN DASHBOARD READY"
        );

    } catch (error) {

        clearTimeout(
            emergencyLoadingTimer
        );

        console.error(
            "KHELZONE STARTUP ERROR:",
            error
        );

        showAccessError(
            error?.message ||
            "Could not start admin dashboard."
        );
    }
}

/* ============================================================
   DOM READY
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startAdminDashboard
    );

} else {

    startAdminDashboard();
}

/* ============================================================
   GLOBAL ERROR SAFETY
============================================================ */

window.addEventListener(
    "error",
    event => {

        console.error(
            "KHELZONE GLOBAL ERROR:",
            event.error || event.message
        );

        const screen =
            document.getElementById(
                "checkingScreen"
            );

        if (
            screen &&
            !screen.classList.contains("hidden")
        ) {

            showAccessError(
                "A dashboard error occurred. Please refresh the page."
            );
        }
    }
);

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "KHELZONE UNHANDLED PROMISE:",
            event.reason
        );

        const screen =
            document.getElementById(
                "checkingScreen"
            );

        if (
            screen &&
            !screen.classList.contains("hidden")
        ) {

            showAccessError(
                "Admin access check failed. Please refresh the page."
            );
        }
    }
);
