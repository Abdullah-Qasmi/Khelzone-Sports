/* =============================================================
   KHELZONE ADMIN DASHBOARD - MAIN JS
   =============================================================
   ASSUMED DATABASE SCHEMA (Supabase / Postgres)
   -------------------------------------------------------------
   Adjust the table/column names below in the marked query
   sections if your actual schema differs.

   profiles
     id          uuid (PK, matches auth.users.id)
     full_name   text
     email       text
     phone       text
     role        text   ("admin" | "seller" | "customer")
     status      text   ("pending" | "approved" | "rejected")  -- sellers only
     shop_name   text                                          -- sellers only
     is_active   boolean
     created_at  timestamp

   products
     id          uuid / int (PK)
     name        text
     sport       text
     category    text
     price       numeric
     stock       int
     image_url   text
     is_active   boolean
     seller_id   uuid (FK -> profiles.id)
     created_at  timestamp

   orders
     id             uuid / int (PK)
     order_number   text
     customer_id    uuid (FK -> profiles.id)
     customer_name  text
     customer_email text
     total_amount   numeric
     status         text ("pending"|"processing"|"shipped"|"delivered"|"cancelled")
     items          jsonb   -- array of { name, qty, price }
     created_at     timestamp
============================================================== */

/* =============================================================
   SUPABASE CONFIG
============================================================== */

const SUPABASE_URL = "https://antqexjhlsaynunlmzqa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

/* =============================================================
   STATE
============================================================== */

const state = {
    products: [],
    sellers: [],
    customers: [],
    orders: [],
    currentSellerId: null,
    currentCustomerId: null,
    currentOrderId: null,
    confirmCallback: null
};

/* =============================================================
   ELEMENT REFS
============================================================== */

const checkingScreen = document.getElementById("checkingScreen");
const dashboard = document.getElementById("dashboard");
const adminName = document.getElementById("adminName");
const adminEmail = document.getElementById("adminEmail");
const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const PAGE_META = {
    dashboard: { title: "Admin Dashboard", subtitle: "Manage your KHELZONE marketplace" },
    products:  { title: "Products",        subtitle: "Manage marketplace products" },
    sellers:   { title: "Sellers",         subtitle: "Manage sellers & approve applications" },
    customers: { title: "Customers",       subtitle: "View and manage registered customers" },
    orders:    { title: "Orders",          subtitle: "Manage marketplace orders" }
};

/* =============================================================
   UTILITIES
============================================================== */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(amount) {
    return "Rs. " + Number(amount || 0).toLocaleString();
}

function formatDate(value) {
    if (!value) return "—";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity .25s ease";
        setTimeout(() => toast.remove(), 250);
    }, 3200);
}

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function openConfirm(message, onConfirm, title = "Are you sure?") {
    document.getElementById("confirmModalTitle").textContent = title;
    document.getElementById("confirmModalMessage").textContent = message;
    state.confirmCallback = onConfirm;
    openModal("confirmModal");
}

function statusBadge(text, colorClass) {
    return `<span class="badge ${colorClass}">${escapeHtml(text)}</span>`;
}

function activeBadge(isActive) {
    return isActive
        ? statusBadge("Active", "badge-green")
        : statusBadge("Inactive", "badge-gray");
}

function sellerStatusBadge(status) {
    const s = (status || "pending").toLowerCase();
    if (s === "approved") return statusBadge("Approved", "badge-green");
    if (s === "rejected") return statusBadge("Rejected", "badge-red");
    return statusBadge("Pending", "badge-yellow");
}

function orderStatusBadge(status) {
    const map = {
        pending: "badge-yellow",
        processing: "badge-blue",
        shipped: "badge-purple",
        delivered: "badge-green",
        cancelled: "badge-red"
    };
    const s = (status || "pending").toLowerCase();
    return statusBadge(s.charAt(0).toUpperCase() + s.slice(1), map[s] || "badge-gray");
}

/* =============================================================
   REDIRECT
============================================================== */

function redirectToLogin() {
    window.location.replace("login.html");
}

/* =============================================================
   ADMIN AUTH CHECK
============================================================== */

async function checkAdminAccess() {
    try {
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();

        if (userError) {
            console.error("GET USER ERROR:", userError);
            redirectToLogin();
            return;
        }

        const user = userData?.user;

        if (!user) {
            redirectToLogin();
            return;
        }

        const { data: profile, error: profileError } = await supabaseClient
            .from("profiles")
            .select("id, full_name, email, role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        if (!profile) {
            redirectToLogin();
            return;
        }

        const role = String(profile.role || "").toLowerCase().trim();

        if (role !== "admin") {
            alert("Access denied. Admin account required.");
            redirectToLogin();
            return;
        }

        localStorage.setItem("khelzone_role", "admin");
        localStorage.setItem("khelzone_user_id", user.id);

        adminName.textContent = profile.full_name || "Admin";
        adminEmail.textContent = profile.email || user.email || "";

        checkingScreen.classList.add("hidden");
        dashboard.classList.remove("hidden");

        initNavigation();
        initModals();
        initProducts();
        initSellers();
        initCustomers();
        initOrders();
        initMobileMenu();
        initLogout();

        await loadDashboardData();

    } catch (error) {
        console.error("ADMIN AUTHENTICATION ERROR:", error);
        alert("Could not verify admin access. Check browser console.");
        redirectToLogin();
    }
}

/* =============================================================
   NAVIGATION
============================================================== */

function initNavigation() {
    document.querySelectorAll(".nav-item[data-page]").forEach(btn => {
        btn.addEventListener("click", () => goToPage(btn.dataset.page));
    });

    document.querySelectorAll(".quick-action[data-page]").forEach(btn => {
        btn.addEventListener("click", () => {
            goToPage(btn.dataset.page);
            if (btn.dataset.action === "add-product") {
                setTimeout(() => openProductModal(), 150);
            }
        });
    });
}

function goToPage(page) {
    document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("hidden"));
    document.getElementById(`page-${page}`).classList.remove("hidden");

    document.querySelectorAll(".nav-item[data-page]").forEach(btn => {
        const isActive = btn.dataset.page === page;
        btn.classList.toggle("active", isActive);
        btn.classList.toggle("text-gray-400", !isActive);
    });

    const meta = PAGE_META[page];
    if (meta) {
        pageTitle.textContent = meta.title;
        pageSubtitle.textContent = meta.subtitle;
    }

    closeMobileMenu();

    if (page === "products" && state.products.length === 0) loadProducts();
    if (page === "sellers" && state.sellers.length === 0) loadSellers();
    if (page === "customers" && state.customers.length === 0) loadCustomers();
    if (page === "orders" && state.orders.length === 0) loadOrders();
}

/* =============================================================
   MODAL GLOBAL HANDLERS
============================================================== */

function initModals() {
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
        btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
    });

    document.querySelectorAll(".modal-overlay").forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.classList.add("hidden");
        });
    });

    document.getElementById("confirmModalConfirmBtn").addEventListener("click", async () => {
        const cb = state.confirmCallback;
        closeModal("confirmModal");
        if (typeof cb === "function") await cb();
    });
}

/* =============================================================
   DASHBOARD DATA
============================================================== */

async function loadDashboardData() {
    await Promise.all([
        loadDashboardStats(),
        loadRecentProducts()
    ]);
}

async function loadDashboardStats() {
    try {
        const [
            { count: totalProducts },
            { count: sellersCount },
            { count: customersCount },
            { count: ordersCount },
            { count: pendingSellers }
        ] = await Promise.all([
            supabaseClient.from("products").select("*", { count: "exact", head: true }),
            supabaseClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller"),
            supabaseClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
            supabaseClient.from("orders").select("*", { count: "exact", head: true }),
            supabaseClient.from("profiles").select("*", { count: "exact", head: true }).eq("role", "seller").eq("status", "pending")
        ]);

        document.getElementById("productsCount").textContent = totalProducts ?? 0;
        document.getElementById("sellersCount").textContent = sellersCount ?? 0;
        document.getElementById("customersCount").textContent = customersCount ?? 0;
        document.getElementById("ordersCount").textContent = ordersCount ?? 0;

        const badge = document.getElementById("sellerPendingBadge");
        if (pendingSellers && pendingSellers > 0) {
            badge.textContent = pendingSellers;
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }

    } catch (error) {
        console.error("DASHBOARD STATS ERROR:", error);
        ["productsCount", "sellersCount", "customersCount", "ordersCount"].forEach(id => {
            document.getElementById(id).textContent = "0";
        });
    }
}

async function loadRecentProducts() {
    const table = document.getElementById("recentProductsTable");
    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("name, sport, price, stock, is_active")
            .order("created_at", { ascending: false })
            .limit(6);

        if (error) throw error;

        if (!data || data.length === 0) {
            table.innerHTML = `<tr><td colspan="5" class="empty-row">No products found.</td></tr>`;
            return;
        }

        table.innerHTML = data.map(p => `
            <tr>
                <td class="font-bold">${escapeHtml(p.name || "Unnamed")}</td>
                <td class="text-gray-400">${escapeHtml(p.sport || "—")}</td>
                <td class="font-bold">${formatCurrency(p.price)}</td>
                <td class="text-gray-400">${p.stock ?? 0}</td>
                <td>${activeBadge(p.is_active)}</td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("RECENT PRODUCTS ERROR:", error);
        table.innerHTML = `<tr><td colspan="5" class="empty-row">Could not load products.</td></tr>`;
    }
}

document.getElementById("refreshDashboard").addEventListener("click", loadDashboardData);

/* =============================================================
   PRODUCTS
============================================================== */

function initProducts() {
    document.getElementById("addProductBtn").addEventListener("click", () => openProductModal());
    document.getElementById("refreshProducts").addEventListener("click", loadProducts);
    document.getElementById("productSearch").addEventListener("input", renderProductsTable);
    document.getElementById("productSportFilter").addEventListener("change", renderProductsTable);
    document.getElementById("productStatusFilter").addEventListener("change", renderProductsTable);
    document.getElementById("productForm").addEventListener("submit", saveProduct);
}

async function loadProducts() {
    const table = document.getElementById("productsTable");
    table.innerHTML = `<tr><td colspan="7" class="empty-row">Loading products...</td></tr>`;

    try {
        const { data, error } = await supabaseClient
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        state.products = data || [];
        populateSportFilter();
        renderProductsTable();

    } catch (error) {
        console.error("LOAD PRODUCTS ERROR:", error);
        table.innerHTML = `<tr><td colspan="7" class="empty-row">Could not load products.</td></tr>`;
    }
}

function populateSportFilter() {
    const select = document.getElementById("productSportFilter");
    const current = select.value;
    const sports = [...new Set(state.products.map(p => p.sport).filter(Boolean))].sort();

    select.innerHTML = `<option value="">All Sports</option>` +
        sports.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");

    select.value = current;
}

function renderProductsTable() {
    const table = document.getElementById("productsTable");
    const search = document.getElementById("productSearch").value.trim().toLowerCase();
    const sportFilter = document.getElementById("productSportFilter").value;
    const statusFilter = document.getElementById("productStatusFilter").value;

    let filtered = state.products.filter(p => {
        const matchesSearch = !search ||
            (p.name || "").toLowerCase().includes(search) ||
            (p.category || "").toLowerCase().includes(search);
        const matchesSport = !sportFilter || p.sport === sportFilter;
        const matchesStatus = !statusFilter ||
            (statusFilter === "active" ? !!p.is_active : !p.is_active);
        return matchesSearch && matchesSport && matchesStatus;
    });

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="7" class="empty-row">No products match your search.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(p => `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <img src="${escapeHtml(p.image_url || '')}" onerror="this.style.visibility='hidden'" class="row-thumb" alt="">
                    <span class="font-bold">${escapeHtml(p.name || "Unnamed")}</span>
                </div>
            </td>
            <td class="text-gray-400">${escapeHtml(p.sport || "—")}</td>
            <td class="text-gray-400">${escapeHtml(p.category || "—")}</td>
            <td class="font-bold">${formatCurrency(p.price)}</td>
            <td class="text-gray-400">${p.stock ?? 0}</td>
            <td>${activeBadge(p.is_active)}</td>
            <td>
                <div class="action-cell">
                    <button class="btn-icon" title="Edit" data-edit-product="${p.id}">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="btn-icon" title="${p.is_active ? 'Deactivate' : 'Activate'}" data-toggle-product="${p.id}">
                        <span class="material-symbols-outlined">${p.is_active ? 'toggle_on' : 'toggle_off'}</span>
                    </button>
                    <button class="btn-icon danger" title="Delete" data-delete-product="${p.id}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    table.querySelectorAll("[data-edit-product]").forEach(btn => {
        btn.addEventListener("click", () => openProductModal(btn.dataset.editProduct));
    });
    table.querySelectorAll("[data-toggle-product]").forEach(btn => {
        btn.addEventListener("click", () => toggleProductActive(btn.dataset.toggleProduct));
    });
    table.querySelectorAll("[data-delete-product]").forEach(btn => {
        btn.addEventListener("click", () => confirmDeleteProduct(btn.dataset.deleteProduct));
    });
}

function openProductModal(id = null) {
    const form = document.getElementById("productForm");
    form.reset();
    document.getElementById("productId").value = "";
    document.getElementById("productActive").checked = true;

    if (id) {
        const product = state.products.find(p => String(p.id) === String(id));
        if (!product) return;

        document.getElementById("productModalTitle").textContent = "Edit Product";
        document.getElementById("productId").value = product.id;
        document.getElementById("productName").value = product.name || "";
        document.getElementById("productSport").value = product.sport || "";
        document.getElementById("productCategory").value = product.category || "";
        document.getElementById("productPrice").value = product.price || 0;
        document.getElementById("productStock").value = product.stock || 0;
        document.getElementById("productImage").value = product.image_url || "";
        document.getElementById("productActive").checked = !!product.is_active;
    } else {
        document.getElementById("productModalTitle").textContent = "Add Product";
    }

    openModal("productModal");
}

async function saveProduct(e) {
    e.preventDefault();

    const id = document.getElementById("productId").value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    const payload = {
        name: document.getElementById("productName").value.trim(),
        sport: document.getElementById("productSport").value.trim(),
        category: document.getElementById("productCategory").value.trim(),
        price: parseFloat(document.getElementById("productPrice").value) || 0,
        stock: parseInt(document.getElementById("productStock").value) || 0,
        image_url: document.getElementById("productImage").value.trim(),
        is_active: document.getElementById("productActive").checked
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
        if (id) {
            const { error } = await supabaseClient.from("products").update(payload).eq("id", id);
            if (error) throw error;
            showToast("Product updated successfully.", "success");
        } else {
            const { error } = await supabaseClient.from("products").insert([payload]);
            if (error) throw error;
            showToast("Product added successfully.", "success");
        }

        closeModal("productModal");
        await loadProducts();
        await loadDashboardStats();

    } catch (error) {
        console.error("SAVE PRODUCT ERROR:", error);
        showToast("Could not save product. " + (error.message || ""), "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Product";
    }
}

async function toggleProductActive(id) {
    const product = state.products.find(p => String(p.id) === String(id));
    if (!product) return;

    try {
        const { error } = await supabaseClient
            .from("products")
            .update({ is_active: !product.is_active })
            .eq("id", id);

        if (error) throw error;

        showToast(`Product ${!product.is_active ? "activated" : "deactivated"}.`, "success");
        await loadProducts();

    } catch (error) {
        console.error("TOGGLE PRODUCT ERROR:", error);
        showToast("Could not update product status.", "error");
    }
}

function confirmDeleteProduct(id) {
    const product = state.products.find(p => String(p.id) === String(id));
    openConfirm(
        `Delete "${product ? product.name : "this product"}"? This cannot be undone.`,
        () => deleteProduct(id),
        "Delete Product"
    );
}

async function deleteProduct(id) {
    try {
        const { error } = await supabaseClient.from("products").delete().eq("id", id);
        if (error) throw error;

        showToast("Product deleted.", "success");
        await loadProducts();
        await loadDashboardStats();

    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        showToast("Could not delete product.", "error");
    }
}

/* =============================================================
   SELLERS
============================================================== */

function initSellers() {
    document.getElementById("refreshSellers").addEventListener("click", loadSellers);
    document.getElementById("sellerSearch").addEventListener("input", renderSellersTable);
    document.getElementById("sellerStatusFilter").addEventListener("change", renderSellersTable);
}

async function loadSellers() {
    const table = document.getElementById("sellersTable");
    table.innerHTML = `<tr><td colspan="6" class="empty-row">Loading sellers...</td></tr>`;

    try {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("role", "seller")
            .order("created_at", { ascending: false });

        if (error) throw error;

        state.sellers = data || [];
        renderSellersTable();

    } catch (error) {
        console.error("LOAD SELLERS ERROR:", error);
        table.innerHTML = `<tr><td colspan="6" class="empty-row">Could not load sellers.</td></tr>`;
    }
}

function renderSellersTable() {
    const table = document.getElementById("sellersTable");
    const search = document.getElementById("sellerSearch").value.trim().toLowerCase();
    const statusFilter = document.getElementById("sellerStatusFilter").value;

    let filtered = state.sellers.filter(s => {
        const matchesSearch = !search ||
            (s.full_name || "").toLowerCase().includes(search) ||
            (s.email || "").toLowerCase().includes(search) ||
            (s.shop_name || "").toLowerCase().includes(search);
        const matchesStatus = !statusFilter || (s.status || "pending") === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="empty-row">No sellers match your search.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(s => `
        <tr>
            <td class="font-bold">${escapeHtml(s.full_name || "Unnamed")}</td>
            <td class="text-gray-400">${escapeHtml(s.shop_name || "—")}</td>
            <td class="text-gray-400">${escapeHtml(s.email || "—")}</td>
            <td class="text-gray-400">${formatDate(s.created_at)}</td>
            <td>${sellerStatusBadge(s.status)}</td>
            <td>
                <div class="action-cell">
                    <button class="btn-icon" title="View" data-view-seller="${s.id}">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    table.querySelectorAll("[data-view-seller]").forEach(btn => {
        btn.addEventListener("click", () => openSellerModal(btn.dataset.viewSeller));
    });
}

function openSellerModal(id) {
    const seller = state.sellers.find(s => String(s.id) === String(id));
    if (!seller) return;

    state.currentSellerId = id;
    const status = (seller.status || "pending").toLowerCase();

    document.getElementById("sellerModalBody").innerHTML = `
        <div class="detail-row"><span class="detail-label">Full Name</span><span class="detail-value">${escapeHtml(seller.full_name || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Shop Name</span><span class="detail-value">${escapeHtml(seller.shop_name || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(seller.email || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(seller.phone || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Applied On</span><span class="detail-value">${formatDate(seller.created_at)}</span></div>
        <div class="detail-row"><span class="detail-label">Application Status</span><span class="detail-value">${sellerStatusBadge(seller.status)}</span></div>
        <div class="detail-row"><span class="detail-label">Account Status</span><span class="detail-value">${activeBadge(seller.is_active)}</span></div>
    `;

    const actions = document.getElementById("sellerModalActions");
    let html = "";

    if (status === "pending") {
        html += `<button class="btn-ghost" id="rejectSellerBtn"><span class="material-symbols-outlined text-base">close</span>Reject</button>`;
        html += `<button class="btn-primary" id="approveSellerBtn"><span class="material-symbols-outlined text-base">check</span>Approve</button>`;
    } else if (status === "approved") {
        html += `<button class="${seller.is_active ? 'btn-danger' : 'btn-primary'}" id="toggleSellerActiveBtn">
                    <span class="material-symbols-outlined text-base">${seller.is_active ? 'block' : 'check_circle'}</span>
                    ${seller.is_active ? 'Deactivate Seller' : 'Activate Seller'}
                 </button>`;
    } else if (status === "rejected") {
        html += `<button class="btn-primary" id="approveSellerBtn"><span class="material-symbols-outlined text-base">check</span>Approve Anyway</button>`;
    }

    actions.innerHTML = html;

    const approveBtn = document.getElementById("approveSellerBtn");
    const rejectBtn = document.getElementById("rejectSellerBtn");
    const toggleBtn = document.getElementById("toggleSellerActiveBtn");

    if (approveBtn) approveBtn.addEventListener("click", () => updateSellerStatus(id, "approved"));
    if (rejectBtn) rejectBtn.addEventListener("click", () => {
        openConfirm("Reject this seller's application?", () => updateSellerStatus(id, "rejected"), "Reject Application");
    });
    if (toggleBtn) toggleBtn.addEventListener("click", () => toggleSellerActive(id, seller.is_active));

    openModal("sellerModal");
}

async function updateSellerStatus(id, status) {
    try {
        const payload = { status };
        if (status === "approved") payload.is_active = true;

        const { error } = await supabaseClient.from("profiles").update(payload).eq("id", id);
        if (error) throw error;

        showToast(`Seller ${status === "approved" ? "approved" : "rejected"}.`, "success");
        closeModal("sellerModal");
        await loadSellers();
        await loadDashboardStats();

    } catch (error) {
        console.error("UPDATE SELLER STATUS ERROR:", error);
        showToast("Could not update seller status.", "error");
    }
}

async function toggleSellerActive(id, currentActive) {
    try {
        const { error } = await supabaseClient
            .from("profiles")
            .update({ is_active: !currentActive })
            .eq("id", id);

        if (error) throw error;

        showToast(`Seller ${!currentActive ? "activated" : "deactivated"}.`, "success");
        closeModal("sellerModal");
        await loadSellers();

    } catch (error) {
        console.error("TOGGLE SELLER ERROR:", error);
        showToast("Could not update seller.", "error");
    }
}

/* =============================================================
   CUSTOMERS
============================================================== */

function initCustomers() {
    document.getElementById("refreshCustomers").addEventListener("click", loadCustomers);
    document.getElementById("customerSearch").addEventListener("input", renderCustomersTable);
}

async function loadCustomers() {
    const table = document.getElementById("customersTable");
    table.innerHTML = `<tr><td colspan="6" class="empty-row">Loading customers...</td></tr>`;

    try {
        const { data, error } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("role", "customer")
            .order("created_at", { ascending: false });

        if (error) throw error;

        state.customers = data || [];
        renderCustomersTable();

    } catch (error) {
        console.error("LOAD CUSTOMERS ERROR:", error);
        table.innerHTML = `<tr><td colspan="6" class="empty-row">Could not load customers.</td></tr>`;
    }
}

function renderCustomersTable() {
    const table = document.getElementById("customersTable");
    const search = document.getElementById("customerSearch").value.trim().toLowerCase();

    let filtered = state.customers.filter(c => {
        return !search ||
            (c.full_name || "").toLowerCase().includes(search) ||
            (c.email || "").toLowerCase().includes(search) ||
            (c.phone || "").toLowerCase().includes(search);
    });

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="empty-row">No customers match your search.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(c => `
        <tr>
            <td class="font-bold">${escapeHtml(c.full_name || "Unnamed")}</td>
            <td class="text-gray-400">${escapeHtml(c.email || "—")}</td>
            <td class="text-gray-400">${escapeHtml(c.phone || "—")}</td>
            <td class="text-gray-400">${formatDate(c.created_at)}</td>
            <td>${activeBadge(c.is_active !== false)}</td>
            <td>
                <div class="action-cell">
                    <button class="btn-icon" title="View" data-view-customer="${c.id}">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    table.querySelectorAll("[data-view-customer]").forEach(btn => {
        btn.addEventListener("click", () => openCustomerModal(btn.dataset.viewCustomer));
    });
}

function openCustomerModal(id) {
    const customer = state.customers.find(c => String(c.id) === String(id));
    if (!customer) return;

    state.currentCustomerId = id;
    const isActive = customer.is_active !== false;

    document.getElementById("customerModalBody").innerHTML = `
        <div class="detail-row"><span class="detail-label">Full Name</span><span class="detail-value">${escapeHtml(customer.full_name || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(customer.email || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${escapeHtml(customer.phone || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Joined</span><span class="detail-value">${formatDate(customer.created_at)}</span></div>
        <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${activeBadge(isActive)}</span></div>
    `;

    document.getElementById("customerModalActions").innerHTML = `
        <button class="${isActive ? 'btn-danger' : 'btn-primary'}" id="toggleCustomerActiveBtn">
            <span class="material-symbols-outlined text-base">${isActive ? 'block' : 'check_circle'}</span>
            ${isActive ? 'Deactivate' : 'Activate'}
        </button>
    `;

    document.getElementById("toggleCustomerActiveBtn").addEventListener("click", () => {
        toggleCustomerActive(id, isActive);
    });

    openModal("customerModal");
}

async function toggleCustomerActive(id, currentActive) {
    try {
        const { error } = await supabaseClient
            .from("profiles")
            .update({ is_active: !currentActive })
            .eq("id", id);

        if (error) throw error;

        showToast(`Customer ${!currentActive ? "activated" : "deactivated"}.`, "success");
        closeModal("customerModal");
        await loadCustomers();

    } catch (error) {
        console.error("TOGGLE CUSTOMER ERROR:", error);
        showToast("Could not update customer.", "error");
    }
}

/* =============================================================
   ORDERS
============================================================== */

function initOrders() {
    document.getElementById("refreshOrders").addEventListener("click", loadOrders);
    document.getElementById("orderSearch").addEventListener("input", renderOrdersTable);
    document.getElementById("orderStatusFilter").addEventListener("change", renderOrdersTable);
    document.getElementById("updateOrderStatusBtn").addEventListener("click", updateOrderStatus);
}

async function loadOrders() {
    const table = document.getElementById("ordersTable");
    table.innerHTML = `<tr><td colspan="6" class="empty-row">Loading orders...</td></tr>`;

    try {
        const { data, error } = await supabaseClient
            .from("orders")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        state.orders = data || [];
        renderOrdersTable();

    } catch (error) {
        console.error("LOAD ORDERS ERROR:", error);
        table.innerHTML = `<tr><td colspan="6" class="empty-row">Could not load orders.</td></tr>`;
    }
}

function renderOrdersTable() {
    const table = document.getElementById("ordersTable");
    const search = document.getElementById("orderSearch").value.trim().toLowerCase();
    const statusFilter = document.getElementById("orderStatusFilter").value;

    let filtered = state.orders.filter(o => {
        const matchesSearch = !search ||
            (o.order_number || "").toLowerCase().includes(search) ||
            (o.customer_name || "").toLowerCase().includes(search) ||
            (o.customer_email || "").toLowerCase().includes(search);
        const matchesStatus = !statusFilter || (o.status || "pending") === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        table.innerHTML = `<tr><td colspan="6" class="empty-row">No orders match your search.</td></tr>`;
        return;
    }

    table.innerHTML = filtered.map(o => `
        <tr>
            <td class="font-bold">${escapeHtml(o.order_number || o.id)}</td>
            <td class="text-gray-400">${escapeHtml(o.customer_name || o.customer_email || "—")}</td>
            <td class="font-bold">${formatCurrency(o.total_amount)}</td>
            <td>${orderStatusBadge(o.status)}</td>
            <td class="text-gray-400">${formatDate(o.created_at)}</td>
            <td>
                <div class="action-cell">
                    <button class="btn-icon" title="View" data-view-order="${o.id}">
                        <span class="material-symbols-outlined">visibility</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    table.querySelectorAll("[data-view-order]").forEach(btn => {
        btn.addEventListener("click", () => openOrderModal(btn.dataset.viewOrder));
    });
}

function openOrderModal(id) {
    const order = state.orders.find(o => String(o.id) === String(id));
    if (!order) return;

    state.currentOrderId = id;

    let itemsHtml = "";
    if (Array.isArray(order.items) && order.items.length > 0) {
        itemsHtml = order.items.map(item => `
            <div class="detail-row">
                <span class="detail-label">${escapeHtml(item.name || "Item")} × ${item.qty ?? 1}</span>
                <span class="detail-value">${formatCurrency(item.price)}</span>
            </div>
        `).join("");
    } else {
        itemsHtml = `<p class="text-sm text-gray-500">No item breakdown available.</p>`;
    }

    document.getElementById("orderModalBody").innerHTML = `
        <div class="detail-row"><span class="detail-label">Order Number</span><span class="detail-value">${escapeHtml(order.order_number || order.id)}</span></div>
        <div class="detail-row"><span class="detail-label">Customer</span><span class="detail-value">${escapeHtml(order.customer_name || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${escapeHtml(order.customer_email || "—")}</span></div>
        <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${formatDate(order.created_at)}</span></div>
        <div class="detail-row"><span class="detail-label">Total</span><span class="detail-value">${formatCurrency(order.total_amount)}</span></div>
        <div class="mt-3">
            <p class="form-label mb-2">Items</p>
            ${itemsHtml}
        </div>
    `;

    document.getElementById("orderStatusSelect").value = (order.status || "pending").toLowerCase();

    openModal("orderModal");
}

async function updateOrderStatus() {
    const id = state.currentOrderId;
    if (!id) return;

    const newStatus = document.getElementById("orderStatusSelect").value;
    const btn = document.getElementById("updateOrderStatusBtn");

    btn.disabled = true;
    btn.textContent = "Updating...";

    try {
        const { error } = await supabaseClient
            .from("orders")
            .update({ status: newStatus })
            .eq("id", id);

        if (error) throw error;

        showToast("Order status updated.", "success");
        closeModal("orderModal");
        await loadOrders();

    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        showToast("Could not update order status.", "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Update Status";
    }
}

/* =============================================================
   LOGOUT
============================================================== */

function initLogout() {
    document.getElementById("logoutBtn").addEventListener("click", async () => {
        try {
            await supabaseClient.auth.signOut();
        } catch (error) {
            console.error("LOGOUT ERROR:", error);
        }

        localStorage.removeItem("khelzone_role");
        localStorage.removeItem("khelzone_user_id");
        localStorage.removeItem("khelzone_email");

        window.location.replace("login.html");
    });
}

/* =============================================================
   MOBILE MENU
============================================================== */

function initMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileOverlay = document.getElementById("mobileOverlay");

    mobileMenuBtn.addEventListener("click", openMobileMenuFn);
    mobileOverlay.addEventListener("click", closeMobileMenu);
}

function openMobileMenuFn() {
    document.getElementById("sidebar").classList.remove("-translate-x-full");
    document.getElementById("mobileOverlay").classList.remove("hidden");
}

function closeMobileMenu() {
    document.getElementById("sidebar").classList.add("-translate-x-full");
    document.getElementById("mobileOverlay").classList.add("hidden");
}

/* =============================================================
   START
============================================================== */

checkAdminAccess();