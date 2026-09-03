/* ============================================================
   KHELZONE ADMIN DASHBOARD
   FIXED VERSION
   ADMIN-ONLY ACCESS CONTROL
============================================================ */

"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const supabaseClient = window.supabaseClient;


/* ============================================================
   SUPABASE SAFETY CHECK
============================================================ */

if (!supabaseClient) {

    console.error(
        "KHELZONE: Supabase client was not initialized."
    );

}


/* ============================================================
   HELPERS
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
        Number(value || 0);

    return (
        "Rs. " +
        number.toLocaleString("en-PK")
    );

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

        return "-";

    }

}


function initials(name) {

    if (!name) {

        return "U";

    }


    return String(name)
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            x =>
                x
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");

}


/* ============================================================
   TABLE MESSAGE
============================================================ */

function showTableMessage(
    tbodyId,
    message,
    colspan = 6
) {

    const tbody =
        $(tbodyId);


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

    let toast =
        $("kzToast");


    if (!toast) {

        toast =
            document.createElement("div");


        toast.id =
            "kzToast";


        toast.style.position =
            "fixed";

        toast.style.right =
            "20px";

        toast.style.bottom =
            "20px";

        toast.style.zIndex =
            "999999";

        toast.style.padding =
            "14px 20px";

        toast.style.borderRadius =
            "10px";

        toast.style.background =
            "#ff5a00";

        toast.style.color =
            "#fff";

        toast.style.fontWeight =
            "700";

        toast.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.4)";


        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        window.kzToastTimer
    );


    window.kzToastTimer =
        setTimeout(
            () => {

                toast.style.display =
                    "none";

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

        dashboard.classList.add(
            "hidden"
        );

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

        /* =====================================================
           CHECK SUPABASE
        ===================================================== */

        if (!supabaseClient) {

            throw new Error(
                "Supabase client is not available."
            );

        }


        /* =====================================================
           CHECK LOGIN
        ===================================================== */

        const {
            data: {
                user
            },
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (userError) {

            console.error(
                "Supabase user error:",
                userError
            );

            throw userError;

        }


        /* =====================================================
           NO USER
        ===================================================== */

        if (!user) {

            window.location.replace(
                "admin.html"
            );

            return false;

        }


        /* =====================================================
           CHECK ADMINS TABLE
        ===================================================== */

        const {
            data: admin,
            error: adminError
        } =
            await supabaseClient
                .from("admins")
                .select("id")
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();


        if (adminError) {

            console.error(
                "Admin table error:",
                adminError
            );

            throw adminError;

        }


        /* =====================================================
           ACCESS DENIED
        ===================================================== */

        if (!admin) {

            console.warn(
                "ACCESS DENIED:",
                user.id
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

            } else {

                window.location.replace(
                    "homepage.html"
                );

            }


            return false;

        }


        /* =====================================================
           ADMIN VERIFIED
        ===================================================== */

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


        /* =====================================================
           ADMIN INFO
        ===================================================== */

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


        /* =====================================================
           SHOW DASHBOARD
        ===================================================== */

        if (checkingScreen) {

            checkingScreen.style.display =
                "none";

        }


        if (accessDenied) {

            accessDenied.style.display =
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


        if (dashboard) {

            dashboard.classList.add(
                "hidden"
            );

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

                        We could not verify your
                        admin permissions.

                        <br><br>

                        Please check your
                        Supabase connection
                        and try again.

                    </div>

                    <button
                        onclick="location.reload()"
                        class="home-btn"
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

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        $(sectionId);


    if (target) {

        target.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".sidebar-link")
        .forEach(link => {

            link.classList.remove(
                "active"
            );

        });


    const activeLink =
        document.querySelector(
            `[data-section="${sectionId}"]`
        );


    if (activeLink) {

        activeLink.classList.add(
            "active"
        );

    }


    const titles = {

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


    if ($("pageTitle")) {

        $("pageTitle").textContent =
            titles[sectionId] ||
            "Dashboard";

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

                        showSection(
                            section
                        );

                    }

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


    if (sidebar) {

        sidebar.classList.add(
            "mobile-open"
        );

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

}


function initMobileMenu() {

    const btn =
        $("mobileMenuBtn");


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

async function safeCount(
    tableName
) {

    try {

        const {
            count,
            error
        } =
            await supabaseClient
                .from(tableName)
                .select(
                    "*",
                    {
                        count: "exact",
                        head: true
                    }
                );


        if (error) {

            console.warn(
                `Count error for ${tableName}:`,
                error
            );

            return 0;

        }


        return count || 0;


    } catch (error) {

        console.warn(
            `Count exception for ${tableName}:`,
            error
        );

        return 0;

    }

}


async function loadDashboardData() {

    const [
        products,
        sellers,
        customers,
        orders
    ] =
        await Promise.all([

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


function renderProducts(
    products
) {

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
                            type="button"
                            onclick="toggleProduct(
                                '${escapeHTML(String(product.id))}',
                                ${active}
                            )"
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
                            .some(
                                value =>
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
        } =
            await supabaseClient
                .from("products")
                .update({
                    is_active:
                        !currentStatus
                })
                .eq(
                    "id",
                    productId
                );


        if (error) {

            throw error;

        }


        showToast(
            "Product status updated."
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


function renderSellers(
    sellers
) {

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

            const name =
                seller.name ||
                seller.full_name ||
                seller.seller_name ||
                "Unknown Seller";


            const email =
                seller.email ||
                seller.seller_email ||
                "-";


            const phone =
                seller.phone ||
                seller.seller_phone ||
                "-";


            const status =
                seller.status ||
                "pending";


            const date =
                formatDate(
                    seller.created_at
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

                        <span
                            style="
                                color:#ff5a00;
                                font-weight:800;
                                text-transform:capitalize;
                            "
                        >
                            ${escapeHTML(
                                String(status)
                            )}
                        </span>

                    </td>


                    <td>
                        ${escapeHTML(date)}
                    </td>


                    <td>

                        <button
                            type="button"
                            onclick="viewSeller('${escapeHTML(String(seller.id))}')"
                            style="
                                padding:8px 12px;
                                border-radius:7px;
                                border:1px solid #333;
                                background:#191919;
                                color:white;
                                cursor:pointer;
                                font-weight:700;
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

                            seller.name,

                            seller.full_name,

                            seller.seller_name,

                            seller.email,

                            seller.seller_email,

                            seller.phone,

                            seller.status

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
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


    const name =
        seller.name ||
        seller.full_name ||
        seller.seller_name ||
        "-";


    const email =
        seller.email ||
        seller.seller_email ||
        "-";


    const phone =
        seller.phone ||
        seller.seller_phone ||
        "-";


    const status =
        seller.status ||
        "-";


    const date =
        formatDate(
            seller.created_at
        );


    alert(

        "Seller\n\n" +

        "Name: " +
        name +

        "\nEmail: " +
        email +

        "\nPhone: " +
        phone +

        "\nStatus: " +
        status +

        "\nDate: " +
        date

    );

}


async function updateSellerStatus(
    id,
    status
) {

    if (!id) {

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
        6
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
            6
        );

    }

}


function renderCustomers(
    customers
) {

    const tbody =
        $("customersTableBody");


    if (!tbody) {

        return;

    }


    if (!customers.length) {

        showTableMessage(
            "customersTableBody",
            "No customers found.",
            6
        );

        return;

    }


    tbody.innerHTML =
        customers.map(customer => {

            const name =
                customer.name ||
                customer.full_name ||
                customer.customer_name ||
                "Unknown Customer";


            const email =
                customer.email ||
                customer.customer_email ||
                "-";


            const phone =
                customer.phone ||
                customer.customer_phone ||
                "-";


            const city =
                customer.city ||
                "-";


            const date =
                formatDate(
                    customer.created_at
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
                                    border-radius:50%;
                                    background:#242424;
                                    border:1px solid #ff5a00;
                                    color:#ff5a00;
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
                        ${escapeHTML(city)}
                    </td>


                    <td>
                        ${escapeHTML(date)}
                    </td>


                    <td>

                        <button
                            type="button"
                            onclick="viewCustomer('${escapeHTML(String(customer.id))}')"
                            style="
                                padding:8px 12px;
                                border-radius:7px;
                                border:1px solid #333;
                                background:#191919;
                                color:white;
                                cursor:pointer;
                                font-weight:700;
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


    const name =
        customer.name ||
        customer.full_name ||
        customer.customer_name ||
        "-";


    const email =
        customer.email ||
        customer.customer_email ||
        "-";


    const phone =
        customer.phone ||
        customer.customer_phone ||
        "-";


    const city =
        customer.city ||
        "-";


    const date =
        formatDate(
            customer.created_at
        );


    alert(

        "Customer\n\n" +

        "Name: " +
        name +

        "\nEmail: " +
        email +

        "\nPhone: " +
        phone +

        "\nCity: " +
        city +

        "\nDate: " +
        date

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

                            customer.customer_name,

                            customer.email,

                            customer.customer_email,

                            customer.phone,

                            customer.customer_phone,

                            customer.city

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
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


function renderOrders(
    orders
) {

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

            const number =
                orderNumber(order);


            const customer =
                orderCustomer(order);


            const total =
                orderTotal(order);


            const status =
                order.status ||
                "pending";


            const date =
                formatDate(
                    order.created_at
                );


            return `

                <tr>

                    <td>

                        <strong>
                            ${escapeHTML(
                                String(number)
                            )}
                        </strong>

                    </td>


                    <td>

                        ${escapeHTML(
                            String(customer)
                        )}

                    </td>


                    <td>

                        ${formatMoney(total)}

                    </td>


                    <td>

                        <span
                            style="
                                color:#ff5a00;
                                font-weight:800;
                                text-transform:capitalize;
                            "
                        >

                            ${escapeHTML(
                                String(status)
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            String(date)
                        )}

                    </td>


                    <td>

                        <div
                            style="
                                display:flex;
                                gap:8px;
                                flex-wrap:wrap;
                            "
                        >

                            <button
                                type="button"
                                onclick="viewOrder('${escapeHTML(String(order.id))}')"
                                style="
                                    padding:8px 12px;
                                    border-radius:7px;
                                    border:1px solid #333;
                                    background:#191919;
                                    color:white;
                                    cursor:pointer;
                                    font-weight:700;
                                "
                            >
                                View
                            </button>


                            <button
                                type="button"
                                onclick="deleteOrder('${escapeHTML(String(order.id))}')"
                                style="
                                    padding:8px 12px;
                                    border:none;
                                    border-radius:7px;
                                    background:#991b1b;
                                    color:white;
                                    cursor:pointer;
                                    font-weight:800;
                                "
                            >
                                🗑 Delete
                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");

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


/* ============================================================
   DELETE ORDER
============================================================ */

async function deleteOrder(id) {

    if (!id) {

        alert(
            "Order ID not found."
        );

        return;

    }


    const order =
        allOrders.find(
            item =>
                String(item.id) ===
                String(id)
        );


    const orderLabel =
        order
            ? orderNumber(order)
            : id;


    const confirmed =
        confirm(

            "Delete order " +
            orderLabel +
            "?\n\n" +
            "This action cannot be undone."

        );


    if (!confirmed) {

        return;

    }


    try {

        console.log(
            "Deleting order:",
            id
        );


        const {
            error
        } =
            await supabaseClient
                .from("orders")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                "Delete order error:",
                error
            );


            alert(

                "Order delete nahi hua.\n\n" +
                (
                    error.message ||
                    "Unknown Supabase error"
                )

            );

            return;

        }


        /* =====================================================
           REMOVE LOCAL ORDER
        ===================================================== */

        allOrders =
            allOrders.filter(
                order =>
                    String(order.id) !==
                    String(id)
            );


        /* =====================================================
           UPDATE TABLE
        ===================================================== */

        renderOrders(
            allOrders
        );


        /* =====================================================
           UPDATE ORDER COUNT
        ===================================================== */

        await loadDashboardData();


        /* =====================================================
           SUCCESS
        ===================================================== */

        showToast(
            "Order deleted successfully!"
        );


        console.log(
            "Order deleted successfully:",
            id
        );


    } catch (error) {

        console.error(
            "Delete order exception:",
            error
        );


        alert(

            "Something went wrong while deleting the order.\n\n" +

            (
                error?.message ||
                "Unknown error"
            )

        );

    }

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

                            order.customer_name,

                            order.customer_email,

                            order.user_email,

                            order.status

                        ]
                            .filter(Boolean)
                            .some(
                                value =>
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

        if (supabaseClient) {

            await supabaseClient.auth.signOut();

        }

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    } finally {

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
            "admin.html"
        );

    }

}


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
                confirm(
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
                event.key === "Escape"
            ) {

                closeMobileMenu();

            }

        }
    );

}


/* ============================================================
   INITIALIZATION
============================================================ */

async function initAdminDashboard() {

    console.log(
        "KHELZONE Admin Dashboard starting..."
    );


    /* ========================================================
       ADMIN ACCESS FIRST
    ======================================================== */

    const isAdmin =
        await checkAdminAccess();


    if (!isAdmin) {

        return;

    }


    /* ========================================================
       UI
    ======================================================== */

    initNavigation();

    initMobileMenu();

    initLogout();

    initKeyboard();


    /* ========================================================
       SEARCH
    ======================================================== */

    initProductSearch();

    initSellerSearch();

    initCustomerSearch();

    initOrderSearch();


    /* ========================================================
       DATA
    ======================================================== */

    try {

        await Promise.all([

            loadDashboardData(),

            loadProducts(),

            loadSellers(),

            loadCustomers(),

            loadOrders()

        ]);

    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }


    /* ========================================================
       DEFAULT SECTION
    ======================================================== */

    showSection(
        "dashboardSection"
    );


    console.log(
        "KHELZONE Admin Dashboard Ready."
    );

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
        initAdminDashboard
    );

} else {

    initAdminDashboard();

}