document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // BECOME A SELLER BUTTONS
    // =========================

    const sellerLinks = document.querySelectorAll(
        'a[href="sellerinfo.html"]'
    );

    sellerLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "sellerinfo.html";
        });
    });


    // =========================
    // SELLER GUIDE BUTTONS
    // =========================

    const guideLinks = document.querySelectorAll(
        'a[href="seller-guide.html"], a[href="seller guide.html"]'
    );

    guideLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            window.location.href = "seller-guide.html";
        });
    });


    // =========================
    // MOBILE MENU
    // =========================

    const menuButton = document.querySelector(
        'button[aria-label="Open menu"]'
    );

    if (menuButton) {
        menuButton.addEventListener("click", function () {
            console.log("Menu clicked");
        });
    }

});
document.addEventListener("DOMContentLoaded", function () {

    const menuBtn = document.getElementById("menuBtn");
    const sellerNav = document.getElementById("sellerNav");

    if (!menuBtn || !sellerNav) return;

    menuBtn.addEventListener("click", function () {

        sellerNav.classList.toggle("show");

        const isOpen = sellerNav.classList.contains("show");

        menuBtn.setAttribute("aria-expanded", isOpen);

        const icon = menuBtn.querySelector(".material-symbols-outlined");

        if (icon) {
            icon.textContent = isOpen ? "close" : "menu";
        }

    });


    /* Menu link click hone par mobile menu close */
    sellerNav.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            sellerNav.classList.remove("show");

            menuBtn.setAttribute("aria-expanded", "false");

            const icon = menuBtn.querySelector(".material-symbols-outlined");

            if (icon) {
                icon.textContent = "menu";
            }

        });

    });

});