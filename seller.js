/* =========================================================
   KHELZONE SELLER.JS
   Seller Status + Add Product + Supabase Storage
========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    /* =====================================================
       SUPABASE CONFIG
    ===================================================== */

    const SUPABASE_URL =
        "https://antqexjhlsaynunlmzqa.supabase.co";

    const SUPABASE_KEY =
        "sb_publishable_pGWCdhUgU9p4JTWUwSnj5g_1TosZQLu";

    const supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    const menuButton =
        document.getElementById("menuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (menuButton && mobileMenu) {

        menuButton.addEventListener("click", function () {

            const isOpen =
                mobileMenu.classList.toggle("show");

            menuButton.classList.toggle(
                "active",
                isOpen
            );

            menuButton.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );
        });


        const menuLinks =
            mobileMenu.querySelectorAll("a");

        menuLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mobileMenu.classList.remove("show");

                menuButton.classList.remove("active");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            });
        });


        document.addEventListener("click", function (event) {

            const clickedInsideMenu =
                mobileMenu.contains(event.target);

            const clickedButton =
                menuButton.contains(event.target);

            if (
                !clickedInsideMenu &&
                !clickedButton &&
                mobileMenu.classList.contains("show")
            ) {

                mobileMenu.classList.remove("show");

                menuButton.classList.remove("active");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );
            }
        });
    }


    /* =====================================================
       ADD PRODUCT ELEMENTS
    ===================================================== */

    const productForm =
        document.getElementById("productForm");

    const addProductSection =
        document.getElementById("add-product");

    const productImage =
        document.getElementById("productImage");

    const productName =
        document.getElementById("productName");

    const productCategory =
        document.getElementById("productCategory");

    const productPrice =
        document.getElementById("productPrice");

    const productStock =
        document.getElementById("productStock");

    const productDescription =
        document.getElementById("productDescription");

    const brandName =
        document.getElementById("brandName");

    const productSize =
        document.getElementById("productSize");


    /* =====================================================
       STATUS MESSAGE
    ===================================================== */

    let statusBox =
        document.getElementById("sellerStatusMessage");


    if (!statusBox && addProductSection) {

        statusBox =
            document.createElement("div");

        statusBox.id =
            "sellerStatusMessage";

        statusBox.style.display = "none";

        statusBox.style.margin =
            "20px auto";

        statusBox.style.maxWidth =
            "900px";

        statusBox.style.padding =
            "18px 22px";

        statusBox.style.borderRadius =
            "12px";

        statusBox.style.fontFamily =
            "Arial, sans-serif";

        addProductSection.parentNode.insertBefore(
            statusBox,
            addProductSection
        );
    }


    function showSellerMessage(
        message,
        type = "info"
    ) {

        if (!statusBox) return;

        statusBox.style.display = "block";

        statusBox.textContent = message;

        if (type === "success") {

            statusBox.style.background =
                "rgba(124,252,90,.10)";

            statusBox.style.border =
                "1px solid #7CFC5A";

            statusBox.style.color =
                "#7CFC5A";

        } else if (type === "error") {

            statusBox.style.background =
                "rgba(255,90,31,.10)";

            statusBox.style.border =
                "1px solid #ff5a1f";

            statusBox.style.color =
                "#ff5a1f";

        } else {

            statusBox.style.background =
                "rgba(255,255,255,.05)";

            statusBox.style.border =
                "1px solid #444";

            statusBox.style.color =
                "#f2f2f0";
        }
    }


    /* =====================================================
       HIDE ADD PRODUCT BY DEFAULT
    ===================================================== */

    if (addProductSection) {

        addProductSection.style.display =
            "none";
    }


    /* =====================================================
       CHECK SELLER STATUS
    ===================================================== */

    async function checkSellerStatus() {

        try {

            /*
             * Get currently logged-in user
             */

            const {
                data: {
                    user
                },
                error: authError
            } =
                await supabaseClient.auth.getUser();


            if (authError) {

                console.error(
                    "Auth error:",
                    authError
                );

                showSellerMessage(
                    "Unable to check your account. Please try again.",
                    "error"
                );

                return null;
            }


            /*
             * User is NOT logged in
             */

            if (!user) {

                showSellerMessage(
                    "Please login first and apply to become a seller.",
                    "error"
                );

                return null;
            }


            /*
             * Find seller record
             */

            const {
                data: seller,
                error: sellerError
            } =
                await supabaseClient
                    .from("sellers")
                    .select("*")
                    .eq("id", user.id)
                    .maybeSingle();


            if (sellerError) {

                console.error(
                    "Seller status error:",
                    sellerError
                );

                showSellerMessage(
                    "Seller information could not be loaded.",
                    "error"
                );

                return null;
            }


            /*
             * No seller application
             */

            if (!seller) {

                showSellerMessage(
                    "You are not a seller yet. Please use Become a Seller to apply.",
                    "info"
                );

                return {
                    user,
                    status: "not_seller"
                };
            }


            /*
             * APPROVED
             */

            if (
                seller.status === "approved"
            ) {

                if (addProductSection) {

                    addProductSection.style.display =
                        "";
                }

                showSellerMessage(
                    "✓ Your seller account is approved. You can add products now.",
                    "success"
                );

                return {
                    user,
                    seller,
                    status: "approved"
                };
            }


            /*
             * PENDING
             */

            if (
                seller.status === "pending"
            ) {

                showSellerMessage(
                    "Your seller application is currently under review. Add Product will be available after approval.",
                    "info"
                );

                return {
                    user,
                    seller,
                    status: "pending"
                };
            }


            /*
             * REJECTED
             */

            if (
                seller.status === "rejected"
            ) {

                showSellerMessage(
                    "Your seller application was not approved. Please contact KHELZONE for more information.",
                    "error"
                );

                return {
                    user,
                    seller,
                    status: "rejected"
                };
            }


            /*
             * DEFAULT
             */

            showSellerMessage(
                "Your seller account is not approved yet.",
                "info"
            );

            return {
                user,
                seller,
                status: seller.status || "pending"
            };

        } catch (error) {

            console.error(
                "Seller check failed:",
                error
            );

            showSellerMessage(
                "Something went wrong while checking seller status.",
                "error"
            );

            return null;
        }
    }


    /*
     * Check seller immediately
     */

    const sellerInfo =
        await checkSellerStatus();


    /* =====================================================
       IF PRODUCT FORM DOES NOT EXIST
    ===================================================== */

    if (!productForm) {

        console.warn(
            "Product form not found."
        );

        return;
    }


    /* =====================================================
       ALLOW PRODUCT SUBMISSION ONLY TO APPROVED SELLER
    ===================================================== */

    if (
        !sellerInfo ||
        sellerInfo.status !== "approved"
    ) {

        productForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                alert(
                    "Only approved sellers can add products."
                );
            }
        );

        return;
    }


    /* =====================================================
       IMAGE VALIDATION
    ===================================================== */

    function validateImage(file) {

        if (!file) {

            throw new Error(
                "Please select a product image."
            );
        }


        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp"
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            throw new Error(
                "Only PNG, JPG or WEBP images are allowed."
            );
        }


        const maxSize =
            10 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            throw new Error(
                "Image must be smaller than 10 MB."
            );
        }
    }


    /* =====================================================
       CREATE UNIQUE IMAGE PATH
    ===================================================== */

    function createImagePath(file) {

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const safeName =
            file.name
                .replace(
                    /\.[^/.]+$/,
                    ""
                )
                .replace(
                    /[^a-zA-Z0-9-_]/g,
                    "-"
                )
                .toLowerCase();


        const unique =
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 9);


        return (
            "products/" +
            unique +
            "-" +
            safeName +
            "." +
            extension
        );
    }


    /* =====================================================
       UPLOAD IMAGE TO SUPABASE STORAGE
    ===================================================== */

    async function uploadProductImage(file) {

        validateImage(file);


        const filePath =
            createImagePath(file);


        const {
            data,
            error
        } =
            await supabaseClient
                .storage
                .from("product-images")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: file.type
                    }
                );


        if (error) {

            console.error(
                "Storage upload error:",
                error
            );

            throw new Error(
                "Image upload failed: " +
                error.message
            );
        }


        const {
            data: publicData
        } =
            supabaseClient
                .storage
                .from("product-images")
                .getPublicUrl(
                    data.path
                );


        if (
            !publicData ||
            !publicData.publicUrl
        ) {

            throw new Error(
                "Could not create image URL."
            );
        }


        return {
            path: data.path,
            url: publicData.publicUrl
        };
    }


    /* =====================================================
       DELETE IMAGE
    ===================================================== */

    async function deleteStorageImage(
        filePath
    ) {

        if (!filePath) {
            return;
        }


        const {
            error
        } =
            await supabaseClient
                .storage
                .from("product-images")
                .remove([
                    filePath
                ]);


        if (error) {

            console.warn(
                "Could not delete image:",
                error
            );
        }
    }


    /* =====================================================
       IMAGE PREVIEW
    ===================================================== */

    if (productImage) {

        productImage.addEventListener(
            "change",
            function () {

                const file =
                    productImage.files[0];

                if (!file) return;

                try {

                    validateImage(file);

                } catch (error) {

                    alert(error.message);

                    productImage.value =
                        "";

                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        let preview =
                            document.getElementById(
                                "productImagePreview"
                            );


                        if (!preview) {

                            preview =
                                document.createElement(
                                    "img"
                                );

                            preview.id =
                                "productImagePreview";

                            preview.style.width =
                                "180px";

                            preview.style.height =
                                "180px";

                            preview.style.objectFit =
                                "cover";

                            preview.style.borderRadius =
                                "12px";

                            preview.style.margin =
                                "15px auto";

                            preview.style.display =
                                "block";

                            productImage.parentNode.appendChild(
                                preview
                            );
                        }


                        preview.src =
                            event.target.result;
                    };


                reader.readAsDataURL(file);
            }
        );
    }


    /* =====================================================
       STATUS BOX FOR PRODUCT FORM
    ===================================================== */

    let productStatus =
        document.getElementById(
            "productStatus"
        );


    if (!productStatus) {

        productStatus =
            document.createElement("div");

        productStatus.id =
            "productStatus";

        productStatus.style.marginTop =
            "15px";

        productStatus.style.padding =
            "12px";

        productStatus.style.borderRadius =
            "8px";

        productStatus.style.display =
            "none";

        productForm.appendChild(
            productStatus
        );
    }


    function showStatus(
        message,
        success = true
    ) {

        productStatus.style.display =
            "block";

        productStatus.textContent =
            message;


        if (success) {

            productStatus.style.color =
                "#7CFC5A";

            productStatus.style.border =
                "1px solid #7CFC5A";

            productStatus.style.background =
                "rgba(124,252,90,.08)";

        } else {

            productStatus.style.color =
                "#ff5a1f";

            productStatus.style.border =
                "1px solid #ff5a1f";

            productStatus.style.background =
                "rgba(255,90,31,.08)";
        }
    }


    /* =====================================================
       SUBMIT PRODUCT
    ===================================================== */

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /*
             * Re-check seller before every product
             */

            const currentSeller =
                await checkSellerStatus();


            if (
                !currentSeller ||
                currentSeller.status !== "approved"
            ) {

                showStatus(
                    "Only approved sellers can add products.",
                    false
                );

                return;
            }


            /* ---------------------------------------------
               GET VALUES
            --------------------------------------------- */

            const name =
                productName.value.trim();


            const category =
                productCategory.value.trim();


            const price =
                Number(
                    productPrice.value
                );


            const stock =
                Number(
                    productStock.value
                );


            const description =
                productDescription.value.trim();


            const brand =
                brandName
                    ? brandName.value.trim()
                    : "";


            const size =
                productSize
                    ? productSize.value.trim()
                    : "";


            const imageFile =
                productImage.files[0];


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!name) {

                showStatus(
                    "Please enter product name.",
                    false
                );

                productName.focus();

                return;
            }


            if (!category) {

                showStatus(
                    "Please select a category.",
                    false
                );

                productCategory.focus();

                return;
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                showStatus(
                    "Please enter a valid price.",
                    false
                );

                productPrice.focus();

                return;
            }


            if (
                !Number.isInteger(stock) ||
                stock < 0
            ) {

                showStatus(
                    "Please enter a valid stock quantity.",
                    false
                );

                productStock.focus();

                return;
            }


            if (!description) {

                showStatus(
                    "Please enter product description.",
                    false
                );

                productDescription.focus();

                return;
            }


            if (!imageFile) {

                showStatus(
                    "Please select a product image.",
                    false
                );

                productImage.focus();

                return;
            }


            /* ---------------------------------------------
               SUBMIT BUTTON
            --------------------------------------------- */

            const submitButton =
                productForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.innerHTML =
                    `
                    <span class="material-symbols-outlined text-base animate-spin">
                        progress_activity
                    </span>
                    UPLOADING...
                    `;
            }


            let uploadedImage =
                null;


            try {

                /* -----------------------------------------
                   STEP 1 — UPLOAD IMAGE
                ----------------------------------------- */

                showStatus(
                    "Uploading product image...",
                    true
                );


                uploadedImage =
                    await uploadProductImage(
                        imageFile
                    );


                /* -----------------------------------------
                   STEP 2 — PRODUCT DATA
                ----------------------------------------- */

                showStatus(
                    "Saving product...",
                    true
                );


                /*
                 * Category is also used as sport
                 */

                const sport =
                    category;


                const productData = {

                    name:
                        name,

                    sport:
                        sport,

                    category:
                        category,

                    price:
                        price,

                    stock:
                        stock,

                    image_url:
                        uploadedImage.url,

                    description:
                        description,

                    brand:
                        brand || "KHELZONE",

                    size:
                        size || "Standard",

                    is_active:
                        true,

                    /*
                     * VERY IMPORTANT
                     * Save seller's user ID
                     */

                    seller_id:
                        currentSeller.user.id
                };


                /* -----------------------------------------
                   STEP 3 — INSERT PRODUCT
                ----------------------------------------- */

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("products")
                        .insert([
                            productData
                        ])
                        .select()
                        .single();


                if (error) {

                    console.error(
                        "Database error:",
                        error
                    );


                    /*
                     * Product save failed.
                     * Delete uploaded image.
                     */

                    await deleteStorageImage(
                        uploadedImage.path
                    );


                    throw new Error(
                        "Product could not be saved: " +
                        error.message
                    );
                }


                console.log(
                    "Product saved:",
                    data
                );


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                showStatus(
                    "✅ Product added successfully!",
                    true
                );


                productForm.reset();


                /*
                 * Remove preview
                 */

                const preview =
                    document.getElementById(
                        "productImagePreview"
                    );


                if (preview) {

                    preview.remove();
                }


                /*
                 * Scroll to form
                 */

                setTimeout(
                    function () {

                        productForm.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    },
                    200
                );


            } catch (error) {

                console.error(
                    "Product submission error:",
                    error
                );


                showStatus(
                    "❌ " +
                    error.message,
                    false
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        "ADD PRODUCT";
                }
            }

        }
    );

});