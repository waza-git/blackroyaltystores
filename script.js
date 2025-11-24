// Initialize AOS
AOS.init({
    offset: 100, // offset (in px) from the original trigger point
    delay: 0, // values from 0 to 3000, with step 50ms
    duration: 1000, // values from 0 to 3000, with step 50ms
    easing: 'ease', // default easing for AOS animations
    once: true, // whether animation should happen only once - while scrolling down
    mirror: false, // whether elements should animate out while scrolling past them
    anchorPlacement: 'top-bottom', // defines which position of the element should trigger the animation
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Shopping Cart Functionality
const cartIcon = document.getElementById('cart-icon');
const cartDrawer = document.getElementById('cart-drawer');
const closeCartButton = document.getElementById('close-cart-button');
const cartOverlay = document.getElementById('cart-overlay');
const cartBadge = document.getElementById('cart-badge');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const emptyCartMessage = document.getElementById('empty-cart-message');
const whatsappCheckoutBtn = document.getElementById('whatsapp-checkout-btn'); // New: WhatsApp checkout button

let cart = [];
let siteSettings = {}; // Store site settings

function saveCart() {
    localStorage.setItem('blackRoyaltyCart', JSON.stringify(cart));
}

function loadCart() {
    const storedCart = localStorage.getItem('blackRoyaltyCart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartUI();
    }
}

function openCart() {
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
}

function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
}

cartIcon.addEventListener('click', openCart);
closeCartButton.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function updateCartUI() {
    cartItemsContainer.innerHTML = ''; // Clear current items
    let total = 0;

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        if (whatsappCheckoutBtn) {
            whatsappCheckoutBtn.disabled = true; // Disable if cart is empty
            whatsappCheckoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    } else {
        emptyCartMessage.style.display = 'none';
        if (whatsappCheckoutBtn) {
            whatsappCheckoutBtn.disabled = false; // Enable if cart has items
            whatsappCheckoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const cartItemElement = document.createElement('div');
            cartItemElement.classList.add('flex', 'items-center', 'justify-between', 'bg-gray-800', 'p-4', 'rounded-md');
            cartItemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-md mr-4">
                <div class="flex-grow">
                    <h4 class="text-white font-semibold text-lg">${item.name}</h4>
                    <p class="text-gold">₦${item.price.toLocaleString()}</p>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <button class="quantity-btn bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-600 transition" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="text-white text-lg">${item.quantity}</span>
                    <button class="quantity-btn bg-gray-700 text-white px-2 py-1 rounded-md hover:bg-gray-600 transition" data-id="${item.id}" data-action="increase">+</button>
                    <button class="remove-from-cart-btn text-red-500 hover:text-red-700 transition ml-4" data-id="${item.id}">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }

    cartTotalElement.textContent = `₦${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    cartBadge.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    saveCart();
}

function addToCart(product) {
    const existingItemIndex = cart.findIndex(item => item.id === product.id);
    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += product.quantity || 1;
    } else {
        cart.push({ ...product, quantity: product.quantity || 1 });
    }
    updateCartUI();
    openCart();
}

// --- CMS Content Loading ---

async function fetchSettings() {
    try {
        const response = await fetch('content/settings.json');
        if (!response.ok) throw new Error('Failed to load settings');
        siteSettings = await response.json();
        applySettings(siteSettings);
    } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback or default settings could be applied here
    }
}

function applySettings(settings) {
    if (settings.hero_headline) {
        const heroHeadline = document.getElementById('hero-headline');
        if (heroHeadline) heroHeadline.textContent = settings.hero_headline;
    }
    if (settings.hero_subtext) {
        const heroSubtext = document.getElementById('hero-subtext');
        if (heroSubtext) heroSubtext.textContent = settings.hero_subtext;
    }
    if (settings.hero_bg_image) {
        const heroSection = document.getElementById('hero-section');
        if (heroSection) heroSection.style.backgroundImage = `url('${settings.hero_bg_image}')`;
    }
}

async function fetchProducts() {
    try {
        const response = await fetch('content/products.json');
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        renderProducts(data.products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function renderProducts(products) {
    const productGrid = document.getElementById('product-grid');
    if (!productGrid) return;

    productGrid.innerHTML = ''; // Clear loading state or existing items

    products.forEach((product, index) => {
        const delay = (index + 1) * 100; // Staggered animation delay
        const productCard = document.createElement('div');
        productCard.classList.add('product-card', 'bg-gray-800', 'rounded-lg', 'shadow-lg', 'overflow-hidden', 'p-6', 'hover:shadow-xl', 'transition-shadow', 'duration-300');
        productCard.setAttribute('data-aos', 'fade-up');
        productCard.setAttribute('data-aos-delay', delay);

        const stockButton = product.in_stock
            ? `<button class="add-to-cart-btn bg-purple-700 text-white px-6 py-3 rounded-full font-semibold w-full hover:bg-gold hover:text-black transition-all duration-300" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>`
            : `<button class="bg-gray-600 text-gray-400 px-6 py-3 rounded-full font-semibold w-full cursor-not-allowed" disabled>Out of Stock</button>`;

        productCard.innerHTML = `
            <a href="product-details.html?id=${product.id}" class="block">
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover mb-4 rounded-md product-image">
            </a>
            <h3 class="text-2xl font-bold text-white mb-2 product-title">${product.name}</h3>
            <p class="text-gray-400 text-sm mb-4 product-description">${product.description}</p>
            <p class="text-gold text-3xl font-bold mb-4 product-price">₦${product.price.toLocaleString()}</p>
            ${stockButton}
        `;
        productGrid.appendChild(productCard);
    });

    // Re-attach event listeners for the new buttons
    attachAddToCartListeners();
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.target;
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image,
                quantity: 1
            };
            addToCart(product);

            // Add click feedback animation
            btn.classList.add('animate-pulse-once');
            setTimeout(() => {
                btn.classList.remove('animate-pulse-once');
            }, 500);
        });
    });
}

// Event listener for product-details.html add to cart
// Note: product-details.html also needs to be updated to fetch product data by ID
// For now, we'll keep the existing logic but it might break if it relies on hardcoded data not present.
// Ideally, product-details.html should also fetch from content/products.json based on URL param.
const productDetailsAddToCartBtn = document.querySelector('section .add-to-cart-btn');
if (productDetailsAddToCartBtn) {
    productDetailsAddToCartBtn.addEventListener('click', () => {
        const id = new URLSearchParams(window.location.search).get('id') || `prod-${Math.random().toFixed(2)}`;
        const name = document.querySelector('.product-title').textContent;
        const price = parseFloat(document.querySelector('.product-price').textContent.replace(/₦|,/g, ''));
        const image = document.getElementById('main-product-image').src;
        const quantity = parseInt(document.getElementById('quantity-select').value, 10);

        const product = { id, name, price, image, quantity };
        addToCart(product);

        // Add click feedback animation
        productDetailsAddToCartBtn.classList.add('animate-pulse-once'); // Assuming a CSS animation class
        setTimeout(() => {
            productDetailsAddToCartBtn.classList.remove('animate-pulse-once');
        }, 500); // Remove after animation duration
    });
}

// Handle quantity changes and item removal in cart drawer
cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('quantity-btn')) {
        const id = e.target.dataset.id;
        const action = e.target.dataset.action;
        const itemIndex = cart.findIndex(item => item.id === id);

        if (itemIndex > -1) {
            if (action === 'increase') {
                cart[itemIndex].quantity++;
            } else if (action === 'decrease') {
                cart[itemIndex].quantity--;
                if (cart[itemIndex].quantity <= 0) {
                    cart.splice(itemIndex, 1); // Remove if quantity is 0 or less
                }
            }
            updateCartUI();
        }
    } else if (e.target.closest('.remove-from-cart-btn')) {
        const id = e.target.closest('.remove-from-cart-btn').dataset.id;
        cart = cart.filter(item => item.id !== id);
        updateCartUI();
    }
});

// WhatsApp Checkout Logic
if (whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before proceeding to WhatsApp checkout.');
            return;
        }

        let whatsappMessage = "Hello Black Royalty Stores! I'd like to order the following items:\n\n";
        let total = 0;

        cart.forEach((item, index) => {
            whatsappMessage += `${index + 1}. ${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
            total += item.price * item.quantity;
        });

        whatsappMessage += `\nTotal: ₦${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
        whatsappMessage += "Please confirm my order and provide payment details.";

        // Use number from settings or default
        const phoneNumber = siteSettings.whatsapp_number || "+2347040964171";

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
    });
}


// Product Details Page Image Gallery
const mainProductImage = document.getElementById('main-product-image');
if (mainProductImage) {
    document.querySelectorAll('.thumbnail-image').forEach(thumbnail => {
        thumbnail.addEventListener('click', () => {
            mainProductImage.src = thumbnail.src;
            // Optional: add active state to thumbnail
            document.querySelectorAll('.thumbnail-image').forEach(img => img.classList.remove('border-gold'));
            thumbnail.classList.add('border-gold');
        });
    });
}

// Hero CTA Button Pulse Effect (CSS driven, but JS can add/remove class if needed for dynamic control)
const heroCtaButton = document.getElementById('hero-cta');
if (heroCtaButton) {
    // The pulse effect is already defined in CSS as btn-gold-pulse
    // No additional JS needed unless we want to dynamically control its start/stop
}

// Particles.js for hero section background
// You can customize the particles.js configuration as needed
if (document.getElementById('particles-js')) {
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 80,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#D4AF37" // Gold color for particles
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                },
                "polygon": {
                    "nb_sides": 5
                },
                "image": {
                    "src": "img/github.svg",
                    "width": 100,
                    "height": 100
                }
            },
            "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#6B46C1", // Purple lines
                "opacity": 0.4,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 6,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "repulse"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 400,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });
}


// Load cart and fetch content on page load
window.addEventListener('load', () => {
    loadCart();
    fetchSettings();
    if (document.getElementById('product-grid')) {
        fetchProducts();
    }
    if (window.location.pathname.includes('product-details.html')) {
        fetchProductDetails();
    }
});

async function fetchProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) return;

    try {
        const response = await fetch('content/products.json');
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        const product = data.products.find(p => p.id === productId);

        if (product) {
            renderProductDetails(product);
        } else {
            document.getElementById('product-title').textContent = 'Product Not Found';
        }
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

function renderProductDetails(product) {
    document.getElementById('product-title').textContent = product.name;
    document.getElementById('product-price').textContent = `₦${product.price.toLocaleString()}`;
    document.getElementById('product-description').innerHTML = `<p>${product.description}</p>`;
    document.getElementById('main-product-image').src = product.image;

    // Update thumbnails (using same image for now as we only have one per product in JSON)
    document.querySelectorAll('.thumbnail-image').forEach(img => img.src = product.image);

    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (product.in_stock) {
        addToCartBtn.disabled = false;
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.onclick = () => {
            const quantity = parseInt(document.getElementById('quantity-select').value, 10);
            addToCart({ ...product, quantity });
            addToCartBtn.classList.add('animate-pulse-once');
            setTimeout(() => addToCartBtn.classList.remove('animate-pulse-once'), 500);
        };
    } else {
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Out of Stock';
        addToCartBtn.classList.add('bg-gray-600', 'cursor-not-allowed');
        addToCartBtn.classList.remove('bg-purple-700', 'hover:bg-gold');
    }
}

// Custom animation for add to cart button feedback (if needed)
// Add a class `animate-pulse-once` to the button when clicked
// and remove it after a short delay to trigger the animation once.
// This requires a corresponding CSS animation.
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
    @keyframes pulse-once {
        0% { transform: scale(1); background-color: #6B46C1; }
        50% { transform: scale(1.05); background-color: #D4AF37; color: #000; }
        100% { transform: scale(1); background-color: #6B46C1; }
    }
    .animate-pulse-once {
        animation: pulse-once 0.5s ease-in-out;
    }
`;
document.head.appendChild(styleSheet);
