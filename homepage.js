document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       STORAGE KEYS
       Shared with shop.js / cart.html — do not rename these,
       every page on the site reads/writes the same keys.
    ========================================================== */

    const CART_KEY = "khz_cart";
    const WISHLIST_KEY = "khz_wishlist";


    /* =========================================================
       CART HELPERS
       Cart items are { id, size, qty } — same shape shop.js uses.
       The homepage never needs full product data just to show a
       count, so this stays intentionally lightweight.
    ========================================================== */

    function loadCart() {

        try {

            const saved = JSON.parse(localStorage.getItem(CART_KEY) || "[]");

            return Array.isArray(saved) ? saved : [];

        } catch (error) {

            return [];
        }
    }


    function saveCart(cart) {

        try {

            localStorage.setItem(CART_KEY, JSON.stringify(cart));

        } catch (error) {

            console.error("Could not save cart:", error);
        }
    }


    function cartQuantity(cart) {

        return cart.reduce(
            (total, item) => total + Number(item.qty || 0),
            0
        );
    }


    function updateCartCount() {

        const cartCount = document.getElementById("cartCount");

        if (!cartCount) return;

        cartCount.textContent = cartQuantity(loadCart());
    }


    /* =========================================================
       ADD TO CART
       Used by the "Add to Cart" buttons rendered on Best Seller
       cards in homepage.html (delegated, since the grid re-renders).
    ========================================================== */

    function addToHomepageCart(id) {

        if (!id) return;

        const cart = loadCart();

        const existing = cart.find(
            item =>
                String(item.id) === String(id) &&
                item.size === "Standard"
        );

        if (existing) {

            existing.qty = Number(existing.qty || 0) + 1;

        } else {

            cart.push({
                id: id,
                size: "Standard",
                qty: 1
            });
        }

        saveCart(cart);

        updateCartCount();

        showToast("Added to cart", "cart");
    }


    /* =========================================================
       WISHLIST HELPERS
       Wishlist is just an array of product ids — same shape
       shop.js uses.
    ========================================================== */

    function loadWishlist() {

        try {

            const saved = JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );

            return Array.isArray(saved) ? saved : [];

        } catch (error) {

            return [];
        }
    }


    function saveWishlist(wishlist) {

        try {

            localStorage.setItem(
                WISHLIST_KEY,
                JSON.stringify(wishlist)
            );

        } catch (error) {

            console.error("Could not save wishlist:", error);
        }
    }


    function updateWishlistCount() {

        const wishlistCount =
            document.getElementById("wishlistCount");

        if (!wishlistCount) return;

        const count = loadWishlist().length;

        wishlistCount.textContent = count;

        wishlistCount.classList.toggle(
            "hidden",
            count === 0
        );
    }


    function toggleHomepageWishlist(id, button) {

        if (!id) return;

        const wishlist = loadWishlist();

        const index = wishlist.findIndex(
            item => String(item) === String(id)
        );

        let nowLiked;

        if (index >= 0) {

            wishlist.splice(index, 1);

            nowLiked = false;

        } else {

            wishlist.push(id);

            nowLiked = true;
        }

        saveWishlist(wishlist);

        updateWishlistCount();

        if (button) {

            button.classList.toggle(
                "text-orange-500",
                nowLiked
            );

            button.classList.toggle(
                "text-white",
                !nowLiked
            );

            const icon = button.querySelector(
                ".material-symbols-outlined"
            );

            if (icon) {

                icon.style.fontVariationSettings =
                    `'FILL' ${nowLiked ? 1 : 0}`;
            }
        }

        showToast(
            nowLiked
                ? "Added to wishlist"
                : "Removed from wishlist",
            "wishlist"
        );
    }


    /* =========================================================
       SPORT CATEGORY → SHOP FILTER
       Click a sport category on homepage and open shop.html
       with that category automatically selected.
       
       Example:
       Cricket → shop.html?category=Cricket
       Football → shop.html?category=Football
    ========================================================== */

    document
        .querySelectorAll(".sport-card[data-sport]")
        .forEach(function (card) {

            // Show clickable cursor
            card.style.cursor = "pointer";


            // Make card keyboard accessible
            if (!card.hasAttribute("tabindex")) {

                card.setAttribute("tabindex", "0");
            }

            if (!card.hasAttribute("role")) {

                card.setAttribute("role", "button");
            }


            // Click category
            card.addEventListener("click", function () {

                const sport = card.dataset.sport;

                if (!sport) return;

                window.location.href =
                    "shop.html?category=" +
                    encodeURIComponent(sport);
            });


            // Keyboard support
            card.addEventListener("keydown", function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    card.click();
                }
            });
        });


    /* =========================================================
       DELEGATED CLICK HANDLING
       Handles buttons rendered dynamically inside #productGrid
       (add-to-cart, wishlist heart) since they don't exist at
       DOMContentLoaded time.
    ========================================================== */

    document.addEventListener("click", function (event) {

        const addBtn = event.target.closest(
            ".khz-addcart-btn"
        );

        if (addBtn && !addBtn.disabled) {

            addToHomepageCart(
                addBtn.dataset.id
            );

            return;
        }


        const wishBtn = event.target.closest(
            ".khz-wishlist-btn"
        );

        if (wishBtn) {

            toggleHomepageWishlist(
                wishBtn.dataset.id,
                wishBtn
            );

            return;
        }
    });


    /* =========================================================
       KEEP COUNTS IN SYNC ACROSS TABS / PAGES
    ========================================================== */

    window.addEventListener("storage", function (event) {

        if (event.key === CART_KEY) {

            updateCartCount();
        }

        if (event.key === WISHLIST_KEY) {

            updateWishlistCount();
        }
    });


    window.addEventListener("focus", function () {

        updateCartCount();

        updateWishlistCount();
    });


    /* =========================================================
       DEALS SMOOTH SCROLL
    ========================================================== */

    document
        .querySelectorAll('a[href="#deals"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const deals =
                        document.getElementById("deals");

                    if (deals) {

                        event.preventDefault();

                        deals.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                }
            );
        });


    /* =========================================================
       STORY SMOOTH SCROLL
    ========================================================== */

    document
        .querySelectorAll('a[href="#story"]')
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const story =
                        document.getElementById("story");

                    if (story) {

                        event.preventDefault();

                        story.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                }
            );
        });


    /* =========================================================
       TOAST
    ========================================================== */

    const toast =
        document.getElementById("toast");

    const toastText =
        document.getElementById("toastText");

    let toastTimer;


    function showToast(message, type) {

        if (!toast) return;

        if (toastText) {

            toastText.textContent = message;
        }


        const icon = toast.querySelector(
            ".material-symbols-outlined"
        );

        if (icon) {

            icon.textContent =
                type === "wishlist"
                    ? "favorite"
                    : "check_circle";

            icon.style.color =
                type === "wishlist"
                    ? "#ff4d6d"
                    : "";
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


        toastTimer = setTimeout(function () {

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

    updateCartCount();

    updateWishlistCount();

});