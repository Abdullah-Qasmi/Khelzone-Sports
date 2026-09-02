/* ============================================================
   KHELZONE ADMIN DASHBOARD
   COMPLETE ADMIN-DASHBOARD.JS
   ============================================================ */

"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const SUPABASE_URL =
    "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";


if (!window.supabase) {

    console.error(
        "Supabase library is not loaded."
    );

} else {

    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

}


const supabaseClient =
    window.supabaseClient;


/* ============================================================
   GLOBAL STATE
============================================================ */

const state = {

    user: null,

    products: [],

    sellers: [],

    customers: [],

    orders: [],

    customerTable: null,

    currentProduct: null,

    currentSeller: null,

    currentCustomer: null,

    currentOrder: null

};


/* ============================================================
   HELPER
============================================================ */

function $(id) {

    return document.getElementById(id);

}


function escapeHTML(value) {

    return String(value ?? "")
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
        number.toLocaleString(
            "en-PK",
            {
                maximumFractionDigits: 2
            }
        )
    );

}


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


function initials(name) {

    const text =
        String(name || "User")
            .trim();

    if (!text) {
        return "U";
    }

    return text
        .split(/\s+/)
        .slice(0, 2)
        .map(word =>
            word.charAt(0)
        )
        .join("")
        .toUpperCase();

}


/* ============================================================
   TOAST
============================================================ */

function showToast(
    message,
    type = "success"
) {

    let toast =
        $("toast");

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "toast";

        toast.className =
            "fixed bottom-6 right-6 z-[99999] " +
            "rounded-xl px-5 py-4 shadow-2xl " +
            "font-bold text-sm";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message;


    toast.style.background =
        type === "error"
            ? "#7f1d1d"
            : "#ff5a00";


    toast.style.color =
        "#ffffff";


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
            3000
        );

}


/* ============================================================
   STATUS BADGE
============================================================ */

function statusBadge(status) {

    const value =
        String(
            status || "pending"
        ).toLowerCase();


    let cls =
        "inline-flex items-center rounded-full " +
        "px-3 py-1 text-xs font-black " +
        "bg-yellow-500/10 text-yellow-400";


    if (
        value === "approved" ||
        value === "active" ||
        value === "delivered"
    ) {

        cls =
            "inline-flex items-center rounded-full " +
            "px-3 py-1 text-xs font-black " +
            "bg-green-500/10 text-green-400";

    }


    if (
        value === "rejected" ||
        value === "inactive" ||
        value === "cancelled"
    ) {

        cls =
            "inline-flex items-center rounded-full " +
            "px-3 py-1 text-xs font-black " +
            "bg-red-500/10 text-red-400";

    }


    return `
        <span class="${cls}">
            ${escapeHTML(status || "pending")}
        </span>
    `;

}


/* ============================================================
   LOADING HELPERS
============================================================ */

function tableLoading(
    id,
    colspan
) {

    const table =
        $(id);

    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="${colspan}"
                class="py-10 text-center text-gray-500">

                Loading...

            </td>

        </tr>

    `;

}


function tableEmpty(
    id,
    colspan,
    message = "No records found."
) {

    const table =
        $(id);

    if (!table) {
        return;
    }


    table.innerHTML = `

        <tr>

            <td
                colspan="${colspan}"
                class="py-10 text-center text-gray-500">

                ${escapeHTML(message)}

            </td>

        </tr>

    `;

}


/* ============================================================
   MODALS
============================================================ */

function openModal(id) {

    const modal =
        $(id);

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "hidden"
    );

}


function closeModal(id) {

    const modal =
        $(id);

    if (!modal) {
        return;
    }

    modal.classList.add(
        "hidden"
    );

}


/* ============================================================
   ADMIN ACCESS
   IMPORTANT:
   ADMIN CHECK = public.admins
============================================================ */

async function checkAdminAccess() {

    const checkingScreen =
        $("checkingScreen");

    const dashboard =
        $("dashboard");


    try {

        if (!supabaseClient) {

            throw new Error(
                "Supabase client could not start."
            );

        }


        /* Get logged-in user */

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getUser();


        if (error) {
            throw error;
        }


        const user =
            data?.user;


        /* No login */

        if (!user) {

            window.location.href =
                "admin.html";

            return false;

        }


        /* Check admins table */

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
                "Admin check error:",
                adminError
            );

            throw new Error(
                "Admin table error: " +
                adminError.message
            );

        }


        /* Not admin */

        if (!admin) {

            await supabaseClient
                .auth
                .signOut();


            if (checkingScreen) {

                checkingScreen.innerHTML = `

                    <div
                        class="px-6 text-center max-w-md">

                        <div
                            class="mx-auto mb-5 flex h-16 w-16
                            items-center justify-center
                            rounded-full bg-red-500/10
                            text-red-400">

                            <span
                                class="material-symbols-outlined text-3xl">

                                block

                            </span>

                        </div>


                        <h2
                            class="text-2xl font-black text-white">

                            ACCESS DENIED

                        </h2>


                        <p
                            class="mt-3 text-sm text-gray-400">

                            This account is not registered
                            as a KHELZONE admin.

                        </p>


                        <a
                            href="admin.html"
                            class="mt-6 inline-flex rounded-xl
                            bg-orange-500 px-6 py-3
                            font-black text-black">

                            Back to Login

                        </a>

                    </div>

                `;

            }


            return false;

        }


        /* Admin verified */

        state.user =
            user;


        localStorage.setItem(
            "khelzone_role",
            "admin"
        );


        localStorage.setItem(
            "khelzone_user_id",
            user.id
        );


        const adminName =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split("@")[0] ||
            "Admin";


        if ($("adminName")) {

            $("adminName").textContent =
                adminName;

        }


        if ($("adminEmail")) {

            $("adminEmail").textContent =
                user.email || "";

        }


        /* Show dashboard */

        if (checkingScreen) {

            checkingScreen.classList.add(
                "hidden"
            );

        }


        if (dashboard) {

            dashboard.classList.remove(
                "hidden"
            );

        }


        return true;


    } catch (error) {

        console.error(
            "ADMIN ACCESS ERROR:",
            error
        );


        if (checkingScreen) {

            checkingScreen.innerHTML = `

                <div
                    class="px-6 text-center max-w-lg">

                    <span
                        class="material-symbols-outlined
                        text-5xl text-red-400">

                        error

                    </span>


                    <h2
                        class="mt-4 text-2xl
                        font-black text-white">

                        ADMIN CHECK FAILED

                    </h2>


                    <p
                        class="mt-3 text-sm
                        leading-6 text-gray-400">

                        ${escapeHTML(
                            error.message
                        )}

                    </p>


                    <button
                        id="retryAdminButton"
                        class="mt-6 rounded-xl
                        bg-orange-500 px-6 py-3
                        font-black text-black">

                        TRY AGAIN

                    </button>

                </div>

            `;


            $("retryAdminButton")
                ?.addEventListener(
                    "click",
                    () => location.reload()
                );

        }


        return false;

    }

}


/* ============================================================
   SIDEBAR NAVIGATION
   YOUR HTML USES data-section
============================================================ */

function showSection(
    sectionName
) {

    console.log(
        "Opening section:",
        sectionName
    );


    /* Hide every section */

    document
        .querySelectorAll(
            "[data-dashboard-section]"
        )
        .forEach(section => {

            section.classList.add(
                "hidden"
            );

        });


    /* Find selected section */

    const section =
        document.querySelector(
            `[data-dashboard-section="${sectionName}"]`
        );


    if (section) {

        section.classList.remove(
            "hidden"
        );

    } else {

        console.warn(
            "Dashboard section not found:",
            sectionName
        );

    }


    /* Titles */

    const titles = {

        dashboard: [
            "DASHBOARD",
            "Manage your KHELZONE marketplace"
        ],

        products: [
            "PRODUCTS",
            "Manage your marketplace products"
        ],

        sellers: [
            "SELLER APPLICATIONS",
            "Manage seller applications"
        ],

        customers: [
            "CUSTOMERS",
            "Manage registered customers"
        ],

        orders: [
            "ORDERS",
            "Manage marketplace orders"
        ]

    };


    if (titles[sectionName]) {

        if ($("pageTitle")) {

            $("pageTitle").textContent =
                titles[sectionName][0];

        }


        if ($("pageSubtitle")) {

            $("pageSubtitle").textContent =
                titles[sectionName][1];

        }

    }


    /* Active sidebar */

    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(link => {

            const current =
                link.getAttribute(
                    "data-section"
                );


            if (
                current ===
                sectionName
            ) {

                link.classList.add(
                    "bg-orange-500",
                    "text-black"
                );

                link.classList.remove(
                    "text-white",
                    "text-gray-400"
                );

            } else {

                link.classList.remove(
                    "bg-orange-500",
                    "text-black"
                );

                link.classList.add(
                    "text-white"
                );

            }

        });


    closeMobileMenu();


    /* Load required data */

    if (
        sectionName ===
        "products"
    ) {

        loadProducts();

    }


    if (
        sectionName ===
        "sellers"
    ) {

        loadSellers();

    }


    if (
        sectionName ===
        "customers"
    ) {

        loadCustomers();

    }


    if (
        sectionName ===
        "orders"
    ) {

        loadOrders();

    }

}


/* Make function available to inline onclick */
window.showSection =
    showSection;


/* ============================================================
   NAVIGATION INIT
============================================================ */

function initNavigation() {

    console.log(
        "Initializing navigation..."
    );


    document
        .querySelectorAll(
            "[data-section]"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const section =
                        this.getAttribute(
                            "data-section"
                        );


                    if (!section) {
                        return;
                    }


                    showSection(
                        section
                    );

                }
            );

        });


    /*
       Existing dashboard HTML has
       View Sellers button using:
       onclick="showSection('sellers')"
    */

    document
        .querySelectorAll(
            '[onclick*="showSection"]'
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const match =
                        this.getAttribute(
                            "onclick"
                        )?.match(
                            /showSection\(['"]([^'"]+)['"]/
                        );


                    if (match) {

                        showSection(
                            match[1]
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

    const menu =
        $("mobileMenu");


    if (!menu) {
        return;
    }


    menu.classList.remove(
        "hidden"
    );


    menu.classList.remove(
        "max-h-0"
    );


    menu.classList.add(
        "max-h-[600px]"
    );


    menu.classList.add(
        "opacity-100"
    );

}


function closeMobileMenu() {

    const menu =
        $("mobileMenu");


    if (!menu) {
        return;
    }


    menu.classList.add(
        "hidden"
    );


    menu.classList.remove(
        "max-h-[600px]"
    );


    menu.classList.add(
        "max-h-0"
    );


    menu.classList.remove(
        "opacity-100"
    );

}


function initMobileMenu() {

    const button =
        $("mobileMenuButton");


    if (button) {

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                const menu =
                    $("mobileMenu");


                if (
                    menu &&
                    !menu.classList.contains(
                        "hidden"
                    )
                ) {

                    closeMobileMenu();

                } else {

                    openMobileMenu();

                }

            }
        );

    }


    $("mobileMenuOverlay")
        ?.addEventListener(
            "click",
            closeMobileMenu
        );


    $("mobileMenuClose")
        ?.addEventListener(
            "click",
            closeMobileMenu
        );

}


/* ============================================================
   DASHBOARD COUNTS
============================================================ */

async function countRows(
    table,
    filterColumn = null,
    filterValue = null
) {

    let query =
        supabaseClient
            .from(table)
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    if (
        filterColumn &&
        filterValue !== null
    ) {

        query =
            query.eq(
                filterColumn,
                filterValue
            );

    }


    const {
        count,
        error
    } =
        await query;


    if (error) {
        throw error;
    }


    return count || 0;

}


/* ============================================================
   LOAD DASHBOARD
============================================================ */

async function loadDashboardData() {

    try {

        let products =
            0;

        let sellers =
            0;

        let customers =
            0;

        let orders =
            0;


        /* Products */

        try {

            products =
                await countRows(
                    "products"
                );

        } catch (error) {

            console.warn(
                "Products count:",
                error.message
            );

        }


        /* Sellers */

        try {

            sellers =
                await countRows(
                    "sellers"
                );

        } catch (error) {

            console.warn(
                "Sellers count:",
                error.message
            );

        }


        /* Customers */

        try {

            customers =
                await countRows(
                    "customers"
                );

        } catch {

            try {

                customers =
                    await countRows(
                        "profiles"
                    );

            } catch {

                customers =
                    0;

            }

        }


        /* Orders */

        try {

            orders =
                await countRows(
                    "orders"
                );

        } catch {

            orders =
                0;

        }


        setCount(
            "totalProducts",
            products
        );


        setCount(
            "totalSellers",
            sellers
        );


        setCount(
            "totalCustomers",
            customers
        );


        setCount(
            "totalOrders",
            orders
        );


        /* Seller statuses */

        const pending =
            await safeCount(
                "sellers",
                "status",
                "pending"
            );


        const approved =
            await safeCount(
                "sellers",
                "status",
                "approved"
            );


        const rejected =
            await safeCount(
                "sellers",
                "status",
                "rejected"
            );


        setCount(
            "pendingSellers",
            pending
        );


        setCount(
            "approvedSellers",
            approved
        );


        setCount(
            "rejectedSellers",
            rejected
        );


    } catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


async function safeCount(
    table,
    column,
    value
) {

    try {

        return await countRows(
            table,
            column,
            value
        );

    } catch {

        return 0;

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
            String(value ?? 0);

    }

}


/* ============================================================
   PRODUCTS
============================================================ */

async function loadProducts() {

    const table =
        $("productsTableBody");


    if (!table) {

        console.warn(
            "productsTableBody not found."
        );

        return;

    }


    tableLoading(
        "productsTableBody",
        7
    );


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


        tableEmpty(
            "productsTableBody",
            7,
            error.message
        );


        return;

    }


    state.products =
        data || [];


    renderProducts();

}


/* ============================================================
   RENDER PRODUCTS
============================================================ */

function renderProducts() {

    const table =
        $("productsTableBody");


    if (!table) {
        return;
    }


    const search =
        (
            $("productSearch")
                ?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        state.products.filter(
            product => {

                const text = [

                    product.name,

                    product.sport,

                    product.category,

                    product.brand,

                    product.description

                ]
                    .join(" ")
                    .toLowerCase();


                return (
                    !search ||
                    text.includes(search)
                );

            }
        );


    if (!filtered.length) {

        tableEmpty(
            "productsTableBody",
            7,
            "No products found."
        );


        return;

    }


    table.innerHTML =
        filtered
            .map(
                product => `

                <tr
                    class="border-b border-white/5">

                    <td class="py-4 pr-4">

                        <div
                            class="flex items-center gap-3">

                            ${
                                product.image_url
                                    ? `
                                        <img
                                            src="${escapeHTML(
                                                product.image_url
                                            )}"
                                            class="h-12 w-12
                                            rounded-lg
                                            object-cover"
                                            alt="${escapeHTML(
                                                product.name
                                            )}">
                                      `
                                    : `
                                        <div
                                            class="flex h-12 w-12
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-white/5">

                                            <span
                                                class="material-symbols-outlined
                                                text-gray-500">

                                                image

                                            </span>

                                        </div>
                                      `
                            }


                            <div>

                                <p
                                    class="font-black text-white">

                                    ${escapeHTML(
                                        product.name ||
                                        "Unnamed"
                                    )}

                                </p>


                                <p
                                    class="text-xs
                                    text-gray-500">

                                    ${escapeHTML(
                                        product.brand ||
                                        ""
                                    )}

                                </p>

                            </div>

                        </div>

                    </td>


                    <td
                        class="py-4 pr-4 text-gray-400">

                        ${escapeHTML(
                            product.sport ||
                            "—"
                        )}

                    </td>


                    <td
                        class="py-4 pr-4 text-gray-400">

                        ${escapeHTML(
                            product.category ||
                            "—"
                        )}

                    </td>


                    <td
                        class="py-4 pr-4 font-black">

                        ${formatMoney(
                            product.price
                        )}

                    </td>


                    <td
                        class="py-4 pr-4">

                        ${escapeHTML(
                            product.stock ??
                            0
                        )}

                    </td>


                    <td class="py-4">

                        ${statusBadge(
                            product.is_active === false
                                ? "inactive"
                                : "active"
                        )}

                    </td>


                    <td
                        class="py-4 text-right">

                        <div
                            class="flex justify-end
                            gap-2">

                            <button
                                type="button"
                                data-product-edit="${escapeHTML(
                                    product.id
                                )}"
                                class="rounded-lg
                                border border-white/10
                                p-2 text-gray-300
                                hover:text-orange-400">

                                <span
                                    class="material-symbols-outlined
                                    text-base">

                                    edit

                                </span>

                            </button>


                            <button
                                type="button"
                                data-product-toggle="${escapeHTML(
                                    product.id
                                )}"
                                class="rounded-lg
                                border border-white/10
                                p-2 text-yellow-400">

                                <span
                                    class="material-symbols-outlined
                                    text-base">

                                    ${
                                        product.is_active === false
                                            ? "visibility"
                                            : "visibility_off"
                                    }

                                </span>

                            </button>


                            <button
                                type="button"
                                data-product-delete="${escapeHTML(
                                    product.id
                                )}"
                                class="rounded-lg
                                border border-red-500/20
                                p-2 text-red-400">

                                <span
                                    class="material-symbols-outlined
                                    text-base">

                                    delete

                                </span>

                            </button>

                        </div>

                    </td>

                </tr>

            `
            )
            .join("");


    /* Edit */

    table
        .querySelectorAll(
            "[data-product-edit]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const product =
                        state.products.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.productEdit
                                )
                        );


                    if (product) {

                        editProduct(
                            product
                        );

                    }

                }
            );

        });


    /* Toggle */

    table
        .querySelectorAll(
            "[data-product-toggle]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const product =
                        state.products.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.productToggle
                                )
                        );


                    if (product) {

                        toggleProduct(
                            product
                        );

                    }

                }
            );

        });


    /* Delete */

    table
        .querySelectorAll(
            "[data-product-delete]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const product =
                        state.products.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.productDelete
                                )
                        );


                    if (product) {

                        deleteProduct(
                            product
                        );

                    }

                }
            );

        });

}


/* ============================================================
   PRODUCT SEARCH
============================================================ */

function initProductSearch() {

    $("productSearch")
        ?.addEventListener(
            "input",
            renderProducts
        );


    $("refreshProducts")
        ?.addEventListener(
            "click",
            loadProducts
        );

}


/* ============================================================
   EDIT PRODUCT
============================================================ */

function editProduct(
    product
) {

    state.currentProduct =
        product;


    /*
       If your HTML has a product modal,
       these fields will automatically be filled.
    */

    if ($("editProductId")) {

        $("editProductId").value =
            product.id || "";

    }


    if ($("editProductName")) {

        $("editProductName").value =
            product.name || "";

    }


    if ($("editProductPrice")) {

        $("editProductPrice").value =
            product.price ?? "";

    }


    if ($("editProductStock")) {

        $("editProductStock").value =
            product.stock ?? "";

    }


    if ($("editProductCategory")) {

        $("editProductCategory").value =
            product.category || "";

    }


    if ($("editProductSport")) {

        $("editProductSport").value =
            product.sport || "";

    }


    if ($("editProductImage")) {

        $("editProductImage").value =
            product.image_url || "";

    }


    if ($("editProductActive")) {

        $("editProductActive").checked =
            product.is_active !== false;

    }


    /* Open whichever modal exists */

    if ($("editProductModal")) {

        openModal(
            "editProductModal"
        );

    } else if ($("productModal")) {

        openModal(
            "productModal"
        );

    } else {

        /*
           No modal in HTML.
           Show product information instead.
        */

        alert(
            "Product selected:\n\n" +
            "Name: " +
            (product.name || "—") +
            "\nPrice: " +
            formatMoney(product.price) +
            "\nStock: " +
            (product.stock ?? 0)
        );

    }

}


/* ============================================================
   TOGGLE PRODUCT
============================================================ */

async function toggleProduct(
    product
) {

    const next =
        product.is_active === false;


    const confirmed =
        confirm(
            next
                ? `Activate "${product.name}"?`
                : `Deactivate "${product.name}"?`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .update({
                is_active: next
            })
            .eq(
                "id",
                product.id
            );


    if (error) {

        console.error(
            error
        );


        showToast(
            error.message,
            "error"
        );


        return;

    }


    showToast(
        next
            ? "Product activated."
            : "Product deactivated."
    );


    await loadProducts();

    await loadDashboardData();

}


/* ============================================================
   DELETE PRODUCT
============================================================ */

async function deleteProduct(
    product
) {

    const confirmed =
        confirm(
            `Delete "${product.name}" permanently?`
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("products")
            .delete()
            .eq(
                "id",
                product.id
            );


    if (error) {

        console.error(
            error
        );


        showToast(
            error.message,
            "error"
        );


        return;

    }


    showToast(
        "Product deleted successfully."
    );


    await loadProducts();

    await loadDashboardData();

}


/* ============================================================
   SELLERS
============================================================ */

async function loadSellers() {

    const table =
        $("sellersTableBody");


    if (!table) {

        console.warn(
            "sellersTableBody not found."
        );

        return;

    }


    tableLoading(
        "sellersTableBody",
        6
    );


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


        tableEmpty(
            "sellersTableBody",
            6,
            error.message
        );


        return;

    }


    state.sellers =
        data || [];


    renderSellers();

}


/* ============================================================
   RENDER SELLERS
============================================================ */

function renderSellers() {

    const table =
        $("sellersTableBody");


    if (!table) {
        return;
    }


    const search =
        (
            $("sellerSearch")
                ?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        state.sellers.filter(
            seller => {

                const text = [

                    seller.business_name,

                    seller.owner_name,

                    seller.email,

                    seller.phone,

                    seller.city,

                    seller.category,

                    seller.status

                ]
                    .join(" ")
                    .toLowerCase();


                return (
                    !search ||
                    text.includes(search)
                );

            }
        );


    if (!filtered.length) {

        tableEmpty(
            "sellersTableBody",
            6,
            "No seller applications found."
        );


        return;

    }


    table.innerHTML =
        filtered
            .map(
                seller => `

                <tr
                    class="border-b border-white/5">

                    <td class="py-4 pr-4">

                        <div
                            class="flex items-center gap-3">

                            <div
                                class="flex h-10 w-10
                                shrink-0 items-center
                                justify-center
                                rounded-full
                                bg-orange-500/10
                                text-orange-400
                                font-black">

                                ${escapeHTML(
                                    initials(
                                        seller.owner_name
                                    )
                                )}

                            </div>


                            <div>

                                <p
                                    class="font-black">

                                    ${escapeHTML(
                                        seller.owner_name ||
                                        "—"
                                    )}

                                </p>


                                <p
                                    class="text-xs
                                    text-gray-500">

                                    ${escapeHTML(
                                        seller.city ||
                                        ""
                                    )}

                                </p>

                            </div>

                        </div>

                    </td>


                    <td
                        class="py-4 pr-4 font-bold">

                        ${escapeHTML(
                            seller.business_name ||
                            "—"
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${escapeHTML(
                            seller.email ||
                            "—"
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${escapeHTML(
                            seller.phone ||
                            "—"
                        )}

                    </td>


                    <td class="py-4">

                        ${statusBadge(
                            seller.status ||
                            "pending"
                        )}

                    </td>


                    <td
                        class="py-4 text-right">

                        <div
                            class="flex justify-end
                            gap-2">

                            <button
                                type="button"
                                data-seller-view="${escapeHTML(
                                    seller.id
                                )}"
                                class="rounded-lg
                                border border-white/10
                                p-2
                                text-gray-300
                                hover:text-orange-400">

                                <span
                                    class="material-symbols-outlined">

                                    visibility

                                </span>

                            </button>


                            ${
                                seller.status !==
                                "approved"
                                    ? `
                                        <button
                                            type="button"
                                            data-seller-approve="${escapeHTML(
                                                seller.id
                                            )}"
                                            class="rounded-lg
                                            border
                                            border-green-500/20
                                            p-2
                                            text-green-400">

                                            <span
                                                class="material-symbols-outlined">

                                                check

                                            </span>

                                        </button>
                                      `
                                    : ""
                            }


                            ${
                                seller.status !==
                                "rejected"
                                    ? `
                                        <button
                                            type="button"
                                            data-seller-reject="${escapeHTML(
                                                seller.id
                                            )}"
                                            class="rounded-lg
                                            border
                                            border-red-500/20
                                            p-2
                                            text-red-400">

                                            <span
                                                class="material-symbols-outlined">

                                                close

                                            </span>

                                        </button>
                                      `
                                    : ""
                            }

                        </div>

                    </td>

                </tr>

            `
            )
            .join("");


    /* View */

    table
        .querySelectorAll(
            "[data-seller-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const seller =
                        state.sellers.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.sellerView
                                )
                        );


                    if (seller) {

                        viewSeller(
                            seller
                        );

                    }

                }
            );

        });


    /* Approve */

    table
        .querySelectorAll(
            "[data-seller-approve]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    updateSellerStatus(
                        button.dataset.sellerApprove,
                        "approved"
                    );

                }
            );

        });


    /* Reject */

    table
        .querySelectorAll(
            "[data-seller-reject]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    updateSellerStatus(
                        button.dataset.sellerReject,
                        "rejected"
                    );

                }
            );

        });

}


/* ============================================================
   VIEW SELLER
============================================================ */

function viewSeller(
    seller
) {

    state.currentSeller =
        seller;


    const body =
        $("sellerModalBody");


    if (!body) {

        alert(
            "SELLER DETAILS\n\n" +

            "Business: " +
            (seller.business_name || "—") +

            "\nOwner: " +
            (seller.owner_name || "—") +

            "\nEmail: " +
            (seller.email || "—") +

            "\nPhone: " +
            (seller.phone || "—") +

            "\nCity: " +
            (seller.city || "—") +

            "\nCategory: " +
            (seller.category || "—") +

            "\nStatus: " +
            (seller.status || "pending")
        );


        return;

    }


    body.innerHTML = `

        <div
            class="space-y-5">

            <div>

                <p
                    class="text-xs text-gray-500">

                    BUSINESS

                </p>

                <p
                    class="mt-1 text-lg
                    font-black">

                    ${escapeHTML(
                        seller.business_name ||
                        "—"
                    )}

                </p>

            </div>


            <div
                class="grid grid-cols-1
                gap-4 sm:grid-cols-2">

                <div>

                    <p
                        class="text-xs text-gray-500">

                        Owner

                    </p>

                    <p
                        class="font-bold">

                        ${escapeHTML(
                            seller.owner_name ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs text-gray-500">

                        Email

                    </p>

                    <p
                        class="font-bold break-all">

                        ${escapeHTML(
                            seller.email ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs text-gray-500">

                        Phone

                    </p>

                    <p
                        class="font-bold">

                        ${escapeHTML(
                            seller.phone ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs text-gray-500">

                        City

                    </p>

                    <p
                        class="font-bold">

                        ${escapeHTML(
                            seller.city ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs text-gray-500">

                        Category

                    </p>

                    <p
                        class="font-bold">

                        ${escapeHTML(
                            seller.category ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs text-gray-500">

                        Status

                    </p>

                    <div
                        class="mt-1">

                        ${statusBadge(
                            seller.status
                        )}

                    </div>

                </div>

            </div>


            <div>

                <p
                    class="text-xs text-gray-500">

                    Monthly Volume

                </p>

                <p
                    class="font-bold">

                    ${escapeHTML(
                        seller.monthly_volume ||
                        "—"
                    )}

                </p>

            </div>


            <div>

                <p
                    class="text-xs text-gray-500">

                    APPLICATION MESSAGE

                </p>

                <p
                    class="mt-2
                    whitespace-pre-wrap
                    text-sm
                    leading-6
                    text-gray-300">

                    ${escapeHTML(
                        seller.message ||
                        "No message."
                    )}

                </p>

            </div>

        </div>

    `;


    openModal(
        "sellerModal"
    );

}


/* ============================================================
   UPDATE SELLER STATUS
============================================================ */

async function updateSellerStatus(
    sellerId,
    newStatus
) {

    const action =
        newStatus ===
        "approved"
            ? "approve"
            : "reject";


    if (
        !confirm(
            `Are you sure you want to ${action} this seller?`
        )
    ) {

        return;

    }


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
            "Seller status error:",
            error
        );


        showToast(
            error.message,
            "error"
        );


        return;

    }


    showToast(
        newStatus ===
            "approved"
            ? "Seller approved successfully."
            : "Seller rejected."
    );


    await loadSellers();

    await loadDashboardData();

}


/* ============================================================
   SELLER SEARCH
============================================================ */

function initSellerSearch() {

    $("sellerSearch")
        ?.addEventListener(
            "input",
            renderSellers
        );


    $("refreshSellers")
        ?.addEventListener(
            "click",
            loadSellers
        );

}


/* ============================================================
   CUSTOMERS
============================================================ */

async function findCustomerTable() {

    const tables = [
        "customers",
        "profiles"
    ];


    for (
        const table of tables
    ) {

        try {

            const {
                error
            } =
                await supabaseClient
                    .from(table)
                    .select("*")
                    .limit(1);


            if (!error) {

                return table;

            }

        } catch {

            // Continue

        }

    }


    return null;

}


async function loadCustomers() {

    const table =
        $("customersTableBody");


    if (!table) {

        console.warn(
            "customersTableBody not found."
        );

        return;

    }


    tableLoading(
        "customersTableBody",
        6
    );


    const customerTable =
        await findCustomerTable();


    if (!customerTable) {

        tableEmpty(
            "customersTableBody",
            6,
            "Customers table not available."
        );


        return;

    }


    state.customerTable =
        customerTable;


    const {
        data,
        error
    } =
        await supabaseClient
            .from(customerTable)
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


        tableEmpty(
            "customersTableBody",
            6,
            error.message
        );


        return;

    }


    state.customers =
        data || [];


    renderCustomers();

}


function customerName(
    customer
) {

    return (
        customer.full_name ||
        customer.name ||
        customer.display_name ||
        customer.username ||
        customer.email?.split("@")[0] ||
        "Customer"
    );

}


function customerPhone(
    customer
) {

    return (
        customer.phone ||
        customer.phone_number ||
        "—"
    );

}


function renderCustomers() {

    const table =
        $("customersTableBody");


    if (!table) {
        return;
    }


    const search =
        (
            $("customerSearch")
                ?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        state.customers.filter(
            customer => {

                const text = [

                    customerName(
                        customer
                    ),

                    customer.email,

                    customerPhone(
                        customer
                    ),

                    customer.city

                ]
                    .join(" ")
                    .toLowerCase();


                return (
                    !search ||
                    text.includes(search)
                );

            }
        );


    if (!filtered.length) {

        tableEmpty(
            "customersTableBody",
            6,
            "No customers found."
        );


        return;

    }


    table.innerHTML =
        filtered
            .map(
                customer => `

                <tr
                    class="border-b border-white/5">

                    <td class="py-4 pr-4">

                        <div
                            class="flex items-center gap-3">

                            <div
                                class="flex h-10 w-10
                                items-center
                                justify-center
                                rounded-full
                                bg-orange-500/10
                                text-orange-400
                                font-black">

                                ${escapeHTML(
                                    initials(
                                        customerName(
                                            customer
                                        )
                                    )
                                )}

                            </div>


                            <div>

                                <p
                                    class="font-black">

                                    ${escapeHTML(
                                        customerName(
                                            customer
                                        )
                                    )}

                                </p>

                            </div>

                        </div>

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${escapeHTML(
                            customer.email ||
                            "—"
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${escapeHTML(
                            customerPhone(
                                customer
                            )
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${escapeHTML(
                            customer.city ||
                            "—"
                        )}

                    </td>


                    <td class="py-4">

                        ${statusBadge(
                            customer.is_active === false
                                ? "inactive"
                                : "active"
                        )}

                    </td>


                    <td
                        class="py-4 text-right">

                        <button
                            type="button"
                            data-customer-view="${escapeHTML(
                                customer.id
                            )}"
                            class="rounded-lg
                            border border-white/10
                            p-2 text-gray-300
                            hover:text-orange-400">

                            <span
                                class="material-symbols-outlined">

                                visibility

                            </span>

                        </button>

                    </td>

                </tr>

            `
            )
            .join("");


    table
        .querySelectorAll(
            "[data-customer-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const customer =
                        state.customers.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.customerView
                                )
                        );


                    if (customer) {

                        viewCustomer(
                            customer
                        );

                    }

                }
            );

        });

}


/* ============================================================
   VIEW CUSTOMER
============================================================ */

function viewCustomer(
    customer
) {

    state.currentCustomer =
        customer;


    const body =
        $("customerModalBody");


    if (!body) {

        alert(
            "CUSTOMER DETAILS\n\n" +

            "Name: " +
            customerName(customer) +

            "\nEmail: " +
            (customer.email || "—") +

            "\nPhone: " +
            customerPhone(customer) +

            "\nCity: " +
            (customer.city || "—")
        );


        return;

    }


    body.innerHTML = `

        <div class="space-y-5">

            <div>

                <p
                    class="text-xs text-gray-500">

                    CUSTOMER

                </p>


                <p
                    class="mt-1 text-xl
                    font-black">

                    ${escapeHTML(
                        customerName(
                            customer
                        )
                    )}

                </p>

            </div>


            <div
                class="grid grid-cols-1
                gap-4 sm:grid-cols-2">

                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Email

                    </p>


                    <p
                        class="font-bold break-all">

                        ${escapeHTML(
                            customer.email ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Phone

                    </p>


                    <p
                        class="font-bold">

                        ${escapeHTML(
                            customerPhone(
                                customer
                            )
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        City

                    </p>


                    <p
                        class="font-bold">

                        ${escapeHTML(
                            customer.city ||
                            "—"
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Joined

                    </p>


                    <p
                        class="font-bold">

                        ${formatDate(
                            customer.created_at
                        )}

                    </p>

                </div>

            </div>

        </div>

    `;


    openModal(
        "customerModal"
    );

}


/* ============================================================
   CUSTOMER INIT
============================================================ */

function initCustomerSearch() {

    $("customerSearch")
        ?.addEventListener(
            "input",
            renderCustomers
        );


    $("refreshCustomers")
        ?.addEventListener(
            "click",
            loadCustomers
        );

}


/* ============================================================
   ORDERS
============================================================ */

async function loadOrders() {

    const table =
        $("ordersTableBody");


    if (!table) {

        console.warn(
            "ordersTableBody not found."
        );

        return;

    }


    tableLoading(
        "ordersTableBody",
        6
    );


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

        console.warn(
            "Orders:",
            error.message
        );


        state.orders =
            [];


        tableEmpty(
            "ordersTableBody",
            6,
            "Orders table could not be loaded."
        );


        return;

    }


    state.orders =
        data || [];


    renderOrders();

}


function orderNumber(
    order
) {

    return (
        order.order_number ||
        order.order_no ||
        order.order_id ||
        order.id ||
        "—"
    );

}


function orderCustomer(
    order
) {

    return (
        order.customer_name ||
        order.customer_email ||
        order.email ||
        order.user_email ||
        order.customer_id ||
        "Customer"
    );

}


function orderTotal(
    order
) {

    return (
        order.total ??
        order.total_amount ??
        order.grand_total ??
        order.amount ??
        0
    );

}


function renderOrders() {

    const table =
        $("ordersTableBody");


    if (!table) {
        return;
    }


    const search =
        (
            $("orderSearch")
                ?.value ||
            ""
        )
        .trim()
        .toLowerCase();


    const filtered =
        state.orders.filter(
            order => {

                const text = [

                    orderNumber(
                        order
                    ),

                    orderCustomer(
                        order
                    ),

                    order.status

                ]
                    .join(" ")
                    .toLowerCase();


                return (
                    !search ||
                    text.includes(search)
                );

            }
        );


    if (!filtered.length) {

        tableEmpty(
            "ordersTableBody",
            6,
            "No orders found."
        );


        return;

    }


    table.innerHTML =
        filtered
            .map(
                order => `

                <tr
                    class="border-b border-white/5">

                    <td
                        class="py-4 pr-4
                        font-black">

                        ${escapeHTML(
                            orderNumber(
                                order
                            )
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${escapeHTML(
                            orderCustomer(
                                order
                            )
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        font-black">

                        ${formatMoney(
                            orderTotal(
                                order
                            )
                        )}

                    </td>


                    <td class="py-4">

                        ${statusBadge(
                            order.status ||
                            "pending"
                        )}

                    </td>


                    <td
                        class="py-4 pr-4
                        text-gray-400">

                        ${formatDate(
                            order.created_at
                        )}

                    </td>


                    <td
                        class="py-4 text-right">

                        <button
                            type="button"
                            data-order-view="${escapeHTML(
                                order.id
                            )}"
                            class="rounded-lg
                            border border-white/10
                            p-2 text-gray-300
                            hover:text-orange-400">

                            <span
                                class="material-symbols-outlined">

                                visibility

                            </span>

                        </button>

                    </td>

                </tr>

            `
            )
            .join("");


    table
        .querySelectorAll(
            "[data-order-view]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const order =
                        state.orders.find(
                            item =>
                                String(item.id) ===
                                String(
                                    button.dataset.orderView
                                )
                        );


                    if (order) {

                        viewOrder(
                            order
                        );

                    }

                }
            );

        });

}


/* ============================================================
   VIEW ORDER
============================================================ */

function viewOrder(
    order
) {

    state.currentOrder =
        order;


    const body =
        $("orderModalBody");


    if (!body) {

        alert(
            "ORDER DETAILS\n\n" +

            "Order: " +
            orderNumber(order) +

            "\nCustomer: " +
            orderCustomer(order) +

            "\nTotal: " +
            formatMoney(
                orderTotal(order)
            ) +

            "\nStatus: " +
            (order.status || "pending")
        );


        return;

    }


    body.innerHTML = `

        <div class="space-y-5">

            <div>

                <p
                    class="text-xs text-gray-500">

                    ORDER NUMBER

                </p>


                <p
                    class="mt-1 text-xl
                    font-black">

                    ${escapeHTML(
                        orderNumber(
                            order
                        )
                    )}

                </p>

            </div>


            <div
                class="grid grid-cols-1
                gap-4 sm:grid-cols-2">

                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Customer

                    </p>


                    <p
                        class="font-bold">

                        ${escapeHTML(
                            orderCustomer(
                                order
                            )
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Total

                    </p>


                    <p
                        class="font-black
                        text-orange-400">

                        ${formatMoney(
                            orderTotal(
                                order
                            )
                        )}

                    </p>

                </div>


                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Status

                    </p>


                    <div class="mt-1">

                        ${statusBadge(
                            order.status ||
                            "pending"
                        )}

                    </div>

                </div>


                <div>

                    <p
                        class="text-xs
                        text-gray-500">

                        Date

                    </p>


                    <p
                        class="font-bold">

                        ${formatDate(
                            order.created_at
                        )}

                    </p>

                </div>

            </div>

        </div>

    `;


    openModal(
        "orderModal"
    );

}


/* ============================================================
   ORDER SEARCH
============================================================ */

function initOrderSearch() {

    $("orderSearch")
        ?.addEventListener(
            "input",
            renderOrders
        );


    $("refreshOrders")
        ?.addEventListener(
            "click",
            loadOrders
        );

}


/* ============================================================
   LOGOUT
============================================================ */

async function logoutAdmin() {

    try {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut();


        if (error) {

            console.error(
                "Logout error:",
                error
            );

        }

    } catch (error) {

        console.error(
            error
        );

    }


    localStorage.removeItem(
        "khelzone_role"
    );


    localStorage.removeItem(
        "khelzone_user_id"
    );


    window.location.href =
        "admin.html";

}


function initLogout() {

    [
        "logoutBtn",
        "logoutButton",
        "logoutBtnDesktop"
    ]
        .forEach(id => {

            $(id)?.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    logoutAdmin();

                }
            );

        });

}


/* ============================================================
   MODAL CLOSE
============================================================ */

function initModalClose() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    closeModal(
                        this.dataset.closeModal
                    );

                }
            );

        });


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(modal => {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        });

}


/* ============================================================
   KEYBOARD ESC
============================================================ */

function initKeyboard() {

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal-overlay"
                    )
                    .forEach(modal => {

                        modal.classList.add(
                            "hidden"
                        );

                    });


                closeMobileMenu();

            }

        }
    );

}


/* ============================================================
   INITIALIZE EVERYTHING
============================================================ */

async function initAdminDashboard() {

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


    /* First check admin */

    const allowed =
        await checkAdminAccess();


    if (!allowed) {

        console.warn(
            "Admin access denied."
        );

        return;

    }


    console.log(
        "Admin verified:"
    );

    console.log(
        state.user.email
    );


    /* Navigation */

    initNavigation();


    /* Mobile menu */

    initMobileMenu();


    /* Logout */

    initLogout();


    /* Modals */

    initModalClose();


    /* Keyboard */

    initKeyboard();


    /* Searches */

    initProductSearch();

    initSellerSearch();

    initCustomerSearch();

    initOrderSearch();


    /* Dashboard */

    await loadDashboardData();


    /* Open Dashboard */

    showSection(
        "dashboard"
    );


    console.log(
        "KHELZONE Admin Dashboard READY."
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
        initAdminDashboard
    );

} else {

    initAdminDashboard();

}