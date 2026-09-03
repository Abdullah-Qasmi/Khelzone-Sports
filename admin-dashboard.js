"use strict";

/* ============================================================
   KHELZONE ADMIN DASHBOARD
   FINAL VERSION
============================================================ */


/* ============================================================
   SUPABASE
============================================================ */

const SUPABASE_URL =
    "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";


if (
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
) {
    console.error("Supabase CDN is not loaded.");
    throw new Error(
        "Supabase is not loaded. Check the Supabase CDN script."
    );
}


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let currentAdmin = null;

let allProducts = [];
let allSellers = [];
let allCustomers = [];
let allOrders = [];


/* ============================================================
   HELPER
============================================================ */

function $(id) {
    return document.getElementById(id);
}


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


function formatMoney(value) {

    const number =
        Number(value) || 0;

    return "Rs. " +
        number.toLocaleString("en-PK");
}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
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


function showTableMessage(
    tableId,
    message,
    colspan
) {

    const tbody =
        $(tableId);

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td
                colspan="${colspan || 6}"
                style="
                    padding:30px;
                    text-align:center;
                    color:#888;
                "
            >
                ${escapeHTML(message)}
            </td>
        </tr>
    `;
}


/* ============================================================
   CHECKING SCREEN
============================================================ */

function hideCheckingScreen() {

    const screen =
        $("checkingScreen");

    if (screen) {
        screen.style.display = "none";
    }
}


function showCheckingScreen() {

    const screen =
        $("checkingScreen");

    if (screen) {
        screen.style.display = "flex";
    }
}


/* ============================================================
   DASHBOARD VISIBILITY
============================================================ */

function showDashboard() {

    const dashboard =
        $("dashboard");

    if (dashboard) {

        dashboard.classList.remove(
            "hidden"
        );

        dashboard.style.display =
            "block";
    }

    hideCheckingScreen();
}


function showAccessDenied(message) {

    const checking =
        $("checkingScreen");

    const denied =
        $("accessDenied");

    const dashboard =
        $("dashboard");


    if (dashboard) {

        dashboard.classList.add(
            "hidden"
        );

        dashboard.style.display =
            "none";
    }


    if (checking) {
        checking.style.display =
            "none";
    }


    if (denied) {

        denied.style.display =
            "flex";

        const text =
            denied.querySelector(
                ".access-text"
            );

        if (text && message) {

            text.textContent =
                message;
        }
    }
}


/* ============================================================
   ADMIN ACCESS CHECK
============================================================ */

async function checkAdminAccess() {

    console.log(
        "KHELZONE: checking admin access..."
    );

    showCheckingScreen();


    try {

        /* ----------------------------------------------------
           GET SESSION
        ---------------------------------------------------- */

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (sessionError) {

            console.error(
                "Session error:",
                sessionError
            );

            showAccessDenied(
                "Unable to check your session. Please login again."
            );

            return false;
        }


        const session =
            sessionData &&
            sessionData.session;


        const user =
            session &&
            session.user;


        /* ----------------------------------------------------
           NO USER
        ---------------------------------------------------- */

        if (!user) {

            console.log(
                "No logged-in user."
            );

            window.location.replace(
                "login.html"
            );

            return false;
        }


        console.log(
            "Logged in:",
            user.email
        );

        console.log(
            "User ID:",
            user.id
        );


        /* ----------------------------------------------------
           CHECK ADMINS TABLE
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

            console.error(
                "Admin query error:",
                adminError
            );

            showAccessDenied(
                "Admin access could not be verified. Check the admins table and RLS policies."
            );

            return false;
        }


        /* ----------------------------------------------------
           NOT ADMIN
        ---------------------------------------------------- */

        if (!admin) {

            console.log(
                "User is NOT an admin."
            );

            showAccessDenied(
                "This account does not have admin access."
            );

            return false;
        }


        /* ----------------------------------------------------
           ADMIN VERIFIED
        ---------------------------------------------------- */

        console.log(
            "ADMIN ACCESS GRANTED"
        );


        currentAdmin =
            user;


        localStorage.setItem(
            "khelzone_role",
            "admin"
        );

        localStorage.setItem(
            "khelzone_user_id",
            user.id
        );

        localStorage.setItem(
            "khelzone_email",
            user.email || ""
        );


        const adminName =
            $("adminName");

        const adminEmail =
            $("adminEmail");


        if (adminName) {

            adminName.textContent =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                "Admin";
        }


        if (adminEmail) {

            adminEmail.textContent =
                user.email || "-";
        }


        showDashboard();


        /*
           Dashboard data load karo,
           lekin kisi ek table ki error se
           dashboard lock nahi hoga.
        */

        await loadDashboard();


        return true;


    } catch (error) {

        console.error(
            "Admin access error:",
            error
        );

        showAccessDenied(
            error?.message ||
            "Something went wrong while checking admin access."
        );

        return false;
    }
}


/* ============================================================
   LOAD DASHBOARD
============================================================ */

async function loadDashboard() {

    console.log(
        "Loading dashboard data..."
    );


    await Promise.allSettled([
        loadDashboardCounts(),
        loadProducts(),
        loadSellers(),
        loadCustomers(),
        loadOrders()
    ]);


    console.log(
        "Dashboard data loaded."
    );
}


/* ============================================================
   NAVIGATION
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


function showSection(sectionId) {

    console.log(
        "Opening section:",
        sectionId
    );


    /* --------------------------------------------------------
       HIDE ALL SECTIONS
    -------------------------------------------------------- */

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

            section.style.display =
                "none";
        });


    /* --------------------------------------------------------
       FIND TARGET
    -------------------------------------------------------- */

    const target =
        document.getElementById(
            sectionId
        );


    if (!target) {

        console.error(
            "Section not found:",
            sectionId
        );

        return;
    }


    /* --------------------------------------------------------
       SHOW TARGET
    -------------------------------------------------------- */

    target.classList.add(
        "active"
    );

    target.style.display =
        "block";


    /* --------------------------------------------------------
       ACTIVE SIDEBAR
    -------------------------------------------------------- */

    document
        .querySelectorAll(
            ".sidebar-link[data-section]"
        )
        .forEach(link => {

            if (
                link.dataset.section ===
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
        });


    /* --------------------------------------------------------
       PAGE TITLE
    -------------------------------------------------------- */

    const pageTitle =
        $("pageTitle");

    if (pageTitle) {

        pageTitle.textContent =
            sectionTitles[sectionId] ||
            "Dashboard";
    }


    /* --------------------------------------------------------
       LOAD DATA
    -------------------------------------------------------- */

    if (
        sectionId ===
        "productsSection"
    ) {

        loadProducts();
    }


    if (
        sectionId ===
        "sellersSection"
    ) {

        loadSellers();
    }


    if (
        sectionId ===
        "customersSection"
    ) {

        loadCustomers();
    }


    if (
        sectionId ===
        "ordersSection"
    ) {

        loadOrders();
    }


    closeMobileMenu();
}


/* ============================================================
   INIT NAVIGATION
============================================================ */

function initNavigation() {

    const links =
        document.querySelectorAll(
            ".sidebar-link[data-section]"
        );


    links.forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();

                const section =
                    this.dataset.section;

                if (!section) {
                    return;
                }

                showSection(
                    section
                );
            }
        );
    });
}


/* ============================================================
   MOBILE MENU
============================================================ */

function openMobileMenu() {

    const sidebar =
        $("sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.add(
        "mobile-open"
    );
}


function closeMobileMenu() {

    const sidebar =
        $("sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.remove(
        "mobile-open"
    );
}


function initMobileMenu() {

    const button =
        $("mobileMenuBtn");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            const sidebar =
                $("sidebar");

            if (!sidebar) {
                return;
            }


            if (
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
   LOGOUT
============================================================ */

async function logout() {

    console.log(
        "Logging out..."
    );


    try {

        const {
            error
        } =
            await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );
        }

    } catch (error) {

        console.error(
            "Logout exception:",
            error
        );
    }


    localStorage.removeItem(
        "khelzone_role"
    );

    localStorage.removeItem(
        "khelzone_user_id"
    );

    localStorage.removeItem(
        "khelzone_email"
    );


    window.location.replace(
        "login.html"
    );
}


function initLogout() {

    const button =
        $("logoutBtn");

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            logout();
        }
    );
}


/* ============================================================
   DASHBOARD COUNTS
============================================================ */

async function loadDashboardCounts() {

    /* --------------------------------------------------------
       PRODUCTS
    -------------------------------------------------------- */

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("products")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                "Products count:",
                error
            );

        } else {

            setCount(
                "productCount",
                count
            );
        }

    } catch (error) {

        console.error(
            "Product count failed:",
            error
        );
    }


    /* --------------------------------------------------------
       SELLERS
    -------------------------------------------------------- */

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("sellers")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                "Sellers count:",
                error
            );

        } else {

            setCount(
                "sellerCount",
                count
            );
        }

    } catch (error) {

        console.error(
            "Seller count failed:",
            error
        );
    }


    /* --------------------------------------------------------
       CUSTOMERS
    -------------------------------------------------------- */

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("customers")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                "Customers count:",
                error
            );

        } else {

            setCount(
                "customerCount",
                count
            );
        }

    } catch (error) {

        console.error(
            "Customer count failed:",
            error
        );
    }


    /* --------------------------------------------------------
       ORDERS
    -------------------------------------------------------- */

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from("orders")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.error(
                "Orders count:",
                error
            );

        } else {

            setCount(
                "orderCount",
                count
            );
        }

    } catch (error) {

        console.error(
            "Order count failed:",
            error
        );
    }
}


function setCount(
    id,
    value
) {

    const element =
        $(id);

    if (element) {

        element.textContent =
            value ?? 0;
    }
}


/* ============================================================
   PRODUCTS
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

            console.error(
                "Products error:",
                error
            );

            allProducts = [];

            showTableMessage(
                "productsTableBody",
                "Unable to load products.",
                6
            );

            return;
        }


        allProducts =
            data || [];


        renderProducts(
            allProducts
        );


        setCount(
            "productCount",
            allProducts.length
        );


    } catch (error) {

        console.error(
            "Products exception:",
            error
        );

        showTableMessage(
            "productsTableBody",
            "Error loading products.",
            6
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
        $("productsTableBody");

    if (!tbody) {
        return;
    }


    if (
        !products ||
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
        products.map(product => {

            const name =
                product.name ||
                "Unnamed Product";


            const category =
                product.category ||
                product.sport ||
                "-";


            const seller =
                product.seller_name ||
                product.brand ||
                "-";


            const price =
                product.price || 0;


            const active =
                product.is_active !== false;


            return `
                <tr>

                    <td>
                        <div style="font-weight:800;color:white;">
                            ${escapeHTML(name)}
                        </div>
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

                        ${
                            active
                            ?
                            `
                            <span
                                style="
                                    color:#4ade80;
                                    font-weight:800;
                                "
                            >
                                Active
                            </span>
                            `
                            :
                            `
                            <span
                                style="
                                    color:#f87171;
                                    font-weight:800;
                                "
                            >
                                Inactive
                            </span>
                            `
                        }

                    </td>

                    <td>

                        <button
                            type="button"
                            class="product-toggle-btn"
                            data-id="${escapeHTML(product.id)}"
                            data-active="${active}"
                            style="
                                padding:8px 12px;
                                border:1px solid #333;
                                border-radius:8px;
                                background:#171717;
                                color:white;
                                cursor:pointer;
                                font-weight:700;
                            "
                        >
                            ${
                                active
                                ? "Disable"
                                : "Enable"
                            }
                        </button>

                    </td>

                </tr>
            `;

        }).join("");


    tbody
        .querySelectorAll(
            ".product-toggle-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async function() {

                    const id =
                        this.dataset.id;

                    const active =
                        this.dataset.active ===
                        "true";


                    await toggleProduct(
                        id,
                        !active
                    );
                }
            );
        });
}


/* ============================================================
   TOGGLE PRODUCT
============================================================ */

async function toggleProduct(
    productId,
    active
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
                        active
                })
                .eq(
                    "id",
                    productId
                );


        if (error) {

            console.error(
                "Product update:",
                error
            );

            alert(
                "Unable to update product."
            );

            return;
        }


        await loadProducts();


    } catch (error) {

        console.error(
            "Product update failed:",
            error
        );

        alert(
            "Something went wrong."
        );
    }
}


/* ============================================================
   PRODUCT SEARCH
============================================================ */

function filterProducts(
    value
) {

    const query =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!query) {

        renderProducts(
            allProducts
        );

        return;
    }


    const filtered =
        allProducts.filter(product => {

            const name =
                String(
                    product.name || ""
                )
                .toLowerCase();


            const category =
                String(
                    product.category ||
                    product.sport ||
                    ""
                )
                .toLowerCase();


            const brand =
                String(
                    product.brand || ""
                )
                .toLowerCase();


            return (
                name.includes(query) ||
                category.includes(query) ||
                brand.includes(query)
            );
        });


    renderProducts(
        filtered
    );
}


/* ============================================================
   SELLERS
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

            console.error(
                "Sellers error:",
                error
            );

            allSellers = [];

            showTableMessage(
                "sellersTableBody",
                "Unable to load sellers.",
                6
            );

            return;
        }


        allSellers =
            data || [];


        renderSellers(
            allSellers
        );


        setCount(
            "sellerCount",
            allSellers.length
        );


    } catch (error) {

        console.error(
            "Sellers exception:",
            error
        );

        showTableMessage(
            "sellersTableBody",
            "Error loading sellers.",
            6
        );
    }
}


/* ============================================================
   RENDER SELLERS
============================================================ */

function renderSellers(
    sellers
) {

    const tbody =
        $("sellersTableBody");

    if (!tbody) {
        return;
    }


    if (
        !sellers ||
        sellers.length === 0
    ) {

        showTableMessage(
            "sellersTableBody",
            "No seller applications found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        sellers.map(seller => {

            const business =
                seller.business_name ||
                "-";


            const owner =
                seller.owner_name ||
                "-";


            const email =
                seller.email ||
                "-";


            const phone =
                seller.phone ||
                "-";


            const status =
                String(
                    seller.status ||
                    "pending"
                )
                .toLowerCase();


            let statusHTML;


            if (
                status ===
                "approved"
            ) {

                statusHTML = `
                    <span
                        style="
                            color:#4ade80;
                            font-weight:800;
                        "
                    >
                        Approved
                    </span>
                `;

            } else if (
                status ===
                "rejected"
            ) {

                statusHTML = `
                    <span
                        style="
                            color:#f87171;
                            font-weight:800;
                        "
                    >
                        Rejected
                    </span>
                `;

            } else {

                statusHTML = `
                    <span
                        style="
                            color:#facc15;
                            font-weight:800;
                        "
                    >
                        Pending
                    </span>
                `;
            }


            return `
                <tr>

                    <td>
                        <div style="font-weight:800;color:white;">
                            ${escapeHTML(business)}
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(owner)}
                    </td>

                    <td>
                        ${escapeHTML(email)}
                    </td>

                    <td>
                        ${escapeHTML(phone)}
                    </td>

                    <td>
                        ${statusHTML}
                    </td>

                    <td>

                        <div
                            style="
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                            "
                        >

                            ${
                                status !== "approved"
                                ?
                                `
                                <button
                                    type="button"
                                    class="approve-seller-btn"
                                    data-id="${escapeHTML(seller.id)}"
                                    style="
                                        padding:8px 12px;
                                        border:0;
                                        border-radius:8px;
                                        background:#166534;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:800;
                                    "
                                >
                                    Approve
                                </button>
                                `
                                :
                                ""
                            }


                            ${
                                status !== "rejected"
                                ?
                                `
                                <button
                                    type="button"
                                    class="reject-seller-btn"
                                    data-id="${escapeHTML(seller.id)}"
                                    style="
                                        padding:8px 12px;
                                        border:0;
                                        border-radius:8px;
                                        background:#991b1b;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:800;
                                    "
                                >
                                    Reject
                                </button>
                                `
                                :
                                ""
                            }

                        </div>

                    </td>

                </tr>
            `;

        }).join("");


    /* --------------------------------------------------------
       APPROVE
    -------------------------------------------------------- */

    tbody
        .querySelectorAll(
            ".approve-seller-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async function() {

                    await updateSellerStatus(
                        this.dataset.id,
                        "approved"
                    );
                }
            );
        });


    /* --------------------------------------------------------
       REJECT
    -------------------------------------------------------- */

    tbody
        .querySelectorAll(
            ".reject-seller-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async function() {

                    await updateSellerStatus(
                        this.dataset.id,
                        "rejected"
                    );
                }
            );
        });
}


/* ============================================================
   UPDATE SELLER STATUS
============================================================ */

async function updateSellerStatus(
    sellerId,
    newStatus
) {

    if (!sellerId) {
        return;
    }


    const action =
        newStatus === "approved"
            ? "approve"
            : "reject";


    if (
        !confirm(
            `Are you sure you want to ${action} this seller?`
        )
    ) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("sellers")
                .update({
                    status:
                        newStatus,

                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    sellerId
                );


        if (error) {

            console.error(
                "Seller update error:",
                error
            );

            alert(
                "Unable to update seller status."
            );

            return;
        }


        alert(
            newStatus === "approved"
                ? "Seller approved successfully!"
                : "Seller rejected successfully!"
        );


        await loadSellers();

        await loadDashboardCounts();


    } catch (error) {

        console.error(
            "Seller status error:",
            error
        );

        alert(
            "Something went wrong."
        );
    }
}


/* ============================================================
   SELLER SEARCH
============================================================ */

function filterSellers(
    value
) {

    const query =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!query) {

        renderSellers(
            allSellers
        );

        return;
    }


    const filtered =
        allSellers.filter(seller => {

            const business =
                String(
                    seller.business_name || ""
                )
                .toLowerCase();


            const owner =
                String(
                    seller.owner_name || ""
                )
                .toLowerCase();


            const email =
                String(
                    seller.email || ""
                )
                .toLowerCase();


            const phone =
                String(
                    seller.phone || ""
                )
                .toLowerCase();


            return (
                business.includes(query) ||
                owner.includes(query) ||
                email.includes(query) ||
                phone.includes(query)
            );
        });


    renderSellers(
        filtered
    );
}


/* ============================================================
   CUSTOMERS
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
        4
    );


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("customers")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Customers error:",
                error
            );

            allCustomers = [];

            showTableMessage(
                "customersTableBody",
                "Customers table is not available yet.",
                4
            );

            return;
        }


        allCustomers =
            data || [];


        renderCustomers(
            allCustomers
        );


        setCount(
            "customerCount",
            allCustomers.length
        );


    } catch (error) {

        console.error(
            "Customers exception:",
            error
        );

        showTableMessage(
            "customersTableBody",
            "Error loading customers.",
            4
        );
    }
}


/* ============================================================
   RENDER CUSTOMERS
============================================================ */

function renderCustomers(
    customers
) {

    const tbody =
        $("customersTableBody");

    if (!tbody) {
        return;
    }


    if (
        !customers ||
        customers.length === 0
    ) {

        showTableMessage(
            "customersTableBody",
            "No customers found.",
            4
        );

        return;
    }


    tbody.innerHTML =
        customers.map(customer => {

            const name =
                customer.full_name ||
                customer.name ||
                customer.username ||
                "Customer";


            const email =
                customer.email ||
                "-";


            const phone =
                customer.phone ||
                customer.phone_number ||
                "-";


            return `
                <tr>

                    <td>
                        <div style="font-weight:800;color:white;">
                            ${escapeHTML(name)}
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(email)}
                    </td>

                    <td>
                        ${escapeHTML(phone)}
                    </td>

                    <td>
                        <span
                            style="
                                color:#60a5fa;
                                font-weight:800;
                            "
                        >
                            Customer
                        </span>
                    </td>

                </tr>
            `;

        }).join("");
}


/* ============================================================
   CUSTOMER SEARCH
============================================================ */

function filterCustomers(
    value
) {

    const query =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!query) {

        renderCustomers(
            allCustomers
        );

        return;
    }


    const filtered =
        allCustomers.filter(customer => {

            const name =
                String(
                    customer.full_name ||
                    customer.name ||
                    customer.username ||
                    ""
                )
                .toLowerCase();


            const email =
                String(
                    customer.email || ""
                )
                .toLowerCase();


            const phone =
                String(
                    customer.phone ||
                    customer.phone_number ||
                    ""
                )
                .toLowerCase();


            return (
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query)
            );
        });


    renderCustomers(
        filtered
    );
}


/* ============================================================
   ORDERS
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

            console.error(
                "Orders error:",
                error
            );

            allOrders = [];

            showTableMessage(
                "ordersTableBody",
                "Orders table is not available yet.",
                6
            );

            return;
        }


        allOrders =
            data || [];


        renderOrders(
            allOrders
        );


        setCount(
            "orderCount",
            allOrders.length
        );


    } catch (error) {

        console.error(
            "Orders exception:",
            error
        );

        showTableMessage(
            "ordersTableBody",
            "Error loading orders.",
            6
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
        $("ordersTableBody");

    if (!tbody) {
        return;
    }


    if (
        !orders ||
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
        orders.map(order => {

            const orderId =
                order.id ||
                order.order_id ||
                "-";


            const customer =
                order.customer_name ||
                order.full_name ||
                order.customer ||
                "Customer";


            const total =
                order.total ||
                order.total_amount ||
                order.amount ||
                0;


            const status =
                String(
                    order.status ||
                    "pending"
                )
                .toLowerCase();


            return `
                <tr>

                    <td>
                        <span
                            style="
                                color:#ff5a00;
                                font-weight:800;
                                font-family:monospace;
                            "
                        >
                            ${escapeHTML(
                                String(orderId)
                                    .substring(0, 16)
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(customer)}
                    </td>

                    <td>
                        ${formatMoney(total)}
                    </td>

                    <td>
                        <span
                            style="
                                font-weight:800;
                                text-transform:capitalize;
                            "
                        >
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>
                        ${formatDate(
                            order.created_at
                        )}
                    </td>

                    <td>
                        -
                    </td>

                </tr>
            `;

        }).join("");
}


/* ============================================================
   ORDER SEARCH
============================================================ */

function filterOrders(
    value
) {

    const query =
        String(value || "")
            .trim()
            .toLowerCase();


    if (!query) {

        renderOrders(
            allOrders
        );

        return;
    }


    const filtered =
        allOrders.filter(order => {

            const id =
                String(
                    order.id ||
                    order.order_id ||
                    ""
                )
                .toLowerCase();


            const customer =
                String(
                    order.customer_name ||
                    order.full_name ||
                    order.customer ||
                    ""
                )
                .toLowerCase();


            const status =
                String(
                    order.status ||
                    ""
                )
                .toLowerCase();


            return (
                id.includes(query) ||
                customer.includes(query) ||
                status.includes(query)
            );
        });


    renderOrders(
        filtered
    );
}


/* ============================================================
   SEARCH INITIALIZATION
============================================================ */

function initSearch() {

    const productSearch =
        $("productSearch");

    if (productSearch) {

        productSearch.addEventListener(
            "input",
            function() {

                filterProducts(
                    this.value
                );
            }
        );
    }


    const sellerSearch =
        $("sellerSearch");

    if (sellerSearch) {

        sellerSearch.addEventListener(
            "input",
            function() {

                filterSellers(
                    this.value
                );
            }
        );
    }


    const customerSearch =
        $("customerSearch");

    if (customerSearch) {

        customerSearch.addEventListener(
            "input",
            function() {

                filterCustomers(
                    this.value
                );
            }
        );
    }


    const orderSearch =
        $("orderSearch");

    if (orderSearch) {

        orderSearch.addEventListener(
            "input",
            function() {

                filterOrders(
                    this.value
                );
            }
        );
    }
}


/* ============================================================
   AUTH STATE
============================================================ */

function initAuthListener() {

    supabaseClient.auth.onAuthStateChange(
        function(event, session) {

            console.log(
                "Auth event:",
                event
            );


            if (
                event ===
                "SIGNED_OUT"
            ) {

                localStorage.removeItem(
                    "khelzone_role"
                );

                localStorage.removeItem(
                    "khelzone_user_id"
                );

                localStorage.removeItem(
                    "khelzone_email"
                );


                window.location.replace(
                    "login.html"
                );
            }
        }
    );
}


/* ============================================================
   KEYBOARD
============================================================ */

function initKeyboard() {

    document.addEventListener(
        "keydown",
        function(event) {

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
   START DASHBOARD
============================================================ */

async function startAdminDashboard() {

    console.log(
        "================================"
    );

    console.log(
        "KHELZONE ADMIN DASHBOARD"
    );

    console.log(
        "Starting..."
    );

    console.log(
        "================================"
    );


    initNavigation();

    initMobileMenu();

    initLogout();

    initSearch();

    initAuthListener();

    initKeyboard();


    /*
       IMPORTANT:
       HTML IDs are:
       dashboardSection
       productsSection
       sellersSection
       customersSection
       ordersSection
    */

    showSection(
        "dashboardSection"
    );


    /*
       Finally check admin.
    */

    await checkAdminAccess();


    console.log(
        "KHELZONE ADMIN DASHBOARD READY."
    );
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
        function() {

            startAdminDashboard();

        }
    );

} else {

    startAdminDashboard();
}