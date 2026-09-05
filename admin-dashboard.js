/* ============================================================
   KHELZONE ADMIN DASHBOARD
   FULL FIXED VERSION
   ADMIN ONLY
============================================================ */

'use strict';


/* ============================================================
   SUPABASE
============================================================ */

const supabaseClient = window.supabaseClient;

if (!supabaseClient) {
    console.error(
        'KHELZONE ERROR: Supabase client not found.'
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
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* ============================================================
   MONEY
============================================================ */

function formatMoney(value) {

    const number = Number(
        value ?? 0
    );

    if (!Number.isFinite(number)) {
        return 'Rs. 0';
    }

    return (
        'Rs. ' +
        number.toLocaleString('en-PK')
    );
}


/* ============================================================
   DATE
============================================================ */

function formatDate(value) {

    if (!value) {
        return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleDateString(
        'en-PK',
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
    );
}


/* ============================================================
   INITIALS
============================================================ */

function initials(name) {

    if (!name) {
        return 'U';
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
            .join('')
        || 'U'
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
                colspan='${colspan}'
                style='
                    text-align:center;
                    padding:35px 20px;
                    color:#999;
                    font-weight:600;
                '
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

    let toast = $('adminToast');

    if (!toast) {

        toast =
            document.createElement('div');

        toast.id = 'adminToast';

        Object.assign(
            toast.style,
            {
                position: 'fixed',
                right: '20px',
                bottom: '20px',
                zIndex: '999999',
                padding: '14px 20px',
                borderRadius: '10px',
                background: '#ff5a00',
                color: '#fff',
                fontWeight: '800',
                boxShadow:
                    '0 10px 30px rgba(0,0,0,.4)',
                maxWidth: '90%',
                transition: 'opacity .2s ease'
            }
        );

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.display = 'block';

    clearTimeout(
        window.kzToastTimer
    );

    window.kzToastTimer =
        setTimeout(
            () => {

                toast.style.opacity = '0';

                setTimeout(
                    () => {
                        toast.style.display =
                            'none';
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
        $('checkingScreen');

    const dashboard =
        $('dashboard');

    const accessDenied =
        $('accessDenied');


    if (dashboard) {
        dashboard.classList.add('hidden');
    }

    if (accessDenied) {
        accessDenied.style.display = 'none';
    }

    if (checkingScreen) {
        checkingScreen.style.display = 'flex';
    }


    try {

        if (!supabaseClient) {
            throw new Error(
                'Supabase client is not initialized.'
            );
        }


        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (sessionError) {
            throw sessionError;
        }


        const session =
            sessionData?.session;


        if (!session?.user) {

            console.warn(
                'KHELZONE: No logged-in user.'
            );

            window.location.replace(
                'admin.html'
            );

            return false;
        }


        const user =
            session.user;


        console.log(
            'KHELZONE LOGGED USER:',
            user.email
        );


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from('profiles')
                .select(
                    'id, email, full_name, role'
                )
                .eq(
                    'id',
                    user.id
                )
                .maybeSingle();


        if (profileError) {
            throw profileError;
        }


        console.log(
            'KHELZONE ADMIN PROFILE:',
            profile
        );


        if (
            !profile ||
            profile.role !== 'admin'
        ) {

            console.warn(
                'KHELZONE: User is not admin.'
            );

            if (checkingScreen) {
                checkingScreen.style.display =
                    'none';
            }

            if (dashboard) {
                dashboard.classList.add(
                    'hidden'
                );
            }

            if (accessDenied) {
                accessDenied.style.display =
                    'flex';
            }

            return false;
        }


        console.log(
            'KHELZONE ADMIN VERIFIED:',
            user.id
        );


        localStorage.setItem(
            'khelzone_role',
            'admin'
        );

        localStorage.setItem(
            'khelzone_user_id',
            user.id
        );


        const adminName =
            profile.full_name ||
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email?.split('@')[0] ||
            'Admin';


        const adminEmail =
            user.email ||
            profile.email ||
            '-';


        if ($('adminName')) {
            $('adminName').textContent =
                adminName;
        }


        if ($('adminEmail')) {
            $('adminEmail').textContent =
                adminEmail;
        }


        if (checkingScreen) {
            checkingScreen.style.display =
                'none';
        }


        if (dashboard) {
            dashboard.classList.remove(
                'hidden'
            );
        }


        return true;


    } catch (error) {

        console.error(
            'KHELZONE ADMIN ACCESS ERROR:',
            error
        );


        if (checkingScreen) {
            checkingScreen.style.display =
                'none';
        }


        if (dashboard) {
            dashboard.classList.add(
                'hidden'
            );
        }


        if (accessDenied) {
            accessDenied.style.display =
                'flex';
        }


        return false;
    }
}


/* ============================================================
   SHOW SECTION
   IMPORTANT:
   HTML USES .section + .section.active
============================================================ */

function showSection(sectionId) {

    if (!sectionId) {
        return;
    }


    const sections =
        document.querySelectorAll(
            '.section'
        );


    sections.forEach(
        section => {
            section.classList.remove(
                'active'
            );
        }
    );


    const target =
        $(sectionId);


    if (target) {

        target.classList.add(
            'active'
        );
    }


    const links =
        document.querySelectorAll(
            '[data-section]'
        );


    links.forEach(
        link => {

            const linkSection =
                link.getAttribute(
                    'data-section'
                );


            if (
                linkSection ===
                sectionId
            ) {

                link.classList.add(
                    'active'
                );

            } else {

                link.classList.remove(
                    'active'
                );
            }
        }
    );


    const pageTitle =
        $('pageTitle');


    if (pageTitle) {

        const titles = {

            dashboardSection:
                'Dashboard',

            productsSection:
                'Products',

            sellersSection:
                'Sellers',

            customersSection:
                'Customers',

            ordersSection:
                'Orders'
        };


        pageTitle.textContent =
            titles[sectionId] ||
            'Dashboard';
    }


    closeMobileMenu();
}


/* ============================================================
   NAVIGATION
============================================================ */

function initNavigation() {

    const links =
        document.querySelectorAll(
            '[data-section]'
        );


    links.forEach(
        link => {

            link.addEventListener(
                'click',
                event => {

                    event.preventDefault();

                    const sectionId =
                        link.getAttribute(
                            'data-section'
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
        document.createElement('div');


    mobileOverlay.id =
        'kzMobileOverlay';


    Object.assign(
        mobileOverlay.style,
        {
            position: 'fixed',
            inset: '0',
            background:
                'rgba(0,0,0,.65)',
            zIndex: '99',
            display: 'none'
        }
    );


    mobileOverlay.addEventListener(
        'click',
        closeMobileMenu
    );


    document.body.appendChild(
        mobileOverlay
    );


    return mobileOverlay;
}


function openMobileMenu() {

    const sidebar =
        $('sidebar');

    const overlay =
        createMobileOverlay();


    if (sidebar) {

        sidebar.classList.add(
            'mobile-open'
        );
    }


    if (overlay) {

        overlay.style.display =
            'block';
    }
}


function closeMobileMenu() {

    const sidebar =
        $('sidebar');


    if (sidebar) {

        sidebar.classList.remove(
            'mobile-open'
        );
    }


    if (mobileOverlay) {

        mobileOverlay.style.display =
            'none';
    }
}


function initMobileMenu() {

    const button =
        $('mobileMenuBtn');


    if (!button) {
        return;
    }


    button.addEventListener(
        'click',
        () => {

            const sidebar =
                $('sidebar');


            if (
                sidebar &&
                sidebar.classList.contains(
                    'mobile-open'
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
                    '*',
                    {
                        count: 'exact',
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
                .from('profiles')
                .select(
                    '*',
                    {
                        count: 'exact',
                        head: true
                    }
                )
                .eq(
                    'role',
                    'customer'
                );


        if (error) {

            console.error(
                'Customer count error:',
                error
            );

            return 0;
        }


        return count || 0;


    } catch (error) {

        console.error(
            'Customer count exception:',
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
            safeCount('products'),
            safeCount('sellers'),
            safeCustomerCount(),
            safeCount('orders')
        ]);


    if ($('productCount')) {
        $('productCount').textContent =
            results[0];
    }


    if ($('sellerCount')) {
        $('sellerCount').textContent =
            results[1];
    }


    if ($('customerCount')) {
        $('customerCount').textContent =
            results[2];
    }


    if ($('orderCount')) {
        $('orderCount').textContent =
            results[3];
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
        $('productsTableBody');

    if (!tbody) {
        return;
    }

    showTableMessage(
        'productsTableBody',
        'Loading products...',
        7
    );

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from('products')
                .select('*')
                .order(
                    'created_at',
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
            'Products error:',
            error
        );

        showTableMessage(
            'productsTableBody',
            error?.message ||
            'Unable to load products.',
            7
        );
    }
}


/* ============================================================
   RENDER PRODUCTS
============================================================ */

function renderProducts(products) {

    const tbody =
        $('productsTableBody');

    if (!tbody) {
        return;
    }


    if (
        !Array.isArray(products) ||
        products.length === 0
    ) {

        showTableMessage(
            'productsTableBody',
            'No products found.',
            7
        );

        return;
    }


    tbody.innerHTML =
        products.map(
            product => {

                const id =
                    product.id || '';

                const name =
                    product.name ||
                    product.title ||
                    'Unnamed Product';

                const price =
                    product.sale_price ??
                    product.price ??
                    0;

                const category =
                    product.category ||
                    '-';

                const seller =
                    product.seller_name ||
                    product.seller_email ||
                    product.seller_id ||
                    '-';

                const active =
                    product.is_active !== false;

                const bestSeller =
                    product.is_best_seller === true;


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
                                style='
                                    color:${active
                                        ? '#42d392'
                                        : '#ff5a00'};
                                    font-weight:800;
                                '
                            >
                                ${active
                                    ? 'Active'
                                    : 'Inactive'}
                            </span>

                        </td>

                        <td>

                            <button
                                type='button'
                                onclick='toggleBestSeller(${JSON.stringify(String(id))})'
                                style='
                                    min-width:100px;
                                    padding:8px 13px;
                                    border-radius:8px;
                                    border:1px solid ${bestSeller
                                        ? '#ff5a00'
                                        : '#444'};
                                    background:${bestSeller
                                        ? 'rgba(255,90,0,.15)'
                                        : '#202020'};
                                    color:${bestSeller
                                        ? '#ff5a00'
                                        : '#aaa'};
                                    cursor:pointer;
                                    font-size:12px;
                                    font-weight:800;
                                '
                            >
                                ${bestSeller
                                    ? '★ ON'
                                    : '☆ OFF'}
                            </button>

                        </td>

                        <td>

                            <div
                                style='
                                    display:flex;
                                    gap:6px;
                                    flex-wrap:wrap;
                                '
                            >

                                <button
                                    type='button'
                                    onclick='toggleProduct(${JSON.stringify(String(id))}, ${active})'
                                    style='
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #333;
                                        background:#191919;
                                        color:#fff;
                                        cursor:pointer;
                                        font-weight:700;
                                    '
                                >
                                    ${active
                                        ? 'Disable'
                                        : 'Enable'}
                                </button>


                                <button
                                    type='button'
                                    onclick='deleteProduct(${JSON.stringify(String(id))})'
                                    style='
                                        padding:8px 12px;
                                        border-radius:7px;
                                        border:1px solid #6b1f1f;
                                        background:#3a1515;
                                        color:#ff7777;
                                        cursor:pointer;
                                        font-weight:800;
                                    '
                                >
                                    Delete
                                </button>

                            </div>

                        </td>

                    </tr>
                `;
            }
        ).join('');
}


/* ============================================================
   TOGGLE BEST SELLER
============================================================ */

async function toggleBestSeller(productId) {

    if (!productId) {
        return;
    }


    const product =
        allProducts.find(
            item =>
                String(item.id) ===
                String(productId)
        );


    if (!product) {

        alert(
            'Product not found.'
        );

        return;
    }


    const newValue =
        product.is_best_seller !== true;


    try {

        const {
            error
        } =
            await supabaseClient
                .from('products')
                .update({
                    is_best_seller: newValue
                })
                .eq(
                    'id',
                    productId
                );


        if (error) {
            throw error;
        }


        product.is_best_seller =
            newValue;


        showToast(
            newValue
                ? 'Product added to Best Sellers.'
                : 'Product removed from Best Sellers.'
        );


        renderProductSearchResults();

    } catch (error) {

        console.error(
            'Best Seller update error:',
            error
        );


        alert(
            'Could not update Best Seller status.\n\n' +
            (
                error?.message ||
                'Unknown error'
            )
        );
    }
}


/* ============================================================
   TOGGLE PRODUCT STATUS
============================================================ */

async function toggleProduct(
    productId,
    currentStatus
) {

    if (!productId) {
        return;
    }


    const newStatus =
        !currentStatus;


    try {

        const {
            error
        } =
            await supabaseClient
                .from('products')
                .update({
                    is_active: newStatus
                })
                .eq(
                    'id',
                    productId
                );


        if (error) {
            throw error;
        }


        const product =
            allProducts.find(
                item =>
                    String(item.id) ===
                    String(productId)
            );


        if (product) {

            product.is_active =
                newStatus;
        }


        showToast(
            newStatus
                ? 'Product enabled.'
                : 'Product disabled.'
        );


        renderProductSearchResults();

    } catch (error) {

        console.error(
            'Product status error:',
            error
        );


        alert(
            'Could not update product status.\n\n' +
            (
                error?.message ||
                'Unknown error'
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
            'Are you sure you want to delete this product?\n\nThis action cannot be undone.'
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from('products')
                .delete()
                .eq(
                    'id',
                    productId
                );


        if (error) {
            throw error;
        }


        allProducts =
            allProducts.filter(
                product =>
                    String(product.id) !==
                    String(productId)
            );


        showToast(
            'Product deleted successfully.'
        );


        renderProductSearchResults();


        await loadDashboardData();


    } catch (error) {

        console.error(
            'Product delete error:',
            error
        );


        alert(
            'Could not delete product.\n\n' +
            (
                error?.message ||
                'Unknown error'
            )
        );
    }
}


/* ============================================================
   PRODUCT SEARCH RESULTS
============================================================ */

function renderProductSearchResults() {

    const input =
        $('productSearch');


    if (!input) {

        renderProducts(
            allProducts
        );

        return;
    }


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
                                .includes(query)
                    );
            }
        );


    renderProducts(
        filtered
    );
}


/* ============================================================
   PRODUCT SEARCH
============================================================ */

function initProductSearch() {

    const input =
        $('productSearch');


    if (!input) {
        return;
    }


    input.addEventListener(
        'input',
        renderProductSearchResults
    );
}
/* ==========================================================================
   SELLERS
   ========================================================================== */

let allSellers = [];


/* --------------------------------------------------------------------------
   SELLER HELPERS
   -------------------------------------------------------------------------- */

function sellerName(seller) {
    return (
        seller.full_name ||
        seller.name ||
        seller.seller_name ||
        seller.username ||
        seller.display_name ||
        'Seller'
    );
}

function sellerEmail(seller) {
    return seller.email || seller.seller_email || '-';
}

function sellerPhone(seller) {
    return (
        seller.phone ||
        seller.phone_number ||
        seller.seller_phone ||
        '-'
    );
}

function sellerStatus(seller) {
    return String(
        seller.status || 'pending'
    ).toLowerCase();
}


/* --------------------------------------------------------------------------
   LOAD SELLERS
   -------------------------------------------------------------------------- */

async function loadSellers() {
    const tbody = $('sellersTableBody');

    if (!tbody) return;

    showTableMessage(
        tbody,
        6,
        'Loading sellers...'
    );

    try {
        const { data, error } = await supabaseClient
            .from('sellers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Load sellers error:', error);

            allSellers = [];

            showTableMessage(
                tbody,
                6,
                'Unable to load sellers.'
            );

            return;
        }

        allSellers = data || [];

        renderSellers(allSellers);

    } catch (error) {
        console.error('Unexpected sellers error:', error);

        allSellers = [];

        showTableMessage(
            tbody,
            6,
            'Unable to load sellers.'
        );
    }
}


/* --------------------------------------------------------------------------
   RENDER SELLERS
   -------------------------------------------------------------------------- */

function renderSellers(sellers = allSellers) {
    const tbody = $('sellersTableBody');

    if (!tbody) return;

    if (!sellers || sellers.length === 0) {
        showTableMessage(
            tbody,
            6,
            'No sellers found.'
        );

        return;
    }

    tbody.innerHTML = sellers.map(seller => {
        const name = sellerName(seller);
        const email = sellerEmail(seller);
        const phone = sellerPhone(seller);
        const status = sellerStatus(seller);

        const sellerId = seller.id || '';

        let statusClass = 'status-pending';

        if (status === 'approved' || status === 'active') {
            statusClass = 'status-active';
        } else if (
            status === 'rejected' ||
            status === 'inactive' ||
            status === 'blocked'
        ) {
            statusClass = 'status-inactive';
        }

        return `
            <tr class='border-b border-white/5 hover:bg-white/[0.02]'>
                <td class='px-4 py-4'>
                    <div class='flex items-center gap-3'>
                        <div class='w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold'>
                            ${escapeHTML(initials(name))}
                        </div>

                        <div>
                            <div class='font-semibold text-white'>
                                ${escapeHTML(name)}
                            </div>

                            <div class='text-xs text-gray-500'>
                                ID: ${escapeHTML(String(sellerId))}
                            </div>
                        </div>
                    </div>
                </td>

                <td class='px-4 py-4 text-gray-300'>
                    ${escapeHTML(email)}
                </td>

                <td class='px-4 py-4 text-gray-300'>
                    ${escapeHTML(phone)}
                </td>

                <td class='px-4 py-4'>
                    <span class='status-badge ${statusClass}'>
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td class='px-4 py-4 text-gray-400'>
                    ${formatDate(seller.created_at)}
                </td>

                <td class='px-4 py-4'>
                    <div class='flex items-center gap-2'>

                        <button
                            type='button'
                            onclick='viewSeller("${sellerId}")'
                            class='action-btn'
                            title='View seller'
                        >
                            <span class='material-symbols-outlined'>
                                visibility
                            </span>
                        </button>

                        <button
                            type='button'
                            onclick='updateSellerStatus("${sellerId}")'
                            class='action-btn'
                            title='Update status'
                        >
                            <span class='material-symbols-outlined'>
                                edit
                            </span>
                        </button>

                        <button
                            type='button'
                            onclick='deleteSeller("${sellerId}")'
                            class='action-btn danger'
                            title='Delete seller'
                        >
                            <span class='material-symbols-outlined'>
                                delete
                            </span>
                        </button>

                    </div>
                </td>
            </tr>
        `;
    }).join('');
}


/* --------------------------------------------------------------------------
   SELLER SEARCH
   -------------------------------------------------------------------------- */

function initSellerSearch() {
    const searchInput = $('sellerSearch');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value
            .trim()
            .toLowerCase();

        if (!query) {
            renderSellers(allSellers);
            return;
        }

        const filtered = allSellers.filter(seller => {
            const name = sellerName(seller).toLowerCase();
            const email = sellerEmail(seller).toLowerCase();
            const phone = sellerPhone(seller).toLowerCase();
            const status = sellerStatus(seller).toLowerCase();

            return (
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                status.includes(query)
            );
        });

        renderSellers(filtered);
    });
}


/* --------------------------------------------------------------------------
   VIEW SELLER
   -------------------------------------------------------------------------- */

function viewSeller(sellerId) {
    const seller = allSellers.find(
        item => String(item.id) === String(sellerId)
    );

    if (!seller) {
        showToast(
            'Seller not found.',
            'error'
        );

        return;
    }

    const name = sellerName(seller);
    const email = sellerEmail(seller);
    const phone = sellerPhone(seller);
    const status = sellerStatus(seller);

    alert(
        'Seller Details\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'Status: ' + status + '\n' +
        'Created: ' + formatDate(seller.created_at)
    );
}


/* --------------------------------------------------------------------------
   UPDATE SELLER STATUS
   -------------------------------------------------------------------------- */

async function updateSellerStatus(sellerId) {
    const seller = allSellers.find(
        item => String(item.id) === String(sellerId)
    );

    if (!seller) {
        showToast(
            'Seller not found.',
            'error'
        );

        return;
    }

    const currentStatus = sellerStatus(seller);

    let newStatus = 'approved';

    if (currentStatus === 'approved' || currentStatus === 'active') {
        newStatus = 'inactive';
    } else if (currentStatus === 'inactive') {
        newStatus = 'approved';
    }

    const confirmed = confirm(
        'Change seller status to ' +
        newStatus +
        '?'
    );

    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('sellers')
            .update({
                status: newStatus
            })
            .eq('id', sellerId);

        if (error) {
            console.error(
                'Update seller status error:',
                error
            );

            showToast(
                'Failed to update seller status.',
                'error'
            );

            return;
        }

        showToast(
            'Seller status updated successfully.',
            'success'
        );

        await loadSellers();

    } catch (error) {
        console.error(
            'Unexpected seller status error:',
            error
        );

        showToast(
            'Something went wrong.',
            'error'
        );
    }
}


/* --------------------------------------------------------------------------
   DELETE SELLER
   -------------------------------------------------------------------------- */

async function deleteSeller(sellerId) {
    const seller = allSellers.find(
        item => String(item.id) === String(sellerId)
    );

    if (!seller) {
        showToast(
            'Seller not found.',
            'error'
        );

        return;
    }

    const name = sellerName(seller);

    const confirmed = confirm(
        'Are you sure you want to delete seller "' +
        name +
        '"?'
    );

    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('sellers')
            .delete()
            .eq('id', sellerId);

        if (error) {
            console.error(
                'Delete seller error:',
                error
            );

            showToast(
                'Failed to delete seller.',
                'error'
            );

            return;
        }

        showToast(
            'Seller deleted successfully.',
            'success'
        );

        await loadSellers();
        await loadDashboardData();

    } catch (error) {
        console.error(
            'Unexpected delete seller error:',
            error
        );

        showToast(
            'Something went wrong.',
            'error'
        );
    }
}
/* ==========================================================================
   CUSTOMERS
   ========================================================================== */

let allCustomers = [];


/* --------------------------------------------------------------------------
   CUSTOMER HELPERS
   -------------------------------------------------------------------------- */

function customerName(customer) {
    return (
        customer.full_name ||
        customer.name ||
        customer.username ||
        customer.display_name ||
        'Customer'
    );
}

function customerEmail(customer) {
    return customer.email || '-';
}

function customerPhone(customer) {
    return (
        customer.phone ||
        customer.phone_number ||
        '-'
    );
}

function customerCity(customer) {
    return (
        customer.city ||
        customer.address_city ||
        '-'
    );
}


/* --------------------------------------------------------------------------
   LOAD CUSTOMERS
   -------------------------------------------------------------------------- */

async function loadCustomers() {
    const tbody = $('customersTableBody');

    if (!tbody) return;

    showTableMessage(
        tbody,
        6,
        'Loading customers...'
    );

    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('role', 'customer')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(
                'Load customers error:',
                error
            );

            allCustomers = [];

            showTableMessage(
                tbody,
                6,
                'Unable to load customers.'
            );

            return;
        }

        allCustomers = data || [];

        renderCustomers(allCustomers);

    } catch (error) {
        console.error(
            'Unexpected customers error:',
            error
        );

        allCustomers = [];

        showTableMessage(
            tbody,
            6,
            'Unable to load customers.'
        );
    }
}


/* --------------------------------------------------------------------------
   RENDER CUSTOMERS
   -------------------------------------------------------------------------- */

function renderCustomers(customers = allCustomers) {
    const tbody = $('customersTableBody');

    if (!tbody) return;

    if (!customers || customers.length === 0) {
        showTableMessage(
            tbody,
            6,
            'No customers found.'
        );

        return;
    }

    tbody.innerHTML = customers.map(customer => {
        const name = customerName(customer);
        const email = customerEmail(customer);
        const phone = customerPhone(customer);
        const city = customerCity(customer);

        const customerId = customer.id || '';

        return `
            <tr class='border-b border-white/5 hover:bg-white/[0.02]'>

                <td class='px-4 py-4'>
                    <div class='flex items-center gap-3'>

                        <div class='w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold'>
                            ${escapeHTML(initials(name))}
                        </div>

                        <div>
                            <div class='font-semibold text-white'>
                                ${escapeHTML(name)}
                            </div>

                            <div class='text-xs text-gray-500'>
                                ID: ${escapeHTML(String(customerId))}
                            </div>
                        </div>

                    </div>
                </td>

                <td class='px-4 py-4 text-gray-300'>
                    ${escapeHTML(email)}
                </td>

                <td class='px-4 py-4 text-gray-300'>
                    ${escapeHTML(phone)}
                </td>

                <td class='px-4 py-4 text-gray-300'>
                    ${escapeHTML(city)}
                </td>

                <td class='px-4 py-4 text-gray-400'>
                    ${formatDate(customer.created_at)}
                </td>

                <td class='px-4 py-4'>

                    <div class='flex items-center gap-2'>

                        <button
                            type='button'
                            onclick='viewCustomer("${customerId}")'
                            class='action-btn'
                            title='View customer'
                        >
                            <span class='material-symbols-outlined'>
                                visibility
                            </span>
                        </button>

                        <button
                            type='button'
                            onclick='deleteCustomer("${customerId}")'
                            class='action-btn danger'
                            title='Delete customer'
                        >
                            <span class='material-symbols-outlined'>
                                delete
                            </span>
                        </button>

                    </div>

                </td>

            </tr>
        `;
    }).join('');
}


/* --------------------------------------------------------------------------
   CUSTOMER SEARCH
   -------------------------------------------------------------------------- */

function initCustomerSearch() {
    const searchInput = $('customerSearch');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value
            .trim()
            .toLowerCase();

        if (!query) {
            renderCustomers(allCustomers);
            return;
        }

        const filtered = allCustomers.filter(customer => {
            const name = customerName(customer)
                .toLowerCase();

            const email = customerEmail(customer)
                .toLowerCase();

            const phone = customerPhone(customer)
                .toLowerCase();

            const city = customerCity(customer)
                .toLowerCase();

            return (
                name.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                city.includes(query)
            );
        });

        renderCustomers(filtered);
    });
}


/* --------------------------------------------------------------------------
   VIEW CUSTOMER
   -------------------------------------------------------------------------- */

function viewCustomer(customerId) {
    const customer = allCustomers.find(
        item =>
            String(item.id) === String(customerId)
    );

    if (!customer) {
        showToast(
            'Customer not found.',
            'error'
        );

        return;
    }

    const name = customerName(customer);
    const email = customerEmail(customer);
    const phone = customerPhone(customer);
    const city = customerCity(customer);

    alert(
        'Customer Details\n\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'City: ' + city + '\n' +
        'Joined: ' +
        formatDate(customer.created_at)
    );
}


/* --------------------------------------------------------------------------
   DELETE CUSTOMER
   -------------------------------------------------------------------------- */

async function deleteCustomer(customerId) {
    const customer = allCustomers.find(
        item =>
            String(item.id) === String(customerId)
    );

    if (!customer) {
        showToast(
            'Customer not found.',
            'error'
        );

        return;
    }

    const name = customerName(customer);

    const confirmed = confirm(
        'Are you sure you want to delete customer "' +
        name +
        '"?'
    );

    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .delete()
            .eq('id', customerId)
            .eq('role', 'customer');

        if (error) {
            console.error(
                'Delete customer error:',
                error
            );

            showToast(
                'Failed to delete customer.',
                'error'
            );

            return;
        }

        showToast(
            'Customer deleted successfully.',
            'success'
        );

        await loadCustomers();
        await loadDashboardData();

    } catch (error) {
        console.error(
            'Unexpected delete customer error:',
            error
        );

        showToast(
            'Something went wrong.',
            'error'
        );
    }
}
/* ==========================================================================
   ORDERS
   ========================================================================== */

let allOrders = [];


/* --------------------------------------------------------------------------
   ORDER HELPERS
   -------------------------------------------------------------------------- */

function orderNumber(order) {
    return (
        order.order_number ||
        order.order_no ||
        order.order_id ||
        order.id ||
        '-'
    );
}

function orderCustomer(order) {
    return (
        order.customer_name ||
        order.full_name ||
        order.customer_email ||
        order.email ||
        'Customer'
    );
}

function orderTotal(order) {
    const total =
        order.total_amount ??
        order.total ??
        order.amount ??
        0;

    return formatMoney(total);
}

function orderStatus(order) {
    return String(
        order.status || 'pending'
    ).toLowerCase();
}


/* --------------------------------------------------------------------------
   LOAD ORDERS
   -------------------------------------------------------------------------- */

async function loadOrders() {
    const tbody = $('ordersTableBody');

    if (!tbody) return;

    showTableMessage(
        tbody,
        6,
        'Loading orders...'
    );

    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(
                'Load orders error:',
                error
            );

            allOrders = [];

            showTableMessage(
                tbody,
                6,
                'Unable to load orders.'
            );

            return;
        }

        allOrders = data || [];

        renderOrders(allOrders);

    } catch (error) {
        console.error(
            'Unexpected orders error:',
            error
        );

        allOrders = [];

        showTableMessage(
            tbody,
            6,
            'Unable to load orders.'
        );
    }
}


/* --------------------------------------------------------------------------
   RENDER ORDERS
   -------------------------------------------------------------------------- */

function renderOrders(orders = allOrders) {
    const tbody = $('ordersTableBody');

    if (!tbody) return;

    if (!orders || orders.length === 0) {
        showTableMessage(
            tbody,
            6,
            'No orders found.'
        );

        return;
    }

    tbody.innerHTML = orders.map(order => {
        const id = order.id || '';
        const number = orderNumber(order);
        const customer = orderCustomer(order);
        const total = orderTotal(order);
        const status = orderStatus(order);

        let statusClass = 'status-pending';

        if (
            status === 'completed' ||
            status === 'delivered' ||
            status === 'approved'
        ) {
            statusClass = 'status-active';
        } else if (
            status === 'cancelled' ||
            status === 'canceled' ||
            status === 'rejected'
        ) {
            statusClass = 'status-inactive';
        }

        return `
            <tr class='border-b border-white/5 hover:bg-white/[0.02]'>

                <td class='px-4 py-4'>
                    <div class='font-semibold text-white'>
                        #${escapeHTML(String(number))}
                    </div>

                    <div class='text-xs text-gray-500'>
                        ID: ${escapeHTML(String(id))}
                    </div>
                </td>

                <td class='px-4 py-4 text-gray-300'>
                    ${escapeHTML(String(customer))}
                </td>

                <td class='px-4 py-4 font-semibold text-white'>
                    ${escapeHTML(String(total))}
                </td>

                <td class='px-4 py-4'>
                    <span class='status-badge ${statusClass}'>
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td class='px-4 py-4 text-gray-400'>
                    ${formatDate(order.created_at)}
                </td>

                <td class='px-4 py-4'>

                    <div class='flex items-center gap-2'>

                        <button
                            type='button'
                            onclick='viewOrder("${id}")'
                            class='action-btn'
                            title='View order'
                        >
                            <span class='material-symbols-outlined'>
                                visibility
                            </span>
                        </button>

                        <button
                            type='button'
                            onclick='updateOrderStatus("${id}")'
                            class='action-btn'
                            title='Update status'
                        >
                            <span class='material-symbols-outlined'>
                                edit
                            </span>
                        </button>

                        <button
                            type='button'
                            onclick='deleteOrder("${id}")'
                            class='action-btn danger'
                            title='Delete order'
                        >
                            <span class='material-symbols-outlined'>
                                delete
                            </span>
                        </button>

                    </div>

                </td>

            </tr>
        `;
    }).join('');
}


/* --------------------------------------------------------------------------
   ORDER SEARCH
   -------------------------------------------------------------------------- */

function initOrderSearch() {
    const searchInput = $('orderSearch');

    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value
            .trim()
            .toLowerCase();

        if (!query) {
            renderOrders(allOrders);
            return;
        }

        const filtered = allOrders.filter(order => {
            const number = String(
                orderNumber(order)
            ).toLowerCase();

            const customer = String(
                orderCustomer(order)
            ).toLowerCase();

            const status = orderStatus(order)
                .toLowerCase();

            return (
                number.includes(query) ||
                customer.includes(query) ||
                status.includes(query)
            );
        });

        renderOrders(filtered);
    });
}


/* --------------------------------------------------------------------------
   VIEW ORDER
   -------------------------------------------------------------------------- */

function viewOrder(orderId) {
    const order = allOrders.find(
        item =>
            String(item.id) === String(orderId)
    );

    if (!order) {
        showToast(
            'Order not found.',
            'error'
        );

        return;
    }

    const number = orderNumber(order);
    const customer = orderCustomer(order);
    const total = orderTotal(order);
    const status = orderStatus(order);

    alert(
        'Order Details\n\n' +
        'Order: #' + number + '\n' +
        'Customer: ' + customer + '\n' +
        'Total: ' + total + '\n' +
        'Status: ' + status + '\n' +
        'Date: ' +
        formatDate(order.created_at)
    );
}


/* --------------------------------------------------------------------------
   UPDATE ORDER STATUS
   -------------------------------------------------------------------------- */

async function updateOrderStatus(orderId) {
    const order = allOrders.find(
        item =>
            String(item.id) === String(orderId)
    );

    if (!order) {
        showToast(
            'Order not found.',
            'error'
        );

        return;
    }

    const currentStatus = orderStatus(order);

    let newStatus = 'processing';

    if (currentStatus === 'pending') {
        newStatus = 'processing';
    } else if (currentStatus === 'processing') {
        newStatus = 'shipped';
    } else if (currentStatus === 'shipped') {
        newStatus = 'delivered';
    } else if (currentStatus === 'delivered') {
        newStatus = 'completed';
    } else if (currentStatus === 'completed') {
        newStatus = 'pending';
    } else {
        newStatus = 'processing';
    }

    const confirmed = confirm(
        'Change order status to ' +
        newStatus +
        '?'
    );

    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('orders')
            .update({
                status: newStatus
            })
            .eq('id', orderId);

        if (error) {
            console.error(
                'Update order status error:',
                error
            );

            showToast(
                'Failed to update order status.',
                'error'
            );

            return;
        }

        showToast(
            'Order status updated successfully.',
            'success'
        );

        await loadOrders();

    } catch (error) {
        console.error(
            'Unexpected order status error:',
            error
        );

        showToast(
            'Something went wrong.',
            'error'
        );
    }
}


/* --------------------------------------------------------------------------
   DELETE ORDER
   -------------------------------------------------------------------------- */

async function deleteOrder(orderId) {
    const order = allOrders.find(
        item =>
            String(item.id) === String(orderId)
    );

    if (!order) {
        showToast(
            'Order not found.',
            'error'
        );

        return;
    }

    const number = orderNumber(order);

    const confirmed = confirm(
        'Are you sure you want to delete order #' +
        number +
        '?'
    );

    if (!confirmed) return;

    try {
        const { error } = await supabaseClient
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (error) {
            console.error(
                'Delete order error:',
                error
            );

            showToast(
                'Failed to delete order.',
                'error'
            );

            return;
        }

        showToast(
            'Order deleted successfully.',
            'success'
        );

        await loadOrders();
        await loadDashboardData();

    } catch (error) {
        console.error(
            'Unexpected delete order error:',
            error
        );

        showToast(
            'Something went wrong.',
            'error'
        );
    }
}
/* ==========================================================================
   LOGOUT
   ========================================================================== */

async function logoutAdmin() {
    try {
        const confirmed = confirm(
            'Are you sure you want to logout?'
        );

        if (!confirmed) return;

        const { error } = await supabaseClient.auth.signOut();

        if (error) {
            console.error(
                'Logout error:',
                error
            );

            showToast(
                'Logout failed.',
                'error'
            );

            return;
        }

        localStorage.removeItem('khelzone_role');
        localStorage.removeItem('khelzone_user_id');
        localStorage.removeItem('khelzone_email');

        window.location.href = 'login.html';

    } catch (error) {
        console.error(
            'Unexpected logout error:',
            error
        );

        showToast(
            'Something went wrong during logout.',
            'error'
        );
    }
}


/* --------------------------------------------------------------------------
   LOGOUT BUTTON
   -------------------------------------------------------------------------- */

function initLogout() {
    const logoutBtn = $('logoutBtn');

    if (!logoutBtn) return;

    logoutBtn.addEventListener(
        'click',
        logoutAdmin
    );
}


/* ==========================================================================
   KEYBOARD SHORTCUTS
   ========================================================================== */

function initKeyboard() {
    document.addEventListener(
        'keydown',
        event => {

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key.toLowerCase() === 'k'
            ) {
                event.preventDefault();

                const searchInput =
                    document.querySelector(
                        '#productSearch:not(.hidden), ' +
                        '#sellerSearch:not(.hidden), ' +
                        '#customerSearch:not(.hidden), ' +
                        '#orderSearch:not(.hidden)'
                    );

                if (searchInput) {
                    searchInput.focus();
                }
            }

            if (event.key === 'Escape') {
                closeMobileMenu();
            }
        }
    );
}


/* ==========================================================================
   AUTH LISTENER
   ========================================================================== */

function initAuthListener() {
    if (
        !supabaseClient ||
        !supabaseClient.auth
    ) {
        return;
    }

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            if (
                event === 'SIGNED_OUT' ||
                !session
            ) {
                localStorage.removeItem(
                    'khelzone_role'
                );

                localStorage.removeItem(
                    'khelzone_user_id'
                );

                localStorage.removeItem(
                    'khelzone_email'
                );

                window.location.href =
                    'login.html';
            }
        }
    );
}


/* ==========================================================================
   GLOBAL FUNCTIONS
   ========================================================================== */

window.showSection = showSection;

window.openMobileMenu =
    openMobileMenu;

window.closeMobileMenu =
    closeMobileMenu;



/* --------------------------------------------------------------------------
   PRODUCT GLOBALS
   -------------------------------------------------------------------------- */

window.toggleBestSeller =
    toggleBestSeller;

window.toggleProduct =
    toggleProduct;

window.deleteProduct =
    deleteProduct;


/* --------------------------------------------------------------------------
   SELLER GLOBALS
   -------------------------------------------------------------------------- */

window.viewSeller =
    viewSeller;

window.updateSellerStatus =
    updateSellerStatus;

window.deleteSeller =
    deleteSeller;


/* --------------------------------------------------------------------------
   CUSTOMER GLOBALS
   -------------------------------------------------------------------------- */

window.viewCustomer =
    viewCustomer;

window.deleteCustomer =
    deleteCustomer;


/* --------------------------------------------------------------------------
   ORDER GLOBALS
   -------------------------------------------------------------------------- */

window.viewOrder =
    viewOrder;

window.updateOrderStatus =
    updateOrderStatus;

window.deleteOrder =
    deleteOrder;


/* --------------------------------------------------------------------------
   LOGOUT GLOBAL
   -------------------------------------------------------------------------- */

window.logoutAdmin =
    logoutAdmin;


/* ==========================================================================
   MAIN DASHBOARD INITIALIZATION
   ========================================================================== */

async function initAdminDashboard() {

    console.log(
        'KHELZONE Admin Dashboard initializing...'
    );


    /* ----------------------------------------------------------------------
       CHECK ADMIN ACCESS
       ---------------------------------------------------------------------- */

    const isAdmin =
        await checkAdminAccess();

    if (!isAdmin) {
        return;
    }


    /* ----------------------------------------------------------------------
       INITIALIZE UI
       ---------------------------------------------------------------------- */

    initNavigation();

    initMobileMenu();

    initLogout();

    initKeyboard();

    initAuthListener();


    /* ----------------------------------------------------------------------
       INITIALIZE SEARCH
       ---------------------------------------------------------------------- */

    initProductSearch();

    initSellerSearch();

    initCustomerSearch();

    initOrderSearch();


    /* ----------------------------------------------------------------------
       LOAD DASHBOARD DATA
       ---------------------------------------------------------------------- */

    await Promise.allSettled([
        loadDashboardData(),
        loadProducts(),
        loadSellers(),
        loadCustomers(),
        loadOrders()
    ]);


    /* ----------------------------------------------------------------------
       OPEN DASHBOARD SECTION
       ---------------------------------------------------------------------- */

    showSection(
        'dashboardSection'
    );


    console.log(
        'KHELZONE ADMIN DASHBOARD READY.'
    );
}


/* ==========================================================================
   DOM READY
   ========================================================================== */

if (
    document.readyState === 'loading'
) {
    document.addEventListener(
        'DOMContentLoaded',
        initAdminDashboard
    );
} else {
    initAdminDashboard();
}