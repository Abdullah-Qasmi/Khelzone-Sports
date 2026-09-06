/* ============================================================
   KHELZONE SELLER PAGE
   COMPLETE SELLER ACCESS + PRODUCT ADD SYSTEM
   + ADMIN + SELLER DASHBOARD BUTTON
============================================================ */

"use strict";


/* ============================================================
   SUPABASE
============================================================ */

const SUPABASE_URL =
    "https://antqexjhlsaynunlmzqa.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";


/* ============================================================
   GLOBAL
============================================================ */

let supabaseClient = null;
let currentUser = null;
let currentProfile = null;
let currentSeller = null;


/* ============================================================
   DOM READY
============================================================ */

document.addEventListener("DOMContentLoaded", async () => {

    console.log("======================================");
    console.log("KHELZONE seller.js started");
    console.log("======================================");


    /* ========================================================
       CREATE SUPABASE CLIENT
    ======================================================== */

    try {

        if (!window.supabase) {

            console.error(
                "Supabase library not loaded."
            );

            showStatusMessage(
                "Supabase could not be loaded. Please refresh the page."
            );

            return;
        }


        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );


        console.log(
            "Supabase connected successfully."
        );


    } catch (error) {

        console.error(
            "Supabase initialization error:",
            error
        );

        showStatusMessage(
            "Unable to connect to server."
        );

        return;
    }


    /* ========================================================
       MOBILE MENU
    ======================================================== */

    setupMobileMenu();


    /* ========================================================
       HIDE DASHBOARD BY DEFAULT
    ======================================================== */

    updateSellerDashboardButton(
        null,
        null
    );


    /* ========================================================
       CHECK ACCESS
    ======================================================== */

    await checkSellerStatus();


    /* ========================================================
       PRODUCT FORM
    ======================================================== */

    setupProductForm();


    console.log(
        "KHELZONE seller.js initialization complete."
    );

});


/* ============================================================
   MOBILE MENU
============================================================ */

function setupMobileMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const menuIcon =
        document.getElementById("menuIcon");


    if (!menuButton || !mobileMenu) {

        console.warn(
            "Mobile menu elements not found."
        );

        return;
    }


    /* --------------------------------------------------------
       MENU BUTTON
    -------------------------------------------------------- */

    menuButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();


            const isOpen =
                mobileMenu.classList.contains(
                    "show"
                );


            if (isOpen) {

                closeMobileMenu();

            } else {

                openMobileMenu();

            }

        }
    );


    /* --------------------------------------------------------
       MOBILE LINKS
    -------------------------------------------------------- */

    const mobileLinks =
        mobileMenu.querySelectorAll("a");


    mobileLinks.forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    closeMobileMenu();

                }
            );

        }
    );


    /* --------------------------------------------------------
       CLICK OUTSIDE
    -------------------------------------------------------- */

    document.addEventListener(
        "click",
        (event) => {

            if (
                mobileMenu.classList.contains("show") &&
                !mobileMenu.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {

                closeMobileMenu();

            }

        }
    );


    /* --------------------------------------------------------
       ESC KEY
    -------------------------------------------------------- */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                closeMobileMenu();

            }

        }
    );


    /* --------------------------------------------------------
       OPEN
    -------------------------------------------------------- */

    function openMobileMenu() {

        mobileMenu.classList.add(
            "show"
        );

        menuButton.classList.add(
            "active"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuButton.setAttribute(
            "aria-label",
            "Close menu"
        );


        if (menuIcon) {

            menuIcon.textContent =
                "close";

        }

    }


    /* --------------------------------------------------------
       CLOSE
    -------------------------------------------------------- */

    function closeMobileMenu() {

        mobileMenu.classList.remove(
            "show"
        );

        menuButton.classList.remove(
            "active"
        );

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open menu"
        );


        if (menuIcon) {

            menuIcon.textContent =
                "menu";

        }

    }

}


/* ============================================================
   NORMALIZE ROLE
============================================================ */

function normalizeRole(role) {

    if (
        role === null ||
        role === undefined
    ) {

        return "";

    }


    return String(role)
        .trim()
        .toLowerCase();

}


/* ============================================================
   NORMALIZE STATUS
============================================================ */

function normalizeStatus(status) {

    if (
        status === null ||
        status === undefined
    ) {

        return "";

    }


    return String(status)
        .trim()
        .toLowerCase();

}


/* ============================================================
   CHECK IF USER IS ADMIN
============================================================ */

function isUserAdmin(user, profile = null) {

    if (!user) {

        return false;

    }


    /* ========================================================
       PROFILE ROLE
    ======================================================== */

    const profileRole =
        normalizeRole(
            profile?.role
        );


    if (profileRole === "admin") {

        console.log(
            "ADMIN DETECTED FROM profiles.role"
        );

        return true;

    }


    /* ========================================================
       USER METADATA ROLE
    ======================================================== */

    const userMetadataRole =
        normalizeRole(
            user?.user_metadata?.role
        );


    if (
        userMetadataRole === "admin" ||
        userMetadataRole === "administrator"
    ) {

        console.log(
            "ADMIN DETECTED FROM user_metadata.role"
        );

        return true;

    }


    /* ========================================================
       APP METADATA ROLE
    ======================================================== */

    const appMetadataRole =
        normalizeRole(
            user?.app_metadata?.role
        );


    if (
        appMetadataRole === "admin" ||
        appMetadataRole === "administrator"
    ) {

        console.log(
            "ADMIN DETECTED FROM app_metadata.role"
        );

        return true;

    }


    /* ========================================================
       USER METADATA IS ADMIN
    ======================================================== */

    if (
        user?.user_metadata?.is_admin === true ||
        user?.user_metadata?.isAdmin === true
    ) {

        console.log(
            "ADMIN DETECTED FROM user_metadata.is_admin"
        );

        return true;

    }


    /* ========================================================
       APP METADATA IS ADMIN
    ======================================================== */

    if (
        user?.app_metadata?.is_admin === true ||
        user?.app_metadata?.isAdmin === true
    ) {

        console.log(
            "ADMIN DETECTED FROM app_metadata.is_admin"
        );

        return true;

    }


    /* ========================================================
       STRING TRUE CHECK
    ======================================================== */

    const userAdminValue =
        String(
            user?.user_metadata?.is_admin || ""
        ).toLowerCase();


    const appAdminValue =
        String(
            user?.app_metadata?.is_admin || ""
        ).toLowerCase();


    if (
        userAdminValue === "true" ||
        userAdminValue === "1" ||
        userAdminValue === "yes"
    ) {

        console.log(
            "ADMIN DETECTED FROM user_metadata.is_admin string"
        );

        return true;

    }


    if (
        appAdminValue === "true" ||
        appAdminValue === "1" ||
        appAdminValue === "yes"
    ) {

        console.log(
            "ADMIN DETECTED FROM app_metadata.is_admin string"
        );

        return true;

    }


    return false;

}


/* ============================================================
   SELLER DASHBOARD BUTTON
============================================================ */

function updateSellerDashboardButton(
    role,
    sellerStatus
) {

    const desktopButton =
        document.getElementById(
            "sellerDashboardBtn"
        );

    const mobileButton =
        document.getElementById(
            "mobileSellerDashboardBtn"
        );


    let shouldShow =
        false;


    const normalizedRole =
        normalizeRole(role);

    const normalizedStatus =
        normalizeStatus(sellerStatus);


    /* ========================================================
       ADMIN
    ======================================================== */

    if (
        normalizedRole === "admin" ||
        normalizedRole === "administrator"
    ) {

        shouldShow =
            true;

    }


    /* ========================================================
       APPROVED SELLER
    ======================================================== */

    if (
        normalizedRole === "seller" &&
        normalizedStatus === "approved"
    ) {

        shouldShow =
            true;

    }


    /* ========================================================
       DESKTOP
    ======================================================== */

    if (desktopButton) {

        desktopButton.style.display =
            shouldShow
                ? "inline-flex"
                : "none";

    }


    /* ========================================================
       MOBILE
    ======================================================== */

    if (mobileButton) {

        mobileButton.style.display =
            shouldShow
                ? "flex"
                : "none";

    }


    console.log(
        "======================================"
    );

    console.log(
        "Dashboard Button:",
        shouldShow
            ? "VISIBLE"
            : "HIDDEN"
    );

    console.log(
        "Role:",
        normalizedRole
    );

    console.log(
        "Status:",
        normalizedStatus
    );

    console.log(
        "======================================"
    );

}


/* ============================================================
   STATUS MESSAGE
============================================================ */

function createStatusMessage() {

    let message =
        document.getElementById(
            "sellerStatusMessage"
        );


    if (message) {

        return message;

    }


    const addProductSection =
        document.getElementById(
            "add-product"
        );


    if (!addProductSection) {

        return null;

    }


    message =
        document.createElement(
            "div"
        );


    message.id =
        "sellerStatusMessage";


    message.style.display =
        "none";


    message.style.marginBottom =
        "24px";


    message.style.padding =
        "16px 20px";


    message.style.borderRadius =
        "12px";


    message.style.fontWeight =
        "700";


    message.style.fontFamily =
        "Inter, sans-serif";


    addProductSection.parentNode.insertBefore(
        message,
        addProductSection
    );


    return message;

}


/* ============================================================
   SHOW STATUS MESSAGE
============================================================ */

function showStatusMessage(
    text,
    type = "error"
) {

    const message =
        createStatusMessage();


    if (!message) {

        console.warn(
            text
        );

        return;

    }


    message.textContent =
        text;


    message.style.display =
        "block";


    if (type === "success") {

        message.style.background =
            "rgba(34,197,94,.12)";

        message.style.border =
            "1px solid rgba(34,197,94,.45)";

        message.style.color =
            "#4ade80";

    }

    else if (type === "warning") {

        message.style.background =
            "rgba(245,158,11,.12)";

        message.style.border =
            "1px solid rgba(245,158,11,.45)";

        message.style.color =
            "#fbbf24";

    }

    else {

        message.style.background =
            "rgba(239,68,68,.12)";

        message.style.border =
            "1px solid rgba(239,68,68,.45)";

        message.style.color =
            "#f87171";

    }

}


/* ============================================================
   HIDE STATUS MESSAGE
============================================================ */

function hideStatusMessage() {

    const message =
        document.getElementById(
            "sellerStatusMessage"
        );


    if (message) {

        message.style.display =
            "none";

    }

}


/* ============================================================
   ADD PRODUCT SECTION
============================================================ */

function getAddProductSection() {

    return document.getElementById(
        "add-product"
    );

}


function hideAddProduct() {

    const section =
        getAddProductSection();


    if (section) {

        section.style.display =
            "none";

    }

}


function showAddProduct() {

    const section =
        getAddProductSection();


    if (section) {

        section.style.display =
            "block";

    }

}


/* ============================================================
   CHECK SELLER / ADMIN STATUS
============================================================ */

async function checkSellerStatus() {

    try {

        hideAddProduct();


        /* ====================================================
           SUPABASE CHECK
        ==================================================== */

        if (!supabaseClient) {

            console.error(
                "Supabase client is not initialized."
            );

            updateSellerDashboardButton(
                null,
                null
            );

            showStatusMessage(
                "Supabase is not ready. Please refresh the page."
            );

            return null;

        }


        /* ====================================================
           GET CURRENT USER
        ==================================================== */

        const {
            data: userData,
            error: userError
        } =
            await supabaseClient.auth.getUser();


        if (userError) {

            console.error(
                "Auth error:",
                userError
            );

            updateSellerDashboardButton(
                null,
                null
            );

            showStatusMessage(
                "Unable to check login status."
            );

            return null;

        }


        currentUser =
            userData?.user || null;


        /* ====================================================
           NOT LOGGED IN
        ==================================================== */

        if (!currentUser) {

            console.log(
                "No logged-in user."
            );


            updateSellerDashboardButton(
                null,
                null
            );


            showStatusMessage(
                "Please login as an approved seller to add products.",
                "warning"
            );


            return null;

        }


        console.log(
            "Logged in user:",
            currentUser.id
        );


        console.log(
            "User metadata:",
            currentUser.user_metadata
        );


        console.log(
            "App metadata:",
            currentUser.app_metadata
        );


        /* ====================================================
           GET PROFILE
        ==================================================== */

        let profile =
            null;

        let profileError =
            null;


        try {

            const profileResult =
                await supabaseClient
                    .from("profiles")
                    .select(
                        "id, role, seller_status, full_name, email, phone"
                    )
                    .eq(
                        "id",
                        currentUser.id
                    )
                    .maybeSingle();


            profile =
                profileResult.data;


            profileError =
                profileResult.error;

        }

        catch (error) {

            profileError =
                error;

        }


        /* ====================================================
           ADMIN CHECK
           IMPORTANT:
           CHECK ADMIN BEFORE SELLER FALLBACK
        ==================================================== */

        const adminDetected =
            isUserAdmin(
                currentUser,
                profile
            );


        if (adminDetected) {

            currentProfile =
                profile || {
                    id: currentUser.id,
                    role: "admin",
                    seller_status: "approved"
                };


            currentSeller = {

                user:
                    currentUser,

                profile:
                    currentProfile,

                role:
                    "admin",

                status:
                    "approved"

            };


            /* ----------------------------------------------
               SHOW DASHBOARD
            ---------------------------------------------- */

            updateSellerDashboardButton(
                "admin",
                "approved"
            );


            /* ----------------------------------------------
               ADMIN CAN ADD PRODUCT
            ---------------------------------------------- */

            showAddProduct();


            hideStatusMessage();


            console.log(
                "======================================"
            );

            console.log(
                "ADMIN ACCESS GRANTED"
            );

            console.log(
                "Seller Dashboard button shown."
            );

            console.log(
                "======================================"
            );


            return currentSeller;

        }


        /* ====================================================
           PROFILE FOUND
        ==================================================== */

        if (profile) {

            currentProfile =
                profile;


            const role =
                normalizeRole(
                    profile.role
                );


            const status =
                normalizeStatus(
                    profile.seller_status
                );


            console.log(
                "Profile:",
                profile
            );


            /* ------------------------------------------------
               DASHBOARD
            ------------------------------------------------ */

            updateSellerDashboardButton(
                role,
                status
            );


            /* ------------------------------------------------
               APPROVED SELLER
            ------------------------------------------------ */

            if (
                role === "seller" &&
                status === "approved"
            ) {

                currentSeller = {

                    user:
                        currentUser,

                    profile:
                        profile,

                    role:
                        "seller",

                    status:
                        "approved"

                };


                showAddProduct();

                hideStatusMessage();


                console.log(
                    "Approved seller access granted."
                );


                return currentSeller;

            }


            /* ------------------------------------------------
               PENDING
            ------------------------------------------------ */

            if (
                role === "seller" &&
                status === "pending"
            ) {

                hideAddProduct();


                updateSellerDashboardButton(
                    "seller",
                    "pending"
                );


                showStatusMessage(
                    "Your seller account is still pending approval. Please wait for admin approval.",
                    "warning"
                );


                console.log(
                    "Seller pending."
                );


                return null;

            }


            /* ------------------------------------------------
               REJECTED
            ------------------------------------------------ */

            if (
                role === "seller" &&
                status === "rejected"
            ) {

                hideAddProduct();


                updateSellerDashboardButton(
                    "seller",
                    "rejected"
                );


                showStatusMessage(
                    "Your seller application was rejected. Please contact support for more information.",
                    "error"
                );


                console.log(
                    "Seller rejected."
                );


                return null;

            }


            /* ------------------------------------------------
               CUSTOMER
            ------------------------------------------------ */

            if (
                role === "customer"
            ) {

                hideAddProduct();


                updateSellerDashboardButton(
                    "customer",
                    ""
                );


                showStatusMessage(
                    "Customer accounts cannot add products. Please apply as a seller.",
                    "warning"
                );


                console.log(
                    "Customer access denied."
                );


                return null;

            }


            /* ------------------------------------------------
               UNKNOWN PROFILE ROLE
            ------------------------------------------------ */

            hideAddProduct();


            updateSellerDashboardButton(
                role,
                status
            );


            showStatusMessage(
                "You do not have seller access.",
                "error"
            );


            return null;

        }


        /* ====================================================
           PROFILE QUERY ERROR
        ==================================================== */

        if (profileError) {

            console.warn(
                "Profiles query error:",
                profileError
            );

        }


        /* ====================================================
           FALLBACK TO SELLERS TABLE
        ==================================================== */

        console.log(
            "Profile not found. Checking sellers table..."
        );


        const {
            data: seller,
            error: sellerError
        } =
            await supabaseClient
                .from("sellers")
                .select("*")
                .eq(
                    "id",
                    currentUser.id
                )
                .maybeSingle();


        if (sellerError) {

            console.error(
                "Sellers query error:",
                sellerError
            );


            updateSellerDashboardButton(
                null,
                null
            );


            hideAddProduct();


            showStatusMessage(
                "Unable to verify seller account. Please try again."
            );


            return null;

        }


        /* ====================================================
           NO SELLER RECORD
        ==================================================== */

        if (!seller) {

            updateSellerDashboardButton(
                "customer",
                ""
            );


            hideAddProduct();


            showStatusMessage(
                "You are not registered as a seller. Please apply as a seller.",
                "warning"
            );


            return null;

        }


        /* ====================================================
           SELLER STATUS
        ==================================================== */

        const sellerStatus =
            normalizeStatus(
                seller.status
            );


        currentSeller = {

            user:
                currentUser,

            seller:
                seller,

            role:
                "seller",

            status:
                sellerStatus

        };


        updateSellerDashboardButton(
            "seller",
            sellerStatus
        );


        /* ----------------------------------------------------
           APPROVED
        ---------------------------------------------------- */

        if (
            sellerStatus === "approved"
        ) {

            showAddProduct();

            hideStatusMessage();


            console.log(
                "Approved seller access granted from sellers table."
            );


            return currentSeller;

        }


        /* ----------------------------------------------------
           PENDING
        ---------------------------------------------------- */

        if (
            sellerStatus === "pending"
        ) {

            hideAddProduct();


            showStatusMessage(
                "Your seller account is still pending approval. Please wait for admin approval.",
                "warning"
            );


            return null;

        }


        /* ----------------------------------------------------
           REJECTED
        ---------------------------------------------------- */

        if (
            sellerStatus === "rejected"
        ) {

            hideAddProduct();


            showStatusMessage(
                "Your seller application was rejected.",
                "error"
            );


            return null;

        }


        /* ----------------------------------------------------
           UNKNOWN
        ---------------------------------------------------- */

        hideAddProduct();


        showStatusMessage(
            "Your seller account status could not be verified.",
            "error"
        );


        return null;


    }

    catch (error) {

        console.error(
            "checkSellerStatus error:",
            error
        );


        updateSellerDashboardButton(
            null,
            null
        );


        hideAddProduct();


        showStatusMessage(
            "Something went wrong while checking seller access."
        );


        return null;

    }

}


/* ============================================================
   PRODUCT FORM SETUP
============================================================ */

function setupProductForm() {

    const productForm =
        document.getElementById(
            "productForm"
        );


    if (!productForm) {

        console.warn(
            "Product form not found."
        );

        return;

    }


    setupImagePreview();


    productForm.addEventListener(
        "submit",
        handleProductSubmit
    );


    productForm.addEventListener(
        "reset",
        () => {

            setTimeout(
                () => {

                    removeImagePreview();

                },
                0
            );

        }
    );

}


/* ============================================================
   IMAGE PREVIEW
============================================================ */

function setupImagePreview() {

    const imageInput =
        document.getElementById(
            "productImage"
        );


    if (!imageInput) {

        return;

    }


    imageInput.addEventListener(
        "change",
        () => {

            removeImagePreview();


            const file =
                imageInput.files?.[0];


            if (!file) {

                return;

            }


            /* ------------------------------------------------
               TYPE
            ------------------------------------------------ */

            if (
                ![
                    "image/png",
                    "image/jpeg",
                    "image/webp"
                ].includes(
                    file.type
                )
            ) {

                alert(
                    "Only PNG, JPG or WEBP images are allowed."
                );


                imageInput.value =
                    "";


                return;

            }


            /* ------------------------------------------------
               SIZE
            ------------------------------------------------ */

            if (
                file.size >
                10 * 1024 * 1024
            ) {

                alert(
                    "Image size must be less than 10 MB."
                );


                imageInput.value =
                    "";


                return;

            }


            /* ------------------------------------------------
               PREVIEW
            ------------------------------------------------ */

            const preview =
                document.createElement(
                    "img"
                );


            preview.id =
                "productImagePreview";


            preview.src =
                URL.createObjectURL(
                    file
                );


            preview.alt =
                "Product preview";


            preview.style.width =
                "180px";


            preview.style.height =
                "180px";


            preview.style.objectFit =
                "cover";


            preview.style.borderRadius =
                "12px";


            preview.style.margin =
                "20px auto 0";


            preview.style.display =
                "block";


            preview.style.border =
                "2px solid #FF6B00";


            if (
                imageInput.parentElement
            ) {

                imageInput.parentElement.appendChild(
                    preview
                );

            }

        }
    );

}


/* ============================================================
   REMOVE IMAGE PREVIEW
============================================================ */

function removeImagePreview() {

    const oldPreview =
        document.getElementById(
            "productImagePreview"
        );


    if (oldPreview) {

        if (
            oldPreview.src.startsWith(
                "blob:"
            )
        ) {

            URL.revokeObjectURL(
                oldPreview.src
            );

        }


        oldPreview.remove();

    }

}


/* ============================================================
   PRODUCT SUBMIT
============================================================ */

async function handleProductSubmit(event) {

    event.preventDefault();


    /* ========================================================
       VERIFY ACCESS AGAIN
    ======================================================== */

    const sellerAccess =
        await checkSellerStatus();


    if (!sellerAccess) {

        alert(
            "Only an approved seller or admin can add products."
        );


        return;

    }


    /* ========================================================
       FORM
    ======================================================== */

    const form =
        event.currentTarget;


    const imageInput =
        document.getElementById(
            "productImage"
        );


    const nameInput =
        document.getElementById(
            "productName"
        );


    const categoryInput =
        document.getElementById(
            "productCategory"
        );


    const priceInput =
        document.getElementById(
            "productPrice"
        );


    const stockInput =
        document.getElementById(
            "productStock"
        );


    const descriptionInput =
        document.getElementById(
            "productDescription"
        );


    const brandInput =
        document.getElementById(
            "brandName"
        );


    const sizeInput =
        document.getElementById(
            "productSize"
        );


    /* ========================================================
       VALIDATE ELEMENTS
    ======================================================== */

    if (
        !imageInput ||
        !nameInput ||
        !categoryInput ||
        !priceInput ||
        !stockInput ||
        !descriptionInput
    ) {

        alert(
            "Some product fields are missing."
        );


        return;

    }


    /* ========================================================
       VALUES
    ======================================================== */

    const name =
        nameInput.value.trim();


    const category =
        categoryInput.value.trim();


    const price =
        Number(
            priceInput.value
        );


    const stock =
        Number(
            stockInput.value
        );


    const description =
        descriptionInput.value.trim();


    const brand =
        brandInput
            ? brandInput.value.trim()
            : "";


    const size =
        sizeInput
            ? sizeInput.value.trim()
            : "";


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!name) {

        alert(
            "Please enter product name."
        );


        return;

    }


    if (!category) {

        alert(
            "Please select a category."
        );


        return;

    }


    if (
        !Number.isFinite(price) ||
        price < 0
    ) {

        alert(
            "Please enter a valid price."
        );


        return;

    }


    if (
        !Number.isInteger(stock) ||
        stock < 0
    ) {

        alert(
            "Please enter a valid stock quantity."
        );


        return;

    }


    if (!description) {

        alert(
            "Please enter product description."
        );


        return;

    }


    /* ========================================================
       IMAGE
    ======================================================== */

    const imageFile =
        imageInput.files?.[0];


    if (!imageFile) {

        alert(
            "Please select a product image."
        );


        return;

    }


    const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp"
    ];


    if (
        !allowedTypes.includes(
            imageFile.type
        )
    ) {

        alert(
            "Only PNG, JPG or WEBP images are allowed."
        );


        return;

    }


    if (
        imageFile.size >
        10 * 1024 * 1024
    ) {

        alert(
            "Image size must be less than 10 MB."
        );


        return;

    }


    /* ========================================================
       SUBMIT BUTTON
    ======================================================== */

    const submitButton =
        form.querySelector(
            'button[type="submit"]'
        );


    const originalButtonHTML =
        submitButton
            ? submitButton.innerHTML
            : "";


    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.innerHTML =
            `
                <span class="material-symbols-outlined text-base">
                    progress_activity
                </span>
                UPLOADING...
            `;

    }


    let uploadedImagePath =
        null;


    try {

        /* ====================================================
           EXTENSION
        ==================================================== */

        const extension =
            getFileExtension(
                imageFile
            );


        /* ====================================================
           SAFE NAME
        ==================================================== */

        const safeName =
            name
                .toLowerCase()
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-+|-+$/g,
                    ""
                )
                .substring(
                    0,
                    60
                );


        /* ====================================================
           UNIQUE NAME
        ==================================================== */

        const uniqueName =
            `${Date.now()}-${cryptoRandomString(8)}-${safeName || "product"}.${extension}`;


        uploadedImagePath =
            `products/${uniqueName}`;


        /* ====================================================
           UPLOAD
        ==================================================== */

        const {
            data: uploadData,
            error: uploadError
        } =
            await supabaseClient
                .storage
                .from("product-images")
                .upload(
                    uploadedImagePath,
                    imageFile,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            imageFile.type
                    }
                );


        if (uploadError) {

            console.error(
                "Image upload error:",
                uploadError
            );


            throw new Error(
                uploadError.message ||
                "Image upload failed."
            );

        }


        console.log(
            "Image uploaded:",
            uploadData
        );


        /* ====================================================
           PUBLIC URL
        ==================================================== */

        const {
            data: publicUrlData
        } =
            supabaseClient
                .storage
                .from("product-images")
                .getPublicUrl(
                    uploadedImagePath
                );


        const imageUrl =
            publicUrlData?.publicUrl;


        if (!imageUrl) {

            throw new Error(
                "Could not generate product image URL."
            );

        }


        /* ====================================================
           PRODUCT DATA
        ==================================================== */

        const productData = {

            name:
                name,

            sport:
                category,

            category:
                category,

            price:
                price,

            stock:
                stock,

            image_url:
                imageUrl,

            description:
                description,

            brand:
                brand || "KHELZONE",

            size:
                size || "Standard",

            is_active:
                true,

            seller_id:
                currentUser.id

        };


        console.log(
            "Product data:",
            productData
        );


        /* ====================================================
           INSERT
        ==================================================== */

        const {
            data: insertedProduct,
            error: productError
        } =
            await supabaseClient
                .from("products")
                .insert(
                    productData
                )
                .select()
                .single();


        if (productError) {

            console.error(
                "Product insert error:",
                productError
            );


            /* -----------------------------------------------
               REMOVE IMAGE
            ------------------------------------------------ */

            await supabaseClient
                .storage
                .from("product-images")
                .remove(
                    [
                        uploadedImagePath
                    ]
                );


            uploadedImagePath =
                null;


            throw new Error(
                productError.message ||
                "Product could not be added."
            );

        }


        console.log(
            "Product added:",
            insertedProduct
        );


        /* ====================================================
           SUCCESS
        ==================================================== */

        alert(
            "Product added successfully!"
        );


        form.reset();


        removeImagePreview();


        console.log(
            "Product successfully added."
        );


    }

    catch (error) {

        console.error(
            "Product submit error:",
            error
        );


        alert(
            error?.message ||
            "Something went wrong while adding the product."
        );

    }

    finally {

        if (submitButton) {

            submitButton.disabled =
                false;


            submitButton.innerHTML =
                originalButtonHTML;

        }

    }

}


/* ============================================================
   GET FILE EXTENSION
============================================================ */

function getFileExtension(file) {

    const fileName =
        file?.name || "";


    const parts =
        fileName.split(".");


    if (
        parts.length < 2
    ) {

        if (
            file.type === "image/png"
        ) {

            return "png";

        }


        if (
            file.type === "image/webp"
        ) {

            return "webp";

        }


        return "jpg";

    }


    const extension =
        parts
            .pop()
            .toLowerCase();


    if (
        [
            "png",
            "jpg",
            "jpeg",
            "webp"
        ].includes(
            extension
        )
    ) {

        return extension === "jpeg"
            ? "jpg"
            : extension;

    }


    return "jpg";

}


/* ============================================================
   RANDOM STRING
============================================================ */

function cryptoRandomString(
    length = 8
) {

    const chars =
        "abcdefghijklmnopqrstuvwxyz0123456789";


    let result =
        "";


    try {

        if (
            window.crypto &&
            window.crypto.getRandomValues
        ) {

            const values =
                new Uint32Array(
                    length
                );


            window.crypto.getRandomValues(
                values
            );


            for (
                let i = 0;
                i < length;
                i++
            ) {

                result +=
                    chars[
                        values[i] %
                        chars.length
                    ];

            }


            return result;

        }

    }

    catch (error) {

        console.warn(
            "Crypto random generation failed:",
            error
        );

    }


    for (
        let i = 0;
        i < length;
        i++
    ) {

        result +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }


    return result;

}


/* ============================================================
   GLOBAL DEBUG
============================================================ */

window.KHELZONE_SELLER = {

    getCurrentUser:
        () => currentUser,

    getCurrentProfile:
        () => currentProfile,

    getCurrentSeller:
        () => currentSeller,

    checkSellerStatus:
        checkSellerStatus,

    updateSellerDashboardButton:
        updateSellerDashboardButton,

    isUserAdmin:
        isUserAdmin

};


console.log(
    "KHELZONE seller.js loaded successfully."
);