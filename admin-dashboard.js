/* ============================================================
   KHELZONE ADMIN DASHBOARD
   FULL VERSION
   ADMIN ONLY

   FEATURES:
   - Admin access protection
   - Dashboard counts
   - Products
   - Product enable/disable
   - Product delete
   - Sellers
   - Seller status update
   - Seller delete
   - Customers from profiles WHERE role = customer
   - Customer delete
   - Orders
   - Order status update
   - Order delete
   - Search
   - Mobile sidebar
   - Logout
============================================================ */

"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const supabaseClient = window.supabaseClient;

if (!supabaseClient) {
    console.error(
        "KHELZONE ERROR: Supabase client not found."
    );
}


/* ============================================================
   BASIC HELPER
============================================================ */

function $(id) {
    return document.getElementById(id);
}


/* ============================================================
   ESCAPE HTML
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
   MONEY
============================================================ */

function formatMoney(value) {

    const number = Number(
        value ?? 0
    );

    if (!Number.isFinite(number)) {
        return "Rs. 0";
    }

    return (
        "Rs. " +
        number.toLocaleString("en-PK")
    );
}


/* ============================================================
   DATE
============================================================ */

function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-PK",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* ============================================================
   INITIALS
============================================================ */

function initials(name) {

    if (!name) {
        return "U";
    }

    const words = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    return (
        words
            .slice(0, 2)
            .map(
                word =>
                    word
                        .charAt(0)
                        .toUpperCase()
            )
            .join("")
        || "U"
    );
}


/* ============================================================
   TABLE MESSAGE
============================================================ */

function showTableMessage(
    tbodyId,
    message,
    colspan = 6
) {

    const tbody = $(tbodyId);

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="${colspan}"
                style="
                    text-align:center;
                    padding:35px 20px;
                    color:#999;
                    font-weight:600;
                "
            >
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}


/* ============================================================
   TOAST
============================================================ */

function showToast(message) {

    let toast = $("kzToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id = "kzToast";

        Object.assign(
            toast.style,
            {
                position: "fixed",
                right: "20px",
                bottom: "20px",
                zIndex: "999999",
                padding: "14px 20px",
                borderRadius: "10px",
                background: "#ff5a00",
                color: "#fff",
                fontWeight: "800",
                boxShadow:
                    "0 10px 30px rgba(0,0,0,.4)",
                maxWidth: "90%",
                transition: "opacity .2s ease"
            }
        );

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.display = "block";

    clearTimeout(
        window.kzToastTimer
    );

    window.kzToastTimer =
        setTimeout(
            () => {

                toast.style.opacity = "0";

                setTimeout(
                    () => {
                        toast.style.display =
                            "none";
                    },
                    200
                );

            },
            3000
        );
}


/* ============================================================
   ADMIN ACCESS CHECK
============================================================ */

async function checkAdminAccess() {

    const checkingScreen =
        $("checkingScreen");

    const dashboard =
        $("dashboard");

    const accessDenied =
        $("accessDenied");


    if (dashboard) {
        dashboard.classList.add("hidden");
    }

    if (accessDenied) {
        accessDenied.style.display =
            "none";
    }

    if (checkingScreen) {
        checkingScreen.style.display =
            "flex";
    }


    try {

        if (!supabaseClient) {

            throw new Error(
                "Supabase client is not initialized."
            );
        }


        /* ----------------------------------------------------
           GET CURRENT USER
        ---------------------------------------------------- */

        const {
            data,
            error: userError
        } =
            await supabaseClient.auth.getUser();

        if (userError) {
            throw userError;
        }

        const user =
            data?.user;


        /* ----------------------------------------------------
           USER NOT LOGGED IN
        ---------------------------------------------------- */

        if (!user) {

            window.location.replace(
                "admin.html"
            );

            return false;
        }


        /* ----------------------------------------------------
           CHECK ADMIN TABLE
        ---------------------------------------------------- */

        const {
            data: admin,
            error: adminError
        } =
            await supabaseClient
                .from("admins")
                .select("id")
                .eq("id", user.id)
                .maybeSingle();

        if (adminError) {
            throw adminError;
        }


        /* ----------------------------------------------------
           NOT ADMIN
        ---------------------------------------------------- */

        if (!admin) {

            console.warn(
                "KHELZONE: User is not admin."
            );

            if (checkingScreen) {
                checkingScreen.style.display =
                    "none";
            }

            if (dashboard) {
                dashboard.classList.add(
                    "hidden"
                );
            }

            if (accessDenied) {
                accessDenied.style.display =
                    "flex";
            }

            return false;
        }


        /* ----------------------------------------------------
           ADMIN VERIFIED
        ---------------------------------------------------- */

        console.log(
            "KHELZONE ADMIN VERIFIED:",
            user.id
        );

        localStorage.setItem(
            "khelzone_role",
            "admin"
        );

        localStorage.setItem(
            "khelzone_user_id",
            user.id
        );


        /* ----------------------------------------------------
           ADMIN NAME
        ---------------------------------------------------- */

        const adminName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Admin";

        const adminEmail =
            user.email ||
            "-";


        if ($("adminName")) {
            $("adminName").textContent =
                adminName;
        }

        if ($("adminEmail")) {
            $("adminEmail").textContent =
                adminEmail;
        }


        /* ----------------------------------------------------
           SHOW DASHBOARD
        ---------------------------------------------------- */

        if (checkingScreen) {
            checkingScreen.style.display =
                "none";
        }

        if (dashboard) {
            dashboard.classList.remove(
                "hidden"
            );
        }

        return true;

    } catch (error) {

        console.error(
            "KHELZONE ADMIN ACCESS ERROR:",
            error
        );

        if (checkingScreen) {
            checkingScreen.style.display =
                "none";
        }

        if (accessDenied) {
            accessDenied.style.display =
                "flex";
        }

        return false;
    }
}


/* ============================================================
   PAGE TITLES
============================================================ */

const sectionTitles = {

    dashboardSection:
        "Dashboard",

    productsSection:
        "Products",

    sellersSection:
        "Sellers",

    customersSection:
        "Customers",

    ordersSection:
        "Orders"

};


/* ============================================================
   SECTION NAVIGATION
============================================================ */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".section"
        );

    sections.forEach(
        section => {
            section.classList.remove(
                "active"
            );
        }
    );


    const target =
        $(sectionId);

    if (target) {
        target.classList.add(
            "active"
        );
    }


    /* --------------------------------------------------------
       NAV ACTIVE
    -------------------------------------------------------- */

    const navLinks =
        document.querySelectorAll(
            "[data-section]"
        );

    navLinks.forEach(
        link => {

            const linkSection =
                link.getAttribute(
                    "data-section"
                );

            if (
                linkSection ===
                sectionId
            ) {

                link.classList.add(
                    "active"
                );

            } else {

                link.classList.remove(
                    "active"
                );
            }
        }
    );


    /* --------------------------------------------------------
       PAGE TITLE
    -------------------------------------------------------- */

    const pageTitle =
        $("pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            sectionTitles[
                sectionId
            ] ||
            "Dashboard";
    }


    closeMobileMenu();
}


/* ============================================================
   NAVIGATION INIT
============================================================ */

function initNavigation() {

    const links =
        document.querySelectorAll(
            "[data-section]"
        );

    links.forEach(
        link => {

            link.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    const sectionId =
                        link.getAttribute(
                            "data-section"
                        );

                    if (sectionId) {
                        showSection(
                            sectionId
                        );
                    }
                }
            );
        }
    );
}


/* ============================================================
   MOBILE MENU
============================================================ */

let mobileOverlay = null;


function createMobileOverlay() {

    if (mobileOverlay) {
        return mobileOverlay;
    }

    mobileOverlay =
        document.createElement("div");

    mobileOverlay.id =
        "kzMobileOverlay";

    Object.assign(
        mobileOverlay.style,
        {
            position: "fixed",
            inset: "0",
            background:
                "rgba(0,0,0,.65)",
            zIndex: "99",
            display: "none"
        }
    );

    mobileOverlay.addEventListener(
        "click",
        closeMobileMenu
    );

    document.body.appendChild(
        mobileOverlay
    );

    return mobileOverlay;
}


function openMobileMenu() {

    const sidebar =
        $("sidebar");

    const overlay =
        createMobileOverlay();

    if (sidebar) {

        sidebar.classList.add(
            "mobile-open"
        );
    }

    if (overlay) {

        overlay.style.display =
            "block";
    }
}


function closeMobileMenu() {

    const sidebar =
        $("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }

    if (mobileOverlay) {

        mobileOverlay.style.display =
            "none";
    }
}


function initMobileMenu() {

    const button =
        $("mobileMenuBtn");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        () => {

            const sidebar =
                $("sidebar");

            if (
                sidebar &&
                sidebar.classList.contains(
                    "mobile-open"
                )
            ) {

                closeMobileMenu();

            } else {

                openMobileMenu();
            }
        }
    );
}


/* ============================================================
   DASHBOARD COUNTS
============================================================ */

async function safeCount(table) {

    try {

        if (!supabaseClient) {
            return 0;
        }

        const {
            count,
            error
        } =
            await supabaseClient
                .from(table)
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                );

        if (error) {

            console.error(
                `Count error [${table}]:`,
                error
            );

            return 0;
        }

        return count || 0;

    } catch (error) {

        console.error(
            `Count exception [${table}]:`,
            error
        );

        return 0;
    }
}


/* ============================================================
   CUSTOMER COUNT
   CUSTOMERS ARE IN profiles
============================================================ */

async function safeCustomerCount() {

    try {

        if (!supabaseClient) {
            return 0;
        }

        const {
            count,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "role",
                    "customer"
                );

        if (error) {

            console.error(
                "Customer count error:",
                error
            );

            return 0;
        }

        return count || 0;

    } catch (error) {

        console.error(
            "Customer count exception:",
            error
        );

        return 0;
    }
}


/* ============================================================
   LOAD DASHBOARD DATA
============================================================ */

async function loadDashboardData() {

    const results =
        await Promise.all([
            safeCount("products"),
            safeCount("sellers"),
            safeCustomerCount(),
            safeCount("orders")
        ]);


    const products =
        results[0];

    const sellers =
        results[1];

    const customers =
        results[2];

    const orders =
        results[3];


    if ($("productCount")) {
        $("productCount").textContent =
            products;
    }

    if ($("sellerCount")) {
        $("sellerCount").textContent =
            sellers;
    }

    if ($("customerCount")) {
        $("customerCount").textContent =
            customers;
    }

    if ($("orderCount")) {
        $("orderCount").textContent =
            orders;
    }
}


/* ============================================================
   PRODUCTS
============================================================ */

let allProducts = [];


/* ============================================================
   LOAD PRODUCTS
============================================================ */

async function loadProducts() {

    const tbody =
        $("productsTableBody");

    if (!tbody) {
        return;
    }

    showTableMessage(
        "productsTableBody",
        "Loading products...",
        6
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("products")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        allProducts =
            Array.isArray(data)
                ? data
                : [];

        renderProducts(
            allProducts
        );

    } catch (error) {

        console.error(
            "Products error:",
            error
        );

        showTableMessage(
            "productsTableBody",
            error?.message ||
            "Unable to load products.",
            6
        );
    }
}


/* ============================================================
   RENDER PRODUCTS
============================================================ */

function renderProducts(products) {

    const tbody =
        $("productsTableBody");

    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        showTableMessage(
            "productsTableBody",
            "No products found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        products.map(
            product => {

                const id =
                    product.id || "";

                const name =
                    product.name ||
                    product.title ||
                    "Unnamed Product";

                const price =
                    product.sale_price ??
                    product.price ??
                    0;

                const category =
                    product.category ||
                    "-";

                const seller =
                    product.seller_name ||
                    product.seller_email ||
                    product.seller_id ||
                    "-";

                const active =
                    product.is_active !== false;


                return `
                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(name)}
                            </strong>
                        </td>

                        <td>
                            ${formatMoney(price)}
                        </td>

                        <td>
                            ${escapeHTML(category)}
                        </td>

                        <td>
                            ${escapeHTML(seller)}
                        </td>

                        <td>
                            <span
                                style="
                                    color:${active
                                        ? "#42d392"
                                        : "#ff5a00"};
                                    font-weight:800;
                                "
                            >
                                ${active
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </td>

                        <td>

                            <div
                                style="
                                    display:flex;
                                    gap:6px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    onclick="toggleProduct(
                                        '${escapeHTML(
                                            String(id)
                                        )}',
                                        ${active}
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #333;
                                        background:#191919;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:700;
                                    "
                                >
                                    ${active
                                        ? "Disable"
                                        : "Enable"}
                                </button>


                                <button
                                    type="button"
                                    onclick="deleteProduct(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #6b1f1f;
                                        background:#3a1515;
                                        color:#ff7777;
                                        cursor:pointer;
                                        font-weight:800;
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* ============================================================
   PRODUCT SEARCH
============================================================ */

function initProductSearch() {

    const input =
        $("productSearch");

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

                        return [

                            product.name,

                            product.title,

                            product.category,

                            product.seller_name,

                            product.seller_email,

                            product.seller_id

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
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
   TOGGLE PRODUCT
============================================================ */

async function toggleProduct(
    productId,
    currentStatus
) {

    if (!productId) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("products")
                .update({
                    is_active:
                        !Boolean(
                            currentStatus
                        )
                })
                .eq(
                    "id",
                    productId
                );

        if (error) {
            throw error;
        }


        showToast(
            currentStatus
                ? "Product disabled."
                : "Product enabled."
        );


        await loadProducts();

        await loadDashboardData();

    } catch (error) {

        console.error(
            "Product update error:",
            error
        );

        alert(
            "Could not update product.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   DELETE PRODUCT
============================================================ */

async function deleteProduct(
    productId
) {

    if (!productId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this product?\n\nThis action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("products")
                .delete()
                .eq(
                    "id",
                    productId
                );

        if (error) {
            throw error;
        }


        showToast(
            "Product deleted successfully."
        );


        await loadProducts();

        await loadDashboardData();

    } catch (error) {

        console.error(
            "Product delete error:",
            error
        );

        alert(
            "Could not delete product.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   SELLERS
============================================================ */

let allSellers = [];


/* ============================================================
   LOAD SELLERS
============================================================ */

async function loadSellers() {

    const tbody =
        $("sellersTableBody");

    if (!tbody) {
        return;
    }

    showTableMessage(
        "sellersTableBody",
        "Loading sellers...",
        6
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("sellers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        allSellers =
            Array.isArray(data)
                ? data
                : [];


        renderSellers(
            allSellers
        );

    } catch (error) {

        console.error(
            "Sellers error:",
            error
        );

        showTableMessage(
            "sellersTableBody",
            error?.message ||
            "Unable to load sellers.",
            6
        );
    }
}


/* ============================================================
   SELLER HELPERS
============================================================ */

function sellerName(seller) {

    return (
        seller.name ||
        seller.full_name ||
        seller.seller_name ||
        seller.username ||
        "Unknown Seller"
    );
}


function sellerEmail(seller) {

    return (
        seller.email ||
        seller.seller_email ||
        "-"
    );
}


function sellerPhone(seller) {

    return (
        seller.phone ||
        seller.phone_number ||
        seller.seller_phone ||
        "-"
    );
}


function sellerStatus(seller) {

    return String(
        seller.status ||
        "pending"
    ).toLowerCase();
}


/* ============================================================
   RENDER SELLERS
============================================================ */

function renderSellers(sellers) {

    const tbody =
        $("sellersTableBody");

    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(sellers) ||
        sellers.length === 0
    ) {

        showTableMessage(
            "sellersTableBody",
            "No sellers found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        sellers.map(
            seller => {

                const id =
                    seller.id || "";

                const name =
                    sellerName(seller);

                const email =
                    sellerEmail(seller);

                const phone =
                    sellerPhone(seller);

                const status =
                    sellerStatus(seller);

                const date =
                    formatDate(
                        seller.created_at ||
                        seller.createdAt
                    );


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

                                <div
                                    style="
                                        width:38px;
                                        height:38px;
                                        min-width:38px;
                                        border-radius:50%;
                                        background:#ff5a00;
                                        color:#fff;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-weight:900;
                                    "
                                >
                                    ${escapeHTML(
                                        initials(name)
                                    )}
                                </div>

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                            </div>

                        </td>


                        <td>
                            ${escapeHTML(email)}
                        </td>


                        <td>
                            ${escapeHTML(phone)}
                        </td>


                        <td>

                            <select
                                onchange="updateSellerStatus(
                                    '${escapeHTML(
                                        String(id)
                                    )}',
                                    this.value
                                )"
                                style="
                                    padding:7px 10px;
                                    border-radius:7px;
                                    border:1px solid #444;
                                    background:#191919;
                                    color:#fff;
                                    cursor:pointer;
                                    max-width:130px;
                                "
                            >

                                <option
                                    value="pending"
                                    ${status === "pending"
                                        ? "selected"
                                        : ""}
                                >
                                    Pending
                                </option>

                                <option
                                    value="approved"
                                    ${status === "approved"
                                        ? "selected"
                                        : ""}
                                >
                                    Approved
                                </option>

                                <option
                                    value="active"
                                    ${status === "active"
                                        ? "selected"
                                        : ""}
                                >
                                    Active
                                </option>

                                <option
                                    value="rejected"
                                    ${status === "rejected"
                                        ? "selected"
                                        : ""}
                                >
                                    Rejected
                                </option>

                                <option
                                    value="blocked"
                                    ${status === "blocked"
                                        ? "selected"
                                        : ""}
                                >
                                    Blocked
                                </option>

                            </select>

                        </td>


                        <td>
                            ${escapeHTML(date)}
                        </td>


                        <td>

                            <div
                                style="
                                    display:flex;
                                    gap:6px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    onclick="viewSeller(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #333;
                                        background:#191919;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:700;
                                    "
                                >
                                    View
                                </button>


                                <button
                                    type="button"
                                    onclick="deleteSeller(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #6b1f1f;
                                        background:#3a1515;
                                        color:#ff7777;
                                        cursor:pointer;
                                        font-weight:800;
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* ============================================================
   SELLER SEARCH
============================================================ */

function initSellerSearch() {

    const input =
        $("sellerSearch");

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

                renderSellers(
                    allSellers
                );

                return;
            }


            const filtered =
                allSellers.filter(
                    seller => {

                        return [

                            seller.name,

                            seller.full_name,

                            seller.seller_name,

                            seller.username,

                            seller.email,

                            seller.seller_email,

                            seller.phone,

                            seller.phone_number,

                            seller.seller_phone,

                            seller.status

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
                            );
                    }
                );


            renderSellers(
                filtered
            );
        }
    );
}


/* ============================================================
   VIEW SELLER
============================================================ */

function viewSeller(id) {

    const seller =
        allSellers.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!seller) {

        alert(
            "Seller not found."
        );

        return;
    }


    alert(

        "SELLER DETAILS\n\n" +

        "Name: " +
        sellerName(seller) +

        "\nEmail: " +
        sellerEmail(seller) +

        "\nPhone: " +
        sellerPhone(seller) +

        "\nStatus: " +
        (
            seller.status ||
            "-"
        ) +

        "\nDate: " +
        formatDate(
            seller.created_at ||
            seller.createdAt
        )

    );
}


/* ============================================================
   UPDATE SELLER STATUS
============================================================ */

async function updateSellerStatus(
    id,
    status
) {

    if (!id || !status) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("sellers")
                .update({
                    status: status
                })
                .eq(
                    "id",
                    id
                );

        if (error) {
            throw error;
        }


        showToast(
            "Seller status updated."
        );


        await loadSellers();

    } catch (error) {

        console.error(
            "Seller status error:",
            error
        );

        alert(
            "Could not update seller status.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   DELETE SELLER
============================================================ */

async function deleteSeller(
    sellerId
) {

    if (!sellerId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this seller?\n\nThis action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("sellers")
                .delete()
                .eq(
                    "id",
                    sellerId
                );

        if (error) {
            throw error;
        }


        showToast(
            "Seller deleted successfully."
        );


        await loadSellers();

        await loadDashboardData();

    } catch (error) {

        console.error(
            "Seller delete error:",
            error
        );

        alert(
            "Could not delete seller.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   CUSTOMERS
   CUSTOMERS ARE STORED IN profiles
============================================================ */

let allCustomers = [];


/* ============================================================
   CUSTOMER NAME
============================================================ */

function customerName(customer) {

    return (
        customer.full_name ||
        customer.name ||
        customer.customer_name ||
        customer.username ||
        customer.display_name ||
        "Customer"
    );
}


/* ============================================================
   CUSTOMER EMAIL
============================================================ */

function customerEmail(customer) {

    return (
        customer.email ||
        customer.customer_email ||
        "-"
    );
}


/* ============================================================
   CUSTOMER PHONE
============================================================ */

function customerPhone(customer) {

    return (
        customer.phone ||
        customer.phone_number ||
        customer.customer_phone ||
        "-"
    );
}


/* ============================================================
   CUSTOMER CITY
============================================================ */

function customerCity(customer) {

    return (
        customer.city ||
        customer.customer_city ||
        customer.location ||
        "-"
    );
}


/* ============================================================
   CUSTOMER DATE
============================================================ */

function customerDate(customer) {

    return formatDate(
        customer.created_at ||
        customer.createdAt ||
        customer.date
    );
}


/* ============================================================
   LOAD CUSTOMERS
   FROM profiles WHERE role = customer
============================================================ */

async function loadCustomers() {

    const tbody =
        $("customersTableBody");

    if (!tbody) {
        return;
    }


    showTableMessage(
        "customersTableBody",
        "Loading customers...",
        6
    );


    try {

        console.log(
            "KHELZONE: Loading customers from profiles..."
        );


        const {
            data,
            error
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "role",
                    "customer"
                );


        if (error) {
            throw error;
        }


        allCustomers =
            Array.isArray(data)
                ? data
                : [];


        /* ----------------------------------------------------
           SORT NEWEST FIRST
        ---------------------------------------------------- */

        allCustomers.sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.created_at ||
                        a.createdAt ||
                        0
                    ).getTime();

                const dateB =
                    new Date(
                        b.created_at ||
                        b.createdAt ||
                        0
                    ).getTime();

                return dateB - dateA;
            }
        );


        console.log(
            "KHELZONE CUSTOMERS:",
            allCustomers
        );


        renderCustomers(
            allCustomers
        );

    } catch (error) {

        console.error(
            "Customers error:",
            error
        );

        showTableMessage(
            "customersTableBody",
            error?.message ||
            "Unable to load customers.",
            6
        );
    }
}


/* ============================================================
   RENDER CUSTOMERS
============================================================ */

function renderCustomers(customers) {

    const tbody =
        $("customersTableBody");

    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(customers) ||
        customers.length === 0
    ) {

        showTableMessage(
            "customersTableBody",
            "No customers found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        customers.map(
            customer => {

                const id =
                    customer.id || "";

                const name =
                    customerName(
                        customer
                    );

                const email =
                    customerEmail(
                        customer
                    );

                const phone =
                    customerPhone(
                        customer
                    );

                const city =
                    customerCity(
                        customer
                    );

                const date =
                    customerDate(
                        customer
                    );


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

                                <div
                                    style="
                                        width:36px;
                                        height:36px;
                                        min-width:36px;
                                        border-radius:50%;
                                        background:#ff5a00;
                                        color:#fff;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        font-weight:900;
                                        font-size:13px;
                                    "
                                >
                                    ${escapeHTML(
                                        initials(name)
                                    )}
                                </div>

                                <span
                                    style="
                                        font-weight:700;
                                        color:#fff;
                                    "
                                >
                                    ${escapeHTML(name)}
                                </span>

                            </div>

                        </td>


                        <td>
                            ${escapeHTML(email)}
                        </td>


                        <td>
                            ${escapeHTML(phone)}
                        </td>


                        <td>
                            ${escapeHTML(city)}
                        </td>


                        <td>
                            ${escapeHTML(date)}
                        </td>


                        <td>

                            <div
                                style="
                                    display:flex;
                                    gap:6px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    onclick="viewCustomer(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #333;
                                        background:#191919;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:700;
                                    "
                                >
                                    View
                                </button>


                                <button
                                    type="button"
                                    onclick="deleteCustomer(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #6b1f1f;
                                        background:#3a1515;
                                        color:#ff7777;
                                        cursor:pointer;
                                        font-weight:800;
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* ============================================================
   CUSTOMER SEARCH
============================================================ */

function initCustomerSearch() {

    const input =
        $("customerSearch");

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

                renderCustomers(
                    allCustomers
                );

                return;
            }


            const filtered =
                allCustomers.filter(
                    customer => {

                        return [

                            customer.full_name,

                            customer.name,

                            customer.customer_name,

                            customer.username,

                            customer.display_name,

                            customer.email,

                            customer.customer_email,

                            customer.phone,

                            customer.phone_number,

                            customer.customer_phone,

                            customer.city,

                            customer.customer_city,

                            customer.location

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
                            );
                    }
                );


            renderCustomers(
                filtered
            );
        }
    );
}


/* ============================================================
   VIEW CUSTOMER
============================================================ */

function viewCustomer(id) {

    const customer =
        allCustomers.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!customer) {

        alert(
            "Customer not found."
        );

        return;
    }


    alert(

        "CUSTOMER DETAILS\n\n" +

        "Name: " +
        customerName(customer) +

        "\nEmail: " +
        customerEmail(customer) +

        "\nPhone: " +
        customerPhone(customer) +

        "\nCity: " +
        customerCity(customer) +

        "\nRole: " +
        (
            customer.role ||
            "customer"
        ) +

        "\nDate: " +
        customerDate(customer)

    );
}


/* ============================================================
   DELETE CUSTOMER
   DELETE FROM profiles
============================================================ */

async function deleteCustomer(
    customerId
) {

    if (!customerId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this customer?\n\nThe customer profile will be permanently removed."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("profiles")
                .delete()
                .eq(
                    "id",
                    customerId
                )
                .eq(
                    "role",
                    "customer"
                );

        if (error) {
            throw error;
        }


        showToast(
            "Customer deleted successfully."
        );


        await loadCustomers();

        await loadDashboardData();

    } catch (error) {

        console.error(
            "Customer delete error:",
            error
        );

        alert(
            "Could not delete customer.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   ORDERS
============================================================ */

let allOrders = [];


/* ============================================================
   ORDER HELPERS
============================================================ */

function orderNumber(order) {

    return (
        order.order_number ||
        order.order_id ||
        order.id ||
        "-"
    );
}


function orderCustomer(order) {

    return (
        order.shipping_name ||
        order.customer_name ||
        order.customer_email ||
        order.user_email ||
        order.user_id ||
        "-"
    );
}


function orderTotal(order) {

    return (
        order.total ??
        order.total_amount ??
        order.amount ??
        order.grand_total ??
        0
    );
}


function orderDate(order) {

    return formatDate(
        order.created_at ||
        order.createdAt ||
        order.date
    );
}


/* ============================================================
   LOAD ORDERS
============================================================ */

async function loadOrders() {

    const tbody =
        $("ordersTableBody");

    if (!tbody) {
        return;
    }


    showTableMessage(
        "ordersTableBody",
        "Loading orders...",
        6
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("orders")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {
            throw error;
        }


        allOrders =
            Array.isArray(data)
                ? data
                : [];


        renderOrders(
            allOrders
        );

    } catch (error) {

        console.error(
            "Orders error:",
            error
        );

        showTableMessage(
            "ordersTableBody",
            error?.message ||
            "Unable to load orders.",
            6
        );
    }
}


/* ============================================================
   RENDER ORDERS
============================================================ */

function renderOrders(orders) {

    const tbody =
        $("ordersTableBody");

    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(orders) ||
        orders.length === 0
    ) {

        showTableMessage(
            "ordersTableBody",
            "No orders found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        orders.map(
            order => {

                const id =
                    order.id || "";

                const status =
                    String(
                        order.status ||
                        "pending"
                    ).toLowerCase();


                return `
                    <tr>

                        <td>
                            ${escapeHTML(
                                orderNumber(order)
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                orderCustomer(order)
                            )}
                        </td>


                        <td>
                            ${formatMoney(
                                orderTotal(order)
                            )}
                        </td>


                        <td>

                            <select
                                onchange="updateOrderStatus(
                                    '${escapeHTML(
                                        String(id)
                                    )}',
                                    this.value
                                )"
                                style="
                                    padding:7px 10px;
                                    border-radius:7px;
                                    border:1px solid #444;
                                    background:#191919;
                                    color:#fff;
                                    cursor:pointer;
                                    max-width:140px;
                                "
                            >

                                <option
                                    value="pending"
                                    ${status === "pending"
                                        ? "selected"
                                        : ""}
                                >
                                    Pending
                                </option>

                                <option
                                    value="confirmed"
                                    ${status === "confirmed"
                                        ? "selected"
                                        : ""}
                                >
                                    Confirmed
                                </option>

                                <option
                                    value="processing"
                                    ${status === "processing"
                                        ? "selected"
                                        : ""}
                                >
                                    Processing
                                </option>

                                <option
                                    value="shipped"
                                    ${status === "shipped"
                                        ? "selected"
                                        : ""}
                                >
                                    Shipped
                                </option>

                                <option
                                    value="delivered"
                                    ${status === "delivered"
                                        ? "selected"
                                        : ""}
                                >
                                    Delivered
                                </option>

                                <option
                                    value="cancelled"
                                    ${status === "cancelled"
                                        ? "selected"
                                        : ""}
                                >
                                    Cancelled
                                </option>

                            </select>

                        </td>


                        <td>
                            ${escapeHTML(
                                orderDate(order)
                            )}
                        </td>


                        <td>

                            <div
                                style="
                                    display:flex;
                                    gap:6px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    type="button"
                                    onclick="viewOrder(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #333;
                                        background:#191919;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:700;
                                    "
                                >
                                    View
                                </button>


                                <button
                                    type="button"
                                    onclick="deleteOrder(
                                        '${escapeHTML(
                                            String(id)
                                        )}'
                                    )"
                                    style="
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #6b1f1f;
                                        background:#3a1515;
                                        color:#ff7777;
                                        cursor:pointer;
                                        font-weight:800;
                                    "
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join("");
}


/* ============================================================
   ORDER SEARCH
============================================================ */

function initOrderSearch() {

    const input =
        $("orderSearch");

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

                        return [

                            order.order_number,

                            order.order_id,

                            order.id,

                            order.shipping_name,

                            order.customer_name,

                            order.customer_email,

                            order.user_email,

                            order.user_id,

                            order.status

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
                                    String(value)
                                        .toLowerCase()
                                        .includes(
                                            query
                                        )
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
   VIEW ORDER
============================================================ */

function viewOrder(id) {

    const order =
        allOrders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!order) {

        alert(
            "Order not found."
        );

        return;
    }


    alert(

        "ORDER DETAILS\n\n" +

        "Order ID: " +
        orderNumber(order) +

        "\nCustomer: " +
        orderCustomer(order) +

        "\nTotal: " +
        formatMoney(
            orderTotal(order)
        ) +

        "\nStatus: " +
        (
            order.status ||
            "-"
        ) +

        "\nDate: " +
        orderDate(order)

    );
}


/* ============================================================
   UPDATE ORDER STATUS
============================================================ */

async function updateOrderStatus(
    id,
    status
) {

    if (!id || !status) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .update({
                    status: status
                })
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        showToast(
            "Order status updated."
        );


        await loadOrders();

        await loadDashboardData();

    } catch (error) {

        console.error(
            "Order status error:",
            error
        );

        alert(
            "Could not update order status.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   DELETE ORDER
============================================================ */

async function deleteOrder(
    orderId
) {

    if (!orderId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Are you sure you want to delete this order?\n\nThis action cannot be undone."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .delete()
                .eq(
                    "id",
                    orderId
                );


        if (error) {
            throw error;
        }


        showToast(
            "Order deleted successfully."
        );


        await loadOrders();

        await loadDashboardData();

    } catch (error) {

        console.error(
            "Order delete error:",
            error
        );

        alert(
            "Could not delete order.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );
    }
}


/* ============================================================
   LOGOUT
============================================================ */

async function logoutAdmin() {

    try {

        localStorage.removeItem(
            "khelzone_role"
        );

        localStorage.removeItem(
            "khelzone_user_id"
        );


        if (supabaseClient) {

            const {
                error
            } =
                await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Supabase logout error:",
                    error
                );
            }
        }


        window.location.replace(
            "homepage.html"
        );

    } catch (error) {

        console.error(
            "Logout exception:",
            error
        );

        window.location.replace(
            "homepage.html"
        );
    }
}


/* ============================================================
   LOGOUT BUTTON
============================================================ */

function initLogout() {

    const button =
        $("logoutBtn");

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


            await logoutAdmin();
        }
    );
}


/* ============================================================
   KEYBOARD
============================================================ */

function initKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeMobileMenu();
            }
        }
    );
}


/* ============================================================
   SUPABASE AUTH STATE
============================================================ */

function initAuthListener() {

    if (!supabaseClient) {
        return;
    }


    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "KHELZONE AUTH EVENT:",
                event
            );


            if (
                event ===
                "SIGNED_OUT" ||
                !session
            ) {

                if (
                    window.location.pathname
                        .toLowerCase()
                        .includes("admin")
                ) {

                    window.location.replace(
                        "admin.html"
                    );
                }
            }
        }
    );
}


/* ============================================================
   EXPOSE GLOBAL FUNCTIONS
   REQUIRED FOR INLINE ONCLICK / ONCHANGE
============================================================ */

window.showSection =
    showSection;

window.openMobileMenu =
    openMobileMenu;

window.closeMobileMenu =
    closeMobileMenu;

window.toggleProduct =
    toggleProduct;

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

window.updateOrderStatus =
    updateOrderStatus;

window.deleteOrder =
    deleteOrder;

window.logoutAdmin =
    logoutAdmin;


/* ============================================================
   INITIALIZE ADMIN DASHBOARD
============================================================ */

async function initAdminDashboard() {

    console.log(
        "KHELZONE ADMIN DASHBOARD STARTING..."
    );


    /* --------------------------------------------------------
       CHECK ADMIN
    -------------------------------------------------------- */

    const isAdmin =
        await checkAdminAccess();


    if (!isAdmin) {
        return;
    }


    /* --------------------------------------------------------
       UI
    -------------------------------------------------------- */

    initNavigation();

    initMobileMenu();

    initLogout();

    initKeyboard();

    initAuthListener();


    /* --------------------------------------------------------
       SEARCH
    -------------------------------------------------------- */

    initProductSearch();

    initSellerSearch();

    initCustomerSearch();

    initOrderSearch();


    /* --------------------------------------------------------
       LOAD EVERYTHING
    -------------------------------------------------------- */

    await Promise.allSettled([

        loadDashboardData(),

        loadProducts(),

        loadSellers(),

        loadCustomers(),

        loadOrders()

    ]);


    /* --------------------------------------------------------
       DEFAULT PAGE
    -------------------------------------------------------- */

    showSection(
        "dashboardSection"
    );


    console.log(
        "KHELZONE ADMIN DASHBOARD READY."
    );
}


/* ============================================================
   START AFTER DOM READY
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initAdminDashboard
    );

} else {

    initAdminDashboard();
}