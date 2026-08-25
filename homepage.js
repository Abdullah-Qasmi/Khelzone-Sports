document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       MOBILE MENU
    ========================================================== */

    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileLinks = document.querySelectorAll(".mobile-link");

    if (menuBtn && mobileMenu) {

        menuBtn.addEventListener("click", function () {

            const isOpen =
                mobileMenu.classList.contains("max-h-[600px]");

            if (isOpen) {

                mobileMenu.classList.remove(
                    "max-h-[600px]",
                    "opacity-100"
                );

                mobileMenu.classList.add(
                    "max-h-0",
                    "opacity-0"
                );

                menuBtn.setAttribute("aria-label", "Open menu");

            } else {

                mobileMenu.classList.remove(
                    "max-h-0",
                    "opacity-0"
                );

                mobileMenu.classList.add(
                    "max-h-[600px]",
                    "opacity-100"
                );

                menuBtn.setAttribute("aria-label", "Close menu");

            }

        });

    }


    /* =========================================================
       CLOSE MOBILE MENU AFTER LINK CLICK
    ========================================================== */

    mobileLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (mobileMenu) {

                mobileMenu.classList.remove(
                    "max-h-[600px]",
                    "opacity-100"
                );

                mobileMenu.classList.add(
                    "max-h-0",
                    "opacity-0"
                );

            }

        });

    });


    /* =========================================================
       SEARCH OPEN
    ========================================================== */

    const searchBtn =
        document.getElementById("searchBtn");

    const searchPanel =
        document.getElementById("searchPanel");

    const closeSearch =
        document.getElementById("closeSearch");

    const searchInput =
        document.getElementById("searchInput");


    if (searchBtn && searchPanel) {

        searchBtn.addEventListener("click", function () {

            searchPanel.classList.toggle("hidden");

            if (!searchPanel.classList.contains("hidden")) {

                setTimeout(function () {

                    if (searchInput) {
                        searchInput.focus();
                    }

                }, 100);

            }

        });

    }


    /* =========================================================
       CLOSE SEARCH
    ========================================================== */

    if (closeSearch && searchPanel) {

        closeSearch.addEventListener("click", function () {

            searchPanel.classList.add("hidden");

        });

    }


    /* =========================================================
       CLOSE SEARCH WITH ESCAPE KEY
    ========================================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            if (searchPanel) {
                searchPanel.classList.add("hidden");
            }

            if (mobileMenu) {

                mobileMenu.classList.remove(
                    "max-h-[600px]",
                    "opacity-100"
                );

                mobileMenu.classList.add(
                    "max-h-0",
                    "opacity-0"
                );

            }

        }

    });


    /* =========================================================
       DEALS SMOOTH SCROLL
    ========================================================== */

    const dealLinks =
        document.querySelectorAll('a[href="#deals"]');

    dealLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const deals =
                document.getElementById("deals");

            if (deals) {

                event.preventDefault();

                deals.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =========================================================
       STORY SMOOTH SCROLL
    ========================================================== */

    const storyLinks =
        document.querySelectorAll('a[href="#story"]');

    storyLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const story =
                document.getElementById("story");

            if (story) {

                event.preventDefault();

                story.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =========================================================
       PRODUCT FILTER
    ========================================================== */

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const productCards =
        document.querySelectorAll(".product-card");

    const noProducts =
        document.getElementById("noProducts");

    const filterText =
        document.getElementById("filterText");


    filterButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const filter =
                button.getAttribute("data-filter");

            let visibleProducts = 0;


            /* REMOVE ACTIVE FROM ALL BUTTONS */

            filterButtons.forEach(function (btn) {

                btn.classList.remove(
                    "active",
                    "bg-orange-500",
                    "text-black"
                );

                btn.classList.add(
                    "bg-white/5",
                    "border",
                    "border-white/10"
                );

            });


            /* ADD ACTIVE TO CLICKED BUTTON */

            button.classList.add(
                "active",
                "bg-orange-500",
                "text-black"
            );

            button.classList.remove(
                "bg-white/5",
                "border",
                "border-white/10"
            );


            /* FILTER PRODUCTS */

            productCards.forEach(function (product) {

                const category =
                    product.getAttribute("data-category");


                if (
                    filter === "all" ||
                    category === filter
                ) {

                    product.classList.remove("hidden");

                    visibleProducts++;

                } else {

                    product.classList.add("hidden");

                }

            });


            /* NO PRODUCTS MESSAGE */

            if (noProducts) {

                if (visibleProducts === 0) {

                    noProducts.classList.remove("hidden");

                } else {

                    noProducts.classList.add("hidden");

                }

            }


            /* FILTER TEXT */

            if (filterText) {

                if (filter === "all") {

                    filterText.textContent =
                        "Handpicked equipment for your game.";

                } else {

                    filterText.textContent =
                        "Showing " +
                        filter.charAt(0).toUpperCase() +
                        filter.slice(1) +
                        " equipment.";

                }

            }

        });

    });


    /* =========================================================
       WISHLIST
    ========================================================== */

    const wishlistButtons =
        document.querySelectorAll(".wishlist");

    const wishlistBtn =
        document.getElementById("wishlistBtn");

    const wishlistModal =
        document.getElementById("wishlistModal");

    const wishlistList =
        document.getElementById("wishlistList");

    const wishCount =
        document.getElementById("wishCount");


    let wishlist = [];


    /* LOAD WISHLIST FROM LOCAL STORAGE */

    try {

        const savedWishlist =
            localStorage.getItem("khelzoneWishlist");

        if (savedWishlist) {

            wishlist =
                JSON.parse(savedWishlist);

        }

    } catch (error) {

        wishlist = [];

    }


    function saveWishlist() {

        localStorage.setItem(
            "khelzoneWishlist",
            JSON.stringify(wishlist)
        );

    }


    function updateWishlistCount() {

        if (!wishCount) return;


        if (wishlist.length > 0) {

            wishCount.textContent =
                wishlist.length;

            wishCount.classList.remove("hidden");

        } else {

            wishCount.classList.add("hidden");

        }

    }


    function updateWishlistButtons() {

        wishlistButtons.forEach(function (button) {

            const card =
                button.closest(".product-card");

            if (!card) return;


            const name =
                card.getAttribute("data-name");


            const icon =
                button.querySelector(
                    ".material-symbols-outlined"
                );


            const exists =
                wishlist.some(function (item) {

                    return item.name === name;

                });


            if (exists) {

                button.classList.add(
                    "bg-red-500",
                    "text-white"
                );

                if (icon) {
                    icon.textContent = "favorite";
                }

            } else {

                button.classList.remove(
                    "bg-red-500",
                    "text-white"
                );

                if (icon) {
                    icon.textContent = "favorite";
                }

            }

        });

    }


    function renderWishlist() {

        if (!wishlistList) return;


        wishlistList.innerHTML = "";


        if (wishlist.length === 0) {

            wishlistList.innerHTML = `
                <div class="text-center py-10 text-gray-500">
                    <span class="material-symbols-outlined text-5xl">
                        favorite_border
                    </span>

                    <p class="mt-3">
                        Your wishlist is empty.
                    </p>
                </div>
            `;

            return;

        }


        wishlist.forEach(function (item, index) {

            const itemElement =
                document.createElement("div");


            itemElement.className =
                "flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10";


            itemElement.innerHTML = `
                <div class="min-w-0">
                    <p class="font-bold text-sm truncate">
                        ${item.name}
                    </p>

                    <p class="text-xs text-orange-400 mt-1">
                        ${item.price ? "Rs. " + Number(item.price).toLocaleString() : ""}
                    </p>
                </div>

                <button
                    class="remove-wishlist shrink-0 w-9 h-9 rounded-full hover:bg-red-500/20 text-red-400"
                    data-index="${index}"
                    aria-label="Remove from wishlist">

                    <span class="material-symbols-outlined text-lg">
                        delete
                    </span>

                </button>
            `;


            wishlistList.appendChild(itemElement);

        });


        const removeButtons =
            wishlistList.querySelectorAll(
                ".remove-wishlist"
            );


        removeButtons.forEach(function (button) {

            button.addEventListener("click", function () {

                const index =
                    Number(
                        button.getAttribute("data-index")
                    );


                wishlist.splice(index, 1);

                saveWishlist();

                updateWishlistCount();

                updateWishlistButtons();

                renderWishlist();

            });

        });

    }


    wishlistButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const card =
                button.closest(".product-card");

            if (!card) return;


            const name =
                card.getAttribute("data-name");


            const priceElement =
                card.querySelector(".text-xl");


            const price =
                priceElement
                    ? priceElement.textContent
                        .replace("Rs.", "")
                        .replace(/,/g, "")
                        .trim()
                    : "";


            const existingIndex =
                wishlist.findIndex(function (item) {

                    return item.name === name;

                });


            if (existingIndex !== -1) {

                wishlist.splice(existingIndex, 1);

                showToast(
                    "Removed from wishlist"
                );

            } else {

                wishlist.push({
                    name: name,
                    price: price
                });

                showToast(
                    "Added to wishlist"
                );

            }


            saveWishlist();

            updateWishlistCount();

            updateWishlistButtons();

        });

    });


    /* =========================================================
       OPEN WISHLIST MODAL
    ========================================================== */

    if (wishlistBtn && wishlistModal) {

        wishlistBtn.addEventListener("click", function () {

            renderWishlist();

            wishlistModal.classList.remove("hidden");

        });

    }


    /* =========================================================
       CLOSE WISHLIST BY CLICKING OUTSIDE
    ========================================================== */

    if (wishlistModal) {

        wishlistModal.addEventListener("click", function (event) {

            if (event.target === wishlistModal) {

                wishlistModal.classList.add("hidden");

            }

        });

    }


    /* =========================================================
       CART
    ========================================================== */

    const cartButtons =
        document.querySelectorAll(".add-cart");

    const cartCount =
        document.getElementById("cartCount");

    const cartOverlay =
        document.getElementById("cartOverlay");

    const cartDrawer =
        document.getElementById("cartDrawer");

    const closeCart =
        document.getElementById("closeCart");

    const cartItems =
        document.getElementById("cartItems");

    const cartSubtitle =
        document.getElementById("cartSubtitle");

    const cartTotal =
        document.getElementById("cartTotal");


    let cart = [];


    /* LOAD CART */

    try {

        const savedCart =
            localStorage.getItem("khelzoneCart");

        if (savedCart) {

            cart =
                JSON.parse(savedCart);

        }

    } catch (error) {

        cart = [];

    }


    function saveCart() {

        localStorage.setItem(
            "khelzoneCart",
            JSON.stringify(cart)
        );

    }


    function getCartQuantity() {

        return cart.reduce(
            function (total, item) {

                return total + item.quantity;

            },
            0
        );

    }


    function getCartTotal() {

        return cart.reduce(
            function (total, item) {

                return total +
                    Number(item.price) *
                    Number(item.quantity);

            },
            0
        );

    }


    function updateCartCount() {

        if (!cartCount) return;


        const quantity =
            getCartQuantity();


        cartCount.textContent =
            quantity;

    }


    function renderCart() {

        if (!cartItems) return;


        const oldItems =
            cartItems.querySelectorAll(
                ".cart-product"
            );


        oldItems.forEach(function (item) {

            item.remove();

        });


        if (cart.length === 0) {

            const emptyCart =
                document.getElementById("emptyCart");

            if (emptyCart) {

                emptyCart.classList.remove("hidden");

            }

        } else {

            const emptyCart =
                document.getElementById("emptyCart");

            if (emptyCart) {

                emptyCart.classList.add("hidden");

            }


            cart.forEach(function (item, index) {

                const cartItem =
                    document.createElement("div");


                cartItem.className =
                    "cart-product p-4 rounded-xl bg-white/5 border border-white/10";


                cartItem.innerHTML = `
                    <div class="flex items-center justify-between gap-3">

                        <div class="min-w-0">

                            <h3 class="font-bold text-sm">
                                ${item.name}
                            </h3>

                            <p class="text-orange-400 text-sm mt-1">
                                Rs. ${Number(item.price).toLocaleString()}
                            </p>

                        </div>

                        <button
                            class="remove-cart text-gray-500 hover:text-red-400"
                            data-index="${index}">

                            <span class="material-symbols-outlined">
                                delete
                            </span>

                        </button>

                    </div>

                    <div class="flex items-center justify-between mt-4">

                        <div class="flex items-center gap-2">

                            <button
                                class="cart-minus w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20"
                                data-index="${index}">

                                −

                            </button>

                            <span class="w-8 text-center font-bold">
                                ${item.quantity}
                            </span>

                            <button
                                class="cart-plus w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20"
                                data-index="${index}">

                                +

                            </button>

                        </div>

                        <strong>
                            Rs. ${(Number(item.price) * Number(item.quantity)).toLocaleString()}
                        </strong>

                    </div>
                `;


                cartItems.appendChild(cartItem);

            });


            /* REMOVE CART ITEM */

            cartItems
                .querySelectorAll(".remove-cart")
                .forEach(function (button) {

                    button.addEventListener("click", function () {

                        const index =
                            Number(
                                button.getAttribute("data-index")
                            );


                        cart.splice(index, 1);

                        saveCart();

                        updateCartCount();

                        renderCart();

                    });

                });


            /* MINUS */

            cartItems
                .querySelectorAll(".cart-minus")
                .forEach(function (button) {

                    button.addEventListener("click", function () {

                        const index =
                            Number(
                                button.getAttribute("data-index")
                            );


                        if (cart[index].quantity > 1) {

                            cart[index].quantity--;

                        } else {

                            cart.splice(index, 1);

                        }


                        saveCart();

                        updateCartCount();

                        renderCart();

                    });

                });


            /* PLUS */

            cartItems
                .querySelectorAll(".cart-plus")
                .forEach(function (button) {

                    button.addEventListener("click", function () {

                        const index =
                            Number(
                                button.getAttribute("data-index")
                            );


                        cart[index].quantity++;

                        saveCart();

                        updateCartCount();

                        renderCart();

                    });

                });

        }


        /* SUBTOTAL */

        if (cartSubtitle) {

            const quantity =
                getCartQuantity();

            cartSubtitle.textContent =
                quantity +
                (quantity === 1 ? " item" : " items");

        }


        if (cartTotal) {

            cartTotal.textContent =
                "Rs. " +
                getCartTotal().toLocaleString();

        }

    }


    /* =========================================================
       ADD TO CART
    ========================================================== */

    cartButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const name =
                button.getAttribute("data-product");

            const price =
                Number(
                    button.getAttribute("data-price")
                );


            const existing =
                cart.find(function (item) {

                    return item.name === name;

                });


            if (existing) {

                existing.quantity++;

            } else {

                cart.push({
                    name: name,
                    price: price,
                    quantity: 1
                });

            }


            saveCart();

            updateCartCount();

            renderCart();

            showToast(
                "Added to cart"
            );

        });

    });


    /* =========================================================
       OPEN CART
    ========================================================== */

    function openCart() {

        renderCart();


        if (cartOverlay) {

            cartOverlay.classList.remove("hidden");

        }


        if (cartDrawer) {

            setTimeout(function () {

                cartDrawer.classList.remove(
                    "translate-x-full"
                );

            }, 10);

        }

    }


    /* =========================================================
       CLOSE CART
    ========================================================== */

    function closeCartDrawer() {

        if (cartDrawer) {

            cartDrawer.classList.add(
                "translate-x-full"
            );

        }


        if (cartOverlay) {

            setTimeout(function () {

                cartOverlay.classList.add("hidden");

            }, 300);

        }

    }


    /* =========================================================
       CART ICON
    ========================================================== */

    const cartLink =
        document.querySelector(
            'a[aria-label="Shopping cart"]'
        );


    if (cartLink) {

        cartLink.addEventListener(
            "click",
            function (event) {

                /*
                 * Agar tum cart.html par nahi jana
                 * aur drawer open karna chahte ho
                 * to preventDefault active rahega.
                 */

                event.preventDefault();

                openCart();

            }
        );

    }


    if (closeCart) {

        closeCart.addEventListener(
            "click",
            closeCartDrawer
        );

    }


    if (cartOverlay) {

        cartOverlay.addEventListener(
            "click",
            closeCartDrawer
        );

    }


    /* =========================================================
       CHECKOUT
    ========================================================== */

    const checkoutBtn =
        document.getElementById("checkoutBtn");


    if (checkoutBtn) {

        checkoutBtn.addEventListener(
            "click",
            function () {

                if (cart.length === 0) {

                    showToast(
                        "Your cart is empty"
                    );

                    return;

                }


                window.location.href =
                    "cart.html";

            }
        );

    }


    /* =========================================================
       CLOSE CART WITH ESC
    ========================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                closeCartDrawer();

            }

        }
    );


    /* =========================================================
       NEWSLETTER
    ========================================================== */

    const newsletterForm =
        document.getElementById(
            "newsletterForm"
        );


    if (newsletterForm) {

        newsletterForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const emailInput =
                    newsletterForm.querySelector(
                        'input[type="email"]'
                    );


                if (
                    emailInput &&
                    emailInput.value.trim() !== ""
                ) {

                    showToast(
                        "Thanks for subscribing!"
                    );

                    newsletterForm.reset();

                }

            }
        );

    }


    /* =========================================================
       TOAST
    ========================================================== */

    const toast =
        document.getElementById("toast");

    const toastText =
        document.getElementById("toastText");


    let toastTimer;


    function showToast(message) {

        if (!toast) return;


        if (toastText) {

            toastText.textContent =
                message;

        }


        clearTimeout(toastTimer);


        toast.classList.remove(
            "translate-y-20",
            "opacity-0"
        );


        toast.classList.add(
            "translate-y-0",
            "opacity-100"
        );


        toastTimer =
            setTimeout(function () {

                toast.classList.remove(
                    "translate-y-0",
                    "opacity-100"
                );

                toast.classList.add(
                    "translate-y-20",
                    "opacity-0"
                );

            }, 2500);

    }


    /* =========================================================
       INITIALIZE
    ========================================================== */

    updateWishlistCount();

    updateWishlistButtons();

    updateCartCount();

    renderCart();

});