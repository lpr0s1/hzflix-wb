class AnimationController {
    constructor() {
        this.isInitialized = false;
        this.lenis = null;
        this.scrollTriggers = [];
        this.typewriterInstances = [];
        this.loadingComplete = false;
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.initGSAP();
        this.initSmoothScroll();
        this.initLoadingSequence();
        this.initTextAnimations();
        this.initScrollAnimations();
        this.initParallaxEffects();
        this.isInitialized = true;
    }

    /* =========================================================================
       GSAP Initialization & Configuration
    ========================================================================= */
    initGSAP() {
        // Register GSAP plugins
        gsap.registerPlugin(ScrollTrigger);
        
        // Set global GSAP defaults
        gsap.defaults({
            duration: 0.4,
            ease: "power2.out"
        });

        // Configure ScrollTrigger
        ScrollTrigger.config({
            autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
            ignoreMobileResize: true
        });
    }

    /* =========================================================================
       Smooth Scrolling with Lenis
    ========================================================================= */
    initSmoothScroll() {
        if (typeof Lenis !== 'undefined') {
            this.lenis = new Lenis({
                duration: 0.5,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2,
                infinite: false,
            });

            // Animation frame loop
            const raf = (time) => {
                this.lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);

            // Update ScrollTrigger on scroll
            this.lenis.on('scroll', ScrollTrigger.update);
        }
    }

    /* =========================================================================
       Loading Sequence
    ========================================================================= */
    initLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const loadingProgress = document.querySelector('.loading-progress');
        const app = document.getElementById('app');
        
        if (!loadingScreen) return;

        // Simulate loading progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress > 100) progress = 100;
            
            if (loadingProgress) {
                loadingProgress.style.width = progress + '%';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                this.completeLoading(loadingScreen, app);
            }
        }, 100);
    }

    completeLoading(loadingScreen, app) {
        setTimeout(() => {
            // Hide loading screen
            gsap.to(loadingScreen, {
                opacity: 0,
                duration: 0.6,
                ease: "power2.inOut",
                onComplete: () => {
                    loadingScreen.classList.add('hidden');
                    loadingScreen.style.display = 'none';
                }
            });

            // Reveal app with initial animations
            gsap.fromTo(app, 
                { opacity: 0 },
                { 
                    opacity: 1, 
                    duration: 0.5,
                    ease: "power2.out",
                    onComplete: () => {
                        this.loadingComplete = true;
                        this.startInitialAnimations();
                    }
                }
            );
        }, 500);
    }

    /* =========================================================================
       Text Animations - Letter by Letter Effect
    ========================================================================= */
    initTextAnimations() {
        // Initialize Splitting.js for character animation
        if (typeof Splitting !== 'undefined') {
            Splitting({
                target: '#heroTitle, #featuresTitle, #whyTitle, #ctaTitle',
                by: 'chars'
            });
        }
    }

    startInitialAnimations() {
        // Header entrance
        this.animateHeader();
        
        // Hero badge animation
        this.animateHeroBadge();
        
        // Hero title - letter by letter
        this.animateHeroTitle();
        
        // Hero description
        this.animateHeroDescription();
        
        // Pricing card entrance
        this.animatePricingCard();
        
        // Showcase cards staggered entrance
        this.animateShowcaseCards();
    }

    animateHeader() {
        const header = document.getElementById('mainHeader');
        if (!header) return;

        gsap.fromTo(header,
            { 
                y: -100,
                opacity: 0
            },
            { 
                y: 0,
                opacity: 1,
                duration: 0.6,
                ease: "power3.out",
                delay: 0.2
            }
        );
    }

    animateHeroBadge() {
        const badge = document.getElementById('heroBadge');
        if (!badge) return;

        gsap.fromTo(badge,
            {
                scale: 0.8,
                opacity: 0,
                y: 20
            },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "back.out(1.7)",
                delay: 0.4
            }
        );
    }

    animateHeroTitle() {
        const chars = document.querySelectorAll('#heroTitle .char');
        if (chars.length === 0) return;

        // Reset chars
        gsap.set(chars, {
            opacity: 0,
            y: 50,
            rotationX: -90
        });

        // Animate each character with stagger
        gsap.to(chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.4,
            ease: "back.out(1.7)",
            stagger: {
                amount: 1.2,
                from: "start"
            },
            delay: 0.8
        });
    }

    animateHeroDescription() {
        const description = document.getElementById('heroDescription');
        if (!description) return;

        gsap.fromTo(description,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "power2.out",
                delay: 2.2
            }
        );
    }

    animatePricingCard() {
        const pricingCard = document.getElementById('pricingCard');
        if (!pricingCard) return;

        gsap.fromTo(pricingCard,
            {
                opacity: 0,
                y: 40,
                scale: 0.95
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 1,
                ease: "power2.out",
                delay: 2.6
            }
        );
    }

    animateShowcaseCards() {
        const cards = document.querySelectorAll('.showcase-card');
        if (cards.length === 0) return;

        gsap.fromTo(cards,
            {
                opacity: 0,
                x: 60,
                rotationY: -15
            },
            {
                opacity: 1,
                x: 0,
                rotationY: 0,
                duration: 0.4,
                ease: "power2.out",
                stagger: 0.2,
                delay: 3
            }
        );
    }

    /* =========================================================================
       Scroll-Triggered Animations
    ========================================================================= */
    initScrollAnimations() {
        // Section titles with letter animation
        this.animateSectionTitles();
        
        // Feature cards
        this.animateFeatureCards();
        
        // Why cards
        this.animateWhyCards();
        
        // CTA section
        this.animateCTASection();
        
        // Scroll reveal elements
        this.initScrollReveal();
    }

    animateSectionTitles() {
        const titles = ['#featuresTitle', '#whyTitle', '#ctaTitle'];
        
        titles.forEach((selector, index) => {
            const chars = document.querySelectorAll(`${selector} .char`);
            if (chars.length === 0) return;

            ScrollTrigger.create({
                trigger: selector,
                start: "top 80%",
                onEnter: () => {
                    gsap.fromTo(chars,
                        {
                            opacity: 0,
                            y: 30,
                            rotationX: -45
                        },
                        {
                            opacity: 1,
                            y: 0,
                            rotationX: 0,
                            duration: 0.6,
                            ease: "power2.out",
                            stagger: 0.03
                        }
                    );
                },
                once: true
            });
        });
    }

    animateFeatureCards() {
        const cards = document.querySelectorAll('.feature-card');
        
        cards.forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top 85%",
                onEnter: () => {
                    gsap.fromTo(card,
                        {
                            opacity: 0,
                            y: 60,
                            rotationX: 15,
                            scale: 0.9
                        },
                        {
                            opacity: 1,
                            y: 0,
                            rotationX: 0,
                            scale: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            delay: index * 0.2
                        }
                    );
                },
                once: true
            });
        });
    }

    animateWhyCards() {
        const cards = document.querySelectorAll('.why-card');
        
        cards.forEach((card, index) => {
            ScrollTrigger.create({
                trigger: card,
                start: "top 85%",
                onEnter: () => {
                    const number = card.querySelector('.why-number');
                    const content = card.querySelector('.why-content');
                    
                    // Animate card container
                    gsap.fromTo(card,
                        {
                            opacity: 0,
                            y: 50,
                            scale: 0.95
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            duration: 0.4,
                            ease: "power2.out",
                            delay: index * 0.15
                        }
                    );
                    
                    // Animate number with bounce
                    if (number) {
                        gsap.fromTo(number,
                            {
                                scale: 0,
                                rotation: -45
                            },
                            {
                                scale: 1,
                                rotation: 0,
                                duration: 0.5,
                                ease: "elastic.out(1, 0.5)",
                                delay: index * 0.15 + 0.3
                            }
                        );
                    }
                    
                    // Animate content
                    if (content) {
                        gsap.fromTo(content,
                            {
                                opacity: 0,
                                x: 20
                            },
                            {
                                opacity: 1,
                                x: 0,
                                duration: 0.8,
                                ease: "power2.out",
                                delay: index * 0.15 + 0.5
                            }
                        );
                    }
                },
                once: true
            });
        });
    }

    animateCTASection() {
        const ctaContainer = document.querySelector('.cta-container');
        if (!ctaContainer) return;

        ScrollTrigger.create({
            trigger: ctaContainer,
            start: "top 85%",
            onEnter: () => {
                // Container entrance
                gsap.fromTo(ctaContainer,
                    {
                        opacity: 0,
                        scale: 0.9,
                        y: 60
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out"
                    }
                );
                
                // CTA buttons with delay
                const actions = document.querySelector('.cta-actions');
                if (actions) {
                    gsap.fromTo(actions,
                        {
                            opacity: 0,
                            y: 30
                        },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.8,
                            ease: "power2.out",
                            delay: 0.6
                        }
                    );
                }
            },
            once: true
        });
    }

    initScrollReveal() {
        const elements = document.querySelectorAll('[data-scroll-reveal]');
        
        elements.forEach((element, index) => {
            ScrollTrigger.create({
                trigger: element,
                start: "top 90%",
                onEnter: () => {
                    element.classList.add('revealed');
                },
                once: true
            });
        });
    }

    /* =========================================================================
       Parallax Effects
    ========================================================================= */
    initParallaxEffects() {
        // Gradient orbs parallax
        const orbs = document.querySelectorAll('.gradient-orb');
        
        orbs.forEach((orb, index) => {
            gsap.to(orb, {
                y: -100,
                rotation: 360,
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });

        // Floating elements
        const floatingElements = document.querySelectorAll('.floating-element');
        
        floatingElements.forEach((element, index) => {
            gsap.to(element, {
                y: -50,
                rotation: 180,
                scrollTrigger: {
                    trigger: element,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: 1
                }
            });
        });
    }

    /* =========================================================================
       Typewriter Effect
    ========================================================================= */
    createTypewriterEffect(element, text, speed = 50, delay = 0) {
        if (!element) return;

        const typewriter = {
            element: element,
            text: text,
            currentIndex: 0,
            isRunning: false
        };

        const typeNextChar = () => {
            if (typewriter.currentIndex < typewriter.text.length) {
                element.textContent += typewriter.text[typewriter.currentIndex];
                typewriter.currentIndex++;
                setTimeout(typeNextChar, speed);
            } else {
                typewriter.isRunning = false;
            }
        };

        setTimeout(() => {
            element.textContent = '';
            typewriter.isRunning = true;
            typeNextChar();
        }, delay);

        this.typewriterInstances.push(typewriter);
        return typewriter;
    }

    /* =========================================================================
       Magnetic Effect for Interactive Elements
    ========================================================================= */
    initMagneticEffects() {
        const magneticElements = document.querySelectorAll('.cta-button, .primary-cta, .final-cta-button');
        
        magneticElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(element, {
                    x: x * 0.15,
                    y: y * 0.15,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            element.addEventListener('mouseleave', () => {
                gsap.to(element, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    /* =========================================================================
       Cursor Trail Effect
    ========================================================================= */
    initCursorTrail() {
        if (window.innerWidth < 768) return; // Skip on mobile
        
        const trail = [];
        const trailLength = 8;
        
        // Create trail elements
        for (let i = 0; i < trailLength; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                position: fixed;
                width: ${8 - i}px;
                height: ${8 - i}px;
                background: radial-gradient(circle, rgba(59, 130, 246, ${0.8 - i * 0.1}) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transform: translate(-50%, -50%);
                transition: opacity 0.3s ease;
            `;
            document.body.appendChild(dot);
            trail.push(dot);
        }
        
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        const animateTrail = () => {
            let currentX = mouseX;
            let currentY = mouseY;
            
            trail.forEach((dot, index) => {
                const nextDot = trail[index + 1] || { style: { left: mouseX + 'px', top: mouseY + 'px' } };
                
                currentX += (parseFloat(nextDot.style.left) - currentX) * 0.3;
                currentY += (parseFloat(nextDot.style.top) - currentY) * 0.3;
                
                dot.style.left = currentX + 'px';
                dot.style.top = currentY + 'px';
            });
            
            requestAnimationFrame(animateTrail);
        };
        
        animateTrail();
    }

    /* =========================================================================
       Performance Monitoring
    ========================================================================= */
    monitorPerformance() {
        // FPS monitoring
        let lastTime = performance.now();
        let frameCount = 0;
        let fps = 0;
        
        const measureFPS = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime >= lastTime + 1000) {
                fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
                
                // Adjust animation quality based on FPS
                if (fps < 30) {
                    this.reduceAnimationQuality();
                } else if (fps > 50) {
                    this.increaseAnimationQuality();
                }
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        measureFPS();
    }

    reduceAnimationQuality() {
        // Reduce animation complexity for better performance
        ScrollTrigger.batch("[data-scroll-reveal]", {
            onEnter: (elements) => {
                gsap.set(elements, { opacity: 1, y: 0 });
            }
        });
    }

    increaseAnimationQuality() {
        // Enable full animation quality
        this.initMagneticEffects();
        this.initCursorTrail();
    }

    /* =========================================================================
       Cleanup & Utility Methods
    ========================================================================= */
    destroy() {
        // Clean up ScrollTriggers
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        
        // Stop typewriter effects
        this.typewriterInstances.forEach(typewriter => {
            typewriter.isRunning = false;
        });
        
        // Destroy Lenis
        if (this.lenis) {
            this.lenis.destroy();
        }
        
        // Reset GSAP
        gsap.globalTimeline.clear();
        
        this.isInitialized = false;
    }

    refresh() {
        if (this.isInitialized) {
            ScrollTrigger.refresh();
        }
    }
}

// Initialize Animation Controller
const animationController = new AnimationController();

// Export for external use
window.AnimationController = AnimationController;
window.animationController = animationController;

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        gsap.globalTimeline.pause();
    } else {
        // Resume animations when page becomes visible
        gsap.globalTimeline.resume();
        animationController.refresh();
    }
});

// Handle resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        animationController.refresh();
    }, 250);
});

/* =============================================================================
   Export for Module Usage
============================================================================= */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationController;
}
