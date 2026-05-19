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
let heroImageData = '';
const fileInput = document.getElementById('fileInput');
const fileUploadBtn = document.getElementById('fileUploadBtn');
const heroPreviewImage = document.getElementById('heroPreviewImage');
const heroGenerateNotesBtn = document.getElementById('heroGenerateNotesBtn');
const heroRemoveBtn = document.getElementById('heroRemoveBtn');
const heroPreviewHint = document.getElementById('heroPreviewHint');

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

if (heroRemoveBtn) {
    heroRemoveBtn.addEventListener('click', clearHeroPreview);
}

if (heroGenerateNotesBtn) {
    heroGenerateNotesBtn.addEventListener('click', redirectToGenerateNotes);
}

function handleHeroFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file to preview and generate notes.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        heroImageData = e.target.result;
        updateHeroPreview();
    };
    reader.readAsDataURL(file);
}

function updateHeroPreview() {
    if (!heroPreviewImage || !heroGenerateNotesBtn || !heroPreviewHint || !heroRemoveBtn) return;
    heroPreviewImage.src = heroImageData;
    heroPreviewImage.style.display = 'block';
    heroPreviewHint.style.display = 'none';
    heroGenerateNotesBtn.disabled = false;
    heroRemoveBtn.style.display = 'inline-flex';
}

function clearHeroPreview() {
    heroImageData = '';
    if (fileInput) fileInput.value = '';
    if (heroPreviewImage) heroPreviewImage.style.display = 'none';
    if (heroGenerateNotesBtn) heroGenerateNotesBtn.disabled = true;
    if (heroRemoveBtn) heroRemoveBtn.style.display = 'none';
    if (heroPreviewHint) heroPreviewHint.style.display = 'block';
    showToast('Upload removed.');
}

function redirectToGenerateNotes() {
    if (!heroImageData) {
        showToast('Upload an image before generating notes.');
        return;
    }

    try {
        sessionStorage.setItem('studyboost_image_data', heroImageData);
        sessionStorage.removeItem('studyboost_ocr_text');
        window.location.href = 'generate-notes.html';
    } catch (error) {
        console.error('Redirect error:', error);
        showToast('Unable to preserve uploaded image. Please try again.');
    }
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

/* ================================================
   FOOTER: THEME TOGGLE
   ================================================ */

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Initialize theme from localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    if (theme === 'dark') {
        html.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        html.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = html.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    
    // Keyboard support
    themeToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });
}

// Initialize theme on page load
initializeTheme();

/* ================================================
   FOOTER: LANGUAGE SELECTOR
   ================================================ */

const languageButton = document.getElementById('languageButton');
const languageDropdown = document.getElementById('languageDropdown');
const languageOptions = document.querySelectorAll('.language-option');

// Language data for display
const languages = {
    en: { name: 'English', flag: '🇺🇸' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' },
    de: { name: 'Deutsch', flag: '🇩🇪' },
    zh: { name: '中文', flag: '🇨🇳' },
    ja: { name: '日本語', flag: '🇯🇵' }
};

// Initialize language from localStorage
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
}

function setLanguage(langCode) {
    localStorage.setItem('language', langCode);
    
    // Update button display
    if (languageButton) {
        const langData = languages[langCode] || languages.en;
        const langText = languageButton.querySelector('.language-text');
        if (langText) {
            langText.textContent = langData.name;
        }
    }
    
    // Update active state in dropdown
    languageOptions.forEach(option => {
        const isSelected = option.dataset.lang === langCode;
        option.style.background = isSelected ? 'rgba(124, 58, 237, 0.2)' : 'transparent';
        option.style.color = isSelected ? 'var(--primary)' : 'var(--text-secondary)';
    });
    
    // Trigger language change event
    document.dispatchEvent(new CustomEvent('languageChange', { detail: { language: langCode } }));
}

// Toggle dropdown
if (languageButton) {
    languageButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = languageDropdown.hidden;
        languageDropdown.hidden = !isHidden;
        languageButton.setAttribute('aria-expanded', !isHidden);
    });
    
    // Keyboard support
    languageButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            languageButton.click();
        }
        if (e.key === 'ArrowDown' && !languageDropdown.hidden) {
            e.preventDefault();
            languageOptions[0].focus();
        }
    });
}

// Language option selection
languageOptions.forEach(option => {
    option.addEventListener('click', () => {
        const lang = option.dataset.lang;
        setLanguage(lang);
        languageDropdown.hidden = true;
        languageButton.setAttribute('aria-expanded', 'false');
    });
    
    // Keyboard support for options
    option.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            option.click();
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const index = Array.from(languageOptions).indexOf(option);
            if (index < languageOptions.length - 1) {
                languageOptions[index + 1].focus();
            }
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const index = Array.from(languageOptions).indexOf(option);
            if (index > 0) {
                languageOptions[index - 1].focus();
            } else {
                languageButton.focus();
            }
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            languageDropdown.hidden = true;
            languageButton.setAttribute('aria-expanded', 'false');
            languageButton.focus();
        }
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (languageDropdown && !languageDropdown.hidden && !e.target.closest('.language-selector')) {
        languageDropdown.hidden = true;
        languageButton.setAttribute('aria-expanded', 'false');
    }
});

// Initialize language on page load
initializeLanguage();

/* ================================================
   FOOTER: NEWSLETTER SUBSCRIPTION
   ================================================ */

const newsletterForm = document.querySelector('.newsletter-input-group');
const newsletterInput = document.getElementById('newsletter-email');
const newsletterButton = document.querySelector('.newsletter-button');

if (newsletterButton && newsletterInput) {
    newsletterButton.addEventListener('click', (e) => {
        e.preventDefault();
        const email = newsletterInput.value.trim();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showNewsletterMessage('Please enter your email', 'error');
            return;
        }
        
        if (!emailRegex.test(email)) {
            showNewsletterMessage('Please enter a valid email', 'error');
            return;
        }
        
        // Simulate API call
        newsletterButton.disabled = true;
        newsletterButton.innerHTML = '<span class="button-text">Subscribing...</span>';
        
        setTimeout(() => {
            showNewsletterMessage('Successfully subscribed! Check your email.', 'success');
            newsletterInput.value = '';
            newsletterButton.disabled = false;
            newsletterButton.innerHTML = '<span class="button-text">Subscribe</span><span class="button-arrow" aria-hidden="true">→</span>';
        }, 1500);
    });
    
    // Allow Enter key to submit
    newsletterInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            newsletterButton.click();
        }
    });
}

function showNewsletterMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `newsletter-message ${type}`;
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: absolute;
        bottom: -40px;
        left: 0;
        right: 0;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.8125rem;
        font-weight: 500;
        text-align: center;
        ${type === 'success' ? 'background: rgba(34, 197, 94, 0.2); color: #22c55e; border: 1px solid rgba(34, 197, 94, 0.3);' : 'background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3);'}
        animation: slideUp 0.3s ease-out;
    `;
    
    const container = newsletterForm.parentElement;
    container.style.position = 'relative';
    
    // Remove existing message
    const existingMessage = container.querySelector('.newsletter-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    container.appendChild(messageElement);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        messageElement.style.animation = 'slideDown 0.3s ease-out forwards';
        setTimeout(() => messageElement.remove(), 300);
    }, 4000);
}

/* ================================================
   FOOTER: SOCIAL MEDIA LINKS
   ================================================ */

const socialIcons = document.querySelectorAll('.social-icon');

socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        if (window.innerWidth > 767) {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        }
    });
    
    icon.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    // Keyboard support
    icon.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            icon.click();
        }
    });
});

/* ================================================
   FOOTER: CONTACT BADGE ANIMATION
   ================================================ */

// The pulsing animation is handled by CSS, but we can enhance it with JavaScript if needed

/* ================================================
   FOOTER: SMOOTH INTERACTIONS
   ================================================ */

// Enhance footer links with smooth transitions
const footerLinks = document.querySelectorAll('.footer-link');

footerLinks.forEach(link => {
    link.addEventListener('mouseenter', function() {
        if (window.innerWidth > 767) {
            this.style.transform = 'translateX(4px)';
        }
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateX(0)';
    });
});

/* ================================================
   FOOTER: RESPONSIVE BEHAVIOR
   ================================================ */

// Handle language dropdown position on scroll
window.addEventListener('scroll', () => {
    if (languageDropdown && !languageDropdown.hidden) {
        const rect = languageButton.getBoundingClientRect();
        if (rect.bottom + 250 > window.innerHeight) {
            languageDropdown.style.bottom = 'auto';
            languageDropdown.style.top = '100%';
        }
    }
});

/* ================================================
   HERO SECTION: FILE UPLOAD FUNCTIONALITY
   ================================================ */

const uploadFeedback = document.getElementById('uploadFeedback');
const dashboardUploadArea = document.getElementById('dashboardUploadArea');

// Valid file types and max size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_TYPES = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg', 'image/jpg'];

// Trigger file input when button is clicked
if (fileUploadBtn) {
    fileUploadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (fileInput) fileInput.click();
    });
}

// Trigger file input from dashboard upload area
if (dashboardUploadArea) {
    dashboardUploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        if (fileInput) fileInput.click();
    });
}

// Handle keyboard interaction for file upload button
if (fileUploadBtn) {
    fileUploadBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (fileInput) fileInput.click();
        }
    });
}

// Handle keyboard interaction for dashboard upload area
if (dashboardUploadArea) {
    dashboardUploadArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (fileInput) fileInput.click();
        }
    });
}

// Handle file selection
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.type.startsWith('image/')) {
            handleHeroFileSelect(e);
            showUploadFeedback(`Previewing ${file.name}...`, 'success');
            return;
        }

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            showUploadFeedback(validation.message, 'error');
            if (fileInput) fileInput.value = '';
            return;
        }
        
        // Show loading feedback
        showUploadFeedback(`Processing ${file.name}...`, 'loading');
        
        // Simulate file processing (in real app, you'd upload to server)
        setTimeout(() => {
            showUploadFeedback(`✓ ${file.name} uploaded successfully! Generating summary...`, 'success');
            
            // Reset after 4 seconds
            setTimeout(() => {
                if (uploadFeedback) uploadFeedback.classList.remove('show');
                if (fileInput) fileInput.value = '';
            }, 4000);
        }, 2000);
    });
}

// Handle drag and drop on the button
fileUploadBtn.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileUploadBtn.style.transform = 'scale(1.05)';
    fileUploadBtn.style.opacity = '0.8';
});

fileUploadBtn.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileUploadBtn.style.transform = 'scale(1)';
    fileUploadBtn.style.opacity = '1';
});

fileUploadBtn.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    fileUploadBtn.style.transform = 'scale(1)';
    fileUploadBtn.style.opacity = '1';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
    }
});

// Handle drag and drop on dashboard upload area
if (dashboardUploadArea) {
    dashboardUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dashboardUploadArea.style.transform = 'scale(1.05)';
        dashboardUploadArea.style.opacity = '0.8';
        dashboardUploadArea.style.backgroundColor = 'rgba(124, 58, 237, 0.2)';
        dashboardUploadArea.style.borderColor = 'rgba(124, 58, 237, 0.6)';
    });

    dashboardUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dashboardUploadArea.style.transform = 'scale(1)';
        dashboardUploadArea.style.opacity = '1';
        dashboardUploadArea.style.backgroundColor = '';
        dashboardUploadArea.style.borderColor = '';
    });

    dashboardUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dashboardUploadArea.style.transform = 'scale(1)';
        dashboardUploadArea.style.opacity = '1';
        dashboardUploadArea.style.backgroundColor = '';
        dashboardUploadArea.style.borderColor = '';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    });
}

/* ================================================
   SIDEBAR BUTTONS FUNCTIONALITY
   ================================================ */

// Sidebar button data
const sidebarData = [
    { id: 'sidebarItem1', label: 'Study Materials', icon: '📚' },
    { id: 'sidebarItem2', label: 'Quick Summary', icon: '⚡' },
    { id: 'sidebarItem3', label: 'Analytics', icon: '📊' },
    { id: 'sidebarItem4', label: 'Settings', icon: '⚙️' }
];

// Initialize sidebar buttons
sidebarData.forEach((item, index) => {
    const sidebarItem = document.getElementById(item.id);
    if (sidebarItem) {
        // Click handler
        sidebarItem.addEventListener('click', (e) => {
            e.preventDefault();
            selectSidebarItem(item.id, item.label);
        });
        
        // Keyboard support
        sidebarItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectSidebarItem(item.id, item.label);
            }
        });
    }
});

// Handle sidebar item selection
function selectSidebarItem(itemId, label) {
    // Remove active class from all items
    sidebarData.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.classList.remove('active');
        }
    });
    
    // Add active class to clicked item
    const selectedItem = document.getElementById(itemId);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Show feedback
    console.log(`${label} section selected`);
    
    // Optional: Update dashboard content based on selection
    updateDashboardContent(label);
}

// Update dashboard content based on selected section
function updateDashboardContent(section) {
    switch(section) {
        case 'Study Materials':
            // Update content for study materials
            break;
        case 'Quick Summary':
            // Update content for summary
            break;
        case 'Analytics':
            // Update content for analytics
            break;
        case 'Settings':
            // Update content for settings
            break;
    }
}

// Validate file
function validateFile(file) {
    if (!VALID_TYPES.includes(file.type)) {
        return {
            valid: false,
            message: '⚠️ Invalid file type. Please upload PDF, TXT, or image files only.'
        };
    }
    
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            message: '⚠️ File is too large. Maximum size is 5MB.'
        };
    }
    
    return { valid: true };
}

// Show upload feedback message
function showUploadFeedback(message, type) {
    uploadFeedback.textContent = message;
    uploadFeedback.className = `upload-feedback ${type} show`;
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            uploadFeedback.classList.remove('show');
        }, 5000);
    }
}

/* ================================================
   FEATURE CARD BUTTON HANDLERS
   ================================================ */

// Handle Image to Notes featured card button click
const featuredCard = document.querySelector('.featured-card');
if (featuredCard) {
    const startConvertingBtn = featuredCard.querySelector('.btn-card');
    if (startConvertingBtn) {
        startConvertingBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'ocr-tool.html';
        });
    }
}
