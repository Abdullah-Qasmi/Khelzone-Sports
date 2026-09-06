/* ============================================================
   KHELZONE SELLER DASHBOARD
   PART 1 / 4
   CONFIG + SUPABASE + AUTH + PROFILE + NAVIGATION
============================================================ */

"use strict";

/* ============================================================
   CONFIG
============================================================ */

const LOGIN_PAGE = "index.html";

const DATA_TIMEOUT = 15000;

const SUPABASE_CLIENT_WAIT = 10000;

const ORDER_STATUSES = [
    "pending",
    "processing",
    "shipped",
    "delivered"
];

/* ============================================================
   SUPABASE
============================================================ */

let supabaseClient = null;

/* ============================================================
   GLOBAL STATE
============================================================ */

let currentUser = null;

let currentProfile = null;

let allProducts = [];

let allOrders = [];

let allOrderItems = [];

let currentProductId = null;

let dashboardStarted = false;

/* ============================================================
   BASIC HELPERS
============================================================ */

function escapeHTML(value) {

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

/* ============================================================
   ELEMENT HELPER
============================================================ */

function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value ?? "";
}

/* ============================================================
   CURRENCY
============================================================ */

function formatCurrency(value) {

    const number =
        Number(value || 0);

    return (
        "Rs. " +
        number.toLocaleString(
            "en-PK",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );
}

/* ============================================================
   DATE
============================================================ */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-PK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}

/* ============================================================
   STATUS
============================================================ */

function normalizeStatus(status) {

    const value =
        String(
            status || "pending"
        )
            .trim()
            .toLowerCase();

    return ORDER_STATUSES.includes(
        value
    )
        ? value
        : "pending";
}

function getStatusClass(status) {

    const value =
        normalizeStatus(status);

    const classes = {

        pending:
            "status-pending",

        processing:
            "status-processing",

        shipped:
            "status-shipped",

        delivered:
            "status-delivered"
    };

    return (
        classes[value] ||
        "status-pending"
    );
}

function formatStatus(status) {

    const value =
        normalizeStatus(status);

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );
}

/* ============================================================
   TIMEOUT
============================================================ */

function withTimeout(
    promise,
    timeout = DATA_TIMEOUT,
    message = "Request timed out."
) {

    let timer;

    const timeoutPromise =
        new Promise(
            (_, reject) => {

                timer =
                    setTimeout(
                        () => {

                            reject(
                                new Error(
                                    message
                                )
                            );

                        },
                        timeout
                    );
            }
        );

    return Promise.race(
        [
            Promise.resolve(
                promise
            ).finally(
                () => {
                    clearTimeout(
                        timer
                    );
                }
            ),

            timeoutPromise
        ]
    );
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
                colspan="${Number(colspan) || 1}"
                class="table-message"
            >
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}

/* ============================================================
   TOAST
============================================================ */

function showToast(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "sellerToast"
        );

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "sellerToast";

        Object.assign(
            toast.style,
            {
                position:
                    "fixed",

                right:
                    "20px",

                bottom:
                    "20px",

                zIndex:
                    "99999",

                maxWidth:
                    "420px",

                padding:
                    "14px 18px",

                borderRadius:
                    "10px",

                fontWeight:
                    "800",

                fontSize:
                    "13px",

                lineHeight:
                    "1.5",

                boxShadow:
                    "0 15px 40px rgba(0,0,0,.4)"
            }
        );

        document.body.appendChild(
            toast
        );
    }

    toast.textContent =
        String(
            message || ""
        );

    if (
        type === "error"
    ) {

        toast.style.background =
            "#7f1d1d";

        toast.style.color =
            "#fecaca";

        toast.style.border =
            "1px solid #ef4444";

    } else {

        toast.style.background =
            "#14532d";

        toast.style.color =
            "#bbf7d0";

        toast.style.border =
            "1px solid #22c55e";
    }

    toast.style.display =
        "block";

    clearTimeout(
        toast._timer
    );

    toast._timer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

            },
            3500
        );
}

/* ============================================================
   LOADING SCREEN
============================================================ */

function showLoadingScreen() {

    const screen =
        document.getElementById(
            "loadingScreen"
        );

    if (!screen) {
        return;
    }

    screen.style.display =
        "flex";
}

function hideLoadingScreen() {

    const screen =
        document.getElementById(
            "loadingScreen"
        );

    if (!screen) {
        return;
    }

    screen.style.display =
        "none";
}

/* ============================================================
   DASHBOARD ERROR
============================================================ */

function showDashboardError(
    message
) {

    const screen =
        document.getElementById(
            "loadingScreen"
        );

    if (!screen) {

        alert(
            message ||
            "Something went wrong."
        );

        return;
    }

    screen.innerHTML = `

        <div
            style="
                width:min(92%,520px);
                text-align:center;
                padding:32px 26px;
                background:#141414;
                border:1px solid rgba(255,90,0,.3);
                border-radius:16px;
                box-shadow:0 20px 70px rgba(0,0,0,.5);
            "
        >

            <div
                style="
                    color:#ff5a00;
                    font-size:32px;
                    font-weight:900;
                    letter-spacing:1px;
                    margin-bottom:16px;
                "
            >
                KHELZONE
            </div>

            <div
                style="
                    color:#fff;
                    font-size:19px;
                    font-weight:900;
                    margin-bottom:10px;
                "
            >
                Dashboard could not load
            </div>

            <div
                style="
                    color:#999;
                    font-size:13px;
                    line-height:1.6;
                    margin-bottom:22px;
                    word-break:break-word;
                "
            >
                ${escapeHTML(
                    message ||
                    "Something went wrong."
                )}
            </div>

            <button
                type="button"
                onclick="window.location.reload()"
                style="
                    border:0;
                    background:#ff5a00;
                    color:#fff;
                    padding:12px 22px;
                    border-radius:9px;
                    cursor:pointer;
                    font-weight:900;
                "
            >
                Try Again
            </button>

        </div>
    `;

    screen.style.display =
        "flex";
}

/* ============================================================
   WAIT FOR SUPABASE
============================================================ */

async function waitForSupabaseClient() {

    const started =
        Date.now();

    while (
        !window.supabaseClient &&
        (
            Date.now() -
            started
        ) <
        SUPABASE_CLIENT_WAIT
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );
    }

    if (
        !window.supabaseClient
    ) {

        throw new Error(
            "Supabase client is not initialized. Make sure your Supabase configuration is loaded before seller-dashboard.js."
        );
    }

    supabaseClient =
        window.supabaseClient;

    return supabaseClient;
}

/* ============================================================
   GET CURRENT USER
============================================================ */

async function getCurrentUser() {

    if (!supabaseClient) {
        return null;
    }

    const result =
        await withTimeout(
            supabaseClient.auth.getUser(),
            DATA_TIMEOUT,
            "Authentication request timed out."
        );

    if (result.error) {
        throw result.error;
    }

    return (
        result.data &&
        result.data.user
    )
        ? result.data.user
        : null;
}

/* ============================================================
   LOAD PROFILE
============================================================ */

async function loadCurrentProfile() {

    if (!currentUser) {
        return null;
    }

    const result =
        await withTimeout(

            supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle(),

            DATA_TIMEOUT,

            "Profile request timed out."
        );

    if (result.error) {
        throw result.error;
    }

    currentProfile =
        result.data ||
        null;

    return currentProfile;
}

/* ============================================================
   SELLER ACCESS CHECK
============================================================ */

async function checkSellerAccess() {

    currentUser =
        await getCurrentUser();

    /* --------------------------------------------------------
       NO USER
    -------------------------------------------------------- */

    if (!currentUser) {

        showToast(
            "Please login first.",
            "error"
        );

        setTimeout(
            () => {

                window.location.href =
                    LOGIN_PAGE;

            },
            800
        );

        return false;
    }

    /* --------------------------------------------------------
       PROFILE
    -------------------------------------------------------- */

    currentProfile =
        await loadCurrentProfile();

    if (!currentProfile) {

        showDashboardError(
            "Your profile was not found in the profiles table."
        );

        return false;
    }

    /* --------------------------------------------------------
       ROLE
    -------------------------------------------------------- */

    const role =
        String(
            currentProfile.role ||
            ""
        )
            .trim()
            .toLowerCase();

    console.log(
        "KHELZONE Seller Access:",
        {
            userId:
                currentUser.id,

            email:
                currentUser.email,

            role:
                role,

            profile:
                currentProfile
        }
    );

    /* --------------------------------------------------------
       ADMIN
    -------------------------------------------------------- */

    if (
        role === "admin" ||
        role === "administrator"
    ) {

        return true;
    }

    /* --------------------------------------------------------
       SELLER
    -------------------------------------------------------- */

    if (
        role !== "seller" &&
        role !== "vendor"
    ) {

        showDashboardError(
            "Seller access denied. Your account role is not Seller or Vendor."
        );

        return false;
    }

    /* --------------------------------------------------------
       APPROVAL FIELDS
    -------------------------------------------------------- */

    const approvalFields = [

        "seller_status",

        "seller_approval",

        "approval_status",

        "seller_approved",

        "approved"
    ];

    let approvalField =
        null;

    let approvalValue;

    for (
        const field
        of approvalFields
    ) {

        if (
            Object.prototype.hasOwnProperty.call(
                currentProfile,
                field
            )
        ) {

            approvalField =
                field;

            approvalValue =
                currentProfile[
                    field
                ];

            break;
        }
    }

    /* --------------------------------------------------------
       NO APPROVAL FIELD
    -------------------------------------------------------- */

    if (
        approvalField === null
    ) {

        return true;
    }

    /* --------------------------------------------------------
       BOOLEAN APPROVAL
    -------------------------------------------------------- */

    if (
        typeof approvalValue ===
        "boolean"
    ) {

        if (
            approvalValue ===
            false
        ) {

            showDashboardError(
                "Your seller account has not been approved yet."
            );

            return false;
        }

        return true;
    }

    /* --------------------------------------------------------
       STRING APPROVAL
    -------------------------------------------------------- */

    const approval =
        String(
            approvalValue ||
            ""
        )
            .trim()
            .toLowerCase();

    if (!approval) {
        return true;
    }

    /* APPROVED */

    if (
        [
            "approved",
            "active",
            "accepted",
            "true"
        ].includes(
            approval
        )
    ) {

        return true;
    }

    /* BLOCKED */

    if (
        [
            "pending",
            "rejected",
            "blocked",
            "suspended",
            "inactive",
            "false"
        ].includes(
            approval
        )
    ) {

        showDashboardError(
            "Your seller account status is: " +
            approval +
            "."
        );

        return false;
    }

    return true;
}

/* ============================================================
   SELLER PROFILE UI
============================================================ */

function renderSellerProfile() {

    if (!currentProfile) {
        return;
    }

    const name =
        currentProfile.full_name ||
        currentProfile.name ||
        currentProfile.username ||
        currentUser?.email ||
        "Seller";

    const email =
        currentProfile.email ||
        currentUser?.email ||
        "—";

    const phone =
        currentProfile.phone ||
        currentProfile.contact_no ||
        currentProfile.contactNo ||
        currentProfile.mobile ||
        "—";

    const avatar =
        document.getElementById(
            "profileAvatar"
        );

    if (avatar) {

        avatar.textContent =
            String(name)
                .charAt(0)
                .toUpperCase();
    }

    updateElement(
        "sellerNameTop",
        name
    );

    updateElement(
        "profileName",
        name
    );

    updateElement(
        "profileEmail",
        email
    );

    updateElement(
        "profilePhone",
        phone
    );

    updateElement(
        "profileRole",
        currentProfile.role ||
        "Seller"
    );
}

/* ============================================================
   NAVIGATION CSS
============================================================ */

function ensureSellerNavigationCSS() {

    if (
        document.getElementById(
            "kzSellerNavigationCSS"
        )
    ) {
        return;
    }

    const style =
        document.createElement(
            "style"
        );

    style.id =
        "kzSellerNavigationCSS";

    style.textContent = `

        /* DESKTOP SIDEBAR */

        #sidebar,
        .sidebar {

            z-index:
                9000 !important;
        }

        #sidebar [data-section],
        .sidebar [data-section],
        #sidebar .nav-btn,
        .sidebar .nav-btn {

            pointer-events:
                auto !important;

            cursor:
                pointer !important;

            position:
                relative !important;

            z-index:
                9001 !important;
        }

        /* ACTIVE */

        #sidebar [data-section].active,
        .sidebar [data-section].active,
        #sidebar .nav-btn.active,
        .sidebar .nav-btn.active {

            background:
                #ff5a00 !important;

            color:
                #ffffff !important;
        }

        /* HOVER */

        #sidebar [data-section]:hover,
        .sidebar [data-section]:hover,
        #sidebar .nav-btn:hover,
        .sidebar .nav-btn:hover {

            background:
                rgba(255,90,0,.14) !important;

            color:
                #ffffff !important;
        }

        /* SECTION */

        .section {

            display:
                none;
        }

        .section.active {

            display:
                block !important;
        }

        /* OVERLAY */

        #sellerNavOverlay {

            display:
                none;
        }

        /* MOBILE */

        @media (max-width:900px) {

            #sidebar,
            .sidebar {

                transform:
                    translateX(-105%) !important;

                transition:
                    transform .25s ease !important;

                width:
                    min(290px,86vw) !important;

                box-shadow:
                    20px 0 50px rgba(0,0,0,.55);

                z-index:
                    9000 !important;
            }

            #sidebar.mobile-open,
            .sidebar.mobile-open {

                transform:
                    translateX(0) !important;
            }

            #mobileMenuBtn {

                display:
                    inline-flex !important;

                align-items:
                    center;

                justify-content:
                    center;

                cursor:
                    pointer !important;

                position:
                    relative;

                z-index:
                    9002 !important;
            }

            #sellerNavOverlay.active {

                display:
                    block !important;

                position:
                    fixed;

                inset:
                    0;

                z-index:
                    8999;

                background:
                    rgba(0,0,0,.65);
            }
        }
    `;

    document.head.appendChild(
        style
    );
}

/* ============================================================
   NAVIGATION OVERLAY
============================================================ */

function ensureSellerNavOverlay() {

    let overlay =
        document.getElementById(
            "sellerNavOverlay"
        );

    if (!overlay) {

        overlay =
            document.createElement(
                "div"
            );

        overlay.id =
            "sellerNavOverlay";

        document.body.appendChild(
            overlay
        );
    }

    return overlay;
}

/* ============================================================
   SHOW SECTION
============================================================ */

function showSection(
    sectionName
) {

    const target =
        document.getElementById(
            sectionName
        );

    if (!target) {

        console.error(
            "KHELZONE: Section not found:",
            sectionName
        );

        return false;
    }

    /* HIDE ALL */

    document
        .querySelectorAll(
            ".section"
        )
        .forEach(
            section => {

                section.classList.remove(
                    "active"
                );

                section.style.display =
                    "none";
            }
        );

    /* SHOW TARGET */

    target.classList.add(
        "active"
    );

    target.style.display =
        "block";

    /* ACTIVE NAV */

    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(
            button => {

                const isActive =
                    button.getAttribute(
                        "data-section"
                    ) ===
                    sectionName;

                button.classList.toggle(
                    "active",
                    isActive
                );

                button.setAttribute(
                    "aria-current",
                    isActive
                        ? "page"
                        : "false"
                );
            }
        );

    /* TITLES */

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

    updateElement(
        "pageTitle",
        titles[
            sectionName
        ] ||
        "Seller Dashboard"
    );

    updateElement(
        "pageSubtitle",
        subtitles[
            sectionName
        ] ||
        "Manage your KHELZONE store"
    );

    return true;
}

/* ============================================================
   INIT NAVIGATION
============================================================ */

function initNavigation() {

    ensureSellerNavigationCSS();

    const overlay =
        ensureSellerNavOverlay();

    const buttons =
        document.querySelectorAll(
            "[data-section]"
        );

    console.log(
        "KHELZONE navigation buttons:",
        buttons.length
    );

    buttons.forEach(
        button => {

            if (
                button.dataset
                    .navigationReady ===
                "true"
            ) {
                return;
            }

            button.dataset
                .navigationReady =
                "true";

            button.type =
                "button";

            button.style.pointerEvents =
                "auto";

            button.style.cursor =
                "pointer";

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    const section =
                        button.getAttribute(
                            "data-section"
                        );

                    if (!section) {
                        return;
                    }

                    console.log(
                        "Opening seller section:",
                        section
                    );

                    showSection(
                        section
                    );

                    closeMobileMenu();
                }
            );
        }
    );

    if (
        overlay &&
        overlay.dataset
            .navigationReady !==
        "true"
    ) {

        overlay.dataset
            .navigationReady =
            "true";

        overlay.addEventListener(
            "click",
            closeMobileMenu
        );
    }
}

/* ============================================================
   MOBILE MENU
============================================================ */

function initMobileMenu() {

    ensureSellerNavigationCSS();

    const button =
        document.getElementById(
            "mobileMenuBtn"
        );

    const sidebar =
        document.getElementById(
            "sidebar"
        ) ||
        document.querySelector(
            ".sidebar"
        );

    const overlay =
        ensureSellerNavOverlay();

    if (
        !button ||
        !sidebar
    ) {

        console.warn(
            "KHELZONE mobile menu elements not found."
        );

        return;
    }

    if (
        button.dataset.menuReady ===
        "true"
    ) {
        return;
    }

    button.dataset.menuReady =
        "true";

    button.type =
        "button";

    button.setAttribute(
        "aria-expanded",
        "false"
    );

    button.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            const shouldOpen =
                !sidebar.classList.contains(
                    "mobile-open"
                );

            sidebar.classList.toggle(
                "mobile-open",
                shouldOpen
            );

            if (overlay) {

                overlay.classList.toggle(
                    "active",
                    shouldOpen
                );
            }

            button.setAttribute(
                "aria-expanded",
                String(
                    shouldOpen
                )
            );
        }
    );
}

/* ============================================================
   CLOSE MOBILE MENU
============================================================ */

function closeMobileMenu() {

    const sidebar =
        document.getElementById(
            "sidebar"
        ) ||
        document.querySelector(
            ".sidebar"
        );

    const overlay =
        document.getElementById(
            "sellerNavOverlay"
        );

    const button =
        document.getElementById(
            "mobileMenuBtn"
        );

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }

    if (overlay) {

        overlay.classList.remove(
            "active"
        );
    }

    if (button) {

        button.setAttribute(
            "aria-expanded",
            "false"
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

    if (
        button.dataset.logoutReady ===
        "true"
    ) {
        return;
    }

    button.dataset.logoutReady =
        "true";

    button.type =
        "button";

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

                button.disabled =
                    true;

                const result =
                    await withTimeout(

                        supabaseClient
                            .auth
                            .signOut(),

                        DATA_TIMEOUT,

                        "Logout timed out."
                    );

                if (
                    result.error
                ) {
                    throw result.error;
                }

                window.location.href =
                    LOGIN_PAGE;

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

                button.disabled =
                    false;

                showToast(
                    error?.message ||
                    "Logout failed.",
                    "error"
                );
            }
        }
    );
}

/* ============================================================
   EXPORT PART 1
============================================================ */

window.startSellerDashboard =
    window.startSellerDashboard ||
    null;

window.showSection =
    showSection;

window.closeMobileMenu =
    closeMobileMenu;

window.formatCurrency =
    formatCurrency;

window.formatDate =
    formatDate;

window.escapeHTML =
    escapeHTML;

window.showToast =
    showToast;

window.showDashboardError =
    showDashboardError;
/* ============================================================
   KHELZONE SELLER DASHBOARD
   PART 2 / 4
   PRODUCTS + SEARCH + ADD + EDIT + DELETE
============================================================ */


/* ============================================================
   LOAD PRODUCTS
============================================================ */

async function loadProducts() {

    const tbody =
        document.getElementById(
            "productsTableBody"
        );

    if (tbody) {

        showTableMessage(
            tbody,
            8,
            "Loading products..."
        );
    }

    if (!currentUser) {

        if (tbody) {

            showTableMessage(
                tbody,
                8,
                "Seller account not found."
            );
        }

        return;
    }

    try {

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
            "Load products error:",
            error
        );

        allProducts = [];

        if (tbody) {

            showTableMessage(
                tbody,
                8,
                "Failed to load products: " +
                (
                    error?.message ||
                    "Unknown error"
                )
            );
        }

        showToast(
            error?.message ||
            "Failed to load products.",
            "error"
        );
    }
}


/* ============================================================
   RENDER PRODUCTS
============================================================ */

function renderProducts(
    products
) {

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
        products
            .map(
                product => {

                    const active =
                        product.is_active !== false;

                    const image =
                        product.image_url ||
                        product.image ||
                        "";

                    return `
                        <tr>

                            <!-- PRODUCT -->

                            <td>

                                <div
                                    style="
                                        display:flex;
                                        align-items:center;
                                        gap:10px;
                                        min-width:190px;
                                    "
                                >

                                    ${
                                        image
                                            ? `
                                                <img
                                                    class="product-image"
                                                    src="${escapeHTML(
                                                        image
                                                    )}"
                                                    alt="${escapeHTML(
                                                        product.name ||
                                                        "Product"
                                                    )}"
                                                    onerror="
                                                        this.style.display='none'
                                                    "
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
                                                        flex-shrink:0;
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
                                                line-height:1.35;
                                            "
                                        >
                                            ${escapeHTML(
                                                product.name ||
                                                "Unnamed Product"
                                            )}
                                        </div>

                                        ${
                                            product.brand
                                                ? `
                                                    <div
                                                        style="
                                                            color:#777;
                                                            font-size:11px;
                                                            margin-top:3px;
                                                        "
                                                    >
                                                        ${escapeHTML(
                                                            product.brand
                                                        )}
                                                    </div>
                                                `
                                                : ""
                                        }

                                    </div>

                                </div>

                            </td>


                            <!-- CATEGORY -->

                            <td>
                                ${escapeHTML(
                                    product.category ||
                                    "—"
                                )}
                            </td>


                            <!-- SPORT -->

                            <td>
                                ${escapeHTML(
                                    product.sport ||
                                    "—"
                                )}
                            </td>


                            <!-- PRICE -->

                            <td>

                                <strong
                                    style="
                                        color:#ff5a00;
                                    "
                                >
                                    ${formatCurrency(
                                        product.price
                                    )}
                                </strong>

                            </td>


                            <!-- STOCK -->

                            <td>

                                ${Number(
                                    product.stock || 0
                                )}

                            </td>


                            <!-- STATUS -->

                            <td>

                                <span
                                    class="
                                        status
                                        ${
                                            active
                                                ? "status-delivered"
                                                : "status-pending"
                                        }
                                    "
                                >
                                    ${
                                        active
                                            ? "Active"
                                            : "Inactive"
                                    }
                                </span>

                            </td>


                            <!-- BEST SELLER -->

                            <td>

                                ${
                                    product.is_best_seller
                                        ? `
                                            <span
                                                class="
                                                    status
                                                    status-shipped
                                                "
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


                            <!-- ACTIONS -->

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
                                        onclick="
                                            editProduct(
                                                '${escapeHTML(
                                                    product.id
                                                )}'
                                            )
                                        "
                                    >
                                        Edit
                                    </button>


                                    <button
                                        class="btn btn-dark"
                                        type="button"
                                        onclick="
                                            toggleProductStatus(
                                                '${escapeHTML(
                                                    product.id
                                                )}'
                                            )
                                        "
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
                                        onclick="
                                            deleteProduct(
                                                '${escapeHTML(
                                                    product.id
                                                )}'
                                            )
                                        "
                                    >
                                        Delete
                                    </button>

                                </div>

                            </td>

                        </tr>
                    `;
                }
            )
            .join("");
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

    if (
        input.dataset.searchReady ===
        "true"
    ) {
        return;
    }

    input.dataset.searchReady =
        "true";

    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            /* EMPTY SEARCH */

            if (!query) {

                renderProducts(
                    allProducts
                );

                return;
            }

            /* FILTER */

            const filtered =
                allProducts.filter(
                    product => {

                        const text =
                            [
                                product.name,
                                product.category,
                                product.sport,
                                product.brand,
                                product.description
                            ]
                                .filter(
                                    Boolean
                                )
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
   OPEN ADD PRODUCT MODAL
============================================================ */

function openAddProductModal() {

    currentProductId =
        null;

    const form =
        document.getElementById(
            "productForm"
        );

    if (form) {

        form.reset();
    }

    updateElement(
        "productModalTitle",
        "Add Product"
    );

    const hidden =
        document.getElementById(
            "productId"
        );

    if (hidden) {

        hidden.value =
            "";
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

    currentProductId =
        null;
}


/* ============================================================
   EDIT PRODUCT
============================================================ */

function editProduct(
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

    currentProductId =
        product.id;

    const fields = {

        productId:
            product.id,

        productName:
            product.name || "",

        productSport:
            product.sport || "",

        productCategory:
            product.category || "",

        productDescription:
            product.description || "",

        productPrice:
            product.price ?? "",

        productStock:
            product.stock ?? 0,

        productBrand:
            product.brand || "",

        productImage:
            product.image_url ||
            product.image ||
            ""
    };

    Object.entries(
        fields
    ).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.value =
                    value;
            }
        }
    );

    updateElement(
        "productModalTitle",
        "Edit Product"
    );

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

async function saveProduct(
    event
) {

    if (event) {

        event.preventDefault();
    }

    if (!currentUser) {

        showToast(
            "Seller account not found.",
            "error"
        );

        return;
    }

    const isEditing =
        Boolean(
            currentProductId
        );

    const getValue =
        id => {

            const element =
                document.getElementById(
                    id
                );

            return (
                element?.value ||
                ""
            )
                .trim();
        };


    /* BASIC FIELDS */

    const name =
        getValue(
            "productName"
        );

    const sport =
        getValue(
            "productSport"
        );

    const category =
        getValue(
            "productCategory"
        );

    const description =
        getValue(
            "productDescription"
        );

    const brand =
        getValue(
            "productBrand"
        );

    const image =
        getValue(
            "productImage"
        );


    /* PRICE */

    const price =
        Number(
            document
                .getElementById(
                    "productPrice"
                )
                ?.value ||
            0
        );


    /* STOCK */

    const stock =
        Number(
            document
                .getElementById(
                    "productStock"
                )
                ?.value ||
            0
        );


    /* VALIDATION */

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

    if (
        !Number.isFinite(
            price
        ) ||
        price < 0
    ) {

        showToast(
            "Please enter a valid price.",
            "error"
        );

        return;
    }

    if (
        !Number.isInteger(
            stock
        ) ||
        stock < 0
    ) {

        showToast(
            "Please enter a valid stock quantity.",
            "error"
        );

        return;
    }


    /* PAYLOAD */

    const payload = {

        name,

        description:
            description ||
            null,

        sport,

        category:
            category ||
            null,

        brand:
            brand ||
            null,

        price,

        stock,

        image_url:
            image ||
            null
    };


    try {

        let result;


        /* ====================================================
           UPDATE
        ==================================================== */

        if (isEditing) {

            result =
                await withTimeout(

                    supabaseClient
                        .from("products")
                        .update(
                            payload
                        )
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

        }


        /* ====================================================
           INSERT
        ==================================================== */

        else {

            payload.seller_id =
                currentUser.id;

            payload.is_active =
                true;

            payload.is_best_seller =
                false;

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


        /* SUPABASE ERROR */

        if (result.error) {

            throw result.error;
        }


        /* CLOSE */

        closeProductModal();


        /* MESSAGE */

        showToast(

            isEditing
                ? "Product updated successfully."
                : "Product added successfully.",

            "success"
        );


        /* REFRESH */

        await loadProducts();

        updateDashboardStats();

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
            "Toggle product error:",
            error
        );

        showToast(
            error?.message ||
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

        showToast(
            "Product not found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(

            `Delete "${
                product.name ||
                "this product"
            }"?`

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

        updateDashboardStats();

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
   PRODUCT MODAL EVENTS
============================================================ */

function initProductModal() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (
        form &&
        form.dataset.productFormReady !==
        "true"
    ) {

        form.dataset.productFormReady =
            "true";

        form.addEventListener(
            "submit",
            saveProduct
        );
    }


    const addButtons =
        document.querySelectorAll(
            "[data-add-product], #addProductBtn, #openAddProductBtn"
        );

    addButtons.forEach(
        button => {

            if (
                button.dataset
                    .addProductReady ===
                "true"
            ) {
                return;
            }

            button.dataset
                .addProductReady =
                "true";

            button.type =
                "button";

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    openAddProductModal();
                }
            );
        }
    );


    const closeButtons =
        document.querySelectorAll(
            "[data-close-product], #closeProductModalBtn, #cancelProductBtn"
        );

    closeButtons.forEach(
        button => {

            if (
                button.dataset
                    .closeProductReady ===
                "true"
            ) {
                return;
            }

            button.dataset
                .closeProductReady =
                "true";

            button.type =
                "button";

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    closeProductModal();
                }
            );
        }
    );


    /* CLOSE WHEN CLICKING BACKDROP */

    const modal =
        document.getElementById(
            "productModal"
        );

    if (
        modal &&
        modal.dataset.backdropReady !==
        "true"
    ) {

        modal.dataset.backdropReady =
            "true";

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    closeProductModal();
                }
            }
        );
    }
}


/* ============================================================
   EXPORT PRODUCT FUNCTIONS
============================================================ */

window.loadProducts =
    loadProducts;

window.renderProducts =
    renderProducts;

window.initProductSearch =
    initProductSearch;

window.openAddProductModal =
    openAddProductModal;

window.closeProductModal =
    closeProductModal;

window.editProduct =
    editProduct;

window.saveProduct =
    saveProduct;

window.toggleProductStatus =
    toggleProductStatus;

window.deleteProduct =
    deleteProduct;

window.initProductModal =
    initProductModal;


/* ============================================================
   END PART 2
============================================================ */
/* ============================================================
   KHELZONE SELLER DASHBOARD
   PART 3 / 4
   ORDERS + ORDER DETAILS + STATUS
============================================================ */


/* ============================================================
   ORDER ITEM HELPERS
============================================================ */

function getItemQuantity(item) {

    return Number(
        item?.quantity || 0
    );
}


function getItemPrice(item) {

    return Number(
        item?.price ??
        item?.unit_price ??
        0
    );
}


function getItemProductName(item) {

    return (
        item?.product_name ||
        item?.name ||
        item?.product?.name ||
        "Product"
    );
}


/* ============================================================
   CUSTOMER HELPERS
============================================================ */

function getCustomerName(order) {

    return (
        order?.shipping_name ||
        order?.customer_name ||
        order?.customerName ||
        order?.name ||
        "Customer"
    );
}


function getCustomerEmail(order) {

    return (
        order?.shipping_email ||
        order?.customer_email ||
        order?.customerEmail ||
        order?.email ||
        "—"
    );
}


function getCustomerPhone(order) {

    return (
        order?.shipping_phone ||
        order?.customer_phone ||
        order?.customerPhone ||
        order?.phone ||
        order?.contact_no ||
        order?.contactNo ||
        order?.mobile ||
        "—"
    );
}


function getOrderNumber(order) {

    return (
        order?.order_number ||
        order?.orderNumber ||
        order?.id ||
        "—"
    );
}


/* ============================================================
   SELLER ORDER TOTAL
============================================================ */

function getSellerOrderTotal(order) {

    const items =
        Array.isArray(
            order?.seller_items
        )
            ? order.seller_items
            : [];

    return items.reduce(
        (
            sum,
            item
        ) => {

            return (
                sum +
                (
                    getItemQuantity(item) *
                    getItemPrice(item)
                )
            );

        },
        0
    );
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
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        return allOrderItems;

    } catch (error) {

        console.error(
            "Order items error:",
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

        allOrders = [];

        renderOrders([]);

        renderRecentOrders([]);

        return;
    }


    try {

        /* GET SELLER ORDER ITEMS */

        await loadOrderItems();


        /* NO ITEMS */

        if (
            allOrderItems.length ===
            0
        ) {

            allOrders = [];

            renderOrders([]);

            renderRecentOrders([]);

            updateDashboardStats();

            return;
        }


        /* GET UNIQUE ORDER IDS */

        const orderIds =
            [
                ...new Set(

                    allOrderItems
                        .map(
                            item =>
                                item.order_id
                        )
                        .filter(
                            Boolean
                        )
                )
            ];


        if (
            orderIds.length ===
            0
        ) {

            allOrders = [];

            renderOrders([]);

            renderRecentOrders([]);

            return;
        }


        /* LOAD ORDERS */

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


        const orders =
            Array.isArray(
                result.data
            )
                ? result.data
                : [];


        /* ATTACH SELLER ITEMS */

        allOrders =
            orders.map(
                order => {

                    const sellerItems =
                        allOrderItems.filter(
                            item =>
                                String(
                                    item.order_id
                                ) ===
                                String(
                                    order.id
                                )
                        );


                    return {

                        ...order,

                        seller_items:
                            sellerItems
                    };
                }
            );


        /* RENDER */

        renderOrders(
            allOrders
        );


        renderRecentOrders(
            allOrders
        );


        updateDashboardStats();

    } catch (error) {

        console.error(
            "Load orders error:",
            error
        );


        allOrders = [];


        if (tbody) {

            showTableMessage(
                tbody,
                11,
                "Failed to load orders: " +
                (
                    error?.message ||
                    "Unknown error"
                )
            );
        }


        renderRecentOrders([]);

        showToast(
            error?.message ||
            "Failed to load orders.",
            "error"
        );
    }
}


/* ============================================================
   RENDER ORDERS
============================================================ */

function renderOrders(
    orders
) {

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


    const rows = [];


    orders.forEach(
        order => {

            const items =
                Array.isArray(
                    order.seller_items
                )
                    ? order.seller_items
                    : [];


            /* FALLBACK ROW */

            if (
                items.length === 0
            ) {

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
                                    ).slice(
                                        0,
                                        20
                                    )
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
                            —
                        </td>

                        <td>
                            0
                        </td>

                        <td>
                            ${formatCurrency(0)}
                        </td>

                        <td>
                            ${formatCurrency(0)}
                        </td>

                        <td>
                            <span
                                class="
                                    status
                                    ${getStatusClass(
                                        order.status
                                    )}
                                "
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
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    class="btn btn-dark"
                                    onclick="
                                        viewOrder(
                                            '${escapeHTML(
                                                order.id
                                            )}'
                                        )
                                    "
                                >
                                    View
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-orange"
                                    onclick="
                                        changeOrderStatus(
                                            '${escapeHTML(
                                                order.id
                                            )}'
                                        )
                                    "
                                >
                                    Status
                                </button>

                            </div>

                        </td>

                    </tr>
                `);

                return;
            }


            /* NORMAL ITEM ROWS */

            items.forEach(
                item => {

                    const quantity =
                        getItemQuantity(
                            item
                        );

                    const price =
                        getItemPrice(
                            item
                        );

                    const lineTotal =
                        quantity *
                        price;


                    rows.push(`

                        <tr>

                            <!-- ORDER -->

                            <td>

                                <strong
                                    style="
                                        color:#ff5a00;
                                    "
                                >
                                    ${escapeHTML(
                                        String(
                                            getOrderNumber(
                                                order
                                            )
                                        ).slice(
                                            0,
                                            20
                                        )
                                    )}
                                </strong>

                            </td>


                            <!-- CUSTOMER -->

                            <td>

                                ${escapeHTML(
                                    getCustomerName(
                                        order
                                    )
                                )}

                            </td>


                            <!-- EMAIL -->

                            <td>

                                ${escapeHTML(
                                    getCustomerEmail(
                                        order
                                    )
                                )}

                            </td>


                            <!-- CONTACT -->

                            <td>

                                ${escapeHTML(
                                    getCustomerPhone(
                                        order
                                    )
                                )}

                            </td>


                            <!-- PRODUCT -->

                            <td>

                                ${escapeHTML(
                                    getItemProductName(
                                        item
                                    )
                                )}

                            </td>


                            <!-- QTY -->

                            <td>

                                ${quantity}

                            </td>


                            <!-- PRICE -->

                            <td>

                                ${formatCurrency(
                                    price
                                )}

                            </td>


                            <!-- TOTAL -->

                            <td>

                                <strong
                                    style="
                                        color:#fff;
                                    "
                                >
                                    ${formatCurrency(
                                        lineTotal
                                    )}
                                </strong>

                            </td>


                            <!-- STATUS -->

                            <td>

                                <span
                                    class="
                                        status
                                        ${getStatusClass(
                                            order.status
                                        )}
                                    "
                                >

                                    ${escapeHTML(
                                        formatStatus(
                                            order.status
                                        )
                                    )}

                                </span>

                            </td>


                            <!-- DATE -->

                            <td>

                                ${formatDate(
                                    order.created_at
                                )}

                            </td>


                            <!-- ACTIONS -->

                            <td>

                                <div
                                    style="
                                        display:flex;
                                        gap:7px;
                                        flex-wrap:wrap;
                                    "
                                >

                                    <button
                                        type="button"
                                        class="btn btn-dark"
                                        onclick="
                                            viewOrder(
                                                '${escapeHTML(
                                                    order.id
                                                )}'
                                            )
                                        "
                                    >
                                        View
                                    </button>


                                    <button
                                        type="button"
                                        class="btn btn-orange"
                                        onclick="
                                            changeOrderStatus(
                                                '${escapeHTML(
                                                    order.id
                                                )}'
                                            )
                                        "
                                    >
                                        Status
                                    </button>

                                </div>

                            </td>

                        </tr>

                    `);
                }
            );
        }
    );


    if (
        rows.length === 0
    ) {

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


    const rows = [];


    orders
        .slice(0, 5)
        .forEach(
            order => {

                const items =
                    Array.isArray(
                        order.seller_items
                    )
                        ? order.seller_items
                        : [];


                if (
                    items.length === 0
                ) {
                    return;
                }


                const item =
                    items[0];


                const quantity =
                    getItemQuantity(
                        item
                    );


                const price =
                    getItemPrice(
                        item
                    );


                const total =
                    quantity *
                    price;


                rows.push(`

                    <tr>

                        <td>

                            ${escapeHTML(
                                String(
                                    getOrderNumber(
                                        order
                                    )
                                ).slice(
                                    0,
                                    20
                                )
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
                                getItemProductName(
                                    item
                                )
                            )}

                        </td>


                        <td>

                            ${quantity}

                        </td>


                        <td>

                            <strong
                                style="
                                    color:#ff5a00;
                                "
                            >
                                ${formatCurrency(
                                    total
                                )}
                            </strong>

                        </td>


                        <td>

                            <span
                                class="
                                    status
                                    ${getStatusClass(
                                        order.status
                                    )}
                                "
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
            }
        );


    if (
        rows.length === 0
    ) {

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
   VIEW ORDER DETAILS
============================================================ */

function viewOrder(
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


    const modal =
        document.getElementById(
            "orderModal"
        );


    const body =
        document.getElementById(
            "orderModalBody"
        );


    if (
        !modal ||
        !body
    ) {

        showToast(
            "Order details modal is missing.",
            "error"
        );

        return;
    }


    const items =
        Array.isArray(
            order.seller_items
        )
            ? order.seller_items
            : [];


    const sellerTotal =
        getSellerOrderTotal(
            order
        );


    const itemsHTML =
        items
            .map(
                item => {

                    const quantity =
                        getItemQuantity(
                            item
                        );

                    const price =
                        getItemPrice(
                            item
                        );

                    const productName =
                        getItemProductName(
                            item
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
                                            productName
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
                                        white-space:nowrap;
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
                                ${formatCurrency(
                                    price
                                )}

                            </div>

                        </div>

                    `;
                }
            )
            .join("");


    body.innerHTML = `

        <!-- CUSTOMER INFORMATION -->

        <div
            class="detail-grid"
            style="
                margin-bottom:20px;
            "
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
                        class="
                            status
                            ${getStatusClass(
                                order.status
                            )}
                        "
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
                        order.city ||
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
                        order.paymentMethod ||
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
                    style="
                        color:#ff5a00;
                    "
                >
                    ${formatCurrency(
                        sellerTotal
                    )}
                </div>

            </div>

        </div>


        <!-- SHIPPING ADDRESS -->

        <div
            class="detail-item"
            style="
                margin-bottom:15px;
            "
        >

            <div class="detail-label">
                Shipping Address
            </div>

            <div class="detail-value">

                ${escapeHTML(
                    order.shipping_address ||
                    order.address ||
                    "—"
                )}

            </div>

        </div>


        <!-- ITEMS -->

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


        ${
            itemsHTML ||
            `
                <div
                    style="
                        color:#777;
                    "
                >
                    No items found.
                </div>
            `
        }


        <!-- STATUS BUTTON -->

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
                onclick="
                    changeOrderStatus(
                        '${escapeHTML(
                            order.id
                        )}'
                    )
                "
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


    const selected =
        window.prompt(

            "Enter status:\n\n" +

            "1. Pending\n" +

            "2. Processing\n" +

            "3. Shipped\n" +

            "4. Delivered\n\n" +

            "Current: " +

            formatStatus(
                current
            ),

            String(
                currentIndex >= 0
                    ? currentIndex + 1
                    : 1
            )
        );


    if (
        selected === null
    ) {
        return;
    }


    const value =
        selected
            .trim()
            .toLowerCase();


    let newStatus =
        null;


    const numeric =
        Number(
            value
        );


    if (
        Number.isInteger(
            numeric
        ) &&
        numeric >= 1 &&
        numeric <= 4
    ) {

        newStatus =
            ORDER_STATUSES[
                numeric - 1
            ];

    } else if (
        ORDER_STATUSES.includes(
            value
        )
    ) {

        newStatus =
            value;
    }


    if (!newStatus) {

        showToast(
            "Invalid status. Use 1, 2, 3 or 4.",
            "error"
        );

        return;
    }


    if (
        newStatus === current
    ) {

        showToast(
            "Order is already " +
            formatStatus(
                current
            ) +
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


    if (
        !ORDER_STATUSES.includes(
            status
        )
    ) {

        showToast(
            "Invalid order status.",
            "error"
        );

        return false;
    }


    if (!currentUser) {

        showToast(
            "Seller account not found.",
            "error"
        );

        return false;
    }


    /* SECURITY CHECK:
       Make sure this seller actually
       owns an item in this order.
    */

    const sellerItems =
        allOrderItems.filter(
            item =>
                String(
                    item.order_id
                ) ===
                String(
                    orderId
                ) &&
                String(
                    item.seller_id
                ) ===
                String(
                    currentUser.id
                )
        );


    if (
        sellerItems.length === 0
    ) {

        showToast(
            "You cannot update this order.",
            "error"
        );

        return false;
    }


    try {

        const result =
            await withTimeout(

                supabaseClient
                    .from("orders")
                    .update({
                        status: status
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


        /* UPDATE LOCAL DATA */

        allOrders =
            allOrders.map(
                order => {

                    if (
                        String(
                            order.id
                        ) !==
                        String(
                            orderId
                        )
                    ) {

                        return order;
                    }


                    return {
                        ...order,
                        status: status
                    };
                }
            );


        /* REFRESH UI */

        renderOrders(
            allOrders
        );

        renderRecentOrders(
            allOrders
        );


        /* CLOSE MODAL */

        closeOrderModal();


        showToast(
            "Order status updated to " +
            formatStatus(status) +
            ".",
            "success"
        );


        updateDashboardStats();


        return true;

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


        return false;
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


    if (
        input.dataset.orderSearchReady ===
        "true"
    ) {
        return;
    }


    input.dataset.orderSearchReady =
        "true";


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
                                        [
                                            getItemProductName(
                                                item
                                            ),
                                            item.category,
                                            item.sport
                                        ]
                                            .filter(
                                                Boolean
                                            )
                                            .join(" ")
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
                                order.status,
                                itemText
                            ]
                                .filter(
                                    Boolean
                                )
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
   ORDER MODAL EVENTS
============================================================ */

function initOrderModal() {

    const modal =
        document.getElementById(
            "orderModal"
        );


    if (
        !modal ||
        modal.dataset.orderModalReady ===
        "true"
    ) {
        return;
    }


    modal.dataset.orderModalReady =
        "true";


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeOrderModal();
            }
        }
    );


    const closeButtons =
        document.querySelectorAll(
            [
                "[data-close-order]",
                "#closeOrderModalBtn",
                "#closeOrderBtn"
            ].join(",")
        );


    closeButtons.forEach(
        button => {

            if (
                button.dataset
                    .orderCloseReady ===
                "true"
            ) {
                return;
            }


            button.dataset
                .orderCloseReady =
                "true";


            button.type =
                "button";


            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    closeOrderModal();
                }
            );
        }
    );
}


/* ============================================================
   EXPORT ORDER FUNCTIONS
============================================================ */

window.loadOrderItems =
    loadOrderItems;

window.loadOrders =
    loadOrders;

window.renderOrders =
    renderOrders;

window.renderRecentOrders =
    renderRecentOrders;

window.viewOrder =
    viewOrder;

window.closeOrderModal =
    closeOrderModal;

window.changeOrderStatus =
    changeOrderStatus;

window.setOrderStatus =
    setOrderStatus;

window.initOrderSearch =
    initOrderSearch;

window.initOrderModal =
    initOrderModal;


/* ============================================================
   END PART 3
============================================================ */
/* ============================================================
   KHELZONE SELLER DASHBOARD
   PART 4 / 4
   STATS + MODALS + REFRESH + STARTUP
============================================================ */


/* ============================================================
   DASHBOARD STATS
============================================================ */

function updateDashboardStats() {

    /* --------------------------------------------------------
       PRODUCT STATS
    -------------------------------------------------------- */

    const totalProducts =
        Array.isArray(allProducts)
            ? allProducts.length
            : 0;

    const activeProducts =
        Array.isArray(allProducts)
            ? allProducts.filter(
                product =>
                    product.is_active !== false
            ).length
            : 0;

    const inactiveProducts =
        totalProducts -
        activeProducts;


    /* --------------------------------------------------------
       ORDER STATS
    -------------------------------------------------------- */

    const totalOrders =
        Array.isArray(allOrders)
            ? allOrders.length
            : 0;


    const pendingOrders =
        Array.isArray(allOrders)
            ? allOrders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) === "pending"
            ).length
            : 0;


    const processingOrders =
        Array.isArray(allOrders)
            ? allOrders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) === "processing"
            ).length
            : 0;


    const shippedOrders =
        Array.isArray(allOrders)
            ? allOrders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) === "shipped"
            ).length
            : 0;


    const deliveredOrders =
        Array.isArray(allOrders)
            ? allOrders.filter(
                order =>
                    normalizeStatus(
                        order.status
                    ) === "delivered"
            ).length
            : 0;


    /* --------------------------------------------------------
       SALES
    -------------------------------------------------------- */

    const totalSales =
        Array.isArray(allOrders)
            ? allOrders.reduce(
                (
                    total,
                    order
                ) => {

                    return (
                        total +
                        getSellerOrderTotal(
                            order
                        )
                    );

                },
                0
            )
            : 0;


    /* --------------------------------------------------------
       UPDATE COMMON IDS
    -------------------------------------------------------- */

    const values = {

        totalProducts,
        activeProducts,
        inactiveProducts,

        totalOrders,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,

        totalSales
    };


    Object.entries(
        values
    ).forEach(
        (
            [key, value]
        ) => {

            updateElement(
                key,
                key === "totalSales"
                    ? formatCurrency(value)
                    : String(value)
            );
        }
    );


    /* --------------------------------------------------------
       SUPPORT MULTIPLE POSSIBLE HTML IDS
    -------------------------------------------------------- */

    const aliases = {

        productCount:
            totalProducts,

        productsCount:
            totalProducts,

        totalProductCount:
            totalProducts,

        activeProductCount:
            activeProducts,

        orderCount:
            totalOrders,

        ordersCount:
            totalOrders,

        totalOrderCount:
            totalOrders,

        pendingCount:
            pendingOrders,

        processingCount:
            processingOrders,

        shippedCount:
            shippedOrders,

        deliveredCount:
            deliveredOrders,

        salesCount:
            totalSales,

        totalRevenue:
            totalSales,

        revenue:
            totalSales
    };


    Object.entries(
        aliases
    ).forEach(
        (
            [id, value]
        ) => {

            const element =
                document.getElementById(
                    id
                );

            if (!element) {
                return;
            }


            element.textContent =
                typeof value === "number" &&
                (
                    id.toLowerCase()
                        .includes("sale") ||
                    id.toLowerCase()
                        .includes("revenue")
                )
                    ? formatCurrency(value)
                    : String(value);
        }
    );
}


/* ============================================================
   GENERIC ELEMENT UPDATER
============================================================ */

function updateElement(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.textContent =
        value == null
            ? ""
            : String(value);
}


/* ============================================================
   MODAL INITIALIZATION
============================================================ */

function initModals() {

    /* --------------------------------------------------------
       PRODUCT MODAL
    -------------------------------------------------------- */

    initProductModal();


    /* --------------------------------------------------------
       ORDER MODAL
    -------------------------------------------------------- */

    initOrderModal();


    /* --------------------------------------------------------
       ESCAPE / BACKDROP
    -------------------------------------------------------- */

    const productModal =
        document.getElementById(
            "productModal"
        );


    const orderModal =
        document.getElementById(
            "orderModal"
        );


    if (
        productModal &&
        productModal.dataset
            .globalModalReady !==
        "true"
    ) {

        productModal.dataset
            .globalModalReady =
            "true";

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


    if (
        orderModal &&
        orderModal.dataset
            .globalModalReady !==
        "true"
    ) {

        orderModal.dataset
            .globalModalReady =
            "true";

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
}


/* ============================================================
   ESCAPE KEY
============================================================ */

function initEscapeKey() {

    if (
        document.body.dataset
            .escapeKeyReady ===
        "true"
    ) {
        return;
    }


    document.body.dataset
        .escapeKeyReady =
        "true";


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            /* CLOSE PRODUCT */

            closeProductModal();


            /* CLOSE ORDER */

            closeOrderModal();


            /* CLOSE MOBILE MENU */

            closeMobileMenu();
        }
    );
}


/* ============================================================
   REFRESH DASHBOARD
============================================================ */

async function refreshDashboard() {

    try {

        showToast(
            "Refreshing dashboard...",
            "info"
        );


        await Promise.all([
            loadProducts(),
            loadOrders()
        ]);


        updateDashboardStats();


        showToast(
            "Dashboard refreshed.",
            "success"
        );

    } catch (error) {

        console.error(
            "Refresh dashboard error:",
            error
        );


        showToast(
            error?.message ||
            "Failed to refresh dashboard.",
            "error"
        );
    }
}


/* ============================================================
   START SELLER DASHBOARD
============================================================ */

async function startSellerDashboard() {

    /* --------------------------------------------------------
       PREVENT DOUBLE START
    -------------------------------------------------------- */

    if (
        dashboardStarted
    ) {
        return;
    }


    dashboardStarted =
        true;


    /* --------------------------------------------------------
       SHOW LOADING
    -------------------------------------------------------- */

    showLoadingScreen();


    try {

        /* ====================================================
           WAIT FOR SUPABASE
        ==================================================== */

        await waitForSupabaseClient();


        /* ====================================================
           GET USER
        ==================================================== */

        await getCurrentUser();


        /* ====================================================
           CHECK LOGIN
        ==================================================== */

        if (!currentUser) {

            window.location.href =
                LOGIN_PAGE;

            return;
        }


        /* ====================================================
           LOAD PROFILE
        ==================================================== */

        await loadCurrentProfile();


        /* ====================================================
           CHECK SELLER ACCESS
        ==================================================== */

        const access =
            await checkSellerAccess();


        if (!access) {

            return;
        }


        /* ====================================================
           RENDER PROFILE
        ==================================================== */

        renderSellerProfile();


        /* ====================================================
           INITIALIZE NAVIGATION
        ==================================================== */

        initNavigation();

        initMobileMenu();

        initLogout();


        /* ====================================================
           SEARCH
        ==================================================== */

        initProductSearch();

        initOrderSearch();


        /* ====================================================
           MODALS
        ==================================================== */

        initModals();

        initEscapeKey();


        /* ====================================================
           DEFAULT SECTION
        ==================================================== */

        showSection(
            "dashboardSection"
        );


        /* ====================================================
           LOAD DATA
        ==================================================== */

        await loadProducts();

        await loadOrders();


        /* ====================================================
           UPDATE STATS
        ==================================================== */

        updateDashboardStats();


        /* ====================================================
           FINAL UI
        ==================================================== */

        document.body.classList.add(
            "seller-dashboard-ready"
        );


        console.log(
            "KHELZONE Seller Dashboard loaded successfully."
        );

    } catch (error) {

        console.error(
            "Seller dashboard startup error:",
            error
        );


        showDashboardError(
            error?.message ||
            "Unable to load seller dashboard."
        );

    } finally {

        /* ----------------------------------------------------
           VERY IMPORTANT:
           LOADING MUST ALWAYS STOP
        ---------------------------------------------------- */

        hideLoadingScreen();
    }
}


/* ============================================================
   AUTOMATIC STARTUP
============================================================ */

function bootSellerDashboard() {

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            () => {

                startSellerDashboard();

            },
            {
                once: true
            }
        );

    } else {

        startSellerDashboard();
    }
}


/* ============================================================
   GLOBAL EXPORTS
============================================================ */

window.startSellerDashboard =
    startSellerDashboard;

window.bootSellerDashboard =
    bootSellerDashboard;

window.refreshDashboard =
    refreshDashboard;

window.updateDashboardStats =
    updateDashboardStats;

window.initModals =
    initModals;

window.initEscapeKey =
    initEscapeKey;


/* ============================================================
   PRODUCT EXPORTS
============================================================ */

window.loadProducts =
    loadProducts;

window.renderProducts =
    renderProducts;

window.initProductSearch =
    initProductSearch;

window.openAddProductModal =
    openAddProductModal;

window.closeProductModal =
    closeProductModal;

window.editProduct =
    editProduct;

window.saveProduct =
    saveProduct;

window.toggleProductStatus =
    toggleProductStatus;

window.deleteProduct =
    deleteProduct;


/* ============================================================
   ORDER EXPORTS
============================================================ */

window.loadOrderItems =
    loadOrderItems;

window.loadOrders =
    loadOrders;

window.renderOrders =
    renderOrders;

window.renderRecentOrders =
    renderRecentOrders;

window.viewOrder =
    viewOrder;

window.closeOrderModal =
    closeOrderModal;

window.changeOrderStatus =
    changeOrderStatus;

window.setOrderStatus =
    setOrderStatus;

window.initOrderSearch =
    initOrderSearch;

window.initOrderModal =
    initOrderModal;


/* ============================================================
   NAVIGATION EXPORTS
============================================================ */

window.initNavigation =
    initNavigation;

window.showSection =
    showSection;

window.initMobileMenu =
    initMobileMenu;

window.closeMobileMenu =
    closeMobileMenu;


/* ============================================================
   FINAL START
============================================================ */

bootSellerDashboard();


/* ============================================================
   END OF KHELZONE SELLER DASHBOARD JS
============================================================ */