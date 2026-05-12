/* ================================================
   NAVBAR MOBILE MENU STATE MANAGEMENT
   ================================================ */

const state = {
    menuOpen: false,
    scrollLocked: false
};

const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navbar = document.querySelector('.navbar');
const navItems = document.querySelectorAll('.nav-link');
const body = document.body;

// Enhanced Hamburger Menu Toggle
function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', state.menuOpen);
    navLinks.classList.toggle('active');
    navbar.classList.toggle('menu-open');
    
    if (state.menuOpen) {
        lockScroll();
    } else {
        unlockScroll();
    }
}

// Scroll Lock (prevent body scroll when menu is open)
function lockScroll() {
    state.scrollLocked = true;
    body.style.overflow = 'hidden';
    body.style.paddingRight = '0';
}

function unlockScroll() {
    state.scrollLocked = false;
    body.style.overflow = '';
    body.style.paddingRight = '';
}

// Hamburger Click Handler
hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
});

// Close menu when a navigation link is clicked
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        if (state.menuOpen) {
            toggleMenu();
        }
        
        // Handle smooth scroll
        const href = item.getAttribute('href');
        if (href && href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                setTimeout(() => {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
        }
    });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (state.menuOpen && !e.target.closest('.navbar-container')) {
        toggleMenu();
    }
});

// Close menu on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.menuOpen) {
        toggleMenu();
    }
});

// Close menu on window resize (if viewport becomes large)
window.addEventListener('resize', () => {
    if (window.innerWidth > 767 && state.menuOpen) {
        toggleMenu();
    }
});

// ================================================
// NAVBAR SCROLL EFFECT & STYLING
// ================================================

let lastScrollTop = 0;
let ticking = false;

function updateNavbarOnScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        navbar.style.background = 'rgba(15, 23, 42, 0.9)';
        navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
        navbar.style.backdropFilter = 'blur(12px)';
    } else {
        navbar.style.background = 'rgba(15, 23, 42, 0.7)';
        navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
        navbar.style.backdropFilter = 'blur(10px)';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateNavbarOnScroll);
        ticking = true;
    }
});

// ================================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// ================================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ================================================
// ACTIVE LINK HIGHLIGHT
// ================================================

function updateActiveLink() {
    const scrollPosition = window.scrollY + 150;

    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.startsWith('#')) {
            const section = document.querySelector(href);
            if (section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    navItems.forEach(link => link.classList.remove('active'));
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        }
    });
}

window.addEventListener('scroll', () => {
    updateActiveLink();
});

// ================================================
// CTA BUTTON INTERACTIONS
// ================================================

const ctatButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-login');

ctatButtons.forEach(button => {
    // Prevent double-tap zoom on mobile
    let lastTap = 0;
    
    button.addEventListener('touchend', function(e) {
        const now = Date.now();
        if (now - lastTap <= 300) {
            e.preventDefault();
        }
        lastTap = now;
    }, false);

    // Hover effects
    button.addEventListener('mouseenter', function() {
        if (window.innerWidth > 767) {
            this.style.transform = 'translateY(-3px)';
        }
    });

    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });

    // Click ripple effect
    button.addEventListener('click', function(e) {
        if (window.innerWidth > 767) {
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            ripple.style.pointerEvents = 'none';
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.animation = 'rippleEffect 0.6s ease-out';

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        }
    });
});

// Ripple animation keyframes
if (!document.querySelector('style[data-ripple]')) {
    const style = document.createElement('style');
    style.setAttribute('data-ripple', 'true');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ================================================
// UPLOAD AREA INTERACTION
// ================================================

const uploadArea = document.querySelector('.upload-area');

if (uploadArea) {
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--secondary)';
        uploadArea.style.background = 'rgba(6, 182, 212, 0.1)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border)';
        uploadArea.style.background = 'rgba(15, 23, 42, 0.5)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border)';
        uploadArea.style.background = 'rgba(15, 23, 42, 0.5)';
        
        console.log('Files dropped:', e.dataTransfer.files);
    });
}

// ================================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ================================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = `${entry.target.dataset.animation} 0.8s ease-out forwards`;
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('[data-animation]').forEach(el => {
    observer.observe(el);
});

// ================================================
// PARALLAX EFFECT FOR HERO (Desktop only)
// ================================================

const heroLeft = document.querySelector('.hero-left');
const heroRight = document.querySelector('.hero-right');

if (heroLeft && heroRight && window.innerWidth > 767) {
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;

        heroRight.style.transform = `perspective(1000px) rotateY(${x * 0.5}deg) rotateX(${-y * 0.5}deg)`;
    });

    window.addEventListener('mouseleave', () => {
        heroRight.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
}

// Disable parallax on mobile resize
window.addEventListener('resize', () => {
    if (window.innerWidth <= 767 && heroRight) {
        heroRight.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    }
});

// ================================================
// TOUCH GESTURE SUPPORT
// ================================================

let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, false);

document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    // Swipe right - close menu
    if (diff > swipeThreshold && state.menuOpen && window.innerWidth <= 767) {
        toggleMenu();
    }
}

// ================================================
// RESPONSIVE NAV ITEMS ADJUSTMENT
// ================================================

function handleResponsiveNav() {
    const isMobile = window.innerWidth <= 767;
    
    if (isMobile && state.menuOpen) {
        // Mobile menu is open, items are styled as mobile items
    } else if (!isMobile && state.menuOpen) {
        // Window resized to desktop while menu was open
        toggleMenu();
    }
}

window.addEventListener('resize', () => {
    handleResponsiveNav();
});

// ================================================
// ACCESSIBILITY ENHANCEMENTS
// ================================================

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.menuOpen) {
        toggleMenu();
    }

    // Tab navigation
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-active');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-active');
});

// Focus visible styles
const style = document.createElement('style');
style.textContent = `
    body.keyboard-active *:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);

// ================================================
// PRICING BILLING TOGGLE
// ================================================

const billingToggle = document.getElementById('billing-toggle');

if (billingToggle) {
    billingToggle.addEventListener('change', function() {
        const isYearly = this.checked;
        
        // Update all pricing cards
        const pricingCards = document.querySelectorAll('.pricing-card');
        
        pricingCards.forEach(card => {
            const amountElement = card.querySelector('.amount');
            const periodElement = card.querySelector('.period');
            const yearlyInfo = card.querySelector('.yearly-info');
            
            if (amountElement && amountElement.hasAttribute('data-monthly')) {
                const monthlyPrice = amountElement.getAttribute('data-monthly');
                const yearlyPrice = amountElement.getAttribute('data-yearly');
                
                if (isYearly) {
                    amountElement.textContent = yearlyPrice;
                    periodElement.textContent = '/year';
                    if (yearlyInfo) {
                        yearlyInfo.style.display = 'none';
                    }
                } else {
                    amountElement.textContent = monthlyPrice;
                    periodElement.textContent = '/month';
                    if (yearlyInfo) {
                        yearlyInfo.style.display = 'none';
                    }
                }
                
                // Add smooth animation
                amountElement.style.animation = 'none';
                setTimeout(() => {
                    amountElement.style.animation = 'fadeIn 0.3s ease-out';
                }, 10);
            }
        });
    });
}

// ================================================
// INITIALIZATION
// ================================================

console.log('StudyBoost AI - Enhanced Responsive Navbar initialized');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - All elements ready');
    
    // Set initial navbar state
    updateNavbarOnScroll();
});

// ================================================
// PERFORMANCE OPTIMIZATION
// ================================================

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ================================================
// LOGO KEYBOARD SUPPORT
// ================================================

const logo = document.querySelector('.navbar-logo');
if (logo) {
    logo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ================================================
// SIDEBAR INTERACTIVE ITEMS
// ================================================

document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
        }
    });
});
