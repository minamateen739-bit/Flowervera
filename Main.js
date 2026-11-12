document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.querySelector(".nav-menu");
    const filterBtns = document.querySelectorAll(".tab-btn");
    const productCards = document.querySelectorAll(".product-card");
    const searchInput = document.getElementById("searchInput");

    // 1. Mobile Navigation Toggle
    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", function () {
            navMenu.classList.toggle("active");
        });
    }

    // Close mobile menu when clicking nav links
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", () => {
            if (navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
            }
        });
    });

    // 2. Product Category Filter Tabs
    if (filterBtns.length > 0 && productCards.length > 0) {
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", function () {
                filterBtns.forEach((b) => b.classList.remove("active"));
                this.classList.add("active");

                const filterValue = this.getAttribute("data-filter");

                productCards.forEach((card) => {
                    const cardCategory = card.getAttribute("data-category");
                    if (filterValue === "all" || cardCategory === filterValue) {
                        card.style.display = "flex"; 
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // 3. Live Search Bar
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const query = this.value.toLowerCase().trim();
            productCards.forEach((card) => {
                const titleElement = card.querySelector("h4");
                const descElement = card.querySelector(".product-desc");
                const title = titleElement ? titleElement.textContent.toLowerCase() : "";
                const desc = descElement ? descElement.textContent.toLowerCase() : "";
                
                if (title.includes(query) || desc.includes(query)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // 4. Dynamic Price Selector Update inside Cards
    const qtySelectors = document.querySelectorAll(".qty-select");
    qtySelectors.forEach((select) => {
        select.addEventListener("change", function () {
            const card = this.closest(".product-card");
            if (!card) return;
            const priceDisplay = card.querySelector(".price");
            const selectedPrice = parseInt(this.value, 10);
            if (priceDisplay && !isNaN(selectedPrice)) {
                priceDisplay.textContent = `PKR ${selectedPrice.toLocaleString()}`;
            }
        });
    });

    // --- WISHLIST SYSTEM LOGIC ---
    let wishlist = [];
    const wishlistBadges = document.querySelectorAll('.wishlist-count, #wishlistCount, .fa-heart + span, .heart-icon .badge');
    const wishlistItemsContainer = document.getElementById("wishlistItemsContainer");

    // Event delegation taake har product card ke andar ka heart/wishlist button detect ho jaye
    document.addEventListener("click", function(e) {
        const wishlistBtn = e.target.closest(".wishlist-btn, .add-to-wishlist, .fa-heart, button[aria-label*='Wishlist']");
        if (!wishlistBtn) return;
        
        // Agar ye header wala wishlist icon hai jo drawer kholta hai, to product add mat karo
        if (wishlistBtn.id === "openWishlist") return;

        e.preventDefault();
        const card = wishlistBtn.closest(".product-card");
        if (!card) return;

        const titleElem = card.querySelector("h4");
        const title = titleElem ? titleElem.textContent : "Product";
        
        const existingIndex = wishlist.findIndex(item => item.title === title);
        if (existingIndex > -1) {
            wishlist.splice(existingIndex, 1);
            wishlistBtn.classList.remove("active");
            if(wishlistBtn.querySelector("i")) {
                wishlistBtn.querySelector("i").classList.remove("fa-solid");
                wishlistBtn.querySelector("i").classList.add("fa-regular");
            }
        } else {
            wishlist.push({ title: title });
            wishlistBtn.classList.add("active");
            if(wishlistBtn.querySelector("i")) {
                wishlistBtn.querySelector("i").classList.remove("fa-regular");
                wishlistBtn.querySelector("i").classList.add("fa-solid");
            }
        }

        updateWishlistUI();
    });

    function updateWishlistUI() {
        wishlistBadges.forEach(badge => {
            badge.textContent = wishlist.length;
        });

        if (!wishlistItemsContainer) return;

        if (wishlist.length === 0) {
            wishlistItemsContainer.innerHTML = `<p class="empty-cart-text">Your wishlist is currently empty.</p>`;
        } else {
            wishlistItemsContainer.innerHTML = "";
            wishlist.forEach((item, index) => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item-row");
                itemElement.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;";
                itemElement.innerHTML = `
                    <div class="cart-item-details">
                        <h4 style="font-size: 0.9rem; margin-bottom: 2px;">${item.title}</h4>
                    </div>
                    <button type="button" class="remove-wishlist" data-index="${index}" style="background: none; border: none; color: #D47A8E; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                `;
                wishlistItemsContainer.appendChild(itemElement);
            });

            // Remove item from wishlist inside drawer
            document.querySelectorAll(".remove-wishlist").forEach(btn => {
                btn.addEventListener("click", function() {
                    const idx = this.getAttribute("data-index");
                    wishlist.splice(idx, 1);
                    updateWishlistUI();
                });
            });
        }
    }

    // --- CART SYSTEM LOGIC ---
    let cart = [];
    const cartBadges = document.querySelectorAll('#cartCount, .cart-count, .fa-bag-shopping + span, .cart-icon .badge');
    const cartDrawer = document.getElementById("cartDrawer");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCartBtn = document.getElementById("closeCart");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartTotalPrice = document.getElementById("cartTotalPrice") || document.getElementById("cartSubtotal");
    const cartIconBtns = document.querySelectorAll("#openCart, .cart-icon, a[href='#cart'], .fa-bag-shopping");

    cartIconBtns.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            openCart();
        });
    });

    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    function openCart() {
        if (cartDrawer) cartDrawer.classList.add("active");
        if (cartOverlay) cartOverlay.classList.add("active");
    }

    function closeCart() {
        if (cartDrawer) cartDrawer.classList.remove("active");
        if (cartOverlay) cartOverlay.classList.remove("active");
    }

    // Add to Cart Button Handler
    const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
    addToCartBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const card = this.closest(".product-card");
            if (!card) return;

            const title = card.querySelector("h4").textContent;
            const selectDropdown = card.querySelector(".qty-select");
            
            let price = 0;
            let variant = "Standard";

            if (selectDropdown) {
                price = parseInt(selectDropdown.value, 10);
                variant = selectDropdown.options[selectDropdown.selectedIndex].text.split(" - ")[0];
            } else {
                const priceElement = card.querySelector(".price");
                const priceText = priceElement ? priceElement.textContent.replace("PKR", "").replace(/,/g, "").trim() : "0";
                price = parseInt(priceText, 10) || 0;
            }

            const existingItem = cart.find(item => item.title === title && item.variant === variant);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    title: title,
                    variant: variant,
                    price: price,
                    quantity: 1
                });
            }

            updateCartUI();
            openCart();

            const originalContent = this.innerHTML;
            this.innerHTML = `<i class="fa-solid fa-check"></i> Added!`;
            this.style.backgroundColor = "#607C59";
            this.style.color = "#FFF";

            setTimeout(() => {
                this.innerHTML = originalContent;
                this.style.backgroundColor = "";
                this.style.color = "";
            }, 1000);
        });
    });

    // Update Cart UI & Badges
    function updateCartUI() {
        let totalCount = 0;
        let totalPrice = 0;

        cart.forEach(item => {
            totalCount += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        cartBadges.forEach(badge => {
            badge.textContent = totalCount;
        });

        const cartDrawerCount = document.getElementById("cartDrawerCount");
        if (cartDrawerCount) cartDrawerCount.textContent = totalCount;
        if (cartTotalPrice) cartTotalPrice.textContent = `PKR ${totalPrice.toLocaleString()}`;

        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `<p class="empty-cart-text">Your cart is currently empty.</p>`;
        } else {
            cartItemsContainer.innerHTML = "";
            cart.forEach((item, index) => {
                const itemElement = document.createElement("div");
                itemElement.classList.add("cart-item-row");
                itemElement.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee;";
                itemElement.innerHTML = `
                    <div class="cart-item-details">
                        <h4 style="font-size: 0.9rem; margin-bottom: 2px;">${item.title}</h4>
                        <span class="cart-variant" style="font-size: 0.75rem; color: #73686A;">${item.variant}</span><br>
                        <span class="cart-item-price" style="font-size: 0.85rem; font-weight: 600; color: #D47A8E;">PKR ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <div class="cart-item-controls" style="display: flex; align-items: center; gap: 8px;">
                        <button type="button" class="qty-btn decrease-qty" data-index="${index}" style="width: 24px; height: 24px; cursor: pointer;">-</button>
                        <span style="font-size: 0.85rem; font-weight: 600;">${item.quantity}</span>
                        <button type="button" class="qty-btn increase-qty" data-index="${index}" style="width: 24px; height: 24px; cursor: pointer;">+</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }

        document.querySelectorAll(".increase-qty").forEach(btn => {
            btn.addEventListener("click", function() {
                const idx = this.getAttribute("data-index");
                cart[idx].quantity++;
                updateCartUI();
            });
        });

        document.querySelectorAll(".decrease-qty").forEach(btn => {
            btn.addEventListener("click", function() {
                const idx = this.getAttribute("data-index");
                if (cart[idx].quantity > 1) {
                    cart[idx].quantity--;
                } else {
                    cart.splice(idx, 1);
                }
                updateCartUI();
            });
        });
    }

    // Checkout Button logic
    const checkoutBtn = document.querySelector(".cart-footer .btn-primary") || document.getElementById("checkoutBtn");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", function () {
            if (cart.length === 0) {
                alert("Your cart is empty! Please add some items first.");
                return;
            }

            const nameInput = document.getElementById("customerName");
            const phoneInput = document.getElementById("customerPhone");

            const customerName = nameInput ? nameInput.value.trim() : prompt("Please enter your Name for the order:") || "Valued Customer";
            const customerPhone = phoneInput ? phoneInput.value.trim() : prompt("Please enter your Phone / WhatsApp number:") || "Provided via WhatsApp";

            if (!customerName || !customerPhone) {
                alert("Name and Phone number are required for checkout!");
                return;
            }

            let totalPrice = 0;
            let orderSummary = "";

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                totalPrice += itemTotal;
                orderSummary += `${index + 1}. *${item.title} (${item.variant})* - Qty: ${item.quantity} - PKR ${itemTotal.toLocaleString()}\n`;
            });

            const ownerWhatsAppNumber = "923001234567"; 

            let whatsappMessage = `*New Order Received! - Flowervera 🌹*\n\n`;
            whatsappMessage += `👤 *Customer Name:* ${customerName}\n`;
            whatsappMessage += `📞 *Phone/WhatsApp:* ${customerPhone}\n\n`;
            whatsappMessage += `🛍️ *Order Items:*\n${orderSummary}\n`;
            whatsappMessage += `💰 *Total Amount:* PKR ${totalPrice.toLocaleString()}\n\n`;
            whatsappMessage += `_Please confirm this order!_`;

            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/${ownerWhatsAppNumber}?text=${encodedMessage}`;

            window.open(whatsappURL, "_blank");

            cart = [];
            updateCartUI();
            closeCart();
        });
    }

    // 6. Contact Form Submission
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("Thank you for contacting Flowervera! Our concierge team will get back to you shortly.");
            contactForm.reset();
        });
    }
});

// --- WISHLIST DRAWER TOGGLE ---
const wishlistDrawer = document.getElementById("wishlistDrawer");
const wishlistOverlay = document.getElementById("wishlistOverlay");
const closeWishlistBtn = document.getElementById("closeWishlist");
const openWishlistBtn = document.getElementById("openWishlist");

if (openWishlistBtn) {
    openWishlistBtn.addEventListener("click", function(e) {
        e.preventDefault();
        if (wishlistDrawer) wishlistDrawer.classList.add("active");
        if (wishlistOverlay) wishlistOverlay.classList.add("active");
    });
}

if (closeWishlistBtn) closeWishlistBtn.addEventListener("click", closeWishlistModal);
if (wishlistOverlay) wishlistOverlay.addEventListener("click", closeWishlistModal);

function closeWishlistModal() {
    if (wishlistDrawer) wishlistDrawer.classList.remove("active");
    if (wishlistOverlay) wishlistOverlay.classList.remove("active");
}