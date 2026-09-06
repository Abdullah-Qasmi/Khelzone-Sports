/* ============================================================
   KHELZONE SELLER PAGE
   COMPLETE SELLER ACCESS + PRODUCT ADD SYSTEM
   + SELLER DASHBOARD BUTTON
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

    console.log("KHELZONE seller.js started");


    /* ========================================================
       CREATE SUPABASE CLIENT
    ======================================================== */

    try {

        if (!window.supabase) {
            console.error("Supabase library not loaded.");
            showStatusMessage(
                "Supabase could not be loaded. Please refresh the page."
            );
            return;
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        console.log("Supabase connected.");

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
       HIDE DASHBOARD BUTTON BY DEFAULT
    ======================================================== */

    updateSellerDashboardButton(
        null,
        null
    );


    /* ========================================================
       CHECK SELLER / ADMIN ACCESS
    ======================================================== */

    await checkSellerStatus();


    /* ========================================================
       PRODUCT FORM
    ======================================================== */

    setupProductForm();

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
        return;
    }


    /* --------------------------------------------------------
       MENU BUTTON CLICK
    -------------------------------------------------------- */

    menuButton.addEventListener("click", (event) => {

        event.stopPropagation();

        const isOpen =
            mobileMenu.classList.contains("show");

        if (isOpen) {

            closeMobileMenu();

        } else {

            openMobileMenu();

        }

    });


    /* --------------------------------------------------------
       MOBILE LINKS
    -------------------------------------------------------- */

    const mobileLinks =
        mobileMenu.querySelectorAll("a");

    mobileLinks.forEach((link) => {

        link.addEventListener("click", () => {

            closeMobileMenu();

        });

    });


    /* --------------------------------------------------------
       CLICK OUTSIDE
    -------------------------------------------------------- */

    document.addEventListener("click", (event) => {

        if (
            mobileMenu.classList.contains("show") &&
            !mobileMenu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {

            closeMobileMenu();

        }

    });


    /* --------------------------------------------------------
       ESC KEY
    -------------------------------------------------------- */

    document.addEventListener("keydown", (event) => {

        if (event.key === "Escape") {

            closeMobileMenu();

        }

    });


    function openMobileMenu() {

        mobileMenu.classList.add("show");
        menuButton.classList.add("active");

        menuButton.setAttribute(
            "aria-expanded",
            "true"
        );

        menuButton.setAttribute(
            "aria-label",
            "Close menu"
        );

        if (menuIcon) {

            menuIcon.textContent = "close";

        }

    }


    function closeMobileMenu() {

        mobileMenu.classList.remove("show");
        menuButton.classList.remove("active");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

        menuButton.setAttribute(
            "aria-label",
            "Open menu"
        );

        if (menuIcon) {

            menuIcon.textContent = "menu";

        }

    }

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


    /* --------------------------------------------------------
       DEFAULT = HIDDEN
    -------------------------------------------------------- */

    let shouldShow = false;


    /* --------------------------------------------------------
       ADMIN CAN ACCESS
    -------------------------------------------------------- */

    if (
        role &&
        String(role).toLowerCase() === "admin"
    ) {

        shouldShow = true;

    }


    /* --------------------------------------------------------
       APPROVED SELLER CAN ACCESS
    -------------------------------------------------------- */

    if (
        role &&
        String(role).toLowerCase() === "seller" &&
        sellerStatus &&
        String(sellerStatus).toLowerCase() === "approved"
    ) {

        shouldShow = true;

    }


    /* --------------------------------------------------------
       UPDATE DESKTOP BUTTON
    -------------------------------------------------------- */

    if (desktopButton) {

        desktopButton.style.display =
            shouldShow ? "inline-flex" : "none";

    }


    /* --------------------------------------------------------
       UPDATE MOBILE BUTTON
    -------------------------------------------------------- */

    if (mobileButton) {

        mobileButton.style.display =
            shouldShow ? "flex" : "none";

    }


    console.log(
        "Seller Dashboard Button:",
        shouldShow ? "VISIBLE" : "HIDDEN",
        "| role:",
        role,
        "| status:",
        sellerStatus
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
        document.createElement("div");

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

        console.warn(text);

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

    } else if (type === "warning") {

        message.style.background =
            "rgba(245,158,11,.12)";

        message.style.border =
            "1px solid rgba(245,158,11,.45)";

        message.style.color =
            "#fbbf24";

    } else {

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
   GET ADD PRODUCT SECTION
============================================================ */

function getAddProductSection() {

    return document.getElementById(
        "add-product"
    );

}


/* ============================================================
   HIDE ADD PRODUCT
============================================================ */

function hideAddProduct() {

    const section =
        getAddProductSection();

    if (section) {

        section.style.display =
            "none";

    }

}


/* ============================================================
   SHOW ADD PRODUCT
============================================================ */

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


        /* ====================================================
           GET PROFILE
        ==================================================== */

        let profile = null;
        let profileError = null;


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


        /* ====================================================
           PROFILE FOUND
        ==================================================== */

        if (profile) {

            currentProfile =
                profile;

            const role =
                String(
                    profile.role || "customer"
                ).toLowerCase();

            const status =
                String(
                    profile.seller_status || ""
                ).toLowerCase();


            console.log(
                "Profile:",
                profile
            );


            /* ------------------------------------------------
               DASHBOARD BUTTON
            ------------------------------------------------ */

            updateSellerDashboardButton(
                role,
                status
            );


            /* ------------------------------------------------
               ADMIN
            ------------------------------------------------ */

            if (role === "admin") {

                currentSeller = {
                    user: currentUser,
                    profile: profile,
                    role: "admin",
                    status: "approved"
                };


                showAddProduct();

                hideStatusMessage();


                console.log(
                    "Admin access granted."
                );


                return currentSeller;

            }


            /* ------------------------------------------------
               APPROVED SELLER
            ------------------------------------------------ */

            if (
                role === "seller" &&
                status === "approved"
            ) {

                currentSeller = {
                    user: currentUser,
                    profile: profile,
                    role: "seller",
                    status: "approved"
                };


                showAddProduct();

                hideStatusMessage();


                console.log(
                    "Approved seller access granted."
                );


                return currentSeller;

            }


            /* ------------------------------------------------
               PENDING SELLER
            ------------------------------------------------ */

            if (
                role === "seller" &&
                status === "pending"
            ) {

                hideAddProduct();

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
               REJECTED SELLER
            ------------------------------------------------ */

            if (
                role === "seller" &&
                status === "rejected"
            ) {

                hideAddProduct();

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

            if (role === "customer") {

                hideAddProduct();

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
               UNKNOWN ROLE
            ------------------------------------------------ */

            hideAddProduct();

            showStatusMessage(
                "You do not have seller access.",
                "error"
            );


            return null;

        }


        /* ====================================================
           PROFILE NOT FOUND
           FALLBACK TO SELLERS TABLE
        ==================================================== */

        if (profileError) {

            console.warn(
                "Profiles query returned an error:",
                profileError
            );

        }


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
           SELLER TABLE STATUS
        ==================================================== */

        const sellerStatus =
            String(
                seller.status || ""
            ).toLowerCase();


        currentSeller = {
            user: currentUser,
            seller: seller,
            role: "seller",
            status: sellerStatus
        };


        updateSellerDashboardButton(
            "seller",
            sellerStatus
        );


        /* ------------------------------------------------
           APPROVED
        ------------------------------------------------ */

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


        /* ------------------------------------------------
           PENDING
        ------------------------------------------------ */

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


        /* ------------------------------------------------
           REJECTED
        ------------------------------------------------ */

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


        /* ------------------------------------------------
           UNKNOWN STATUS
        ------------------------------------------------ */

        hideAddProduct();

        showStatusMessage(
            "Your seller account status could not be verified.",
            "error"
        );


        return null;


    } catch (error) {

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


    /* ========================================================
       IMAGE PREVIEW
    ======================================================== */

    setupImagePreview();


    /* ========================================================
       FORM SUBMIT
    ======================================================== */

    productForm.addEventListener(
        "submit",
        handleProductSubmit
    );


    /* ========================================================
       FORM RESET
    ======================================================== */

    productForm.addEventListener(
        "reset",
        () => {

            setTimeout(() => {

                removeImagePreview();

            }, 0);

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


            if (
                ![
                    "image/png",
                    "image/jpeg",
                    "image/webp"
                ].includes(file.type)
            ) {

                alert(
                    "Only PNG, JPG or WEBP images are allowed."
                );

                imageInput.value =
                    "";

                return;

            }


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


            const preview =
                document.createElement(
                    "img"
                );


            preview.id =
                "productImagePreview";


            preview.src =
                URL.createObjectURL(file);


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


            imageInput.parentElement.appendChild(
                preview
            );

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
       VERIFY SELLER AGAIN
       IMPORTANT: NEVER TRUST UI ONLY
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
       FORM ELEMENTS
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
       GET VALUES
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
       IMAGE REQUIRED
    ======================================================== */

    const imageFile =
        imageInput.files?.[0];


    if (!imageFile) {

        alert(
            "Please select a product image."
        );

        return;

    }


    /* ========================================================
       IMAGE TYPE
    ======================================================== */

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


    /* ========================================================
       IMAGE SIZE
    ======================================================== */

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
           FILE EXTENSION
        ==================================================== */

        const extension =
            getFileExtension(
                imageFile
            );


        /* ====================================================
           SAFE PRODUCT NAME
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
           UNIQUE FILE NAME
        ==================================================== */

        const uniqueName =
            `${Date.now()}-${cryptoRandomString(8)}-${safeName || "product"}.${extension}`;


        uploadedImagePath =
            `products/${uniqueName}`;


        /* ====================================================
           UPLOAD IMAGE
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
                        cacheControl: "3600",
                        upsert: false,
                        contentType: imageFile.type
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
           PUBLIC IMAGE URL
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

            name: name,

            sport: category,

            category: category,

            price: price,

            stock: stock,

            image_url: imageUrl,

            description: description,

            brand:
                brand || "KHELZONE",

            size:
                size || "Standard",

            is_active: true,

            seller_id:
                currentUser.id

        };


        console.log(
            "Product data:",
            productData
        );


        /* ====================================================
           INSERT PRODUCT
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
               DELETE IMAGE IF PRODUCT INSERT FAILED
            ------------------------------------------------ */

            await supabaseClient
                .storage
                .from("product-images")
                .remove([
                    uploadedImagePath
                ]);


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


    } catch (error) {

        console.error(
            "Product submit error:",
            error
        );


        alert(
            error?.message ||
            "Something went wrong while adding the product."
        );


    } finally {

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


    if (parts.length < 2) {

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
        ["png", "jpg", "jpeg", "webp"].includes(
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

function cryptoRandomString(length = 8) {

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

    } catch (error) {

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
   DEBUG HELPERS
============================================================ */

window.KHELZONE_SELLER = {

    getCurrentUser: () =>
        currentUser,

    getCurrentProfile: () =>
        currentProfile,

    getCurrentSeller: () =>
        currentSeller,

    checkSellerStatus:
        checkSellerStatus,

    updateSellerDashboardButton:
        updateSellerDashboardButton

};


console.log(
    "KHELZONE seller.js loaded successfully."
);