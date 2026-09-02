/* ============================================================
   KHELZONE ADMIN DASHBOARD
   ADMIN-ONLY ACCESS CONTROL
============================================================ */

"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const supabaseClient = window.supabaseClient;


/* ============================================================
   HELPERS
============================================================ */

function $(id) {
    return document.getElementById(id);
}


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


function formatMoney(value) {

    const number = Number(value || 0);

    return "Rs. " + number.toLocaleString("en-PK");
}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    try {

        return new Date(value).toLocaleDateString(
            "en-PK",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    } catch {
        return value;
    }
}


function initials(name) {

    if (!name) {
        return "U";
    }

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(x => x.charAt(0).toUpperCase())
        .join("");
}


/* ============================================================
   TABLE HELPER
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
                    padding:30px;
                    color:#888;
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

        toast = document.createElement("div");

        toast.id = "kzToast";

        toast.style.position = "fixed";
        toast.style.right = "20px";
        toast.style.bottom = "20px";
        toast.style.zIndex = "999999";
        toast.style.padding = "14px 20px";
        toast.style.borderRadius = "10px";
        toast.style.background = "#ff5a00";
        toast.style.color = "#fff";
        toast.style.fontWeight = "700";
        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.4)";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.style.display = "block";

    clearTimeout(window.kzToastTimer);

    window.kzToastTimer = setTimeout(() => {

        toast.style.display = "none";

    }, 3000);
}


/* ============================================================
   🔐 ADMIN ACCESS CHECK
============================================================ */

async function checkAdminAccess() {

    const checkingScreen = $("checkingScreen");
    const dashboard = $("dashboard");
    const accessDenied = $("accessDenied");

    /*
        SECURITY FIRST:
        Dashboard remains hidden until admin is verified.
    */

    if (dashboard) {
        dashboard.classList.add("hidden");
    }

    if (accessDenied) {
        accessDenied.style.display = "none";
    }

    if (checkingScreen) {
        checkingScreen.style.display = "flex";
    }


    try {

        /* -----------------------------------------
           1. CHECK LOGIN
        ----------------------------------------- */

        const {
            data: {
                user
            },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError) {

            console.error(
                "Supabase user error:",
                userError
            );

            throw userError;
        }


        /*
            No logged-in user.

            Send to admin login page.
        */

        if (!user) {

            window.location.replace("admin.html");

            return false;
        }


        /* -----------------------------------------
           2. CHECK ADMIN TABLE
        ----------------------------------------- */

        const {
            data: admin,
            error: adminError
        } = await supabaseClient
            .from("admins")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();


        if (adminError) {

            console.error(
                "Admin table error:",
                adminError
            );

            throw adminError;
        }


        /*
            IMPORTANT:

            User is NOT in admins table.

            Do NOT logout the customer/seller.
            Just deny dashboard access.
        */

        if (!admin) {

            console.warn(
                "ACCESS DENIED:",
                user.id
            );

            if (checkingScreen) {
                checkingScreen.style.display = "none";
            }

            if (dashboard) {
                dashboard.classList.add("hidden");
            }

            if (accessDenied) {

                accessDenied.style.display = "flex";

            } else {

                window.location.replace("homepage.html");
            }

            return false;
        }


        /* -----------------------------------------
           3. ADMIN VERIFIED
        ----------------------------------------- */

        console.log(
            "KHELZONE ADMIN VERIFIED:",
            user.id
        );


        /*
            Store only non-sensitive UI info.
        */

        localStorage.setItem(
            "khelzone_role",
            "admin"
        );

        localStorage.setItem(
            "khelzone_user_id",
            user.id
        );


        /* -----------------------------------------
           4. ADMIN NAME / EMAIL
        ----------------------------------------- */

        const adminName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Admin";

        const adminEmail =
            user.email || "-";


        if ($("adminName")) {

            $("adminName").textContent =
                adminName;
        }


        if ($("adminEmail")) {

            $("adminEmail").textContent =
                adminEmail;
        }


        /* -----------------------------------------
           5. SHOW DASHBOARD
        ----------------------------------------- */

        if (checkingScreen) {

            checkingScreen.style.display =
                "none";
        }


        if (accessDenied) {

            accessDenied.style.display =
                "none";
        }


        if (dashboard) {

            dashboard.classList.remove("hidden");
        }


        return true;


    } catch (error) {

        console.error(
            "KHELZONE Admin Access Error:",
            error
        );


        if (checkingScreen) {

            checkingScreen.style.display =
                "none";
        }


        if (dashboard) {

            dashboard.classList.add("hidden");
        }


        if (accessDenied) {

            accessDenied.innerHTML = `

                <div class="access-box">

                    <div class="access-icon">
                        ⚠️
                    </div>

                    <div class="access-title">
                        ACCESS ERROR
                    </div>

                    <div class="access-text">
                        We could not verify your admin
                        permissions. Please try again.
                    </div>

                    <button
                        onclick="location.reload()"
                        class="home-btn"
                        style="border:0;cursor:pointer;"
                    >
                        TRY AGAIN
                    </button>

                </div>

            `;

            accessDenied.style.display =
                "flex";

        }

        return false;
    }
}


/* ============================================================
   NAVIGATION
============================================================ */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(section => {

        section.classList.remove("active");

    });


    const target =
        $(sectionId);

    if (target) {

        target.classList.add("active");
    }


    const links =
        document.querySelectorAll(".sidebar-link");

    links.forEach(link => {

        link.classList.remove("active");

    });


    const activeLink =
        document.querySelector(
            `[data-section="${sectionId}"]`
        );

    if (activeLink) {

        activeLink.classList.add("active");
    }


    const titles = {

        dashboardSection: "Dashboard",

        productsSection: "Products",

        sellersSection: "Sellers",

        customersSection: "Customers",

        ordersSection: "Orders"

    };


    if ($("pageTitle")) {

        $("pageTitle").textContent =
            titles[sectionId] || "Dashboard";
    }


    closeMobileMenu();
}


function initNavigation() {

    document
        .querySelectorAll(".sidebar-link")
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    const section =
                        link.dataset.section;

                    if (section) {

                        showSection(section);
                    }
                }
            );

        });
}


/* ============================================================
   MOBILE MENU
============================================================ */

function openMobileMenu() {

    const sidebar = $("sidebar");

    if (sidebar) {

        sidebar.classList.add(
            "mobile-open"
        );
    }
}


function closeMobileMenu() {

    const sidebar = $("sidebar");

    if (sidebar) {

        sidebar.classList.remove(
            "mobile-open"
        );
    }
}


function initMobileMenu() {

    const btn = $("mobileMenuBtn");

    if (btn) {

        btn.addEventListener(
            "click",
            openMobileMenu
        );
    }


    document
        .querySelectorAll(".sidebar-link")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });
}


/* ============================================================
   COUNT HELPER
============================================================ */

async function safeCount(tableName) {

    try {

        const {
            count,
            error
        } = await supabaseClient
            .from(tableName)
            .select("*", {
                count: "exact",
                head: true
            });


        if (error) {

            console.warn(
                `Count error for ${tableName}:`,
                error
            );

            return 0;
        }


        return count || 0;

    } catch {

        return 0;
    }
}


async function loadDashboardData() {

    const [
        products,
        sellers,
        customers,
        orders
    ] = await Promise.all([

        safeCount("products"),

        safeCount("sellers"),

        safeCount("customers"),

        safeCount("orders")

    ]);


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
        } = await supabaseClient
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
            data || [];


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
            "Unable to load products.",
            6
        );
    }
}


function renderProducts(products) {

    const tbody =
        $("productsTableBody");

    if (!tbody) {
        return;
    }


    if (!products.length) {

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
                product.title ||
                "Unnamed Product";

            const price =
                product.price || 0;

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

                        <button
                            onclick="toggleProduct('${product.id}', ${active})"
                            style="
                                padding:8px 12px;
                                border-radius:7px;
                                border:1px solid #333;
                                background:#191919;
                                color:white;
                                cursor:pointer;
                            "
                        >
                            ${active
                                ? "Disable"
                                : "Enable"}
                        </button>

                    </td>

                </tr>

            `;

        }).join("");
}


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

                            product.seller_email

                        ]
                            .filter(Boolean)
                            .some(value =>
                                String(value)
                                    .toLowerCase()
                                    .includes(query)
                            );
                    }
                );


            renderProducts(
                filtered
            );
        }
    );
}


async function toggleProduct(
    productId,
    currentStatus
) {

    try {

        const {
            error
        } = await supabaseClient
            .from("products")
            .update({
                is_active: !currentStatus
            })
            .eq("id", productId);


        if (error) {
            throw error;
        }


        showToast(
            "Product status updated."
        );


        await loadProducts();

        await loadDashboardData();


    } catch (error) {

        console.error(error);

        alert(
            "Could not update product."
        );
    }
}


/* ============================================================
   SELLERS
============================================================ */

let allSellers = [];


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
        } = await supabaseClient
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
            data || [];


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
            "Unable to load sellers.",
            6
        );
    }
}


function renderSellers(sellers) {

    const tbody =
        $("sellersTableBody");

    if (!tbody) {
        return;
    }


    if (!sellers.length) {

        showTableMessage(
            "sellersTableBody",
            "No sellers found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        sellers.map(seller => {

            const business =
                seller.business_name ||
                seller.shop_name ||
                seller.store_name ||
                "-";

            const owner =
                seller.owner_name ||
                seller.name ||
                "-";

            const email =
                seller.email ||
                "-";

            const phone =
                seller.phone ||
                seller.phone_number ||
                "-";

            const status =
                seller.status ||
                "pending";


            return `

                <tr>

                    <td>
                        ${escapeHTML(business)}
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
                        ${escapeHTML(status)}
                    </td>

                    <td>

                        <button
                            onclick="viewSeller('${seller.id}')"
                            style="
                                padding:8px 12px;
                                border-radius:7px;
                                border:1px solid #333;
                                background:#191919;
                                color:white;
                                cursor:pointer;
                            "
                        >
                            View
                        </button>

                    </td>

                </tr>

            `;

        }).join("");
}


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

                            seller.business_name,

                            seller.shop_name,

                            seller.owner_name,

                            seller.name,

                            seller.email,

                            seller.phone

                        ]
                            .filter(Boolean)
                            .some(value =>
                                String(value)
                                    .toLowerCase()
                                    .includes(query)
                            );
                    }
                );


            renderSellers(
                filtered
            );
        }
    );
}


function viewSeller(id) {

    const seller =
        allSellers.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!seller) {
        return;
    }


    alert(
        "Seller\n\n" +
        "Business: " +
        (
            seller.business_name ||
            seller.shop_name ||
            "-"
        ) +
        "\nOwner: " +
        (
            seller.owner_name ||
            seller.name ||
            "-"
        ) +
        "\nEmail: " +
        (
            seller.email ||
            "-"
        ) +
        "\nPhone: " +
        (
            seller.phone ||
            "-"
        )
    );
}


async function updateSellerStatus(
    id,
    status
) {

    try {

        const {
            error
        } = await supabaseClient
            .from("sellers")
            .update({
                status: status
            })
            .eq("id", id);


        if (error) {
            throw error;
        }


        showToast(
            "Seller status updated."
        );


        await loadSellers();


    } catch (error) {

        console.error(error);

        alert(
            "Could not update seller."
        );
    }
}


/* ============================================================
   CUSTOMERS
============================================================ */

let allCustomers = [];


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
        } = await supabaseClient
            .from("customers")
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


        allCustomers =
            data || [];


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
            "Unable to load customers.",
            4
        );
    }
}


function customerName(customer) {

    return (
        customer.name ||
        customer.full_name ||
        customer.username ||
        "Customer"
    );
}


function customerPhone(customer) {

    return (
        customer.phone ||
        customer.phone_number ||
        "-"
    );
}


function renderCustomers(customers) {

    const tbody =
        $("customersTableBody");

    if (!tbody) {
        return;
    }


    if (!customers.length) {

        showTableMessage(
            "customersTableBody",
            "No customers found.",
            4
        );

        return;
    }


    tbody.innerHTML =
        customers.map(customer => {

            return `

                <tr>

                    <td>
                        ${escapeHTML(
                            customerName(customer)
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.email || "-"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customerPhone(customer)
                        )}
                    </td>

                    <td>

                        <button
                            onclick="viewCustomer('${customer.id}')"
                            style="
                                padding:8px 12px;
                                border-radius:7px;
                                border:1px solid #333;
                                background:#191919;
                                color:white;
                                cursor:pointer;
                            "
                        >
                            View
                        </button>

                    </td>

                </tr>

            `;

        }).join("");
}


function viewCustomer(id) {

    const customer =
        allCustomers.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!customer) {
        return;
    }


    alert(
        "Customer\n\n" +
        "Name: " +
        customerName(customer) +
        "\nEmail: " +
        (
            customer.email ||
            "-"
        ) +
        "\nPhone: " +
        customerPhone(customer)
    );
}


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

                            customer.name,

                            customer.full_name,

                            customer.username,

                            customer.email,

                            customer.phone

                        ]
                            .filter(Boolean)
                            .some(value =>
                                String(value)
                                    .toLowerCase()
                                    .includes(query)
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
   ORDERS
============================================================ */

let allOrders = [];


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
        } = await supabaseClient
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
            data || [];


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
            "Unable to load orders.",
            6
        );
    }
}


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
        order.customer_name ||
        order.customer_email ||
        order.user_email ||
        "-"
    );
}


function orderTotal(order) {

    return (
        order.total ||
        order.total_amount ||
        order.amount ||
        0
    );
}


function renderOrders(orders) {

    const tbody =
        $("ordersTableBody");

    if (!tbody) {
        return;
    }


    if (!orders.length) {

        showTableMessage(
            "ordersTableBody",
            "No orders found.",
            6
        );

        return;
    }


    tbody.innerHTML =
        orders.map(order => {

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
                        ${escapeHTML(
                            order.status || "-"
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            order.created_at
                        )}
                    </td>

                    <td>

                        <button
                            onclick="viewOrder('${order.id}')"
                            style="
                                padding:8px 12px;
                                border-radius:7px;
                                border:1px solid #333;
                                background:#191919;
                                color:white;
                                cursor:pointer;
                            "
                        >
                            View
                        </button>

                    </td>

                </tr>

            `;

        }).join("");
}


function viewOrder(id) {

    const order =
        allOrders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!order) {
        return;
    }


    alert(
        "Order\n\n" +
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
        formatDate(
            order.created_at
        )
    );
}


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

                            order.customer_name,

                            order.customer_email,

                            order.status

                        ]
                            .filter(Boolean)
                            .some(value =>
                                String(value)
                                    .toLowerCase()
                                    .includes(query)
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


        const {
            error
        } = await supabaseClient.auth.signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );
        }


        window.location.replace(
            "homepage.html"
        );


    } catch (error) {

        console.error(error);

        window.location.replace(
            "homepage.html"
        );
    }
}


function initLogout() {

    const logoutBtn =
        $("logoutBtn");

    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        logoutAdmin
    );
}


/* ============================================================
   ESC KEY
============================================================ */

function initKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeMobileMenu();
            }
        }
    );
}


/* ============================================================
   INITIALIZE DASHBOARD
============================================================ */

async function initAdminDashboard() {

    /*
        IMPORTANT:

        NOTHING ELSE RUNS BEFORE
        ADMIN ACCESS IS VERIFIED.
    */

    const isAdmin =
        await checkAdminAccess();


    if (!isAdmin) {

        console.log(
            "Dashboard initialization stopped."
        );

        return;
    }


    /* -----------------------------------------
       ADMIN VERIFIED
    ----------------------------------------- */

    initNavigation();

    initMobileMenu();

    initLogout();

    initKeyboard();

    initProductSearch();

    initSellerSearch();

    initCustomerSearch();

    initOrderSearch();


    await Promise.all([

        loadDashboardData(),

        loadProducts(),

        loadSellers(),

        loadCustomers(),

        loadOrders()

    ]);


    console.log(
        "KHELZONE Admin Dashboard initialized."
    );
}


/* ============================================================
   START
============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initAdminDashboard
    );

} else {

    initAdminDashboard();
}