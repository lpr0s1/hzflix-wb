class InteractionManager {
    constructor() {
        this.isInitialized = false;
        this.rippleElements = [];
        this.particleSystems = [];
        this.modalInstance = null;
        this.headerScrolled = false;
        
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initHeaderInteractions();
        this.initButtonInteractions();
        this.initModalSystem();
        this.initMobileMenu();
        this.initScrollEffects();
        this.initRippleEffects();
        this.initParticleEffects();
        this.initFormEnhancements();
        this.initAccessibilityFeatures();
        this.initPerformanceOptimizations();
        
        this.isInitialized = true;
        console.log('ðŸš€ InteractionManager initialized successfully');
    }

    /* =========================================================================
       Header Interactions & Scroll Effects
    ========================================================================= */
    initHeaderInteractions() {
        const header = document.getElementById('mainHeader');
        if (!header) return;

        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            const scrollDelta = currentScrollY - lastScrollY;
            
            // Add scrolled class for styling
            if (currentScrollY > 100 && !this.headerScrolled) {
                header.classList.add('scrolled');
                this.headerScrolled = true;
                
                // Animate header transformation
                gsap.to(header, {
                    backdropFilter: 'blur(20px) saturate(180%)',
                    background: 'rgba(248, 250, 252, 0.95)',
                    duration: 0.01,
                    ease: 'power2.out'
                });
            } else if (currentScrollY <= 100 && this.headerScrolled) {
                header.classList.remove('scrolled');
                this.headerScrolled = false;
                
                gsap.to(header, {
                    backdropFilter: 'blur(20px) saturate(180%)',
                    background: 'rgba(248, 250, 252, 0.8)',
                    duration: 0.01,
                    ease: 'power2.out'
                });
            }

            // Hide/show header based on scroll direction
            if (Math.abs(scrollDelta) > 5) {
                if (scrollDelta > 0 && currentScrollY > 500) {
                    // Scrolling down - hide header
                    gsap.to(header, {
                        y: -100,
                        duration: 0.01,
                        ease: 'power2.out'
                    });
                } else if (scrollDelta < 0) {
                    // Scrolling up - show header
                    gsap.to(header, {
                        y: 0,
                        duration: 0.01,
                        ease: 'power2.out'
                    });
                }
            }

            lastScrollY = currentScrollY;
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                requestAnimationFrame(updateHeader);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* =========================================================================
       Advanced Button Interactions
    ========================================================================= */
    initButtonInteractions() {
        // Primary CTA buttons
        this.enhanceButton('.primary-cta, .final-cta-button, .cta-button', {
            hoverScale: 1.05,
            clickScale: 0.95,
            magnetism: true,
            ripple: true,
            glow: true
        });

        // Secondary buttons
        this.enhanceButton('.secondary-cta, .contact-cta', {
            hoverScale: 1.02,
            clickScale: 0.98,
            magnetism: false,
            ripple: true,
            glow: false
        });

        // Mobile menu button
        this.enhanceMobileMenuButton();
    }

    enhanceButton(selector, options = {}) {
        const buttons = document.querySelectorAll(selector);
        
        buttons.forEach(button => {
            // Add ripple container if needed
            if (options.ripple && !button.querySelector('.ripple-container')) {
                const rippleContainer = document.createElement('div');
                rippleContainer.className = 'ripple-container';
                rippleContainer.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    border-radius: inherit;
                    pointer-events: none;
                `;
                button.style.position = 'relative';
                button.appendChild(rippleContainer);
            }

            // Magnetism effect
            if (options.magnetism) {
                button.addEventListener('mousemove', (e) => {
                    const rect = button.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    
                    const deltaX = (e.clientX - centerX) * 0.15;
                    const deltaY = (e.clientY - centerY) * 0.15;
                    
                    gsap.to(button, {
                        x: deltaX,
                        y: deltaY,
                        duration: 0.3,
                        ease: 'power2.out'
                    });
                });

                button.addEventListener('mouseleave', () => {
                    gsap.to(button, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: 'elastic.out(1, 0.3)'
                    });
                });
            }

            // Hover effects
            button.addEventListener('mouseenter', () => {
                if (options.hoverScale) {
                    gsap.to(button, {
                        scale: options.hoverScale,
                        duration: 0.03,
                        ease: 'power2.out'
                    });
                }

                if (options.glow) {
                    gsap.to(button, {
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3)',
                        duration: 0.03,
                        ease: 'power2.out'
                    });
                }
            });

            button.addEventListener('mouseleave', () => {
                gsap.to(button, {
                    scale: 1,
                    boxShadow: options.glow ? 
                        '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' :
                        button.style.boxShadow,
                    duration: 0.03,
                    ease: 'power2.out'
                });
            });

            // Click effects
            button.addEventListener('mousedown', () => {
                if (options.clickScale) {
                    gsap.to(button, {
                        scale: options.clickScale,
                        duration: 0.01,
                        ease: 'power2.out'
                    });
                }
            });

            button.addEventListener('mouseup', () => {
                if (options.clickScale) {
                    gsap.to(button, {
                        scale: options.hoverScale || 1,
                        duration: 0.02,
                        ease: 'power2.out'
                    });
                }
            });

            // Ripple effect on click
            if (options.ripple) {
                button.addEventListener('click', (e) => {
                    this.createRipple(e, button);
                });
            }
        });
    }

    enhanceMobileMenuButton() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        if (!menuBtn) return;

        menuBtn.addEventListener('mouseenter', () => {
            gsap.to(menuBtn, {
                scale: 1.1,
                rotation: 180,
                duration: 0.03,
                ease: 'power2.out'
            });
        });

        menuBtn.addEventListener('mouseleave', () => {
            gsap.to(menuBtn, {
                scale: 1,
                rotation: 0,
                duration: 0.03,
                ease: 'power2.out'
            });
        });
    }

    /* =========================================================================
       Ripple Effects
    ========================================================================= */
    createRipple(event, element) {
        const rippleContainer = element.querySelector('.ripple-container');
        if (!rippleContainer) return;

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.06s linear;
            pointer-events: none;
        `;

        rippleContainer.appendChild(ripple);

        // Animate ripple
        gsap.to(ripple, {
            scale: 2,
            opacity: 0,
            duration: 0.06,
            ease: 'power2.out',
            onComplete: () => {
                ripple.remove();
            }
        });
    }

    initRippleEffects() {
        // Add CSS for ripple animation
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /* =========================================================================
       Modal System
    ========================================================================= */
    initModalSystem() {
        const modal = document.getElementById('modal');
        const openButtons = document.querySelectorAll('#headerCta, #primaryCta, #finalCta, #buyNow, #buyNow2, #openModal, #openModalMobile, #mobileCta');
        const closeButton = document.getElementById('closeModal');
        const modalBackdrop = modal?.querySelector('.modal-backdrop');
        const orderButton = document.getElementById('modalOrderBtn');

        if (!modal) return;

        // Open modal
        openButtons.forEach(button => {
            button?.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(modal);
            });
        });

        // Close modal
        closeButton?.addEventListener('click', () => {
            this.closeModal(modal);
        });

        // Close on backdrop click
        modalBackdrop?.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                this.closeModal(modal);
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal(modal);
            }
        });

        // Order button action
        orderButton?.addEventListener('click', () => {
            // Add success animation before redirect
            this.showSuccessAnimation(orderButton);
            setTimeout(() => {
                window.location.href = 'https://buy.stripe.com/eVq7sLe1rf1r4bF67H6wE0c';
            }, 1000);
        });
    }

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Animate modal entrance
        gsap.fromTo(modal, 
            { opacity: 0 },
            { 
                opacity: 1, 
                duration: 0.03,
                ease: 'power2.out'
            }
        );

        gsap.fromTo(modal.querySelector('.modal-container'),
            { 
                y: 50,
                scale: 0.9,
                opacity: 0
            },
            { 
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.04,
                ease: 'back.out(1.7)',
                delay: 0.01
            }
        );

        // Animate modal content
        const modalContent = modal.querySelectorAll('.modal-section, .modal-actions');
        gsap.fromTo(modalContent,
            { 
                y: 20,
                opacity: 0
            },
            { 
                y: 0,
                opacity: 1,
                duration: 0.03,
                stagger: 0.1,
                delay: 0.03,
                ease: 'power2.out'
            }
        );
    }

    closeModal(modal) {
        gsap.to(modal.querySelector('.modal-container'), {
            y: -30,
            scale: 0.95,
            opacity: 0,
            duration: 0.03,
            ease: 'power2.inOut'
        });

        gsap.to(modal, {
            opacity: 0,
            duration: 0.03,
            ease: 'power2.inOut',
            delay: 0.01,
            onComplete: () => {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }

    showSuccessAnimation(button) {
        const originalText = button.textContent;
        
        // Change button text and style
        button.textContent = 'Redirection...';
        button.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        // Add checkmark animation
        gsap.to(button, {
            scale: 1.1,
            duration: 0.02,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1
        });

        // Confetti effect
        this.createConfetti(button);
    }

    /* =========================================================================
       Mobile Menu
    ========================================================================= */
    initMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (!menuBtn || !mobileMenu) return;

        let isMenuOpen = false;

        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                this.openMobileMenu(menuBtn, mobileMenu);
            } else {
                this.closeMobileMenu(menuBtn, mobileMenu);
            }
        });

        // Close menu on outside click
        document.addEventListener('click', (e) => {
            if (isMenuOpen && !mobileMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                this.closeMobileMenu(menuBtn, mobileMenu);
                isMenuOpen = false;
            }
        });
    }

    openMobileMenu(menuBtn, mobileMenu) {
        menuBtn.classList.add('active');
        mobileMenu.classList.add('active');

        // Animate menu items
        const menuItems = mobileMenu.querySelectorAll('.mobile-nav-item, .mobile-cta-button');
        gsap.fromTo(menuItems,
            { 
                x: -50,
                opacity: 0
            },
            { 
                x: 0,
                opacity: 1,
                duration: 0.03,
                stagger: 0.01,
                ease: 'power2.out'
            }
        );
    }

    closeMobileMenu(menuBtn, mobileMenu) {
        menuBtn.classList.remove('active');
        
        gsap.to(mobileMenu.querySelectorAll('.mobile-nav-item, .mobile-cta-button'), {
            x: -30,
            opacity: 0,
            duration: 0.02,
            stagger: 0.05,
            ease: 'power2.in',
            onComplete: () => {
                mobileMenu.classList.remove('active');
            }
        });
    }

    /* =========================================================================
       Scroll Effects
    ========================================================================= */
    initScrollEffects() {
        // Parallax effect for background elements
        const parallaxElements = document.querySelectorAll('.gradient-orb, .floating-element');
        
        parallaxElements.forEach((element, index) => {
            gsap.to(element, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Progress indicator
        this.createScrollProgress();
        
        // Smooth scroll to sections
        this.initSmoothScrollLinks();
    }

    createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #3b82f6, #10b981);
            z-index: 9999;
            transition: width 0.01s ease;
        `;
        document.body.appendChild(progressBar);

        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    initSmoothScrollLinks() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    gsap.to(window, {
                        duration: 0.1,
                        scrollTo: {
                            y: targetElement,
                            offsetY: 100
                        },
                        ease: "power2.inOut"
                    });
                }
            });
        });
    }

    /* =========================================================================
       Particle Effects
    ========================================================================= */
    initParticleEffects() {
        this.createFloatingParticles();
        this.initHoverParticles();
    }

    createFloatingParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(particleContainer);

        // Create floating particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            
            particleContainer.appendChild(particle);
            
            // Animate particle
            gsap.to(particle, {
                y: -100,
                x: Math.random() * 100 - 50,
                rotation: 360,
                duration: Math.random() * 1 + 1,
                repeat: -1,
                ease: "none"
            });
        }
    }

    initHoverParticles() {
        const ctaButtons = document.querySelectorAll('.primary-cta, .final-cta-button');
        
        ctaButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.createHoverParticles(button);
            });
        });
    }

    createHoverParticles(element) {
        const rect = element.getBoundingClientRect();
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
                border-radius: 50%;
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(particle);
            
            // Animate particle burst
            gsap.to(particle, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                scale: 0,
                opacity: 0,
                duration: 0.08,
                ease: "power2.out",
                onComplete: () => {
                    particle.remove();
                }
            });
        }
    }

    createConfetti(element) {
        const rect = element.getBoundingClientRect();
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${rect.left + rect.width / 2}px;
                top: ${rect.top + rect.height / 2}px;
                pointer-events: none;
                z-index: 9999;
                border-radius: 2px;
            `;
            document.body.appendChild(confetti);
            
            gsap.to(confetti, {
                x: (Math.random() - 0.5) * 300,
                y: Math.random() * -200 - 100,
                rotation: Math.random() * 720,
                scale: 0,
                duration: 0.5,
                ease: "power2.out",
                onComplete: () => {
                    confetti.remove();
                }
            });
        }
    }

    /* =========================================================================
       Form Enhancements
    ========================================================================= */
    initFormEnhancements() {
        const inputs = document.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Focus/blur animations
            input.addEventListener('focus', () => {
                gsap.to(input, {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });
            
            input.addEventListener('blur', () => {
                gsap.to(input, {
                    borderColor: '#e2e8f0',
                    boxShadow: 'none',
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });
        });
    }

    /* =========================================================================
       Accessibility Features
    ========================================================================= */
    initAccessibilityFeatures() {
        // Keyboard navigation for interactive elements
        this.enhanceKeyboardNavigation();
        
        // Focus indicators
        this.improveFocusIndicators();
        
        // Reduced motion support
        this.handleReducedMotion();
    }

    enhanceKeyboardNavigation() {
        const interactiveElements = document.querySelectorAll('button, a, [tabindex]');
        
        interactiveElements.forEach(element => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    }

    improveFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            *:focus-visible {
                outline: 2px solid #3b82f6 !important;
                outline-offset: 2px !important;
                border-radius: 4px !important;
            }
        `;
        document.head.appendChild(style);
    }

    handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable complex animations
            gsap.globalTimeline.timeScale(0.1);
            
            // Remove particle effects
            const particleContainer = document.querySelector('.particle-container');
            if (particleContainer) {
                particleContainer.remove();
            }
        }
    }

    /* =========================================================================
       Performance Optimizations
    ========================================================================= */
    initPerformanceOptimizations() {
        // Debounce resize events
        this.debounceResize();
        
        // Lazy load non-critical animations
        this.lazyLoadAnimations();
        
        // Optimize scroll performance
        this.optimizeScrollPerformance();
    }

    debounceResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Refresh ScrollTrigger on resize
                ScrollTrigger.refresh();
            }, 200);
        });
    }

    lazyLoadAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('[data-lazy-animate]').forEach(el => {
            observer.observe(el);
        });
    }

    optimizeScrollPerformance() {
        let scrollTicking = false;
        
        const optimizedScrollHandler = () => {
            if (!scrollTicking) {
                requestAnimationFrame(() => {
                    // Batch DOM reads and writes
                    scrollTicking = false;
                });
                scrollTicking = true;
            }
        };
        
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    /* =========================================================================
       Cleanup & Utility Methods
    ========================================================================= */
    destroy() {
        // Remove event listeners
        window.removeEventListener('scroll', this.scrollHandler);
        window.removeEventListener('resize', this.resizeHandler);
        
        // Clear particle systems
        this.particleSystems.forEach(system => system.destroy());
        
        // Remove added DOM elements
        const addedElements = document.querySelectorAll('.ripple-container, .particle-container, .scroll-progress');
        addedElements.forEach(el => el.remove());
        
        this.isInitialized = false;
    }

    refresh() {
        if (this.isInitialized) {
            ScrollTrigger.refresh();
        }
    }
}

// Initialize Interaction Manager
const interactionManager = new InteractionManager();

// Export for external use
window.InteractionManager = InteractionManager;
window.interactionManager = interactionManager;

/* =============================================================================
   Additional Utility Functions
============================================================================= */

// Smooth scroll utility
function smoothScrollTo(target, duration = 1000) {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    if (!targetElement) return;

    gsap.to(window, {
        duration: duration / 1000,
        scrollTo: {
            y: targetElement,
            offsetY: 100
        },
        ease: "power2.inOut"
    });
}

// Viewport visibility detection
function isInViewport(element, threshold = 0.1) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    
    return (
        rect.top <= windowHeight * (1 - threshold) &&
        rect.bottom >= windowHeight * threshold
    );
}

// Device detection
const device = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /iPad|Android|Silk|Kindle|PlayBook/i.test(navigator.userAgent) && window.innerWidth >= 768,
    isDesktop: window.innerWidth >= 1024,
    supportsTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
};

// Performance monitoring
const performance = {
    fps: 0,
    lastTime: 0,
    frameCount: 0,
    
    monitor() {
        const now = Date.now();
        this.frameCount++;
        
        if (now >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            // Adjust quality based on FPS
            if (this.fps < 30) {
                this.reducedQuality();
            }
        }
        
        requestAnimationFrame(() => this.monitor());
    },
    
    reducedQuality() {
        // Reduce animation quality for better performance
        gsap.globalTimeline.timeScale(0.5);
    }
};

// Start performance monitoring
performance.monitor();

// Export utilities
window.smoothScrollTo = smoothScrollTo;
window.isInViewport = isInViewport;
window.device = device;

/* =============================================================================
   Export for Module Usage
============================================================================= */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractionManager;
}
